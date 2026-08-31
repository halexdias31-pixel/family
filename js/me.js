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
        <label class="field"><span>your name</span>
          <input id="in-name" autocomplete="username" placeholder="e.g. Halex Dias"></label>
        <label class="field"><span>PIN</span>
          <input id="in-pin" type="password" inputmode="numeric" autocomplete="current-password"></label>
        <button class="btn" data-do="do-signin">Sign in</button>
        ${/* ---------- AND THE OTHER DOOR ----------------------------------------------------------
             DRAWN ONLY WHEN THERE IS AN ID TO DRAW IT FOR. `googleClientId` comes off the payload;
             with no id in the config tab the button is absent rather than present and broken, which
             is the difference between a feature not set up and a feature that does not work.

             THE PIN STAYS. Children mostly do not have Google accounts, and half of the people this
             app signs in are children — so this is a second way in, never a replacement. */''}
        ${(DATA.googleClientId || '') ? `<div class="in-or"><span>or</span></div>
        <div id="g-btn"></div>` : ''}
        <p class="faint" id="in-said" style="margin:.6rem 0 0"></p>
      </div>
      <div class="card tap" data-do="register">
        <h3>No account yet?</h3>
        <p class="sub">Making one takes a name, an email and a PIN.</p>
      </div>`;
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
    ${/* SECOND, and that is the whole point of where it is.
          It was seventh — six swipes across a horizontal carousel from the first thing anybody
          sees. It was drawn correctly the entire time and nobody was ever going to reach it, which
          from the outside is exactly the same as it not existing.

          A prompt to install has one moment: while somebody is still deciding whether this is a
          thing they will come back to. That is near the front or it is nowhere. It costs the space
          only until it is used — once installed it returns nothing and the pane goes. */''}
    ${installCard()}

    ${/* `Your figure` IS A TILE ON YOUR CARD — see `meTiles_`. It was a whole card here, with the
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
    ${/* `Your week` IS A TOOL NOW, in the drawer with the calendar and the notepad — see `WIDGETS`
          in map.js. It was a card here that, for most people most of the time, said only that there
          was nothing to show. */''}
    ${ME_SPLIT}
    ${/* ---------- SOMEBODY WANTS TO ADD YOU TO THEIR FAMILY -----------------------------------
          FIRST, ABOVE EVERYTHING. A claim is somebody saying they are your parent, and it sits
          unanswered until you say. Putting it below the fold would be putting the one thing that
          needs a decision underneath the things that do not. */''}
    ${(DATA.claims || []).map(c => `<div class="card">
      <h3>${esc(c.from)} says they are your parent</h3>
      <p class="sub">Say yes and they will be able to book sessions for you and see how you are
        getting on. Say no and nothing happens.</p>
      <div class="row" style="border:0;gap:.5rem">
        <button class="btn" data-do="claim-yes" data-row="${esc(c.rowIndex)}">Yes, that is my parent</button>
        <button class="btn quiet" data-do="claim-no" data-row="${esc(c.rowIndex)}">No</button>
      </div>
    </div>`).join('')}

    ${/* ---------- AND THE OTHER END OF IT -------------------------------------------------------
          A PARENT ASKS BY NAME. The backend matches on first and last name and refuses politely
          when there are none or more than one — so this asks for exactly those two things and lets
          it answer. Shown to a parent or client; a student has nobody to add. */''}
    ${/* `Add your child` AND `Edit your details` ARE TILES ON YOUR CARD NOW — one mark each, in the
          row under your own face, beside the wardrobe. Three cards you scrolled past, each a heading
          and a sentence, each doing one thing: which is what a tile is. See `meTiles_`. */''}

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

     ONE PANE EACH, after the account and before the messages — the same order the column had, and
     the same `jobCard` stub it drew, so a session looks the same wherever it is met. */
  if (USER) (typeof myJobs_ === 'function' ? myJobs_() : []).forEach(j => pages.push(jobCard(j)));

  return pages.length ? pages : [all];
};

/* Drawn, then filled. `fillMessages` looks for `#msg-body` by id, so it can only run once this
   screen's markup is in the document — the same reason a widget's `start` runs after its page is
   filled rather than while it is being built. A frame later is enough, and it costs nothing on a
   screen nobody is looking at because there is no `#msg-body` to find. */
