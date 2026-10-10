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



/* ================================================================================================
   THE SCREENS.

   One function each, returning markup. None of them touches the tab bar, hides another screen, or
   has an opinion about the sheet — that is the shell's job, and keeping it that way is why adding
   the eighth screen will be as easy as the second.

   Everything pressable carries `data-do`, so markup can be thrown away and redrawn without
   anything needing to be rewired.
================================================================================================ */

/* ---------- YOU --------------------------------------------------------------------------------
   Everything about the person using the app, and nothing about the app. Signed out it is one
   button; signed in it is who you are, what you have, and the ways out.
--------------------------------------------------------------------------------------------- */
/* One card ends where the next begins — the one place they are unambiguously separated, and the
   reason these screens are written as one template and split rather than assembled from a list:
   the template is how they read. */
const split_ = html => String(html).split(/(?=<div class="card|<h2)/).map(x => x.trim()).filter(Boolean);

/** Every card on the You screen, in order. */
function meBlocks() {
  if (!USER) return split_(signInCard_());
  return meRest_();
}

/* ---------- SIGNING IN AND OUT BELONGS AT THE TOP OF THE FEED ---------------------------------------
   IT WAS AT THE FAR END OF `You`. Signing in is the thing somebody does BEFORE anything else works,
   and signing out is the thing they look for when handing the phone to somebody else — and both sat
   on the last column, past the account, past the claims, past everything.

   POSTS IS THE SCREEN NOBODY ARRIVES AT WITH AN ERRAND, which is exactly where a state you might
   need to change belongs. Above the ＋, because whether you are signed in decides whether the ＋ does
   anything at all.

   ONE FUNCTION, DRAWN IN TWO PLACES. `You` still shows it — that is where somebody who has gone
   looking will look — and Posts shows it first. Same markup either way, so the two cannot drift. */
function signInCard_() {
  return `<div class="card">
        <h3>Sign in</h3>
        <p class="sub">You need an account to book, to keep a checklist, or to spend credits.</p>
        ${/* ---------- NAME, USERNAME OR E-MAIL, AND THE LABEL HAS TO SAY SO -----------------------
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
             THE PLACEHOLDER IS ONE OF EACH, SHORT, because the label above already says "email or
             handle" and the sentence it used to be was cut off at `— or you` on a 320 phone. */''}
        ${handleChips_()}
        <label class="field"><span>email or handle</span>
          <input id="in-name" type="text" inputmode="email" autocomplete="username" autocapitalize="off"
                 spellcheck="false" placeholder="ada@x.com or ada_kind7"></label>
        ${/* ---------- THE PIN, ON A SHARED iPAD ---------------------------------------------------------
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
             built here: the keypad is keypad.js's, and is being rebuilt. */''}
        <label class="field"><span>PIN</span>
          <input id="in-pin" ${pinDotsOk_() ? 'type="text" class="pin-dots"' : 'type="password"'}
                 inputmode="numeric" pattern="[0-9]*" maxlength="8" enterkeyhint="go"
                 autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                 data-1p-ignore data-lpignore="true"></label>
        ${/* ---------- THREE TILES, WHERE THERE WERE TWO BUTTONS AND A CARD -------------------------
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
             fills in — and it is the same address the new PIN is sent to. */''}
        <div class="tile-row">${tile_({ icon: 'in', label: 'Sign in', tone: 'buy', act: 'do-signin' })}${
          tile_({ icon: 'key', label: 'Forgotten your PIN?', act: 'forgot-pin' })}${
          tile_({ icon: 'join', label: 'Make an account', act: 'register' })}</div>
        ${/* A TILE SHOWS A MARK AND NO WORD — its name is in `title` and `aria-label`, which a finger
             never reads. On a stranger's first screen that is three marks to guess at, so the card
             says them once, in the order they sit. One line, under the row, not one per tile. */''}
        <p class="faint">Sign in · a new PIN by email · make an account.</p>
        ${/* ---------- AND THE OTHER DOOR ----------------------------------------------------------
             DRAWN ONLY WHEN THERE IS AN ID TO DRAW IT FOR. `googleClientId` comes off the payload;
             with no id in the config tab the button is absent rather than present and broken, which
             is the difference between a feature not set up and a feature that does not work.

             THE PIN STAYS. Children mostly do not have Google accounts, and half of the people this
             app signs in are children — so this is a second way in, never a replacement. */''}
        ${(DATA.googleClientId || '') ? `<div class="in-or"><span>or</span></div>
        <div id="g-btn"></div>` : ''}
        ${/* `#in-said` STOOD HERE — a faint grey line carrying a validation, a "Checking…" the
              button already says with a spinner on it, and a refusal that is now a toast. See the
              note over `do-signin`: three jobs, and none of them is still its. */''}
      </div>`;
  /* THE `No account yet?` CARD THAT STOOD HERE is the third tile in the row above now. */
}

/* ---------- `signOutCard_` WAS HERE ----------------------------------------------------------------
   A NAME, A ROLE AND A `Sign out` BUTTON, at the top of the feed. It was the right answer to the
   question "which screen does signing out live on", and that turned out to be the wrong question —
   the way out belongs on the object it acts on, which is your own card, next to your photograph and
   your credits. See `meCard` in cards.js.

   AND IT WAS HALF A CARD. `meCard` already drew your face, your name and your role; this drew the
   first three of those again on another screen, which is the same duplication the account rows were
   moved out of `meRest_` to stop. One card, one place, one way out. */

function meRest_() {
  /* `rows` WAS HERE — Name, Role, Credits, Ticks, Email, Where. They are on `meCard` in cards.js
     now, built from the same `USER` and `USER.profile` this read. */

  /* THE PHOTOGRAPH, not the figure. `USER.avatar` is the WEARABLE string — "hair:crop|legs:jeans"
     — and putting that in a src gives a broken image every time. The picture is `photo`, it is a
     Drive link, and it goes through `pic()` like every other one.
     It was also never sent: verifyLogin's reply carried neither field, so this has been falling
     back to a letter for everybody since the rewrite. */
  /* A PHOTOGRAPH IF THERE IS ONE, otherwise the figure. The letter in a circle is the last
     resort now rather than the second — it says nothing about anybody, and every account has a
     figure whether or not anybody has chosen one, because the starting look is seeded from the
     handle. */
  /* ---------- YOUR FACE AND YOUR NAME ARE ON YOUR CARD, NOT HERE -----------------------------------
     THE ACCOUNT ROWS MOVED AND THIS DID NOT. `meCard` in cards.js draws your photograph, your name,
     your role and every fact under them, in the funnel under People — and this drew the photograph,
     the name and the role again at the top of a column two swipes away. Half a card, duplicating
     the top half of a whole one.

     What is left in this column is what you DO — the claims waiting on an answer, what needs fixing,
     your link, signing out. Who you are is one card, in one place. */
  return split_(`
    ${/* `installCard()` WAS HERE, "second, and that is the whole point of where it is" — and this
          column had stopped being drawn, so it was second on a page nobody could reach. It is
          deleted, with everything that fed it; see "NOTHING IN THE APP ASKS ANYBODY TO INSTALL IT"
          further down. */''}

    ${/* `Your figure` WAS A TILE ON YOUR CARD and is the last card of Settings now. It was a whole card here, with the
          avatar drawn a second time beside the one at the top of the same column, listing what you
          have on. The wardrobe itself says that better than a summary of it does. */''}

    ${/* ---------- END OF THE PROFILE CARD ------------------------------------------------------
          Everything above is WHO YOU ARE: your name and face, the facts about your account, and
          your figure. Everything below is what you DO with the account — change your details, see
          what needs fixing, hand out your link, sign out.
          Two different questions, so two panes. `ME_SPLIT` is the mark between them; `mePages`
          cuts on it. A marker rather than counting cards, because the admin card in the second
          group only exists for an admin — so any count would be right for you and wrong for
          everybody else. */''}
    ${/* ---------- THE WEEK, ON A PANE OF ITS OWN ------------------------------------------------
          IT WAS A CARD IN THE MIDDLE OF THE ACCOUNT LIST, between your details and the admin
          things — which made a timetable look like another setting to press. It is not: it is the
          one thing on this column you READ rather than act on, and it needs the width.
          `ME_SPLIT` already makes separate panes, so it gets one. */''}
    ${ME_SPLIT}
    ${/* `Your week` WAS A CARD HERE, then a tool in the drawer, and is the Timetable's now — the
          booked sessions are drawn into that week, locked. See the note where it stood in map.js. */''}
    ${ME_SPLIT}
    ${/* ---------- SOMEBODY WANTS TO ADD YOU TO THEIR FAMILY -----------------------------------
          FIRST, ABOVE EVERYTHING. A claim is somebody saying they are your parent, and it sits
          unanswered until you say. Putting it below the fold would be putting the one thing that
          needs a decision underneath the things that do not. */''}
    ${(DATA.claims || []).map(claimCard_).join('')}

    ${/* ---------- AND THE OTHER END OF IT -------------------------------------------------------
          A PARENT ASKS BY NAME. The backend matches on first and last name and refuses politely
          when there are none or more than one — so this asks for exactly those two things and lets
          it answer. Shown to a parent or client; a student has nobody to add. */''}
    ${/* `Add your child` AND `Edit your details` ARE TILES ON YOUR CARD NOW — one mark each, in the
          row under your own face, beside the wardrobe. Three cards you scrolled past, each a heading
          and a sentence, each doing one thing: which is what a tile is. The tiles have gone too — `Add your child` is a
          card on the Settings column (`childCard_`), and your details are that column. */''}

    ${/* ---------- `What needs fixing` AND `Tell someone` WERE HERE ------------------------------
          BOTH WERE CARDS THAT OPENED A SHEET, in a column of things you do to your account, and
          neither is something anybody comes here for. `Tell someone` handed out a referral link
          nobody had asked for; `What needs fixing` was an admin diagnostic sitting between a
          client's details and their Sign out button.

          THE DIAGNOSTIC ITSELF IS STILL COMPUTED AND IS NOW READ BY NOTHING. `dataProblems()` is
          the largest thing in the backend — a term that ends before it starts, a tutor with no
          hours, a law set to a colour nobody defined — and the comment that used to be here said,
          correctly, that it had been computed and read by nothing for a long time before this card
          existed. It is back in that state. That is worth a door somewhere an admin actually
          works, rather than a card on a settings screen; it is not worth this one. */''}

    ${/* ---------- THE SECOND `Sign out` WAS HERE -------------------------------------------------
          THERE WERE TWO OF THEM, and the note at the head of this file explains why there should be
          one: signing in and out moved to the top of Posts, because that is the screen nobody
          arrives at with an errand and because signing out is what you look for when handing the
          phone to somebody else. The move happened. The old button was never taken out, so both
          screens carried one and each was `data-do="signout"` — identical behaviour, two places,
          which reads as an app unsure which of them is the real one.

          NEITHER OF THEM SURVIVED. The one on Posts went too, and for the same reason it beat this
          one: the way out belongs next to who you are. It is the last row of `meCard` now — under
          your photograph, your name, your role and your credits — which is the one place it does not
          have to be moved again the next time a screen changes shape. */''}
    ${/* ---------- THE VERSION CARD IS GONE FROM THE COLUMN --------------------------------------
          IT WAS THREE BUILD NUMBERS AND A DEPLOY WARNING, on a card of its own, and with the You
          column folded into the funnel it landed between the question and your own account card —
          so the first thing anybody saw after answering was a page of build stamps. It answered a
          question only I ever ask, in the place everybody looks.

          IT IS NOT DELETED, BECAUSE IT EARNS ITS KEEP. "Is what I am looking at the thing I just
          changed" has cost more rounds than any bug in this app, and the per-file `Not deployed`
          line is what catches a half-pasted Apps Script every time. Both are on the diagnostics
          the tiles already open, not on a page in everybody's way. */''}`);}

/* ---------- THE BUILD STAMPS, FOR WHEN SOMETHING HAS CHANGED AND HAS NOT ---------------------------
   ALL THREE, because any one of them being stale looks exactly like a bug in the other two — and
   the CSS was the one that could not be asked. Below them, and only when they disagree, which of
   the backend files was missed: one number for six files is a number that lies, because Apps Script
   is pasted a file at a time and `BACKEND_VERSION` lives in constants.gs, so pasting that one alone
   moves the figure while every handler stays where it was.

   COMPARED ON THE WHOLE STAMP. Comparing dates was right while I bumped only the file I had edited,
   and that made an untouched file look permanently undeployed — so the warning was always on, which
   is the one thing a warning must never be. */
function versionSaid_() {
  return `<p class="faint" style="text-align:center">@family. · Merton &amp; Wandsworth<br>
      site ${esc(SITE_VERSION)} · css ${esc(cssVersion())}<br>
      backend ${esc(DATA.version || '—')}</p>
      ${(() => {
        const f = DATA.fileVersions || {};
        const names = Object.keys(f);
        if (names.length < 2) return '';
        const newest = names.map(k => f[k]).sort().pop();
        const stale = names.filter(k => f[k] !== newest);
        return stale.length
          ? `<p class="sub" style="color:#c8853c">Not deployed: ${stale
              .map(k => esc(k) + '.gs (' + esc(f[k]) + ')').join(', ')}. Paste ${stale.length === 1
              ? 'that file' : 'those files'} into Apps Script.</p>`
          : '';
      })()}`;
}

/* THE YOU SCREEN IS ONE PAGE.
   It was chunked four cards at a time, which put Messages, Change your PIN, Tell someone and Sign
   out on a second page — and a pager on a SETTINGS screen is the wrong instrument entirely. Paging
   is for a list you are working THROUGH: posts, search results, sessions. This is a list you are
   looking IN, and the thing somebody wants is never on the page they are on, because they do not
   know which page it is on. Signing out should not require finding it first.
   One page, scrolled. Longer, and everything is where it looks like it is. */
/* MESSAGES, ON A PANE OF ITS OWN.

   `mePages` was `[meBlocks().join('')]` — every block split apart by `split_` and then immediately
   joined back into one page. So the whole of You was a single pane with everything stacked down it
   as rows, and nothing on that screen could be its own card however it was styled. That is why
   Messages kept coming out as another row: there was no second pane for it to be.

   Two pages now. Your details, credits and the rest stay together as one list, because that is
   what they are. A thread is not a fact about you — it is somebody trying to reach you — so it
   gets the pane, the same way a session gets one on the Book screen.

   ONE FUNCTION FOR THE CARD, called from here, so the markup and the page cannot come apart. */
/* `meMessagesCard` WAS HERE — one pane on `You` holding every message from everybody, filled by
   `fillMessages` into a single `#msg-body`. Each conversation is its own widget now, in the drawer
   with the calendar and the notepad — see `msgWidgets_`. */

/* THE MARK BETWEEN THE TWO HALVES of the You screen. A comment in the markup: it survives being
   built into a string, it cannot be mistaken for content, and it renders as nothing if it ever
   escapes. */
const ME_SPLIT = '<!--me-split-->';

const mePages = () => {
  const all = meBlocks().join('');
  /* PROFILE, then ACCOUNT, then MESSAGES. Split on the marker rather than on a card count, so the
     admin-only card in the second half cannot move the boundary for an admin and not for anybody
     else. No marker — the signed-out screen — is one page, which is right: there is nothing to
     settle and nobody to have written to you. */
  /* SPLIT ON EVERY MARKER, NOT THE FIRST. This took `indexOf` and cut once, which was right while
     there was one marker and silently wrong the moment I added a second: the extra one would have
     been left sitting in the page as a literal HTML comment, and the week would have shared a pane
     with the account list anyway. Splitting on all of them means adding a pane is adding a marker.
     Empty pieces are dropped, so a marker at the very start or two in a row costs nothing. */
  const pages = all.split(ME_SPLIT).map(x => x.trim()).filter(Boolean);

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

  return pages.length ? pages : [all];
};

/* Drawn, then filled. `fillMessages` looks for `#msg-body` by id, so it can only run once this
   screen's markup is in the document — the same reason a widget's `start` runs after its page is
   filled rather than while it is being built. A frame later is enough, and it costs nothing on a
   screen nobody is looking at because there is no `#msg-body` to find. */
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
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); });

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
function mountGoogleWhenDrawn() {
  if (!USER && typeof googleMount === 'function') requestAnimationFrame(googleMount);
}

/* `on('health')` WAS HERE — it fetched `?health=1` and drew the backend's problem list in a sheet.
   The card that opened it has gone, so this could not be reached; `check-doors` named it the moment
   the card came out. The backend still computes `dataProblems()` and still puts it on the payload,
   so nothing is lost by deleting the reader — only the reading. */

/* ---------- MOUNTING GOOGLE'S BUTTON ---------------------------------------------------------------
   GOOGLE DRAWS IT, NOT US. The button has to be theirs — it is what carries the sign-in prompt and
   the account chooser, and a lookalike of our own could not produce a token.

   THE SCRIPT IS FETCHED ONCE AND ONLY IF NEEDED. Loaded at the moment the sign-in card is drawn
   rather than in the page head: somebody already signed in never asks Google for anything, which is
   a request they never make and a third party that never hears from them.

   AND IT IS IDEMPOTENT. `repaint()` redraws this card whenever anything changes, so both the script
   load and the render guard against having already happened — without that, a redraw stacks a
   second button on top of the first. */
let gLoaded = false;

function googleMount() {
  const host = $('g-btn');
  const id = DATA.googleClientId || '';
  if (!host || !id || host.childElementCount) return;

  const draw = () => {
    if (!window.google || !google.accounts || !google.accounts.id) return;
    google.accounts.id.initialize({ client_id: id, callback: googleSignedIn_ });
    google.accounts.id.renderButton(host, { theme: 'filled_black', size: 'large',
                                            text: 'signin_with', width: 260 });
  };
  if (gLoaded) { draw(); return; }
  gLoaded = true;
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.onload = draw;
  /* NO SCRIPT, NO BUTTON, AND A SENTENCE. A blocked or offline third party otherwise leaves an
     empty gap under the word "or", which reads as the app having lost something. */
  s.onerror = () => { host.innerHTML = '<p class="faint">Google sign-in could not load.</p>'; };
  document.head.appendChild(s);
}

/* WHAT COMES BACK IS A CLAIM AND IT IS NOT INSPECTED HERE. The token is passed straight through to
   the server, which asks Google whether it signed it. Reading it in the browser would prove nothing
   — the browser is the party being checked. */
function googleSignedIn_(res) {
  /* THE SAME VOICE AS THE PIN DOOR, which is the point: two ways in that report differently are
     two ways in, and the one that behaves unlike the other reads as the broken one. See the note
     over `do-signin` for why `#in-said` is gone. There is no button to disable here — Google draws
     its own — so the toast is the only thing that says anything is happening. */
  toast('Checking with Google…');
  send_({ action: 'googleLogin', credential: (res && res.credential) || '' })
    .then(d => {
      if (!d.success) { toast(d.error || 'That did not work.'); return; }
      /* ---------- EXCEPT WHEN GOOGLE HAS JUST TAKEN AWAY THE PIN -----------------------------------
         `pinCleared`: the address was PENDING, so Google proving it also took the PIN the account was
         made with (`googleLogin` in dopost.gs — whoever chose it may not own the address) and signed
         everybody else out. Said in the server's words, in a sheet they close: the person this
         happens to is as often the real registrant, and a PIN that stops working tomorrow with no
         sentence anywhere is a lock-out they cannot explain. A toast is gone in 2.6 seconds. The sheet is
         `afterSignIn_`'s, which every door in shares — with the children held, when there were any. */
      if (d.pinCleared && !d.message) d.message = 'The PIN this account was made with no longer works. Sign in '
        + 'with Google, or use "Forgotten your PIN?" for a new one.';
      /* THE SAME DOOR AS THE PIN PATH — `signedIn_`, because the reply is the same reply (one function
         builds it on the server for exactly this reason) and both doors have to feel the same, or the one
         that feels slower reads as the one that is broken. */
      signedIn_(d);
    })
    /* `send_` HAS ALREADY TOASTED IT — see the note over `do-signin`. */
    .catch(() => {});
}

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
/* ---------- A NEW PIN, TO THE ADDRESS IN THE SHEET AND NOWHERE ELSE ------------------------------
   NOT ONE RULE IS REPEATED HERE, which is the same argument `pin-save` already makes one column
   along: the box checks whether it is empty and nothing else, and whatever comes
   back is what gets said. The server decides whether that name resolves, whether there is an
   address on it, and what to tell somebody who asked about an account that is not theirs — and it
   deliberately says the SAME sentence to all three, so a copy of that reasoning here would be a
   second place to get it wrong.

   THE SENTENCE IS THE SERVER'S. `d.message` is what the handler wrote; the fallback below is for a
   deployment too old to carry the action at all, which answers a refusal rather than this. */
on('forgot-pin', el => {
  const who = (($('in-name') || {}).value || '').trim();
  if (!who) { toast('Type your email address or your handle first.'); return; }
  send_({ action: 'forgotPin', who }, { button: el, busy: 'Sending\u2026' })
    .then(d => toast((d && d.message)
      || 'If there is an account with that email, a new PIN is on its way.'))
    /* A REFUSAL IS A SENTENCE NOW \u2014 "we have no email for this account", "no account has that
       handle" \u2014 and `send_` has already toasted it. Without this the rejection went unhandled, which
       was harmless only while the server answered every case with the same success. */
    .catch(() => {});
});

on('do-signin', el => {
  const name = ($('in-name') || {}).value || '';
  const pin = ($('in-pin') || {}).value || '';
  if (!name || !pin) { toast('Both, please.'); return; }
  /* ---------- THE BUTTON HAS TO LOOK PRESSED ------------------------------------------------------
     `send_` HAS DONE THIS ALL ALONG and this call was the one that did not ask. It takes `button`
     and disables it, and `busy` and relabels it, restoring both whatever happens — and signing in
     passed neither, so the only thing that changed on screen was a line of faint grey text under a
     button that still read `Sign in` and could still be pressed.

     From the outside that is a frozen app. The request is fifteen seconds against Apps Script, the
     button invites a second press for all of them, and a second press is a second verifyLogin —
     so the fix is not decoration, it is the thing that stops two sessions being opened by somebody
     who thought the first tap missed. */
  /* NO `where` AND NO `saying`. Without a `where`, `send_`'s own `say()` toasts — see the note
     over this handler. `saying` wrote "Checking…" into a line under a button that `busy` has
     already relabelled "Checking…" with a spinner on it, which is the same word twice, six pixels
     apart, on the one card where somebody is waiting. */
  /* `email` AND `name`, THE SAME STRING TWICE. This backend reads `email` first; one deployed
     before it reads `name` and resolves an address through `findPerson`'s last rung — so the two
     can land a day apart in either order and signing in works throughout. See `verifyLogin`. */
  send_({ action: 'verifyLogin', email: name.trim(), name: name.trim(), pin },
        { button: el, busy: 'Checking…' })
    .then(d => {
      /* `send_` THROWS ON A REPLY CARRYING `error`, and `verifyLogin` refuses with one — so this
         branch is for a reply that says `success: false` and nothing else, which is the shape a
         future refusal could take without anybody here noticing. */
      if (!d.success) { toast(d.error || 'That did not work.'); return; }
      /* THE REPLY, PLUS WHAT WE ALREADY KNEW. This was `USER = d` — the reply wholesale — so any
         field the backend did not send simply did not exist on the person afterwards. Not
         hypothetical: `todo` was missing from this reply for weeks and every docket vanished at
         sign-in because of it.
         The name matters most, because it is what every request identifies the person by. A reply
         without one signs somebody in as nobody, and the failure that follows is a booking refused
         for not being signed in, to somebody who plainly is. */
      /* ---------- CLEARING THE LAST ATTEMPT'S REFUSAL IS NOT A LINE ANY MORE ------------------
         THIS CLEARED `#in-said`, and the report it was written for — *"the name or PIN not
         recognised doesn't disappear after i just logged in correctly"* — was only half true of
         that element. The LOUD copy was the banner, which nothing cleared at all and which was
         still across the top of the app after a successful sign-in. A toast expires by itself, so
         there is nothing here to clear and nothing that can outlive the thing it was about. */
      /* NOT THE TYPED TEXT AS A NAME FALLBACK ANY MORE — it is an e-mail address now, and a row with
         no first or last name would have signed in wearing its address as a display name. The
         handle is on every sign-in reply and is a name somebody chose. */
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
      signedIn_(d, name);
    })
    /* NO `.catch` THAT SPEAKS. `send_` has already toasted the sentence through `why_`, and a
       second copy here is what put the refusal on the screen twice. The rejection is swallowed
       rather than left unhandled, and marked `handled` by `send_` so nothing else reports it.

       ---------- BUT A WRONG PIN SAYS WHICH BOX, AND EMPTIES IT --------------------------------------
       MEASURED ON THE iPAD: after "That PIN is not right" the box kept the old digits and lost the
       focus, so a child had to find the box, delete four dots and retype — on the screen the owner
       called *"janky"*. The toast stays (docs/history/134 is the owner's choice of a toast); the box it
       was about is emptied, focused and marked `aria-invalid` until the next keystroke. A handle nobody
       has is the same, for the handle box. By the server's code (`why`), never by its sentence. */
    .catch(err => {
      const why = err && err.reply && err.reply.why;
      const id = why === 'wrong-pin' ? 'in-pin' : (why === 'not-an-email' || why === 'no-such-email') ? 'in-name' : '';
      const box = id && $(id);
      if (!box) return;
      if (id === 'in-pin') box.value = '';
      box.setAttribute('aria-invalid', 'true');
      try { box.focus(); if (id === 'in-name') box.select(); } catch (e) {}
    });
});
/* THE MARK COMES OFF AT THE NEXT KEYSTROKE — a red edge round a box being corrected is the app still
   complaining about what is no longer there. */
document.addEventListener('input', e => {
  const t = e.target;
  if (t && (t.id === 'in-pin' || t.id === 'in-name') && t.hasAttribute('aria-invalid')) t.removeAttribute('aria-invalid');
});

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
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const id = e.target && e.target.id;
  if (id !== 'in-name' && id !== 'in-pin') return;
  e.preventDefault();
  const btn = document.querySelector('[data-do="do-signin"]');
  if (btn && !btn.disabled) btn.click();
});

on('signout', () => {
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
  const tok = USER && USER.token;
  let last = Promise.resolve();
  try { if (typeof answersPush_ === 'function') last = answersPush_(true); } catch (err) {}
  /* AND THE NOTEPAD, THE DOCKET AND THE TIMETABLE, still inside their moment before they go up
     (`keepDue_`, data.js) — each is sent only while somebody is signed in, so after `signedOut_` below
     the words typed in the last second and a half reached nobody (review of 317). */
  let due = Promise.resolve();
  try { if (typeof keepFlush_ === 'function') due = keepFlush_(); } catch (err) {}
  Promise.all([Promise.resolve(last).catch(() => {}), due]).then(() => { try { if (tok) api({ action: 'signOut', token: tok }); } catch (err) {} });
  signedOut_();
  toast('Signed out');
});

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
function signedOut_(opts) {
  opts = opts || {};
  /* WHO IS LEAVING, AND WHETHER THEY WERE AN ADMIN — read before they are forgotten, for `ended` below. */
  const was = USER;
  let wasAdmin = false;
  try { wasAdmin = (typeof isAdmin === 'function' && isAdmin()) || (typeof hasRole === 'function' && hasRole('admin')); } catch (e) {}
  USER = null;
  try { localStorage.removeItem('familyUser'); } catch (e) {}
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
     one person to another pass neither and clear Find. */
  try {
    if (typeof STUFF !== 'undefined') {
      if (opts.keepFind) { /* nobody → somebody: `signedIn_` keeps it, and says whose it is now */ }
      else if (opts.ended && was && !wasAdmin) STUFF.whose = String(was.personId || was.name || '');
      else { STUFF.q = ''; STUFF.filters = []; STUFF.whose = ''; }
    }
  } catch (err) {}
  /* THE INBOX, AND THE POLL THAT FILLS IT. `MSG_ASKING` too: a reply still on its way is the last
     person's, and `loadMessages` drops it when it lands for somebody else. */
  MESSAGES = null; MSG_FAILED = false; MSG_PENDING = []; MSG_ASKING = null;
  Object.keys(MSG_QUEUE).forEach(k => { delete MSG_QUEUE[k]; });
  try { DM_ASKED = false; DM_DONE = false; DM_LAST = 0; if (typeof dmStop_ === 'function') dmStop_(); } catch (e) {}
  /* THE STARS — the device's copy is a cache of the person, and the next person is not them. */
  try { FAVS = new Set(); localStorage.removeItem('favs'); } catch (e) {}
  /* THE DONE DATES HELD FOR THE VISIT, AND ANYTHING OPEN OVER THE SCREEN. */
  try { if (typeof DONE_HELD !== 'undefined') DONE_HELD.clear(); } catch (e) {}
  try { if (typeof kpClose_ === 'function') kpClose_(); } catch (e) {}
  /* AND THE KEYPAD'S UNDO (`KP_UNDO`, keypad.js), as the pen's held Clears go (`padWhoChanged_`). It is kept
     by the box's key, and the signed-out key's history outlived the person who typed it: Sam's words, typed
     signed out and claimed by him when he signed in, came back under the signed-out key at the next
     visitor's Ctrl+Z after he had gone — nobody's, for whoever signed in next (317, "Undo, the booking form,
     a switch"). The next person's Ctrl+Z starts from what they find. */
  try { if (typeof KP_UNDO !== 'undefined') KP_UNDO.clear(); } catch (e) {}
  try { if (typeof closeSheet === 'function') closeSheet(); } catch (e) {}
  /* THE PAYLOAD'S PER-PERSON KEYS. Each is already hidden from the next person by its `for` check, so
     this is not what stops a leak — it is what stops the last person's data sitting on the device. */
  try {
    DATA.attempts = { for: '', mine: {} };
    DATA.family = []; DATA.familyFor = '';
    DATA.favourites = []; DATA.everyone = [];
  } catch (e) {}
  /* ---------- AND THE FILMS, WHICH HAVE NO `for` CHECK AT ALL --------------------------------------
     `DATA.films` IS AN ADMIN'S WHOLE FILM LIST, Drive links included (note 068: the list is secret,
     and the links are the folder's only lock), and unlike the keys above nothing reading it asks
     whose it is — the videos card and Find draw whatever is there, and the payload was the only
     gate. Signing out does not reload the payload, so after an admin signed out on the family's
     iPad the next person to pick it up found every film in Games → Videos and in Find, and a child
     signing in after them saw the list until their own payload landed, fifteen to thirty-five
     seconds later (found by the review of the Notflix sync, 9 Oct, through the real `signout`).
     The sync made it worse by filling the list the moment an admin opens Games. So the films and
     the sync's stamp go with the admin; and the card's own note of whom it synced for, and the sync
     still in flight — whose reply `filmsSyncRun_` already drops for somebody who has gone, and which
     held would leave the next admin's Sync tile busy with a sync they never pressed. Find's memo is
     dropped as well, though today its key names the person and a sign-out rebuilds it anyway: it is
     kept against `DATA` by identity and this is an edit in place, so the day the key stops naming
     the person (the role has already left it) this is what keeps the films out of Find.
     The search typed into the videos box goes for the reason `STUFF.q` does above: it may be a
     title. `typeof`, because games.js and find.js load after this file. */
  try { DATA.films = []; delete DATA.filmsSync; } catch (e) {}
  try { if (typeof stuffForget_ === 'function') stuffForget_(); } catch (e) {}
  try {
    if (typeof FILMSYNC !== 'undefined') { FILMSYNC.asking = null; FILMSYNC.autoFor = ''; FILMSYNC.err = ''; }
    if (typeof VID !== 'undefined') VID.q = '';
    /* AND THE PICTURES THAT FAILED, which are remembered by address — and a Drive film's address is its
       file id (`VID_BROKEN` in games.js). */
    if (typeof VID_BROKEN !== 'undefined') VID_BROKEN.clear();
  } catch (e) {}
  /* AND THE ANSWERS' READ — the next person signing in is read for, whoever they are (js/answers.js). */
  try { if (typeof answersForget_ === 'function') answersForget_(); } catch (e) {}
  /* AND THE PEN, AND THE WHITEBOARD ON A COLUMN THE REPAINT BELOW LEAVES STALE — the last person's
     board stayed armed under their key until Tools was next arrived at (`padWhoChanged_`, find.js). */
  try { if (typeof padWhoChanged_ === 'function') padWhoChanged_(); } catch (e) {}
  /* AND THE BOOKING FORM, which is the person's draft and not the next family's (`bookFollow_`, book.js;
     docs/history/317). `typeof`, because book.js loads after this file. */
  try { if (typeof bookFollow_ === 'function') bookFollow_(!!opts.quiet); } catch (e) {}
  if (!opts.quiet) repaint();
}