/* ---------- PUTTING IT ON A PHONE'S HOME SCREEN --------------------------------------------------
   TWO PLATFORMS, TWO COMPLETELY DIFFERENT ANSWERS, and pretending otherwise is why most sites do
   this badly.

   ANDROID has a real API. The browser decides the site is installable, fires `beforeinstallprompt`,
   and hands over an object that opens the actual install dialog when asked. One tap, no
   instructions, nothing to read.

   iOS HAS NO SUCH THING and never has. Safari will not tell a page it is installable and will not
   let a page ask — the only route is Share, then Add to Home Screen, and the only useful thing an
   app can do is say so in the right words at the right moment. Any site claiming a one-tap install
   on an iPhone is showing a button that cannot work.

   SO IT SAYS WHICH. The card knows which phone it is on and gives either the button or the two
   taps, and it does not appear at all once the thing is installed — a prompt to install something
   already installed is the app failing to notice where it is running. */
/* ---------- THE ICON, FROM THE BRAND TAB WHEN THERE IS ONE ----------------------------------------
   `icon.png` IS THE FALLBACK AND IT ALWAYS WORKS. It has to be a real file: the icon is needed
   before any payload has arrived, and iOS will not accept a data URI for `apple-touch-icon` — it
   wants an address it can fetch at the moment somebody taps Add to Home Screen.

   BUT THAT MOMENT IS AFTER THE PAYLOAD LANDS, which is the whole reason this can work at all. iOS
   reads the DOM when the share sheet is used, not when the page loads — so swapping the href once
   `brand!logo_square` is known means the home screen gets YOUR mark rather than the drawn one, with
   nothing to upload and no second file to keep beside the page.

   ONE KEY, THE ONE THAT ALREADY EXISTS. `logo_square` is what the feed already uses for posts made
   as the business, so filling it in does two jobs and there is no new name to remember. */