/* `d` is the sign-in reply; `typed` what was typed in the handle box, a name of last resort. */
function signedIn_(d, typed) {
  /* ---------- THE REPLY'S PER-PERSON EXTRAS GO ON `DATA`, NOT ON `USER` ---------------------------------
     `loginReplyFor_` sends this person's done dates, stars, family and answers with the reply now, so
     they are on the screen with "Signed in" rather than fifteen to thirty-five seconds later. They are
     the payload's keys, in the payload's shapes, and they go where the payload's copies go — behind the
     same `for` checks. On `USER` they would be written into `familyUser` and kept for thirty days. */
  const EXTRA = ['attempts', 'favourites', 'family', 'familyFor', 'answers'];
  const got = {};
  const me = Object.assign({}, d);
  EXTRA.forEach(k => { if (k in me) { got[k] = me[k]; delete me[k]; } });
  const pid = String(me.personId || '');
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
  const fromNobody = !USER;
  const over = !fromNobody && (String(USER.personId || '') !== pid || !pid);
  let whose = '';
  try { whose = typeof STUFF !== 'undefined' ? String(STUFF.whose || '') : ''; } catch (e) {}
  if (fromNobody) signedOut_({ quiet: true, keepFind: !whose || whose === pid });
  else if (over) signedOut_({ quiet: true });
  /* SIGNED IN, FIND IS THE PERSON'S OWN, and `USER` says whose — `whose` is only for while nobody is. */
  try { if (typeof STUFF !== 'undefined') STUFF.whose = ''; } catch (e) {}
  /* THE REPLY, PLUS WHAT WE ALREADY KNEW — see `do-signin`. The handle when the row has no name. */
  USER = me;
  if (!USER.name) USER.name = me.handle || typed || '';
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
  /* ---------- AND ARRIVED OVER SOMEBODY ELSE, WRITTEN DOWN BEFORE ANY DOOR IS ASKED ----------------------
     A switch is not the same seat (318), so nothing another visitor made signed out is this person's — the
     claim below was told (`ownOnly`), and the doors that open a card or the board were not: `ansRead_` and
     `padAdopt_` moved another tab's signed-out answer into Ada's empty box after she signed in over Ben,
     and up to her account (317, "Undo, the booking form, a switch"). `ansMayMove_` reads this now, for every
     door — the board drawn by `padWhoChanged_` just below and the booking form included. The sign-out step
     above forgot the last arrival's; the same person signing in again keeps theirs. */
  try { if (over && typeof ansSwitchedIn_ === 'function') ansSwitchedIn_(pid); } catch (e) {}
  /* EVERY COPY OF THE WHITEBOARD UNDER THE PERSON WHO IS SIGNED IN NOW, stale columns included. */
  try { if (typeof padWhoChanged_ === 'function') padWhoChanged_(); } catch (e) {}
  /* THE BOOKING FORM FOLLOWS — filled in signed out and signed in to send, it is theirs (book.js). */
  try { if (typeof bookFollow_ === 'function') bookFollow_(); } catch (e) {}
  try {
    if (got.attempts && typeof got.attempts === 'object' && String(got.attempts.for || '') === pid) DATA.attempts = got.attempts;
    if (Array.isArray(got.favourites)) {
      DATA.favourites = got.favourites;
      if (typeof adoptFavourites_ === 'function') adoptFavourites_();
    }
    if (Array.isArray(got.family) && String(got.familyFor || '') === pid) { DATA.family = got.family; DATA.familyFor = pid; }
  } catch (e) {}
  /* THE ANSWERS, INTO THE BOXES — the reply's copy now, and a fresh read at once beside it, which also
     sends whatever this device has had waiting for this person (js/answers.js). */
  try { if (got.answers && typeof got.answers === 'object' && typeof answersAdopt_ === 'function') answersAdopt_(pid, got.answers); } catch (e) {}
  /* AND WHAT WAS WRITTEN SIGNED OUT IS THIS PERSON'S, from nobody only — the same seat as Find above. ALL
     OF IT, NOW, AFTER THE ACCOUNT'S COPY: the later edit wins, and none is left on the device for the
     next child to sign in (`answersClaim_`, js/answers.js).
     AND OVER SOMEBODY ELSE, ONLY WHAT IS THEIRS: a switch is not the same seat, so nothing another visitor
     made signed out is the arriving child's — but what THEY made after the server ended their session is,
     and it was left for `ansRead_` to move into an empty box only: Ada back while Ben was still signed in
     found her essay without the words she had typed beside it (317, "Six edges closed", G1). */
  try { if (pid && typeof answersClaim_ === 'function') answersClaim_(pid, !fromNobody); } catch (e) {}
  try { if (typeof answersPull_ === 'function') answersPull_(true); } catch (e) {}
  handleRemember_(me.handle);
  /* WHO, NOT JUST THAT. *"i feel very insecure when signing into the kids accounts"* — on an iPad passed
     between children, "Signed in" does not say into whose account. */
  const first = String(USER.name || USER.handle || '').trim().split(/\s+/)[0];
  toast(first ? 'Signed in as ' + first : 'Signed in');
  repaint();
  /* ---------- AND BACK WHERE YOU CAME FROM ----------------------------------------------------------------
     MEASURED ON THE iPAD: signed in, you stayed on the account column — your card and then every tutor —
     so a child sent there from a question (`go('account')` from the cheat sheet, or a swipe across to
     sign in) had to find their way back. Only when the sign-in happened ON that column: signing in from
     the card at the top of the feed leaves you on the feed. Back to the column you came from, or — with
     nowhere to go back to — Find, for a child, which is what a child signs in to do. */
  try {
    if (AT === 'account') {
      const kid = typeof hasRole === 'function' && (hasRole('kid') || hasRole('student'));
      const back = typeof PREV_AT === 'string' && PREV_AT && PREV_AT !== 'account' && TABS.some(t => t.id === PREV_AT)
        ? PREV_AT : (kid ? 'stuff' : '');
      if (back) go(back);
    }
  } catch (e) {}
  load();
  /* AND WHAT IS OWED ONCE IN — a sentence about held children, a move link waiting. */
  afterSignIn_(d);
}

/* ---------- THE HANDLES THIS DEVICE HAS SIGNED IN, NEVER THEIR PINS ---------------------------------------
   Switching child on the family iPad was typing a handle every time. A chip per handle that has signed
   in here fills the box and puts the caret in the PIN, so it is one tap and the PIN. HANDLES ONLY: a
   handle is printed on every card on the site; a PIN is never written anywhere on the device. Each chip
   has a ✕ that forgets it — a child who has left, a visitor's account. Most recent first, six at most:
   more than a family's children is not a family's iPad. Every read and write wrapped, for private mode. */
const HANDLES_KEY = 'familyHandles';
const HANDLES_MAX = 6;
function handlesKnown_() {
  try {
    const v = JSON.parse(localStorage.getItem(HANDLES_KEY) || '[]');
    return Array.isArray(v) ? v.map(String).filter(h => /^[\w.-]{1,40}$/.test(h)).slice(0, HANDLES_MAX) : [];
  } catch (e) { return []; }
}
function handleRemember_(h) {
  h = String(h || '').trim();
  if (!/^[\w.-]{1,40}$/.test(h)) return;
  const list = [h].concat(handlesKnown_().filter(x => x.toLowerCase() !== h.toLowerCase())).slice(0, HANDLES_MAX);
  try { localStorage.setItem(HANDLES_KEY, JSON.stringify(list)); } catch (e) {}
}
function handleChips_() {
  const list = handlesKnown_();
  if (!list.length) return '';
  return `<div class="hchips" role="group" aria-label="Signed in on this device before">${list.map(h =>
    `<span class="hchip"><button type="button" class="hchip-pick" data-do="handle-pick" data-h="${esc(h)}"><b>@</b>${esc(h)}</button><button type="button" class="hchip-drop" data-do="handle-forget" data-h="${esc(h)}" aria-label="Forget ${esc(h)} on this device" title="Forget ${esc(h)} on this device">✕</button></span>`
  ).join('')}</div>`;
}
on('handle-pick', el => {
  const name = $('in-name'), pin = $('in-pin');
  if (!name || !pin) return;
  name.value = el.getAttribute('data-h') || '';
  name.removeAttribute('aria-invalid');
  pin.value = '';
  /* THE CHIP CHOSEN STAYS LIT, so whoever is holding the iPad can see whose account the PIN is for
     before typing it — the one thing on this card that answers *"i feel very insecure when signing into
     the kids accounts"*. A value and a focus are invisible from across the table; a gold edge is not. */
  const row = el.closest('.hchips');
  if (row) [].forEach.call(row.querySelectorAll('.hchip'), c => {
    const on = c === el.closest('.hchip');
    c.classList.toggle('is-on', on);
    const b = c.querySelector('.hchip-pick');
    if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  try { pin.focus(); } catch (e) {}
});
on('handle-forget', el => {
  const h = String(el.getAttribute('data-h') || '').toLowerCase();
  try { localStorage.setItem(HANDLES_KEY, JSON.stringify(handlesKnown_().filter(x => x.toLowerCase() !== h))); } catch (e) {}
  const chip = el.closest('.hchip');
  const row = chip && chip.parentNode;
  if (chip) chip.remove();
  if (row && !row.querySelector('.hchip')) row.remove();
});
/* DOTS ON A TEXT BOX, WHERE THE BROWSER CAN DRAW THEM — see `.pin-dots` and the PIN box above. Asked of
   the browser rather than of its name. */
function pinDotsOk_() {
  try { return !!(window.CSS && CSS.supports && CSS.supports('-webkit-text-security', 'disc')); }
  catch (e) { return false; }
}

/* ---------- THE WARDROBE -------------------------------------------------------------------------
   Every slot, every item, with the locked ones showing what they would take. A catalogue you can
   SEE is what makes levelling up mean anything — a list of only what you already own tells you
   nothing about what is next, which is the whole reason to have a level at all.

   The colours are free and come first, because they are what most people change and because
   nobody should have to earn the right to have brown hair. */
/* `on('build-said')` WAS HERE, opening `versionSaid_` in a sheet from a `Build` tile on your own
   card. The tile was removed on request, and the stamps are printed under the admin's own Signing-in
   card on the Settings column instead — a sheet opened from nothing is a handler with no door. */

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
const AV_FIG = 56;
function wardrobeCard_() {
  if (!USER) return '';
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  const items = wardrobe();

  /* A CLASS, NOT AN ID — `avatarSave` redraws every `.av-figure` and there is only one now, but an
     id here is how the four-pages version once moved the wrong picture, and nothing is saved by
     going back to one. */
  const figure = `<div class="av-wrap av-figure">${
    avatarFor(USER.handle || USER.name, AV_FIG, USER.avatar)}</div>`;

  const swatches = (field, colours) => `<div class="av-swatches">
    ${colours.map((col, i) => `<span class="av-sw${cfg[field] === i ? ' on' : ''}"
      style="background:${col}" data-do="av-colour" data-field="${field}" data-value="${i}"
      role="button" aria-label="${esc(field)} ${i + 1}" title="${esc(col)}"></span>`).join('')}
  </div>`;
  const line = (label, body) => `<div class="av-line">
      <span class="av-slot-name">${esc(label)}</span>${body}</div>`;

  const slotLine = ([slot, label]) => {
    const mine = items.filter(x => x.slot === slot);
    if (!mine.length) return '';
    return line(label, `<div class="av-opts">${mine.map(it => {
      const on = cfg[slot] === it.id;
      /* WHY it is not yours, on the item itself. "Locked" is a state; "Lv 8" is a thing you can
         count towards, which is the difference between a shop window and a list of doors. */
      const why = it.unlocked ? '' : (it.cost ? it.cost + 'cr' : 'Lv' + it.level);
      const said = it.name + (why ? ' — ' + (it.cost ? it.cost + ' credits' : 'level ' + it.level) : '');
      return `<button class="av-opt${on ? ' on' : ''}${it.unlocked ? '' : ' locked'}"
        data-do="av-pick" data-slot="${esc(slot)}" data-id="${esc(it.id)}"
        aria-label="${esc(said)}" aria-pressed="${on ? 'true' : 'false'}" title="${esc(said)}">
        ${itemArt(slot, it.id, 24) || '<span class="av-none">—</span>'}
        ${why ? `<span class="av-why">${esc(why)}</span>` : ''}
      </button>`;
    }).join('')}</div>`);
  };

  return `<div class="card av-card"><h3><span>Your figure</span></h3>
    <div class="av-top">
      ${figure}
      <div class="av-stats">
        <p><b>Level ${esc(String(levelFromXp(USER.xp)))}</b> · ${esc(String(USER.credits || 0))} credits</p>
        <p class="faint">Colours are free. Things unlock with a level or a few credits.</p>
      </div>
    </div>
    ${line('Skin', swatches('skin', AV_SKIN))}
    ${line('Hair', swatches('hairColour', AV_HAIR))}
    ${line('Shirt', swatches('shirt', AV_SHIRT))}
    ${AV_SLOTS.map(slotLine).join('')}
  </div>`;
}

/* `on('wardrobe')` WAS HERE — the `Your figure` tile's door, which found the colour page on this
   column and turned to it. The tile went on request, and the card is the last one on the column. */

/* A colour and an item go through the SAME request, because to the server they are the same
   thing: a whole look, re-checked piece by piece. Nothing here decides what anybody may wear. */
let AV_SEQ = 0;
function avatarSave(change) {
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  Object.assign(cfg, change);

  /* ---------- EVERY FIGURE ON THE COLUMN, NOT THE FIRST ONE `$()` FINDS ------------------------
     THE WARDROBE WAS SEVEN PAGES AND EACH CARRIED THE FIGURE (it is one card now). As an id that was
     four elements with one id and `$()` handing all of them the first — so picking a colour on page five moved the
     figure on page one and the one under your thumb did not change. The `$('msg-text')` fault, on
     the surface where the whole point is that you SEE the change. A class, and all of them. */
  /* ---------- THE WHOLE CARD FOLLOWS THE LOOK, NOT ONLY THE FIGURE --------------------------------
     THIS REDREW `.av-figure` AND NOTHING ELSE, so the ring stayed on the colour you had left, a
     bought item went on showing its price and lock, and the credits line kept the old balance —
     measured, pressing skin 4 left the ring on skin 1 while the figure changed. The card's INSIDE is
     rebuilt from `wardrobeCard_`, the one renderer, but the card ELEMENT is kept: `paneReach_` writes
     its zoom inline on that element and `paneWatch_`'s observer is attached to it, and swapping it
     would drop both. */
  const draw = () => {
    const card = document.querySelector('.av-card');
    if (card) {
      const tmp = document.createElement('div');
      tmp.innerHTML = wardrobeCard_();
      const fresh = tmp.firstElementChild;
      if (fresh) { card.innerHTML = fresh.innerHTML; return; }
    }
    document.querySelectorAll('.av-figure').forEach(el => {
      el.innerHTML = avatarFor(USER.handle || USER.name, AV_FIG, USER.avatar);
    });
  };
  /* ---------- AND ONLY THE LATEST TAP'S ANSWER COUNTS -----------------------------------------------
     Two quick taps are two requests, and they can come back in either order — measured, skin 2 then
     skin 5 left the phone wearing skin 2 when the first reply was the slower one. Each tap takes a
     number; a reply for an older one is ignored, in the refusal path too, or a late refusal of an
     old tap would put the look from before it back over a newer one the server accepted. */
  const seq = ++AV_SEQ;

  /* The figure redraws IMMEDIATELY, before the server answers — picking a colour and waiting a
     second to see it is the difference between a wardrobe and a form. Put back if refused. */
  const before = USER.avatar;
  USER.avatar = Object.keys(cfg).map(k => k + ':' + cfg[k]).join('|');
  draw();

  api({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg })
    .then(d => {
      if (seq !== AV_SEQ) return;
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      /* ---------- A TOAST, BECAUSE THE PAGE NO LONGER HAS A LINE TO WRITE TO --------------
         `#av-said` WENT WITH THE SHEET and it was the second duplicate id on these pages. What it
         said on the happy path was "Saved" over a figure that had already changed — which is what
         `avatarSave`'s own comment above calls the difference between a wardrobe and a form. Only
         BUYING is worth a word, because that one spends credits. */
      if ((d.bought || []).length) toast('Bought ' + d.bought.join(', '));
      draw();
    })
    .catch(err => {
      if (seq !== AV_SEQ) return;
      USER.avatar = before;
      draw();
      /* A REFUSAL IS A TOAST. This app decided that once already — see the note on `why_` in
         shell.js — and the line it used to be written to is gone. */
      toast(String(err.message || err));
    });
}

on('av-colour', el => avatarSave({ [el.dataset.field]: Number(el.dataset.value) }));
on('av-pick', el => avatarSave({ [el.dataset.slot]: el.dataset.id }));

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
const REG_PIN = /^\d{4,8}$/;
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
const REG_NOTE = {
  /* "ONCE YOU HAVE OPENED IT", not "once you are in": signing in waits on nothing, but a child waits on
     the parent's address being proved (`confirmFirst_` in people.gs), so the link comes first. */
  parent: 'We email you a link to open. Once you have opened it, make your child\'s account in Settings — '
        + 'they need no email.',
  student: 'We email a link to open. Then sign in with your handle or email and the PIN. A parent '
         + 'can also make your account, in Settings.',
};
function registerSheet_() {
  openSheet('Make an account', `
    ${/* NOT A <label>: a label around buttons hands a tap on its caption to the first button inside,
          which would answer the question for anybody who touched the words above it. */''}
    <div class="reg-who" id="reg-who" data-who="" role="group" aria-labelledby="reg-who-cap">
      <p class="reg-cap" id="reg-who-cap">who is the account for?</p>
      <div class="btn-row">
        <button type="button" class="btn quiet" data-do="reg-who" data-who="parent"
                aria-pressed="false">I'm a parent or guardian</button>
        <button type="button" class="btn quiet" data-do="reg-who" data-who="student"
                aria-pressed="false">I'm a student</button>
      </div>
    </div>
    <div id="reg-rest" hidden>
      ${/* THE TWO NAMES SHARE A ROW, as on "Make your child's account" — measured: with the question
            above them, four boxes stacked put Make my account under the fold of a 320x568 phone for a
            student, and the parent's note half under it. A row is 74px back, and a name fits in half
            of a 320 sheet. */''}
      ${/* THE NAMES AND THE ADDRESS ARE DRAFTS (data.js; docs/history/317) — the sheet closed by a tap
            outside, or the page reloaded, and they were gone. The DEVICE'S drafts (nobody is signed in
            to make an account), so they last `DRAFT_DEVICE_MS` and no longer: on a shared iPad the next
            family is not handed this one's address tomorrow. Dropped when the account is made. NOT THE
            QUESTION ABOVE, which is asked again on purpose (the note over `REG_NOTE`), nor the tick it
            resets, and NEVER THE PIN. */''}
      <div class="f-row" style="--n:2">
        <label class="field"><span>first name</span>
          <input id="reg-first" autocomplete="given-name"${draftAttr_('reg', 'first')} value="${esc(draftVal_('reg', 'first'))}"></label>
        <label class="field"><span>last name</span>
          <input id="reg-last" autocomplete="family-name"${draftAttr_('reg', 'last')} value="${esc(draftVal_('reg', 'last'))}"></label>
      </div>
      <label class="field"><span>email</span>
        <input id="reg-email" type="email" inputmode="email" autocomplete="email" autocapitalize="off"
               spellcheck="false" placeholder="you@example.com"${draftAttr_('reg', 'email')} value="${esc(draftVal_('reg', 'email'))}"></label>
      <label class="check reg-kid" hidden><input type="checkbox" id="reg-noemail"><span class="box"></span>
        <span>It's a grown-up's email</span></label>
      <label class="field"><span>PIN — 4 to 8 digits</span>
        <input id="reg-pin" type="password" inputmode="numeric" autocomplete="new-password"></label>
      <button class="btn" data-do="reg-send">Make my account</button>
      ${/* THREE LINES AT 320, MEASURED: the first draft was five, and its last two sat under the fold
            of a sheet nobody scrolls. The tick says whose address it is in four words for the same
            reason. Filled from `REG_NOTE` when the question is answered. */''}
      <p class="faint" id="reg-note" style="margin:.6rem 0 0"></p>
    </div>`);
}
on('register', () => registerSheet_());

/* `regWho_` IS THE ONE READER of the answer, so the send and the redraw cannot disagree about it. */
const regWho_ = () => {
  const w = (($('reg-who') || {}).dataset || {}).who || '';
  return w === 'parent' || w === 'student' ? w : '';
};
on('reg-who', el => {
  const row = $('reg-who');
  if (!row || !el) return;
  const who = el.dataset.who === 'parent' ? 'parent' : 'student';
  row.dataset.who = who;
  row.querySelectorAll('[data-do="reg-who"]').forEach(b => {
    const on_ = b.dataset.who === who;
    b.classList.toggle('on', on_);
    b.setAttribute('aria-pressed', on_ ? 'true' : 'false');
  });
  const rest = $('reg-rest'); if (rest) rest.hidden = false;
  const tick = $('reg-noemail'), tickRow = tick && tick.closest('.reg-kid');
  if (tickRow) tickRow.hidden = who !== 'student';
  if (tick && who !== 'student') tick.checked = false;
  const note = $('reg-note'); if (note) note.textContent = REG_NOTE[who];
});

on('reg-send', el => {
  const v = id => ((($(id) || {}).value) || '').trim();
  const first = v('reg-first'), last = v('reg-last'), email = v('reg-email'), pin = v('reg-pin');
  const who = regWho_();
  /* A STUDENT'S TICK ONLY. The row is hidden for a parent and unticked when it hides, and this asks
     again rather than trusting that — a parent's address sent as `parent_email` is refused anyway. */
  const kid = who === 'student' && !!($('reg-noemail') || {}).checked;
  /* UNREACHABLE FROM THE SHEET — the button is under the question until it is answered — and said
     anyway, for a button pressed some other way: never posted unanswered, because an unanswered
     `register` is a student, and that is the fault this question is here to end. */
  if (!who) { toast('Say who the account is for first — a parent or a student.'); return; }
  if (!first || !last) { toast('Your first and last name, please.'); return; }
  if (email.indexOf('@') < 0) {
    toast(kid ? 'A grown-up\'s email address, please — the link goes to them.'
              : 'An email address, please — the link goes to it.');
    return;
  }
  if (!REG_PIN.test(pin)) { toast('A PIN is 4 to 8 digits, and nothing else.'); return; }
  /* THROUGH `send_`, so the button spins, the four boxes lock while it is on the wire (`#sheet-body`
     is one of the boxes `send_` knows to lock) and a refusal — "That email is already registered" —
     is toasted in the server's own words. */
  const body = { action: 'register', who, first_name: first, last_name: last, pin };
  if (kid) body.parent_email = email; else body.email = email;
  send_(body, { button: el, busy: 'Making it…' })
    .then(d => {
      ['first', 'last', 'email'].forEach(f => { try { draftDrop_('reg', f); } catch (e) {} });
      closeSheet();
      /* THE ADDRESS GOES INTO THE SIGN-IN BOX, because the next thing this person does — after the
         email — is sign in with it, and they have just typed it once. FOR A CHILD WITH NO ADDRESS IT
         IS THE HANDLE, which they have never seen: it is the only thing they will sign in with, and
         the box is the one place on the screen that stays put while they wait for their grown-up. */
      const handle = String((d && d.handle) || '');
      const box = $('in-name'); if (box) box.value = kid && handle ? '@' + handle : email;
      /* NO WAITING ON THE LINK — see the note over `verifyLogin`'s old PENDING refusal in dopost.gs.
         The account works now; the link is said as what it is, a confirmation, not a door. */
      toast(kid ? 'Account made — sign in now as ' + (handle ? '@' + handle : 'your handle')
                  + ' with your PIN. Your grown-up has been sent a link to confirm.'
                : who === 'parent'
                  ? 'Account made — sign in now with your PIN. Open the link we have emailed you before making '
                    + 'your child\'s account.'
                  : 'Account made — sign in now with your PIN. We have also emailed you a link to confirm your address.');
    })
    .catch(() => {});      // `send_` has already said why
});

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
function verifyFromLink_(again) {
  let token = again || '';
  if (!token) try {
    const q = new URLSearchParams(location.search);
    token = (q.get('verify') || '').trim();
    if (!token) return;
    q.delete('verify');
    const rest = q.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  } catch (e) { if (!token) return; }
  /* ---------- `session`: WHO THIS PHONE IS SIGNED IN AS, beside the link's own token ---------------------
     A link that MOVES an account to a new address only works where that account is signed in
     (`verifyEmail`, `authMove*_` in booking.gs) — the new address's inbox and the account, both. `token`
     is the link's, so `api()` adds nothing, and the phone's own goes in a field of its own. A link that
     only confirms ignores it. */
  send_({ action: 'verifyEmail', token, session: (USER && USER.token) || '' })
    .then(d => {
      /* ---------- A NEW ADDRESS, MOVED ----------------------------------------------------------------
         The row has it now, confirmed. Said here and written into `USER` at once — the profile a
         `myProfile` beside this may bring back is from before (`ACCOUNT_AT_`). */
      if (d && d.moved) {
        accountChanged_();
        if (USER) {
          USER.profile = Object.assign({}, USER.profile || {}, { email: String(d.email || ''), email_moving: '' });
          try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
          try { repaint(true); } catch (e) {}
        }
        toast('Your email is ' + (d.email || 'changed') + ' now — sign in with it from here on.');
        return;
      }
      /* A GROWN-UP SAYING YES FOR A CHILD WITH NO EMAIL is told the child's handle, not "sign in
         with it" — the address is theirs, and it signs nobody in for the child. */
      const first = d && d.name ? String(d.name).split(' ')[0] : '';
      if (d && d.noEmail && d.parentPending) {
        /* ---------- `parentPending`: A SHEET THEY CLOSE, NOT A TOAST THAT CLOSES ITSELF ----------------
           THERE IS A PARENT ACCOUNT ON THIS ADDRESS AND NOBODY HAS CONFIRMED IT, so the child was not put
           on it — it may not be the reader's (see `verifyEmail`). Round one said this in a toast of about
           170 characters, which `toast` takes away after 2.6 seconds; the child's link is single-use, so
           the grown-up could never open it again to read the rest (PR #130 review, round two). The next
           step is theirs and has three parts, so it is a sheet with Done, and stays until they say so.
           The last line is for the reader to whom the account is a surprise: somebody else made it on
           their address, and "Forgotten your PIN?" is how they take it back (`authResetUse_`). */
        const who = first || 'They';
        openSheet('Confirmed — one more step', `
          <p class="sub">${esc(who)} can sign in now${d.handle ? ` as <b>@${esc(d.handle)}</b>` : ''} with
            their PIN.</p>
          <p class="sub"><b>They are not on your account yet.</b> The @family. account on your email has not
            been confirmed, so we did not put ${esc(first || 'them')} on it.</p>
          <p class="sub">Open the "Confirm your @family. account" email we sent you — or sign in and press
            "Send the link again" — then add ${esc(first || 'them')} with "Add your child" in Settings.
            They say yes, and they are on your account.</p>
          <p class="faint">Did you never make an account here? Then somebody else did, with your email. Use
            "Forgotten your PIN?" with your email to take it back — it signs them out.</p>
          <button class="btn quiet" data-do="sheet-done">Done</button>`);
        try { if (USER) load(); } catch (e) {}
      } else if (d && d.noEmail) {
        toast('Confirmed — ' + (first || 'they') + ' can sign in now'
              + (d.handle ? ' as @' + d.handle : '') + ' with their PIN'
              + (d.linkedTo ? ', and is on your account.' : '.'));
        try { if (USER) load(); } catch (e) {}
      } else {
        /* ---------- AND YOUR OWN, OPENED ON THE PHONE YOU ARE SIGNED IN ON --------------------------------
           Since sign-in stopped waiting on the link, the person opening it is often already in — and
           was told "now sign in". The held card and the line under their own card go at once, from the
           reply (`myProfile` runs beside this request at start-up and may have answered first, with the
           address still waiting). Matched on the handle, which is one person's, or the name. */
        const me = !!(USER && d && ((d.handle && d.handle === USER.handle) || (d.name && d.name === USER.name)));
        if (me) {
          /* AND A `myProfile` ASKED BEFORE THIS IS NOT ALLOWED TO PUT IT BACK (`ACCOUNT_AT_`) — measured
             by round three of the review: the one boot fires beside this request landed after it, said
             "still waiting", and the held card stayed under a toast saying the opposite. */
          accountChanged_();
          USER.pendingEmail = '';
          try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
          try { repaint(true); } catch (e) {}
        }
        toast('Email confirmed' + (first ? ', ' + first : '')
              + (!me ? ' — now sign in with it and your PIN.'
                 : mayAddChild_() ? ' — you can make your child\'s account in Settings now.' : '.'));
      }
      /* TO THE SIGN-IN CARD, which is where the next step is. */
      try { if (!USER) go('account'); } catch (e) {}
    })
    /* ---------- "SIGN IN, AND IT WILL FINISH BY ITSELF" ---------------------------------------------------
       A move link opened where the account is not signed in. Kept on this phone, and `afterSignIn_` sends
       it again the moment somebody signs in — if it is the right account it moves, and if not the server
       says so again. Kept for the tab's life only: a link is single-use and a newer mail retires it. */
    .catch(err => {
      const d = err && err.reply;
      if (!d || d.why !== 'sign-in-first') return;    // `send_` has already toasted the server's sentence
      try { sessionStorage.setItem('familyVerify', token); } catch (e) {}
      try { go('account'); } catch (e) {}
    });
}

/* THE MOMENT SINCE WHICH THE PHONE KNOWS SOMETHING NEWER ABOUT THIS ACCOUNT'S ADDRESS than a `myProfile`
   asked before it — see `profileRefresh_`, which asks again rather than paint an answer older than this. */
let ACCOUNT_AT_ = 0;
function accountChanged_() { ACCOUNT_AT_ = Date.now(); }

/* ---------- WHAT EVERY DOOR IN DOES ONCE IT IS IN -----------------------------------------------------
   The PIN, Google and the sign-in link each set `USER` from the same reply (`loginReplyFor_`), and then
   two things are owed that none of them did on its own:
   · A SENTENCE THE SERVER SAYS MUST BE READ — the children taken off a PENDING account its address's
     owner has just taken back (`authTakeBack_`), or Google taking away the PIN. A sheet with Done, not a
     2.6-second toast: it is about somebody's children, and nobody can ask for it again. The same for a
     change of address the taking back cancelled (`moveDropped`, `authResetTake_`): it may have been the
     owner's own, and this sentence is the only place they learn to type it again.
   · A MOVE LINK THAT WAS WAITING FOR A SIGN-IN (`verifyFromLink_`), sent now. */
function afterSignIn_(d) {
  if (d && (d.childrenHeld || d.pinCleared || d.pinLink || d.moveDropped) && d.message) {
    openSheet(d.pinCleared ? 'Your PIN has changed' : d.childrenHeld ? 'Signed in — one thing to know' : 'Signed in',
      `<p class="sub">${esc(d.message)}</p>
       <button class="btn quiet" data-do="sheet-done">Done</button>`);
  }
  let waiting = '';
  try { waiting = sessionStorage.getItem('familyVerify') || ''; sessionStorage.removeItem('familyVerify'); } catch (e) {}
  if (waiting) verifyFromLink_(waiting);
}

/* ---------- AND THE SIGN-IN LINK IN A FORGOTTEN-PIN MAIL ----------------------------------------------
   `?signin=<key>` — `pinLink` in dopost.gs: the emailed PIN used by the one copy of it nobody can guess,
   so it gets its owner in even when somebody else's wrong PINs have locked the account and used up the
   typed PIN (round three of the PR #130 review). Read once at start-up like `?verify=`, and taken out of
   the address before anything is sent: it is single-use, and a refresh would post it again. */
function pinFromLink_() {
  let key = '';
  try {
    const q = new URLSearchParams(location.search);
    key = (q.get('signin') || '').trim();
    if (!key) return;
    q.delete('signin');
    const rest = q.toString();
    history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
  } catch (e) { if (!key) return; }
  send_({ action: 'pinLink', key })
    .then(d => {
      if (!d || !d.success) { toast((d && d.error) || 'That link did not work.'); return; }
      /* THE PIN PATH'S DOOR, for its reasons — see `do-signin` and `signedIn_`. */
      signedIn_(d);
    })
    .catch(() => {});      // `send_` has already toasted the server's sentence
}

/* ---------- FRIENDS ------------------------------------------------------------------------------
   A comma list of handles on the person's own row. Kept as one cell for the same reason the docket
   is: a friendship has no life of its own, nothing links to it, and a tab would mean a row id and
   a deletion policy for something that is a name in a list.
--------------------------------------------------------------------------------------------- */
const friendHandles = () =>
  String((USER && USER.friends) || '').split(',').map(x => x.trim()).filter(Boolean);

/* ADDING ONE. The LIST is on Find with everything else; this is only the asking — a short question
   with an end, which is what a sheet is for. It used to show the list here too, which made friends
   the one set of people on the site reachable from two places. */
function friendsSheet() {
  openSheet('Add a friend', `
    <label class="field"><span>their handle</span>
      <input id="fr-add" placeholder="e.g. ada_kind42" autocomplete="off"></label>
    <button class="btn" data-do="friend-add">Add</button>
    <p class="faint" id="fr-said" style="margin:.6rem 0 0">
      Exactly as they have it. A search that guesses adds the wrong person, and the wrong person is
      harder to notice than nobody — they simply appear on a list you scroll past.</p>`);
}
/* `on('friends')` WAS HERE and nothing on any screen carried `data-do="friends"`. It opened the
   same sheet `friend-add-open` opens, twenty-six lines below, which IS reachable — so this was a
   second door onto one room, with no handle on the outside of it.
   Removed rather than given a button: two ways in is two things to keep in step, and the one that
   works is the one people use. */

on('friend-add', () => {
  const box = $('fr-add'), said = $('fr-said');
  const want = ((box && box.value) || '').trim();
  if (!want) { box && box.focus(); return; }
  /* EXACT, and it has to be. A search that guesses adds the wrong person, and the wrong person is
     harder to notice than nobody — they simply appear on a list somebody scrolls past. */
  const found = (DATA.students || []).find(s2 => norm(s2.handle) === norm(want));
  if (!found) { if (said) said.textContent = 'Nobody has the handle "' + want + '".'; return; }
  if (norm(found.handle) === norm(USER.handle)) {
    if (said) said.textContent = 'That is you.'; return;
  }
  const list = friendHandles();
  if (list.some(h => norm(h) === norm(found.handle))) {
    if (said) said.textContent = found.handle + ' is already on your list.'; return;
  }
  friendsSave(list.concat([found.handle]), said);
  closeSheet();
  toast('Added ' + found.handle);
});

on('friend-drop', el => friendsSave(
  friendHandles().filter(h => norm(h) !== norm(el.dataset.handle)), $('fr-said')));

/* Adding one from the Find browse page, where the list is. */
on('friend-add-open', () => friendsSheet());

/* Written on the phone first, then sent — and the sheet redrawn either way, so removing somebody
   is visible before the round trip and put back if it fails. */
function friendsSave(list, said) {
  const before = USER.friends;
  USER.friends = list.join(', ');
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  /* The list lives on Find now, so that is what has to be redrawn — and the memo has to be told,
     or it serves the list from before the change. */
  FIND_MEMO.key = null;
  if (AT === 'stuff') paintStuff();
  api({ action: 'saveFriends', name: USER.name, personId: USER.personId, friends: USER.friends })
    .then(d => { if (d && d.error) throw new Error(d.error); })
    .catch(err => {
      USER.friends = before;
      FIND_MEMO.key = null;
      if (AT === 'stuff') paintStuff();
      const el = $('fr-said');
      if (el) el.textContent = String(err.message || 'Not saved — no connection.');
    });
}

/* ---------- MESSAGES -----------------------------------------------------------------------------
   Read-only for now on the sending side of a thread nobody has started: the backend has
   `sendMessage` and this can post to it, but there is no picker for WHO — that belongs with the
   roster, where the people you are talking to are already on screen.
--------------------------------------------------------------------------------------------- */
/* THE LIST, drawn into the widget's own space. The same markup the sheet used, so a message looks
   the same whichever way somebody reached it. */
/* WHERE MESSAGES COME FROM.
   `DATA.messages` — which both readers below used to take — is not a key the payload has ever
   held. Messages are a POST action (`messages`), because a conversation is private and the GET
   payload goes out whole to whoever asks for it. So the widget and the sheet both read undefined,
   fell to `|| []`, and said "Nothing yet." to everybody for ever — the exact shape of the
   `liveJobs` fault, and just as quiet.

   Held here between openings so re-opening the widget does not re-ask, and refreshed on every
   open so it is never more than one tap stale. */
let MESSAGES = null;
/* ---------- WHETHER THE LAST ANSWER WAS ONE ------------------------------------------------------
   `MESSAGES` CANNOT SAY. It is left alone on a failure — deliberately, which is why a blip does not
   read as everything having been deleted — so `null` means both *never asked* and *asked and
   refused*, and the column drew "Nothing yet." over an inbox nobody managed to read. This
   repository's oldest fault, on the one screen whose whole job is telling you somebody wrote.

   ONE FIELD, NOT TWO. A `MSG_AT` was here as well, and the poll in posts.js gated on it — which was
   wrong in a way only the failure path shows: it only moves on SUCCESS, so a refused fetch left the
   gate open and every `paint('dm')` asked again. The pacing is a fact about the ASKING and lives
   with the asking, as `DM_LAST`; this is a fact about the DATA. */
let MSG_FAILED = false;

/* ---------- ONE REQUEST AT A TIME, AND ONLY FOR WHOEVER ASKED ---------------------------------------
   MEASURED: every load asked twice — `load()` for the widgets, and the Messages column's own draw
   (`dmSync_`) a moment later — two round trips to Apps Script for one inbox. A second caller while one is
   on the wire is handed the same promise. And a reply that lands after the iPad has changed hands is the
   last child's inbox: it is dropped rather than put on the next child's column (diag-signin, C). */
let MSG_ASKING = null;
function loadMessages() {
  if (!USER) return Promise.resolve([]);
  const who = String(USER.personId || USER.name || '');
  if (MSG_ASKING && MSG_ASKING.who === who) return MSG_ASKING.p;
  const still = () => !!USER && String(USER.personId || USER.name || '') === who;
  /* `send` FOR THE SAME REASON, and the comment below was written as though it already did. With
     `api()` a refusal — "Not signed in." — resolves with no `messages` key, `|| []` turns it into an
     empty list, and the inbox reads as empty rather than as unreachable. That is the exact fault
     the next four lines say they are guarding against, and it was reaching them as a success. */
  const asking = { who: who, p: null };
  asking.p = send({ action: 'messages', name: USER.name, personId: USER.personId })
    .then(d => {
      if (!still()) return [];
      MSG_FAILED = false;
      return (MESSAGES = (d && d.messages) || []);
    })
    /* A failure leaves whatever was already there rather than emptying the list — an unreachable
       backend is not the same fact as an empty inbox, and showing the second for the first is how
       a network blip reads as everything having been deleted. */
    .catch(() => { if (!still()) return []; MSG_FAILED = true; return MESSAGES || []; })
    .then(v => { if (MSG_ASKING === asking) MSG_ASKING = null; return v; });
  MSG_ASKING = asking;
  return asking.p;
}

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
/* THE SHEET IS THE SAME FORM IN A SHEET. It had its own textarea, its own button and its own note,
   which is a second composer to keep in step with the one on the thread — the fault recorded here
   under `childrenOf`, under `link`/`source_url` and under `factsNow_`. Five rows rather than one,
   because a sheet opened to write a message has nothing else on it to make room for. */
function messageSheet(to, toId) {
  openSheet('Message ' + to, msgForm_(to, toId,
    'One message every five minutes. It goes to their e-mail and appears in Messages for both '
  + 'of you.', 5));
}

on('msg-open', el => messageSheet(el.dataset.to, el.dataset.id));

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
let MSG_PENDING = [];
let MSG_SEQ = 0;
/* What is queued to go with the next message, per conversation. Held here rather than in the DOM so a
   repaint — the poll, a sign-in — does not drop somebody's chosen photographs. */
const MSG_QUEUE = {};

/* THE CAPS, IN BYTES, AND THE SERVER HOLDS THE SAME ONES (`MSG_FILE_MAX`, `MSG_FILES_MAX` and
   `MSG_FILES_COUNT` in content.gs). Checked here so a person is told when they CHOOSE a file rather
   than after a minute of upload. 32MB rather than a round 45 because the files travel as base64,
   four thirds of their size, and Apps Script takes about 50MB in one POST — a larger message would be
   refused by Google with an HTML page rather than by the handler with a sentence. */
const MSG_CAP_ = { file: 20 * 1048576, total: 32 * 1048576, count: 6 };

const msgKey_ = (to, toId) => String(toId || to || '');
const msgMB_ = n => (n / 1048576).toFixed(n < 10 * 1048576 ? 1 : 0) + 'MB';

/* A photograph over a couple of megabytes is redrawn through `camItemOf_` — the same 1600px the
   camera uses — because a camera roll's original is four megabytes for a bubble 280px wide. Anything
   else goes as it is. Never rejects: a file that cannot be read at all comes back `null`, and
   `msgPost_` SAYS SO rather than sending without it.

   A PHOTOGRAPH THE BROWSER CANNOT DRAW GOES AS IT IS. `camItemOf_` answers `null` when the image will
   not decode — a HEIC in Chrome, Firefox or Android is exactly that — and this used to hand the
   `null` straight on, so a four-megabyte iPhone photograph chosen on a laptop was dropped from the
   message without a word and the words went alone. The redraw is a saving, not a condition: when it
   cannot be had, the original is read and sent, and Drive's own thumbnail draws it in the bubble. */
function msgRead_(q) {
  const f = q.file;
  const asIs = () => new Promise(done => {
    const r = new FileReader();
    r.onload = () => done({ name: f.name || 'file', type: f.type || 'application/octet-stream',
                            data: String(r.result || '') });
    r.onerror = () => done(null);
    try { r.readAsDataURL(f); } catch (e) { done(null); }
  });
  if (/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type) && f.size > 2 * 1048576
      && typeof camItemOf_ === 'function') {
    return camItemOf_(f).then(it => it && it.data
      ? { name: String(f.name || 'photo').replace(/\.\w+$/, '') + '.jpg', type: 'image/jpeg', data: it.data }
      : asIs());
  }
  return asIs();
}

function msgQueueHtml_(key) {
  const q = MSG_QUEUE[key] || [];
  return q.map((a, i) => `<span class="msg-chip">${
      /^image\//.test(a.type) ? `<img src="${esc(a.url)}" alt="">` : `<b>${esc(msgFileMark_(a))}</b>`}
    <span class="msg-chip-name">${esc(a.name)}</span>
    <button class="msg-chip-x" data-do="msg-unqueue" data-k="${esc(key)}" data-i="${i}"
      aria-label="Remove ${esc(a.name)}">×</button></span>`).join('');
}
function msgQueueDraw_(form) {
  const key = form && form.dataset.k;
  const box = form && form.querySelector('.msg-queue');
  if (box) box.innerHTML = msgQueueHtml_(key);
}

/* The file picker answers with `change`, which the `data-do` dispatcher does not listen for. */
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.msg-file-in')) return;
  const form = inp.closest('.msg-form');
  const key = form && form.dataset.k;
  if (!key) return;
  const q = MSG_QUEUE[key] = MSG_QUEUE[key] || [];
  [].slice.call(inp.files || []).forEach(f => {
    const total = q.reduce((n, a) => n + a.size, 0);
    if (q.length >= MSG_CAP_.count) { toast('Up to ' + MSG_CAP_.count + ' files in one message.'); return; }
    /* A CLIP IS TOLD HOW TO FIT. 20MB is about twenty seconds of a phone's 1080p video — the owner's
       "i cant send … videos" was mostly this — and "over 20MB" alone leaves somebody to work out
       that trimming is the answer. The cap itself is the server's and stays. */
    if (f.size > MSG_CAP_.file) {
      toast(f.name + ' is ' + msgMB_(f.size) + ' — over the 20MB a file can be.'
        + (msgKind_(f) === 'video' ? ' Trim the clip to about 20 seconds and choose it again.' : ''));
      return;
    }
    if (total + f.size > MSG_CAP_.total) { toast('That would be over 32MB in one message — send it on its own.'); return; }
    q.push({ file: f, name: f.name || 'file', type: f.type || '', size: f.size,
             url: URL.createObjectURL(f) });
  });
  inp.value = '';
  msgQueueDraw_(form);
});