function brandIcon() {
  const b = (DATA && DATA.brand) || {};
  /* THROUGH `pic()`, WHICH ALREADY EXISTS FOR EXACTLY THIS. A Google Drive share link — the
     `/file/d/…/view?usp=sharing` one you get from the Share button — is a PAGE, not a picture.
     Put it in an `<img>` or an icon and the browser fetches HTML, finds no image, and shows
     nothing: a broken icon with no error anywhere.

     `pic()` in posts.js turns one into the direct address and passes anything else straight
     through. Using it here rather than writing a second converter is the whole point — two
     implementations of one rule is how they come to disagree, and this app has paid for that
     lesson more than once. A square icon wants a square-ish size rather than the feed's 1200. */
  const raw = String(b.logo_square || b.logo_circle || '').trim();
  if (!raw) return;                                  // nothing set: the drawn icon stands
  const url = pic(raw).replace('=w1200', '=w512');
  try {
    const link = document.querySelector('link[rel="apple-touch-icon"]');
    if (link && link.getAttribute('href') !== url) link.setAttribute('href', url);
    /* AND THE MANIFEST, rebuilt with the same image. Chrome reads this when it decides whether to
       offer an install, which is after load — so replacing it here is in time. Written as a data
       URI for the same reason the original is: one fewer file to keep. */
    const man = document.querySelector('link[rel="manifest"]');
    if (man) {
      const m = {
        name: '@family.', short_name: '@family.',
        start_url: './index.html', scope: './',
        display: 'standalone', orientation: 'portrait',
        background_color: '#000000', theme_color: '#12100d',
        icons: [{ src: url, sizes: '512x512', type: 'image/png', purpose: 'any' },
                { src: url, sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
      };
      man.setAttribute('href',
        'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(m)));
    }
  } catch (err) { /* an icon that will not swap is the drawn one, which is fine */ }
}

let INSTALL_PROMPT = null;
window.addEventListener('beforeinstallprompt', e => {
  /* HELD, NOT USED. The browser offers this once and only in response to its own judgement; taking
     it and calling `preventDefault` stops the default bar so the card below can ask at a moment
     that makes sense instead. */
  e.preventDefault();
  INSTALL_PROMPT = e;
  try { repaint(); installBar(); } catch (err) {}
});

/* ALREADY AN APP? `standalone` is how a page knows it was opened from a home screen rather than
   from a browser — `display-mode` on everything modern, and Safari's own property on iOS, which
   answers it there and nowhere else. */
const isInstalled = () =>
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  || window.navigator.standalone === true;

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent)
  /* An iPad since iPadOS 13 reports itself as a Mac, and the only reliable tell is that it has a
     touchscreen — a desktop Safari does not. */
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/* AN EARLIER `installBar` STOOD HERE, with its own `#inst-bar` element and its own
   `on('install-no')` — written in one pass and then written AGAIN in the next, because the first
   had been forgotten. Both were declared, so JavaScript kept the LAST silently: the first was dead
   from the moment the second existed, and the stylesheet's `#inst-bar` rules dressed an element
   nothing produced.

   TWO FUNCTIONS OF ONE NAME IS THE THING `check.js` CANNOT SEE. Both are declared, so nothing is
   undefined; both are reachable by name, so nothing is unused. It is only visible by reading, or by
   noticing that a dismissal is remembered under two different keys. */

/* ---------- THE PROMPT EVERYBODY SEES ------------------------------------------------------------
   A CARD ON THE YOU SCREEN IS NOT A PROMPT. It sat behind a sign-in form and two swipes of a
   carousel, which means the people who most need it — somebody who has just arrived and has no
   account — could never see it at all. An install prompt has to find the person; a person does not
   go looking for an install prompt.

   SO IT IS A BAR, at the bottom, on every screen, signed in or not. It is what every booking site
   does and the reason they all do it is that it works.

   AND IT GOES AWAY AND STAYS AWAY. Dismissed once, remembered — a bar that comes back after being
   refused is the thing people leave a site over. Once installed it never appears again, because
   `isInstalled` is true from then on.

   NOT IMMEDIATELY, EITHER. Three seconds, so it arrives after somebody has seen what the app is
   rather than over the top of it loading — asking somebody to keep a thing they have not looked at
   yet is asking too early. */
const INSTALL_HIDDEN = 'familyInstallHidden';

function installBar() {
  if (isInstalled()) return;
  /* SERVED, OR NOT AT ALL. A page opened from a file cannot be installed by either platform, and a
     bar offering it would be offering something that cannot happen. */
  if (location.protocol === 'file:') return;
  try { if (localStorage.getItem(INSTALL_HIDDEN)) return; } catch (err) {}
  if (document.getElementById('install-bar')) return;
  if (!INSTALL_PROMPT && !isIOS()) return;          // nothing to offer on this browser

  brandIcon();
  const el = document.createElement('div');
  el.id = 'install-bar';
  el.innerHTML = INSTALL_PROMPT
    ? `<div class="ib-say"><b>Keep @family. on your phone</b>
         <span>Opens like an app, no address bar.</span></div>
       <button class="btn" data-do="install">Add</button>
       <button class="ib-x" data-do="install-no" aria-label="Not now">✕</button>`
    /* iOS HAS NO INSTALL API, so the bar can only say where the button is. The share icon is drawn
       rather than named, because "the share button" is not something everybody can find and the
       square-with-an-arrow is unmistakable. */
    /* NO FULL STOP AFTER THE BOLD, and no "below".
       The stop was a single character that could not fit on the line the bold text filled, so it
       wrapped — and a lone `.` on its own row is the gap under the message.
       "Below" was a guess about where Safari's address bar is, and it is a guess that is wrong half
       the time: it sits at the bottom by default and at the top for anybody who has moved it, which
       this phone has. Naming the icon and not its position is right wherever the bar happens to be. */
    : `<div class="ib-say"><b>Keep @family. on your phone</b>
         <span>Tap <svg viewBox="0 0 24 24" class="ib-share"><path d="M12 3v12M12 3l-4 4M12 3l4 4"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path
           d="M5 12v8h14v-8" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round"/></svg> then <b>Add to Home Screen</b></span></div>
       <button class="ib-x" data-do="install-no" aria-label="Not now">✕</button>`;
  document.body.appendChild(el);
  /* Added on the next frame so the slide actually animates — an element created and shown in the
     same tick simply appears. The height is measured once it is in the document and handed to the
     stylesheet, so the space the app makes is exactly the space the bar takes: a hardcoded number
     here would be right on one phone and wrong on the next. */
  requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--ib', el.offsetHeight + 'px');
    document.body.classList.add('has-ib');
    el.classList.add('up');
  });
}

on('install-no', () => {
  /* REMEMBERED, so it is asked once. Somebody who said no is not going to be talked round by being
     asked again on every page. */
  try { localStorage.setItem(INSTALL_HIDDEN, '1'); } catch (err) {}
  const el = document.getElementById('install-bar');
  /* The gap goes with it, and goes FIRST — so the app slides up as the bar slides out rather than
     jumping once it has gone. */
  document.body.classList.remove('has-ib');
  if (el) { el.classList.remove('up'); setTimeout(() => el.remove(), 250); }
});