on('msg-attach', el => {
  const inp = el.closest('.msg-form') && el.closest('.msg-form').querySelector('.msg-file-in');
  if (inp) inp.click();
});
on('msg-unqueue', el => {
  const q = MSG_QUEUE[el.dataset.k] || [];
  const gone = q.splice(+el.dataset.i, 1)[0];
  if (gone) { try { URL.revokeObjectURL(gone.url); } catch (e) {} }
  msgQueueDraw_(el.closest('.msg-form'));
});

/* THE COMPOSER GROWS WITH WHAT IS TYPED. `field-sizing: content` does this in Chromium and nowhere
   else, and Safari is where most of these messages are written. Capped by the stylesheet's own
   `max-height`, after which it scrolls. */
document.addEventListener('input', e => {
  const b = e.target;
  if (!b || !b.matches || !b.matches('.msg-text')) return;
  b.style.height = 'auto';
  b.style.height = b.scrollHeight + 2 + 'px';
});
/* ENTER SENDS ON A KEYBOARD AND NEVER ON A PHONE. On a phone the return key is the only way to start
   a new line, and a message sent half-written because somebody wanted a paragraph break is worse than
   one more tap. `pointer: fine` is the test for a real keyboard beside a real mouse. */
document.addEventListener('keydown', e => {
  const b = e.target;
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing || !b || !b.matches || !b.matches('.msg-text')) return;
  if (!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
  const go = b.closest('.msg-form') && b.closest('.msg-form').querySelector('.msg-go');
  if (go) { e.preventDefault(); go.click(); }
});

function msgPost_(p) {
  p.state = 'sending'; p.err = ''; p.why = '';
  /* SENT, SO NOT A DRAFT ON ANY OTHER PAGE — a reload while the server is still answering drew these
     words back in the composer, after the server had them, for a second Send (`draftSent_`, data.js). */
  try { if (typeof draftSent_ === 'function') draftSent_('msg', p.withId, p.body); } catch (e) {}
  const files = p.queue.length ? Promise.all(p.queue.map(msgRead_)) : Promise.resolve([]);
  return files.then(read => {
    /* ---------- A FILE THAT COULD NOT BE READ IS NEVER LEFT OUT IN SILENCE ------------------------
       `list.filter(Boolean)` WAS THE WHOLE OF IT: an unreadable file vanished and the message went
       without it, saying "Sent". Now the rest still go — one bad file does not hold up the other
       five — and the one that could not be read goes BACK IN THE BOX with its name said, so it is
       somewhere a person can see it and decide, not nowhere. Nothing readable and nothing typed is
       a refusal that names it. */
    const lost = p.queue.filter((q, i) => !read[i]);
    const list = read.filter(Boolean);
    if (lost.length) {
      const names = lost.map(q => q.name).join(', ');
      if (!list.length && !p.body) throw new Error(names + ' could not be read on this phone.');
      p.queue = p.queue.filter((q, i) => read[i]);
      p.attachments = (p.attachments || []).filter((a, i) => read[i]);
      MSG_QUEUE[p.withId] = (MSG_QUEUE[p.withId] || []).concat(lost);
      toast(names + ' could not be read, so ' + (lost.length === 1 ? 'it is' : 'they are')
        + ' back in the box — the rest is going.');
    }
    return send({ action: 'sendMessage', name: USER.name, personId: USER.personId,
                  to: p.withName, toId: p.withId, body: p.body, files: list });
  }).then(d => {
    p.state = 'sent'; p.id = (d && d.id) || '';
    /* THE SERVER HAS IT, SO THE DRAFT GOES — unless the box has been written in again since Send. */
    try { if (typeof draftSentDone_ === 'function') draftSentDone_('msg', p.withId, p.body); } catch (e) {}
    toast(p.inSheet ? 'Sent to ' + p.withName : 'Sent');
    return loadMessages().then(() => {
      if (!MSG_FAILED) {
        MSG_PENDING = MSG_PENDING.filter(x => x !== p);
        p.queue.forEach(a => { try { URL.revokeObjectURL(a.url); } catch (e) {} });
      }
    });
  }).catch(err => {
    p.state = 'failed';
    /* NOT SENT, SO A DRAFT AGAIN — kept for a reload, as the bubble keeps it for this page. */
    try { if (typeof draftSentBack_ === 'function') draftSentBack_('msg', p.withId, p.body); } catch (e) {}
    /* The server's sentence says what to do — "one message every five minutes — 3 to go" — so it is
       what is shown, rather than a "Not sent" that throws that away. */
    p.err = String((err && err.message) || 'Not sent.');
    /* `why: 'files'` — the server refused the PHOTOGRAPHS, not the message, so the bubble can offer
       the words on their own. Read off the reply `send()` hangs on the error, never off the wording. */
    p.why = String((err && err.reply && err.reply.why) || '');
    if (p.inSheet) toast(p.err);
  }).then(() => dmRedraw_(p.withId || p.withName));
}

/* Repaint the column and stay on the conversation somebody is in. A new message moves its thread to
   the front, so without this the page index stays put and the screen shows SOMEBODY ELSE'S thread
   after you press send — the conversation you wrote in replaced by the next one down. */
function dmRedraw_(key) {
  if (typeof paint !== 'function' || !$('s-dm')) return;
  paint('dm');
  const at = messageThreads_().findIndex(t => t.id === key);
  if (at >= 0 && typeof goPage === 'function' && AT === 'dm') { try { goPage('dm', at, true); } catch (e) {} }
  setTimeout(() => { if (typeof dmFoot_ === 'function') dmFoot_(); }, 0);
}

on('msg-send', el => {
  /* THE NEAREST FORM, not an id: the Messages column draws one composer per conversation, and an id
     would hand every Send button the first box on the page — a reply posted to somebody else. */
  const form = el.closest ? el.closest('.msg-form') : null;
  const box  = form ? form.querySelector('.msg-text') : null;
  const said = form ? form.querySelector('.msg-said') : null;
  const text = ((box && box.value) || '').trim();
  const key  = msgKey_(el.dataset.to, el.dataset.id);
  const queue = (MSG_QUEUE[key] || []).slice();
  if (!text && !queue.length) { box && box.focus(); return; }
  if (!USER) { if (said) said.textContent = 'Sign in first.'; return; }
  if (text.length > 2000) { toast('That is longer than a message should be — 2,000 characters.'); return; }

  const p = {
    tmp: 'tmp' + (++MSG_SEQ), mine: true, read: true, state: 'sending',
    withId: el.dataset.id || el.dataset.to, withName: el.dataset.to,
    fromName: USER.name, body: text, atMs: Date.now(), at: '',
    attachments: queue.map(a => ({ url: a.url, type: a.type, name: a.name })),
    queue: queue, inSheet: !!(form && form.closest('#sheet')),
  };
  MSG_PENDING.push(p);
  delete MSG_QUEUE[key];
  if (box) { box.value = ''; box.style.height = ''; }
  if (p.inSheet) { closeSheet(); toast('Sending to ' + p.withName + '…'); }
  dmRedraw_(p.withId);
  msgPost_(p);
});

on('msg-retry', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p) return;
  p.state = 'sending'; p.err = '';
  dmRedraw_(p.withId);
  msgPost_(p);
});
/* ---------- THE WORDS WITHOUT THE PHOTOGRAPHS -----------------------------------------------------
   OFFERED ONLY WHEN THE SERVER SAID THE FILES WERE THE PROBLEM (`why: 'files'`) — no column for them
   yet, or a deployment not allowed to write to Drive — and only when something was typed. The site
   decided a message goes whole or not at all (see `msgAttachSave_`), so the words are not sent behind
   anybody's back; this is the person choosing to.
   THE FILES GO BACK IN THE BOX, NOT THE BIN. "Never silently drop a file": they wait in the composer
   for the next message, where Remove can still take them out. */
on('msg-words', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p || !p.body) return;
  if (p.queue.length) MSG_QUEUE[p.withId] = (MSG_QUEUE[p.withId] || []).concat(p.queue);
  p.queue = []; p.attachments = [];
  p.state = 'sending'; p.err = ''; p.why = '';
  dmRedraw_(p.withId);
  msgPost_(p);
});
on('msg-drop', el => {
  const p = MSG_PENDING.find(x => x.tmp === el.dataset.k);
  if (!p) return;
  MSG_PENDING = MSG_PENDING.filter(x => x !== p);
  /* What was typed and chosen goes back in the composer rather than being thrown away with the
     bubble — Remove is "I will write it differently", not "I did not mean any of it". */
  const key = p.withId;
  if (p.queue.length) MSG_QUEUE[key] = (MSG_QUEUE[key] || []).concat(p.queue);
  dmRedraw_(key);
  if (p.body) setTimeout(() => {
    const host = $('s-dm');
    const box = host && [].slice.call(host.querySelectorAll('.msg-form'))
      .filter(f => f.dataset.k === key).map(f => f.querySelector('.msg-text'))[0];
    if (box && !box.value) box.value = p.body;
  }, 0);
});

/* ---------- AND MARKING THEM READ, WHICH NOTHING HAS EVER DONE -----------------------------------
   `readMessage` IS THE THIRD DOOR WITH NO HANDLE. `messageThreads_` counts a message unread when it
   has no `read_at`, and only the server can write that cell — so the badge beside a conversation
   could only ever have gone up. A count that never falls stops being a count and becomes decoration
   within about a day.

   ONE CALL PER MESSAGE, and only for the ones that are actually unread and actually yours: the
   server refuses anybody else's, so asking about them would be a round trip to be told no.

   NOTHING WAITS FOR IT. The screen has already drawn; this is bookkeeping, and a failed round trip
   leaves the message unread, which is true rather than wrong. */
function markRead_(msgs) {
  if (!USER) return;
  (msgs || []).filter(m => m && !m.mine && !m.read && m.id).forEach(m => {
    m.read = true;                                   /* so a redraw before the reply does not re-ask */
    /* ---------- AND WHICH ONES THEY WERE STAYS ON THE SCREEN -----------------------------------
       THE OUTLINE NEVER SHOWED ON THE MESSAGES COLUMN. `dmPages_` marks a thread read BEFORE it
       renders it — drawing is reading, see the note there — so by the time `messagesHtml_` asked
       `!m.read` every message already said yes, and the card's head said "2 new" over a thread
       with nothing in it marked new. `fresh` is "this was unread when you arrived": it lives on
       the object `loadMessages` will replace, so it lasts exactly until the next answer from the
       server changes something, which is the moment it stops being news. */
    m.fresh = true;
    api({ action: 'readMessage', name: USER.name, personId: USER.personId, messageId: m.id })
      .catch(() => { m.read = false; });
  });
}

/* THE EMPTY INBOX SAYS HOW TO START ONE. There is no "new message" button on this column — the
   picker for WHO is a person's own card, which is the decision recorded over `messageSheet` — so a
   person looking at an empty Messages column had been told where messages appear and not how one
   begins. One clause, naming the door that exists. */
const emptyMessages_ = `<p class="empty">Nothing yet.<br><span class="faint">To write to a tutor,
     open their card and press Message.</span></p>`;

/* ---------- ONE THREAD PER PERSON ------------------------------------------------------------------
   EVERY MESSAGE WAS IN ONE LIST. A note from a tutor about Tuesday and a note from another parent
   about splitting a class sat in one column, sorted by time, with nothing but a name under each to
   say which conversation you were reading. That is a log, not a chat.

   `withId` IS THE THREAD. The server now says who the other person is on every message — see the
   messages handler in dopost.gs — so grouping is a fact from the sheet rather than a guess from a
   name string.

   MOST RECENT FIRST, because a thread nobody has written to in a month is not the one you opened
   the app for. */
/* When a message was sent, as a number: the server's `15/09/26 18:20`, the fixture's ISO and a
   pending bubble's own clock all come through here, because sorting their STRINGS put 16 September
   below 9 September — day-first dates do not sort as text. */
function msgTime_(m) {
  if (m && m.atMs) return m.atMs;
  const d = typeof parseWhen === 'function' ? parseWhen(m && m.at) : null;
  return d && !isNaN(d) ? d.getTime() : 0;
}
function messageThreads_() {
  const by = {};
  (MESSAGES || []).concat(MSG_PENDING).forEach(m => {
    const k = m.withId || m.withName || '?';
    (by[k] = by[k] || { id: k, name: m.withName || 'Someone', msgs: [] }).msgs.push(m);
  });
  const out = Object.keys(by).map(k => by[k]);
  out.forEach(t => {
    /* STABLE BY TIME, and a pending bubble always last — it is the newest thing in the thread even
       when the server's clock and this phone's disagree by a minute. */
    t.msgs.sort((a, b) => (!!a.tmp - !!b.tmp) || (msgTime_(a) - msgTime_(b)));
    t.unread = t.msgs.filter(m => !m.mine && !m.read).length;
    t.last = t.msgs[t.msgs.length - 1];
  });
  return out.sort((a, b) => msgTime_(b.last) - msgTime_(a.last));
}

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

/* `fillMessages` WAS HERE — it filled the single `#msg-body` on `You` with every message at once.
   `fillThread_` above replaces it, one conversation at a time, into the widget that asked. */

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
/* ---------- A DAY, AND A TIME ------------------------------------------------------------------
   The day is said ONCE, on a line of its own, where the conversation crosses midnight — so the line
   under a bubble can be the time alone. Printing `15/09/26 18:20` under every run was the date
   repeated down the whole thread. */
function msgDay_(ms) {
  if (!ms) return '';
  const d = new Date(ms), now = new Date();
  const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const gap = Math.round((day(now) - day(d)) / 864e5);
  if (gap === 0) return 'Today';
  if (gap === 1) return 'Yesterday';
  const opt = { weekday: 'short', day: 'numeric', month: 'short' };
  if (d.getFullYear() !== now.getFullYear()) opt.year = 'numeric';
  try { return d.toLocaleDateString('en-GB', opt); } catch (e) { return d.toDateString(); }
}
function msgClock_(ms, raw) {
  if (!ms) return String(raw || '');
  const d = new Date(ms);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/* ---------- PICTURE, CLIP OR FILE: THE TYPE, AND THE NAME WHEN THERE IS NO TYPE ------------------
   A PHONE DOES NOT ALWAYS SAY. A clip picked through "Browse", or shared in from another app, can
   come with an empty `type` — and a bubble that tested the type alone drew it as a chip saying "MOV"
   rather than a clip that plays. The server types such a file by its name before it is stored
   (`msgTypeOf_` in content.gs); this is the same reading for the pending bubble, which has not been
   to the server yet, and for a row stored before that. */
function msgKind_(a) {
  const t = String((a && a.type) || '').toLowerCase();
  if (/^image\//.test(t)) return 'image';
  if (/^video\//.test(t)) return 'video';
  if (t && t !== 'application/octet-stream') return 'file';
  const ext = (String((a && a.name) || '').toLowerCase().match(/\.([a-z0-9]{2,5})$/) || [])[1] || '';
  if (/^(jpe?g|png|gif|webp|heic|heif)$/.test(ext)) return 'image';
  if (/^(mov|mp4|m4v|webm|3gp)$/.test(ext)) return 'video';
  return 'file';
}

/* A FILE'S MARK — its extension, because "PDF" and "DOCX" say more than any one icon would. */
function msgFileMark_(a) {
  const ext = (String(a.name || '').match(/\.(\w{1,5})$/) || [])[1];
  return ext ? ext.toUpperCase() : (String(a.type || '').split('/')[1] || 'FILE').slice(0, 4).toUpperCase();
}

/* ---------- WHAT WAS SENT WITH IT --------------------------------------------------------------
   A picture is drawn, a clip plays in place, and anything else is a chip naming the file that opens
   it. `pic()` and `postVidSrc_` are the feed's own readers of a Drive address, so a photograph in a
   message and one on a post come through one door — and the clip carries `post-vid` so the feed's
   `error` listener turns a clip Drive will not hand over into a link rather than a black box. A
   pending bubble's addresses are `blob:` URLs, which both readers pass through untouched. */
function msgAttachHtml_(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return `<div class="msg-att">${list.map(a => {
    const url = String(a.url || '');
    const kind = msgKind_(a);
    if (kind === 'image') {
      return `<a class="msg-pic" href="${esc(url)}" target="_blank" rel="noopener"
        aria-label="Open ${esc(a.name || 'the photo')}">
        <img src="${esc(pic(url))}" alt="${esc(a.name || 'photo')}" loading="lazy"></a>`;
    }
    if (kind === 'video') {
      return `<video class="msg-vid post-vid" src="${esc(/^blob:/.test(url) ? url : postVidSrc_(url))}"
        data-open="${esc(url)}" controls playsinline preload="metadata"></video>`;
    }
    return `<a class="msg-file" href="${esc(url)}" target="_blank" rel="noopener">
      <b>${esc(msgFileMark_(a))}</b><span>${esc(a.name || 'a file')}</span></a>`;
  }).join('')}</div>`;
}

/* ---------- AN ADMIN'S REFUSAL CARRIES THE FIX, AND THE FIX IS AN ADDRESS ------------------------
   The consent screen, or the site's own `?setup=1`. As text in a red line it is something to copy
   out by hand on a phone; as a link inside the sentence it is a 14px target. So each one becomes one
   more control beside Retry — 44px, named for where it goes — and the sentence stays the server's.
   The scope names Google's error quotes (`.../auth/drive`) are addresses too and go nowhere useful,
   so they stay words. At most two: a refusal is not a page of links. */
function msgFixUrls_(text) {
  return (String(text || '').match(/https?:\/\/[^\s<>]+/g) || [])
    .map(u => u.replace(/[.,;:)]+$/, ''))
    /* A SCOPE IS NAMED BY WHERE IT STARTS, not by containing the words: the consent screen's own
       address carries `scope=https://www.googleapis.com/auth/drive` in its query. */
    .filter(u => /^https:\/\//.test(u) && !/^https:\/\/www\.googleapis\.com\/auth\//.test(u))
    .slice(0, 2);
}
function msgFixLinks_(text) {
  return msgFixUrls_(text).map(u => `<a class="msg-act" href="${esc(u)}" target="_blank" rel="noopener">${
    /\?setup=1/.test(u) ? 'Open ?setup=1' : /accounts\.google\.com/.test(u) ? 'Allow it' : 'Open the link'}</a>`)
    .join('');
}
/* AND THE SENTENCE WITHOUT THEM. An address that has become a control is not also printed — two
   hundred characters of consent URL broken across eight lines of a 320px bubble, above a button
   that goes to the same place. A line that was only a label for it ("Consent link: …") goes; one
   that used it in a sentence ("Open … once") says where it went instead. */
function msgFailSaid_(text) {
  let t = String(text || '');
  msgFixUrls_(t).forEach(u => {
    t = t.split('\n').filter(line => {
      const at = line.indexOf(u);
      return !(at > 0 && /^[^:]{1,40}:\s*$/.test(line.slice(0, at)) && !line.slice(at + u.length).trim());
    }).join('\n').split(u).join('the button below');
  });
  return t.trim();
}

/* ---------- THE THREAD --------------------------------------------------------------------------
   Runs, as before: four messages in a row from one person are one turn, so only the last carries
   the tail and the time. A day line wherever the date changes, and a pending message says where it
   has got to — `sending…`, or the server's refusal with a Retry beside it. */
const messagesHtml_ = ms => {
  let lastDay = '';
  return (ms || []).map((m, i, all) => {
    const mine = !!m.mine;
    const t = msgTime_(m);
    const dayWord = msgDay_(t);
    const newDay = dayWord && dayWord !== lastDay;
    if (dayWord) lastDay = dayWord;
    const prev = all[i - 1], next = all[i + 1];
    const nextDay = next ? msgDay_(msgTime_(next)) : '';
    const runTop = newDay || !prev || !!prev.mine !== mine;
    const runEnd = !next || !!next.mine !== mine || (nextDay && nextDay !== dayWord)
                || !!m.tmp !== !!next.tmp;
    const words = String(m.body || '').trim();
    const state = m.state === 'failed'
      ? `<p class="msg-when msg-fail"><span class="msg-fail-why">Not sent — ${esc(msgFailSaid_(m.err) || 'try again')}</span>
           <button class="msg-act" data-do="msg-retry" data-k="${esc(m.tmp)}">Retry</button>${
           m.why === 'files' && words && (m.queue || []).length
             ? `<button class="msg-act" data-do="msg-words" data-k="${esc(m.tmp)}">Words only</button>` : ''}
           <button class="msg-act" data-do="msg-drop" data-k="${esc(m.tmp)}">Remove</button>${
           msgFixLinks_(m.err)}</p>`
      : m.state === 'sending' ? `<p class="faint msg-when">sending…</p>`
      : m.tmp ? `<p class="faint msg-when">sent</p>` : '';
    return `${newDay ? `<p class="msg-day"><span>${esc(dayWord)}</span></p>` : ''}
      <div class="msg${mine ? ' mine' : ''}${runTop ? ' run-top' : ''}${
        runEnd ? ' run-end' : ''}${!mine && (!m.read || m.fresh) ? ' unread' : ''}${
        m.state ? ' is-' + m.state : ''}">
      <div class="msg-bub${words ? '' : ' is-bare'}">${msgAttachHtml_(m.attachments)}${
        words ? `<p class="msg-body-text">${mark(words)}</p>` : ''}</div>
      ${state || (runEnd ? `<p class="faint msg-when">${esc(mine ? 'you' : (m.fromName || 'them'))} · ${
        esc(msgClock_(t, m.at))}</p>` : '')}
    </div>`;
  }).join('');
};

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
/* ---------- WHAT IS HALF WRITTEN SURVIVES A RELOAD (docs/history/317) -----------------------------------
   THE BOX IS A DRAFT (`draftAttr_`, data.js), per conversation and per person: kept as it is typed,
   drawn back into the composer by every redraw and every reload, and dropped only when the server
   has the message (`msgPost_`). NOT WHILE THE SAME WORDS ARE A BUBBLE ON THEIR WAY — Send empties the
   box and the redraw that follows must not put them back; after a reload there is no bubble, and a
   message that never went is in the box again rather than nowhere. */
function msgDraft_(k) {
  if (typeof draftVal_ !== 'function') return '';
  const d = draftVal_('msg', k, '');
  return d && MSG_PENDING.some(p => p.withId === k && p.body === d.trim()) ? '' : d;
}
function msgForm_(to, toId, note, rows) {
  const k = msgKey_(to, toId);
  return `<div class="msg-form" data-k="${esc(k)}">
    <div class="msg-queue">${msgQueueHtml_(k)}</div>
    <button class="btn quiet msg-clip" data-do="msg-attach"
      aria-label="Attach a photo, video or file">＋</button>
    <input type="file" class="msg-file-in" multiple hidden aria-label="Choose files to send">
    <textarea class="msg-text" rows="${rows || 1}" maxlength="2000"
      placeholder="Message…" aria-label="Message ${esc(to)}"${draftAttr_('msg', k)}>${esc(msgDraft_(k))}</textarea>
    <button class="btn msg-go" data-do="msg-send"
      data-to="${esc(to)}" data-id="${esc(toId || '')}">Send</button>
    <p class="faint msg-said">${esc(note || '')}</p>
  </div>`;
}

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
let UPLOADS_SAID = null;

function uploadsHtml_(d) {
  const tile = `<div class="tile-row">${tile_({ icon: 'tick', label: 'Check uploads', note: 'nothing kept',
    act: 'uploads-check', tone: 'admin' })}</div>`;
  if (!d) {
    return tile + `<p class="faint up-said">Whether a photo or a clip sent in a message can be kept:
      the Ledger's column, the Drive folder and what this deployment may do. One test file is made,
      shared and binned.</p>`;
  }
  if (d.error) return tile + `<p class="up-said up-bad">${esc(d.error)}</p>`;
  const rows = (d.checks || []).map(c => `<li class="up-row ${c.ok ? 'is-ok' : 'is-bad'}">
      <b class="up-mark" role="img" aria-label="${c.ok ? 'yes' : 'no'}">${c.ok ? '✓' : '✗'}</b>
      <span><span class="up-k">${esc(c.label)}</span>
      <span class="up-v">${esc(c.said)}</span></span></li>`).join('');
  const steps = (d.steps || []).map(st => `<li>${esc(st.text)}</li>`).join('');
  /* THE ADDRESSES A STEP NEEDS ARE TILES UNDER THE LIST, not links in its sentence — a link in a
     line of 0.78rem type is a 14px target, and a tile is 44px from the one renderer that guards
     where it may open. `href` is the server's (the consent screen) or this app's own address with
     `?setup=1`, which the server cannot always name: `ScriptApp.getService()` is blank from some
     deployments. `tile_` itself refuses anything that is not an absolute http(s) address. */
  const go = (d.steps || []).map(st => {
    const href = String(st.href || (st.setup && typeof API === 'string' ? API + '?setup=1' : ''));
    return href ? tile_({ icon: 'open', href: href,
      label: st.setup ? 'Open ?setup=1' : 'Allow it', note: st.setup ? 'adds the column' : 'consent' }) : '';
  }).filter(Boolean).join('');
  return tile + `<ul class="up-list">${rows}</ul>
    <p class="up-said ${d.ok ? 'up-good' : 'up-bad'}">${d.ok
      ? 'Ready — photos, videos and files can be sent in messages.'
      : 'Not yet. In this order:'}</p>
    ${steps ? `<ol class="up-steps">${steps}</ol>` : ''}
    ${go ? `<div class="tile-row">${go}</div>` : ''}
    <p class="faint up-ver">backend ${esc(d.version || '—')}</p>`;
}

/* EVERY `.up-box` ON THE PAGE — a class rather than the id alone, for the reason `cart-box` gives:
   two copies of one widget under one id is the `$('msg-text')` fault. */
function uploadsPaint_() {
  document.querySelectorAll('.up-box').forEach(b => { b.innerHTML = uploadsHtml_(UPLOADS_SAID); });
  /* A CARD THAT GREW IS PLACED AGAIN — "every grower in the app already calls this", in the note
     over `paneWatch_`. The answer is four rows and up to five steps under a card that was a tile
     and a sentence, and `check/ui.js` found the column's pane 2,386px off the glass at 768 the first
     time the state drew it. Instant, and only for the column in front. */
  if (typeof placeCells === 'function' && (AT === 'tools' || AT === 'saved')) {
    try { placeCells('y', true, 0, AT); } catch (e) {}
  }
}

on('uploads-check', el => {
  if (!isAdmin()) return;
  /* NOT DEPLOYED YET IS THE FIRST ANSWER, and the commonest one on the day this ships: the payload
     lists what the live backend can do, so a backend without the action says so here rather than
     coming back "That action is not recognised". */
  const f = (DATA && DATA.features) || [];
  if (f.length && f.indexOf('checkUploads') < 0) {
    UPLOADS_SAID = { error: 'The live backend is ' + (DATA.version || 'an older version') + ' and has no '
      + 'Check uploads yet. Sync backend/ from GitHub, then Deploy → Manage deployments → New version.' };
    uploadsPaint_();
    return;
  }
  const box = el.closest('.up-box');
  send_({ action: 'checkUploads', name: USER.name, personId: USER.personId },
        { button: el, where: box && box.querySelector('.up-said') })
    .then(d => { UPLOADS_SAID = d; uploadsPaint_(); })
    .catch(err => { UPLOADS_SAID = { error: String((err && err.message) || err) }; uploadsPaint_(); });
});

/* `on('messages')` was here — a second way to see the same thread, opened in a sheet. Messages
   are a WIDGET, reached from Tools, and that route calls `fillMessages` directly; nothing has ever
   carried `data-do="messages"`, so this copy has never opened. `messagesHtml_` above is the shared
   renderer and stays — the widget uses it. */


/* ---------- YOUR OWN DETAILS ---------------------------------------------------------------------
   Built from the backend's own field list, exactly as the resource editor is — `profileFields` IS
   the allow-list the server checks writes against, so a form built from it cannot offer a field
   the server will refuse or miss one it would accept.
--------------------------------------------------------------------------------------------- */
/* ---------- ADDING A CHILD, AND ANSWERING WHEN SOMEBODY ADDS YOU ----------------------------------
   THE BACKEND FOR THIS WAS ALREADY WRITTEN AND UNREACHABLE. `claimChild` and `answerClaim` both
   existed, both correct, and nothing in the app called either — so a parent could not ask and a
   child could not have been asked. `check-doors` names an unreachable handler the moment a door
   appears for it; there had never been a door, so there was nothing to name.

   TWO NAMES, NOT ONE. The backend matches on first AND last name and refuses when it finds none or
   more than one — asking for a single field would send it a string it cannot split reliably, and
   "Mary Anne Smith" is where that goes wrong. */
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
function claimCard_(c) {
  return `<div class="card">
    <h3>${esc(c.from)} says they are your parent</h3>
    <p class="sub">Say yes and they will be able to book sessions for you and see how you are
      getting on. Say no and nothing happens.</p>
    <div class="btn-row">
      <button class="btn" data-do="claim-yes" data-row="${esc(c.rowIndex)}">Yes</button>
      <button class="btn quiet" data-do="claim-no" data-row="${esc(c.rowIndex)}">No</button>
    </div>
  </div>`;
}

/* WHO MAY ASK — the same test the tile carried, kept in one place so the card and its handler
   cannot disagree about it. */
function mayAddChild_() {
  const held = typeof heldRoles === 'function' ? heldRoles() : [];
  return held.indexOf('client') !== -1 || held.indexOf('parent') !== -1 || held.indexOf('admin') !== -1;
}

/* THE CARD, on the Settings column — see `settingsPages_`. It was a sheet opened by a tile; the
   words are the sheet's own. NO IDS ON THE BOXES: the handler reads the card the button is in, which
   is what `me-save` does, so a second copy of this card anywhere can never be the one it reads. */
function childCard_() {
  return `<div class="card kid-card">
    <h3>Add your child</h3>
    <p class="sub">Their name as it is on their account. They will be asked to say yes before
      anything is linked.</p>
    ${/* DRAFTS UNTIL ASKED (data.js; docs/history/317) — a card on the Settings column is redrawn by a
          payload, and a reload lost what was typed. */''}
    <div class="f-row" style="--n:2">
      <label class="field"><input data-kid="first" placeholder="First name" autocomplete="off"${draftAttr_('kid-ask', 'first')} value="${esc(draftVal_('kid-ask', 'first'))}"></label>
      <label class="field"><input data-kid="last" placeholder="Last name" autocomplete="off"${draftAttr_('kid-ask', 'last')} value="${esc(draftVal_('kid-ask', 'last'))}"></label>
    </div>
    <button class="btn quiet" data-do="add-child-go">Ask them</button>
    <p class="faint">Nothing changes until they accept. If they say no, nothing happens and we do
      not tell them off.</p>
  </div>`;
}

on('add-child-go', el => {
  if (!USER) { toast('Sign in first'); return; }
  const card = (el && el.closest('.card')) || document;
  const box = k => card.querySelector('[data-kid="' + k + '"]');
  const first = ((box('first') || {}).value || '').trim();
  const last = ((box('last') || {}).value || '').trim();
  if (!first || !last) { toast('Both names, please'); return; }
  /* ---------- `send` TAKES ONE ARGUMENT AND THIS ONCE PASSED TWO, so nothing was ever asked -----
     THE SAME FAULT AS THE STAR AND AS `toggleSpot` BEFORE IT: the body on the wire was the string
     spread into indexed keys, the backend refused an action it could not read, and the sheet stayed
     open with no toast. Measured, not read, at the time.

     `send_` NOW RATHER THAN `send`, because the boxes are on a card rather than in a sheet: it
     locks them and the button while the request is in flight and says a refusal as a toast — the
     rule `send_`'s own note gives about backspacing a PIN that is already on the wire. */
  send_({
    action: 'claimChild',
    name: USER.name, personId: (USER && USER.personId) || '',
    firstName: first, lastName: last,
  }, { button: el, busy: 'Asking…' }).then(() => {
    if (box('first')) box('first').value = '';
    if (box('last')) box('last').value = '';
    ['first', 'last'].forEach(f => { try { draftDrop_('kid-ask', f); } catch (e) {} });
    toast('Asked. They will see it when they next sign in.');
    load();
  /* `heldBy_`: a refusal because the asker's own address is waiting redraws this as the held card. */
  }).catch(heldBy_);
});

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
let KID_MADE = { pid: '', name: '', handle: '', pin: '' };

/* THE SIGN-IN SLIP — the same paper wherever a handle and a PIN are handed to somebody: here, and in
   the New PIN sheet. Paper, so `--paper` and `--paper-ink`, never a literal. */
function pinSlip_(first, handle, pin) {
  return `<div class="pin-slip" aria-live="polite">
    <p class="pin-slip-k">${esc(first || 'They')} signs in with</p>
    <p class="pin-slip-v">@${esc(handle)}</p>
    <p class="pin-slip-k">and the PIN</p>
    <p class="pin-slip-v">${esc(pin)}</p>
  </div>`;
}

function childMakeCard_() {
  const mine = KID_MADE.pid && USER && KID_MADE.pid === String(USER.personId || '');
  const kidSurname = (USER && USER.profile && USER.profile.last_name) || '';
  return `<div class="card kid-card kid-make">
    <h3>Make your child's account</h3>
    <p class="sub">No email needed. They sign in with a handle we make for them and a PIN you
      choose.</p>
    ${/* THE NAMES ARE DRAFTS UNTIL THE ACCOUNT IS MADE (data.js; 317), the surname starting from the
          parent's own as it always did. NEVER THE PIN BELOW. */''}
    <div class="f-row" style="--n:2">
      <label class="field"><input data-kid-new="first" placeholder="First name" autocomplete="off"${draftAttr_('kid-new', 'first')} value="${esc(draftVal_('kid-new', 'first'))}"></label>
      <label class="field"><input data-kid-new="last" placeholder="Last name" autocomplete="off"
             value="${esc(draftVal_('kid-new', 'last', kidSurname))}"${draftAttr_('kid-new', 'last', kidSurname)}></label>
    </div>
    <label class="field"><span>a PIN for them — 4 to 8 digits</span>
      <input data-kid-new="pin" type="password" inputmode="numeric" autocomplete="new-password"></label>
    <button class="btn quiet" data-do="kid-make">Make their account</button>
    ${mine ? pinSlip_(KID_MADE.name, KID_MADE.handle, KID_MADE.pin)
             + '<p class="faint">Write it down or take a photo — the PIN is not shown again. We have '
             + 'emailed you the handle. They are on your account now.</p>'
           : '<p class="faint">Already has an account of their own? Add them on the next card.</p>'}
  </div>`;
}

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
function pendingAddr_() { return (USER && USER.pendingEmail) ? String(USER.pendingEmail) : ''; }

/* A TILE, because the link is a thing about your account, not a field on a form (CLAUDE.md). The same
   tile in both places, so a fix to its words is one fix. `send` is the mark that means the act. */
function resendTile_() {
  return tile_({ icon: 'send', label: 'Send the link again', note: 'to confirm your email', act: 'resend-link' });
}

/* ONE PARAGRAPH UNDER THE ROW — the house rule for a warning a tile has no room for. The address is in
   it: when it is a typo, the address is the whole of what is wrong, and the only place it shows. */
function mailHeldNote_() {
  const at = pendingAddr_();
  /* `overflow-wrap:anywhere` ON THE ADDRESS: it is one word with no space in it, and a long one at 320
     took the card sideways — the fault the dotted answer line paid for (check/states.js). */
  return at ? `<p class="faint mail-held" style="margin:.6rem 0 0">We will email you once you open the link
    we sent to <b style="overflow-wrap:anywhere">${esc(at)}</b>.</p>` : '';
}

/* ---------- A NEW ADDRESS WAITING TO BE PROVED, ON THE CARD IT WAS TYPED ON -----------------------------
   A confirmed account's new address is not written until the account, signed in, opens the link sent to
   it (`authMove*_` in booking.gs — a typo's owner holds the inbox and never the account). So the box shows
   the address that is waiting, and this paragraph says the two facts a person needs: it is not done, and
   which address still signs in. Under the row, as the house rule has it, beside "Send the link again" in
   the row — the person this is for is the one whose link went to spam. Both addresses in it: when the new
   one is a typo, seeing it written out is how it is caught. */
function movingNote_(p) {
  const to = p && p.email_moving ? String(p.email_moving) : '';
  if (!to) return '';
  const was = String((p && p.email) || '');
  return `<p class="faint mail-moving" style="margin:.6rem 0 0">Your email changes to
    <b style="overflow-wrap:anywhere">${esc(to)}</b> once you open the link we sent there, on a phone where you
    are signed in.${was ? ` Until then it is still <b style="overflow-wrap:anywhere">${esc(was)}</b> — sign in
    with that, or your handle. Type it back here to keep it.` : ''}</p>`;
}

/* WHERE "MAKE YOUR CHILD'S ACCOUNT" WOULD BE, for a parent whose address is still PENDING. Its own class
   and not `kid-make`: there is nothing to make on it, and what finds `.kid-make` is looking for the
   form. Drawn INSTEAD OF both child cards — the add-a-child form would be refused for the same reason,
   and two cards saying one sentence is one too many. */
function childHeldCard_() {
  return `<div class="card kid-card kid-held">
    <h3>Make your child's account</h3>
    <p class="sub">Open the link we emailed to <b style="overflow-wrap:anywhere">${esc(pendingAddr_())}</b>
      first, then you can add your child.</p>
    <div class="tile-row">${resendTile_()}</div>
  </div>`;
}

/* A REFUSAL THAT SAYS THE ADDRESS IS WAITING corrects the phone: a phone holding an old sign-in reply
   drew the form, and the server's answer is the newer fact. Stored, and the column redrawn, so the
   card the person is looking at turns into the one that says why. */
function heldBy_(err) {
  const d = err && err.reply;
  if (!USER || !d || d.why !== 'unconfirmed' || !d.pendingEmail) return;
  USER.pendingEmail = String(d.pendingEmail);
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  try { repaint(true); } catch (e) {}
}

on('resend-link', el => {
  if (!USER) { toast('Sign in first'); return; }
  send_({ action: 'resendLink', personId: USER.personId || '' }, { button: el })
    .then(d => {
      toast(d.message || 'A new link is on its way.');
      /* ALREADY CONFIRMED — on another phone, or by Google. The cards go with it, and a `myProfile` asked
         before this answer is not allowed to bring them back (`ACCOUNT_AT_`). */
      if (d.why === 'confirmed' && USER) {
        accountChanged_();
        USER.pendingEmail = '';
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        try { repaint(true); } catch (e) {}
      }
    })
    .catch(() => {});      // `send_` has already said why
});

on('kid-make', el => {
  if (!USER) { toast('Sign in first'); return; }
  const card = (el && el.closest('.card')) || document;
  const box = k => card.querySelector('[data-kid-new="' + k + '"]');
  const val = k => ((box(k) || {}).value || '').trim();
  const first = val('first'), last = val('last'), pin = val('pin');
  if (!first || !last) { toast('Their first and last name, please'); return; }
  if (!REG_PIN.test(pin)) { toast('A PIN is 4 to 8 digits, and nothing else.'); return; }
  send_({ action: 'makeChild', personId: USER.personId || '', firstName: first, lastName: last, pin },
        { button: el, busy: 'Making it…' })
    .then(d => {
      KID_MADE = { pid: String(USER.personId || ''), name: first, handle: String(d.handle || ''), pin };
      ['first', 'last'].forEach(f => { try { draftDrop_('kid-new', f); } catch (e) {} });
      toast(first + '\'s account is made — they sign in as @' + KID_MADE.handle + '.');
      /* `repaint(true)`: the card grows by a slip, so the column is placed again — see `answerClaim_`. */
      if (typeof AT !== 'undefined' && AT === 'settings') repaint(true); else STALE.settings = 1;
      load();
    })
    /* `send_` HAS SAID WHY; `heldBy_` turns a stale phone's form into the held card when the why is
       the address. */
    .catch(heldBy_);
});

/* ---------- A NEW PIN FOR YOUR CHILD, OR FOR ANYBODY IF YOU ARE AN ADMIN ----------------------------
   THE TILE IS ON THE CHILD'S CARD — the parent's family column, the admin's everyone column — because
   the PIN is about that person (a THING has tiles). PRESSING IT ASKS FIRST, in a sheet with its own
   button (a FORM has buttons): the child's old PIN stops working and every phone they are signed in on
   is signed out, which is not a thing a thumb scrolling past should do. The answer is the same slip as
   above, in the same sheet, once. `resetPin` decides who may; this draws the tile for the two people
   the server will say yes to and nobody else. */
on('kid-pin', el => {
  const id = el.getAttribute('data-id') || '', who = el.getAttribute('data-name') || 'them';
  if (!id) { toast('That account has no id yet — ask us.'); return; }
  openSheet('A new PIN for ' + who, `
    <p class="sub">Their old PIN stops working, and they are signed out everywhere. You will see the
      new one once, to give them.</p>
    <button class="btn" data-do="kid-pin-go" data-id="${esc(id)}" data-name="${esc(who)}">Make a new PIN</button>`);
});

on('kid-pin-go', el => {
  if (!USER) { toast('Sign in first'); return; }
  const id = el.getAttribute('data-id') || '';
  send_({ action: 'resetPin', personId: USER.personId || '', targetId: id },
        { button: el, busy: 'Making it…' })
    .then(d => {
      const body = $('sheet-body');
      if (body) body.innerHTML = pinSlip_(d.first || el.getAttribute('data-name'), d.handle, d.pin)
        + '<p class="faint">Write it down or read it to them — it is not shown again. They can change it '
        + 'under Settings once they are in.</p>'
        + '<button class="btn quiet" data-do="sheet-done">Done</button>';
    })
    .catch(() => {});
});
on('sheet-done', () => closeSheet());

/* YES AND NO ARE ONE HANDLER WITH A FLAG. Two handlers doing the same call with one word different
   is two places to fix when the call changes, and the second one is always the one forgotten. */
const answerClaim_ = (el, accept) => {
  /* THE THIRD OF THE THREE. Same shape, same silence — see `add-child-go` above. A parent pressed
     yes on their own child's request and nothing happened, on the one screen where "nothing
     happened" is indistinguishable from "it worked and the list has not refreshed yet". */
  if (!USER) { toast('Sign in first'); return; }
  const row = el.getAttribute('data-row');
  /* `send_` RATHER THAN `send`, for `add-child-go`'s reason: it locks both buttons while the answer
     is on the wire, so a second tap cannot answer twice, and it says a refusal as a toast. */
  send_({
    action: 'answerClaim',
    name: USER.name, personId: (USER && USER.personId) || '',
    rowIndex: row, accept: accept,
  }, { button: el, busy: accept ? 'Linking…' : 'Saying no…' }).then(() => {
    toast(accept ? 'Linked. They can book for you now.' : 'Turned down.');
    /* GONE FROM THE SCREEN NOW, not in fifteen seconds. The card is a request that has just been
       answered; leaving it up until the payload lands invites the second tap the server would
       refuse as "already answered". The family card it turns into arrives with the payload. */
    if (Array.isArray(DATA.claims)) DATA.claims = DATA.claims.filter(c => String(c.rowIndex) !== String(row));
    /* `repaint(true)`, NOT `paint`: a page has left the column, so it must be placed and its
       position clamped again — the Saved column's unstar records what a bare `paint` leaves. */
    if (typeof AT !== 'undefined' && AT === 'account') repaint(true); else STALE.account = 1;
    load();
  }).catch(() => {});
};
on('claim-yes', el => answerClaim_(el, true));
on('claim-no', el => answerClaim_(el, false));

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
/* WHAT THE LINE UNDER YOUR HANDLE SAYS AFTER A RANDOMISE — "You were @…" — kept as STATE and drawn
   from it, never left on the element. The first version wrote it into the line and then called
   `load()`, and the inbox and your own profile land a moment after the payload and each repaint this
   column: the line was back to its standing sentence before anybody had read it. The `REEL_HELD`
   rule, one card along — a mark put on the element by a press is a mark a repaint throws away while
   the state keeps it. For this session; a reload starts it again. KEYED BY THE PERSON, because a
   phone passed to somebody else who signs in on it must not tell them who THEY used to be. */
let HANDLE_SAID = { pid: '', text: '' };
function settingsPages_() {
  if (!USER) {
    /* THE COLUMN IS NAMED OFF `TABS` RATHER THAN WRITTEN OUT. `applyColumns_` takes every label
       from `data/settings/columns.json`, so "You" is a cell somebody can edit — and a sentence here
       spelling it out is a second place for that word to be wrong the afternoon it changes. */
    const you = (TABS.find(t => t.id === 'account') || {}).label || 'You';
    return [`<div class="card">
      <h3>Your settings</h3>
      <p class="sub">Sign in on ${esc(you)} and your details, your handle and your PIN are
        here.</p>
    </div>`];
  }

  /* THE SAME CHOICE THE SHEET MADE, unchanged: the backend says which fields a role may edit, and
     an admin too old a deployment to have been told still gets a few. */
  const role = roleOf(USER.role || '');
  const groups = (role === 'client' && DATA.clientFields && Object.keys(DATA.clientFields).length)
      ? DATA.clientFields
    : (role === 'student' && DATA.studentFields && Object.keys(DATA.studentFields).length)
      ? DATA.studentFields
    : (DATA.profileFields && Object.keys(DATA.profileFields).length)
      ? DATA.profileFields
    /* A backend too old to send it. The form still opens with what this file knows about — an
       admin who can edit nothing is worse than one who can edit a few things. */
    : { 'About you': ['first_name', 'last_name', 'photo'],
        'Where': ['borough', 'city'], 'Contact': ['email', 'phone'] };

  const p = USER.profile || {};
  const readonly = DATA.profileReadonly || [];

  /* ONE GROUP AT A TIME, THROUGH THE SAME WALK. `fieldsHtml` is handed `{ [g]: groups[g] }` rather
     than reimplemented per page — it is the one place that knows a group of hour codes is a week
     grid and everything else is a column of boxes, and a second walk here would be a second answer
     to that question. Its own note says so: "one walk now, so a group of hour codes becomes a
     timetable everywhere rather than only where somebody remembered." */
  const pages = Object.keys(groups).map(g => setHeldSay_(`<div class="card">
    <div class="me-form">${fieldsHtml({ [g]: groups[g] }, {
      /* A CARD'S TITLE IS AN `h3` — see the note over `fieldsHtml`. Each group is a card here, so
         the group's name IS that card's title rather than a divider inside it. */
      head: 'h3',
      attr: 'data-me',
      /* THE ADDRESS WAITING TO BE PROVED, in the address's box — see `movingNote_`. */
      value: f => (f === 'email' && p.email_moving) ? p.email_moving : (p[f] ?? ''),
      raw: p,
      readonly: readonly,
      /* The backend says which fields have a fixed set of answers, and `FIELD_LISTS_` answers for
         the two it has never been told about — see the note over it. */
      options: fieldOptions_,
    })}
      ${/* THE QUALIFICATIONS CARD HAS NO SAVE OF ITS OWN: every answer on it is saved the moment it
            is chosen, through the same `meSave_` — see `qualShelf_`. A Save at the foot of the card
            would be a second way to keep a change already kept, and the one somebody would wait to
            press. Only a card that is nothing but the shelf. */
        (groups[g] || []).length && (groups[g] || []).every(isQualField_) ? ''
        : `<div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'me-save' })}${
            (groups[g] || []).indexOf('email') !== -1 && p.email_moving ? resendTile_() : ''}</div>`}
      ${(groups[g] || []).indexOf('email') !== -1 ? movingNote_(p) : ''}
      <p class="faint me-said"></p></div>
  </div>`));

  /* ---------- YOUR HANDLE, BEFORE THE PIN AND FOR THE SAME REASON -------------------------------
     THE TWO THINGS ABOUT AN ACCOUNT THAT DO NOT GO THROUGH `Save`. Everything above is
     `updateProfile`, which writes whatever it is given out of `PROFILE_EDITABLE`; a PIN needs the
     old one, and a handle is never typed at all — the server builds it and Randomise asks it for
     another word.

     NOT ONE RULE IS REPEATED HERE. The button posts, and whatever comes back is what the line
     underneath says. `MESSAGING` records the argument: a rule written twice is two rules to keep in
     step, and the server's own sentence already says what to do instead. */
  /* ---------- SIGNING IN IS ONE CARD: YOUR HANDLE AND YOUR PIN ----------------------------------
     They were two pages. Each keeps its own button and its own line underneath, because each goes
     to a different handler with different rules — folding them into one Save would mean every new
     handle asking for a PIN. The three PIN boxes sit on one line, captioned by what they are in
     order, which is most of the height the second page cost. */
  /* ---------- ADDING A CHILD IS A CARD HERE NOW -------------------------------------------------
     *"remove add your child tile as that should go on column to the right."* It was a tile on your
     own account card that opened a sheet with two boxes and a button — and this app has been asked,
     more than once, for no pop-up menus. So the two boxes are on the card, `add-child-go` reads
     them from the card the button is on, and there is nothing to open. For the same people the tile
     was for: a parent, a client or an admin; a student has nobody to add. */
  /* MAKING THEIR ACCOUNT COMES FIRST — most children here have none — and linking one that exists
     second. Same people, same test. */
  /* ---------- AND WHILE THE PARENT'S OWN ADDRESS IS UNPROVED, ONE CARD SAYING SO INSTEAD ----------------
     The server refuses both forms to a PENDING parent (`confirmFirst_`), so drawing them would be two
     forms that answer "open the link first" — said once here, with the tile that sends it again. ONE
     PAGE WHERE THERE WERE TWO, which moves every index after it by one; it happens once in an
     account's life (the link opened), and a card that cannot be used is worse than a page moved. */
  if (mayAddChild_()) {
    if (pendingAddr_()) pages.push(childHeldCard_());
    else pages.push(childMakeCard_(), childCard_());
  }

  pages.push(`<div class="card">
    <h3>Signing in</h3>
    ${/* ---------- YOUR HANDLE, SHOWN RATHER THAN TYPED ------------------------------------------
          ASKED FOR AS *"handles should be their name and a virtuous describing word. they can
          randomise it but it will follow that general name."* So the box went: what a handle is
          made of is decided — your first name and a word off a list of virtues — and the one choice
          left is WHICH word, which is a press rather than a keyboard. The `@` is drawn the way every
          card draws it, gold, and is not in the cell.

          A LINE OF TEXT, NOT A DISABLED INPUT. An input that cannot be typed into reads as broken
          (and greys out under `send_`'s lock); this is a fact about you, set like the name on a
          card. `aria-live` so the new handle is read out when Randomise lands, since nothing else
          on the card moves. */''}
    <p class="handle-cap">handle</p>
    <p class="handle-now" aria-live="polite"><b aria-hidden="true">@</b><span class="handle-shown">${
      esc((USER && (USER.handle || '')) || '')}</span></p>
    ${/* ---------- RANDOMISE IS A TILE, BECAUSE THE HANDLE IS A THING ---------------------------
          It was a `.btn quiet` beside the PIN form's button, and it is not part of that form: it
          takes no input and posts nothing typed. CLAUDE.md's rule is that a THING has tiles and a
          FORM has buttons, and a handle is a thing about you — so the one action on it is a tile,
          from `tile_`, with the tap target, the mark and the press that come from that one place,
          and `send_` already knows a tile has no word to swap for "Choosing…".

          THE LINE UNDER IT SAYS WHAT A PRESS MAKES. *"their first name, a virtuous adjective and
          random numbers and maybe an underscore. but all random order."* — so a person is told the
          number and the order move too, rather than discovering it. And that a child with no e-mail
          signs in with the handle: a press changes what they type at sign-in, which is the one
          thing about this tile somebody could regret, and it is said once here rather than as a
          confirm that would be the pop-up this app has been asked not to have. */''}
    <div class="tile-row">${tile_({ icon: 'shuffle', label: 'Randomise', note: 'a new handle',
                                    act: 'handle-shuffle' })}</div>
    <p class="faint handle-said" style="margin:.6rem 0 0">${esc(
      (HANDLE_SAID.pid && HANDLE_SAID.pid === String(USER.personId || '') && HANDLE_SAID.text)
      || 'Your first name, a word that suits you and a number. Randomise mixes up a new one — '
       + 'if you sign in with your handle, that is your new sign-in name.')}</p>
    <div class="f-row pin-row" style="--n:3">
      <label class="field"><span>current PIN</span>
        <input id="pin-now" type="password" inputmode="numeric" autocomplete="current-password"></label>
      <label class="field"><span>new PIN</span>
        <input id="pin-new" type="password" inputmode="numeric" autocomplete="new-password"></label>
      <label class="field"><span>again</span>
        <input id="pin-again" type="password" inputmode="numeric" autocomplete="new-password"></label>
    </div>
    <button class="btn quiet" data-do="pin-save">Change my PIN</button>
    <p class="faint" id="pin-said" style="margin:.6rem 0 0">4 to 8 numbers, and not 1234.</p>
    ${/* THE BUILD STAMPS, FOR AN ADMIN, UNDER THE ONE CARD ONLY THEY SEE THEM ON. They were a `Build`
          tile on your own account card, removed on request; the stamps are still the only thing on
          a home-screen app with no address bar that says which build is running, so they moved
          rather than went — small, at the foot of the card that is about your own sign-in. */''}
    ${isAdmin() ? `<div class="me-build">${versionSaid_()}</div>` : ''}
  </div>`);


  /* ---------- AND THE WARDROBE, AT THE END -------------------------------------------------------
     APPENDED RATHER THAN PREPENDED, because `PAGE.settings` remembers where somebody was: inserting
     at the front moves every existing index and a returning visitor lands on a different page.
     Thirteen pages is long and in range — games is eleven and tools ten — and nobody walks to it:
     the `Your figure` tile on your own card jumps straight there. */
  pages.push(wardrobeCard_());
  /* YOUR ROLES, STRAIGHT AFTER THE WARDROBE — the one card every signed-in person has, so it sits
     behind nothing that comes and goes, and for the wardrobe's own reason it is not inserted in
     front: every index after it would move. See `rolesCard_`. */
  pages.push(rolesCard_());

  /* AFTER THE WARDROBE, for the reason the wardrobe gives: `PAGE.settings` remembers where somebody
     was, so a card inserted in front moves every index behind it. Each is gated on the role it is
     about, and the server gates it again — a card is not a permission. */
  /* `tutorHeld_`, NOT `isTutorRole`: somebody whose Tutor tick is waiting for the admin is exactly
     who should be reading and signing this — before the yes, not after it. The server's own test in
     `signAgreement` is `hasRole(me, 'tutor')`, which a pending tutor passes. */
  if (tutorHeld_() || isAdmin()) pages.push(agreementCard_());
  if (isAdmin()) pages.push(cutCard_());
  if (mayJourney_()) pages.push(journeyCard_());
  /* THE BUSINESS'S OWN PAPERWORK, LAST AND FOR AN ADMIN — see js/records.js. They were a widget on
     the Tools column, moved here on request; appended for the wardrobe's reason above. */
  if (typeof bizPages_ === 'function') pages.push(...bizPages_());
  /* AND THE WEEKLY PARENT EMAIL, AFTER THEM AND FOR AN ADMIN — see js/digest.js. Appended for the
     wardrobe's reason above. */
  if (typeof digestPages_ === 'function') pages.push(...digestPages_());

  return pages;
}