function installCard() {
  /* Asked here because this is the card that offers the install — so the icon is right by the time
     anybody acts on it, and nothing has to run on a screen nobody is looking at. */
  brandIcon();
  if (isInstalled()) return '';
  if (INSTALL_PROMPT) {
    return `<div class="card"><h3>Put it on your home screen</h3>
      <p class="sub">It opens like an app, full screen, with no address bar.</p>
      <button class="btn" data-do="install" style="margin-top:.6rem">Add to home screen</button>
    </div>`;
  }
  if (isIOS()) {
    /* THE TWO TAPS, NAMED. "Add to Home Screen" is buried far enough down Safari's share sheet that
       "use the share menu" is not instructions — the icon and the exact words are. */
    return `<div class="card"><h3>Put it on your home screen</h3>
      <p class="sub">It opens like an app, full screen, with no address bar.</p>
      <p class="sub">Tap <b>Share</b> at the bottom of Safari — the square with an arrow out of it
        — then scroll down and tap <b>Add to Home Screen</b>.</p>
    </div>`;
  }
  /* EVERYWHERE ELSE, say nothing. A desktop browser either offers this in its own address bar or
     does not do it at all, and a card explaining an install that cannot happen is noise. */
  return '';
}

on('install', el => {
  if (!INSTALL_PROMPT) { toast('Your browser will offer this itself.'); return; }
  el.disabled = true;
  INSTALL_PROMPT.prompt();
  INSTALL_PROMPT.userChoice.then(r => {
    /* THE OFFER IS SINGLE USE. Once it has been shown the browser will not hand it over again, so
       holding a spent one would leave a button that does nothing. */
    INSTALL_PROMPT = null;
    el.disabled = false;
    if (r && r.outcome === 'accepted') toast('Added to your home screen');
    const bar = document.getElementById('install-bar');
    document.body.classList.remove('has-ib');
    if (bar) bar.remove();
    repaint();
  }).catch(() => { INSTALL_PROMPT = null; el.disabled = false; });
});

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
  const said = $('in-said');
  if (said) said.textContent = 'Checking with Google…';
  send_({ action: 'googleLogin', credential: (res && res.credential) || '' }, { where: 'in-said' })
    .then(d => {
      if (!d.success) { if (said) said.textContent = d.error || 'That did not work.'; return; }
      /* THE SAME THREE LINES AS THE PIN PATH, because the reply is the same reply — one function
         builds it on the server for exactly this reason. */
      USER = Object.assign({}, d);
      try { localStorage.setItem('familyUser', JSON.stringify(d)); } catch {}
      toast('Signed in');
      load();
    })
    .catch(err => { if (said) said.textContent = why_(err); });
}

on('do-signin', () => {
  const name = ($('in-name') || {}).value || '';
  const pin = ($('in-pin') || {}).value || '';
  const said = $('in-said');
  if (!name || !pin) { if (said) said.textContent = 'Both, please.'; return; }
  if (said) said.textContent = 'Checking…';
  /* Through `send_`, so a phone with no signal says so rather than doing nothing at all. Signing
     in was one of the five round trips with no failure path: the button simply did not respond. */
  send_({ action: 'verifyLogin', name, pin }, { where: 'in-said' })
    .then(d => {
      if (!d.success) { if (said) said.textContent = d.error || 'That did not work.'; return; }
      /* THE REPLY, PLUS WHAT WE ALREADY KNEW. This was `USER = d` — the reply wholesale — so any
         field the backend did not send simply did not exist on the person afterwards. Not
         hypothetical: `todo` was missing from this reply for weeks and every docket vanished at
         sign-in because of it.
         The name matters most, because it is what every request identifies the person by. A reply
         without one signs somebody in as nobody, and the failure that follows is a booking refused
         for not being signed in, to somebody who plainly is. */
      USER = Object.assign({ name: name }, d);
      if (!USER.name) USER.name = name;
      try { localStorage.setItem('familyUser', JSON.stringify(d)); } catch {}
      toast('Signed in');
      load();
    })
    .catch(err => { if (said) said.textContent = why_(err); });
});

on('signout', () => {
  /* ---------- SIGNING OUT ENDS THE SESSION ON THE SERVER TOO ---------------------------------------
     FORGETTING THE TOKEN ON THIS PHONE IS NOT ENDING A SESSION. A token that still works after
     somebody believed they had left is the one thing sign-out must not leave behind — on a shared
     or lost phone it is the whole of what sign-out was for.
     SENT AND NOT WAITED FOR. The screen must clear whatever the network does; a sign-out that
     hangs because there is no signal is a sign-out that did not happen. */
  try { api({ action: 'signOut' }); } catch (err) {}
  USER = null;
  try { localStorage.removeItem('familyUser'); } catch {}
  toast('Signed out');
  repaint();
});

/* ---------- THE WARDROBE -------------------------------------------------------------------------
   Every slot, every item, with the locked ones showing what they would take. A catalogue you can
   SEE is what makes levelling up mean anything — a list of only what you already own tells you
   nothing about what is next, which is the whole reason to have a level at all.

   The colours are free and come first, because they are what most people change and because
   nobody should have to earn the right to have brown hair. */