/* ---------- YOUR ROLES: TUTOR, CLIENT, STUDENT — TICK EVERY ONE THAT IS YOU ------------------------
   ASKED FOR AS *"each account should have a widget in account settings which say what the roles
   are. they can be either a tutor or client or student. they can be tutor and client and student
   like multiselect."*

   THREE `.check` TICKS, the app's own several-of-a-few control — the box the tutor agreement and
   every yes/no field on this column already draw — and not the `meDrop_` drop-down, which is for a
   list too long to show. Three answers fit on the card and should be SEEN, because the card's whole
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
const ROLE_PICKS = [
  ['tutor', 'Tutor', 'You teach. @family. approves you before families can book you.'],
  ['client', 'Client', 'A parent or payer. You book and pay for sessions.'],
  ['student', 'Student', 'You are the one learning.'],
];
/* WHAT THE LINE UNDER THE TILE SAYS WHEN NOTHING HAS JUST HAPPENED — the waiting Tutor, said where
   the tick is, because the tick alone would look like a yes. */
function rolesSaid_() {
  if (USER && USER.tutorPending && tutorHeld_() && !isAdmin())
    return 'Tutor is waiting for @family. to approve you. Until then you are not on the site and '
         + 'cannot be booked — fill in your teaching pages meanwhile.';
  return 'Tick every one that is you. You can be more than one.';
}
function rolesCard_() {
  const held = heldRoles().map(roleOf);
  return `<div class="card roles-card">
    <h3>Your roles</h3>
    ${ROLE_PICKS.map(([r, label, note]) => `<label class="check role-pick">
      <input type="checkbox" data-role-pick="${r}"${held.indexOf(r) !== -1 ? ' checked' : ''}>
      <span class="box"></span><span class="role-pick-say"><b>${esc(label)}</b>
        <span class="faint">${esc(note)}</span></span></label>`).join('')}
    ${isAdmin() ? '<p class="faint role-admin">You are also Admin. That is given by @family. and '
                + 'is not changed here.</p>' : ''}
    <div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'roles-save' })}</div>
    <p class="faint roles-said" aria-live="polite">${esc(rolesSaid_())}</p>
  </div>`;
}

on('roles-save', el => {
  const card = el.closest('.card');
  if (!USER || !card) return;
  const said = card.querySelector('.roles-said');
  const roles = [].filter.call(card.querySelectorAll('[data-role-pick]'), b => b.checked)
    .map(b => b.dataset.rolePick);
  /* THE ONE RULE THE CARD CAN KNOW WITHOUT ASKING. The server refuses it too — this saves a round
     trip to be told what the screen already shows. */
  if (!roles.length) { if (said) said.textContent = 'Keep at least one ticked.'; return; }
  send_({ action: 'setMyRoles', name: USER.name, personId: USER.personId || '', roles },
        { button: el, where: said || undefined, saying: 'Saving…', lock: card })
    .then(d => {
      /* THE SERVER'S ANSWER IS WHAT YOU ARE NOW, not the ticks: it may have kept an admin's
         `admin`, and only it knows whether the Tutor tick is waiting. Kept like every other field
         of `USER`, so a reload does not undo it. */
      USER.role = d.role || USER.role;
      USER.roles = Array.isArray(d.roles) ? d.roles : USER.roles;
      USER.tutorPending = !!d.tutorPending;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      toast(d.changed ? 'Roles saved' : 'Nothing changed');
      /* THE COLUMN IS DRAWN FROM THE ROLE — which pages of fields, the agreement card — so it is
         drawn again; then the payload, because who is a tutor is in it. */
      if (d.changed) { try { repaint(true); } catch (e) {} try { load(); } catch (e) {} }
      const now = document.querySelector('.roles-card .roles-said');
      if (now) now.textContent = d.changed && USER.tutorPending ? rolesSaid_()
                               : d.changed ? 'Saved.' : rolesSaid_();
    })
    /* A REFUSAL PUTS THE TICKS BACK TO WHAT YOU HOLD. The walk after the parent sign-up found a
       student's Client box still ticked in gold under the server's *"Nothing was changed"* — a box
       that says yes over a line that says no, and the box is what the eye reads. The sentence stays
       (`send_` wrote it); only the ticks move, so the card shows what the server has, which is the
       card's whole job. NOT ON A LOST REPLY: the server never answered, nothing was decided, and the
       ticks are still the request somebody is about to send again. */
    .catch(err => {
      if (!err || !err.refused) return;
      const held = heldRoles().map(roleOf);
      /* THE CARD ON THE PAGE NOW, as the success path asks: the payload arriving mid-request
         repaints the column, and the card held from the press would then be a detached copy. */
      const live = document.querySelector('#s-settings .roles-card') || card;
      [].forEach.call(live.querySelectorAll('[data-role-pick]'), b => {
        b.checked = held.indexOf(b.dataset.rolePick) !== -1;
      });
    });
});

/* ---------- YOUR JOURNEY — A PLACEHOLDER ----------------------------------------------------------
   ASKED FOR AS *"make a journey widget to go in account settings. its for student to track and
   organise their progess. fo know you can just make it as a place holder."* So this is the card's
   place and its outline, and nothing on it pretends to work: no button that does nothing, which is
   the fault `check/press.js` exists to report. The one live line is the countdown to the two exam
   dates a student already keeps on this column, because that is progress the app already knows.
   For a student, and for an admin so the owner can see it; appended for the wardrobe's reason. */
function mayJourney_() {
  const held = typeof heldRoles === 'function' ? heldRoles() : [];
  return held.indexOf('student') !== -1 || held.indexOf('admin') !== -1;
}
function journeyCard_() {
  const prof = (USER && USER.profile) || {};
  const days = iso => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return null;
    const t = new Date(+m[1], +m[2] - 1, +m[3]), now = new Date();
    return Math.ceil((t - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  };
  const exams = [['Small exam', prof.exam_small_date], ['Big exam', prof.exam_big_date]]
    .map(([k, v]) => [k, days(v)]).filter(([, d]) => d !== null && d >= 0)
    .map(([k, d]) => `<div class="row"><span class="k">${esc(k)}</span><span>${d === 0 ? 'today'
      : d + (d === 1 ? ' day' : ' days') + ' to go'}</span></div>`).join('');
  return `<div class="card journey">
    <h3>Your journey</h3>
    <p class="sub">Where you are, where you are going, and what you have done on the way. Coming soon.</p>
    ${exams}
    <div class="row"><span class="k">Goals</span><span class="faint">what you are aiming for</span></div>
    <div class="row"><span class="k">Milestones</span><span class="faint">the steps on the way</span></div>
    <div class="row"><span class="k">Worked through</span><span class="faint">papers and topics you have done</span></div>
  </div>`;
}

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
const AGREEMENT_VERSION = 'draft-2026-09';
const AGREEMENT_POINTS = [
  'You work as a self-employed tutor, not as an employee. You are responsible for your own tax and National Insurance.',
  'You hold an enhanced DBS check, and you tell us straight away if anything about it changes.',
  'Safeguarding comes first. You report any concern about a child to us the same day, and you never meet a student alone somewhere that has not been agreed.',
  'You arrive on time and prepared. If you cannot make a session you give at least 24 hours\u2019 notice, except in a real emergency.',
  'Families pay through this platform. You do not take payment directly, and you are paid for the sessions you teach, on the schedule we agree.',
  'You keep what you learn about students and families private, and you only use their details to teach them.',
  'You are polite and professional with students, parents and staff, in person and in messages.',
  'You do not take on a family you met through us privately while you work with us, or for 6 months after.',
  'Either side can end this with 2 weeks\u2019 written notice, or straight away for a serious breach such as a safeguarding failure.',
  'This is a DRAFT and may change. If it does, you will be asked to agree to the new version.',
];
function agreementCard_() {
  const at = USER && USER.agreementSignedAt;
  return `<div class="card agree">
    <h3>Tutor agreement <span class="agree-draft">Draft</span></h3>
    <ol class="agree-list">${AGREEMENT_POINTS.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
    <label class="check"><input type="checkbox" data-do="agree-sign"${at ? ' checked disabled' : ''}>
      <span class="box"></span><span>I have read this and I agree</span></label>
    <p class="faint agree-said">${at
      ? 'Agreed on ' + esc(at) + (USER.agreementVersion ? ' \u00b7 ' + esc(USER.agreementVersion) : '') + '. This cannot be undone.'
      : 'Once ticked it stays ticked \u2014 it cannot be undone.'}</p>
  </div>`;
}

on('agree-sign', el => {
  if (!USER || el.disabled) return;
  /* A click on an unticked box has already ticked it by the time this runs. It is locked for the
     length of the request so a second tap cannot post twice, and put back only if the server
     refused — a refusal is reported as a refusal, which is `send`'s whole job. */
  el.disabled = true;
  const said = el.closest('.card') && el.closest('.card').querySelector('.agree-said');
  send({ action: 'signAgreement', name: USER.name, personId: USER.personId, version: AGREEMENT_VERSION })
    .then(d => {
      USER.agreementSignedAt = (d && d.signedAt) || 'today';
      USER.agreementVersion = (d && d.version) || AGREEMENT_VERSION;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      el.checked = true;
      if (said) said.textContent = 'Agreed on ' + USER.agreementSignedAt + '. This cannot be undone.';
      toast('Agreed');
    })
    .catch(err => {
      el.checked = false; el.disabled = false;
      toast(String((err && err.message) || 'Not saved.'));
    });
});

/* ---------- YOUR CUT OF AN EXTRA CHILD, FOR THE ADMIN -----------------------------------------------
   ASKED FOR AS *"for admin he should have an extra widget which is how much does he take from extra
   child from other tutors."* That figure is `B` in `priceFrom` (core.js) — read off config as `B`,
   `boss rate` or `boss_rate` — a FRACTION of the tutor's hourly rate added for each child after the
   first, beside the tutor's own share `c`. So the card says it in money as well as as a fraction,
   because 0.1 is not a number anybody thinks in and "£3 an hour on a £30 tutor" is.

   THE KEY IS WHICHEVER OF THE THREE THE SHEET ALREADY USES, so a save edits that row rather than
   adding a second one `cv` would never read. None of them → `boss_rate`, which `updateConfig` is
   allowed to add. `send`, not `api`: a refusal must not be toasted as "Saved". */
const CUT_KEYS = ['B', 'boss rate', 'boss_rate'];
function cutNow_() {
  const v = (DATA && DATA.constants && DATA.constants.vars) || {};
  for (const k of CUT_KEYS) {
    const x = Number(v[k]);
    if (v[k] !== undefined && v[k] !== '' && !isNaN(x)) return { key: k, value: x };
  }
  return { key: 'boss_rate', value: 0 };
}
function cutSay_(b) {
  const v = (DATA && DATA.constants && DATA.constants.vars) || {};
  const c = Number(v.c ?? v['extra child rate'] ?? v.extra_child_rate) || 0;
  const r = 30, pct = Math.round(b * 1000) / 10;
  return `So on a ${money(r)}/h tutor, each extra child adds ${money(r * (c + b))}/h,
    of which you take <b>${money(r * b)}/h</b> (${pct}%) and the tutor ${money(r * c)}/h.`;
}
function cutCard_() {
  const now = cutNow_();
  return `<div class="card cut">
    <h3>Your cut of an extra child</h3>
    <p class="sub">What the business takes from each child after the first, as a share of the
      tutor's hourly rate. 0.1 is 10%.</p>
    <label class="field"><span>your share (0 to 2)</span>
      <input id="cut-val" type="number" inputmode="decimal" step="0.01" min="0" max="2"
        value="${esc(String(now.value))}" data-key="${esc(now.key)}"></label>
    <p class="faint cut-say">${cutSay_(now.value)}</p>
    <div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'cut-save' })}</div>
  </div>`;
}
on('cut-save', el => {
  const box = el.closest('.card') && el.closest('.card').querySelector('#cut-val');
  if (!box || !isAdmin()) return;
  const x = Number(box.value);
  if (box.value === '' || isNaN(x) || x < 0 || x > 2) return toast('A number from 0 to 2 \u2014 0.1 is 10%.');
  /* `send_`, like every other Save on this column: the spinner, and the box locked while the number
     is on the wire, so what is saved is what the box says. */
  const want = box.dataset.key || 'boss_rate';
  send_({ action: 'updateConfig', name: USER.name, personId: USER.personId, key: want, value: x },
        { button: el, busy: 'Saving…' })
    .then(d => {
      DATA.constants = DATA.constants || {};
      DATA.constants.vars = DATA.constants.vars || {};
      /* THE KEY THE SERVER WROTE, which is the one the pricing reads — see the exact-case match in
         `updateConfig`. */
      DATA.constants.vars[(d && d.key) || want] = x;
      const say = el.closest('.card').querySelector('.cut-say');
      if (say) say.innerHTML = cutSay_(x);
      toast('Saved');
    })
    .catch(() => {});
});

screen('settings', () => pages('settings', settingsPages_()));

/* `on('edit-me')` WAS HERE — `go('settings')`, the door from a `Your settings` tile on your own
   account card. *"remove edit tile as they can already edit their profile on the column to the
   right"*: the column is one swipe from that card, so the tile was a second route to it. */

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
function availGrid_(codes, p, readonly, mine) {
  const ro = f => readonly.indexOf(f) !== -1;
  /* AN HOUR TICKED AND NOT YET SAVED IS A DRAFT of your own row (`fieldHtml`'s note; 317) — "Save my
     hours" took every unsaved tick with it on a reload. Only on your own week (`mine`). */
  const was = f => (TRUEish_(p[f]) ? '1' : '0');
  const keep = f => !!mine && !ro(f) && typeof draftVal_ === 'function';
  const on = f => (keep(f) ? draftVal_('set', f, was(f)) : was(f)) === '1';

  /* Grouped back into days, from the flat list the backend sends. The prefix IS the day and the
     digits ARE the hour, so nothing else has to be looked up. */
  const days = [['m', 'Mon'], ['tu', 'Tue'], ['w', 'Wed'], ['th', 'Thu'],
                ['f', 'Fri'], ['sa', 'Sat'], ['su', 'Sun']]
    .map(([prefix, label]) => ({
      label: label,
      hours: codes.filter(c => c.replace(/\d+$/, '') === prefix)
                  .sort((a, b) => Number(a.slice(prefix.length)) - Number(b.slice(prefix.length)))
                  .map(c => ({ code: c, h: Number(c.slice(prefix.length)) })),
    }))
    .filter(d => d.hours.length);

  if (!days.length) return '';
  /* ---------- `.me-week`, BECAUSE THIS WEEK IS READ AT LEISURE AND THE BOOKING ONE IS NOT ----------
     *"refine availability bit it looks weird, like scruffy."* Three things made it so, measured on
     a screenshot at 320 and 390: cells a different width from their height (a 19px column in a
     20px row reads as a smudge rather than a square), a two-letter day in capitals beside a column
     of small numbers, and bars that joined only for hours saved before the card was drawn — see the
     change listener in me.js. The booking week keeps its shape because that card has no height to
     spare; this card is a page to itself, so its cells are SQUARE, its days are `Mon`, and the
     scoping class says so without touching the other two weeks that share `weekGrid_`. */
  return `<div class="me-week" style="--hours:${days[0].hours.length}">
    <p class="faint me-week-say">Tap the hours you can teach. Tap again to clear one.</p>
    ${weekGrid_(days, (h, d) => `<label class="hr${on(h.code) ? ' on' : ''}${
      ro(h.code) ? ' shut' : ''}" aria-label="${esc(d.label)} ${h.h}:00">
      <input type="checkbox" data-me="${esc(h.code)}" ${on(h.code) ? 'checked' : ''}
             ${ro(h.code) ? 'disabled' : ''}${keep(h.code) ? draftAttr_('set', h.code, was(h.code)) : ''}>
    </label>`, { chars: 3 })}</div>`;
}

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
function send_(body, o) {
  o = o || {};
  const btn = o.button;
  /* AN ID OR THE ELEMENT ITSELF. A settings card's status line is a CLASS, one per card — there are
     a dozen on one column, so it cannot be an id — and the caller already holds the element. */
  const say = msg => {
    const el = o.where && (typeof o.where === 'string' ? $(o.where) : o.where);
    if (el) el.textContent = msg; else toast(msg);
  };

  /* `is-busy` IS THE SPINNER, and it goes on whether or not there is a `busy` label -- a
     button with no relabel still has to show that it is waiting. See `.btn.is-busy`. */
  /* `data-unlocked` — SEE BELOW: a control that queues its own press behind the save is left live. */
  if (btn) { btn.disabled = !btn.hasAttribute('data-unlocked'); btn.classList.add('is-busy');
             /* A TILE HAS NO WORD TO SWAP — its face is a mark, and writing text over it would lose
                the mark for good. The ring is the whole of its busy state. */
             if (o.busy && !btn.classList.contains('tile')) { btn.dataset.was = btn.textContent; btn.textContent = o.busy; } }
  if (o.saying) say(o.saying);

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
  const box = o.lock
    ? (typeof o.lock === 'string' ? $(o.lock) : o.lock)
    : btn && btn.closest('.me-form, .msg-form, .rc, #drop, #sheet-body, .card');
  const had = document.activeElement;
  const locked = [];
  if (box) {
    [].forEach.call(box.querySelectorAll('input, select, textarea, button'), el => {
      if (el === btn || el.disabled || el.hasAttribute('data-unlocked')) return;
      el.disabled = true;
      locked.push(el);
    });
    box.classList.add('is-sending');
  }

  const done = () => {
    locked.forEach(el => { el.disabled = false; });
    locked.length = 0;
    if (box) box.classList.remove('is-sending');
    /* ONLY IF THE PAGE STILL HOLDS IT. A reply that repaints the card replaces the element that
       had the caret, and focusing a detached node moves focus to the body -- which is worse than
       leaving it where the repaint put it. */
    if (had && had.focus && document.contains(had)) { try { had.focus(); } catch (e) {} }
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove('is-busy');
    if (btn.dataset.was) { btn.textContent = btn.dataset.was; delete btn.dataset.was; }
  };

  return api(body)
    .then(d => {
      /* A REPLY CARRYING AN ERROR IS A FAILURE, and was being treated as success by anything that
         only checked whether the request went through. */
      /* AND IT IS MARKED `refused` — THE SERVER ANSWERED, AND THE ANSWER WAS NO. A caller can then
         tell that from a reply that never came: after a refusal what the form shows is a choice the
         server has turned down, after a lost reply it is still the person's unsent request. Found on
         the roles card, whose refused Client tick stayed gold under "Nothing was changed". */
      if (!d || d.error) {
        const refusal = new Error((d && d.error) || 'That did not work.');
        refusal.refused = !!(d && d.error);
        /* AND THE WHOLE REPLY RIDES ON IT, as on `send`'s — a refusal is sometimes a fact for the code
           as well as a sentence: `why: 'unconfirmed'` turns the make-child form into the held card
           (`heldBy_`), where matching the sentence would break on its first rewording. */
        refusal.reply = d || null;
        throw refusal;
      }
      done();
      return d;
    })
    .catch(err => {
      done();
      /* THE MESSAGE, NOT THE STACK. And a network failure has none worth reading — `Failed to
         fetch` tells somebody on a train nothing they can act on. */
      /* THROUGH `why_`, so the same sentence appears here and in the banner — the line under the
         button is where somebody looks, the banner is where text can be selected and pasted to
         somebody who can fix it, and neither should be a different account of the same fault. */
      say(typeof why_ === 'function' ? why_(err) : String(err && err.message || err));
      /* Rethrown so a caller can still react, and marked so a caller that does not care can tell
         a handled failure from a bug. */
      err.handled = true;
      throw err;
    });
}

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

/* Names that hold a yes or a no. Matched rather than listed, because the sheet grows columns and a
   list has to be remembered — `dbs_checked` and `is_listed` are booleans by their names. */
const FIELD_IS_BOOL = /^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)/;

/* Names whose keyboard should be a number pad, and which kind. */
const FIELD_IS_DECIMAL = /rate|price|cost|hours|km|fraction/;
const FIELD_IS_NUMERIC = /pages|year|students|days|weeks|count|level_required/;

/* ---------- AND A NAME ENDING `_date` IS A DAY ON A CALENDAR --------------------------------------
   MATCHED RATHER THAN LISTED, which is the argument written over `FIELD_IS_BOOL` three lines up:
   the sheet grows columns and a list has to be remembered. `exam_small_date` and `exam_big_date` are
   the two on a form today; `exam_date` on the exams tab and `creation_date` on a post are the same
   shape and would be right to draw this way if either ever reached a form.

   `date_of_birth` DOES NOT MATCH IT, AND THAT IS THE POINT RATHER THAN AN ESCAPE. A birthday is
   three boxes and a `dd/mm/yyyy` cell — see `isDobBox_` below, and the long note over `isoDate_` in
   core.gs, which argues that the same control is wrong for a birth year and right for an exam. The
   suffix is what separates them, so neither needs an exception written about the other. */
const FIELD_IS_DATE = /_date$/;

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
const FIELD_LISTS_ = {
  favourite_colour: ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Navy', 'Purple', 'Pink',
                     'Brown', 'Black', 'White', 'Grey', 'Gold', 'Silver'],
};
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
const QUAL_SUBJECTS = [
  'Accounting', 'Ancient History', 'Arabic', 'Archaeology', 'Art and Design', 'Biology',
  'Business Studies', 'Chemistry', 'Chinese', 'Citizenship', 'Classical Civilisation', 'Combined Science',
  'Computer Science', 'Dance', 'Design and Technology', 'Drama', 'Economics', 'Education',
  'Electronics', 'Engineering', 'English Language', 'English Literature', 'Film Studies',
  'Food Preparation and Nutrition', 'French', 'Further Maths', 'Geography', 'Geology', 'German',
  'Greek', 'History', 'Italian', 'Latin', 'Law', 'Maths', 'Media Studies', 'Medicine', 'Music',
  'Philosophy', 'Physical Education', 'Physics', 'Politics', 'Portuguese', 'Psychology',
  'Religious Studies', 'Sociology', 'Spanish', 'Statistics', 'Theology',
  'PGCE', 'QTS', 'DBS', 'First Aid', 'DofE Gold',
];
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
const QUAL_LEVELS = [
  'Entry Level', 'SATs', '11+', 'GCSE', 'IGCSE', 'AS', 'A-Level', 'BTEC', 'T Level',
  'International Baccalaureate', 'Access to HE', 'Foundation Degree', 'HNC', 'HND',
  "Bachelor's degree", "Master's degree", 'PGCE', 'Doctorate', 'Diploma', 'Certificate',
  'Basic', 'Standard', 'Enhanced',
];
/* AND THE GRADES, spelt right ("Distinciton" was on the sheet's list), numbered and lettered, then
   the ones a BTEC and a degree give. */
const QUAL_GRADES = [
  '9', '8', '7', '6', '5', '4', '3', '2', '1', 'A*', 'A', 'B', 'C', 'D', 'E', 'U',
  'Distinction*', 'Distinction', 'Merit', 'Pass',
  'First', '2:1', '2:2', 'Third',
];
/* FIELDS WHOSE ANSWER IS SEVERAL OF THE LIST, stored as one comma-separated cell. */
/* `venues_ok` IS NOT A COLUMN of `people` — it is the venues tab's own `tutors_happy_here`, read and
   written through this one box. See `venuesWrites_` in core.gs for why there is no second copy. */
const FIELD_MULTI = { venues_ok: true };
/* ---------- AND ONE SHELF SLOT'S LIST OFF THE FIRST SLOT'S -------------------------------------
   `FIELD_OPTIONS` sends `qual_1_level` ONCE rather than ten times — see its note in constants.gs —
   so `qual_7_level` asks for `qual_1`'s list here. (What a tutor teaches is no longer a field: it is
   the three-way Teach / Can teach / Not teaching control on each qualification — see `qualSlot_`.) */
function fieldOptions_(f) {
  const v = (typeof DATA !== 'undefined' && DATA && DATA.validations) || {};
  const dd = (typeof DATA !== 'undefined' && DATA && DATA.dropdowns) || {};
  const got = x => (x && x.length ? x : null);
  const first = String(f).replace(/^qual_\d+/, 'qual_1');
  if (/^qual_\d+$/.test(String(f))) return QUAL_SUBJECTS;
  if (/^qual_\d+_level$/.test(String(f))) return QUAL_LEVELS;
  if (/^qual_\d+_grade$/.test(String(f))) return QUAL_GRADES;
  return got(v[f]) || FIELD_LISTS_[f] || got(v[first])
    /* THE VENUES ON OFFER ARE THE VENUES THE SITE HAS, by the name the booking form uses for them. */
    || (f === 'venues_ok' ? got((typeof DATA !== 'undefined' && DATA && DATA.venues || [])
                                  .map(x => x && x.title).filter(Boolean)) : null)
    || null;
}

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
/* WHICH OF YOUR OWN FIELDS KEEP A DRAFT — see the note in `fieldHtml`. */
const setDraftOk_ = name => typeof draftAttr_ === 'function' && !FIELD_MULTI[name]
  && !/pin/i.test(String(name)) && !/^(lib\d+_|qual_)/.test(String(name));
/* ---------- AND A CARD DRAWN HOLDING ONE SAYS SO ----------------------------------------------------------
   SAVE SENDS EVERY BOX OF ITS CARD (`meSave_`), so a box holding an edit made before a reload and never
   saved went up with a Save pressed for the box beside it — and nothing on the card said the city in
   front of you was not the one on the sheet (review of 317). `draftAttr_` marks a box drawn holding a
   draft (`data-draft-held`); its card's line says so until the next Save writes over it. */
const SET_HELD_SAY = 'Not saved yet — what you typed here before is still in its box. Save keeps it.';
function setHeldSay_(html) {
  return /\sdata-draft-held\b/.test(html)
    ? html.replace('<p class="faint me-said"></p>', '<p class="faint me-said">' + esc(SET_HELD_SAY) + '</p>') : html;
}
function fieldHtml(name, value, o) {
  o = o || {};
  /* THE EXTRA-SEAT FIGURE IS A SHARE OF THE RATE, NOT POUNDS, and nothing on the box said so: a tutor
     typing 15 meaning £15 saved without complaint and charged nothing per seat, because `seatShare_`
     treats anything outside 0–2 as nought. The caption says what it is and the box refuses the rest;
     `pricingRefusal_` refuses it on the server as well. */
  if (name === 'extra_seat_rate' && !o.label && !o.placeholder) {
    o = Object.assign({}, o, { label: 'extra seat: share of your rate, 0–2 (0.5 = half)',
      extra: (o.extra || '') + ' type="number" min="0" max="2" step="0.05"' });
  }
  const attr = o.attr || 'data-me';
  const label = o.label || fieldLabel(name);
  const ro = !!o.readonly;
  const v0 = value ?? '';
  /* ---------- AN UNSAVED EDIT IS A DRAFT (data.js; docs/history/317) ------------------------------
     A CARD'S BOXES WAITED FOR ITS SAVE, and a reload before it took every edit on the card with it.
     So each box of YOUR OWN row (`data-me` — another editor's row is somebody else's draft) keeps what
     is typed as a draft and is drawn holding it, with the saved value as the one that takes the draft
     away again; `meSave_` drops each field it sent. NOT A LIBRARY CARD (its PIN is on it, and a
     card is drafted whole or not at all), NOT THE QUALIFICATION SHELF (saved the moment each answer
     changes, `qualCommit_`), NOT a several-of-a-list's hidden answer, and never anything named a PIN —
     `draftKeep_` refuses those whatever asks. */
  const keep = attr === 'data-me' && !ro && setDraftOk_(name);
  const saved = FIELD_IS_BOOL.test(name) ? (TRUEish_(v0) ? '1' : '0') : String(v0);
  const da = keep ? draftAttr_('set', name, saved) : '';
  const dv = keep ? draftVal_('set', name, saved) : saved;
  const v = keep && !FIELD_IS_BOOL.test(name) ? dv : v0;

  if (FIELD_IS_BOOL.test(name)) {
    return `<label class="check">
      <input type="checkbox" ${attr}="${esc(name)}" ${(keep ? dv === '1' : TRUEish_(v)) ? 'checked' : ''}
             ${ro ? 'disabled' : ''}${da}>
      <span class="box"></span><span>${esc(label)}</span></label>`;
  }

  /* ---------- SEVERAL OF A LIST IS A DROP-DOWN THAT STAYS OPEN ----------------------------------
     NOT `<select multiple>`, which a phone draws as a list box with its own scrollbar, and not a
     `<select>` that shuts after every pick — *"doesnt disapear after each option click"* is the
     booking form's accepted answer and this is the same control: a field that opens `#drop`
     anchored under it, several ticks, Done or a tap outside to close. See `meDrop_` below.

     THE ANSWER IS A HIDDEN INPUT CARRYING THE ATTRIBUTE, so `me-save` gathers it exactly like every
     other box on the card and nothing about saving had to change. The button shows what is ticked. */
  if (FIELD_MULTI[name] && (o.options || []).length) {
    const got = profList_(v);
    return `<label class="field"><span>${esc(label)}</span>
      <input type="hidden" ${attr}="${esc(name)}" value="${esc(got.join(', '))}">
      <button type="button" class="me-many${got.length ? '' : ' is-unset'}" data-do="me-many"
        data-field="${esc(name)}" aria-expanded="false" ${ro ? 'disabled' : ''}
        aria-label="${esc(label)}">${esc(got.join(', ') || 'Tap to choose')}</button></label>`;
  }

  /* A FIXED LIST IS A SELECT. Somebody choosing an exam board should not be able to invent one —
     that is how a sheet ends up with four spellings of Edexcel.
     AND A SAVED VALUE THE LIST DOES NOT HOLD IS KEPT AS ITS FIRST OPTION. Without it the empty
     option was the one selected, so pressing Save with nothing touched wrote '' over a borough, a
     town, a favourite colour, or a qualification's Merit or Grade 8 — whatever the options tab
     happened not to list. `qualYears_` and `meDropHtml_` already keep theirs this way. */
  const opts = o.options || [];
  if (opts.length) {
    /* A PLACEHOLDER ON A SELECT IS ITS EMPTY OPTION, and the caption goes exactly as it does for a
       box below: the empty option reads `Level` or `Board` until something is chosen, and the
       `aria-label` names it after that, because a chosen `A-Level` alone does not say which
       question it answers. */
    const ph = o.placeholder || '';
    return `<label class="field">${ph ? '' : `<span>${esc(label)}</span>`}
      <select ${attr}="${esc(name)}" ${ro ? 'disabled' : ''}${ph ? ` aria-label="${esc(ph)}"` : ''}${da}>
        <option value="">${ph ? esc(ph) : NONE_LABEL}</option>
        ${(v !== '' && v != null && !opts.some(x => String(x) === String(v)) ? [String(v)] : [])
          .concat(opts).map(x => `<option value="${esc(x)}"${
          String(v) === String(x) ? ' selected' : ''}>${esc(x)}</option>`).join('')}
      </select></label>`;
  }

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
  if (FIELD_IS_DATE.test(name)) {
    return `<label class="field"><span>${esc(label)}</span>
      <input type="date" ${attr}="${esc(name)}" value="${esc(String(v))}"
             ${ro ? 'disabled' : ''} ${o.extra || ''}${da}></label>`;
  }

  /* WHAT OTHERS SAY IS A SUGGESTION, not a rule — a datalist offers them and still lets somebody
     type a new one, which is right where the list is descriptive rather than decided. */
  const seen = (o.suggest || []).filter(Boolean);
  const listId = seen.length > 1 ? 'fl-' + attr.replace(/\W/g, '') + '-' + name : '';
  const pad = FIELD_IS_DECIMAL.test(name) ? 'decimal'
            : FIELD_IS_NUMERIC.test(name) ? 'numeric' : '';

  /* ---------- A CAPTION OR A PLACEHOLDER, NEVER BOTH ---------------------------------------------
     A PLACEHOLDER IS THE ACCESSIBLE NAME WHEN THERE IS NOTHING ELSE, which this app has measured:
     ten controls have no text and no `aria-label`, every one carries a placeholder, and adding a
     label repeating it would be two strings to keep in step. So a caller that asks for one gets a
     box with no caption above it and 15px of the card back — which is what makes three library
     cards fit a 568px phone at all. Every other field keeps its caption, because a form of nine
     unlabelled boxes is a form you have to guess at. */
  const hint = o.placeholder || '';

  /* EXTRA ATTRIBUTES, FOR THE CALLERS THAT NEED ONE THE NAME CANNOT IMPLY. `inputmode` and
     `list` above are derived from the field's own name, which is right for a hundred and twenty
     fields and cannot say `maxlength="2"` or `autocomplete="bday-day"` — facts about a box rather
     than about a column. Passed as a string so this stays one `<input>`: a second renderer for a
     box that differs by two attributes is the drift this file spends most of its length avoiding. */
  return `<label class="field">${hint ? '' : `<span>${esc(label)}</span>`}
    <input ${attr}="${esc(name)}" value="${esc(String(v))}" ${ro ? 'disabled' : ''}
           ${hint ? `placeholder="${esc(hint)}"` : ''} ${o.extra || ''}
           ${listId ? `list="${listId}"` : ''} ${pad ? `inputmode="${pad}"` : ''}${da}>
    ${listId ? `<datalist id="${listId}">${
      seen.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}</label>`;
}

/* ---------- THE PANEL FOR A SEVERAL-OF-A-LIST FIELD, ON THE SETTINGS COLUMN ----------------------
   `#drop` IS THE BOOKING FORM'S PANEL AND THIS BORROWS IT RATHER THAN BUILDING A SECOND. The reason
   it is a sibling of the screens is the same here: `.pane` clips, a transformed column is the
   containing block for anything fixed inside it, and only a panel outside every column can hang
   off a field without being cut in half. Its placing (`dropPlace_`) and its closing (`dropShut_`)
   are book.js's; what is new is which surface owns it, written on the panel as `data-owner`, so
   the booking form's own redraws leave this one alone and its move and Escape hooks hand over.

   THE STATE IS THE HIDDEN INPUT, NOT A VARIABLE. What is ticked lives in the box `me-save` reads,
   so the panel, the button's summary and what is posted are one value and cannot disagree —
   `ME_PICK` only says WHICH field is open. */
let ME_PICK = '';
function mePickRow_() {
  if (!ME_PICK || AT !== 'settings') return null;
  const pages = document.querySelectorAll('#s-settings > .page');
  const pg = pages[PAGE.settings || 0];
  return (pg && pg.querySelector('[data-do="me-many"][data-field="' + ME_PICK + '"]')) || null;
}
function meDropHtml_(field, box) {
  const got = profList_(box.value);
  const on = x => got.some(g => norm(g) === norm(x));
  /* ANYTHING ALREADY IN THE CELL IS OFFERED, list or not. The column was free text until today, so
     a row may hold "Grade 8 piano" — leaving it off the panel would make it impossible to untick and
     easy to lose on the next save. */
  const opts = (fieldOptions_(field) || []).slice();
  got.forEach(g => { if (!opts.some(x => norm(x) === norm(g))) opts.push(g); });
  const btn = (x, text) => `<button type="button"
        class="btn quiet pick-opt${on(x) ? ' on' : ''}" data-do="me-many-pick" data-val="${esc(x)}"
        aria-pressed="${on(x) ? 'true' : 'false'}">${on(x) ? '✓ ' : ''}${esc(text)}</button>`;
  const body = `<div class="pick-list">${opts.map(x => btn(x, x)).join('')}</div>`;
  return `<p class="drop-say${got.length ? '' : ' is-none'}">${got.length ? esc(got.join(', '))
      : 'Nothing chosen yet — tap as many as apply.'}</p>
    ${body}
    <button type="button" class="btn quiet drop-done" data-do="me-many-done">Done</button>`;
}
function meDrop_() {
  const el = $('drop'), back = $('drop-back');
  const row = mePickRow_();
  const box = row && row.parentNode.querySelector('input[type="hidden"]');
  if (!el || !back || !row || !box) { meDropShut_(); return; }
  const scroll = el.dataset.owner === 'me' ? el.scrollTop : 0;
  el.innerHTML = meDropHtml_(ME_PICK, box);
  el.dataset.owner = 'me';
  el.setAttribute('aria-label', row.getAttribute('aria-label') || 'Choose');
  back.classList.remove('hidden');
  el.classList.remove('hidden');
  row.setAttribute('aria-expanded', 'true');
  dropPlace_(el, row);
  /* A TICK REBUILDS THE LIST, AND A REBUILT LIST STARTS AT THE TOP. Forty-odd options is a list you
     scroll, and losing your place on every tick is the panel shutting by another name. */
  el.scrollTop = scroll;
}
/* Called by `bookDropMove_` on every placement the grid makes, while this surface owns the panel. */
function meDropMove_() {
  const el = $('drop');
  const row = mePickRow_();
  if (!el || !row) { meDropShut_(); return; }
  dropPlace_(el, row);
}
function meDropShut_() {
  document.querySelectorAll('[data-do="me-many"][aria-expanded="true"]')
    .forEach(b => b.setAttribute('aria-expanded', 'false'));
  ME_PICK = '';
  const el = $('drop');
  if (el && el.dataset.owner === 'me' && typeof dropShut_ === 'function') dropShut_();
}
on('me-many', el => {
  /* PRESSING THE OPEN ONE SHUTS IT, which is what every drop-down does. */
  const open = ME_PICK === el.dataset.field && !$('drop').classList.contains('hidden');
  if (open) { meDropShut_(); return; }
  ME_PICK = el.dataset.field;
  /* ON THE PAGE THE FIELD IS ON. `mePickRow_` looks on the page in front, so a press that reached a
     field on another page — a keyboard, or `check/press.js` — found no row and silently shut. Turn to
     it first, then open. */
  const pg = el.closest('.page');
  const at = pg ? [...document.querySelectorAll('#s-settings > .page')].indexOf(pg) : -1;
  if (AT === 'settings' && at >= 0 && at !== (PAGE.settings || 0)) goPage('settings', at, true);
  meDrop_();
});
on('me-many-pick', el => {
  const row = mePickRow_();
  const box = row && row.parentNode.querySelector('input[type="hidden"]');
  if (!box) { meDropShut_(); return; }
  const val = el.dataset.val;
  let got = profList_(box.value);
  got = got.some(g => norm(g) === norm(val)) ? got.filter(g => norm(g) !== norm(val)) : got.concat(val);
  /* IN THE LIST'S OWN ORDER, which is `bookToggle_`'s rule: a summary in the order things were
     tapped reads as a different answer every time. Anything not on the list keeps its place at the
     end. */
  const order = fieldOptions_(ME_PICK) || [];
  const rank = x => { const i = order.findIndex(o => norm(o) === norm(x)); return i < 0 ? 1e6 : i; };
  got.sort((a, b) => rank(a) - rank(b));
  box.value = got.join(', ');
  row.textContent = got.join(', ') || 'Tap to choose';
  row.classList.toggle('is-unset', !got.length);
  /* THE LIST STAYS OPEN, which is the whole feature. */
  meDrop_();
});
on('me-many-done', () => meDropShut_());

/* ---------- A TICKED HOUR SAYS SO WITH `.on` AS WELL AS WITH `:checked` ------------------------------
   THE JOINED BAR IS DRAWN OFF `.on` — `.hr.on + .hr.on` — and the availability grid set that class
   only when it was DRAWN. So an hour ticked since joined nothing, and one unticked stayed joined to
   its neighbour: a week of saved bars beside a week of loose squares, which is most of what read as
   "scruffy". One listener keeps the class in step with the box, so every run of hours is one bar
   whether it was saved yesterday or ticked a second ago. */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.hr > input[type="checkbox"]')) return;
  t.parentNode.classList.toggle('on', t.checked);
});

/* ---------- BOXES THAT ARE ONE QUESTION SIT ON ONE LINE ----------------------------------------
   ASKED AS *"make it all more efficient and intuitive it looks long right now."* A name is a first
   and a last; a subject is the subject and its level; three words are three words. Drawn one under
   another each costs a whole row and a caption, so a page of them read as a list twice as long as
   the thing it asks. Side by side they read as the pairs they are.

   WHEN EVERY MEMBER IS ON THE PAGE, AND ONLY THEN — a group that sends one of a pair draws it as an
   ordinary box, so this can never hide a field or invent one. `cap` gives the row ONE caption and
   the boxes placeholders instead, for the three words, where "adjective 1, adjective 2, adjective 3"
   over three narrow boxes would be the caption saying the same thing three times. */
const FIELD_ROWS = [
  { fields: ['first_name', 'last_name'] },
  { fields: ['adjective_1', 'adjective_2', 'adjective_3'], cap: 'you, in three words',
    ph: ['word 1', 'word 2', 'word 3'] },
  { fields: ['years_experience', 'favourite_colour'] },
  { fields: ['photo', 'video'] },
  { fields: ['city', 'town'] },
  { fields: ['borough', 'postcode'] },
  /* A STUDENT'S TWO EXAMS SIDE BY SIDE, now they share About you with a name and a photo: two date
     pickers are one row, which is what let them join that page rather than cost a card of their own. */
  { fields: ['exam_small_date', 'exam_big_date'] },
  /* *"max and min number of students could more efficiently be written as '[] - []'."* One row, one
     caption, a dash between — and MIN FIRST although the backend lists max first, because a range is
     read low to high. `dash` is what draws the `–`; the two stay two columns in `PRICING_FIELDS`, so
     the month's clock still covers both. */
  { fields: ['min_students', 'max_students'], cap: 'students', ph: ['min', 'max'], dash: true },
  /* THE AGES A TUTOR TEACHES, THE SAME `[ ] – [ ]` SHAPE AS THE STUDENTS ABOVE, so the two ranges a
     tutor states read alike although they live on different pages. Two SELECTS rather than boxes —
     `validations` carries `AGE_OPTIONS` from constants.gs, four to eighteen and then `Adults` — and a
     placeholder on a select is its empty option, so each reads `youngest` / `oldest` until chosen. */
  { fields: ['age_min', 'age_max'], cap: 'ages you teach', ph: ['youngest', 'oldest'], dash: true },
];
const ROW_LABEL = {
  years_experience: 'years teaching',
  /* `photo` HAS NO LABEL because it has no box any more on your own settings — see `photoPicker_`. */
  video: 'video link',
  travel_km: 'will travel (km)', favourite_colour: 'favourite colour',
  venues_ok: 'venues you teach at',
};
function fieldRows_(list, one) {
  const out = [], done = new Set();
  list.forEach(f => {
    if (done.has(f)) return;
    /* ANY field of a row places it, not only its first: a row can now read in a different order
       from the backend's list (the students range is min–max over a list that says max, min). */
    const row = FIELD_ROWS.find(r => r.fields.indexOf(f) !== -1 && r.fields.every(x => list.indexOf(x) !== -1));
    if (!row) { out.push(one(f, {})); return; }
    row.fields.forEach(x => done.add(x));
    const boxes = row.fields.map((x, i) => one(x, row.cap ? { placeholder: row.ph[i] } : {}))
      .join(row.dash ? '<span class="f-dash" aria-hidden="true">–</span>' : '');
    out.push(row.cap
      ? `<div class="f-rowwrap"><span class="dob-cap">${esc(row.cap)}</span>
           <div class="f-row${row.dash ? ' is-range' : ''}" style="--n:${row.fields.length}">${boxes}</div></div>`
      : `<div class="f-row" style="--n:${row.fields.length}">${boxes}</div>`);
  });
  return out.join('');
}

/**
 * A WHOLE FORM, from a group table.
 *
 * The backend sends `{ 'About you': ['first_name', …], … }` for every editable thing, and every
 * editor walked it the same way with its own field renderer at the bottom. One walk now, so a group
 * of hour codes becomes a timetable everywhere rather than only where somebody remembered.
 */
/* A GROUP OF HOUR CODES IS A TIMETABLE. Recognised by the shape of the names rather than by the
   group's title, so renaming it in the backend does not turn it back into a column of boxes.
   ONE TEST, TWO READERS: `fieldsHtml` draws it inside the details sheet, and `availCodes_` finds
   it for the tool on the Tools column. A second spelling of "is this the week grid" is a second
   chance for one of them to stop recognising it. */
const isTimetable_ = list => (list || []).length > 12
  && (list || []).every(f => /^(m|tu|w|th|f|sa|su)\d\d$/.test(f));

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
const isLibraryCard_ = f => /^lib\d+_(name|no|pin)$/.test(String(f || ''));

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
const RETIRED_FIELDS_ = ['library_note'];

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
const isDobBox_ = f => /^dob_[dmy]$/.test(String(f || ''));
const isDob_ = list => (list || []).some(isDobBox_);

function dobBoxes_(value) {
  /* `autocomplete` IS THE HALF A PHONE ACTUALLY USES. `bday-day`/`bday-month`/`bday-year` are the
     WHATWG tokens for exactly these three boxes, so a saved birthday is offered into them; without
     them a phone offers nothing, or offers the wrong thing into all three.
     `maxlength` RATHER THAN A PATTERN, because a pattern refuses after the fact and a maxlength
     stops the fourth digit being typed into a two-digit box in the first place. */
  const box = (f, hint, len, ac) => fieldHtml(f, value(f), {
    placeholder: hint,
    extra: `inputmode="numeric" maxlength="${len}" autocomplete="${ac}" size="${len}"`,
  });
  return `<div class="dob-row" role="group" aria-label="Date of birth">
    <span class="dob-cap">date of birth</span>
    <div class="dob-boxes">
      ${box('dob_d', 'DD', 2, 'bday-day')}
      ${box('dob_m', 'MM', 2, 'bday-month')}
      ${box('dob_y', 'YYYY', 4, 'bday-year')}
    </div>
  </div>`;
}
const isLibrary_ = list => (list || []).some(isLibraryCard_);

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
function shelfSlots_(nums, filled, draw) {
  let last = 0;
  nums.forEach((n, i) => { if (filled(n)) last = i + 1; });
  /* NO SPARE EMPTY SLOT ONCE ONE IS FILLED — `Add another` IS the empty slot, one tap away. An
     empty card as well as the button measured **583px in a 532px pane at 320x568** on a shelf with
     two libraries in it; without it, 475. A shelf with nothing filled still shows one empty slot,
     because a button over nothing is a page with nothing to type into. */
  const show = Math.min(nums.length, Math.max(1, last));
  return nums.map((n, i) => draw(n, i >= show)).join('')
    + (show < nums.length
      ? `<button class="btn quiet shelf-more" data-do="shelf-more">Add another</button>` : '');
}
const shelfFilled_ = (value, names) => names.some(f => String(value(f) ?? '').trim() !== '');

on('shelf-more', el => {
  const shelf = el.closest('.lib-shelf');
  const next = shelf && shelf.querySelector('.lib-card[hidden]');
  if (next) {
    next.hidden = false;
    const box = next.querySelector('input, select');
    try { if (box) box.focus({ preventScroll: true }); } catch {}
  }
  if (!shelf || !shelf.querySelector('.lib-card[hidden]')) el.remove();
});

/* ---------- AND A GROUP OF `qual_N*` NAMES IS A SHELF OF QUALIFICATIONS -------------------------
   RECOGNISED BY THE NAMES, NEVER BY THE GROUP'S TITLE, exactly as the library shelf is. */
const isQualField_ = f => /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/.test(String(f || ''));
const isQuals_ = list => (list || []).some(isQualField_);
/* THE SEVEN BOXES OF ONE SLOT, in the order they are read, compared and put back. */
const QUAL_KEYS = ['', '_level', '_grade', '_board', '_received', '_spec', '_teach'];
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
/* THE CERTIFICATES ARE THE TAILS OF THE TWO LISTS — the same tails `QUAL_CERTS` in core.gs copies, and
   `check-people.js` holds that copy to these. A PGCE or an Enhanced DBS is written plain, as the
   profile card writes it: notation over a certificate would be a raised `Enhanced` with nothing under. */
const QUAL_CERT_SUBJECTS_ = QUAL_SUBJECTS.slice(QUAL_SUBJECTS.indexOf('PGCE'));
const QUAL_CERT_LEVELS_ = QUAL_LEVELS.slice(QUAL_LEVELS.indexOf('Basic'));
function qualShelf_(list, value) {
  const nums = [...new Set((list || []).filter(isQualField_)
    .map(f => String(f).match(/^qual_(\d+)/)[1]))];
  const v = (i, k) => String(value('qual_' + i + (k || '')) ?? '').trim();
  const filled = i => ['', '_level', '_board', '_grade', '_received'].some(k => v(i, k) !== '');
  const groups = [];
  const byKey = {};
  nums.filter(filled).forEach(i => {
    const key = norm(v(i)) || ('#' + i);
    if (!byKey[key]) { byKey[key] = { subject: v(i), slots: [] }; groups.push(byKey[key]); }
    byKey[key].slots.push(i);
  });
  const pool = nums.filter(i => !filled(i));
  /* YOUR SUBJECTS, for the top of every subject list — see `qualPick_`. */
  const mine = groups.map(g => g.subject).filter(Boolean);
  /* A SUBJECT'S COLUMN IS AS WIDE AS ITS OWN NAME, in `ch` because the face is monospaced — so its
     notation sits right after it, as on the profile chip, and its other levels line up under that
     notation rather than under a column sized for some other subject. A shared width made a table of
     it, and `Maths` stood a third of the card away from its own `GCSE`: measured on the first
     screenshot. Never more than 42% of the line, past which a long subject wraps inside its own row. */
  const wide = g => Math.min(18, Math.max(3, String(g.subject || '').length)) + 1;
  const empty = !groups.length;
  return `<div class="q-shelf${empty ? ' is-empty' : ''}">
    ${empty ? `<p class="q-hint">Add what you studied and the certificates you hold — the subject, then the level.</p>` : ''}
    <div class="q-list">${groups.map(g => `<div class="q-subj" style="--q-w:${wide(g)}ch">${
      g.slots.map((i, n) => qualSlot_(i, value, { first: n === 0, mine })).join('')}</div>`).join('')}</div>
    <div class="q-pool" hidden>${pool.map(i => qualSlot_(i, value, { mine })).join('')}</div>
    <div class="tile-row q-adds">${tile_({ icon: 'plus', label: 'Add a qualification', act: 'qual-add', off: !pool.length, data: { unlocked: '' },
      note: pool.length ? pool.length + ' more fit' : 'ten is the most' })}${
      /* HOW THE CARD WORKS, IN THE ROOM BESIDE THE `+` — a line of text that costs no line of its own.
         There is no `Edit` on the card any more, and a list of plain lines does not say by itself
         that a line can be pressed. */
      empty ? '' : '<span class="q-tip">Tap a line to change it.</span>'}</div>
    ${pool.length ? '' : `<p class="faint q-full">Ten is the most this card holds — remove one to add another.</p>`}
  </div>`;
}
/* ---------- ONE QUALIFICATION: ITS LINE, AND ITS EDITOR UNDER IT ----------------------------------------
   The seven `data-me` boxes live in the editor, so they are posted whether it is open or not; the line
   is drawn from the same values and redrawn from the boxes as they change (`qualFaceNow_`), so the line
   and the boxes cannot disagree — and an open line is a preview of what the profile card will say. */