/* THE BUILD STAMPS, ON DEMAND. `versionSaid_` is the card that used to sit at the foot of the You
   column; the tile on your own card opens it. Admin-only, because the tile is. */
on('build-said', () => openSheet('Build', versionSaid_()));

on('wardrobe', () => {
  if (!USER) { toast('Sign in first'); return; }
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  const items = wardrobe();
  const level = levelFromXp(USER.xp);

  const swatches = (field, colours) => `<div class="av-swatches">
    ${colours.map((col, i) => `<span class="av-sw${cfg[field] === i ? ' on' : ''}"
      style="background:${col}" data-do="av-colour" data-field="${field}" data-value="${i}"
      title="${esc(col)}"></span>`).join('')}
  </div>`;

  const slotRow = ([slot, label]) => {
    const mine = items.filter(x => x.slot === slot);
    if (!mine.length) return '';
    return `<div class="av-slot">
      <div class="av-slot-name">${esc(label)}</div>
      <div class="av-opts">${mine.map(it => {
        const on = cfg[slot] === it.id;
        /* WHY it is not yours, on the item itself. "Locked" is a state; "Level 8" is a thing you
           can count towards, and the difference is whether the wardrobe is a shop window or a
           list of doors. */
        const why = it.unlocked ? '' : (it.cost ? it.cost + ' cr' : 'Lv ' + it.level);
        return `<button class="av-opt${on ? ' on' : ''}${it.unlocked ? '' : ' locked'}"
          data-do="av-pick" data-slot="${esc(slot)}" data-id="${esc(it.id)}"
          title="${esc(it.name + (why ? ' — ' + why : ''))}">
          ${itemArt(slot, it.id, 34) || '<span class="av-none">—</span>'}
          <span class="av-name">${esc(it.name)}</span>
          ${why ? `<span class="av-why">${esc(why)}</span>` : ''}
        </button>`;
      }).join('')}</div>
    </div>`;
  };

  openSheet('Your figure', `
    <div class="av-wrap av-big" id="av-figure">${avatarFor(USER.handle || USER.name, 120, USER.avatar)}</div>
    ${row('Level', level)}
    ${row('Credits', USER.credits || 0, 'mono gold')}

    <h2>Colours</h2>
    <p class="faint" style="margin:0 0 .4rem">Free, all of them. Nobody earns their own hair.</p>
    <div class="av-slot"><div class="av-slot-name">Skin</div>${swatches('skin', AV_SKIN)}</div>
    <div class="av-slot"><div class="av-slot-name">Hair</div>${swatches('hairColour', AV_HAIR)}</div>
    <div class="av-slot"><div class="av-slot-name">Shirt</div>${swatches('shirt', AV_SHIRT)}</div>

    <h2>Things</h2>
    ${AV_SLOTS.map(slotRow).join('')}
    <p class="faint" id="av-said"></p>`);
});

/* A colour and an item go through the SAME request, because to the server they are the same
   thing: a whole look, re-checked piece by piece. Nothing here decides what anybody may wear. */
function avatarSave(change) {
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  Object.assign(cfg, change);
  const said = $('av-said');
  if (said) said.textContent = 'Saving…';

  /* The figure redraws IMMEDIATELY, before the server answers — picking a colour and waiting a
     second to see it is the difference between a wardrobe and a form. Put back if refused. */
  const before = USER.avatar;
  USER.avatar = Object.keys(cfg).map(k => k + ':' + cfg[k]).join('|');
  const fig = $('av-figure');
  if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);

  api({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg })
    .then(d => {
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      const el = $('av-said');
      if (el) el.textContent = (d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Saved';
      if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);
    })
    .catch(err => {
      USER.avatar = before;
      if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);
      const el = $('av-said');
      if (el) el.textContent = String(err.message || err);
    });
}

on('av-colour', el => avatarSave({ [el.dataset.field]: Number(el.dataset.value) }));
on('av-pick', el => avatarSave({ [el.dataset.slot]: el.dataset.id }));

on('register',    () => toast('Registration is the next thing to wire'));

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
      <input id="fr-add" placeholder="e.g. LuccaD" autocomplete="off"></label>
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

function loadMessages() {
  if (!USER) return Promise.resolve([]);
  return api({ action: 'messages', name: USER.name, personId: USER.personId })
    .then(d => (MESSAGES = (d && d.messages) || []))
    /* A failure leaves whatever was already there rather than emptying the list — an unreachable
       backend is not the same fact as an empty inbox, and showing the second for the first is how
       a network blip reads as everything having been deleted. */
    .catch(() => MESSAGES || []);
}

const emptyMessages_ = `<p class="empty">Nothing yet.<br><span class="faint">Messages about a
     session appear here.</span></p>`;