function qualSlot_(i, value, o) {
  o = o || {};
  const f = k => 'qual_' + i + k;
  const val = k => String(value(f(k)) ?? '').trim();
  const q = { subject: val(''), level: val('_level'), grade: val('_grade'), board: val('_board'),
              received: val('_received'), spec: TRUEish_(val('_spec')) };
  q.teach = q.spec || TRUEish_(val('_teach'));
  q.first = !!o.first;
  const seg = q.spec ? 'spec' : q.teach ? 'teach' : 'no';
  /* THE WORDS SAY WHAT THEY DO ON THE PROFILE, in the title, so the sentence that used to sit under the
     control on every editor is there for whoever asks and gone for everybody else. */
  const segB = (v, word, why) => `<button type="button" class="q-seg-b" data-do="qual-teach" data-v="${v}" data-unlocked
      title="${esc(why)}" aria-pressed="${seg === v ? 'true' : 'false'}">${word}</button>`;
  const said = qualSay_(q);
  /* EACH CAPTION IN TWO WORDINGS, a subject's and a certificate's, and the slot's `is-cert` says which
     is shown — so a line that becomes a DBS by a pick changes its captions with no redraw. */
  const cap = (std, cert) => `<span class="q-cap-std">${esc(std)}</span><span class="q-cap-cert">${esc(cert)}</span>`;
  return `<div class="q-slot${qualIsCert_(q) ? ' is-cert' : ''}" data-slot="${esc(i)}"${q.first ? ' data-first="1"' : ''}>
    <input type="hidden" data-me="${esc(f('_spec'))}" value="${q.spec ? 'TRUE' : 'FALSE'}">
    <input type="hidden" data-me="${esc(f('_teach'))}" value="${q.teach ? 'TRUE' : 'FALSE'}">
    <button type="button" class="q-line" data-do="qual-open" data-unlocked aria-expanded="false"
      aria-label="${esc(said)}" title="${esc(said)}">${qualFace_(q)}</button>
    <div class="q-ed">
      <div class="q-row">
        ${qualPick_(`data-me="${esc(f(''))}" class="q-name"`, q.subject, QUAL_SUBJECTS, 'Subject', 'Choose', o.mine)}
        ${qualPick_(`data-me="${esc(f('_level'))}"`, q.level, QUAL_LEVELS, 'Level', 'Choose')}
      </div>
      <div class="q-row">
        ${qualPick_(`data-me="${esc(f('_grade'))}"`, q.grade, QUAL_GRADES, 'Grade', 'None yet').replace('class="field q-f"', 'class="field q-f q-grade"')}
        <label class="field q-f">${cap('Finished', 'Year')}
          <select data-me="${esc(f('_received'))}">${qualYears_(q.received).map(y => `<option value="${esc(y)}"${
            y === q.received ? ' selected' : ''}>${esc(y === 'Present' ? 'Still studying' : y)}</option>`).join('')}
            <option value=""${q.received ? '' : ' selected'}>Not sure</option></select></label>
        <label class="field q-f q-school">${cap('School, college or uni', 'Issued by')}
          <input type="text" data-me="${esc(f('_board'))}" value="${esc(q.board)}" autocomplete="off"></label>
      </div>
      <div class="q-seg" role="group" aria-label="Do you tutor it">${
        segB('spec', 'Teach', 'Shown in gold under Teaches on your profile')}${
        segB('teach', 'Can teach', 'Listed under Can also teach on your profile')}${
        segB('no', 'Not teaching', 'On your profile as a qualification only')}</div>
      <div class="tile-row q-tiles">${tile_({ icon: 'save', label: 'Done', act: 'qual-done', data: { unlocked: '' } })}${
        tile_({ icon: 'bin', label: 'Remove', note: [q.subject, q.level].filter(Boolean).join(' ') || 'this one', act: 'qual-drop',
                data: { unlocked: '' } })}</div>
    </div>
  </div>`;
}
/* THE FACE OF A LINE: the subject (on a subject's first line only), the notation, the teaching mark —
   none on a certificate, which is held and not taught (see `qualIsCert_`). */
function qualFace_(q) {
  const who = q.first || q.fresh ? (q.subject || (q.fresh ? 'New qualification' : '')) : '';
  const cert = qualIsCert_(q);
  return `<span class="q-who${q.subject ? '' : ' is-none'}">${esc(who)}</span>`
    + `<span class="q-note">${qualIso_(q)}</span>`
    + `<span class="q-mark">${cert ? '' : q.spec ? '<span class="q-chip">Teach</span>'
      : q.teach ? '<span class="q-can">Can teach</span>' : ''}</span>`;
}
/* ---------- A CERTIFICATE IS HELD, NOT STUDIED AND NOT TAUGHT --------------------------------------
   The same test the notation uses (and `QUAL_CERTS` in core.gs copies): the subject is one of the
   certificates at the foot of the subject list, or the level is one of the three a DBS comes at.
   *Walked at 390:* the DBS editor offered Grade and `Teach | Can teach | Not teaching`, neither of
   which a certificate has — and Teach would have put "DBS Enhanced" under Teaches on the profile,
   because `teachesOf_` reads the tick and not the kind. So a certificate's editor has no grade and no
   three-way control (`.is-cert` in style.css), its year and its issuer share a row, and the two are
   two rows shorter — the height the open line was costing at 320. */
function qualIsCert_(q) {
  const isIn = (list, x) => !!x && list.some(y => norm(y) === norm(x));
  return isIn(QUAL_CERT_SUBJECTS_, q.subject) || isIn(QUAL_CERT_LEVELS_, q.level);
}
/* ---------- THE NOTATION, BY THE PROFILE CHIP'S RULES ----------------------------------------------------
   `profQualChip_` in cards.js draws the parent's side and this is the same four cases on the tutor's:
   level over grade; a level alone raised (the grade's half held open by `.prof-iso`); still studying
   with no grade said in the grade's place; and a certificate, or a subject with neither, written plain.
   Escaped rather than `mark`ed, because nothing on a settings card is a search result. */
function qualIso_(q) {
  const level = norm(q.level) === norm(q.subject) ? '' : (q.level || '');
  const low = q.grade ? esc(q.grade) : /^present$/i.test(q.received || '') ? '<i>studying</i>' : '';
  if (qualIsCert_(q) || !(level || low)) {
    return `<span class="q-plain">${esc([level, q.grade].filter(Boolean).join(' '))}</span>`;
  }
  return `<span class="prof-iso">${level ? `<sup>${esc(level)}</sup>` : ''}${low ? `<sub>${low}</sub>` : ''}</span>`;
}
/* THE LINE'S NAME: the profile chip's own sentence (`profQualSay_`) and the teaching word — so a screen
   reader and a pointer get the place and the year the face leaves off. */
function qualSay_(q) {
  const base = typeof profQualSay_ === 'function' ? profQualSay_(q)
    : [q.subject, q.level, q.grade && 'grade ' + q.grade, q.board && 'at ' + q.board, q.received].filter(Boolean).join(', ');
  return (base || 'New qualification') + (q.spec ? ', teach' : q.teach ? ', can teach' : '');
}
/* ---------- A DROP-DOWN WITH A CAPTION, AND `Something else…` AT THE FOOT -------------------------
   THE CAPTION SITS INSIDE THE BOX, over the answer (`.q-f` in style.css), rather than above it: it
   stays when something is chosen — a chosen `B` alone does not say which question it answered — and
   it costs no line of its own, which is three lines on an editor of three rows. The full value is the
   option's label, never shortened, and a value already saved that the list does not hold is kept as
   the chosen option, for the reason `fieldHtml` gives. The last option turns the select into a text
   box in place (the listener below), because a subject or a level may be one nobody listed.

   `mine` PUTS YOUR OWN SUBJECTS FIRST, under their own heading in the list (`selHtml_` draws an
   optgroup as one). Fifty-odd subjects is a scroll to reach Maths; a tutor adding a level to a subject
   they already hold is the commonest add there is. Only the first option matching the value is
   marked chosen, so the subject is ticked once, in your list. */
const QUAL_OTHER = '__other';
function qualPick_(attrs, v, list, cap, none, mine) {
  v = String(v ?? '');
  const has = x => !!v && norm(x) === norm(v);
  const yours = [...new Set((mine || []).filter(Boolean))];
  const opts = (v && !list.some(has) && !yours.some(has) ? [v] : []).concat(list);
  let chosen = false;
  const opt = x => {
    const on = !chosen && has(x);
    if (on) chosen = true;
    return `<option value="${esc(x)}"${on ? ' selected' : ''}>${esc(x)}</option>`;
  };
  const body = yours.length
    ? `<optgroup label="Your subjects">${yours.map(opt).join('')}</optgroup><optgroup label="Every subject">${opts.map(opt).join('')}</optgroup>`
    : opts.map(opt).join('');
  return `<label class="field q-f"><span>${esc(cap)}</span><select ${attrs}>
      <option value="">${esc(none)}</option>
      ${body}
      <option value="${QUAL_OTHER}">Something else…</option>
    </select></label>`;
}
/* `Something else…` swaps the select for a box carrying the same attributes, so a save reads it exactly
   as it read the select — and it saves on the box's own `change`, when the typing is finished. */
document.addEventListener('change', e => {
  const sel = e.target;
  if (!sel || sel.tagName !== 'SELECT' || sel.value !== QUAL_OTHER || !sel.closest('.q-shelf')) return;
  const box = document.createElement('input');
  box.type = 'text'; box.autocomplete = 'off'; box.placeholder = 'Type it here';
  [...sel.attributes].forEach(a => box.setAttribute(a.name, a.value));
  sel.replaceWith(box);
  qualDirty_(box);
  try { box.focus({ preventScroll: true }); } catch {}
}, true);
/* THE SLOT'S ANSWERS, READ OFF ITS BOXES — `Something else…` not yet typed counts as no answer. */
function qualRead_(slot) {
  const i = slot.dataset.slot;
  const get = k => {
    const b = slot.querySelector('[data-me="qual_' + i + k + '"]');
    const x = String(b ? b.value : '').trim();
    return x === QUAL_OTHER ? '' : x;
  };
  const q = { subject: get(''), level: get('_level'), grade: get('_grade'), board: get('_board'),
              received: get('_received'), spec: TRUEish_(get('_spec')) };
  q.teach = q.spec || TRUEish_(get('_teach'));
  q.first = !!slot.dataset.first;
  q.fresh = !!slot.dataset.new;
  return q;
}
/* THE LINE FOLLOWS THE BOXES, so an open line is the preview of what is being saved. */
function qualFaceNow_(slot) {
  const line = slot && slot.querySelector(':scope > .q-line');
  if (!line) return;
  const q = qualRead_(slot);
  slot.classList.toggle('is-cert', qualIsCert_(q));
  line.innerHTML = qualFace_(q);
  const said = qualSay_(q);
  line.setAttribute('aria-label', said);
  line.setAttribute('title', said);
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const t = e.target;
  const slot = t && t.closest && t.closest('.q-shelf .q-slot');
  if (slot) qualFaceNow_(slot);
}));
/* ---------- AN ANSWER CHOSEN IS AN ANSWER SAVED --------------------------------------------------------
   Only in an OPEN line, and only on `change` — a pick from a list, a box left after typing — never on
   each keystroke. A line being added asks for its level the moment it has a subject, which is the
   "subject, then level, in one step" the `+` tile promises; it is saved once it has both. */
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('[data-me]') || t.value === QUAL_OTHER) return;
  const slot = t.closest('.q-shelf .q-slot.is-open');
  if (!slot) return;
  const q = qualRead_(slot);
  if (slot.dataset.new && q.subject && !q.level && t.matches('.q-name')) {
    const lv = slot.querySelector('select[data-me$="_level"]');
    setTimeout(() => { if (lv && lv.isConnected && typeof selOpen_ === 'function') selOpen_(lv); }, 0);
    return;
  }
  qualCommit_(slot);
});
/* PROGRAMMATIC CHANGES DO NOT FIRE `input`, so a card changed by a button marks itself dirty — see
   `settingsKeep_`: a column holding an unsaved card is not redrawn under it. AN OPEN LINE COUNTS, even
   once everything in it is saved: the save itself calls `load()`, and the repaint that follows would
   otherwise shut the line between one answer and the next. */
const qualDirty_ = el => { const f = el && el.closest('.me-form'); if (f) f.dataset.dirty = '1'; };
const qualClean_ = el => { const f = el && el.closest('.me-form'); if (f) delete f.dataset.dirty; };
/* THE SLOT'S SEVEN VALUES, as they were last saved (`data-was`) and as the boxes hold them now. */
function qualValues_(slot) {
  const out = {};
  const i = slot.dataset.slot;
  QUAL_KEYS.forEach(k => { const b = slot.querySelector('[data-me="qual_' + i + k + '"]'); out['qual_' + i + k] = b ? b.value : ''; });
  return out;
}
const qualBlank_ = slot => {
  const out = {};
  QUAL_KEYS.forEach(k => { out['qual_' + slot.dataset.slot + k] = /_spec$|_teach$/.test(k) ? 'FALSE' : ''; });
  return out;
};
function qualSet_(slot, vals) {
  Object.keys(vals).forEach(f => { const b = slot.querySelector('[data-me="' + f + '"]'); if (b) b.value = vals[f]; });
}
/* ---------- REDRAWN FROM WHAT THE BOXES HOLD ------------------------------------------------------------
   One renderer: the grouping, which line carries its subject, the pool, and whether the `+` has room
   are all `qualShelf_`'s answer from the values, so a line moved onto another subject joins it, a
   subject whose last line went is gone, and the tenth record turns the `+` off — with nothing here to
   keep in step. `over` is what goes back before the redraw (an open line's last saved answers, or a
   line never saved, emptied); `open` is the slot to open again in the new shelf. */
function qualRedraw_(shelf, over, open) {
  if (!shelf || !shelf.isConnected) return null;
  /* A KEYBOARD STAYS WHERE IT WAS. The line that was pressed is replaced, and focus on a removed
     element falls to the page — so a line opened from the keyboard hands focus to its new self. */
  const had = shelf.contains(document.activeElement);
  const vals = {}, list = [];
  shelf.querySelectorAll('[data-me]').forEach(b => { list.push(b.dataset.me); vals[b.dataset.me] = b.value; });
  Object.assign(vals, over || {});
  const hold = document.createElement('div');
  hold.innerHTML = qualShelf_(list, f => vals[f] ?? '');
  const next = hold.firstElementChild;
  shelf.replaceWith(next);
  const again = open != null && next.querySelector('.q-list .q-slot[data-slot="' + open + '"]');
  if (again) {
    qualOpen_(again);
    if (had) { try { again.querySelector('.q-line').focus({ preventScroll: true }); } catch (e) {} }
  } else if (typeof placeCells === 'function') { try { placeCells('y', true, 0, 'settings'); } catch (e) {} }
  return next;
}
/* WHAT SHUTTING THE OPEN LINE PUTS BACK: its last saved answers — a save that failed said so under the
   card, and leaving its answer in a shut line would post it unseen with the next one — or, for a line
   never saved, nothing at all, so it goes back to the pool. */
function qualOver_(shelf) {
  const over = {};
  shelf.querySelectorAll('.q-slot.is-open').forEach(s => {
    if (s.dataset.new) return Object.assign(over, qualBlank_(s));
    try { Object.assign(over, JSON.parse(s.dataset.was || '{}')); } catch (e) {}
  });
  return over;
}
function qualOpen_(slot) {
  const shelf = slot && slot.closest('.q-shelf');
  if (!shelf) return;
  slot.classList.add('is-open');
  const line = slot.querySelector(':scope > .q-line');
  if (line) line.setAttribute('aria-expanded', 'true');
  if (!slot.dataset.was) slot.dataset.was = JSON.stringify(slot.dataset.new ? qualBlank_(slot) : qualValues_(slot));
  qualDirty_(slot);
  if (typeof placeCells === 'function') { try { placeCells('y', true, 0, 'settings'); } catch (e) {} }
}
/* THE LINE OPENS — and whatever else was open shuts first, as it was last saved. A second tap on the
   open line is the tick.
   AN EMPTY SLOT IS A NEW QUALIFICATION. The pool's lines are not on the page, so nobody taps one — but
   a press can reach one (`check/press.js` presses every action in turn, and on a shelf with nothing
   saved every line it finds is in the pool), and a redraw that changes nothing is a control that does
   nothing. Opening an empty slot is what `+` does with the next one, so that is what it does. */
on('qual-open', el => {
  if (qualWhenSaved_(el)) return;
  const slot = el.closest('.q-slot'), shelf = el.closest('.q-shelf');
  if (!slot || !shelf) return;
  if (slot.classList.contains('is-open')) return qualDone_(slot);
  qualReopen_(shelf, slot);
});
/* THE SLOT OPEN IN A FRESH SHELF — a saved line in its place, an empty one as a new line at the foot —
   with whatever was open before shut as it was last saved. Answers the slot as it is in the new shelf. */
function qualReopen_(shelf, slot) {
  const i = slot.dataset.slot, pooled = !!slot.closest('.q-pool');
  const next = qualRedraw_(shelf, qualOver_(shelf), pooled ? null : i);
  const again = next && next.querySelector('.q-slot[data-slot="' + i + '"]');
  if (again && pooled) qualStart_(next, again);
  return again;
}
/* ---------- THE TICK: ANYTHING NOT YET SAVED IS SAVED, AND THE LINE SHUTS -------------------------------
   Normally there is nothing left to save — every answer went when it was chosen — so this only shuts.
   It saves when a save failed (the answer is still in its box) or a box was typed in and the tick was
   the next thing touched. A line being added with no subject or no level is not a qualification yet,
   so it goes back to the pool unsaved, and the toast says so rather than leaving it to be guessed. */
on('qual-done', el => { if (qualWhenSaved_(el)) return; const slot = el.closest('.q-slot'); if (slot) qualDone_(slot); });
function qualDone_(slot) {
  const shelf = slot.closest('.q-shelf');
  if (!shelf) return;
  const q = qualRead_(slot);
  if (slot.dataset.new && !(q.subject && q.level)) {
    qualClean_(shelf);
    qualRedraw_(shelf, qualBlank_(slot));
    if (q.subject || q.level) toast('Nothing was added — a qualification needs a subject and a level.');
    return;
  }
  qualCommit_(slot, () => { qualClean_(shelf); qualRedraw_(shelf); });
}
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
let QUAL_SAVING = null, QUAL_NEXT = null;
function qualSave_(el) {
  const p = meSave_(el);
  QUAL_SAVING = p;
  const clear = () => { if (QUAL_SAVING === p) QUAL_SAVING = null; };
  p.then(clear, clear);
  return p;
}
function qualWhenSaved_(el) {
  if (!QUAL_SAVING || !el) return false;
  const act = el.dataset.do, v = el.dataset.v || '';
  const slot = el.closest('.q-slot'), i = slot ? slot.dataset.slot : '';
  const form = el.closest('.me-form');
  const mine = QUAL_NEXT = {};
  QUAL_SAVING.then(ok => {
    if (QUAL_NEXT !== mine) return;
    QUAL_NEXT = null;
    if (!ok) return;
    const shelf = (form && form.isConnected && form.querySelector('.q-shelf')) || document.querySelector('#s-settings .q-shelf');
    if (!shelf) return;
    const again = act === 'qual-add' ? shelf.querySelector('[data-do="qual-add"]')
      : shelf.querySelector('.q-slot[data-slot="' + i + '"] [data-do="' + act + '"]' + (v ? '[data-v="' + v + '"]' : ''));
    if (again && !again.disabled && ACTIONS[act]) ACTIONS[act](again);
  }, () => {});
  return true;
}
/* ---------- ONE SAVE: THE CARD'S OWN ------------------------------------------------------------------
   `meSave_` gathers all seventy boxes and posts them through `send_`, so the tick spins and the card
   is locked while it is on the wire. Refused before anything is sent when the line has no subject or
   no level — the two things that make it a qualification — except for a line still being added, which
   is simply not saved yet. A line that moved subject, or was just added, is redrawn into its group and
   opened again there, so the next answer goes on where the person is. */
function qualCommit_(slot, after) {
  const shelf = slot.closest('.q-shelf');
  if (!shelf) return;
  const i = slot.dataset.slot;
  const q = qualRead_(slot);
  if (!q.subject || !q.level) {
    if (!slot.dataset.new) toast(q.subject ? 'Choose a level — nothing was saved.' : 'Choose a subject — nothing was saved.');
    return;
  }
  /* A CERTIFICATE KEEPS NO GRADE AND NO TEACHING TICK — its editor has neither box to show, and an
     answer nobody can see is one nobody can take back. A line moved onto DBS from Maths sheds them here,
     before the comparison, so the move itself is what posts them empty. */
  if (qualIsCert_(q)) {
    qualSet_(slot, { ['qual_' + i + '_grade']: '', ['qual_' + i + '_spec']: 'FALSE', ['qual_' + i + '_teach']: 'FALSE' });
    slot.querySelectorAll('[data-do="qual-teach"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === 'no' ? 'true' : 'false'));
    qualFaceNow_(slot);
  }
  if (JSON.stringify(qualValues_(slot)) === slot.dataset.was) { if (after) after(); return; }
  let was = {};
  try { was = JSON.parse(slot.dataset.was || '{}'); } catch (e) {}
  const moved = !!slot.dataset.new || norm(was['qual_' + i] || '') !== norm(q.subject);
  qualSave_(slot.querySelector('[data-do="qual-done"]') || slot).then(ok => {
    if (!ok || !slot.isConnected) return;
    slot.dataset.was = JSON.stringify(qualValues_(slot));
    delete slot.dataset.new;
    if (after) return after();
    qualDirty_(slot);
    if (moved) qualRedraw_(shelf, null, i);
  });
}
/* THE THREE-WAY CONTROL, written into the two hidden boxes and saved. Teach is Teach AND Can teach, which
   is the one rule `qualsIn` keeps; nothing here touches any other line, because *"when i tick teach for
   different levels of same subject it unticks the other one. i dont want that"*.
   A SHUT LINE'S CONTROL IS NOT ON THE PAGE, so a press that reached one anyway — one that raced a
   redraw, or `check/press.js` — opens that line first and then answers, rather than doing nothing. */
on('qual-teach', el => {
  if (qualWhenSaved_(el)) return;
  let slot = el.closest('.q-slot');
  const shelf = el.closest('.q-shelf'), v = el.dataset.v;
  if (!slot || !shelf) return;
  if (!slot.classList.contains('is-open')) {
    slot = qualReopen_(shelf, slot);
    el = slot && slot.querySelector('[data-do="qual-teach"][data-v="' + v + '"]');
    if (!el) return;
  }
  const i = slot.dataset.slot;
  qualSet_(slot, { ['qual_' + i + '_spec']: v === 'spec' ? 'TRUE' : 'FALSE',
                   ['qual_' + i + '_teach']: v === 'no' ? 'FALSE' : 'TRUE' });
  slot.querySelectorAll('[data-do="qual-teach"]').forEach(b => b.setAttribute('aria-pressed', b === el ? 'true' : 'false'));
  qualFaceNow_(slot);
  qualDirty_(el);
  qualCommit_(slot);
});
/* THE NEXT UNUSED SLOT. Moving the element keeps every `data-me` in the form, so a save posts it
   wherever it sits. The `+` is off once the pool is empty (see `qualShelf_`), so this sentence is for a
   press that raced a redraw. */
function qualTake_(shelf) {
  const slot = shelf && shelf.querySelector('.q-pool > .q-slot');
  if (!slot) toast('That is the most this card holds — ten qualifications in all.');
  return slot || null;
}
/* ---------- `+`: A NEW LINE AT THE FOOT, AND ITS SUBJECT LIST ALREADY OPEN ------------------------------
   The list is opened for the person rather than waiting for a second tap on a box they have just been
   handed, and `selOpen_` (book.js) is the same panel every select in the app hangs. Scrolled into the
   pane first, because a list is only hung from a field that can be seen. */
on('qual-add', el => {
  if (qualWhenSaved_(el)) return;
  const shelf = el.closest('.q-shelf');
  if (!shelf) return;
  const next = qualRedraw_(shelf, qualOver_(shelf));
  const slot = qualTake_(next);
  if (slot) qualStart_(next, slot);
});
/* AN EMPTY SLOT, MOVED OUT OF THE POOL AS A NEW LINE AT THE FOOT OF THE LIST, open, emptied and marked
   new — so a Done or a bin before it has a subject and a level puts it back unsaved. */
function qualStart_(next, slot) {
  qualSet_(slot, qualBlank_(slot));
  slot.dataset.new = '1';
  const group = document.createElement('div');
  group.className = 'q-subj is-new';
  group.appendChild(slot);
  next.querySelector('.q-list').appendChild(group);
  qualFaceNow_(slot);
  qualOpen_(slot);
  try { slot.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  const s = slot.querySelector('select.q-name');
  setTimeout(() => { if (s && s.isConnected && typeof selOpen_ === 'function') selOpen_(s); }, 0);
}
/* ---------- REMOVING SAVES AT ONCE ------------------------------------------------------------------
   The line's seven boxes are emptied and the card is saved — an emptied slot is dropped by `qualsIn`
   and goes back to the pool on the redraw. If the save fails the boxes are put back, so the screen
   never shows a removal the sheet did not make. A line being added was never saved, so the bin only
   puts it back. */
function qualRemove_(el, slots, said) {
  const shelf = el.closest('.q-shelf');
  if (!shelf || !slots.length) return;
  const was = slots.map(qualValues_);
  slots.forEach(s => qualSet_(s, qualBlank_(s)));
  qualSave_(el).then(ok => {
    if (ok) { toast(said); qualRedraw_(shelf); }
    else slots.forEach((s, n) => qualSet_(s, was[n]));
  });
}
on('qual-drop', el => {
  if (qualWhenSaved_(el)) return;
  const slot = el.closest('.q-slot'), shelf = el.closest('.q-shelf');
  if (!slot || !shelf) return;
  if (slot.dataset.new) { qualClean_(shelf); qualRedraw_(shelf, qualBlank_(slot)); return; }
  const q = qualRead_(slot);
  let was = {};
  try { was = JSON.parse(slot.dataset.was || '{}'); } catch (e) {}
  const i = slot.dataset.slot;
  /* NAMED BY WHAT WAS SAVED, which is what is being removed — not by a half-changed box. */
  const name = [was['qual_' + i] || q.subject, was['qual_' + i + '_level'] || q.level].filter(Boolean).join(' ');
  qualRemove_(el, [slot], 'Removed ' + (name || 'that qualification') + '.');
});
/* ---------- WHEN IT WAS RECEIVED, AND WHETHER YOU TEACH IT ------------------------------------
   *"remove the studying now widget. could be achieved if each qualification has a date of reception
   and present is an option"* — so a year, or `Present` for a course still running, which is what the
   studying page said in two boxes. A YEAR, NOT A DATE: nobody remembers the day a certificate came,
   and a `<select>` is one tap where a date picker is a calendar to page back through. A value the
   list does not hold (typed into the sheet) is offered anyway, so opening the page cannot lose it. */
/* ---------- *"phone: have field for country code, then number."* --------------------------------
   One cell (`phone`, "+44 7700 900123"); the server splits it into `phone_cc`/`phone_no` for the form
   (`phoneOut`) and packs it back (`phoneIn`), reading an old `07…` as UK. The codes come from the
   server (`DATA.phoneCodes`, off `PHONE_CODES`) so there is one list; `+44` is the floor for a
   deployment that has not sent one, and a code the list lacks is offered rather than lost. */
function phoneRow_(value) {
  const cc = String(value('phone_cc') || '') || '+44';
  /* THE NUMBER IS A DRAFT UNTIL SAVED, as every box of your own row is (`fieldHtml`; 317). */
  const phoneNo = String(value('phone_no') || (value('phone_cc') ? '' : value('phone')) || '');
  const codes = (Array.isArray(DATA && DATA.phoneCodes) && DATA.phoneCodes.length) ? DATA.phoneCodes.slice() : ['+44'];
  if (codes.indexOf(cc) === -1) codes.unshift(cc);
  return `<div class="f-rowwrap"><span class="dob-cap">phone</span>
    <div class="f-row is-phone">
      <label class="field"><select data-me="phone_cc" aria-label="Country code">
        ${codes.map(x => `<option value="${esc(x)}"${x === cc ? ' selected' : ''}>${esc(x)}</option>`).join('')}
      </select></label>
      <label class="field"><input type="tel" data-me="phone_no" inputmode="tel" autocomplete="tel-national"
        placeholder="Number" value="${esc(draftVal_('set', 'phone_no', phoneNo))}"${draftAttr_('set', 'phone_no', phoneNo)}></label>
    </div></div>`;
}
function qualYears_(current) {
  const now = new Date().getFullYear(), out = ['Present'];
  for (let y = now; y >= now - 60; y--) out.push(String(y));
  if (current && out.indexOf(String(current)) === -1) out.splice(1, 0, String(current));
  return out;
}
/* ---------- ONE SHELF, ONE CARD PER LIBRARY -----------------------------------------------------
   BUILT FROM THE FIELD LIST THE BACKEND SENT, not from a count written here. `LIBRARY_CARDS` is a
   constant in `constants.gs` and the nine names are derived from it there; a `3` written again on
   this side would be the second copy this repository keeps paying for — and a fourth library would
   then draw three cards and silently drop the fourth's answers on every save.

   THE NAME IS THE WIDE ONE. A borough's name is words and a PIN is four digits, so the row is
   `1fr` and `max-content`; the card number is its own line because it is the longest thing on the
   shelf and the one somebody reads back digit by digit.

   NO `<h4>` PER CARD. A heading per library is three more lines of chrome on the group that could
   not fit in the first place; the name box IS the heading, and its own caption says so. */
function libraryShelf_(list, value) {
  const nums = [...new Set((list || []).filter(isLibraryCard_)
    .map(f => String(f).match(/^lib(\d+)_/)[1]))];
  return `<div class="lib-shelf">${shelfSlots_(nums,
    i => shelfFilled_(value, ['lib' + i + '_name', 'lib' + i + '_no', 'lib' + i + '_pin']),
    (i, hide) => `
    <div class="lib-card"${hide ? ' hidden' : ''}>
      <div class="lib-row">
        ${fieldHtml('lib' + i + '_name', value('lib' + i + '_name'), { placeholder: 'Library' })}
        ${fieldHtml('lib' + i + '_pin', value('lib' + i + '_pin'), { placeholder: 'PIN' })}
      </div>
      ${fieldHtml('lib' + i + '_no', value('lib' + i + '_no'), { placeholder: 'Card number' })}
    </div>`)}</div>`;
}

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
const isPhotoField_ = f => /^photos_\d+$/.test(String(f));
const isPhotos_ = list => (list || []).some(isPhotoField_);
function photoShelf_(list, value) {
  const nums = (list || []).filter(isPhotoField_).map(f => String(f).match(/^photos_(\d+)$/)[1]);
  return `<div class="lib-shelf ph-shelf">${shelfSlots_(nums,
    i => shelfFilled_(value, ['photos_' + i]),
    (i, hide) => {
      const v = String(value('photos_' + i) || '').trim();
      return `<div class="lib-card ph-slot"${hide ? ' hidden' : ''}>
        <span class="ph-thumb">${v ? `<img src="${esc(pic(v))}" alt="" loading="lazy">` : ''}</span>
        ${fieldHtml('photos_' + i, v, { placeholder: 'Another photo link',
          extra: 'type="url" inputmode="url" autocomplete="off" spellcheck="false"' })}
      </div>`;
    })}</div>`;
}
/* THE PREVIEW FOLLOWS THE BOX as it is typed into, so the check above does not wait for a Save. One
   listener for the document, which is how every other input here is heard. */
document.addEventListener('input', e => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('.ph-slot input')) return;
  const thumb = t.closest('.ph-slot').querySelector('.ph-thumb');
  const v = String(t.value || '').trim();
  if (thumb) thumb.innerHTML = /^https?:\/\/\S+$/i.test(v) ? `<img src="${esc(pic(v))}" alt="">` : '';
});

/* ---------- YOUR PICTURE, CHOSEN RATHER THAN LINKED ---------------------------------------------
   A SQUARE PREVIEW, `Choose photo` AND `Remove`. The preview is what the picture will be — the
   photograph cropped square, or with none the face you have without one: your wardrobe figure if you
   have dressed it, the initial if not, which is the same letter the card draws. Square because a
   photograph on this site is square (the camera's still, a post's grid, the photo shelf's
   thumbnails); the card rounds it into its circle itself.

   TILES, BECAUSE THIS IS A THING — your picture — and the two actions are actions ON it, not the
   buttons of a form: each saves itself, there is nothing to fill in first, and the card's own Save
   does not touch it. The file input is hidden and `Choose photo` opens it, which is how the camera's
   `Photos` side opens its own; `accept="image/*"` with no `capture`, so a phone offers the gallery
   AND the camera rather than forcing one.

   ONE LINE UNDER THE ROW says what happened, the `.me-said` of every other card. */