/* ---------- ONE THREAD PER PERSON ------------------------------------------------------------------
   EVERY MESSAGE WAS IN ONE LIST. A note from a tutor about Tuesday and a note from another parent
   about splitting a class sat in one column, sorted by time, with nothing but a name under each to
   say which conversation you were reading. That is a log, not a chat.

   `withId` IS THE THREAD. The server now says who the other person is on every message — see the
   messages handler in dopost.gs — so grouping is a fact from the sheet rather than a guess from a
   name string.

   MOST RECENT FIRST, because a thread nobody has written to in a month is not the one you opened
   the app for. */
function messageThreads_() {
  const by = {};
  (MESSAGES || []).forEach(m => {
    const k = m.withId || m.withName || '?';
    (by[k] = by[k] || { id: k, name: m.withName || 'Someone', msgs: [] }).msgs.push(m);
  });
  const out = Object.keys(by).map(k => by[k]);
  out.forEach(t => {
    t.unread = t.msgs.filter(m => !m.mine && !m.read).length;
    t.last = t.msgs[t.msgs.length - 1];
  });
  return out.sort((a, b) => String((b.last || {}).at || '')
    .localeCompare(String((a.last || {}).at || '')));
}

/* THREADS AS WIDGETS. `WIDGETS` is a fixed list of things the app can open; these are made from the
   payload, one per person who has written to you, so the drawer grows and shrinks with the
   conversations rather than holding one "Messages" that contains all of them. */
function msgWidgets_() {
  if (!USER) return [];
  return messageThreads_().map(t => ({
    id: 'msg:' + t.id,
    kind: 'tool',
    name: t.name + (t.unread ? ' (' + t.unread + ')' : ''),
    what: 'That conversation',
    into: 'msg-body-' + t.id,
    start: () => fillThread_(t.id),
    html: '<div class="card"><h3>' + esc(t.name) + '</h3>'
        + '<div id="msg-body-' + esc(t.id) + '" class="msg-body"></div></div>',
  }));
}

function fillThread_(withId) {
  const el = $('msg-body-' + withId);
  if (!el) return;
  loadMessages().then(() => {
    const now = $('msg-body-' + withId);
    if (!now) return;                                   // the widget was closed while we waited
    const t = messageThreads_().find(x => String(x.id) === String(withId));
    now.innerHTML = t ? messagesHtml_(t.msgs) : emptyMessages_;
  });
}

/* `fillMessages` WAS HERE — it filled the single `#msg-body` on `You` with every message at once.
   `fillThread_` above replaces it, one conversation at a time, into the widget that asked. */

/* One renderer, used by the widget and by anything else that wants to show a thread. */
const messagesHtml_ = ms => ms.map(m =>
  `<div class="msg${m.mine ? ' mine' : ''}${!m.mine && !m.read ? ' unread' : ''}">
    <p class="msg-body-text">${mark(m.body)}</p>
    <p class="faint msg-when">${esc(m.mine ? 'you' : (m.fromName || 'them'))} · ${esc(m.at || '')}</p>
  </div>`).join('');

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
on('add-child', () => {
  if (!USER) { toast('Sign in first'); return; }
  openSheet('Add your child', `
    <p class="sub">Their name as it is on their account. They will be asked to say yes before
      anything is linked.</p>
    <label class="fld"><span>First name</span><input id="kid-first" autocomplete="off"></label>
    <label class="fld"><span>Last name</span><input id="kid-last" autocomplete="off"></label>
    <button class="btn" data-do="add-child-go">Ask them</button>
    <p class="faint">Nothing changes until they accept. If they say no, nothing happens and we do
      not tell them off.</p>`);
});

on('add-child-go', () => {
  const first = (document.getElementById('kid-first') || {}).value || '';
  const last = (document.getElementById('kid-last') || {}).value || '';
  if (!first.trim() || !last.trim()) { toast('Both names, please'); return; }
  send('claimChild', {
    name: USER.name, personId: (USER && USER.personId) || '',
    firstName: first.trim(), lastName: last.trim(),
  }).then(d => {
    if (d && d.error) { toast(d.error); return; }
    closeSheet();
    toast('Asked. They will see it when they next sign in.');
    load();
  });
});

/* YES AND NO ARE ONE HANDLER WITH A FLAG. Two handlers doing the same call with one word different
   is two places to fix when the call changes, and the second one is always the one forgotten. */
const answerClaim_ = (el, accept) => {
  send('answerClaim', {
    name: USER.name, personId: (USER && USER.personId) || '',
    rowIndex: el.getAttribute('data-row'), accept: accept,
  }).then(d => {
    if (d && d.error) { toast(d.error); return; }
    toast(accept ? 'Linked. They can book for you now.' : 'Turned down.');
    load();
  });
};
on('claim-yes', el => answerClaim_(el, true));
on('claim-no', el => answerClaim_(el, false));