function photoPicker_(value) {
  const v = String(value('photo') || '').trim();
  return `<div class="pfp">
    <span class="pfp-face">${pfpFace_(v)}</span>
    <div class="pfp-side">
      <div class="tile-row">
        ${tile_({ icon: 'photo', label: 'Choose photo', act: 'pfp-pick' })}
        ${tile_({ icon: 'bin', label: 'Remove', act: 'pfp-remove', off: !v })}
      </div>
      <p class="faint pfp-said">${v ? 'Your picture on your card.' : 'No picture yet — your card shows this instead.'}</p>
    </div>
    <input type="file" class="pfp-in" accept="image/*" hidden>
  </div>`;
}
function pfpFace_(v) {
  if (v) return `<img src="${esc(pic(v))}" alt="Your profile picture">`;
  /* THE WARDROBE FIGURE ONLY IF IT HAS BEEN DRESSED. Every handle has a figure — `avatarConfig`
     seeds one from the hash — but an undressed one is a stranger's face as far as its owner knows,
     and the initial is what everybody else sees on the card. */
  if (USER && USER.avatar && typeof avatarFor === 'function') {
    return avatarFor(USER.handle || USER.name, 56, USER.avatar);
  }
  const who = (USER && ((USER.profile && USER.profile.first_name) || USER.name)) || '?';
  return `<span class="pfp-none">${esc(String(who).trim().slice(0, 1).toUpperCase() || '?')}</span>`;
}

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
const PFP_SIZE = 600;
function pfpPrepare_(file) {
  if (typeof camItemOf_ !== 'function') return Promise.resolve(null);
  return camItemOf_(file).then(it => {
    if (!it || it.kind !== 'image' || !it.data) return null;
    return new Promise(done => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 1, h = img.naturalHeight || 1, s = Math.min(w, h);
        const out = Math.max(1, Math.min(PFP_SIZE, s));
        const cv = document.createElement('canvas');
        cv.width = cv.height = out;
        try {
          cv.getContext('2d').drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, out, out);
          done(cv.toDataURL('image/jpeg', 0.85));
        } catch (e) { done(null); }
      };
      img.onerror = () => done(null);
      img.src = it.data;
    });
  }).catch(() => null);
}

/* WHAT THE SERVER SAID THE PICTURE NOW IS, written everywhere this phone keeps it: your profile (what
   the Settings page reads), the remembered sign-in (what the next visit reads before the network),
   and any row of the payload that is you, so your own card on the You column changes too rather than
   waiting for the next load. Then the picker is redrawn from it. */
function pfpTake_(box, url) {
  if (!USER) return;
  USER.profile = Object.assign({}, USER.profile || {}, { photo: url });
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
  ['tutors', 'people', 'students', 'clients'].forEach(k => ((DATA && DATA[k]) || []).forEach(r => {
    if (r && USER.personId && (r.personId === USER.personId || r.person_id === USER.personId || r.id === USER.personId)) {
      if ('image' in r) r.image = url;
      if ('photo' in r) r.photo = url;
    }
  }));
  if (box && box.parentNode) box.outerHTML = photoPicker_(f => (f === 'photo' ? url : ''));
}

on('pfp-pick', el => {
  const inp = el.closest('.pfp') && el.closest('.pfp').querySelector('.pfp-in');
  if (inp) inp.click();
});
on('pfp-remove', el => {
  const box = el.closest('.pfp');
  if (!USER || !box) return;
  send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, remove: true },
        { button: el, where: box.querySelector('.pfp-said'), saying: 'Removing…', lock: box })
    .then(d => { pfpTake_(box, (d && d.photo) || ''); toast('Picture removed'); })
    .catch(() => {});
});
/* `change`, NOT A `data-do` CLICK — a file input reports its choice by changing, the camera's
   `cam-pick` argument. The value is cleared so choosing the same picture again still fires. */
document.addEventListener('change', e => {
  const inp = e.target;
  if (!inp || !inp.matches || !inp.matches('.pfp-in')) return;
  const file = (inp.files || [])[0];
  inp.value = '';
  const box = inp.closest('.pfp');
  if (!file || !box || !USER) return;
  const said = box.querySelector('.pfp-said');
  const btn = box.querySelector('[data-do="pfp-pick"]');
  if (said) said.textContent = 'Getting it ready…';
  pfpPrepare_(file).then(data => {
    if (!data) { if (said) said.textContent = 'That file is not a picture this phone can read. Try another.'; return; }
    /* THE PREVIEW CHANGES BEFORE THE UPLOAD, so the crop is seen while it travels; if the server
       refuses, the line says why and the old picture comes back with the redraw below. */
    const face = box.querySelector('.pfp-face');
    if (face) face.innerHTML = `<img src="${esc(data)}" alt="Your profile picture">`;
    return send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, data },
                 { button: btn, where: said, saying: 'Saving…', lock: box })
      .then(d => { pfpTake_(box, (d && d.photo) || ''); toast('Picture saved'); })
      .catch(() => {
        const was = (USER.profile && USER.profile.photo) || '';
        if (face) face.innerHTML = pfpFace_(was);
      });
  });
});

/* THE HOUR CODES, WHEREVER THE BACKEND PUT THEM. The group's title is the backend's to choose, so
   this looks for the shape rather than for a name — and answers an empty list when no deployment
   has sent one, which is what the widget reports instead of drawing a week with no hours in it. */
function availCodes_() {
  const groups = (DATA && DATA.profileFields) || {};
  const hit = Object.keys(groups).find(g => isTimetable_(groups[g]));
  return hit ? groups[hit] : [];
}

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
function fieldsHtml(groups, o) {
  o = o || {};
  const head = o.head || 'h2';
  const value = o.value || (() => '');
  const plain = (f, extra) => fieldHtml(f, value(f), Object.assign({
    attr: o.attr,
    label: ROW_LABEL[f],
    options: o.options ? o.options(f) : null,
    suggest: o.suggest ? o.suggest(f) : null,
    readonly: (o.readonly || []).indexOf(f) !== -1,
  }, extra));
  return Object.keys(groups).map(g => {
    const list = (groups[g] || []).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
    const timetable = isTimetable_(list);
    /* THE SHELF, THEN WHATEVER ELSE IS IN THE GROUP. The shelf takes the card fields and the rest
       of the list is drawn under it in the usual way — one `filter`, rather than a second group in
       the backend that would then need a heading of its own. (`library_note` used to be that rest;
       it is filtered off the list above — see `RETIRED_FIELDS_`.) */
    const library = !timetable && isLibrary_(list);
    const quals = !timetable && isQuals_(list);
    /* ---------- AND THE THREE DATE BOXES, WHICH REPLACE ONE FIELD RATHER THAN JOINING IT --------
       `date_of_birth` IS STILL IN THE GROUP because the backend's list names columns and that is
       the column. Drawing it as well as the three boxes would be the same fact twice on one card —
       the roster's `<h3>` over every widget's own heading, one form along — and the extra box would
       post a fourth value that `wanted` would happily write straight over what the boxes just said.
       So it comes OUT of `rest` and the row goes in its place. */
    /* EITHER SHAPE. The backend's group list names COLUMNS, so today it says `date_of_birth` — and
       `isDob_` is asked as well so a deployment that ever sends the three box names draws the same
       row rather than three bare boxes. One test, both spellings, which is the `isTimetable_`
       argument: a renderer that recognises only what is sent today stops recognising it the day
       the backend is tidied. */
    const wantsDob = !timetable && (list.indexOf('date_of_birth') !== -1 || isDob_(list));
    /* THE PHONE, AS A CODE AND A NUMBER — the birthday's arrangement: `phone` is the column the
       group names, the two boxes are what is drawn, and it comes out of `rest` so it is not drawn
       twice. Drawn where `phone` sat in the list rather than at the foot. */
    const wantsPhone = !timetable && list.indexOf('phone') !== -1;
    /* THE PHOTOGRAPH SHELF GOES UNDER THE REST, not over it as the library one does: the page
       reads profile photo, video, then the others, which is the order somebody thinks of them in. */
    const photos = !timetable && isPhotos_(list);
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
    const picture = !timetable && o.attr === 'data-me' && list.indexOf('photo') !== -1;
    const rest = list.filter(f => !(library && isLibraryCard_(f)) && !(quals && isQualField_(f))
                              && !(photos && isPhotoField_(f)) && !(picture && f === 'photo')
                              && !(wantsDob && (f === 'date_of_birth' || isDobBox_(f))));
    const body = timetable
      ? availGrid_(list, o.raw || {}, o.readonly || [], o.attr === 'data-me')
      : (picture ? photoPicker_(value) : '')
      + (library ? libraryShelf_(list, value) : '')
      + (quals ? qualShelf_(list, value) : '')
      + (wantsDob ? dobBoxes_(value) : '')
      + fieldRows_(rest, (f, extra) => f === 'phone' && wantsPhone ? phoneRow_(value) : plain(f, extra))
      + (photos ? photoShelf_(list, value) : '');
    return `<${head}><span>${esc(g)}</span></${head}>` + body;
  }).join('');
}

/* The sheet writes TRUE/FALSE as text and the payload sends real booleans; rows written by older
   versions send neither consistently. One reader for all three. */
const TRUEish_ = v => v === true || /^(true|yes|1|✓)$/i.test(String(v ?? '').trim());

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
function initAvail() {
  const into = $('avail-box');
  if (!into) return;
  if (!USER) { into.innerHTML = `<p class="note">Sign in to set your hours.</p>`; return; }

  const codes = availCodes_();
  /* THE BACKEND HAS NOT SENT THE HOURS, WHICH IS NOT THE SAME FACT AS A TUTOR WHO HAS TICKED
     NOTHING — and drawing an empty week for the first would be this repository’s oldest fault:
     *I did not manage to look*, printed as *I looked and there was nothing there*. A deployment
     older than `profileFields` says so and offers the sheet, which is where it used to live. */
  if (!codes.length) {
    into.innerHTML = `<p class="note">The hours have not arrived from the server yet.<br>
      <span class="faint">Settings → the week grid is there when they do.</span></p>`;
    return;
  }

  into.innerHTML = availGrid_(codes, USER.profile || {}, DATA.profileReadonly || [], true)
    + `<div class="tile-row">${tile_({ icon: 'save', label: 'Save my hours', act: 'me-save' })}</div>
       <p class="faint me-said"></p>`;
}

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
on('me-save', el => { meSave_(el); });
/* ---------- THE SAVE ITSELF, LIFTED OUT SO THE QUALIFICATION EDITORS CAN CALL IT ---------------------
   The qualifications card has no Save tile: each answer on it is saved as it is chosen (see
   `qualShelf_`). So the round trip is a function both call rather than a second copy of it, and it
   answers whether the card was kept — `true` once the server has said so, `false` for a refusal said
   here or there — so a line can take its next answer on a yes and keep the unsaved one in its box,
   for the tick to try again, on a no. */
function meSave_(el) {
  return new Promise(resolve => {
  /* AND A THIRD SURFACE, WHICH IS THE SETTINGS COLUMN. Each group the backend sends is a card of
     its own there with its own Save, so the container has to be that card's form and not the
     document: `document.body` would gather the profile fields AND the seventy-seven hour codes on
     the page below, and `availGridIn` rebuilds the whole availability cell from whatever hour codes
     arrive — so a Save on "About you" would post half a week and erase the other half. */
  const box = el.closest('.me-form') || el.closest('#sheet-body') || el.closest('.widget-slot')
           || document.body;
  const said = box.querySelector('.me-said');
  /* GATHERED BEFORE `send_` LOCKS THE CARD. The lock disables every box, and this skips a disabled
     one on purpose (a locked field is not an answer) — so gathering afterwards would post nothing. */
  const fields = {};
  box.querySelectorAll('[data-me]').forEach(box => {
    if (box.disabled) return;
    fields[box.dataset.me] = box.type === 'checkbox' ? (box.checked ? 'TRUE' : 'FALSE')
                                                     : String(box.value || '').trim();
  });
  /* A QUALIFICATION WITH NO SUBJECT. `Add a subject` left unnamed saved as `:GCSE::8` — a card with
     no name that never counted towards what you teach. Said here, before anything is sent, because
     dropping it on the server would be something typed and gone under a toast saying Saved. */
  /* ASKED OF EACH SLOT: its `qual_N` box (the subject's select) is the name that is saved, and any
     visible box with an answer in it is a qualification. Hidden boxes are skipped because Teach and
     Can teach are hidden and always hold a word. */
  const nameless = [...box.querySelectorAll('.q-shelf .q-slot')].some(slot => {
    const n = slot.querySelector('[data-me="qual_' + slot.dataset.slot + '"]');
    return !(n && String(n.value || '').trim())
      && [...slot.querySelectorAll('[data-me]')].some(b => b.type !== 'hidden' && String(b.value || '').trim());
  });
  if (nameless) { toast('Choose a subject for each qualification first — nothing was saved.'); return resolve(false); }
  /* ---------- NOT FROM A COPY OF YOUR SETTINGS THAT CANNOT BE TRUE ------------------------------
     THE SIGN-IN REPLY SENT THE RAW CELLS FOR MONTHS, so every phone signed in before it was repaired
     holds a profile with no phone boxes, no birthday boxes and an empty qualification shelf — and a
     Save from that form writes those blanks over the sheet. `profileOf_` always sends `phone_cc`, so
     its absence is the one test that tells the broken shape apart. Nothing is sent from it; the
     sheet's own copy is asked for, and the form is redrawn from that. */
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
  if (!profileShapeOk_()) {
    const packed = Object.keys(fields).some(k => PACKED_FIELD_.test(k));
    const blocked = () => { if (said) said.textContent = OLD_SERVER_SAY_
      + ' Until then this card is not sent, because its boxes may be empty and saving would wipe what the sheet holds.'; };
    if (PROFILE_SERVER_OLD) { if (packed) { blocked(); return resolve(false); } return saveNow(); }
    if (said) said.textContent = 'Your saved details are still loading from the sheet, so nothing was sent. Try again in a moment.';
    profileRefresh_(true, () => (packed ? (blocked(), resolve(false)) : saveNow()));
    /* NOT SENT YET, AND THE CALLER IS TOLD SO — a refresh that ends in `saveNow` saves the card, but
       an editor waiting on this would otherwise wait for ever on the path that never calls back. */
    resolve(false);
    return;
  }
  saveNow();
  function saveNow() {
  /* `send_`, NOT `api()`. `api()` resolves with whatever the server said, and this disabled only the
     button: no spinner, every box still live, and a headline edited while the request was on the
     wire was silently lost — measured. `send_` spins the button, locks the card's boxes, puts them
     back afterwards, and writes a refusal into this card's own line. */
  send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '',
          target: USER.name, targetId: USER.personId || '', fields },
        { button: el, busy: 'Saving…', where: said })
    .then(d => {
      /* THE SERVER'S OWN READING OF THE ROW, NOT WHAT WAS TYPED. `updateProfile` answers with
         `profileOf_` of the row after the write — the phone repacked, the specialism derived from the
         ticks, a birthday normalised — so the next Save starts from the sheet. An older backend sends
         no profile, and the typed fields are merged as they always were. */
      USER.profile = (d && d.profile) ? d.profile : Object.assign({}, USER.profile || {}, fields);
      /* ON THE SHEET NOW, SO EACH FIELD SENT IS NO LONGER A DRAFT (`fieldHtml`; 317). */
      Object.keys(fields).forEach(f => { try { draftDrop_('set', f); } catch (e) {} });
      if (d && d.name) USER.name = d.name;
      /* A CORRECTED PENDING ADDRESS IS STILL PENDING, at the new address — the held cards say which. */
      if (d && d.pendingEmail !== undefined) { accountChanged_(); USER.pendingEmail = String(d.pendingEmail || ''); }
      /* ---------- "SAVED" IS NOT THE WHOLE STORY WHEN AN ADDRESS WAS TYPED ---------------------------------
         A new address waits to be proved, or was sent a fresh link (`updateProfile`), and "Saved" over a box
         still showing it reads as done. The server's sentence, in the toast and on the line under the card. */
      const word = (d && d.said) || 'Saved';
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      if (box.closest('#sheet-body')) closeSheet();
      /* THIS CARD IS CLEAN NOW, so a repaint may redraw it — see `settingsKeep_`. */
      const form = el.closest('.me-form');
      if (form) delete form.dataset.dirty;
      /* NOT ON THE QUALIFICATIONS CARD, WHICH SAVES ON EVERY ANSWER. *Walked:* after its first answer the
         line under it said "Saved" for the rest of the session — through a reload, under ten untouched
         lines — beside the toast saying the same, and it cost the card a line. There the toast is the
         receipt and the line is for a refusal only, so a success CLEARS it: the refusal from a save that
         failed is not left standing under the one that worked. */
      const quiet = !!box.querySelector('.q-shelf');
      if (said) said.textContent = quiet ? '' : word;
      toast(word);
      const at = [...document.querySelectorAll('#s-settings .me-form')].indexOf(form);
      const lineAt = () => at < 0 ? null
        : (document.querySelectorAll('#s-settings .me-form')[at] || {}).querySelector?.('.me-said');
      /* THE CARD IS REDRAWN WHEN AN ADDRESS WAS TYPED — the line under the box and the tile beside Save
         come and go with a waiting address, and nothing else repaints this card when the Save changed no
         cell. The sentence is written again on the card that replaces this one. */
      if (d && d.said) {
        try { paint('settings'); placeCells('y', true, 0, 'settings'); } catch (e) {}
        const el2 = lineAt(); if (el2) el2.textContent = word;
      }
      /* THE PUBLIC CARD IS BUILT BY `doGet`, so it only moves when the payload does — but only when
         something was written. A Save that changed nothing writes nothing and leaves the stored
         payload alone, so fetching it again would be a full rebuild to learn nothing. `changed` is
         absent from an older backend, which is treated as "something changed", as before. */
      if (!d || d.changed === undefined || d.changed > 0) sayAfterLoad_(lineAt, quiet ? '' : word);
      resolve(true);
    })
    .catch(() => { /* `send_` has already written the refusal under the card. */ resolve(false); });
  }
  });
}

/* ---------- "SAVED" SURVIVES THE REPAINT IT CAUSES ------------------------------------------------
   A Save that wrote something calls `load()`, and the repaint rebuilds the card — so the line
   under it that had just said "Saved" (or "You were patparent.") was back to its default within a
   second, and only the toast was left saying anything. The line is written again on the rebuilt
   card, found by where it is rather than by the element that no longer exists. */
function sayAfterLoad_(find, text) {
  Promise.resolve(load()).then(() => setTimeout(() => {
    const el = find(); if (el) el.textContent = text;
  }, 0), () => {});
}

/* THE FIELD NAMES THAT ARE HALVES OF ONE CELL — see the old-server note in `me-save`. Hour codes are
   a day prefix and an hour; the rest are the prefixes `fieldsHtml` expands a packed column into. */
const PACKED_FIELD_ = /^(phone_(cc|no)|dob_[dmy]|qual_\d+(_|$)|lib\d+_|photos_\d+|(m|tu|w|th|f|sa|su)\d{1,2})$|^(qual_\d+_\w+|lib\d+_\w+)$/;
let PROFILE_SERVER_OLD = false;
const OLD_SERVER_SAY_ = 'The server in Apps Script is older than this site. Update the backend (pull from GitHub, then Deploy \u2192 Manage deployments \u2192 New version).';

/* ---------- WHICH SETTINGS CARDS HAVE SOMETHING TYPED INTO THEM -----------------------------------
   A CARD IS DIRTY FROM ITS FIRST KEYSTROKE UNTIL IT IS SAVED, and while any card on the column is,
   `paint` leaves the column alone — see the note there. Marked from the events rather than by
   comparing each box with its `defaultValue`, because the qualification shelf and the anchored
   multi-selects keep their answer in a HIDDEN input, whose `value` and `defaultValue` are the same
   attribute: a comparison would call a picked subject clean. */
document.addEventListener('input', e => {
  const f = e.target && e.target.closest && e.target.closest('#s-settings .me-form');
  if (f) f.dataset.dirty = '1';
});
document.addEventListener('change', e => {
  const f = e.target && e.target.closest && e.target.closest('#s-settings .me-form');
  if (f) f.dataset.dirty = '1';
});
function settingsKeep_(id) {
  if (id !== 'settings' || !USER) return false;
  const el = $('s-settings');
  return !!(el && el.querySelector('.me-form[data-dirty], .me-form.is-sending'));
}

/* ---------- YOUR SETTINGS, AS THE SHEET HOLDS THEM ------------------------------------------------
   `USER.profile` WAS WRITTEN ONCE, BY THE SIGN-IN REPLY, and then kept for the thirty days a session
   lasts — so a change made on another phone, by an admin, or typed into the sheet never reached this
   form, and the next Save posted this phone's old copy back over it. `myProfile` is the backend's
   `profileOf_` of the row the TOKEN resolves to, asked once per app open (see `load()`), and whenever
   a Save finds a copy it cannot trust. A POST rather than a key on the payload: the payload is cached
   and shared, and this carries a birthday, a phone number and library-card PINs. */
let PROFILE_ASKING = false;
function profileShapeOk_() {
  const p = USER && USER.profile;
  return !!p && Object.prototype.hasOwnProperty.call(p, 'phone_cc');
}
function profileRefresh_(loud, onOld) {
  if (!USER || !USER.token || PROFILE_ASKING) return;
  PROFILE_ASKING = true;
  const askedAt = Date.now();
  api({ action: 'myProfile', name: USER.name, personId: USER.personId || '' })
    .then(d => {
      PROFILE_ASKING = false;
      /* ---------- AN ANSWER OLDER THAN WHAT THE PHONE NOW KNOWS IS NOT PAINTED -----------------------------
         FOUND BY ROUND THREE OF THE PR #130 REVIEW: at start-up this request and the confirmation link's
         run side by side, and when this one answered second it put back "still waiting" — the held card
         stayed under a toast saying "you can make your child's account now", until the next refresh. The
         link (or a sign-in, or a moved address) marks the moment (`accountChanged_`); a reply to a
         question asked before it is asked again instead, and the second answer is the server's newer one. */
      if (askedAt < ACCOUNT_AT_) { if (d && d.success) profileRefresh_(loud, onOld); return; }
      /* AN OLD SERVER, NOT A FAULT. "That action is not recognised" is the server saying it predates
         this site — remembered, so the next save does not ask again, and never shown raw. */
      if (d && d.error && /unknown action|not recognis/i.test(String(d.error))) {
        PROFILE_SERVER_OLD = true;
        if (typeof onOld === 'function') return onOld();
        if (loud) toast(OLD_SERVER_SAY_);
        return;
      }
      if (!d || !d.success || !d.profile || !USER) {
        if (loud && d && d.error) toast(d.error);
        return;
      }
      /* ONLY FOR THE PERSON STILL SIGNED IN. A reply that lands after somebody else has signed in on
         this phone is about the previous person. */
      if (USER.personId && String(d.personId) !== String(USER.personId)) return;
      if (!USER.personId) USER.personId = d.personId;
      USER.profile = d.profile;
      if (d.agreementSignedAt !== undefined) {
        USER.agreementSignedAt = d.agreementSignedAt; USER.agreementVersion = d.agreementVersion;
      }
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
      /* `pendingEmail` RIDES WITH THE ROLE, for the role's reason: it decides which cards are drawn (the
         held make-child card, the line under your own card), and it goes stale the same way — the link
         opened on a laptop, the address proved by Google on another phone. */
      const roleWas = JSON.stringify([USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || '')]);
      if (d.role) USER.role = d.role;
      if (Array.isArray(d.roles) && d.roles.length) USER.roles = d.roles;
      if (d.tutorPending !== undefined) USER.tutorPending = !!d.tutorPending;
      if (d.pendingEmail !== undefined) USER.pendingEmail = String(d.pendingEmail || '');
      const roleMoved = JSON.stringify([USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || '')]) !== roleWas;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      if (roleMoved) { try { repaint(); } catch (e) {} return; }
      /* REDRAWN IF IT IS DRAWN — and `paint` itself declines while a card has typing in it. */
      if (typeof screenHasMarkup_ === 'function' && screenHasMarkup_('settings')) {
        try { paint('settings'); placeCells('y', true, 0, 'settings'); } catch (e) {}
      }
    })
    .catch(() => { PROFILE_ASKING = false; });
}
/* `change-pin` opened a sheet of its own. It is three fields at the bottom of `edit-me` now — the
   sheet that already exists for changing your details, which a PIN is one of. */
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
on('handle-shuffle', el => {
  if (!USER) return;
  const card = el.closest('.card');
  const said = card && card.querySelector('.handle-said');
  send_({ action: 'randomiseHandle', name: USER.name, personId: USER.personId || '' },
        { button: el, busy: 'Choosing…', where: said || undefined })
    .then(d => {
      USER.handle = d.handle;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      const shown = card && card.querySelector('.handle-shown');
      if (shown) shown.textContent = d.handle;
      HANDLE_SAID = { pid: String(USER.personId || ''),
                      text: d.was ? 'You were @' + d.was + '.' : 'Changed.' };
      if (said) said.textContent = HANDLE_SAID.text;
      toast('You are @' + d.handle);
      try { load(); } catch (e) {}
    })
    .catch(() => {});
});

on('pin-save', el => {
  const v = id => ($(id) || {}).value || '';
  const said = $('pin-said');
  /* Typed twice, checked here before the server sees it — a PIN you cannot see and typed once is
     a PIN you get locked out by. */
  if (v('pin-new') !== v('pin-again')) { if (said) said.textContent = 'The two new PINs do not match.'; return; }
  /* ---------- THE ONE WHERE A NAME COLLISION LOCKS SOMEBODY OUT ---------------------------------
     `findPerson(S(body.name), S(body.personId))` PREFERS THE ID AND FALLS BACK TO THE NAME, and
     this sent no id. Two people with the same display name and the handler resolves the first row,
     checks the PIN you typed against THEIR PIN, and answers "That is not your current PIN" — to
     somebody who typed their own correctly, with no way to ever change it.

     NOT A WAY IN. The current PIN is still required, so a collision cannot change anybody else's;
     it is a denial rather than a breach. It is on this call above all the others because the answer
     it gives is confidently wrong about the one thing the person is certain of. */
  /* `send_`, SO A SECOND TAP CANNOT POST A SECOND CHANGE. It was `api()` with nothing disabled:
     measured, a double tap posted `changePin` twice, and the second came back refused because the
     first had already changed the PIN it was checking. The three boxes are locked while it is on the
     wire and emptied afterwards — a PIN left sitting in a box is a PIN on the screen. */
  const lock = $('pin-now') && $('pin-now').closest('.pin-row');
  send_({ action: 'changePin', name: USER.name, personId: (USER && USER.personId) || '',
          currentPin: v('pin-now'), newPin: v('pin-new') },
        { button: el, busy: 'Changing…', where: 'pin-said', lock: lock })
    .then(d => {
      /* ---------- A NEW PIN ENDS EVERY SESSION, SO THIS PHONE IS HANDED A NEW ONE ------------------
         The server ends every session the person holds — the point of changing a PIN you think
         somebody else has — and now mints a fresh one for the phone that asked. Kept before anything
         else, because every request after this one would otherwise go out on a dead token and be
         answered "Please sign in again." */
      if (d && d.token) {
        USER.token = d.token;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      }
      ['pin-now', 'pin-new', 'pin-again'].forEach(id => { const b = $(id); if (b) b.value = ''; });
      if (said) said.textContent = 'Changed.';
      toast('PIN changed');
      /* ASKED OF THE DOM, LIKE `me-save` AND `msg-send`. */
      if (el.closest('#sheet-body')) closeSheet();
    })
    .catch(() => {});
});

/* `on('my-referral')` WAS HERE — the referral link sheet. Its card has gone and nothing else opened
   it. The `referral_code` column stays on the people tab; nothing on a phone hands one out now. */

/* `on('ref-send')` WENT WITH IT. It was the Share button INSIDE the referral sheet — reachable from
   nowhere else, so removing the sheet stranded it. `check-doors` named it on the next run. */


/* `LOADED` and `LOAD_FAILED` were declared here and are now in data.js, with the rest of the state.

   THEY WERE IN THE WRONG FILE. Both are read by posts.js and written by shell.js, and neither has
   anything to do with the You screen — they lived here because the skeleton below happened to be
   the first thing that wanted them. That worked only because me.js is loaded before posts.js, which
   is a fact about a list in index.html rather than anything either file states.

   The moment that order changed, or me.js failed to arrive, `posts.js` threw `LOADED is not
   defined` while drawing the first screen — and the app stopped with a message naming a variable
   rather than the file that was missing.

   Shared state goes in data.js. That file loads fourth, before everything that reads it, and it is
   the one place somebody looks for "where does this value live". */

/**
 * A SHAPE OF THE THING THAT IS COMING, not a spinner.
 *
 * A spinner says "wait". This says "a face, a photograph and two lines are about to be here" — so
 * nothing jumps when they arrive, and the wait reads as loading rather than as nothing happening.
 *
 * IT HAS TO MATCH. It used to draw two stacked articles because the feed was a column; the feed is
 * one post per screen now, so it draws ONE, inside the same pager, with the picture taking the
 * same room the real one will. A skeleton in the wrong shape is worse than no skeleton at all —
 * the page still jumps, and it jumps at the exact moment somebody has started reading it.
 *
 * The bars are staggered a little. In lockstep they pulse as one block, which reads as a single
 * animated rectangle; slightly apart they read as separate things arriving.
 */
function skeleton() {
  const bar = (w, h, delay, extra) =>
    `<span class="sk-box" style="width:${w};height:${h};animation-delay:${delay}s${
      extra ? ';' + extra : ''}"></span>`;
  return [`
    <article class="post sk">
      <header class="post-by">
        ${bar('1.9rem', '1.9rem', 0, 'border-radius:50%;flex:none')}
        ${bar('6rem', '.7rem', .08)}
      </header>
      <span class="sk-box sk-pic" style="animation-delay:.16s"></span>
      ${/* THE ROW OF FACES' SHAPE: one 32px pill-round bar where the pills will be, inside the same
            `.post-acts` slot, 6px in top and bottom as each pill is inside its 44px cell — so the
            caption bars under it are where the caption lands and nothing jumps when it swaps in.
            As wide as the six pills are at most (`.reacts` caps a column at 3.75rem), so on a wide
            card the shape stops where the faces will. */''}
      <div class="post-acts">${bar('min(100%, 22.5rem)', '32px', .24, 'border-radius:16px;margin-block:6px')}</div>
      ${bar('80%', '.7rem', .32, 'margin-top:.5rem')}
      ${bar('45%', '.7rem', .4, 'margin-top:.35rem')}
    </article>`];
}