on('edit-me', () => {
  if (!USER) { toast('Sign in first'); return; }
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

  openSheet('Your details',
    fieldsHtml(groups, {
      attr: 'data-me',
      value: f => p[f] ?? '',
      raw: p,
      readonly: readonly,
      /* The backend says which fields have a fixed set of answers. */
      options: f => (DATA.validations || {})[f],
    })
    + `<button class="btn" data-do="me-save">Save</button>
       <p class="faint" id="me-said" style="margin:.6rem 0 0"></p>

       ${/* THE PIN, at the bottom of your own details — which is what it is. It had a card of its
             own on the You screen opening a sheet of its own, to change one of the things this
             sheet already exists to change.
             SAVED SEPARATELY, and that is not an inconsistency: a PIN needs the current one to
             change it, and folding it into `Save` would mean every change of an address asking for
             a password. */''}
       <h2><span>Your PIN</span></h2>
       <label class="field"><span>current PIN</span>
         <input id="pin-now" type="password" inputmode="numeric" autocomplete="current-password"></label>
       <label class="field"><span>new PIN</span>
         <input id="pin-new" type="password" inputmode="numeric" autocomplete="new-password"></label>
       <label class="field"><span>and again</span>
         <input id="pin-again" type="password" inputmode="numeric" autocomplete="new-password"></label>
       <button class="btn quiet" data-do="pin-save">Change my PIN</button>
       <p class="faint" id="pin-said" style="margin:.6rem 0 0">4 to 8 numbers, and not 1234.</p>`);
});

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
function availGrid_(codes, p, readonly) {
  const on = f => TRUEish_(p[f]);
  const ro = f => readonly.indexOf(f) !== -1;

  /* Grouped back into days, from the flat list the backend sends. The prefix IS the day and the
     digits ARE the hour, so nothing else has to be looked up. */
  const days = [['m', 'Mon'], ['tu', 'Tue'], ['w', 'Wed'], ['th', 'Thu'],
                ['f', 'Fri'], ['sa', 'Sat'], ['su', 'Sun']];
  const rows = days.map(([prefix, label]) => {
    const mine = codes.filter(c => c.replace(/\d+$/, '') === prefix)
                      .sort((a, b) => Number(a.slice(prefix.length)) - Number(b.slice(prefix.length)));
    if (!mine.length) return '';
    return `<div class="slot-row">
      <span class="slot-day">${esc(label)}</span>
      <div class="slot-hours">
        ${mine.map(c => `<label class="hr${on(c) ? ' on' : ''}${ro(c) ? ' shut' : ''}">
          <input type="checkbox" data-me="${esc(c)}" ${on(c) ? 'checked' : ''}
                 ${ro(c) ? 'disabled' : ''}>
          ${Number(c.slice(prefix.length))}
        </label>`).join('')}
      </div>
    </div>`;
  }).join('');

  return `<p class="faint" style="margin:.2rem 0 .4rem">Tap the hours you can teach.</p>
    <div class="slot-grid">${rows}</div>`;
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
  const say = msg => {
    const el = o.where && $(o.where);
    if (el) el.textContent = msg; else toast(msg);
  };

  if (btn) { btn.disabled = true; if (o.busy) { btn.dataset.was = btn.textContent; btn.textContent = o.busy; } }
  if (o.saying) say(o.saying);

  const done = () => {
    if (!btn) return;
    btn.disabled = false;
    if (btn.dataset.was) { btn.textContent = btn.dataset.was; delete btn.dataset.was; }
  };

  return api(body)
    .then(d => {
      /* A REPLY CARRYING AN ERROR IS A FAILURE, and was being treated as success by anything that
         only checked whether the request went through. */
      if (!d || d.error) throw new Error((d && d.error) || 'That did not work.');
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
function fieldHtml(name, value, o) {
  o = o || {};
  const attr = o.attr || 'data-me';
  const label = o.label || fieldLabel(name);
  const ro = !!o.readonly;
  const v = value ?? '';

  if (FIELD_IS_BOOL.test(name)) {
    return `<label class="check">
      <input type="checkbox" ${attr}="${esc(name)}" ${TRUEish_(v) ? 'checked' : ''}
             ${ro ? 'disabled' : ''}>
      <span class="box"></span><span>${esc(label)}</span></label>`;
  }

  /* A FIXED LIST IS A SELECT. Somebody choosing an exam board should not be able to invent one —
     that is how a sheet ends up with four spellings of Edexcel. */
  const opts = o.options || [];
  if (opts.length) {
    return `<label class="field"><span>${esc(label)}</span>
      <select ${attr}="${esc(name)}" ${ro ? 'disabled' : ''}>
        <option value="">${NONE_LABEL}</option>
        ${opts.map(x => `<option value="${esc(x)}"${
          String(v) === String(x) ? ' selected' : ''}>${esc(x)}</option>`).join('')}
      </select></label>`;
  }

  /* WHAT OTHERS SAY IS A SUGGESTION, not a rule — a datalist offers them and still lets somebody
     type a new one, which is right where the list is descriptive rather than decided. */
  const seen = (o.suggest || []).filter(Boolean);
  const listId = seen.length > 1 ? 'fl-' + attr.replace(/\W/g, '') + '-' + name : '';
  const pad = FIELD_IS_DECIMAL.test(name) ? 'decimal'
            : FIELD_IS_NUMERIC.test(name) ? 'numeric' : '';

  return `<label class="field"><span>${esc(label)}</span>
    <input ${attr}="${esc(name)}" value="${esc(String(v))}" ${ro ? 'disabled' : ''}
           ${listId ? `list="${listId}"` : ''} ${pad ? `inputmode="${pad}"` : ''}>
    ${listId ? `<datalist id="${listId}">${
      seen.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}</label>`;
}

/**
 * A WHOLE FORM, from a group table.
 *
 * The backend sends `{ 'About you': ['first_name', …], … }` for every editable thing, and every
 * editor walked it the same way with its own field renderer at the bottom. One walk now, so a group
 * of hour codes becomes a timetable everywhere rather than only where somebody remembered.
 */
function fieldsHtml(groups, o) {
  o = o || {};
  const value = o.value || (() => '');
  return Object.keys(groups).map(g => {
    const list = groups[g] || [];
    /* A GROUP OF HOUR CODES IS A TIMETABLE. Recognised by the shape of the names rather than by the
       group's title, so renaming it in the backend does not turn it back into a column of boxes. */
    const timetable = list.length > 12
      && list.every(f => /^(m|tu|w|th|f|sa|su)\d\d$/.test(f));
    const body = timetable
      ? availGrid_(list, o.raw || {}, o.readonly || [])
      : list.map(f => fieldHtml(f, value(f), {
          attr: o.attr,
          options: o.options ? o.options(f) : null,
          suggest: o.suggest ? o.suggest(f) : null,
          readonly: (o.readonly || []).indexOf(f) !== -1,
        })).join('');
    return `<h2><span>${esc(g)}</span></h2>` + body;
  }).join('');
}

/* The sheet writes TRUE/FALSE as text and the payload sends real booleans; rows written by older
   versions send neither consistently. One reader for all three. */
const TRUEish_ = v => v === true || /^(true|yes|1|✓)$/i.test(String(v ?? '').trim());

on('me-save', el => {
  const said = $('me-said');
  const fields = {};
  document.querySelectorAll('#sheet-body [data-me]').forEach(box => {
    if (box.disabled) return;
    fields[box.dataset.me] = box.type === 'checkbox' ? (box.checked ? 'TRUE' : 'FALSE')
                                                     : String(box.value || '').trim();
  });
  el.disabled = true;
  if (said) said.textContent = 'Saving…';

  api({ action: 'updateProfile', name: USER.name,
    target: USER.name, targetId: USER.personId || '', fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      /* Kept on the phone as well, so the You screen shows the new values before the next load. */
      USER.profile = Object.assign({}, USER.profile || {}, fields);
      if (d && d.name) USER.name = d.name;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});
/* `change-pin` opened a sheet of its own. It is three fields at the bottom of `edit-me` now — the
   sheet that already exists for changing your details, which a PIN is one of. */
on('pin-save', () => {
  const v = id => ($(id) || {}).value || '';
  const said = $('pin-said');
  /* Typed twice, checked here before the server sees it — a PIN you cannot see and typed once is
     a PIN you get locked out by. */
  if (v('pin-new') !== v('pin-again')) { if (said) said.textContent = 'The two new PINs do not match.'; return; }
  api({ action: 'changePin', name: USER.name,
    currentPin: v('pin-now'), newPin: v('pin-new') })
    .then(d => {
      if (d && d.error) { if (said) said.textContent = d.error; return; }
      toast('PIN changed'); closeSheet();
    })
    .catch(err => { if (said) said.textContent = why_(err); });
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
      <div class="post-acts">${bar('9rem', '2.3rem', .24)}</div>
      ${bar('80%', '.7rem', .32, 'margin-top:.5rem')}
      ${bar('45%', '.7rem', .4, 'margin-top:.35rem')}
    </article>`];
}