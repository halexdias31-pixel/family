/* ==================================================================================================
   @family. — shell.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   shell.js is number 5 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- THE TABS ----------------------------------------------------------------------------
   One table. It drives the bar, the routing, and which screen is showing — so a tab cannot exist
   without a screen behind it, and a screen cannot be unreachable.

   `render` is the only thing a screen has to provide: a function returning the markup for that
   screen. `title` is what the header reads. Nothing else.
--------------------------------------------------------------------------------------------- */
const TABS = [
  /* Posts leftmost: the one screen somebody opens with no errand. Every other tab answers a
     question, and a person with no question needs somewhere to land. */
  /* ---------- ONE TAB ---------------------------------------------------------------------------
     THERE IS NO BAR ANY MORE, AND THIS IS WHY. Every column this app has had was eventually folded
     into the funnel — Spotlight, Book, Basket, Library, Arcade, Tools, Favourites — each for the
     same reason: it was a second way to reach something the funnel already reached, and a second
     way is a second thing to maintain and a second place for a card to be forgotten.

     POSTS AND YOU WERE THE LAST TWO. `meCard` had already taken the top of You into the results;
     the `post` kind had already made a post findable by its caption. What was left of both was a
     set of cards, and a set of cards behind an answer is what this app calls a page. So the feed is
     `What for · Posts` and the account is `What for · You` — see `feedPages_` and `youPages_` in
     find.js.

     THE TABLE STAYS RATHER THAN GOING. `go`, `paintNeighbours`, the X axis and the page memory all
     read it, and a single-entry list keeps every one of them correct with no special case: `go`
     finds the tab, the X axis clamps to one cell and therefore never moves, and `paintNeighbours`
     has nothing to paint. A tab bar of one button is drawn as nothing — see `paintTabs`.

     AND IT IS THE WAY BACK IN. One tab means a single-entry table is not navigation, it is a root,
     and the thing that used to be `go('posts')` is now answering the first question. */
  { id: 'stuff',   icon: '🔎', label: 'Find',    title: 'Find' },
  /* ---------- WHO YOU ARE, TO THE RIGHT OF THE QUESTION -------------------------------------------
     A SECOND COLUMN, AND ON PURPOSE THIS TIME. The others were folded in because each was a second
     route to something the funnel already reached — Posts, You, Book, Basket, all of them findable
     by answering a question. Signing in is not: it is the state the app is in BEFORE any question
     can be answered, and it is the one thing a signed-out visitor must be able to reach without
     first knowing how the funnel works.

     ONE SWIPE, ALWAYS IN THE SAME DIRECTION, from wherever you are in the funnel. That is what a
     column gives it that a page could not — a page sits at a position in a list that changes with
     what you have narrowed, and this must not move. */
  { id: 'account', icon: '👤', label: 'You',     title: 'You' },

  /* ---------- AND SEVEN MORE, WHICH IS THIS TABLE GOING BACK THE WAY IT CAME ------------------------
     EVERYTHING ABOVE IS THE HISTORY OF FOLDING COLUMNS IN, one at a time, each because it was a
     second route to something the funnel already reached. That reasoning was right about the funnel
     and wrong about one thing: it treated every column as a QUESTION, and some of them are PLACES.

     A QUESTION IS ANSWERED. A PLACE IS SOMEWHERE YOU GO. `Learning · Worksheet · KS4` is a person
     narrowing something down; opening the app to see what has been posted is not — there is no
     errand and no question to answer, so a funnel asks one before it will show anything. That is
     the whole argument for a column, and it applies to exactly the screens below: the feed, the
     composer, the tools, the games. It does NOT apply to a worksheet, which is why Learning is
     still one column and not five.

     THE DUPLICATION IS ACCEPTED AND IT IS NOT FREE. The feed is reachable as `What for · Posts` and
     as a column; so are Tools and Games. One is a door and the other is an answer. Nothing else in
     the app is reachable two ways, and the moment a third route appears to any of them, one of the
     three is wrong.

     ORDER COMES FROM THE LAYOUT SHEET, left to right, and this table stays append-only — see
     `TAB_ORDER` below for why. */
  /* ---------- `make` WAS HERE, AND THE CAMERA IS THE PAGE ABOVE THE NEWEST POST NOW ------------
     ASKED FOR AS "move the post new post camera widget above the latest post widget. still make the
     latest post widget be the default front door of site." It was a column of its own, one swipe
     LEFT of the feed; it is page `feedCamAt_()` of the feed, one swipe UP from the newest post —
     which is what "above" means on a column read top to bottom. See `feedColumn_` in posts.js.

     REMOVED FROM ALL FIVE PLACES A SCREEN IS NAMED IN ONE COMMIT, which is what `check-doors.js`
     asks: this table, `TAB_ORDER`, `PAGER`, the `<section>` in index.html and the row in
     `data/settings/columns.json`. A remembered `AT` of `make` falls through to `TAB_HOME` a few
     lines down, because no tab answers to it. The append-only rule is about MOVING an entry; taking
     one out moves every later index by one, which costs a phone that remembered a column by index
     nothing — `AT` is remembered by id. */
  { id: 'feed',    icon: '🏠', label: 'Feed',    title: 'Feed' },
  { id: 'booking', icon: '📅', label: 'Book',    title: 'Booking' },
  { id: 'tools',   icon: '🧰', label: 'Tools',   title: 'Tools' },
  { id: 'games',   icon: '🎮', label: 'Games',   title: 'Games' },

  /* ---------- AND THE TWO THE LAYOUT SHEET ASKED FOR ------------------------------------------------
     THESE ARE NOT NEW IDEAS, they are two columns that were drawn on the layout sheet and left out
     of the code because neither had anything behind it. One of them does now.

     REELS HAS FIFTY-EIGHT FACTS. They were a const array in chess.js — a subject, a headline, a
     paragraph and a photograph search term each — and they are a tab now, so the column can be
     built from data rather than from a list nobody could edit.

     DMs HAS NOTHING, and is here anyway. That is a reversal of the rule two notes up — an empty
     column is worse than a missing one — and the reason is that the `messages` tab exists, the
     backend has `sendMessage`, `messages`, `readMessage` and `flagMessage`, and the only thing
     absent is rows. A screen that says "no messages" over a working inbox is honest. A screen that
     says nothing because somebody decided not to draw it is the app disagreeing with its own
     layout sheet. */
  { id: 'reel',    icon: '▶',  label: 'Reels',   title: 'Reels' },
  { id: 'dm',      icon: '✉',  label: 'DMs',     title: 'Messages' },
  /* ---------- SAVED, WHICH IS RIGHT OF GAMES ------------------------------------------------
     ASKED FOR AS "add a favourite column so i can see the widgets i favoutited. add the coloumn to
     the right of games." The note above lists Favourites among the columns that were folded into
     the funnel; see `savedCards_` in arcade.js for what has changed since, and why this is not the
     duplicate that one was. APPENDED, because this table is append-only — `AT` is remembered by id
     and the X axis clamps by index. `TAB_ORDER` is what puts it last. */
  { id: 'saved',   icon: '★',  label: 'Saved',   title: 'Saved' },
  { id: 'spotlight', icon: '✦', label: 'Spotlight', title: 'Spotlight' },
  /* ---------- AND YOUR SETTINGS, AT THE FAR END ----------------------------------------------
     ASKED FOR AS "account setting should appear in a new column by itself. For now make that new
     column at the end." It was one sheet off a tile on your own account card; see `settingsPages_`
     in me.js for what moved and why it moved rather than being copied.

     NOT A SECOND ROUTE TO SOMETHING THE FUNNEL REACHES, which is the test every column above is
     judged by: your PIN, your username and your own editable fields are not findable by answering a
     question and never were. They are the same argument as `account` two notes up — the state the
     app is in rather than a thing in it.

     APPENDED, because this table is append-only: `AT` is remembered by id and the X axis clamps by
     index. `TAB_ORDER` is what puts it last, which is the "for now" the request asked for — moving
     it is one row of `data/settings/columns.json` with no deploy. */
  { id: 'settings', icon: '⚙', label: 'Settings', title: 'Settings' },
  /* ---------- AND THE SHOP, RIGHT OF BOOKING ----------------------------------------------------
     ASKED FOR AS "Get rid of shop tag. I will make a new coloumn for shop stuff. So finder now will
     become just learning stuff." It was an answer to Find's first question, and a shop is a PLACE by
     this table's own test — see `shopCards_` in collections.js, which also carries the basket now.

     BESIDE BOOKING, NOT BESIDE TOOLS, and measured rather than felt. The basket was a tool, but
     nothing about it is one: it holds what you are about to pay for, a total and a Send, which is
     what the booking receipt one column along holds — `cartCard_`'s note already calls them "the
     same document". The two money columns sit together, two swipes from the front door (`feed`),
     and the bundle tile on Find that fills the basket (`cart-open`) is three swipes from it either
     way, so Tools would have bought nothing.

     APPENDED, because this table is append-only; `TAB_ORDER` and `data/settings/columns.json` are
     what put it second-but-one. */
  { id: 'shop',    icon: '🛒', label: 'Shop',    title: 'Shop' },
  /* ---------- AND PROGRESS, AT THE FAR END OF THE ROW, WAITING TO BE BUILT ------------------------
     ASKED FOR AS "i want to add a new column for students to track their progress and everythinh.
     you can leave it at the end of the columns for now. just leave a place holder for now." (9 Oct)

     A PLACE, NOT A QUESTION, which is the test every column in this table is judged by. Nobody
     narrows "how am I doing" down by answering the funnel's questions: it is the same page whatever
     you were looking for, and a child opens the app to look at it with no errand at all. So it is a
     column, and not a kind in `data/settings/kinds.json`.

     A PLACEHOLDER, AND IT SAYS SO — `progressCards_` in arcade.js, on `drill`'s rule from map.js.

     APPENDED, because this table is append-only: `AT` is remembered by id and the X axis clamps by
     index. `TAB_ORDER` and the last row of `data/settings/columns.json` are what put it last, which
     is the "for now" the request asked for — moving it is one row of that file with no deploy.

     📈 RATHER THAN A PLAIN SYMBOL. The row is two kinds of glyph: emoji (🏠 📅 🛒 🔎 👤 🧰 🎮) and
     plain shapes that already mean the thing (★ kept, ✦ featured, ⚙ settings, ✉ a letter). No plain
     shape means a chart, and the near ones are taken here — ↗ was a post's share mark (`tiles.js`),
     ▲ is the calculator's up key — so it is the emoji half: 📈 is Unicode 6.0, in Apple's emoji font
     since iOS 5, and a line going up reads at any size. NOTHING DRAWS IT TODAY: the bar went (see
     `<nav id="tabs">` in index.html), so like every icon here it is carried for `applyColumns_`
     and for whatever names a column next. */
  { id: 'progress', icon: '📈', label: 'Progress', title: 'Progress' },
  /* ---------- THE SECOND FINDER: RESOURCES, RIGHT OF FIND --------------------------------------------
     THE OWNER, 10 Oct: *"i want to move everything which is in "resources" tag. i want to create a new
     column to the right of the current finder. this new column is "finder 2". it carries resources.
     like text books, boxing stuff books. ect."* The textbooks, the boxers, the fights and the Bible
     were answers to Find's `What kind` question; they are a column of their own now, with the same
     funnel, cards and swipe, in `screen('res')` (find.js, `FINDERS`). Called Resources wherever a
     column is named — the word the funnel already used for them — and "the second finder" in code.

     APPENDED, because this table is append-only (see `progress` above); `TAB_ORDER` and the row in
     `data/settings/columns.json` are what put it immediately right of Find. 📚 rather than a plain
     shape, as 📈 was: no plain shape means a shelf of books, and 📚 is Unicode 6.0, in every emoji
     font this app is opened in. */
  { id: 'res',     icon: '📚', label: 'Resources', title: 'Resources' },
  /* ---------- AND THE BUSINESS'S OWN PAPERWORK, LAST, FOR AN ADMIN AND NOBODY ELSE -------------------
     ASKED FOR AS "the business checklist stuff should go in their own column at the end." (10 Oct)
     They were five pages at the foot of an admin's Settings (docs/history/207) — insurance, tax, legal
     and data, safeguarding, money and company — drawn by `bizPages_` in records.js, which is what this
     column draws now, unchanged.

     A PLACE, by this table's test: nobody narrows "is the insurance due" down by answering a question,
     and it is not about YOU, which is what the rest of Settings is.

     `admin: true` IS THE ONE COLUMN THAT IS NOT EVERYBODY'S, and the rule that leaves it out is
     `columnsFor_` below: for anybody else there is no entry in `TABS`, so no swipe stops on it, nothing
     counts it, and no `<section>` names it — the section is made by code for an admin rather than
     written into index.html, which every visitor's phone parses. A card is not a permission
     (`listRecords` and `saveRecordsPage` are `admin` in `ACTION_ACCESS`); this is about a column a
     non-admin should not have to swipe past, or find in the page.

     APPENDED, because this table is append-only. `TAB_ORDER` and the last row of
     `data/settings/columns.json` put it last. 📋 a clipboard, which is a checklist — the emoji half
     of the row, like 📈 above; nothing draws it today. */
  { id: 'biz', icon: '📋', label: 'Business', title: 'Business', admin: true },
];

/* ---------- LEFT TO RIGHT, WHICH IS NOT THE ORDER THEY ARE WRITTEN IN -----------------------------
   THE TABLE ABOVE IS APPEND-ONLY BY NECESSITY. `AT` is remembered by id in localStorage and the X
   axis clamps by index, so reordering the literal would move somebody's remembered position to a
   different screen on the next boot — silently, and only for people who already had the app open.

   THIS IS THE LAYOUT SHEET'S ROW, IN ITS ORDER. Camera, posts, booking, search, profile, tools,
   games. Reels and DMs are on that sheet and are not here: neither is built, and an empty column is
   worse than a missing one because it is a dead end you swipe past every time rather than a thing
   you have not made yet. Their own instruction files list what is undecided about them. */
/* THE ORDER IS THE LAYOUT SHEET'S ROW, read left to right:
     camera · post · booking · reel · DM · search · profile · tools · games
   `calculator` and `flappy bird` appear on that sheet as the first thing in the last two columns —
   they are widgets standing for what the column holds, not columns of their own. */
const TAB_ORDER = ['feed', 'booking', 'shop', 'reel', 'dm', 'stuff', 'res', 'account', 'tools', 'games', 'saved',
                   'spotlight',
                   'settings',
                   'progress',
                   'biz'];
TABS.sort((a, b) => TAB_ORDER.indexOf(a.id) - TAB_ORDER.indexOf(b.id));

/* ---------- EVERY COLUMN THE BUILD HAS, AND THE ONES THIS VIEWER IS GIVEN ------------------------------
   `TABS` WAS ONE LIST WITH TWO JOBS: what the app has, and what is in front of this person. With every
   column everybody's those were the same list. `biz` is an admin's (above), so they are three now:

     TABS_BUILT  every column this build can draw, in the code's order. Never changes after this line.
     COLUMNS     the row the sheet asks for (`applyColumns_`), or the code's row until it has asked.
     TABS        COLUMNS, less a column this viewer is not given. What everything else reads.

   `TABS` STAYS THE ONE EVERYTHING READS, and stays the same array — the axis counts it, `go` searches
   it, the neighbours are drawn from it — so nothing that reads it had to learn there is a viewer. */
const TABS_BUILT = TABS.slice();
const COLUMNS = TABS.slice();

/* ---------- WHICH COLUMNS THIS VIEWER IS GIVEN — THE SMALLEST RULE THAT LEAVES ONE OUT ----------------
   A COLUMN MARKED `admin` IS IN `TABS` ONLY WHILE AN ADMIN IS SIGNED IN, and its section is in the
   document only then. Asked at boot, when the sheet's row lands, and at the head of every `repaint` —
   which is what signing in, signing out, a session the server ended and a role changed in the sheet
   all end in — so the column comes and goes without a reload.

   NOBODY IS MOVED BY IT. Where you are is remembered by id (`AT`), not by index, so a column added or
   taken away beside you leaves you on the column you were on; `repaint` places the row again after.
   The one person it moves is the one standing ON the column that went — an admin whose session ended
   under the records — and they go to the column on its left, where a swipe back would have taken
   them, rather than to the front door: they are still holding the phone, and the toast tells them to
   sign in again.

   THE SECTION IS MADE HERE, NOT WRITTEN IN index.html. Every visitor's phone parses that file, and a
   section parsed for everybody and taken away for most would still be in their document for the
   moment between — and in its source for good. Empty when made, so `paintNeighbours` draws it the
   way it draws any column it finds empty; taken out of the document whole when it goes.

   A hoisted FUNCTION, because `repaint` (a const far below) and `applyColumns_` both call it. It
   touches `AT` only once `AT` exists: the first call is after `let AT` below. */
function columnsFor_() {
  let admin = false;
  try { admin = typeof isAdmin === 'function' && isAdmin(); } catch (e) { admin = false; }
  const want = COLUMNS.filter(t => !t.admin || admin);
  const changed = want.length !== TABS.length || want.some((t, i) => TABS[i] !== t);
  if (changed) {
    /* WHERE YOU ARE, IF IT IS THE COLUMN GOING — the nearest column left of it that stays. */
    let at = null;
    try { at = AT; } catch (e) { at = null; }
    if (at && !want.some(t => t.id === at) && COLUMNS.some(t => t.id === at)) {
      const i = COLUMNS.findIndex(t => t.id === at);
      const left = COLUMNS.slice(0, i).reverse().find(t => want.indexOf(t) !== -1);
      AT = (left || want.find(t => t.id === TAB_HOME) || want[0]).id;
    }
    TABS.length = 0;
    want.forEach(t => TABS.push(t));
  }
  /* AND THE SECTIONS, every time — cheap, and it puts the document right even where `TABS` did not
     change (the first call, when index.html has just been parsed). */
  const host = typeof document !== 'undefined' && document.getElementById('screen');
  if (!host) return changed;
  TABS_BUILT.forEach(t => {
    if (!t.admin) return;
    const el = document.getElementById('s-' + t.id);
    const mine = TABS.indexOf(t) !== -1;
    if (mine && !el) {
      const s = document.createElement('section');
      s.className = 'screen hidden';
      s.id = 's-' + t.id;
      host.appendChild(s);
    } else if (!mine && el) {
      el.remove();
    }
  });
  return changed;
}

/* ---------- AND THE SHEET DECIDES, ONCE THERE IS ONE ----------------------------------------------
   THE TABLE ABOVE IS NOW THE FALLBACK. `columns` in the Widget Settings sheet says which columns the
   app has and in what order, and this applies it — so moving Reels before Booking is dragging a row,
   and switching DMs off is one cell, with no paste and no deploy.

   IT CANNOT INVENT A COLUMN. A row naming a screen this build does not have is ignored: the sheet
   decides ORDER and WHICH, and the code decides what a screen is. A column that swipes to a blank
   is worse than a column that is not there, and it is the fault that shipped once already — TABS
   pushed without the matching section in index.html.

   NOR CAN IT LEAVE YOU WITH NOTHING. An empty tab, a tab that has not been made yet, or one whose
   every row is switched off leaves the written table exactly as it is. A spreadsheet should not be
   able to make the app unusable by being blank.

   `TABS` IS MUTATED RATHER THAN REPLACED, because everything else in this file holds a reference to
   it — the axis counts it, `go` searches it, the neighbours are drawn from it.

   AND IT IS WRITTEN THROUGH `COLUMNS` NOW, not straight into `TABS`: the sheet decides the row, and
   `columnsFor_` decides which of it this viewer is given. `known` is every column the BUILD has
   (`TABS_BUILT`) rather than what `TABS` holds — it was `TABS`, and `TABS` for a non-admin has no
   `biz`, so the first payload a visitor's phone applied would have dropped the column from the row
   for good, and an admin signing in on that phone afterwards would have been given nothing. */
function applyColumns_() {
  const rows = (DATA && DATA.columns) || [];
  if (!rows.length) return;

  const known = {};
  TABS_BUILT.forEach(t => { known[t.id] = t; });

  const want = rows.map(r => known[String(r.screen || '').trim()])
                   .filter(Boolean);
  if (!want.length) return;      /* the sheet names nothing this build has — leave it alone */

  /* THE LABEL AND THE ICON COME FROM THE SHEET TOO, where it gives them. A blank cell means "keep
     what the code says" rather than "make it empty", which is the same rule every other tab in this
     system follows. */
  rows.forEach(r => {
    const t = known[String(r.screen || '').trim()];
    if (!t) return;
    if (String(r.label || '').trim()) t.label = String(r.label).trim();
    if (String(r.icon  || '').trim()) t.icon  = String(r.icon).trim();
  });

  COLUMNS.length = 0;
  want.forEach(t => COLUMNS.push(t));
  columnsFor_();

  /* WHERE `AT` IS NOW. Somebody remembered on a column the sheet has just switched off would be on a
     screen that no longer exists, and `go` would silently send them home without saying why. */
  if (!TABS.some(t => t.id === AT)) AT = (TABS.find(t => t.id === TAB_HOME) || TABS[0]).id;
}

/* ---------- WHERE AN UNKNOWN ROUTE LANDS, NAMED RATHER THAN COUNTED -------------------------------
   `go` FELL BACK TO `TABS[0]`, AND THAT USED TO BE FIND — correct only because Find happened to be
   written first. The moment the camera took the left-hand end it became the camera, so `go('me')`,
   which is still called from find.js and still has no screen, would have dropped anybody told to
   sign in onto an empty composer.

   A fallback that lands somewhere plausible is worse than one that lands nowhere, because nobody
   reports it. */
/* ---------- THE FIRST THING ANYBODY SEES IS THE LATEST POST ---------------------------------------
   IT WAS `stuff`, AND THE ARGUMENT FOR THAT IS BELOW AND WAS OVERRULED. "The feed is a noticeboard
   for a tutoring business; the funnel is the product" — true of what the app is FOR, and not the
   question a first screen answers. A funnel opens on a question nobody asked yet; the newest post
   is the business saying something, which is what a front door is.

   `PAGE_HOME.feed` ALREADY LANDS ON IT — page 0 is the spotlight if the business has chosen one
   and the newest post otherwise, and its own note says so. So this is one word, and the position
   inside the column was already right.

   ONLY THE FIRST VISIT. The line below remembers wherever somebody was last, so this decides where
   a phone that has never opened the app lands and nothing else. */
const TAB_HOME = 'feed';

/* ---------- HOW LONG AWAY COUNTS AS OPENING IT AGAIN ---------------------------------------------
   ONE NUMBER, TWO READERS. `checkBuild_` at the foot of this file asks it about a RESUME — is this
   somebody coming back, or somebody glancing at another app and back — and the line below asks it
   about a COLD LAUNCH. Both are the same question and a second number would be a second thing to
   keep in step, which is what this repository writes about `needs_print` and `print_required`.

   Six minutes is past any notification, any photograph taken mid-lesson, any check of a message —
   and well short of "I opened this tomorrow morning", which is the case both readers are for. */
const AWAY_AGAIN = 6 * 60 * 1000;

/* What each screen draws. Registered separately from the tab list so a screen can be built and
   swapped without touching the navigation — which is the whole reason for splitting them. */
const SCREENS = {};

/** Register a screen. `draw` returns the markup for it, and that is the whole contract.
    There was a third argument — one action for the header — and there is no header. Removed rather
    than accepted and ignored: a parameter nothing reads is a parameter somebody will pass. */
function screen(id, draw) { SCREENS[id] = { draw }; }

/* ---------- WHERE YOU WERE, IF IT IS STILL A PLACE ------------------------------------------------
   REMEMBERED AGAIN, NOW THAT THERE ARE TWO COLUMNS. It was forced to `stuff` while there was only
   one, and a stored `posts` or `me` from before the fold would still be handed to `go`, which falls
   back to `TABS[0]` — right, but silently.
   SO IT IS CHECKED RATHER THAN TRUSTED. A remembered id that is no longer a tab is discarded here
   instead of being corrected three functions later, and `account` is a place you can be left. */
/* FIRST VISIT LANDS ON THE LATEST POST — see `TAB_HOME` above, which is where that is decided and
   where the argument it replaced is written down. Find is one swipe away and is remembered there
   afterwards. */
let AT = TAB_HOME;
/* ---------- REMEMBERED FOR A RELOAD, NOT FOR TOMORROW ---------------------------------------------
   REPORTED AS "the latest post isnt the defualt opening widget for some reason still. im opneing on
   phone. after having added to homescreen". `TAB_HOME` was already `feed` and already deployed —
   what wins over it is this line, which remembered whatever column they were last on, for ever.

   BOTH HALVES ARE REAL AND THEY ARE NOT THE SAME EVENT. Opening the app is opening the app, and
   landing on a funnel question nobody asked is the argument `TAB_HOME` records. A RELOAD is not
   that: `reload-build` reloads the page under somebody the moment a new build lands, and losing
   the question they were reading would be the fix costing more than the fault. So the id is
   remembered with the moment it was written, and it is only honoured while that moment is recent —
   which is `AWAY_AGAIN` above, the number `checkBuild_` already asks the same question with.

   NOT A SESSION FLAG. `sessionStorage` dies with the window, and an installed app on iOS is
   SUSPENDED rather than closed — see the note over `watchBuild_` — so a window left open for three
   days still counts as one session and the flag would never expire. A stamp is a fact about time
   and does not care how the window got here. */
/* THE VIEWER'S COLUMNS FIRST — `USER` is already read out of storage (data.js), so an admin reloading on
   Business is put back on it, and anybody else's remembered `biz` is not a column and is let go. */
try { columnsFor_(); } catch (e) {}
try {
  const was = localStorage.getItem('familyTab');
  const when = Number(localStorage.getItem('familyTabAt') || 0);
  if (was && TABS.some(t => t.id === was) && when && Date.now() - when < AWAY_AGAIN) AT = was;
} catch {}
/* ---------- AND THE MOMENT IS WHEN YOU LEFT, NOT WHEN YOU ARRIVED ---------------------------------------
   THE STAMP WAS ONLY WRITTEN WHEN THE COLUMN CHANGED, so it measured how long ago you ARRIVED: a child
   twenty minutes into an essay on Find refreshed and was put on the Feed, because twenty minutes is more
   than six — and the answer that was still in the box looked lost (docs/history/317). Written again as
   the page is hidden or left, for the column the person is on, it measures the time AWAY, which is the
   question both readers of `AWAY_AGAIN` are asking. Only for the column already remembered: a column
   reached with `remember === false` stays unremembered. */
function tabStampLeft_() {
  try { if (localStorage.getItem('familyTab') === AT) localStorage.setItem('familyTabAt', String(Date.now())); } catch {}
}
window.addEventListener('pagehide', tabStampLeft_);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') tabStampLeft_(); });

/* ---------- THE COLUMN BEFORE THIS ONE ---------------------------------------------------------------
   So signing in can put you back where you came from (`signedIn_` in me.js) — a child who swiped across
   to the account column to sign in was left there, on a list of tutors, with the question they were on
   two swipes away. Written only when the column actually changes. */
let PREV_AT = '';
function go(id, remember, instant) {
  const tab = TABS.find(t => t.id === id)
           || TABS.find(t => t.id === TAB_HOME)
           || TABS[0];
  const was = AT;
  AT = tab.id;
  if (was && was !== AT) PREV_AT = was;
  if (remember !== false) {
    try {
      localStorage.setItem('familyTab', AT);
      /* THE STAMP IS WRITTEN WITH THE ID AND NEVER WITHOUT IT — see the note over `AT` above. A
         stamp left behind by an id that was not written is a column remembered by its timestamp. */
      localStorage.setItem('familyTabAt', String(Date.now()));
    } catch {}
  }

  /* NOTHING IS HIDDEN ANY MORE. Every screen sits on the X axis and is placed by how far it is
     from the one in front — which is what makes a sideways swipe show the next tab arriving rather
     than nothing at all, and what makes the two axes the same thing.
     A screen keeps its half-filled form and its scroll position exactly as it did when it was
     hidden, because it is still in the document; it is simply somewhere else. */
  /* IT ARRIVES FROM THE SIDE IT CAME FROM. One class and one keyframe, rather than eight screens
     held in position so that one of them could be seen sliding in. */
  const from = TABS.findIndex(t => t.id === was), to = TABS.findIndex(t => t.id === AT);
  const way = (was && was !== AT) ? (to > from ? 1 : -1) : 0;
  /* THE WAY THE ROW WAS LAST TRAVELLED — the builder takes the columns on that side first (`ahead_`). */
  if (way) AHEAD.dir.x = way;
  /* AND A COLUMN THIS LANDING WILL SHOW THAT STILL HOLDS THE BOOT'S LOADER IS DRAWN NOW — see `bootGlass_`. */
  bootGlass_();

  /* PAINT FIRST, PLACE SECOND, ALWAYS.
     `paintNeighbours` was running AFTER the placement and repainting the current screen along with
     its neighbours — so the pages that had just been given a position were replaced by fresh ones
     with none, and a page with no position sits at its resting place: off the side, invisible.
     The screen went blank and its neighbour showed a sliver. Placement is the last thing that
     happens here, and nothing after it may write innerHTML. */
  paintNeighbours();
  placeCells('x', instant);


  /* THE HEADER IS GONE, and so is everything that wrote to it — a title, and a slot for one
     action per screen. Both were removed rather than left pointing at an element that is no longer
     in index.html: a write to nothing is not harmless, it is a line somebody has to read and work
     out before deciding it does nothing.
     A screen's own action now lives on the screen, where the thing it acts on is. */

  /* ---------- WHY A SIDEWAYS SWIPE WAS THE ROUGH ONE -------------------------------------------
     This was `paint(AT)`, unconditionally, right here — which rebuilds the whole arriving screen's
     markup with innerHTML. On Posts that is eighteen cards and eighteen <img> tags, built, laid
     out and decoded, at the exact moment the 260ms slide begins. The browser cannot do both, so it
     does the rebuild and drops the frames the slide needed.

     THAT IS THE ONLY REAL DIFFERENCE BETWEEN THE TWO AXES. `goPage` — up and down — never repaints
     anything. It moves markup that is already there, which is why it has always felt right, and
     why no amount of tuning the drag itself was ever going to fix sideways: the drag was not the
     problem, the repaint at the end of it was.

     And it was redundant. `paintNeighbours` above has already drawn every screen that had no
     markup, so by the time you can swipe to a tab it is drawn. Painting it a second time produced
     an identical screen at the cost of the animation.

     So: draw it only if there is nothing there, and otherwise leave it alone. Anything that
     genuinely changes a screen — signing in, a save, a fresh payload — goes through `repaint`,
     which is a different function and still repaints on demand. */
  /* OR IF IT IS STALE — something changed while you were elsewhere. See the note on `STALE`. */
  const painted = !screenHasMarkup_(AT) || !!STALE[AT];
  if (painted) paint(AT);
  /* Anything that needs to start running once its markup exists — a canvas, a board, a clock.
     After paint, because none of it can find an element that has not been drawn yet. */
  /* A hoisted FUNCTION, not a const. The wakers are defined further down with the games they
     start, and a `const` read before its own line throws — including through `typeof`, which is
     the one check that cannot see into a temporal dead zone. A function declaration is hoisted,
     so calling it from up here is fine. */
  /* WHEN, and it is not simply "after the slide".

     Deferring exists so a rebuild does not run during the animation and eat its frames. That is
     right when there is already something on the screen — the cards are drawn, the slide moves
     them, and whatever is newly in range is built once it has settled.

     It is wrong the FIRST time this screen is reached. Nothing is filled, so every pane is empty,
     so the grid places a column of nothing — and three hundred milliseconds later the content
     arrives into positions that were worked out for cards that did not exist. Cards on top of
     cards, until something else moves.

     So: if there is nothing on it yet, fill it now and let the slide be slightly less smooth once.
     After that, always after. */
  /* THE REELS USED TO BE BOOKED HERE, ON THEIR OWN, AND THAT IS THE BUG THEY HAD. This line was
     `afterSlide_(reelsWatch_)` — correct, and outside the one list that exists for exactly this
     job. `repaint` calls `startScreen_(AT)` and says why: "a repaint rebuilds the markup it was
     running in". It never ran this, so a repaint five pages down the reel column — a payload
     landing, a sign-in, a save — came back with nothing playing and no way to tell why.
     Measured: `paint('reel')` at page 5, `playing: []`. It is in `startScreen_` now, with the
     camera and the widgets, which is the list the note above already points at. */

  /* THE TOOLS AND THE GAMES ARE STARTED WHEN THEIR COLUMN ARRIVES, and stopped when it leaves.
     Markup first, `start` second — an id cannot be found before the markup carrying it is in the
     document, which is why this is here and not inside the screen's own draw. */
  /* `toolsStop_()` WAS HERE, for any column that was not one of the four — and it stopped every
     widget in the app, including the ones on the column beside you that a wide window shows whole.
     That is the loader the owner sent on 10 Oct (docs/history/331). Leaving is now asked of the
     glass rather than of `AT`: the placement `placeCells('x')` above asks for says what is on it, and
     `widgetsGlass_` (arcade.js) stops what has left — on a phone, everything not in front, exactly as
     this line did, once the slide has settled rather than before it begins. */
  /* AND THE CAMERA, for the same reason and with more force: a canvas loop behind a screen nobody
     is looking at is a flat battery, and a live camera behind one is a recording light on for
     nothing. */
  /* THE CAMERA IS A PAGE OF THE FEED NOW, so leaving the FEED is what lets it go. Turning a page
     within the feed is the other half, and it is `feedCamWatch_` — booked from `goPage` and from
     `startScreen_` below. */
  /* ---------- ONLY WHEN LEAVING THE FEED, OR WITH A CAMERA ACTUALLY OPEN ------------------------
     IT WAS EVERY COLUMN CHANGE THAT DID NOT LAND ON THE FEED — Tools to Games, Games to Saved —
     and `camStop_` resets the camera card's markup whether or not a camera ever started: eight
     `hidden` flips and a text write on a card nobody can see. Measured from the trace (5 Oct), that
     forced a layout of the whole document at every sideways release, 3,763–4,913 objects walked for
     11–19 that had changed, 38–61ms of CPU at 1x, and it is most of why sideways felt heavier than
     up and down. Leaving the feed still lets everything go exactly as before; a stream still open on
     any other change (a `getUserMedia` that answered after the column was left) is still closed. */
  if (typeof camStop_ === 'function' && AT !== 'feed'
      && (was === 'feed' || (typeof CAM_STREAM !== 'undefined' && CAM_STREAM))) camStop_();
  /* AND THE REEL, which is the third of these and was the one nobody had written. Measured before
     it existed: `go('reel')` then `go('tools')` left a `<video>` with `paused === false` — a clip
     somebody may have turned the sound on for, talking from a screen two swipes away, with no
     control on the screen they are now looking at. */
  if (typeof reelsStop_ === 'function' && AT !== 'reel') reelsStop_();
  /* AND THE MESSAGE POLL, which is the fourth. It asks the backend every twenty seconds so the
     column has no Refresh button on it — and a column nobody is looking at asking anyway is three
     round trips a minute for a screen two swipes away, which is exactly what the other three lines
     here are about. `dmPoll_` is started from `startScreen_` with the rest. */
  if (typeof dmStop_ === 'function' && AT !== 'dm') dmStop_();
  /* STARTED AFTER THE SLIDE, in one list rather than two. `repaint` needs the same list — it has
     just rebuilt this screen's markup too — and two copies of "what does this screen need running"
     is two places to forget the camera. */
  /* `true`: ARRIVING, so a column of widgets starts the ones in view first — see `widgetsWake_`.
     AND ONLY WHEN SOMETHING ARRIVED. `go` to the column already in front, with nothing repainted,
     used to book this too, and `toolsStart_` stops and restarts every widget on the column — a
     Connect 4 game in progress dealt a fresh board 300ms after anything asked for the column it was
     already on. Measured on 5 October as `check/press.js` states that played a game and then found
     it gone; spreading the starts over a second (above) made that window wider, and the answer is
     that it should not exist: nothing that was running was stopped, so nothing needs starting. */
  if (was !== AT || painted) afterSlide_(() => startScreen_(AT, true), 'start');
  aheadKick_(AHEAD_QUIET);

  /* EITHER FINDER (find.js, `FINDERS`): each fills in its own binding, and a fill booked for later is
     booked under the finder's name — `afterSlide_` keys by function otherwise, and both finders'
     fills would be one job that filled whichever was unbound. */
  const finder = typeof finderOf_ === 'function' ? finderOf_(AT) : null;
  if (finder) {
    const host = $('s-' + finder.id);
    const drawn = host && host.querySelector('.page[data-filled]');
    if (instant || !drawn) inFinder_(finder, fillStuffPages);
    else afterSlide_(() => inFinder_(finder, fillStuffPages), 'fill:' + finder.id);
  }
  /* After wake, because a page holding a canvas has to exist and be sized before it is moved.
     INSTANT, because this is arriving rather than travelling: the tab remembers which widget you
     were on, and animating there from the top is the app appearing to lose your place and then
     go and find it. */
  /* `true` used to be written here, and it cancelled the slide `placeCells('x', instant)` had
     started twenty lines above — two correct calls in one turn, disagreeing, which is the fault
     the scheduler in `placeCells` now exists to make unwriteable. Passing `instant` through was
     the patch for it; it stays because it is also simply true. A tab arrived at from a swipe
     slides, and one restored on boot appears.
     Either way the scheduler settles it now: both asks become one placement, and if either wants
     the animation, the animation is what happens. */
  paintPager(AT, instant);

  /* `scrollTo` was here, putting the window back to the top on every tab change. The window does
     not scroll — `#screen` is exactly the height of the viewport and clips, and the page you are on
     scrolls inside it. So it moved nothing, and asked the browser to work out a scroll position at
     the one moment it was busy starting an animation. */

  /* `arrive()` was here too: a class added to the arriving screen to slide it in from the side.
     There is no CSS for `from-left`, `from-right`, `from-above` or `from-below` anywhere in the
     stylesheet — not one rule — so it added a class nothing looked at, listened for an
     `animationend` that could never fire, and left the listener attached. What it DID do was
     `void el.offsetWidth`, which forces the browser to stop and lay out the whole page, on every
     single tab change, at the exact moment the slide begins.
     The slide is the transform transition on the cells. It always was. This was a second one that
     had been deleted from the stylesheet and left behind in the code. */
}

/**
 * DRAW THE SCREEN EITHER SIDE, so a sideways drag reveals one rather than an empty rectangle.
 *
 * Only the neighbours. Eight screens redrawn on every tab change would be most of a second on a
 * phone, and one of them holds four hundred resources — the same reasoning that fills a page of
 * the Stuff list only when you can reach it.
 */
/* ---------- WHAT EACH SCREEN NEEDS RUNNING ONCE ITS MARKUP EXISTS -----------------------------------
   ONE LIST, TWO CALLERS. `go` runs it after the slide; `repaint` runs it immediately, because both
   have just put new markup on screen and anything that was running was running inside the markup
   that got replaced.

   IT WAS TWO LISTS FOR ABOUT AN HOUR and that is exactly long enough to prove the point: the tools
   were started from `go` and so was the camera, and `repaint` started neither — so a repaint on the
   camera column left a `<video>` element with no stream attached, showing black, with `CAM_STREAM`
   still holding a camera open behind it.

   A HOISTED FUNCTION, NOT A CONST. `repaint` is a const defined above this line and calls it; a
   `const` read before its own line throws, including through `typeof`, which is the one check that
   cannot see into a temporal dead zone. A function declaration is hoisted, so this is safe. */
function startScreen_(id, arriving) {
  /* NOT A COLUMN A LANDING PAYLOAD LEFT ALONE — its markup was not replaced, so what runs in it is still
     running, and restarting it is what moves the caret: the notepad's `start` writes its value back.
     See `landRepaint_`. */
  if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) return;
  /* NOR ONE `paint` HELD UNDER A STROKE (`padHold_`, find.js), for the same reason and one more: a
     restart stops and starts every widget on the column in one task -- most of a second on Tools --
     and a finger drawing through that gets a straight line where it moved. */
  if (typeof padHold_ === 'function' && padHold_(id)) return;
  /* THE SAVED COLUMN HOLDS WIDGETS TOO, so it starts them — from its own list rather than from a
     kind, because what is on it is whatever was starred. */
  if (id === 'saved' && typeof savedStart_ === 'function') { savedStart_(arriving); }
  else if ((id === 'tools' || id === 'games') && typeof toolsStart_ === 'function') {
    toolsStart_(id === 'tools' ? 'tool' : 'game', arriving);
  }
  /* AND THE SHOP, whose first page is the basket — a widget, with a `start` that draws its lines.
     Without this the basket arrived as a heading over an empty box. */
  else if (id === 'shop' && typeof toolsStart_ === 'function') { toolsStart_('shop', arriving); }
  /* ---------- AND A COLUMN WHOSE CARDS JUST GREW IS PLACED AGAIN ---------------------------------
     A WIDGET DRAWS ITSELF IN ITS `start`, which runs here, 300ms after the column was placed — so
     the basket's receipt, the calendar's month and the week's roster all arrive AFTER `goPage` has
     measured where the page in front is. On a column somebody lands on at page 0 that costs
     nothing; on one they land on further down it put the page they asked for 1,500px below the
     glass. Measured from the bundle's "see your basket" tile: `PAGE.tools` was 9, the basket was
     `.page.on`, and its top edge was at y = 1706 on an 844px phone — a blank column until somebody
     swiped, with nothing wrong in any single step.
     INSTANT, because the slide has already finished and nobody saw the wrong position move; and
     only for the column in front, because a neighbour is placed when it is arrived at. */
  if ((id === 'saved' || id === 'tools' || id === 'games' || id === 'shop') && id === AT) {
    placeCells('y', true, 0, id);
  }
  /* THE CAMERA STARTS ON ARRIVAL rather than on a tap. It waited for a button on the belief that
     `getUserMedia` needs a gesture; what it needs is PERMISSION, which the browser prompts for once
     and then remembers — so the button was asking you to confirm, every single visit, a thing you
     had already allowed. */
  /* ONLY ON ITS OWN PAGE. The camera is the page above the newest post, and a feed somebody is
     reading five posts down is not a reason to hold a camera open — that is the recording light on
     for nothing that `camStop_` exists to prevent. `feedCamWatch_` starts it on its page and lets it
     go on every other. */
  if (id === 'feed' && typeof feedCamWatch_ === 'function') feedCamWatch_();
  /* AND THE REEL COLUMN PLAYS THE ONE YOU ARE ON. Here rather than in `go` because both callers
     need it and only one of them was doing it — see the note where that line used to be.

     THE STALE BOOKING CANNOT HAPPEN FROM HERE, which is what the arrow in `go` is for: it reads
     `AT` when the timer fires rather than when it was booked, so arriving at the reels and leaving
     again inside 300ms calls this with the screen you ENDED on. Measured before that was true — a
     clip playing on a screen nobody was looking at, started by a booking made for the screen
     before. */
  if (id === 'reel' && typeof reelsWatch_ === 'function') reelsWatch_();
  /* AND A TEXTBOOK'S ANIMATION PLAYS ONLY ON FIND, ONLY ON THE PAGE IN FRONT — for EVERY screen, because
     arriving anywhere else is what pauses the one on Find. See `tbAnimWatch_` in find.js. */
  if (typeof tbAnimWatch_ === 'function') tbAnimWatch_();
  /* AND AN ADMIN'S BUSINESS RECORDS ARE ASKED FOR — a POST, once, and never the payload (see
     js/records.js). Usually already asked: the column asks when it is first drawn, so it is not left
     under the loader beside Progress; this is the second door, and `bizStart_` is a no-op after one. */
  if (id === 'biz' && typeof bizStart_ === 'function') bizStart_();
  /* AND A CONVERSATION OPENS AT ITS NEWEST MESSAGE. A scroller's natural state is the top, which on
     a thread is last month — so something has to say otherwise, once the markup exists. */
  if (id === 'dm' && typeof dmFoot_ === 'function') dmFoot_();
  /* AND IT KEEPS ITSELF UP TO DATE WHILE IT IS THE SCREEN YOU ARE ON — see `dmPoll_` in posts.js,
     which is where the interval and what it costs are written down. */
  if (id === 'dm' && typeof dmPoll_ === 'function') dmPoll_();
}

/* ---------- A COLUMN THE LANDING WILL SHOW, STILL ON THE BOOT'S LOADER, IS DRAWN BEFORE THE SLIDE -------------------
   FOUND BY REVIEW, 12 Oct, on an iPad and a desktop. The first payload draws the column in front and the
   columns beside it on the glass, and leaves every other column on the boot's one loader for the builder
   (docs/history/341) — which waits for 400ms of quiet. A child who keeps touching gives it none, so a
   sideways landing in the first seconds brought columns onto the glass that were still the loader: at 1280
   Reels as bare dots on black and Find as 'Search…' over dots, 2–11s of loader per run where base, which
   drew every column before the splash lifted, showed none. `go` drew only `AT`.
   So `go` draws, before it places anything, every column the landing will show whose markup is still the
   boot's: on a wide window those within `GLASS.reach` of the new front (the arithmetic `glassNow_` uses), on
   a phone the one either side — the peek, and the first thing a drag reveals. ONLY THE BOOT'S MARKUP
   (`PRE_PAYLOAD`): a column holding real markup that is merely stale shows what it showed before the facts
   moved, as it always did, and is the builder's. So this is paid only in the first seconds after a load,
   once per column at most, and it is the cost base paid for every column before the first frame. */
function bootGlass_() {
  if (!PRE_PAYLOAD.size || typeof GLASS === 'undefined') return;
  const ti = TABS.findIndex(t => t.id === AT);
  if (ti < 0) return;
  const k = WIDE ? Math.max(1, GLASS.reach || 1) : 1;
  TABS.forEach((t, i) => {
    if (t.id === AT || Math.abs(i - ti) > k || !PRE_PAYLOAD.has(t.id) || !STALE[t.id]) return;
    paint(t.id);
    if (!STALE[t.id] && PAGER[t.id]) paintPager(t.id, true);
  });
}

/** Has this screen been drawn? A screen with markup needs no redrawing to be arrived at. */
function screenHasMarkup_(id) {
  const el = $('s-' + id);
  /* THE FIRST CHILD, NOT `innerHTML`, which serialises every screen's whole markup to answer
     yes or no — about a millisecond across eleven at 1x and four at 4x, inside a release. `paint`
     always writes an element and index.html's sections are empty, so the answer is the same. */
  return !!(el && el.firstElementChild);
}

function paintNeighbours() {
  /* EVERY SCREEN, not the two either side. Four tabs is not many, each is drawn once and never
     again, and the peek shows whatever has been painted — so a screen nobody has visited is a blank
     rectangle at the edge of the one you are on, which reads as the app being broken rather than as
     a tab you have not opened.
     It was ±1 because only ±1 could ever be revealed by a horizontal drag. A corner is one tab
     across AND one page down, so it can be a screen two away when the pages are counted. */
  TABS.forEach((t, i) => {
    const id = t.id;
    if (id === AT) return;
    const el = $('s-' + id);
    if (!el || el.firstChild) return;         // already drawn; redrawing would only cost
    paint(id);
    /* And placed, if it is a paged screen. A neighbour whose pages have no position shows nothing
       when a drag reveals it, which is worse than showing an empty rectangle because it looks like
       the screen itself is empty. */
    if (PAGER[id]) paintPager(id, true);
  });
  /* The screen in front is NOT repainted here. `go` has already drawn it, and drawing it a second
     time is what threw its placement away. */
}

/** Redraw one screen where it stands. Called after anything that changes what it should say. */
/* ---------- WHICH SCREENS ARE OUT OF DATE ----------------------------------------------------------
   SIGNING IN CHANGED NOTHING EXCEPT THE SCREEN YOU WERE LOOKING AT.

   `repaint` is what everything calls when the facts change — signing in, signing out, a save, a
   fresh payload — and its comment said so. But it is `paint(AT)` plus `paintNeighbours()`, and
   `paintNeighbours` returns early on any screen that already has markup, because arriving somewhere
   already drawn should not rebuild it. At boot every screen is drawn at once, so after that first
   pass EVERY screen has markup and `paintNeighbours` was a no-op for ever.

   So: sign in, swipe to the camera, and it still says "Sign in to post". Booking, DMs and You the
   same. Measured in a browser — after `repaint()` the other eight screens were byte-for-byte what
   they had been while signed out, and nothing but a page reload ever fixed it.

   IT HID BEHIND THE ONE SCREEN IT GOT RIGHT. You sign in ON the account screen, `paint(AT)` redraws
   exactly that one, and it updates in front of you. The screen you are watching is the single
   screen this bug cannot affect.

   MARKED, NOT REDRAWN. The obvious fix is for `repaint` to rebuild all nine, and that throws away
   what `go` was careful to win: rebuilding a screen during its slide is what drops the frames, and
   it would also tear the markup out from under a live camera or a running game on a screen nobody
   is looking at. A screen is marked instead, and `go` redraws it on the way in — so the cost lands
   once per screen, only after something actually changed, and only on screens somebody visits.

   WHAT IT COSTS, and it is real: a stale screen peeking at the edge of the one you are on shows its
   old markup until you swipe to it. A sliver of a sentence, corrected by arriving. */
let STALE = {};
/* ---------- TWO MARKS NOW, AND TWO CLOCKS ------------------------------------------------------------------
   A MARK OF 1 IS "THE FACTS CHANGED": every `repaint()` — a save, a star, signing in or out — marks the
   other columns so, and a column marked 1 is drawn again from nothing. A MARK OF `'maybe'` is a LANDING
   (`landRepaint_`: the payload, the inbox two seconds after it, your own settings once an open): a reply
   arrived and may or may not have changed what a column says, so the column is drawn — but if what it
   would draw is byte for byte what it already holds, nothing is written (`paint`, below). A landing never
   turns a 1 into a `'maybe'`.
   `ACT_EPOCH` COUNTS WHAT A PERSON DID — every action dispatched (`on`, below), every change of who is
   signed in. A column drawn before an action may have been edited in place by it (a reaction tap redraws
   its own post, 335), so the identical-markup skip is only taken when no action has run since the column
   was drawn. `DRAW_EPOCH` counts every repaint and landing: a widget drawn ahead of its arrival is
   adopted as running only if neither clock has moved since it was drawn (arcade.js, `widgetUp_`).
   TWO CLOCKS, NOT ONE, and docs/history/341 says why: with landings on the same clock as actions, the
   inbox's landing would always have moved it since the column was drawn, and the skip could never be
   taken on the one landing it was built for. */
let ACT_EPOCH = 0;
let DRAW_EPOCH = 0;
/* ---------- A MARK MADE OUTSIDE `repaint` IS ONE CALL, AND IT TELLS THE BUILDER -----------------------------------
   Six places mark a column out of date themselves rather than through `repaint` — a star (find.js), a spotlight
   (collections.js), the Bible's index landing, a child's account made, a claim answered (me.js), a session opened
   from a receipt (receipt.js) — each because redrawing the columns it touched would restart what runs in them.
   They wrote `STALE[id] = 1` and nothing else, and the builder runs nothing periodic: it is kicked by what makes
   work (`ahead_`). So a star pressed with a key, or a save that answered after the last touch, left the columns
   it marked stale until somebody arrived and paid for the paint inside the release — found by review, 12 Oct:
   thirteen columns stale 43s after a star, nothing booked, and every check waiting for quiet timed out. So they
   mark through here, and it kicks. NO RE-VEIL, unlike `repaint`'s mark: none of the six changes a fact a widget's
   drawing reads — a star and a spotlight are the tiles beside a card, outside its slot (`widgetOnColumn_`), and
   the rest mark columns that hold no widgets. */
function markStale_(ids) {
  [].concat(ids).forEach(id => { if (id) STALE[id] = 1; });
  if (typeof aheadKick_ === 'function') aheadKick_();
}
/* WHICH MARK `repaint` WRITES — 1, except for the length of a landing. */
let REPAINT_MARK = 1;
/* THE COLUMNS WHOSE MARKUP WAS DRAWN BEFORE THE FIRST PAYLOAD — drawn again from nothing (`fresh`) whenever
   they are drawn, so a widget started on the boot's markup is started again in the payload's (331). */
const PRE_PAYLOAD = new Set();
/* HOW MANY TIMES EACH COLUMN WAS DRAWN, for the journeys that ask what a landing drew (check-flow). */
const PAINT_N = {};

/* `fresh`: DRAWN FROM NOTHING, because the caller starts again whatever runs in it — `repaint`, for the
   column in front. Without it, a widget running on the column keeps its slot (see below).
   `o.ahead`: THE BUILDER IS DRAWING IT, in a quiet moment, for a column nobody is looking at (`ahead_`,
   below `afterSlide_`) — so this books no placement and no pane measuring of its own: the builder places
   the one column and measures its panes itself, in the same slice, and a booked `afterSlide_` job would
   shut the very gate the builder waits on. */
function paint(id, fresh, o) {
  /* ---------- A SETTINGS CARD WITH SOMETHING TYPED INTO IT IS NOT REDRAWN UNDER THE TYPING ---------
     REPORTED AS "some things arent updating when i click save", and part of it was this: a Save on
     one card called `load()`, and when the payload landed — and again when the inbox landed — every
     column was repainted from `USER.profile`, so anything typed on ANOTHER settings card and not yet
     saved was thrown back to the old value, seconds after the toast said Saved. Measured in Chromium:
     typed a postcode on Where, pressed Save on About you, and the postcode box was a new element
     holding the old postcode. So a column holding an unsaved or in-flight card is marked stale
     instead, and drawn the next time it is arrived at with nothing typed in it. `settingsKeep_` is in
     me.js, beside the forms it asks about; signed out it always answers no, so signing out clears
     the column as it always did. */
  if (typeof settingsKeep_ === 'function' && settingsKeep_(id)) { STALE[id] = 1; return; }
  /* ---------- AND FIND IS NOT REDRAWN UNDER A CHILD WHO IS WRITING ------------------------------------
     The same rule for the answer box: a payload landing fifteen seconds after "Signed in" rebuilt the
     column with the keypad up, and the box it was typing into was gone (diag-signin, A). `findKeep_`
     (js/answers.js) says when, and draws it again a moment after the box is left. */
  if (typeof findKeep_ === 'function' && findKeep_(id)) { STALE[id] = 1; return; }
  /* AND NO COLUMN IS REBUILT BY A PAYLOAD LANDING UNDER SOMEBODY TYPING IN IT — see `landRepaint_`. */
  if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) { STALE[id] = 1; return; }
  /* ---------- AND NO COLUMN IS REDRAWN UNDER A STROKE, WHICHEVER COLUMN IT IS ---------------------------
     `findKeep_` holds a half-drawn stroke on Find only, and the whiteboard is on Tools and Saved: a
     repaint mid-stroke there cut the line where it came (310). `padHold_` (find.js) asks of any column
     whether the pen's ink is in it. */
  if (typeof padHold_ === 'function' && padHold_(id)) { STALE[id] = 1; return; }
  /* Drawn is fresh, by definition, whoever asked for it. THE MARK IS KEPT FOR ONE QUESTION FIRST: whether
     a landing's `'maybe'` may be answered by writing nothing (below). */
  const mark = STALE[id];
  delete STALE[id];
  /* A COLUMN STILL HOLDING THE BOOT'S MARKUP: a widget started on it BEFORE the payload landed is started
     again in the payload's markup (331's "flyer maker beside You": it drew the one loader over the part that
     waited for the payload), whoever draws the column — an arrival (`go`), the builder, anything. The first
     payload used to empty these columns, which made every first paint fresh by accident; it keeps their
     loader now (docs/history/341), so the rule is said here, once. A widget started on the boot's markup
     AFTER the payload landed — the calculator a wide window starts beside Settings while the builder has not
     yet drawn Tools — drew from the payload and is carried like any running slot: throwing it away lost the
     sum typed into it (check-flow, "a repaint and then an arrival keep the widget running"). */
  const pre = PRE_PAYLOAD.has(id);
  /* A PAGED SCREEN HAS NO PADDING OF ITS OWN — each page supplies it, because a page is positioned
     against the screen's padding box and would otherwise be inset by it and then pad itself again.
     Marked here rather than in the markup so the two lists of paged screens cannot disagree:
     `PAGER` is the only one. */
  $('s-' + id)?.classList.toggle('paged', !!PAGER[id]);
  const el = $('s-' + id);
  const s = SCREENS[id];
  if (!el) return;

  /* ONE SCREEN THAT WILL NOT DRAW MUST NOT TAKE THE OTHERS WITH IT.

     `draw()` throwing used to escape here, up through `paintNeighbours` and out of `go`, so the
     first screen with a problem stopped every screen after it and the boot with them. One missing
     file, and an app where three tabs were fine showed nothing and answered nothing.

     Caught, the broken one says what happened ON ITSELF — where you would look — and the rest of
     the app is drawn, placed and usable. The message names the screen and the error, which is more
     than the old behaviour managed: an exception thrown out of here arrived at the boot handler
     with no idea which screen produced it. */
  let html;
  try {
    html = s ? s.draw() : null;
  } catch (err) {
    console.error('[screen ' + id + ']', err);
    el.innerHTML = `<div class="pane"><div class="card">
        <h3>This screen did not draw</h3>
        <p class="sub">${esc(String((err && err.message) || err))}</p>
        <p class="faint">The rest of the app is fine — swipe across. If a file did not load, the
          banner at the top says which.</p>
      </div></div>`;
    return;
  }
  /* ---------- AND A WIDGET RUNNING ON THIS COLUMN KEEPS THE SLOT IT IS RUNNING IN ---------------------
     The arrival at a `STALE` column is a `paint` of it — and on a wide window a column beside the one in
     front has its widgets running (docs/history/331). Its first arrival after any repaint threw the
     running calculator's slot away and drew the loader in its place, then started it again from
     nothing. `widgetsHeld_` / `widgetsBack_` (arcade.js) put each running slot back where the new markup
     draws that widget; the rest is the new markup. NOT FOR `repaint`'s own column (`fresh`), which it
     starts again at once and always has: a box there is new markup, and `landRepaint_`'s and
     `reconnectKeep_`'s notes are written about exactly that. */
  /* ---------- A LANDING THAT CHANGES NOTHING WRITES NOTHING -------------------------------------------
     THE INBOX LANDS ABOUT TWO SECONDS AFTER EVERY SIGNED-IN PAYLOAD and marks every column but the one in
     front — and measured on 11 Oct (docs/history/341), every column it marked would have drawn markup
     byte-identical to what it already held (eleven of fifteen already were; the other four differed only
     by the avatar's clip number, which is gone: links.js). Drawing them again cost 30–580ms each of DOM
     write and layout at 4x, threw away every decoded picture, every pane's zoom and every widget's drawing,
     and was half of what the Feed showed late on arrival. So a column marked `'maybe'` (a landing's mark —
     never a `repaint()`'s 1) whose new markup is exactly what it was drawn with, with no action dispatched
     since (`ACT_EPOCH`: an action can edit a column in place), is left as it is: its mark is cleared and
     the widgets on it that read facts are put back under their loader, to be drawn again from the new facts
     (`widgetsReveil_`, arcade.js). Never for a column drawn `fresh`, one still holding the boot's markup, or
     a finder, which keep their own fills. THE RESIDUAL RULE: code that edits a column's markup in place outside
     `paint` and outside an action sets that section's `DRAWN` to null, so the next landing draws it rather than
     keeps it — the reels' appends do (`reelMore_`, `reelAhead_`, posts.js): kept by this skip after the draw had
     counted its reels from nought, a topped-up column dealt six of them twice at every landing (review, 12 Oct).
     ---------- AND THE COLUMN IN FRONT TOO (review, 12 Oct) --------------------------------------------------
     It was "never the column in front", and that left out the two cases the skip is for. An ARRIVAL that beats
     the builder after a landing that changed nothing — a child flicking sideways as the inbox lands, which is
     exactly when the builder's quiet never comes — went through `go`'s `paint(AT)` and wrote the whole column
     again: 0 of 96 pictures kept, decoded 16→8, 150–800ms inside the release. And the LANDING itself drew the
     column in front from nothing (`repaint`'s `paint(AT, true)`), the Feed's two front pictures gone for 120ms
     and more. Neither is any different, for the skip, from a column off the glass: the same markup from the
     same facts with nothing pressed since. So `go`'s arrival may take it (`AT` is no longer refused here), and
     so may a landing's own paint of the column in front (`o.land`, from `repaint` while a landing marks) — for a
     column with no widgets and no window of its own, which `repaint` restarts as it always did (the note there). */
  const want = (o && o.land && mark !== 1) ? 'maybe' : mark;
  if (want === 'maybe' && !fresh && html !== null && !PRE_PAYLOAD.has(id)
      && !(typeof finderOf_ === 'function' && finderOf_(id))
      && el.DRAWN && el.DRAWN.html === html && el.DRAWN.epoch === ACT_EPOCH && el.firstElementChild) {
    if (typeof widgetsReveil_ === 'function') widgetsReveil_(id, false);
    return 'kept';
  }
  const held = !fresh && typeof widgetsHeld_ === 'function' ? widgetsHeld_(id, pre) : [];
  el.innerHTML = html !== null
    ? html
    : '<p class="empty">Nothing here yet.</p>';
  el.DRAWN = { html: html, epoch: ACT_EPOCH };
  PRE_PAYLOAD.delete(id);
  PAINT_N[id] = (PAINT_N[id] || 0) + 1;
  if (held.length) widgetsBack_(id, held);
  /* NEW MARKUP IS NEW PAGES, so the next placement walks this column's pages whatever its signature says
     (`placePages_`). */
  el.PG_SIG = null;

  /* ---------- AND THE COLUMN IS CENTRED ON WHAT WAS JUST DRAWN ------------------------------------
     WHILE EVERY CARD HUNG FROM ONE TOP LINE, a column redrawn with a taller or shorter card needed
     nothing: page 0's top did not move. CENTRED (see `columnShift_`), a new height is a new place
     for the column, and nothing asked for it — `check/ui.js` found Saved 9–11px off the middle
     after a star was added and taken away, which is `paint('saved')` with no placement behind it,
     and `dmPoll_` repaints a conversation every twenty seconds the same way. One booked placement,
     coalesced with whatever else this turn asks for; not before the grid has ever been placed (the
     boot's own order does that), and not under a finger, whose drag re-centres every column on its
     next frame anyway. */
  if (typeof PLACED_ONCE !== 'undefined' && PLACED_ONCE && !(o && o.ahead)
      && !(typeof SWIPE !== 'undefined' && SWIPE.live && SWIPE.axis)) {
    placeCells('y', true, 0, id);
  }

  /* ---------- AND WHETHER THE NEW CARDS FIT THE PANES THEY ARE IN --------------------------------
     `paneWatch_` GIVES AN OVERFLOWING PANE `overflow-y: auto` and watches the card for a later
     change of height. It is booked HERE as well as from `placeNow_` because a `paint` is not always
     followed by a placement: `dmPoll_` calls `paint('dm')` every twenty seconds and `dm-refresh`
     calls it on a tap, so a conversation that gained a message would keep the clipping of the
     markup it replaced — and the cards the observer was watching are detached by that same line.

     BOOKED RATHER THAN RUN, for `paneReach_`'s own reason: reading `scrollHeight` a line after
     writing `innerHTML` forces the layout synchronously, and on boot `paintNeighbours` comes
     through here once per column. Whether a card scrolls matters when a thumb tries to scroll it,
     which is at least a frame away. Keyed per screen, so eleven paints book eleven jobs rather
     than overwriting one another — see `afterSlide_`. */
  if (typeof afterSlide_ === 'function' && typeof paneWatch_ === 'function' && !(o && o.ahead)) {
    afterSlide_(() => paneWatch_($('s-' + id)), 'panes:' + id);
  }
}

/**
 * WHAT TO SAY WHEN THERE IS NOTHING.
 *
 * "Nothing here yet" and "we could not reach the server" are different facts, and every screen was
 * saying the first for both — so a phone with no signal told people to go and add rows to a
 * spreadsheet. One sentence, so no screen can get it wrong on its own, and so improving the
 * wording improves it everywhere at once.
 */
function nothingHere(whenEmpty, needsLibrary) {
  /* EITHER REQUEST CAN BE THE ONE THAT FAILED. `LOAD_FAILED` is the backend and `LIBRARY_FAILED` is
     `data/questions.json`, and they fail independently — the library is a static file a weak signal
     can drop while the payload sails through. Reporting only the first meant a dropped library was
     drawn as "nothing in the library yet". See `libraryRows_` for the whole note. */
  /* ---------- BUT NOT WHILE THE APP IS ASKING AGAIN BY ITSELF ----------------------------------------
     FOUND BY REVIEW: "Couldn't load. timeout. Try again" in the middle of the Feed, under the quiet line
     saying "Reconnecting…" — one telling the visitor it is in hand, the other telling them to act, with
     the failure's own words (for an HTML reply, Apps Script's "Authorization is required" — the
     diagnostic that is an admin's only) and a button that puts the splash back up. While `RECONNECT`
     is asking, the column says it is waiting and fills in by itself. A dropped LIBRARY is not this:
     asking the backend again does not fetch the questions, so that still gets a reason and Try again —
     ITS OWN reason, never the backend's words beside it. */
  /* AND THE COLUMN'S WAIT IS THE ONE LOADER. It arrived on 9 Oct as "Waiting for the server. The app is
     asking again by itself, and this fills in when it answers." — right about the state, and a waiting
     sentence of its own in every empty column, on the same day the owner asked for *"a simplistic
     simple loading thing"* in place of every one of those (`loading_`, below). The words are not lost:
     the quiet line over the app (`#reconnect`, "Reconnecting…") says what is happening once, for the
     whole app, and the columns under it show that they are waiting the way every card does. */
  /* `retrying_` (below, beside `awaiting_`), so this and every card that waits for the payload read
     the retry through one definition. */
  const asking = retrying_();
  if (asking && !LIBRARY_FAILED) return loading_();
  const why = (asking ? '' : LOAD_FAILED) || LIBRARY_FAILED;
  if (why) {
    return `<p class="empty">Couldn’t load.<br>
        <span class="faint">${esc(why)}</span><br>
        <span class="text-action" data-do="retry">Try again</span></p>`;
  }
  /* ---------- AND STILL COMING IS NOT THE SAME AS EMPTY -------------------------------------------
     REPORTED AS "when i click on questions it takes long to load", and what a phone was actually
     shown is worse than slow. Measured on a 1.6 Mbps link at 4x CPU: `data/questions.json` is
     **605 KB gzipped**, its body takes about eight seconds to arrive, and for every one of those
     seconds the Find screen read **"Nothing in the shop or the library yet."** — a confident
     sentence about an empty library, printed over a library of 5,790 rows that had simply not
     landed.

     THAT IS THIS REPOSITORY'S OLDEST FAULT ON ITS MAIN SCREEN. It is written down here five times
     already — `loadMessages` showing an empty inbox for an unreachable backend, `check-booking.js`
     printing "nothing to check" and exiting 0, Reels drawing "Nothing here yet" for a column that
     worked, the funnel's own dropped-library banner — and every one is the same sentence: *I did
     not manage to look, reported as I looked and there was nothing there.* `libraryRows_` and
     `LIBRARY_FAILED` were built for the library that FAILS; nothing was ever said about the one
     that is on its way, which is the commoner case by far and the one every visitor meets once.

     `LIBRARY_ROWS` IS `null` UNTIL IT LANDS and `[]` when it legitimately holds nothing, so the
     three states are already distinguishable and only this sentence was folding two of them
     together. No new flag, no second piece of state to keep in step.

     THE CALLER SAYS WHETHER THE LIBRARY IS ITS SUBJECT, because "the questions are still coming" is
     the wrong thing to print on a feed with no posts in it — the same screen, the same function,
     and a different thing missing. */
  /* ---------- AND THE WAIT IS THE ONE LOADER NOW, NOT A SENTENCE OF ITS OWN ---------------------
     It said "The questions are still coming. It is a big file and it only downloads once." — the
     right fact, and the sixth way of drawing a wait on a screen that had five others. The owner, 9
     Oct: *"Every widget has unique loading look. They should all have a simplistic simple loading
     thing."* So it is `loading_()`, below. What this function exists for is untouched: a library on
     its way is still never drawn as an empty one, and a failed one still says why and offers Try
     again. Only the look of the waiting changed. */
  if (needsLibrary && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null) {
    return loading_();
  }
  return `<p class="empty">${whenEmpty}</p>`;
}

/* ==================================================================================================
   WAITING — ONE LOADER FOR EVERY CARD, AND THIS IS THE ONLY PLACE IT IS WRITTEN

   ASKED FOR BY THE OWNER, 9 Oct: *"Every widget has unique loading look. They should all have a
   simplistic simple loading thing while it's info or whatever is loading."*

   MEASURED BEFORE THIS EXISTED (docs/history/306): a skeleton post on three columns, ten different
   waiting sentences in thirteen places ("Starting the camera…", "Looking in the folder…", "Fetching
   what is recorded…", a verse that was a faint "…"), two columns that said "Nothing in the shop yet"
   while the shop was still on its way, seven waits with nothing on the screen at all — and nineteen
   widgets each with its own look before it had started: a grey board, a black canvas, a cream board,
   an empty dropdown, a heading on its own. Twenty-four ways to say one thing.

   NOW THERE IS ONE: three gold dots that pulse in turn, centred in the space the content will take.
   `loading_()` returns it and NOTHING ELSE IN THE APP DRAWS A WAIT — `js/check-loading.js` fails on
   an old waiting phrase, on a skeleton, shimmer or spinner class, on a `@keyframes` for waiting
   outside the one block in style.css, and on the loader's class written out by hand anywhere but
   here. A second loader would be the twenty-fifth look, and that is the fault.

   THREE WAYS IT SITS, AND THE MARKUP IS THE SAME IN ALL THREE — the CSS reads where it is:
     · IN PLACE of a part of a card that is not there yet (a verse, a list, a board's scores): it
       holds about two lines, the size of the sentence it replaced, so nothing shrinks under it.
     · AS A WHOLE PAGE, the only thing on a pane (the feed before the payload, the shop, Saved): the
       dots alone, with no card drawn round them, at the middle of the cell — where the card that
       lands is centred. It held a full-cell empty card at first, and review measured that frame
       collapsing 250–325px a side the moment anything arrived; a frame not drawn cannot jump.
     · OVER markup that is already drawn and not ready — a widget waiting its turn to start, the
       records' boxes before the sheet has answered: the box is marked `aria-busy="true"`, the loader
       is its last child, and what is under it keeps its exact size, hidden, so when `loaded_` takes
       the loader away the content appears in the box the loader was holding. Nothing moves.

   A REAL ERROR OR AN EMPTY RESULT IS NOT LOADING. "Nothing found", "did not arrive — Try again" keep
   their words; this is only ever drawn while something is actually on its way.

   AND THE SPLASH, WITH NOTHING KEPT. `#splash` in index.html draws one of the textbooks' animations
   when the device has kept them; a first visit has none, and waits as a card does — the name, still,
   and THIS loader under it (docs/history/322). That copy is written out in index.html, because the
   page parses it before this file exists and so cannot call this; `js/check-loading.js` holds it to
   what this returns, byte for byte. Change one and change both.

   `role="status"` with the word for a screen reader, because three dots say nothing out loud. In
   shell.js, which loads before every file that draws a card — `check.js` names anything read before
   it exists. */
function loading_() {
  return '<div class="loading" role="status" aria-label="Loading">'
    + '<span></span><span></span><span></span></div>';
}

/* AND TAKEN OFF AGAIN — the one way a box drawn `aria-busy="true"` with a loader over it shows what
   is under it. Silent on a box that was never waiting, so a caller need not know whether it was. */
function loaded_(el) {
  if (!el || !el.removeAttribute) return;
  el.removeAttribute('aria-busy');
  el.querySelectorAll(':scope > .loading').forEach(l => l.remove());
}

/* ---------- AND WHEN IS THE PAYLOAD STILL ON ITS WAY: ONE ANSWER, ASKED BY EVERY CARD -----------------
   EVERY CARD THAT WAITS FOR THE PAYLOAD ASKED `!LOADED`, AND THAT IS ONLY HALF OF IT. `LOADED` is
   set when the first request FINISHES, failed or not — and since the quiet retry (`RECONNECT`) a
   failed first request is not the end: the app asks again by itself under "Reconnecting…" and the
   cards fill in when it answers. FOUND BY REVIEW, every script.google.com request aborted, an admin
   at 390: Shop, Spotlight and the feed showed the one loader (through `nothingHere`, which knew about
   the retry), and in the same moment the score board said "Scores have not arrived yet.", the hours
   "The hours have not arrived from the server yet", the calendar was a bare month, the flyer was live
   with no rooms, Booking every row "—", and Saved "Nothing kept yet." — one wait, drawn the old way
   on nine cards because each asked the half of the question that had already turned false.

   SO THE QUESTION IS ASKED HERE, ONCE. `retrying_` is "the request failed and the app is asking
   again by itself" — what `nothingHere` asks before it prints a failure and a Try again. `awaiting_`
   is "no payload is here yet and one is still coming": before the first answer, or after a failed
   one while the retry is out AND no payload has ever been drawn (`RECONNECT.shown`). That last half is
   what keeps a failed REFRESH behind a good payload from veiling cards that are showing real things:
   a save that reloads and fails leaves the board's scores, the week and the month as they were.

   NOT ONE FUNCTION FOR BOTH, deliberately. `nothingHere` is only reached where its caller has
   already decided the column has nothing to show, and for it a failed refresh is still the retry's
   to answer: given `awaiting_`'s `shown` half it would print "Couldn't load. … Try again" under
   "Reconnecting…", which is the contradiction the retry's own review took out (docs/history/313).
   One base, `retrying_`, so the two cannot drift; each asks the question it has. In a `try`, because
   `RECONNECT` is a const further down this file and a card drawn before it exists must still answer. */
function retrying_() {
  try { return !!LOAD_FAILED && typeof reconnecting_ === 'function' && reconnecting_(); }
  catch (e) { return false; }
}
function awaiting_() {
  try {
    if (!LOADED) return true;
    return retrying_() && !RECONNECT.shown;
  } catch (e) { return typeof LOADED !== 'undefined' && !LOADED; }
}

/** Redraw whatever is showing. What almost everything calls after a change. */
/* ==================================================================================================
   THE ORDER A REDRAW HAPPENS IN, WRITTEN DOWN ONCE

   Four things happen when the screen is rebuilt, and they must happen in this order:

     1. THE SCREEN YOU ARE ON gets its markup.
     2. ITS NEIGHBOURS get theirs, so the slivers either side are not blank rectangles.
     3. THE PAGER is painted, which creates the pages that step 4 measures.
     4. EVERYTHING IS PLACED. Nothing may write innerHTML after this.

   WHY THE ORDER IS NOT A PREFERENCE. Markup has to exist before it can be positioned, and a page
   that is replaced after being positioned loses its position — a page with no position sits at its
   resting place, off the side, invisible. That is exactly the bug that made the screen go blank
   with a sliver showing at the edge, and the comment in `go` still describes it.

   AND WHY THIS IS A FUNCTION NOW. That rule was true everywhere and written down in one place: a
   comment inside `go`. Seven call sites sequenced these steps by hand, in five different orders,
   each remembering a different subset — so getting it right depended on whoever wrote the eighth
   having read the comment in the first.

   A rule that has to be remembered is a rule that will be forgotten. This is the rule, executable.
   `repaint` is the whole sequence; the pieces stay callable for the cases that genuinely need only
   part of it, and those cases now stand out as exceptions rather than looking like the norm.
================================================================================================== */
const repaint = (instant) => {
  /* 00. WHICH COLUMNS THERE ARE, for whoever is signed in now — every sign-in and sign-out ends here, so
         an admin's column comes and goes with them, without a reload. See `columnsFor_`. */
  try { columnsFor_(); } catch (e) {}
  /* 000. A CHANGE OF PERSON PUTS AWAY WHAT WAS DRAWN FOR THE LAST ONE, NOW — before this returns, with no
          idle moment in between: every widget drawn and not running whose drawing was someone else's goes
          back under its loader on every column (`widgetsReveil_`, arcade.js), and both clocks move, so
          nothing drawn ahead for them is adopted for whoever is here now. See docs/history/341. */
  const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
  if (REPAINT_WHO !== null && who !== REPAINT_WHO) {
    ACT_EPOCH++;
    if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => widgetsReveil_(c, true));
  }
  REPAINT_WHO = who;
  DRAW_EPOCH++;
  /* 0. EVERY OTHER SCREEN IS NOW OUT OF DATE — see the note on `STALE`. Marked before painting, so
        the two that are about to be drawn for real clear their own mark on the way through. A LANDING
        MARKS `'maybe'` and never takes a 1 back (`REPAINT_MARK`, `landRepaint_`). */
  TABS.forEach(t => { if (t.id !== AT) STALE[t.id] = STALE[t.id] === 1 ? 1 : REPAINT_MARK; });
  /* 0b. AND EVERY WIDGET DRAWN FROM THE FACTS THAT HAVE JUST MOVED IS PUT BACK UNDER ITS LOADER NOW, on every
         column just marked — not when the column is next drawn. A stale column keeps its markup until the
         builder or an arrival draws it, and a calendar drawn ahead of this landing would have stood on it
         showing last minute's month, beside the column in front on a wide window (docs/history/341). A
         widget declared `pure` reads no facts and keeps its drawing; one running is 331's to restart. */
  if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => { if (c !== AT && STALE[c]) widgetsReveil_(c, false); });
  /* 1. THE SCREEN YOU ARE ON, drawn from nothing (it is restarted below) — UNLESS A LANDING FINDS IT AS IT WAS.
        A landing (`REPAINT_MARK` `'maybe'`) asks `paint` to keep the column in front when what it would draw is
        byte for byte what it holds and nothing was pressed since (the identical-markup skip, `paint`): its
        pictures stay decoded, its camera and its clip run on, its half-filled form is left alone. NOT for a
        column of widgets — a landing restarts them in front (331: "a repaint is the facts changing under the
        column you are on, and that has always been a restart"), and a running calendar must be drawn again from
        the facts that moved — nor for a finder, whose window is its own. `'kept'` means nothing was written,
        so nothing that runs in it is started again. docs/history/341, after review. */
  const land = REPAINT_MARK === 'maybe' && !(typeof WIDGET_COLS !== 'undefined' && WIDGET_COLS.indexOf(AT) !== -1)
            && !(typeof finderOf_ === 'function' && finderOf_(AT));
  const kept = paint(AT, !land, land ? { land: true } : undefined) === 'kept';
  /* 1b. AND WHATEVER THAT SCREEN HAS RUNNING, because `paint` has just replaced the markup it was
         running in. Without this, a repaint while the camera column is open leaves a `<video>` with
         no stream in it — the card looks live and shows black. Same list `go` uses; see
         `startScreen_`. */
  if (!kept && typeof startScreen_ === 'function') startScreen_(AT);
  paintNeighbours();               // 2. the ones either side
  /* 3. A repaint rebuilds the markup, which throws the positions away with it — so the page you
        were on would silently become the first one every time anything saved. Instant for the same
        reason `go` is: nothing moved, so nothing should appear to. */
  paintPager(AT, true);
  placeCells('x', instant !== false);   // 4. and only now, positions
  /* 5. AND EVERY COLUMN JUST MARKED IS DRAWN AGAIN IN THE NEXT QUIET MOMENTS, nearest first — see `ahead_`. */
  if (typeof aheadKick_ === 'function') aheadKick_();
};
/* WHO THE LAST REPAINT DREW FOR — see step 000 above. Null until the first, which has nobody before it. */
let REPAINT_WHO = null;

/* THE TAB BAR IS GONE. Four buttons naming the four screens, at the bottom, taking 3.6rem of a
   phone — and every one of them says something the grid now says better: the screens either side
   are visible at the edges, and swiping to one is the same gesture as turning a page.

   A bar that duplicates what you can already see is a bar that costs height and teaches nothing.

   WHAT IS LOST, and it is real: you could reach any screen in one press, and now the far one is
   three swipes. Kept anyway, because three swipes across a grid you can SEE is a different thing
   from three presses through screens you cannot — and the header still names where you are.
   `data-tab` is still handled, so anything else that wants to send somebody to a screen can. */

/* ================================================================================================
   ONE GRID. TWO AXES. THE SAME BEHAVIOUR ON BOTH.

   Tabs sit along X and a tab's widgets sit along Y, and until now those were two different pieces
   of machinery that happened to be operated by the same thumb: different rules about when a drag
   counts, different distances to travel, different-looking movement, and two separate ways of
   committing at the end. Learning one taught you nothing about the other.

   They are one thing here. A CELL is a screen or a page — the difference is only which axis it
   lies on — and everything below is written once and applied to both:

     · the same rule for when a gesture belongs to the grid rather than to what is under the finger
     · the same throw distance, as a fraction of the axis being travelled
     · the same resistance at the ends
     · the same depth and fade while turning, so a neighbour arriving looks the same either way
     · the same commit, so a tap on a tab and a swipe to it are the same movement

   Adding a third axis later would be a third entry in AXES and nothing else.
================================================================================================ */
const AXES = {
  /* X — the tabs. */
  x: {
    prop: '--dx',                                   // the drag offset, in the cell's transform
    /* HOW FAR A SIDEWAYS SWIPE HAS TO TRAVEL to count, and it is a share of the APP's width rather
       than the window's — the same mistake `stepX_` had. On a window wider than the app column a
       swipe had to cross more than the app is wide to register, so it took a longer drag to turn a
       page than the page itself occupies. */
    span: () => appWidth_(),
    /* The same signature as the other axis, `id` ignored — there is only one row of tabs. Written
       the same way so nothing calling an axis has to know which one it has. */
    at:    () => Math.max(0, TABS.findIndex(t => t.id === AT)),
    count: () => TABS.length,
    /* IN TAB ORDER, not in the order the sections happen to appear in index.html.
       This returned `querySelectorAll`, which is document order — and the markup lists the screens
       in a different order from the tab bar. So a screen was placed at the position of whichever
       section happened to sit at that index in the file: switching to Stuff put Library at the
       front and Stuff two screens off, which is a blank screen with a sliver of something else.
       Only Posts and You lined up by luck, which is precisely the two that ever worked.
       The tab bar is the order. Nothing should have to know how the markup is arranged. */
    cells: () => TABS.map(t => $('s-' + t.id)).filter(Boolean),
    /* CLAMPED. The other axis clamps inside `goPage` and this one did not, so a swipe past the
       last tab asked for `TABS[4]` and read `.id` off nothing. The end resistance made the movement
       small but the DECISION is taken on the full travel, so a firm flick at the edge threw every
       time — and a thrown handler leaves the grid mid-drag with no cells placed. */
    go:    (n, instant) => {
      const at = Math.max(0, Math.min(TABS.length - 1, n));
      go(TABS[at].id, true, instant);
    },
  },
  /* Y — the widgets on a paged screen. Absent on a screen that is not paged, which is what makes
     a vertical drag there fall through to ordinary scrolling. */
  y: {
    prop: '--dy',
    /* THE SAME DISTANCE the threshold and the settle use — see `stepY_`. This said `innerHeight`,
       which is the SCREEN rather than the step, so a vertical gesture was judged against a number
       it was never travelling. */
    span: () => stepY_(),
    /* EVERY ONE OF THESE TAKES AN `id`, defaulting to the screen in front. They used to read `AT`
       and nothing else, so the pages of a screen you were about to swipe onto could not be placed
       until you were already on it — and a page that has not been placed sits at its resting
       position, which is off the side at zero opacity. A blank screen with a sliver of its
       neighbour showing. */
    at:    id => PAGE[id || AT] || 0,
    count: id => PAGER[id || AT] ? pageCount(id || AT) : 0,
    /* WHAT MOVES, which is the screen — the pages are stacked inside it by CSS and never carry a
       transform of their own. This returned the pages, and the only thing it is used for is taking
       the transition off whatever is being dragged; taking it off a page that does not animate did
       nothing, so a vertical drag was fighting a 260ms ease all the way. */
    cells: id => [$('s-' + (id || AT))].filter(Boolean),
    go:    (n, instant) => goPage(AT, n, instant),
  },
};

/**
 * PLACE EVERY CELL ON AN AXIS.
 *
 * Two numbers each, exactly as the dial already used:
 *   --ox / --oy   how far from the front, signed
 *   --a           the same, unsigned, because scale and fade want distance rather than direction
 *
 * `instant` is the difference between arriving and travelling: coming back to a tab has to put you
 * where you left off rather than fly you there, and a boot has to draw rather than animate.
 */
/**
 * PLACE EVERY CELL, ON BOTH AXES AT ONCE.
 *
 * There were two placers, one per axis, and a page could only ever be offset by its own. So a page
 * belonging to another tab had no position on the horizontal — which is why nothing ever peeked at
 * a corner, and why the seven attempts at a preview each fixed one axis and broke the other.
 *
 * ONE PASS OVER EVERY PAGE IN EVERY TAB. A page knows two distances: how many tabs sideways and how
 * many pages down it is from the one being read. Both are written into one transform, so a corner
 * is not a special case — it is simply a cell with two non-zero distances.
 *
 * THE SCREENS STOPPED MOVING. They are containers now and nothing more: no transform, no offset,
 * no z-index. Two things moving the same cell is the fault that broke the carousel, and the fix is
 * that only one of them moves anything.
 *
 * EVERY PROPERTY IS WRITTEN EVERY TIME. The oldest lesson in this file: removing an inline value
 * does not remove the rule beneath it, it REVEALS it — and the stylesheet still says `translateX`
 * and `visibility: hidden`, because that is what an unplaced cell needs. A cell described in full
 * looks the same whatever style.css says.
 */
/* HOW BIG A CELL IS, AND THE ONE GAP BETWEEN THEM.

   The step used to be a PERCENTAGE — 84% of the viewport, on both axes — and a percentage of the
   height is not the same distance as a percentage of the width. On a 401 by 929 phone that is a
   16px gap at the sides and a 37px gap above and below: more than twice as far, for no reason
   anybody could see, because the two numbers were equal and the axes were not.

   ONE GAP, IN PIXELS. A gap is a distance and belongs in a unit of distance, not in a fraction of
   whichever edge it happens to sit near. The step is then whatever it has to be:

     step  = cell + gap        where cell is the viewport times the scale
     peek  = (viewport - cell) / 2 - gap

   Which also means the peek differs per axis, and should: there is more room above a cell on a tall
   phone than beside it, and pretending otherwise is what produced the uneven gap in the first
   place. */
/* HOW MUCH OF THE VIEWPORT A CELL TAKES, and it is the same number for every cell on the grid,
   always. It was 0.80, with anything off-centre shrunk a further 6% on top — so a card grew as it
   arrived and shrank as it left, and its width was never the same twice during a swipe. That reads
   as the layout being unsure of itself: the thing you are dragging changes size under your thumb.

   A card is a fixed size. The peek comes from the STEP being shorter than the viewport, which is
   geometry, and not from the neighbour being drawn smaller, which is decoration pretending to be
   depth. 0.90 leaves a twentieth of the screen either side — enough that the next card shows and
   says it is there, and no more. */
/* ---------- HOW WIDE A CARD IS, AND HOW MUCH OF THE NEXT ONE YOU CAN SEE -------------------------
   TWO NUMBERS, BOTH FRACTIONS OF THE SCREEN, and the sideways gap falls out of them rather than
   being a third thing to keep in step.

   It was a width and a gap in PIXELS, and the edge you could see of a neighbour was whatever those
   two happened to leave over — 3.5px on a normal phone, which is not an edge, it is a hairline.
   Worse, it changed with the screen: a fixed 16px gap against a percentage width means a small
   phone shows less of the next card than a large one, so the thing that tells you there IS a next
   card is weakest exactly where the screen is tightest.

   Stated the way it is actually looked at instead: the card is a share of the screen and you see a
   share of each neighbour. Both hold on every phone, and the gap is whatever is left — about 8px at
   390px wide, more on a larger screen, which is right, because a bigger card wants a bigger gap.

   THE PROSE HERE USED TO NAME 88% AND 4% AND THE CONSTANTS SAID 80 AND 8. Both pairs are
   self-consistent — either way the two edges and two gaps account for the other 20% — so nothing
   was broken and nothing could have caught it; it is simply a sentence that stopped being true when
   the numbers under it changed. The numbers are named once now, below, and the sentence describes
   the SHAPE rather than repeating them, which is the only version of this that cannot go stale.

   ---------- WIDENED FROM 0.80, AND THE ROOM CAME FROM THE EDGE ---------------------------------
   THE GAP IS DELIBERATELY UNCHANGED. There are only two places the extra width can come from and
   they are not equivalent: take it from the gap and the cards close up on each other, which is the
   one thing this layout must not do and the thing `stepX_` refuses outright. Take it from the edge
   and you see slightly less of the neighbour — which still does its whole job, because that edge
   exists to say "there is another one of these beside you", and 6% of a phone is 23px, which is a
   band of colour nobody can mistake for the end of the screen.

   MEASURED AT EVERY WIDTH the checks use: the card goes 256 → 269 at 320px, 312 → 328 at 390px,
   and 329 → 345 wherever `--app` caps the column. The gap stays at 2% throughout. */
const CARD_W       = 0.84;    // a card, as a fraction of the screen's width
const EDGE_SHOWING = 0.06;    // how much of the card either side you can see, same units

/* ---------- ON A WIDE WINDOW THE GRID SHOWS MORE OF ITSELF ----------------------------------------
   ASKED FOR ON 6 OCTOBER: *"on wide screen can see more."* Measured before anything was written, at
   768x1024, 1280x800 and 1920x1080: every one of them showed the phone — one 410px column (`--app`)
   in the middle of the window, its neighbours a blurred 23px sliver at each side, and the rest of a
   laptop black. A 1920 window was 79% empty. Nothing was wrong with the layout; it simply never
   asked how much room it had.

   THE ANSWER WAS ALREADY THE SHAPE OF THE APP. The screens lie side by side on X and `#screen` clips
   them to a phone's width — so a wider window does not need a second layout, it needs the clip to
   be the window. The column stops being capped at `--app`, a card stays a card's width, and the
   step between screens becomes a card and a gap rather than a share of the window. What was a
   sliver either side is now whole screens: Feed, Booking and Shop at once on a laptop, five on a
   1920 monitor, each one sharp and readable, the one in front still centred.

   WHY NOT SEVERAL PAGES OF ONE SCREEN SIDE BY SIDE INSTEAD. Tried on paper and refused: the Find
   screen keeps a WINDOW of fifteen pages that slides as you turn them (`stuffWindow_` in find.js),
   so pages wrapped into rows would re-flow every time the window moved, and every vertical sum in
   this file — `columnShift_`, `stepY_`, the drag threshold — reads one page above the next. The
   screens are already independent columns with one placer; widening the view of them changes two
   numbers and touches no gesture.

   HOW MANY ACROSS. An ODD number of whole cards, because the card in front is centred and a pair
   would put the focus off-centre; as many as fit at `WIDE_CARD_MIN` with `WIDE_EDGE` of the next
   column still showing, then widened to fill — but never past `WIDE_CARD_MAX`, because a card is
   written for a phone's line length and a 600px post is a worse post, not a better one. 768 gets
   one wider card with ~150px of each neighbour readable beside it; 1280 three of 400px; 1920 five of
   361px. Both limits in REM, read off the root, so they scale with the type the way every other
   measurement in style.css does; the breakpoint in px, because it is a question about the WINDOW.

   PHONES ARE UNTOUCHED. Below `WIDE_FROM` none of this runs: `WIDE` stays false and every line
   below takes the branch it took before. */
const WIDE_FROM     = 700;    // px of WINDOW — a phone held either way, and a small tablet upright, are below it
const WIDE_CARD_MIN = 21;     // rem — the narrowest card that is put beside another
const WIDE_CARD_MAX = 28;     // rem — the widest a card grows to fill the room
const WIDE_EDGE     = 24;     // px — at least this much of the next column shows past the last whole one
let WIDE = false;

/* SAID ON `<html>` AS `.wide`, which is what lets `body` stop being a phone (style.css, THE WIDE
   WINDOW). Toggled before anything is measured — `appWidth_` reads `#screen`, whose width IS that
   class — and only when it changes, so a placement that finds it already right costs a read. */
function wideSet_() {
  let w;
  try { w = matchMedia('(min-width: ' + WIDE_FROM + 'px)').matches; } catch (e) { w = innerWidth >= WIDE_FROM; }
  if (w !== WIDE || document.documentElement.classList.contains('wide') !== w) {
    WIDE = w;
    document.documentElement.classList.toggle('wide', w);
    /* AND WHAT THE POINTER WAS SAYING ON A WIDE WINDOW GOES WITH IT — see `wideOverClear_`. */
    if (!w) wideOverClear_();
  }
  return WIDE;
}

/* THE CARD'S WIDTH ON A WIDE WINDOW, in px, and how many whole ones fit — see above. */
function wideCard_() {
  const W = appWidth_();
  let rem = 16;
  try { rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; } catch (e) {}
  const lo = WIDE_CARD_MIN * rem, hi = WIDE_CARD_MAX * rem;
  let k = 1;
  while ((k + 2) * lo + (k + 1) * CELL_GAP + 2 * WIDE_EDGE <= W) k += 2;
  const card = Math.min(hi, (W - 2 * WIDE_EDGE - (k - 1) * CELL_GAP) / k);
  return { card: Math.max(lo, card), k: k };
}

/* ---------- `wideShift_` WAS HERE: AT EITHER END OF THE ROW, THE ROW SLID TO THE EDGE ------------
   So that Feed, first in the row, did not sit in the middle of a 1280 window with 440px of black to
   its left. The owner, 6 Oct: *"the widget in focus is always in centre not like how you just
   did."* The card in front is the middle of the window on every screen, the first and last
   included — the empty side IS the end of the row, which is what the dark sliver says on a phone. */

/* THESE TWO COME OUT OF THE SAME WIDTH, which is the whole thing to understand before changing
   either. Across the screen sits: an edge, a gap, the card, a gap, an edge —

     2 × EDGE_SHOWING  +  2 × gap  +  CARD_W  =  1

   so `gap` is not a third setting, it is what is left: `0.5 − CARD_W/2 − EDGE_SHOWING`. Show more
   of the neighbour and the card gets narrower by exactly that much; there is nowhere else for the
   room to come from.

   AND THE GAP MUST NOT GO NEGATIVE. A negative gap is cards overlapping, and it would not throw or
   warn — the neighbour would simply creep over the one you are reading, which reads as a rendering
   fault rather than as two numbers that do not fit. `stepX_` refuses it below rather than drawing
   it. */
/* Kept under its old name because the vertical spacing still uses it and 16px is right there —
   a column of cards is read one after another, and the gap only has to say "these are separate". */
const CELL_GAP   = 16;        // pixels between one card and the next, going DOWN

/**
 * HOW FAR APART TWO PANES SIT, so that the gap between what you SEE is `CELL_GAP`.
 *
 * Half of this pane, the gap, half of the one being read. Measured rather than assumed, because a
 * pane is as tall as whatever is on it and no two are the same — which is the whole reason the
 * previous version, which spaced the cells, put the neighbour off the screen.
 *
 * `offsetHeight` rather than `getBoundingClientRect`, because the cells are scaled and the rect
 * comes back scaled with them: measuring the drawn size and then scaling it again is the error
 * that makes a neighbour drift further away the smaller it gets.
 */
/* ---------- THE BROWSER STACKS THE COLUMN, NOT THIS FILE -----------------------------------------
   OVERLAP IS NOW IMPOSSIBLE, and that is the point of the change rather than a happy result of it.

   Every version of this until now worked out where each card should go — a step, then a step times
   a distance, then a running total — and every version was correct arithmetic that produced wrong
   answers, because all of them depended on measuring a card at a moment when its contents might
   not be there yet. On this screen the contents genuinely arrive late: pages are built as you come
   near them. So there is no moment at which measuring is reliable, and no amount of care in the
   sum can fix a sum whose inputs are not ready.

   So the sum is gone. The pages are laid out by CSS as an ordinary column with a 16px gap, which
   is a thing browsers do perfectly and re-do by themselves the instant anything on the page
   changes size. Two boxes in a column cannot overlap — not late, not early, not ever.

   WHAT IS LEFT FOR THIS FILE: sliding the whole column so the page you are reading is on the
   line every column puts its card on — see `cardTop_` below, which is where that line comes from
   and why it is not the middle of the screen any more. One number, from `offsetTop`, which the
   browser maintains. And if it is ever read at a bad moment the worst that happens is the column
   sits a little high or low for a frame — never one card on top of another. */
/* ---------- THE CARD YOU ARE ON SITS IN THE MIDDLE OF THE SCREEN ---------------------------------
   ASKED FOR ON 5 OCTOBER: *"focused widgets should be in centre of screen. also those widgets not in
   focus should actually look slightly out of focus effect."*

   IT WAS ONE TOP LINE FOR EVERY COLUMN, and the reason it was is worth keeping in view. Reported
   before that as *"when I swipe left and right on certain things I see the edge are slid up or down
   at times"* — each column was centred on its own card, cards are different heights, and a sliver
   of a neighbour whose top edge sat ninety pixels lower read as a step in the edge (history 131).
   The fix put every card's TOP on the line `.pane`'s own reserve leaves (37px at 390x844), which
   lined the edges up and left a short card hanging from the top with the space below it: measured
   on 5 October, the card in front was 192px off the middle of a 390x844 screen at the median and
   306px on Saved.

   CENTRED AGAIN, AND WHAT MADE THE EDGES READ AS A FAULT IS NOW THE POINT OF THEM. Two neighbours of
   different heights no longer share a top edge mid-swipe — their CENTRES agree instead — and the
   cards either side are drawn out of focus (`.soft`, in `placeGrid`), so a taller card behind a
   short one reads as depth rather than as a column that slipped. `check/ui.js`'s COLUMNS OUT OF LINE
   asks the new contract: every column's card centred, within 2px.

   EVERY CARD, NOT ONLY THE SHORT ONES. Clamping to the old line for a card near the cap was
   measured as the alternative — it keeps 17–21px of the card above on every page, and leaves a
   cap-height card 15–18px low, its bottom edge on the bottom of the glass. Centred, that card has
   18.5px above and below at 390x844 and the neighbours show by about two pixels; it is the one case
   where the peek gives way, and the card filling the screen says "this is the one" without it.

   A CARD TALLER THAN THE SCREEN starts at the top rather than off it — `.pane`'s cap makes that
   impossible today, and a card whose heading is above the glass is the worst version of wrong.

   AND A CARD YOU ARE USING IS NOT CENTRED AGAIN — see `HOLD_AT`, just below. */
function columnShift_(host, at) {
  const pages = host.querySelectorAll(':scope > .page');
  const cur = pages[Math.max(0, Math.min(pages.length - 1, at))];
  if (!cur) return 0;
  const boxH = host.clientHeight || innerHeight;
  const h = HOLD_AT;
  if (h && host.id === 's-' + h.id && (PAGE[h.id] || 0) === h.p && at === domIndex_(h.id, h.p)
      && h.vp === innerWidth + 'x' + innerHeight) {
    const room = boxH - cur.offsetHeight;
    /* `lift` IS THE MATHS KEYPAD'S, and only the keypad's — see `kpLift_` in keypad.js. After the
       clamp, because it is the one case where a card is meant to go above the glass: the phone's own
       keyboard pushes a page up out of sight to keep the line being typed on in view, and so does
       this. Taken off again when the pad goes away. */
    return (room <= 0 ? 0 : Math.max(0, Math.min(room, h.top))) - (h.lift || 0) - cur.offsetTop;
  }
  return Math.max(0, (boxH - cur.offsetHeight) / 2) - cur.offsetTop;
}

/* ---------- ONCE YOU ARE USING A CARD, IT STAYS WHERE IT IS ---------------------------------------
   CENTRED IS WHERE A CARD ARRIVES, NOT WHERE IT IS PUT BACK EVERY TIME ITS HEIGHT CHANGES. The first
   version re-centred on every change — the `ResizeObserver` behind `holdColumn_` sees the card in
   front as well as the ones above it — and measured on 5 October, pressing the funnel's answer
   shortened the card by its list and moved the search box 38px down the screen at 390x844 (31px at
   320x568). The search box and the chips staying put when an answer is pressed is a thing the owner
   asked for by name — *"nice more sleek, fresh stable"*, the state in check/states.js — and that
   state measures against the pane, so a pane that moved could not fail it. Showing an answer grew
   its card by 56px and moved the question 28px up from under the finger that pressed it.

   SO A PRESS, A FIELD TAKING FOCUS OR A CHANGE ON THE CARD IN FRONT HOLDS ITS TOP WHERE IT IS, and
   `columnShift_` keeps that line for as long as you stay on that card: it grows and shrinks
   DOWNWARD, as a page of paper does, and nothing above your finger moves. Only a card that grows
   past the bottom of the glass is lifted, by exactly as much as it needs. Arriving anywhere else
   lets go (`placeGrid`), so the next card is centred, and a card that changes before anybody has
   touched it — a widget drawing itself as it starts — is still re-centred, because nobody is
   reading it yet.

   KEYED ON THE PAGE'S NUMBER, NOT ITS ELEMENT: the funnel repaints the whole column on a press, and
   the page you are on is the same page in new markup. And on the size of the window, so turning
   the phone round centres again. */
let HOLD_AT = null;      // { id, p, top, vp, lift } — the card being used, where its top is held, and how far the keypad lifted it

function holdHere_(t) {
  try {
    const pg = t && t.closest && t.closest('#screen .page.on');
    const host = pg && pg.parentElement;
    if (!host || host.id !== 's-' + AT) return;
    /* ONCE PER CARD. The first touch says where it is; asking again on every keystroke would force a
       layout per letter typed, for the answer the first one already gave. */
    if (HOLD_AT && HOLD_AT.id === AT && HOLD_AT.p === (PAGE[AT] || 0)) return;
    const at = colPlaced_(host);
    if (!at) return;
    HOLD_AT = { id: AT, p: PAGE[AT] || 0, top: at[1] + pg.offsetTop, vp: innerWidth + 'x' + innerHeight };
  } catch (e) { HOLD_AT = null; }
}

/* ---------- A CARD ABOVE CHANGED HEIGHT, SO THE COLUMN IS HELD ON THE PAGE YOU ARE READING --------
   THE PAGES ARE AN ORDINARY CSS COLUMN AND THE SHIFT IS WORKED OUT FROM `offsetTop`, so a card
   ABOVE the page in front that changes height after the column was placed moves that page by the
   difference — and nothing re-placed it, because nothing had ever grown up there. A post
   photograph in its own proportions is the first thing that does: it reserves 4:5 while the file is
   on its way and becomes a landscape when it lands. Measured at 390x844 with two landscapes above
   the post being read and the files 3.5s late: the post in front jumped 447px up the screen and
   STAYED there until the next swipe. With a portrait among them the zoom-to-fit happened to
   re-place the column, three frames later — a 100px flicker instead of a lost post.

   SO THE CALLER IS THE `ResizeObserver` THAT ALREADY WATCHES EVERY CARD (`paneWatch_` in find.js),
   and it calls this INSIDE its own delivery. That is the one moment that is early enough: the
   observer runs after layout and before paint, so the page moved and the column moved back in the
   same frame and no frame ever shows the jump. It is also safe there, which `paneReach_` is not — a
   transform changes where a column is drawn and not how big anything in it is, so no observed size
   changes and the observer cannot feed itself.

   ONLY THE TRANSLATE'S SECOND HALF, and only when it is wrong. The first half is the sideways step
   and belongs to whoever placed the grid. AT REST THE TRANSITION IS SWITCHED OFF for the move, as an
   instant placement does: with it on, the layout would jump the page and the transform would then
   slide it back over a third of a second, which is the flicker wearing a different coat. MID-SLIDE
   it is left alone, so the running animation simply retargets.
   ONLY THE VERTICAL'S TRANSITION is switched off for it: the sideways one is a separate property
   now (`colWrite_`), and a column still sliding across must keep sliding.
   AND IT WAS NEVER SWITCHED OFF AT ALL, because the call said `'0s'` where `colTransition_` takes
   `{ d, tf, delay }`: the duration list came out as `.3s, , .22s`, which the browser refuses
   whole, so the column kept its third of a second. Found on 6 October while fixing the drag case
   below: 60px added to the card above Tools/2 at rest at 390x844, and the card in front read 60,
   59, 56, 51, 43px off on the five frames after the observer had answered — the jump painted and
   slid back, the very thing this exists to prevent. `SLIDE_NONE` now, and swipe.js 'grow' asks the
   frame after.

   AND NEVER WHILE A SLIDE IS BOOKED: `PAGE` may already name the page an animated placement is
   about to go to, and moving the column there now, instantly, would be the slide cancelled a frame
   before it began — the collision `placeCells` exists to make unwriteable. An INSTANT placement
   booked for next frame is different and is not waited for: it would put the column exactly where
   this does, one frame later, and that frame is the jump. Measured at 320x568: waiting for the one
   `paneReach_` books after a zoom changes painted the post 85px low for a frame.

   ---------- AND UNDER A FINGER IT IS THE PLAN THAT IS CORRECTED ----------------------------------
   THIS RETURNED ON `.dragging`, on the reasoning that a drag writes its own offset every frame.
   It did once — every drag frame was a full placement that measured the column again. Since
   `DRAG_PLAN` (below `SLIDE_UNTIL`), a drag frame writes the rest it worked out at the start of the
   gesture plus the finger, and nothing measures until the lift: so a card above that grew mid-drag
   left the card under the finger displaced by the whole growth until the finger let go. Measured
   by the review of 6 October at 390x844, 150px grown inside Tools/0 with the finger on Tools/2:
   150px off for every frame of a held drag, both axes, against 7 then 0 before the plan existed.
   So the column's rest IN THE PLAN is moved to the new one, and the column written there plus
   however far the finger has it — every frame after reads the corrected rest. */
/* ---------- AND ONLY ON THE PAGE IT WAS PLACED FOR, AND IT SAYS WHETHER IT COULD ---------------------
   `fillStuffPages` ASKS THIS NOW, where it used to book a placement (see `settle_` in find.js), so
   two things changed. IT ANSWERS: `true` when the column is where it belongs — corrected, or nothing
   to correct, or a finger whose next frame will measure — and `false` when it could not say, so the
   caller can ask for the placement it used to. AND IT KNOWS WHICH PAGE THE COLUMN WAS PLACED FOR
   (`PLACED_P`, written by `placeGrid`). `goPage` sets `PAGE` and fills the page it turns to BEFORE it
   books its slide, so in that moment `PAGE` already names a page the column has not been sent to —
   and "hold the page in front" would have sent it there now, instantly: the turn's slide skipped. The
   booked-slide test below catches that only once the slide is booked; the page number catches it
   before. */
function holdColumn_(id) {
  try {
    const host = $('s-' + id);
    if (!host) return false;
    if (PLACE_FRAME && PLACE_WANT && !PLACE_WANT.instant) return false;
    if (host.PLACED_P !== (PAGE[id] || 0)) return false;
    const at = colPlaced_(host);
    if (!at) return false;
    /* A FINGER IS DOWN: this column's entry in this drag's plan, or nothing to correct — a plan
       made for another card in front is one the next drag frame throws away and measures afresh. */
    let plan = null;
    if (host.classList.contains('dragging')) {
      const p = DRAG_PLAN;
      plan = p && p.at === AT && p.page === (PAGE[AT] || 0) ? p.cols.find(c => c.host === host) : null;
      if (!plan) return true;
    }
    const want = columnShift_(host, domIndex_(id, PAGE[id] || 0));
    const rest = plan ? plan.y : at[1];
    if (!isFinite(want)) return false;
    if (Math.abs(rest - want) < 0.5) return true;
    const run = typeof host.getAnimations === 'function'
      && host.getAnimations().find(a => a.playState === 'running' && a.transitionProperty === colProp_('y'));
    if (plan) plan.y = want;
    /* ---------- MID-SLIDE, THE SLIDE IS MOVED WITH THE LAYOUT, NOT RETARGETED UNDER IT ----------------
       THIS LEFT A RUNNING SLIDE ALONE AND WROTE ITS NEW END, so the slide carried on toward the right
       place — from the WRONG one: the layout had already moved the page by the difference, and the
       slide's numbers had not. That is the at-rest flicker the note above describes, mid-slide. Found
       on Find flicked back up a paper (8 Oct, *"if i scroll down quickly it does glitch out"*): the
       late fill drew two cards above the one in front while its slide was still running, and the card
       jumped 309px down the glass and slid back up over the next 120ms. So the slide is shifted by
       exactly what the layout moved, from where it is drawn (`colShiftNow_`), and goes on to its end
       in the time it had left — nothing on the glass moves. */
    if (run && !plan) {
      let left = 0;
      try { const tm = run.effect.getComputedTiming(); left = Math.max(0, tm.endTime - tm.localTime); } catch (e) {}
      colShiftNow_(host, want - rest);
      colTransition_(host, null, { d: Math.max(80, Math.round(left)) + 'ms', tf: 'cubic-bezier(.25, .6, .25, 1)', delay: '0s' });
    } else if (!run) colTransition_(host, null, SLIDE_NONE);
    colWrite_(host, at[0], want + (at[1] - rest));
    return true;
  } catch (e) { /* a column left where it was is the behaviour before this existed */ return false; }
}

/* ---------- HOW FAR IT IS TO THE NEXT CARD DOWN ---------------------------------------------------
   MEASURED ONCE, IN ONE PLACE, and this is the whole reason down never felt like across.

   Three different numbers were guessing at it: `innerHeight * 0.5` decided whether a drag had gone
   far enough to turn a page, `innerHeight * 0.6` decided how long the settle should take, and plain
   `innerHeight` decided how far a whole page was. All three were invented, none was measured, and
   they disagreed with each other and with the actual layout. Across has had `stepX_` from the
   start; down had three opinions and no answer.

   The real distance is on the screen already: the card you are on and the one below it are laid out
   by CSS, so the gap between them is a fact the browser maintains. Read from the two of them, and
   guessed at only when there is no second card — which is the case where there is nowhere to swipe
   to anyway. */
function stepY_() {
  const host = $('s-' + AT);
  const pages = host ? host.querySelectorAll(':scope > .page') : [];
  const at = Math.max(0, Math.min(pages.length - 1, domIndex_(AT, PAGE[AT] || 0)));
  const here = pages[at], next = pages[at + 1] || pages[at - 1];
  if (here && next) {
    const gap = Math.abs(next.offsetTop - here.offsetTop);
    if (gap > 20) return gap;
  }
  return innerHeight * 0.66;
}

/* ACROSS IS A CONSTANT — every card is the same width by rule, so there is nothing to measure. */
/* WHERE THE NEXT CARD SITS, from the two fractions above and nothing else.

   Half of this card, plus the gap, plus half of the next — and the gap is whatever makes exactly
   `EDGE_SHOWING` of that next card fall inside the screen. Written out:

     visible edge = half the screen − half a card − the gap
     so the gap   = 0.5 − CARD_W/2 − EDGE_SHOWING          (all fractions of the width)
     and the step = CARD_W + that gap = CARD_W/2 + 0.5 − EDGE_SHOWING

   One expression, no pixels, and it is right at every screen size because every term is a
   fraction of the same width. */
/* ---------- ONE SOURCE FOR THE CARD'S WIDTH ------------------------------------------------------
   THE STYLESHEET DREW THE CARD AND THIS FILE DECIDED WHERE THE NEXT ONE GOES, and the two had to
   be told the same number by hand. They were not: style.css said 80% and shell.js still spaced the
   columns for 90%, which put the neighbour's left edge sixteen pixels PAST the right of the screen.
   Nothing was dimmed and nothing was blank — the card either side was simply not on the screen, and
   from the outside that is indistinguishable from it not being drawn.

   So the number is published, once, from here — the file that also does the arithmetic. The
   stylesheet reads `--card-w` and has a fallback for the moment before this runs. Set them apart
   now and you cannot: there is only one of them. */
function publishCardWidth_() {
  /* A WIDE WINDOW'S CARD IS A WIDTH, NOT A SHARE — see THE GRID SHOWS MORE OF ITSELF. `wideSet_`
     first, because the class it writes is what decides the width `wideCard_` measures. */
  if (wideSet_()) {
    document.documentElement.style.setProperty('--card-w', wideCard_().card.toFixed(1) + 'px');
  } else {
    document.documentElement.style.setProperty('--card-w', (CARD_W * 100).toFixed(2) + '%');
  }
  /* AND HOW SOFT A CARD OUT OF FOCUS IS, for the same reason: `softDrag_` eases a card toward the
     number the stylesheet draws `.soft` with, so the two must be one number. Written with the width
     so it is said once per placement and costs nothing when it has not changed. */
  document.documentElement.style.setProperty('--soft-blur', SOFT_BLUR + 'px');
}

/* ---------- THE WIDTH THAT MATTERS IS THE APP'S, NOT THE WINDOW'S --------------------------------
   THIS IS WHY FIVE ROUNDS OF CHANGING THE NUMBERS NEVER MOVED ANYTHING.

   `body` is capped at `--app` — 26.5rem, about 424px — and centred, so on anything wider than a
   phone the app is a column with the page's own background either side. A card is 80% of THAT
   column. The step between columns was 80% of `innerWidth`, which is the whole WINDOW.

   On a phone narrower than 424px the two are the same number and everything worked. On a window
   465px wide the step is 381px against a card of 339px, and the neighbour's left edge lands at
   424px — exactly the right-hand edge of the app. Not dimmed, not blank, not drawn late: one pixel
   past the end of the visible column, on every screen wide enough for the cap to bite.

   So it asks the element. `#screen` is the box the cells actually live in and the box that clips
   them, so its width is the one every one of these fractions is a fraction OF. `innerWidth` is a
   fact about the browser window and has never been the right question. */
function appWidth_() {
  const el = $('screen');
  return (el && el.clientWidth) || innerWidth;
}

function stepX_() {
  /* THE GAP THE TWO FRACTIONS LEAVE, and a refusal if they leave none. Asking for a wide card AND a
     wide edge is asking for more than a screen has, and the honest answer is to keep the cards
     apart and show a little less of the neighbour rather than to let them overlap — an overlap is
     the one outcome that looks broken rather than merely tight. */
  /* ON A WIDE WINDOW: ONE CARD AND ONE GAP. The same 16px as down the column, so the grid is spaced
     the same both ways — the shares below exist to leave a phone a peek, and a window that shows
     whole neighbours has no peek to leave. */
  if (WIDE) return wideCard_().card + CELL_GAP;
  const gap = Math.max(0.005, 0.5 - CARD_W / 2 - EDGE_SHOWING);
  return appWidth_() * (CARD_W + gap);
}

/* ---------- THE SETTLE AFTER A SWIPE, MATCHED TO THE FINGER ----------------------------------------
   ASKED FOR AS *"refine the swiping to feel more stable ... maybe more frames? ... very profesional
   and sleek"*. More frames was not it: the drag is already placed once per drawn frame, and three
   separate measurements found the drag itself tracking the finger to the pixel. What was wrong was
   the moment the finger LIFTED — the card froze, then leapt, then crept.

   THE SPEED AND THE MOMENT, from `pointerup` in overworld.js. The distance is not known there — the
   release asks for a page and this is what decides where that page is — so the curve is built here,
   in the one placement that runs next, from how far each column really moves.

   TWO NUMBERS, BOTH FROM THE GESTURE:
   · THE DURATION grows with the distance and is held between 260 and 420ms. The old one could fall
     to 130ms, which on a 500px page turn is a card crossing half the phone in one frame.
   · THE CURVE STARTS AT THE FINGER'S SPEED. A `cubic-bezier` whose first control point is (x1, y1)
     leaves at a slope of y1/x1 times the average speed, so the slope is worked out rather than
     chosen: `s = v * T / D`, the speed the card must leave at over the speed the average implies.
     Released still, it eases out of rest instead; released faster than a 0.3 control point can say,
     `x1` shrinks so the curve can still start that steeply. Ends at (.25, 1), which comes to rest
     without the long creep the old curve had.
   Measured at 4x CPU against the old release: the frame the card is frozen in went from 150-380ms
   to 45-100ms, and the first frame after lift moves about as far as the finger was moving per frame
   rather than 7 to 47 times further. */
let SETTLE_FROM = null;        // { axis, v, at } — the release the next placement settles from
/* { axis, dur, tf, until } — the settle the columns are running now. THE AXIS IS PART OF IT: a
   settle is one axis's transition and the other axis keeps its own — see `colWrite_`. */
let SETTLE_ON = null;
function settleFrom_(axis, v) {
  SETTLE_FROM = axis ? { axis: axis, v: Number(v) || 0, at: performance.now() } : null;
}
function settleCurve_(D, v) {
  const dist = Math.abs(D);
  const dur = Math.round(Math.max(260, Math.min(420, 220 + 0.45 * dist)));
  const toward = v * Math.sign(D);                  // px/ms in the direction the card is going
  if (!(toward > 0.02) || dist < 1) return { dur: dur, tf: 'cubic-bezier(.3, 0, .2, 1)' };
  const s = toward * dur / dist;
  let x1 = 0.3, y1 = 0.3 * s;
  if (y1 > 1) { x1 = 1 / s; y1 = 1; }
  return { dur: dur, tf: 'cubic-bezier(' + x1.toFixed(3) + ', ' + y1.toFixed(3) + ', .25, 1)' };
}

/* ---------- EACH AXIS HAS ITS OWN CLOCK ------------------------------------------------------------
   A COLUMN'S POSITION WAS ONE `transform: translate(x, y)` WITH ONE TRANSITION, so a drag on either
   axis had to switch that transition off — and switching it off stopped the OTHER axis dead, wherever
   it had got to. Measured on 5 October with real touch: a flick sideways and then up 40–160ms later
   snapped the arriving column the rest of its sideways slide in one frame, 81–248px (12 of 12), with
   its neighbours out of step by up to 215px for a frame or two; a flick up and then sideways snapped
   the column the rest of its vertical slide, 199–614px in one frame, with the second finger still
   down (9 of 9). `settleLeft_` caught the drag's own axis; nothing could catch the other one, because
   there was only one transition to catch. History 202 named it "not done".

   SO X IS `transform` AND Y IS THE SEPARATE `translate` PROPERTY, each with its own transition. A drag
   writes a zero duration for its own axis only; the other axis is written with the end value it
   already had, which per the transitions spec leaves a running transition alone. A browser without
   `translate` (Safari before 14.1, Chrome before 104) keeps the single transform it always had —
   one slide at a time, exactly the old behaviour rather than a column with no vertical at all. */
const SPLIT_AXES = (() => {
  try { return !(window.CSS && window.CSS.supports) || window.CSS.supports('translate', '1px 2px'); }
  catch (e) { return false; }
})();
/* THE SLIDE NOBODY'S FINGER IS IN — a tab tapped, a tile that turns a page — and the stylesheet's
   `.screen` transition says the same, for the moment before anything is placed. */
const SLIDE_TAP = { d: '.3s', tf: 'cubic-bezier(.3, 0, .2, 1)', delay: '0s' };
const SLIDE_NONE = { d: '0s', tf: 'linear', delay: '0s' };
const colProp_ = axis => (SPLIT_AXES && axis === 'y' ? 'translate' : 'transform');

function colWrite_(host, x, y) {
  if (SPLIT_AXES) {
    host.style.transform = `translateX(${x.toFixed(1)}px)`;
    host.style.translate = `0px ${y.toFixed(1)}px`;
  } else {
    host.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }
}
/* ---------- A COLUMN MOVED BY WHAT ITS LAYOUT MOVED, FROM WHERE IT IS DRAWN -----------------------------
   For the two moments the column's CONTENTS shift under a slide that is running: a card above the one
   in front changing height (`holdColumn_`), and Find's window of pages moving its elements from one
   end of the strip to the other (`stuffKeepPlace_` in find.js). The drawn position is read off the
   running slide (`colNow_`), `d` is added with no transition, and the style is read back once, so the
   browser takes THAT as where the next slide starts — written without the read, the next slide would
   begin from the old number in the new layout, which is the jump. Sideways is left as placed, so a
   column still arriving from a neighbour keeps arriving (one transform on an old browser: its drawn
   x is kept instead). */
/* AND WITH NO TRANSITION AT ALL, NOT A SHORT ONE. With less movement asked for, style.css holds every
   `transition-duration` at `.01ms !important`, which an inline `0s` cannot beat — so the shift became a
   transition, and its first frame drew the column where it was over the layout that had already moved: the
   card in front a whole card's height out of place for a frame. Since docs/history/341 the builder fills a
   page above the card you are reading, at rest, and check/anims.js caught the chapter's drawing flashing
   770px down and back while it was meant to be still. So the vertical property is taken out of the
   transition list for the one write, read back, and put back: a value that is not transitioned when it
   changes cannot be eased, whatever the duration says. */
function colShiftNow_(host, d) {
  if (!host || !(Math.abs(d) >= 0.5)) return;
  const at = colPlaced_(host);
  if (!at) return;
  const now = colNow_(host);
  colTransition_(host, null, SLIDE_NONE);
  const list = host.style.transitionProperty;
  host.style.transitionProperty = SPLIT_AXES ? 'transform, opacity' : 'opacity';
  colWrite_(host, SPLIT_AXES ? at[0] : now[0], now[1] + d);
  void getComputedStyle(host).getPropertyValue(colProp_('y'));
  host.style.transitionProperty = list;
}

/* WHERE THE LAST PLACEMENT PUT IT — the inline values, which are where it is going, not where it is
   drawn mid-slide (that is `colNow_`). `translate: 0px 0px` reads back as `0px`, so a missing second
   half is nought. */
function colPlaced_(host) {
  if (SPLIT_AXES) {
    const mx = /translateX\(\s*(-?[\d.]+)px/.exec(host.style.transform || '');
    if (!mx) return null;
    const t = String(host.style.translate || '').trim().split(/\s+/);
    return [parseFloat(mx[1]), parseFloat(t[1]) || 0];
  }
  const m = /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/.exec(host.style.transform || '');
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
}
/* AND WHERE IT IS DRAWN NOW, off the running transitions. `matrix(a, b, c, d, e, f)` — a translate is
   the last two — parsed rather than handed to `DOMMatrix`, which is one more browser global for
   `check.js` to be told about for two numbers. */
function colNow_(host) {
  const cs = getComputedStyle(host);
  const m = String(cs.transform || '').match(/matrix\(([^)]+)\)/);
  const v6 = m ? m[1].split(',').map(Number) : [1, 0, 0, 1, 0, 0];
  if (!SPLIT_AXES) return [v6[4], v6[5]];
  const t = String(cs.translate || '').trim().split(/\s+/);
  return [v6[4], parseFloat(t[1]) || 0];
}
/* THE THREE TRANSITIONS, AS LONGHANDS. `x` and `y` are `{ d, tf, delay }`; a `null` keeps what this
   column had, which is how `holdColumn_` zeroes the vertical without touching a sideways slide. */
function colTransition_(host, x, y, o) {
  const t = host._slide || (host._slide = { x: SLIDE_TAP, y: SLIDE_TAP, o: { d: '.22s', tf: 'ease', delay: '0s' } });
  if (x) t.x = x;
  if (y) t.y = y;
  if (o) t.o = o;
  /* ONE TRANSFORM, ONE CLOCK: whichever axis a finger holds wins, then a settle, then the tap. */
  const one = t.x === SLIDE_NONE || t.y === SLIDE_NONE ? SLIDE_NONE : (t.x !== SLIDE_TAP ? t.x : t.y);
  const list = SPLIT_AXES ? [t.x, t.y, t.o] : [one, t.o];
  host.style.transitionProperty = SPLIT_AXES ? 'transform, translate, opacity' : 'transform, opacity';
  host.style.transitionDuration = list.map(v => v.d).join(', ');
  host.style.transitionTimingFunction = list.map(v => v.tf).join(', ');
  host.style.transitionDelay = list.map(v => v.delay).join(', ');
}

/* WHERE A SETTLING COLUMN REALLY IS, against where it is going — for a drag that starts before the
   last one has landed (`SWIPE.catch` in overworld.js). Read only while that axis's transition is
   running on the screen in front, because it is a computed-style read and the answer is nought
   otherwise. The other columns move with it along x and not at all along y, so one answers. */
function settleLeft_(axis) {
  try {
    const host = $('s-' + AT);
    const prop = colProp_(axis);
    if (!host || !host.getAnimations || !host.getAnimations().some(a => a.transitionProperty === prop)) return 0;
    const placed = colPlaced_(host);
    if (!placed) return 0;
    const now = colNow_(host);
    const off = axis === 'x' ? now[0] - placed[0] : now[1] - placed[1];
    return Math.abs(off) < 0.5 ? 0 : off;
  } catch (e) { return 0; }
}

/* ---------- THE CARDS NOT IN FRONT ARE SLIGHTLY OUT OF FOCUS ---------------------------------------
   ASKED FOR ON 5 OCTOBER: *"those widgets not in focus should actually look slightly out of focus
   effect."* `.soft` on a page, written below beside `.on`, and drawn by style.css as a 2px blur on
   its pane. Which pages: the ones that can be on the glass — up to two above and below the card in
   front, and the same in the column either side, whose cards peek in at the edges. Nothing further
   away carries it, so nothing off the screen is blurred.

   WHAT IT COSTS WAS MEASURED BEFORE IT WAS WRITTEN (5 Oct, from the trace). A blur on a PANE costs
   nothing while the cards move — the pane is not a layer, so the blur is baked into its column's
   tiles once and the compositor only moves them; the cost is a re-raster of two cards when the focus
   changes. A blur on the COLUMN, or on anything that is its own layer, is a blurred surface redrawn
   every frame: 2.4–2.8 times the drawing, and the main thread's cadence halved at 390x844 under
   load. So: never on `.screen`, never a standing `will-change`, and `.soft-dim` — a dim with no blur —
   on a pane holding a video that is PLAYING, or an iframe (a player whose state this cannot see),
   which repaint every frame and would carry the blur with each one. A paused reel and a canvas at
   rest are a still picture like any other and are blurred: dimming every pane that merely HAS a
   canvas left Flabby Pird sharp beside a blurred chessboard, which read as two cards in focus.

   AND IT FOLLOWS THE FINGER. While a card is dragged, the one in front blurs and the one coming in
   sharpens in step with how far it has come (`softDrag_`), so the card is already mostly in focus
   when it is let go; the release finishes the change at once (`softSettle_`, where the version that
   animated it over the settle is measured and refused). The two panes the finger moves are promoted
   with `will-change: filter` for the length of the movement only — then the blur is applied to a
   layer rather than re-rastered every frame — and let go when the slide ends. Asking for less motion
   or less transparency, the blur is never drawn: the stylesheet dims instead, and nothing here eases.

   NEVER BLURRED: the card in front, a card with a text field you are typing in (`softKeep_`), the
   keypad (it is on `<body>`, outside every pane) and a playing video. */
const SOFT_BLUR = 2;              // px — the stylesheet reads it as `--soft-blur`, published once
let SOFT_DRAG = null;             // { ok, b, keep } — the gesture the out-of-focus look is following
const SOFT_EASE = new Set();      // panes carrying an inline filter, will-change and transition
let SOFT_DONE = 0;

function softMotion_() {
  try { return !matchMedia('(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce)').matches; }
  catch (e) { return true; }
}
const glassOf_ = page => (page && page.querySelector(':scope > .pane')) || null;
/* A PANE THAT REPAINTS ITSELF is dimmed rather than blurred — see above. EXCEPT A SHORT'S PLAYER
   THAT IS NOT SHOWING: a Reels neighbour keeps its YouTube iframe paused at opacity 0 under the
   poster (`.feed-yt` without `is-live`, posts.js), so that pane is a still picture whose state this
   CAN see, and it was the one neighbour left sharp among blurred ones (review, 9 Oct). */
const softDim_ = page => !!(page && (
  [...page.querySelectorAll('iframe')].some(f => !f.closest('.feed-yt:not(.is-live)'))
  || [...page.querySelectorAll('video')].some(v => !v.paused && !v.ended)));
/* AND ONE THE KEYBOARD IS TYPING INTO is left sharp while a finger drags it away. */
function softKeep_(page) {
  if (!page) return true;
  if (SOFT_DRAG && SOFT_DRAG.keep.has(page)) return SOFT_DRAG.keep.get(page);
  const fe = document.activeElement;
  const k = softDim_(page) || !!(fe && fe !== document.body && page.contains(fe)
    && /^(INPUT|TEXTAREA|SELECT)$/.test(fe.tagName));
  if (SOFT_DRAG) SOFT_DRAG.keep.set(page, k);
  return k;
}
function softHold_(glass) {
  if (!glass) return;
  if (!SOFT_EASE.has(glass)) SOFT_EASE.add(glass);
  if (glass.style.willChange !== 'filter') glass.style.willChange = 'filter';
  if (glass.style.transition !== 'none') glass.style.transition = 'none';
}

function softDrag_(which, px, stepX) {
  /* A WIDE WINDOW BLURS ITS NEIGHBOURS TOO NOW (see `placeGrid`), so the finger eases it there as well. */
  if (!SOFT_DRAG) SOFT_DRAG = { ok: softMotion_(), b: null, keep: new Map() };
  if (!SOFT_DRAG.ok) return;
  /* THE NEIGHBOUR AND HOW FAR AWAY IT IS, WORKED OUT ONCE A DIRECTION. This read `offsetTop` and
     `offsetHeight` on every frame of a vertical drag, straight after `colWrite_` had written the
     column — a forced style-and-layout per frame for two numbers that cannot change while the finger
     is down.
     KEPT ON THE DRAG'S PLAN, NOT ON `SOFT_DRAG`. It was on `SOFT_DRAG`, said to live exactly as long
     as the gesture, and it does not: `softSettle_` will not clear it while a finger with an axis is
     down, so when the last flick's release placement landed after the next finger had taken its axis
     — two quick flicks on a busy phone — the cache still named the old card in front and the new
     one as its neighbour. The review of 6 October measured the card under the finger blurred 1.8px
     for the rest of that drag and the card it had left sharp. `DRAG_PLAN` is thrown away by exactly
     the things that move a card in front — any placement that is not a drag, and a new finger — so
     a direction worked out on it is one worked out against the cards that are there now. */
  const key = which + (px < 0 ? '+' : '-');
  const seen = DRAG_PLAN ? DRAG_PLAN.near || (DRAG_PLAN.near = new Map()) : new Map();
  let a, b = null, step = 0;
  if (seen.has(key)) {
    ({ a, b, step } = seen.get(key));
  } else {
    const host = $('s-' + AT);
    a = host && host.querySelector(':scope > .page.on');
    if (!a) return;
    if (which === 'x') {
      const next = TABS[TABS.findIndex(t => t.id === AT) + (px < 0 ? 1 : -1)];
      const col = next && $('s-' + next.id);
      b = col ? col.querySelectorAll(':scope > .page')[domIndex_(next.id, PAGE[next.id] || 0)] || null : null;
      step = stepX;
    } else {
      b = px < 0 ? a.nextElementSibling : a.previousElementSibling;
      if (b && !b.classList.contains('page')) b = null;
      if (b) step = Math.abs((b.offsetTop + b.offsetHeight / 2) - (a.offsetTop + a.offsetHeight / 2));
    }
    seen.set(key, { a, b, step });
  }
  if (!a) return;
  /* THE ONE THE FINGER TURNED AWAY FROM goes back to the look its class gives it. */
  if (SOFT_DRAG.b && SOFT_DRAG.b !== b) { const g = glassOf_(SOFT_DRAG.b); if (g) g.style.filter = ''; }
  SOFT_DRAG.b = b;
  const f = b && step > 0 ? Math.min(1, Math.abs(px) / step) : 0;
  if (f < 0.01) return;
  if (!softKeep_(a)) { const g = glassOf_(a); softHold_(g); g.style.filter = `blur(${(SOFT_BLUR * f).toFixed(2)}px)`; }
  if (b && !softKeep_(b)) { const g = glassOf_(b); softHold_(g); g.style.filter = `blur(${(SOFT_BLUR * (1 - f)).toFixed(2)}px)`; }
}

/* THE RELEASE, OR ANY PLACEMENT THAT MOVED THE FOCUS: the panes the finger was easing go to their
   class's look AT ONCE, as the slide starts — the card arriving sharp, the card leaving soft — and
   keep their layer until the slide has ended, when it is let go (a layer dropped mid-slide is a
   re-raster mid-slide).

   ---------- NOT ON THE SLIDE'S CLOCK, AND THAT WAS MEASURED ------------------------------------------
   THE FIRST VERSION TRANSITIONED THE FILTER over the settle's own duration and curve, which looked
   right and cost the next swipe. Chrome cannot run a blur's animation on the compositor (a filter
   that moves pixels), so for the whole settle the MAIN thread ticked two or three panes' filters every
   frame — and `check/press.js`'s chained flick, a 40px flick 20–40ms into the first one's settle, read
   its release speed as 0–0.37px/ms and failed to turn the page 3 times in 8. With the filter switched
   at the release instead: 8 in 8, speeds 0.44–0.57, the same as before any of this. The finger is
   what eases it (`softDrag_`); the release only finishes what the finger was already doing, and a
   tap-driven slide simply changes which card is sharp as it starts. */
function softSettle_(timing, instant) {
  /* NOT UNDER A FINGER: a placement asked for by something else mid-drag must not take the blur the
     finger is easing off the two cards it is between. */
  if (typeof SWIPE !== 'undefined' && SWIPE.live && SWIPE.axis) return;
  SOFT_DRAG = null;
  if (!SOFT_EASE.size) return;
  SOFT_EASE.forEach(g => { g.style.transition = 'none'; g.style.filter = ''; });
  clearTimeout(SOFT_DONE);
  const ms = instant ? 0 : (parseFloat(timing.d) || 0) * (/ms$/.test(timing.d) ? 1 : 1000);
  SOFT_DONE = setTimeout(function done() {
    /* A FINGER DOWN AGAIN OWNS THESE NOW — wait for it rather than pull its inline blur away. */
    if (SOFT_DRAG) { SOFT_DONE = setTimeout(done, 120); return; }
    SOFT_EASE.forEach(g => { g.style.willChange = ''; g.style.transition = ''; g.style.filter = ''; });
    SOFT_EASE.clear();
  }, ms + 80);
}

/* ---------- A TAP ON A CARD STILL SLIDING IS NOT A PRESS --------------------------------------------
   Measured on 5 October: a tap 90ms after a flick pressed the star on the card arriving under the
   finger — whatever happens to be under a moving card at that instant. A phone's own lists do the
   same thing the other way: a touch on a list still gliding stops the glide and presses nothing. So
   a press that STARTS while the column in front is mid-slide is swallowed, like a drag
   (`PRESS_SLIDING`, read in the click handler below). The last 60ms are let through, because by then
   the card has all but arrived and a person tapping it can see what they are tapping. */
let SLIDE_UNTIL = 0;

/* The two axes still call in — one placer underneath, so a horizontal move and a vertical one
   cannot disagree about where a cell is. */

/* ---------- A DRAG FRAME MOVES THE CARDS AND DOES NOTHING ELSE -----------------------------------
   REPORTED ON 6 OCTOBER, from a phone: *"if i try to scroll quickly up or down its clunky and janky.
   make it a smooth experience. more stability, smoother, more elegant."*

   EVERY FRAME OF EVERY DRAG WAS A FULL PLACEMENT. Twelve columns restyled, every page of every column
   given its position, opacity, visibility and classes again, every column's shift MEASURED again
   (`columnShift_` reads `offsetTop`, a forced layout), and the card width published on the root — to
   arrive, on every frame but the first, at exactly the numbers the first frame had worked out, with
   one of them nudged by the finger. Measured at 4x CPU with rapid flicks on Games and Settings
   (`check/swipe.js` 'flicks'): 8–14ms a drag frame on average and up to 29ms, against a frame of
   16.7, so a quick swipe dropped a frame in three while the finger was still on the glass.

   NOTHING ON THAT LIST CAN CHANGE UNDER A FINGER. `PAGE` and `AT` move only on the release; a card
   that grows mid-drag is `holdColumn_`'s, which corrects the column's rest IN THIS PLAN — it used to
   refuse a column marked `.dragging`, and with nothing else measuring until the lift the card under
   the finger stayed off by the whole growth for the rest of the gesture (see its note). So the
   first drag frame is the full placement it always was — it switches the finger's axis to no
   transition, marks `.dragging`, and works out every column's resting place — and that answer is
   kept as `DRAG_PLAN`. Every frame after it writes the columns the finger is moving (all of them
   sideways, the one in front up and down) at plan + finger, and eases the focus, and stops.
   Any placement that is NOT a drag throws the plan away, so the next drag measures afresh; so does a
   new finger (`pointerdown` in overworld.js), a different axis, or a different page or column.

   AND THE FIRST FRAME NEED NOT MEASURE EITHER, when the last placement has landed. Where every
   column rests is already written on it — `colPlaced_` reads the inline values the last placement
   wrote, which is not a layout — so the plan is taken from there, the finger's axis is switched to
   no transition on the columns it moves, and the card leaves under the thumb in the same frame
   instead of after a whole placement (7–35ms at 4x, the first frame of every swipe). Only when a
   placement is still booked (`PLACE_FRAME`), or a column has never been placed, does the first
   frame fall back to the full one, because then the inline values are not where anything rests. */
let DRAG_PLAN = null;    // { which, at, page, stepX, cols: [{ host, x, y, front }], near } — this drag's sums
function dragPlan_(drag) {
  if (PLACE_FRAME) return null;
  const cols = [];
  for (const t of TABS) {
    const host = $('s-' + t.id);
    if (!host) continue;
    const at = colPlaced_(host);
    if (!at || !host._slide) return null;
    cols.push({ host: host, x: at[0], y: at[1], front: t.id === AT });
  }
  if (!cols.some(c => c.front)) return null;
  cols.forEach(c => {
    c.host.classList.add('dragging');
    if (drag.which === 'x') colTransition_(c.host, SLIDE_NONE, null);
    else if (c.front) colTransition_(c.host, null, SLIDE_NONE);
  });
  return { which: drag.which, at: AT, page: PAGE[AT] || 0, stepX: drag.which === 'x' ? stepX_() : 0, cols: cols };
}
function dragFast_(drag) {
  if (!DRAG_PLAN) DRAG_PLAN = dragPlan_(drag);
  const p = DRAG_PLAN;
  if (!p || p.which !== drag.which || p.at !== AT || p.page !== (PAGE[AT] || 0)) return false;
  if (!p.cols.every(c => c.host.isConnected)) return false;
  const dx = drag.which === 'x' ? drag.px : 0, dy = drag.which === 'y' ? drag.px : 0;
  p.cols.forEach(c => { if (dx || c.front) colWrite_(c.host, c.x + dx, c.y + (c.front ? dy : 0)); });
  softDrag_(drag.which, drag.px, p.stepX);
  return true;
}

/* ---------- HOW MANY CARDS ABOVE AND BELOW THE ONE IN FRONT THE GLASS SHOWS ------------------------
   Two on a phone, faded (.9, .75); three on a wide window, whole — a tall iPad shows a fourth card
   down (see the opacity in `placeGrid`). ONE NUMBER FOR TWO READERS: `placeGrid` draws exactly these
   and hides the rest, and `goPage` fills the Find screen's pages out to exactly these on every turn.
   When they were two literals and an assumption, the assumption lost: the fill reached one card
   either side and the glass showed three, and an empty card sat on the glass of the owner's iPad. */
const glassRows_ = () => (WIDE ? 3 : 2);

/* ---------- WHICH CARDS ARE ON THE GLASS, SAID ONCE PER PLACEMENT -----------------------------------
   ASKED FOR BY WHAT RUNS IN THEM. The owner, 10 Oct, on a 1194px window: *"these remain loading untill
   i scroll to them. i dont like this"* — two widget cards on the column beside Settings, each the
   loader and a star, because only the column in front ever started its widgets. `widgetsGlass_`
   (arcade.js) starts what is on the glass and stops what has left it, and this is where "on the glass"
   comes from, because this function is the one that put everything where it is.

     · `cols` — the column in front, and on a wide window every column showing MORE of its card than
       `WIDE_EDGE`, the edge the layout leaves past the last whole card on purpose: at 1194, 1280 and
       1920 that edge is 8px of card, which shows no widget, and at 768 or 1700 it is 144–146px, which
       shows a third of one. On a phone the neighbour is the 6% peek — a band of card edge — and is
       not counted, so a phone runs what it always ran: the column in front.
     · `pages` — down each of those columns, the pages whose WIDGET is on the glass where this
       placement leaves it: more than `WIDE_EDGE` of its slot inside the window both ways (the column's
       shift, the page's own top, the slot's place in the page; and across, as much of the card as
       shows past the window's edge less the slot's inset). A page with no widget is asked the same of
       the whole page. Out to `glassRows_` either side, the furthest this function draws.
       IT WAS ANY PIXEL OF THE PAGE, and the review of 331 measured what that started: at 1194 on
       Settings the flyer maker's page reached 75px into the window and its slot began 13px below the
       bottom edge — nothing of it showed but its star, and it was running. 24px is the same line
       `check/ui.js` draws for "on the glass", so what is started here is what that check counts.
   READ IN THE PASS THAT IS ALREADY READING — after `columnShift_`'s layout and before a single write —
   so it forces no layout of its own (the slot's offsets are as clean as the page's); never during a
   drag, when nothing is created or stopped and the answer would be thrown away sixty times a second.
   `at` says which column in front it was worked out for, so a column change asked for and not yet
   placed is not mistaken for it (`widgetsLater_`). */
let GLASS = { at: null, cols: [], pages: [] };

function glassNow_(hosts, ti, stepX) {
  const out = { at: AT, cols: [], pages: [] };
  const W = appWidth_();
  const card = WIDE ? stepX - CELL_GAP : 0;
  /* `reach`: HOW MANY COLUMNS EITHER SIDE OF THE ONE IN FRONT THIS WINDOW SHOWS — the same sum as `across`
     below, for any column. It depends on the window, not on which column is in front, so `go` can ask it of a
     column change before that change has been placed (`bootGlass_`). */
  out.reach = 0;
  if (WIDE && stepX > 0) while (out.reach < TABS.length && W / 2 + card / 2 - (out.reach + 1) * stepX > WIDE_EDGE) out.reach++;
  hosts.forEach(h => {
    const dx = h.i - ti;
    /* HOW MUCH OF THIS COLUMN'S CARD IS INSIDE THE WINDOW, ACROSS — all of it for the column in front. */
    const across = dx ? W / 2 + card / 2 - Math.abs(dx) * stepX : Infinity;
    if (dx && !(WIDE && across > WIDE_EDGE)) return;
    out.cols.push(h.id);
    const H = h.host.clientHeight || innerHeight;
    const at = PAGE[h.id] || 0;
    h.host.querySelectorAll(':scope > .page').forEach((el, pos) => {
      if (Math.abs(logIndex_(h.id, pos) - at) > glassRows_()) return;
      if (glassShows_(el, h.shift + el.offsetTop, H, across)) out.pages.push(el);
    });
  });
  return out;
}

/* IS A PAGE'S WIDGET ON THE GLASS — its slot, or the page when it has none, showing more than `WIDE_EDGE`
   of itself inside a window `H` tall, with the page's top at `top` and `across` of the card showing
   sideways. A box with no height has not been laid out (jsdom, which `check-flow` runs in, lays nothing
   out: every page is 0px at the column's middle) and is counted by where it sits, as it always was. */
function glassShows_(el, top, H, across) {
  const sl = el.querySelector('.widget-slot');
  const at = sl && glassOffset_(sl, el);
  const y = at ? top + at.top : top;
  const tall = at ? sl.offsetHeight : el.offsetHeight;
  if (!tall) return y > 0 && y < H;
  const down = Math.min(y + tall, H) - Math.max(y, 0);
  const side = Math.min((at ? sl.offsetWidth : el.offsetWidth) || Infinity, across - (at ? at.left : 0));
  return down > WIDE_EDGE && side > WIDE_EDGE;
}

/* WHERE A SLOT SITS INSIDE ITS PAGE, by offsets — the same untransformed layout the page's own
   `offsetTop` is, so it agrees with where this placement puts the page rather than with where a slide
   has it this frame. Summed up the chain to the page, or to the page's own offset parent and less the
   page's offset from it (a page is `position: static`), and less any scroll between the two. Null when
   the chain never reaches either — a slot not laid out — and the page is asked instead. */
function glassOffset_(sl, page) {
  let top = 0, left = 0, n = sl;
  const base = page.offsetParent;
  while (n && n !== page && n !== base) { top += n.offsetTop; left += n.offsetLeft; n = n.offsetParent; }
  if (!n) return null;
  if (n !== page) { top -= page.offsetTop; left -= page.offsetLeft; }
  for (let p = sl.parentNode; p && p !== page; p = p.parentNode) top -= p.scrollTop || 0;
  return { top, left };
}

function placeGrid(instant, drag) {
  if (drag && dragFast_(drag)) return;
  DRAG_PLAN = null;
  /* Said before anything is measured or moved, so the width the stylesheet draws and the width
     this function spaces by cannot be different on the same frame. Setting a custom property that
     already holds that value costs nothing. */
  publishCardWidth_();
  const tabs = TABS.map(t => t.id);
  const ti = Math.max(0, tabs.indexOf(AT));
  const dxPx = (drag && drag.which === 'x') ? drag.px : 0;
  const dyPx = (drag && drag.which === 'y') ? drag.px : 0;
  const stepX = stepX_();

  /* ---------- THREE PASSES — WRITE, READ, WRITE — AND THAT IS THE WHOLE OF THE SPEED ----------
     THIS WAS ONE LOOP THAT WROTE A COLUMN'S STYLES, THEN MEASURED IT, THEN WROTE THE NEXT ONE. Every
     `columnShift_` reads `offsetTop` and `clientHeight`, and a read after a write forces the browser
     to lay the whole app out again before it can answer — so eleven columns cost eleven full
     layouts per placement, and a placement runs on every tap and every page turn. REPORTED AS "when
     students click questions it takes ages to load on phone"; a profile at 8x CPU put
     `columnShift_` at 188 ms of self time across five taps and six page turns.
     WHAT IT BUYS IS SMALLER THAN THAT NUMBER, and it is worth saying so: most of a layout is work
     the frame needs anyway, so moving it is not removing it. `paneWatch_` straight after this now
     pays for the one layout that is left. Measured over the same walk, `placeNow_` in total went
     from about 730 ms to about 620 ms — real, and noisy on a shared machine. The answers do not change: each column is absolutely positioned, so column 3's styles cannot
     move a card inside column 7, and every read still sees exactly what it saw before — its own
     host's `on` class written, its pages' classes as the last placement left them. Only the NUMBER
     of forced layouts inside this function changes, from eleven to one. */
  /* ---------- AN INSTANT PLACEMENT DOES NOT CANCEL A SLIDE THAT IS STILL RUNNING -----------------
     `transition: none` STOPS A TRANSITION DEAD, so an instant placement asked for while a swipe was
     still settling teleported the card the rest of the way. Two ask for one routinely: `startScreen_`
     re-places Tools, Games and Saved 300ms after arrival, which on a slow phone is inside the
     slide, and a pane whose zoom changed re-places its column. Measured at 4x on a 320x568 phone: six
     of thirty swipes finished with the card covering 76-255px in a single frame. An instant request
     made while a slide runs is an animated one instead, which ends in the same place without the
     jump — the rule `placeCells` already states, that animation is the safe side to lose to. */
  if (instant && !drag && SETTLE_ON && performance.now() < SETTLE_ON.until) instant = false;
  const hosts = [];
  tabs.forEach((id, i) => {
    const host = $('s-' + id);
    if (!host) return;
    hosts.push({ id: id, i: i, host: host });

    /* A SCREEN IS THE COLUMN, and the column is what moves. Every page used to be positioned on
       its own; they now sit in an ordinary CSS column inside this and the whole thing slides. One
       transform per screen instead of one per page — and, the reason for the change, two boxes in
       a column cannot land on top of one another however late their contents arrive. */
    host.classList.remove('hidden');
    host.style.display = 'flex';
    host.style.position = 'absolute';
    host.style.top = '0'; host.style.right = '0'; host.style.bottom = '0'; host.style.left = '0';
    host.style.overflow = 'visible';
    /* `is-front`, NOT `on`. Nothing reads the column's mark — `.page.on` is the card in front and is what
       every reader asks — and `on` in an ancestor compound of the component rules (`.picker.on span`,
       `.page:not(.on) .loading > span`, `.hr.on + .hr.on`, `.tile.on .tile-i-*`) made every toggle of it on a
       COLUMN invalidate that column's whole subtree: 870 elements and 31ms at 4x on the Feed, twice a
       sideways turn. A name no rule mentions invalidates nothing (133 elements). docs/history/341. */
    host.classList.toggle('is-front', id === AT);
    /* A FINGER IS DOWN — read by `holdColumn_`. It used to be `no-anim`, which switched off every
       transition on the column; a drag now zeroes only its own axis (`colTransition_` below). */
    host.classList.toggle('dragging', !!drag);
  });
  /* A CARD HELD BECAUSE YOU WERE USING IT IS LET GO THE MOMENT ANOTHER ONE IS IN FRONT — see
     `HOLD_AT`. Before the shifts are read, so the card arrived at is centred. */
  if (HOLD_AT && (HOLD_AT.id !== AT || (PAGE[AT] || 0) !== HOLD_AT.p)) HOLD_AT = null;
  /* Slid so the page being read sits in the middle — see `columnShift_`. A vertical drag only ever
     moves the screen in front; the others have no finger on them. READ ONLY — see the three passes
     above. */
  hosts.forEach(h => {
    h.shift = columnShift_(h.host, domIndex_(h.id, PAGE[h.id] || 0)) + (h.id === AT ? dyPx : 0);
  });
  /* AND WHICH CARDS THAT LEAVES ON THE GLASS — see `GLASS`. Still in the reading pass. */
  if (!drag) GLASS = glassNow_(hosts, ti, stepX);
  /* THE SETTLE, if this placement is the one a release asked for. The distance is the column that
     moves furthest along the swipe's axis, read off where the last placement put it — the drag's last
     position, written inline, so nothing is forced to lay out — against the one it is about to get. */
  /* WHENEVER IT COMES. A window of 150ms was the first version, and on a slow phone the placement a
     release asks for can start later than that — it then fell back to the old curve, whose first
     frame is the lurch this exists to remove. The release is cleared at the next `pointerdown`
     instead, so a later tap cannot inherit it. */
  const rel = !instant && !drag && SETTLE_FROM ? SETTLE_FROM : null;
  if (rel) {
    SETTLE_FROM = null;
    let D = 0;
    hosts.forEach(({ i, host, shift }) => {
      const was = colPlaced_(host);
      if (!was) return;
      const d = rel.axis === 'x' ? (i - ti) * stepX - was[0] : shift - was[1];
      if (Math.abs(d) > Math.abs(D)) D = d;
    });
    const c = settleCurve_(D, rel.v);
    /* SIXTEEN MILLISECONDS IN ALREADY — see the delay below. */
    SETTLE_ON = { axis: rel.axis, dur: c.dur, tf: c.tf, until: performance.now() + c.dur - 16 };
  }
  const settle = !instant && !drag && SETTLE_ON && performance.now() < SETTLE_ON.until ? SETTLE_ON : null;
  /* ON THE COLUMN, NOT THE ROOT — see `settleCurve_`. `transition-duration` does not inherit, so
     writing it costs eleven elements' style and not three thousand. The opacity fade keeps its own
     .22s; only the slide is the finger's.
     A TRANSITION SHOWS NOTHING ON ITS FIRST FRAME — progress nought — so every release began with
     one frame of the card standing still under a finger that had just been moving it. Starting a
     frame in (`-16ms`) is the continuation: the card is already one step along when it is first
     drawn. */
  const runs = ax => (settle && settle.axis === ax
    ? { d: settle.dur + 'ms', tf: settle.tf, delay: '-16ms' } : SLIDE_TAP);
  const front = hosts.find(h => h.id === AT);
  const before = front && !instant && !drag ? colPlaced_(front.host) : null;
  /* ON A WIDE WINDOW, how far from the middle a column can be and still have a card on the glass:
     half the window and half a card, and one step more, so a column a drag is about to bring in is
     already drawn. */
  const glass = WIDE ? appWidth_() / 2 + stepX * 1.5 : 0;
  /* ---------- AND WHAT A SLIDE CARRIES ACROSS THE GLASS STAYS DRAWN WHILE IT IS CARRIED -------------------
     THE OWNER, 11 Oct: *"If I scrol fast left right up or down it's still clunky. I think because it only
     loads things which are close to pov."* Half of what he saw was not loading at all. What was drawn
     here was keyed on the page each column is GOING TO — `d` pages from the target — and in a run of fast
     flicks the target is two to eight pages ahead of where the column is drawn, because each release
     re-aims a slide that has not finished. So the cards the slide was carrying across the glass, built and
     filled, were `.far` (hidden) or at opacity 0 for the whole of their crossing: measured at 4x CPU on a
     phone and an iPad, 5–43% of a run's frames had a black hole where a card was, and a whole column could
     be black for 0.3–0.8s in a sideways sweep (docs/history/341).
     SO A COLUMN KEEPS DRAWN THE BAND ITS SLIDES HAVE SWEPT, measured on the glass in PIXELS and not in
     pages: an iPad's 1180px glass holds four to eight short cards, so any count of pages is either too
     few there or too many on a phone. `trailY_` keeps the union of every window the column's glass has
     been aimed at while its last slide is still running (`TRAIL`, per column, because the settle a
     release starts says nothing about which column it moves), and a page is drawn when its box meets that
     union widened by one glass height either way — so a card is visible a whole glass before it can
     arrive and stays visible until it has gone. Sideways the same, over column indices (`trailX_`).
     At rest the band is the glass you are looking at, one glass either side, which on a phone is about
     the cards that were drawn before, and it is put back to that once the slide has ended (`trailEnd_`).
     READ HERE, in the pass that is already reading: the offsets are those of the layout `columnShift_`
     has just paid for, so nothing below forces another. */
  const now = performance.now();
  if (!drag) TRAIL_X = trailX_(ti, now, !!instant, settle);
  const xRun = now < TRAIL_X.until || !drag;
  const xlo = xRun ? Math.min(TRAIL_X.lo, ti) : ti, xhi = xRun ? Math.max(TRAIL_X.hi, ti) : ti;
  let wider = xlo < xhi;
  hosts.forEach(h => {
    const dx = h.i - ti;
    const at = PAGE[h.id] || 0;
    const acrossT = h.i < xlo ? xlo - h.i : h.i > xhi ? h.i - xhi : 0;
    const glassH = h.host.clientHeight || innerHeight;
    const dur = settle ? settle.dur : 300;
    const band = trailY_(h.host, h.shift, glassH, now, !!drag, !!instant, dur);
    if (band.top < -h.shift - 1 || band.bot > -h.shift + glassH + 1) wider = true;
    const c = { at: at, across: Math.abs(dx), acrossT: acrossT,
      onGlass: WIDE && acrossT * stepX < glass,
      drag: !!drag, lo: band.top - glassH, hi: band.bot + glassH };
    c.skip = !drag && h.id !== AT && GLASS.cols.indexOf(h.id) === -1;
    h.c = c;
    h.pg = pagesRead_(h.host, h.id, c);
  });
  /* PUT BACK TO THE GLASS ONCE THE SLIDE HAS ENDED — see `trailEnd_`. */
  if (wider && !drag && typeof afterSlide_ === 'function') afterSlide_(trailEnd_, 'trail');
  hosts.forEach(({ id, i, host, shift, c, pg }) => {
    const dx = i - ti;
    const at = c.at;
    const x = dx * stepX + dxPx;

    /* EACH AXIS ITS OWN CLOCK — see `colWrite_`. The finger's axis follows the finger; the other
       keeps whatever slide it is in the middle of. */
    colTransition_(host,
      instant || (drag && drag.which === 'x') ? SLIDE_NONE : runs('x'),
      instant || (drag && drag.which === 'y' && id === AT) ? SLIDE_NONE : runs('y'),
      instant ? SLIDE_NONE : { d: '.22s', tf: 'ease', delay: '0s' });
    colWrite_(host, x, shift);
    /* WHICH PAGE THIS SHIFT WAS WORKED OUT FOR — read by `holdColumn_`, which corrects a column only
       for the page it was sent to. */
    host.PLACED_P = at;
    /* Only the screen in front takes presses. A sliver of the next tab showing at the edge is
       something to look at, not something to tap. */
    /* STILL TRUE ON A WIDE WINDOW, where the columns beside are whole and readable: a press on one
       is not a press on what is under the pointer, it is "bring that one to the front" — which
       `wideFocus_` below answers by where the press landed, so nothing inside a card that is about
       to slide can be pressed by accident, and a swipe begun over it is still a swipe. */
    host.style.pointerEvents = dx === 0 ? 'auto' : 'none';
    const across = Math.abs(dx);
    /* ---------- THE NEIGHBOUR IS BARELY DIMMED, AND HERE IS WHY -----------------------------
       This was `.55`, to say "behind" — and a dark card at 55% over a black app is very nearly
       black. What you see of a neighbour is a sliver: its bright top edge and its border, and
       nothing else. Those are `rgb(255 255 255 / .16)` on a `#101010` fill, which is already
       faint on purpose — put it behind 55% opacity and the edge renders at 30/255 against black.
       Drawn, and invisible.

       Exactly the fault the blur had: the ONE thing making a card visible was the thing being
       dimmed away, so the card was widened and the gap tightened twice over and neither could
       help. `.92` keeps the sense of something sitting behind without taking the edge with it.
       (THE BLUR THAT NOTE MEANS was a blur on the COLUMN, with nothing beside it to say which card
       was in front. `.soft` below blurs a CARD, by 2px, and the card in front is sharp beside it —
       a soft edge next to a sharp one is still an edge.) */
    /* ---------- AND THE ROW KEEPS DRAWN THE COLUMNS A SLIDE CROSSES -----------------------------------
       `acrossT` IS HOW FAR THIS COLUMN IS FROM THE COLUMNS THE ROW HAS SWEPT (`TRAIL_X`), not from the one it
       is going to. It was `across`, from the target, and a flick of three or four columns in a second
       carried columns at opacity 0 across the glass — the black column of the sweep, 0.3–0.8s of it at 4x
       (docs/history/341). Within THREE of the swept span a column is drawn at .92; the fourth is drawn and
       transparent, so its own .22s fade has already happened off the glass when a sweep reaches it; past
       that, hidden, as before. THREE AND NOT TWO, MEASURED: with two, check/reach.js still read a column at
       opacity nought 41px onto a 390 glass in one or two sweeps of four flicks a second at 4x CPU — its
       style said .92 and its fade had not begun, because the style recalc that starts a fade waits behind
       the long tasks of the releases before it, while the row's slide does not. One more column of lead is
       one more flick of time for the fade. On a wide window the same: a column is drawn whole while it is on
       the glass anywhere over the swept span (`onGlass`) or one step short of it. */
    const onGlass = c.onGlass;
    const lit = WIDE && c.acrossT * stepX < glass + stepX;
    const op = across === 0 ? '1' : WIDE ? (lit ? '1' : '0')
      : c.acrossT <= 3 ? '.92' : '0';
    /* ---------- AND A COLUMN COMING BACK FROM NOUGHT IS DRAWN AT ONCE, NOT FADED IN ------------------------
       The `.22s` fade begins at the style pass after this write, and behind a long task that is later than
       the row's slide, which is already running: with three columns of lead, check/reach.js still read a
       column at nought on an 820 glass twice in a sweep under the heaviest load (the final run, 12 Oct). A
       column only rises from nought when it comes into the band, which is off the glass unless the band is
       late — and then the fade is exactly the thing in the way. Going down, the fade stays; the shade
       between .92 and 1 still eases. */
    const was = +host.style.opacity || 0;
    if (!instant && was <= 0.05 && +op > 0.05) colTransition_(host, null, null, { d: '0s', tf: 'linear', delay: '0s' });
    host.style.opacity = op;
    /* AND SIDEWAYS, THE SAME. This was 1 — one tab either side — so with four tabs the far one was
       hidden until the swipe reached it, and a quick flick across two showed a blank in between.
       Held to the same 3 as the column, for the same reason and at the same cost: a handful of
       tabs is a handful of cards, and there is no version of this app where that is expensive. */
    host.style.visibility = c.acrossT > 4 && !lit ? 'hidden' : 'visible';

    /* AND EACH PAGE — `placePages_`, below, which a builder placing one column alone (`placeOne_`) shares.
       SKIPPED WHOLE for a column that is neither in front nor on the glass when nothing it is placed by has
       changed (`sig`): a page turn moves ONE column, and walking the other fourteen to write every page the
       value it already holds was the most of a turn's script (docs/history/341). */
    placePages_({ id: id, host: host }, c, pg);
  });

  if (drag) {
    /* THE SUMS THIS FRAME DID, KEPT FOR THE REST OF THE DRAG — see `dragFast_`. The finger's own
       offset taken back out, so the plan is where each column RESTS. */
    DRAG_PLAN = { which: drag.which, at: AT, page: PAGE[AT] || 0, stepX: stepX,
      cols: hosts.map(h => ({ host: h.host, x: (h.i - ti) * stepX, y: h.shift - (h.id === AT ? dyPx : 0), front: h.id === AT })) };
    softDrag_(drag.which, drag.px, stepX);
    return;
  }
  softSettle_(settle ? runs(settle.axis) : SLIDE_TAP, instant);

  /* A SLIDE THE EYE CAN FOLLOW — the column in front going somewhere new — is a window in which a tap
     is not a press. See `SLIDE_UNTIL`. */
  if (before && front) {
    const now = colPlaced_(front.host);
    if (now && (Math.abs(now[0] - before[0]) > 2 || Math.abs(now[1] - before[1]) > 2)) {
      SLIDE_UNTIL = performance.now() + (settle ? settle.dur : 300);
    }
  }

  /* ---------- A FIELD ON A CARD THAT HAS LEFT IS LET GO OF -----------------------------------------
     Measured on 5 October: tap a maths answer box, so the keypad comes up, then swipe the card away —
     the keypad stayed up, typing into a box on a card that was no longer on the screen (8 of 8). The
     keypad closes on `focusout` (keypad.js) and nothing took the focus away when the page did. So
     whatever has the focus is blurred once its page is not the one in front, which closes the keypad
     and a phone's own keyboard alike. A field outside every page — the sheet — is not a card's and is
     left alone. */
  try {
    const fe = document.activeElement;
    const pg = fe && fe !== document.body && fe.closest ? fe.closest('#screen .page') : null;
    if (pg && !pg.classList.contains('on') && typeof fe.blur === 'function') fe.blur();
  } catch (e) { /* a field that keeps its focus is the behaviour before this existed */ }
}

/* ---------- EACH PAGE OF ONE COLUMN, AND ONLY WHAT CHANGED --------------------------------------------
   `h` is `{ id, host }`; `c` is what the column was placed by — `at` (its page), `across` (columns from the
   one in front), `onGlass`, `drag`, and `skip` (the column is neither in front nor on the glass).

   EVERY PLACEMENT USED TO WRITE EVERY PAGE OF EVERY COLUMN — about 88 pages, eight inline styles and four
   classes each, on every page turn — to arrive, for every column but the one that moved, at the values
   they already held. Writing a style to the value it has costs the browser nothing (measured 11 Oct: no
   change in style recalc either way); walking ninety elements and comparing in script does, and the
   window of Find's pages is wider now (41, find.js) so that walk grew. TWO SAVINGS, both exact:
     · A COLUMN whose signature — its page, its distance across, whether it is on the glass, the width
       class, how many pages it has, where Find's window starts — is what it was last time is not walked
       at all, unless it is in front or on the glass (where a page turn moves things). `paint` and
       `stuffWindow_` forget the signature, because new markup or a moved window is new pages.
     · A PAGE writes only what differs from what was last written ON IT, kept on the element (`PG`). A
       recycled window page carries its state with it, which is right: it is the element's styles that
       are being compared, not the result it stands for.
   A vertical turn then walks one column, not fifteen. A sideways turn still walks all of them, because
   `across` changes for every column. */
function placePages_(h, c, pg) {
  const id = h.id, host = h.host;
  const r = pg || pagesRead_(host, id, c);
  if (r.skipped) return;
  /* A DRAG'S WRITES ARE NOT A RESTING STATE — the blur is left to the finger — so the next placement walks. */
  host.PG_SIG = c.drag ? null : r.sig;
  r.pages.forEach((el, pos) => {
    /* WHICH PAGE THIS ELEMENT IS -- see `logIndex_`. Identical to `pos` on every screen that
       holds all of its pages, which is all of them but the Find screen. */
    const p = logIndex_(id, pos);
    const d = Math.abs(p - c.at);
    const focused = id === AT && p === c.at;
    const was = el.PG || null;
    /* OUT OF FOCUS — see the note over `SOFT_BLUR`. Not during a drag: the classes describe where
       the cards ARE, and a finger has not moved the focus until it lets go. */
    /* AND ON A WIDE WINDOW, EVERY CARD ON THE GLASS BUT ONE. It was left sharp there and dimmed a
       little instead, on the reasoning that whole screens side by side are there to be read. The
       owner, 6 Oct: *"what happened to widgets not in focus should have the not in focus effect."*
       The blur is how this app says which card is in front, on every window; a card beside it is
       a press away (`wideHit_`) and sharpens when it arrives. Which cards: every column on the
       glass (`onGlass`) and, down each, the three either side that a tall window draws. */
    let soft = was ? was.soft : false, dim = was ? was.dim : null;
    if (!c.drag) {
      soft = !focused && (WIDE ? (c.across === 0 || c.onGlass) && d <= 3 : c.across <= 1 && d <= 2);
      if (soft) dim = softDim_(el);
    }
    /* ---------- DRAWN WHILE ITS BOX MEETS THE BAND, AND ONLY THEN ---------------------------------------
       IT WAS AN INDEX: `.far` past three pages from the target and opacity 0 past `glassRows_`. Three was
       bought on 6 Oct for "a fast swipe never shows an empty rectangle", and it was three from where the
       column was GOING — the cards the slide carried across the glass on its way there were the ones it
       hid (see the band, in `placeGrid`). Now a page is drawn exactly while its box meets the swept glass
       widened by a glass height either side, and hidden (`.far`, opacity 0) otherwise; a page more than
       twelve from the target is not even measured. `.far` stays a class (`check-css.js` holds it to one).
       ITS SHADE IS STILL BY ITS DISTANCE FROM THE CARD IN FRONT — 1, .9, .75 on a phone, whole on a wide
       window — because the shade says "behind", and a card carried past is behind the one arriving. */
    const box = r.boxes[pos];
    const inBand = !!box && box[0] < c.hi && box[0] + box[1] > c.lo;
    /* DIMMING ON A BLACK SCREEN IS DELETING.
       This was .5 and .25, which reads as "further away" on paper and is not what happens here:
       the card's fill is #101010 on black, so half of it is rgb(8) and a quarter is rgb(4) —
       two and one shades off pure black, invisible on a phone in any light. The card either side
       was being drawn and could not be seen, which is indistinguishable from it not being there.
       Barely dimmed instead. What says a card is behind rather than beside is its POSITION and
       its edge, both of which are already doing the work. */
    /* A TALL WIDE WINDOW SHOWS A FOURTH CARD DOWN, so there nothing near is faded to nothing —
       it would be a hole in a column you can otherwise read. The focus is said by `.soft` above. */
    pageWrite_(el, {
      on: focused,
      far: !inBand,
      soft: soft, dim: dim,
      op: !inBand ? '0' : WIDE ? '1' : d === 0 ? '1' : d === 1 ? '.9' : '.75',
      /* ---------- THE CARD IN FRONT, NOT EVERY COLUMN'S CURRENT CARD -----------------------------
         THIS WAS `d === 0`, which is every column's current page, and the column's own `none` above
         did not stop it: `pointer-events` is inherited, so an explicit `auto` on a child takes the
         press back from a parent that refused it. On a phone that was a 23px sliver nobody aimed at.
         On a wide window it is three or five whole cards — and measured at 1280 with Find in front,
         a mouse press on the Sign in button of the You card beside it ran `do-signin` AND brought You
         forward: the "presses a card that is about to slide under the pointer" that the note over
         `wideHit_` says cannot happen. With only the focused page taking presses, a press over a
         neighbour falls through to `#screen`, where `wideHit_` brings it forward and does nothing
         else, which is what that note promised. */
      vis: inBand ? 'visible' : 'hidden',
    });
    /* A pane used to be measured here, to decide whether it had overflowed and should therefore
       get the vertical gesture back for scrolling. It cannot overflow any more — a card clips
       rather than scrolls — so every vertical drag is the grid's, on every card, everywhere on
       it. Nothing to measure and nothing to decide. */
  });
}
/* THE READING HALF, done in `placeGrid`'s reading pass so no offset is asked after a write: the pages, the
   column's signature and, unless the signature lets the column be skipped, each near page's box in
   column coordinates. ONLY THE PAGES WITHIN TWELVE OF THE TARGET ARE MEASURED: the band is capped at eight
   glass heights behind (`TRAIL_CAP`), and twelve pages is more than that on any glass this app is drawn
   on, so what lies further is hidden without a layout read. */
const PAGE_READ = 12;
function pagesRead_(host, id, c) {
  const pages = host.querySelectorAll(':scope > .page');
  const sig = [c.at, Math.round(c.lo), Math.round(c.hi), c.across, c.onGlass ? 1 : 0, WIDE ? 1 : 0,
    pages.length, PAGE_LO[id] || 0].join('|');
  if (c.skip && host.PG_SIG === sig) return { skipped: true };
  const boxes = [];
  for (let pos = 0; pos < pages.length; pos++) {
    const p = logIndex_(id, pos);
    boxes.push(Math.abs(p - c.at) > PAGE_READ ? null : [pages[pos].offsetTop, pages[pos].offsetHeight]);
  }
  return { pages: pages, sig: sig, boxes: boxes };
}

/* ---------- THE TRAIL, DOWN ONE COLUMN ------------------------------------------------------------------
   `top` and `bot` are column coordinates (the same as a page's `offsetTop`) of the union of the windows the
   column's glass has been aimed at in the current chain of slides; `until` is when this column's last
   slide ends. A placement that is not a finger's adds its target to the union while the last slide still
   runs; otherwise the union starts again from the window the column is LEAVING (where the last placement
   put it, read off the inline value, which is no layout) and the window it is going to. An instant
   placement leaves from nowhere — nothing is carried — and a drag reads the trail without writing it.
   CAPPED AT EIGHT GLASS HEIGHTS BEHIND THE TARGET: the measured lag of a run of flicks is two to eight
   pages, and a thirty-flick run must not keep its whole history drawn (docs/history/341). */
const TRAIL_CAP = 8;
function trailY_(host, shift, glassH, now, drag, instant, dur) {
  const tTop = -shift, tBot = -shift + glassH;
  const T = host.TRAIL;
  const run = !!(T && (now < T.until || (!drag && !instant && slideRunning_(host, colProp_('y')))));
  let top = tTop, bot = tBot;
  if (run) { top = Math.min(top, T.top); bot = Math.max(bot, T.bot); }
  else if (!drag && !instant) {
    const was = colPlaced_(host);
    if (was) { top = Math.min(top, -was[1]); bot = Math.max(bot, -was[1] + glassH); }
  }
  top = Math.max(top, tTop - TRAIL_CAP * glassH);
  bot = Math.min(bot, tBot + TRAIL_CAP * glassH);
  const band = { top: top, bot: bot, until: drag || instant ? (run ? T.until : 0) : now + dur + 50 };
  if (!drag) host.TRAIL = band;
  if (!drag && !instant) trailFrom_(band, dur);
  return band;
}
/* ---------- A SLIDE ENDS `dur` AFTER THE FRAME IT STARTS IN, NOT AFTER THE WRITE THAT ASKED FOR IT -----------
   The transform is written now and the transition starts at the next style pass — which, behind a long
   task, is up to a second later on a 2019 iPad's main thread. Timed from the write, the trail ran out while
   the slide had not even begun: the next flick started a new union from the last TARGET, the pages between
   it and where the column really was went hidden, and check/reach.js read a hole ten pages behind the card
   in front on the Feed at 820, and columns at nought in a sweep (the final run, 12 Oct). So the end is
   moved to the frame: an animation-frame callback runs at the start of the frame whose style pass starts
   the transition. Only ever later, never earlier. */
function trailFrom_(band, dur) {
  try { requestAnimationFrame(() => { band.until = Math.max(band.until, performance.now() + dur + 50); }); } catch (e) {}
}
/* ---------- AND A SLIDE STILL RUNNING IS STILL A SLIDE, WHATEVER THE CLOCK SAYS ------------------------------
   Timed from its frame, a slide can still outlast `dur`: another write re-aims it from where it is drawn
   (`holdColumn_`, a window moved, the next release), and under the heaviest load check/reach.js caught the
   Feed at 820 drawn 6,000px short of its target with the trail 173ms past its end — so the next flick began
   a new union at the last TARGET and every page between it and the column as drawn went hidden. The
   browser knows whether the transition is still running; asked in the reading pass, where the style is
   already clean, it costs no recalc. */
function slideRunning_(host, prop) {
  try {
    return !!(host && host.getAnimations && host.getAnimations().some(a => a.playState === 'running'
      && (prop ? a.transitionProperty === prop : a.transitionProperty === 'transform' || a.transitionProperty === 'translate')));
  } catch (e) { return false; }
}
/* AND ACROSS THE ROW: the column indices the row has swept while its sideways slide still runs, the index
   it is leaving and the one it is going to. `at` is the index this placement was for. */
let TRAIL_X = { lo: 0, hi: 0, at: null, until: 0 };
function trailX_(ti, now, instant, settle) {
  const T = TRAIL_X;
  const run = now < T.until || (!instant && T.at != null && slideRunning_($('s-' + ((TABS[T.at] || {}).id)), colProp_('x')));
  let lo = ti, hi = ti;
  if (run) { lo = Math.min(lo, T.lo); hi = Math.max(hi, T.hi); }
  else if (!instant && T.at != null) { lo = Math.min(lo, T.at); hi = Math.max(hi, T.at); }
  const moved = T.at !== ti;
  const dur = settle && settle.axis === 'x' ? settle.dur : 300;
  const out = { lo: lo, hi: hi, at: ti,
    until: instant ? (run ? T.until : 0) : moved || run ? now + dur + 50 : T.until };
  if (!instant && (moved || run)) trailFrom_(out, dur);
  return out;
}
/* ONCE THE SLIDES HAVE ENDED, THE BAND GOES BACK TO THE GLASS. Booked by any placement that left a column
   wider than its glass (`afterSlide_`, which waits out the settle and a finger), and asked again until
   every column's own slide has ended — a tap's slide is not a settle. One instant placement does the
   collapse: the trails have run out, so it draws each column's glass and a glass either side and nothing
   more, and only the columns whose band changed are walked (`placePages_`). Until then the pages a run
   kept cost compositing only. */
function trailEnd_() {
  const now = performance.now();
  let until = TRAIL_X.until;
  TABS.forEach(t => { const h = $('s-' + t.id); if (h && h.TRAIL) until = Math.max(until, h.TRAIL.until); });
  if (until > now) { setTimeout(() => afterSlide_(trailEnd_, 'trail'), Math.ceil(until - now)); return; }
  /* NOR WHILE A SLIDE IS STILL RUNNING past its clock (`slideRunning_`, above). */
  if (TABS.some(t => slideRunning_($('s-' + t.id)))) { setTimeout(() => afterSlide_(trailEnd_, 'trail'), 100); return; }
  const wide = TRAIL_X.lo < TRAIL_X.hi || TABS.some(t => {
    const h = $('s-' + t.id);
    const was = h && h.TRAIL && colPlaced_(h);
    return !!(was && (h.TRAIL.top < -was[1] - 1 || h.TRAIL.bot > -was[1] + (h.clientHeight || innerHeight) + 1));
  });
  if (wide) placeCells('y', true);
}
/* ONE PAGE'S WRITES, EACH ONLY IF IT DIFFERS FROM WHAT THIS ELEMENT WAS LAST GIVEN. `position` and
   `transform` are the same for every page for ever (the column does the moving), so they are written
   once, the first time an element is placed. */
function pageWrite_(el, st) {
  const was = el.PG;
  if (!was) { el.style.position = 'static'; el.style.transform = 'none'; }
  if (!was || was.on !== st.on) {
    el.classList.toggle('on', st.on);
    el.style.pointerEvents = st.on ? 'auto' : 'none';
  }
  if (!was || was.far !== st.far) el.classList.toggle('far', st.far);
  if (!was || was.soft !== st.soft) el.classList.toggle('soft', st.soft);
  if (st.soft && (!was || was.dim !== st.dim)) el.classList.toggle('soft-dim', !!st.dim);
  if (!was || was.op !== st.op) el.style.opacity = st.op;
  if (!was || was.vis !== st.vis) el.style.visibility = st.vis;
  el.PG = st;
}

/* ---------- ONE COLUMN PLACED ON ITS OWN, WITH NOTHING MOVING ------------------------------------------
   FOR THE BUILDER (`ahead_`, below `afterSlide_`), which paints a column nobody is looking at in a quiet
   moment and must leave it where the next arrival expects it: centred on its page in front, its pages
   given their states, the layout that costs paid now rather than in the frame a release begins. A full
   placement would do the same for every column and run `widgetsGlass_` and the sweeps behind it; this
   is the one host's writes, its `columnShift_` read and its page loop, with no transition — the builder
   runs only when nothing is sliding. A column that is in front or on the glass is the full placement's,
   because what is on the glass is said there (`GLASS`) and only there. */
function placeOne_(id) {
  const host = $('s-' + id);
  if (!host || !PLACED_ONCE || !host.style.transform) return;
  if (id === AT || GLASS.cols.indexOf(id) !== -1) { placeCells('y', true, 0, id); return; }
  const tabs = TABS.map(t => t.id);
  const ti = Math.max(0, tabs.indexOf(AT)), i = tabs.indexOf(id);
  if (i < 0) return;
  const stepX = stepX_();
  const at = PAGE[id] || 0;
  const shift = columnShift_(host, domIndex_(id, at));
  const across = Math.abs(i - ti);
  const onGlass = WIDE && Math.abs((i - ti) * stepX) < appWidth_() / 2 + stepX * 1.5;
  const glassH = host.clientHeight || innerHeight;
  /* NOTHING IS SLIDING (the builder's own gate), so the band is this column's glass and one either side. */
  const band = trailY_(host, shift, glassH, performance.now(), false, true, 0);
  const c = { at: at, across: across, acrossT: across, onGlass: onGlass, drag: false, skip: false,
    lo: band.top - glassH, hi: band.bot + glassH };
  const pg = pagesRead_(host, id, c);
  colTransition_(host, SLIDE_NONE, SLIDE_NONE, null);
  colWrite_(host, (i - ti) * stepX, shift);
  host.PLACED_P = at;
  placePages_({ id: id, host: host }, c, pg);
}

/* ==================================================================================================
   ONE PLACEMENT PER FRAME, AND ANIMATION WINS

   THE BUG THIS EXISTS TO MAKE UNWRITEABLE. `go` started a sideways slide with `placeCells('x')`,
   and twenty lines later `paintPager(AT, true)` placed the grid again — and `true` means INSTANT,
   which writes `transition: none` onto every cell. So the slide was cancelled a millisecond after
   it began and the grid jumped to the new tab instead of moving there. Both calls were correct on
   their own. Nothing anywhere could see that together they were wrong.

   That is the shape of nearly everything that has gone wrong on this screen: not a wrong call, but
   two right ones in the same turn, disagreeing. So placing stops being something anybody DOES and
   becomes something anybody may ASK FOR.

   THE RULES, and they are the whole of it:
     · asking twice in one turn places once
     · if ANY asker wants it animated, it animates — an instant placement can cancel an animation,
       and an animation can never damage an instant one, so animation is the safe side to lose to
     · a drag places THIS INSTANT, because it is following a thumb and a frame of delay is a frame
       of lag; and it never batches, because there is nothing to batch with

   What this deletes is the need to know, at every call site, whether anybody else is about to
   place the grid. Nobody can know that. Now nobody has to.
================================================================================================== */
let PLACE_WANT = null;      // { which, instant, id } — what has been asked for this turn
let PLACED_ONCE = false;    // the very first placement runs now, not next frame
let PLACE_FRAME = 0;

function placeCells(which, instant, dragPx, id) {
  /* A DRAG IS NOT A REQUEST. It is already once-per-frame — `pointermove` books its own frame —
     and it must land now rather than next frame. Straight through. */
  if (dragPx) return placeNow_(which, instant, dragPx, id);

  /* THE FIRST ONE IS NOT DEFERRED. Until the grid has been placed once, every cell is sitting at
     the same spot with no transform on it — so a frame's delay is a frame of the whole app stacked
     on top of itself, which is a flash on boot and on every screen drawn for the first time.
     After that there is always a previous position to hold, and a frame is invisible. */
  if (!PLACED_ONCE) { PLACED_ONCE = true; return placeNow_(which, instant, 0, id); }

  if (!PLACE_WANT) {
    PLACE_WANT = { which, instant: !!instant, id };
  } else {
    /* ANIMATION WINS. One asker wanting a slide and another wanting it instant is the exact
       collision above, and the slide is the one that must survive. */
    PLACE_WANT.instant = PLACE_WANT.instant && !!instant;
    if (which) PLACE_WANT.which = which;
    if (id !== undefined) PLACE_WANT.id = id;
  }

  if (PLACE_FRAME) return;
  PLACE_FRAME = requestAnimationFrame(() => {
    PLACE_FRAME = 0;
    const w = PLACE_WANT;
    PLACE_WANT = null;
    if (w) placeNow_(w.which, w.instant, 0, w.id);
  });
}

/* THE PLACEMENT ITSELF. Everything that used to be `placeCells` — nothing about it changed except
   that it is no longer what the rest of the app calls. */
function placeNow_(which, instant, dragPx, id) {
  placeGrid(instant, dragPx ? { which, px: dragPx } : null);

  /* `bookDropMove_` WAS CALLED HERE, before the drag guard below, for the one thing this app ever
     placed against the viewport rather than the grid: `#drop`, the dropdown panel outside the
     screens, which did not travel with a column sliding under it and had to be moved by hand on every
     placement. The panel went on 9 October — every dropdown is the platform's own again and every
     several-of-a-list question is checkboxes in its card (note 315) — so nothing here is placed by
     anything but the grid. */

  /* THE TWO SWEEPS BELOW DO NOT RUN WHILE A FINGER IS DOWN.

     Both answer questions about what EXISTS — which panes to watch, which screens no tab points at
     — and nothing is created or destroyed during a drag. They were running on every frame anyway:
     a full disconnect and re-observe of every pane in the document, and a second query over every
     screen, sixty times a second, to arrive at the same answer each time.

     That is most of what made a sideways swipe feel heavy, and none of it was doing anything. They
     run when the drag ends, which is when the answer can have changed. */
  if (dragPx) return;

  /* ---------- AND WHAT RUNS IN THE CARDS THIS LEFT ON THE GLASS ------------------------------------
     A third sweep with the same reason to wait for the release: a widget on the glass is started and
     one that has left it is stopped (`widgetsGlass_`, arcade.js, from `GLASS` above), and a finger
     dragging a column across is neither — it may yet let go where it began. Starting is only ever
     QUEUED from here, one per task behind the settle, and stopping is booked for after the slide, so
     this placement's frame pays for a walk of a short list and nothing else. */
  if (typeof widgetsGlass_ === 'function') widgetsGlass_();

  /* ---------- AND WHICH CARDS ARE TOO TALL FOR THE PANE THEY ARE IN ------------------------------
     `paneReach_` GIVES AN OVERFLOWING PANE `overflow-y: auto` so `scrollHost_` can scroll it from
     the app's own drag and hand over to the grid at its end. It was called from `fillStuffPages`
     and from nowhere else, and the note over `PANE_REACH` said why: *"ON THE FUNNEL'S PANES AND
     NOWHERE ELSE — `check/ui.js`'s OUT OF REACH rule reports nothing on the other nine
     columns."*

     THAT SENTENCE WAS TRUE OF A PHONE THAT DOES NOT EXIST. `check/ui.js` gave every width an
     844px-tall viewport, so its "320px phone" was a 320x844 device and its pane was 807px against a
     real iPhone SE's 534. Paired with real device heights the same rule names **twenty-one** panes
     on nine columns at 320x568 — the camera after a photograph 191px, the Scrabble board 161px,
     a waiting list 105px, your own account 95px — every one of them content that can be neither
     scrolled to nor paged to. One instrument fix, and the narrowness that comment claimed was an
     artefact of the instrument.

     HERE RATHER THAN IN `startScreen_`, because a card that GROWS after its screen was drawn is
     half the finding: taking a photograph adds 167px of controls, and the camera's answer is
     `placeCells('y', true, 0, 'feed')` — which arrives here. Every grower in the app already
     calls this, so there is one hook rather than one per card.

     THE SCREEN YOU ARE ON, not every pane in the document: about a dozen against a hundred, and a
     column you cannot see has its turn the moment you arrive at it. Below the drag guard with the
     other two sweeps, for their reason — nothing changes height while a finger is down, and this
     is a read of every pane's `scrollHeight`.

     AND `paneWatch_` RATHER THAN `paneReach_` BECAUSE ONCE PER PLACEMENT IS NOT ENOUGH. Four of the
     columns grow a card after the placement that measured it — a widget drawing into its canvas, a
     photograph adding its controls, `drawBooker()` replacing the card outright — so the measuring
     is also booked on a `ResizeObserver` over the cards themselves. See its note in find.js. */
  if (typeof paneWatch_ === 'function') paneWatch_($('s-' + AT));
  /* THE NEXT PICTURES OF THE COLUMN IN FRONT, asked for six pages ahead — see `picsAhead_` in posts.js. It was
     the Feed's alone (`postsAhead_`), one behind and two ahead; docs/history/341 measured that a late picture
     was nearly always one asked for late. */
  if (typeof picsAhead_ === 'function') picsAhead_(AT);

  /* ANY SCREEN NO TAB POINTS AT. index.html lists eight sections and the tab table decides which of
     them exist, so removing a tab leaves a section behind that nothing places. */
  const mine = TABS.map(t => $('s-' + t.id));
  document.querySelectorAll('#screen > .screen').forEach(el => {
    if (mine.indexOf(el) === -1) {
      el.style.display = 'none';
      el.classList.add('hidden');
    }
  });
}

/* ---------- WIDGETS AS PAGES --------------------------------------------------------------------
   Tools and Arcade hold four things each, and a column of four cards means the fourth is a
   scroll away from being remembered. One at a time, full height, swipe up for the next — the
   same gesture as the tab bar turned ninety degrees, so there is one thing to learn rather than
   two.

   THE HARD PART IS THE SAME ONE AS THE TAB SWIPE: not breaking scrolling. "Swipe up" and "scroll
   down" are the same movement of the same thumb, and a page that guesses wrong takes away the
   thing people do a thousand times more often. So the rule is a hierarchy rather than a choice:

     the page scrolls if it has anywhere to scroll to
     only at its top or its bottom does the gesture belong to the pager

   Which means a short widget — the calculator, the timer, the board — pages immediately, and a
   long one — a docket with twenty lines, a notepad full of text — reads to the end first. Nobody
   has to know the rule; it is what already happens in every reader anybody has used.

   The names are here rather than in the markup so the header can say which widget you are on
   without the screen having to tell it.
--------------------------------------------------------------------------------------------- */
const PAGER = {
  /* POSTS ARE HOWEVER MANY THERE ARE, so this is a function rather than a list. Everything else
     about them is the same: one to a screen, swipe up for the next.
     They have no names to put in the header, so the position goes there instead. That is the
     thing the dots used to say and the only part of it worth keeping — on a feed, "4 of 12" is
     genuinely useful, where on five named tools it was saying nothing the title did not. */
  /* EVERY SCREEN IS PAGED. Nothing scrolls anywhere: a screen is a screen, and getting from one
     thing to the next is the same movement on both axes on all eight tabs. There is no longer such
     a thing as a screen you have to learn separately.
     The name shown in the header, or an empty string to leave the tab's own title alone — a
     single-page screen has no "1 of 1" worth saying.
     Each count comes from the same function that renders the pages, so the header and the screen
     cannot disagree about how many there are. */
  /* ---------- THESE KEYS ARE SCREEN IDS, AND TWO OF THEM NAMED SCREENS THAT DO NOT EXIST ----------
     IT WAS `me:` AND `posts:`. The screens are registered as `account` (find.js:2149) and `feed`
     (posts.js:800) — renamed when the columns were folded in, and this table was not renamed with
     them.

     NOTHING THREW, WHICH IS WHY IT LASTED. `paint` does `classList.toggle('paged', !!PAGER[id])`,
     and `PAGER['account']` is simply undefined — so the class never went on, and a screen without
     it does not page. `paintPager` returns early on the same lookup, and so does every other reader
     at the bottom of this file.

     WHAT THAT LOOKED LIKE: moving up and down did nothing on the feed and on You. Not an error, not
     a jump, not a flicker — the swipe was received and there was nothing registered to move. Two of
     the nine screens silently lost an axis, and the one that kept it (`stuff`) is the one whose key
     happened not to be renamed.

     THE KEYS MUST MATCH `screen(id, …)` EXACTLY. `check-doors.js` now fails the build when one does
     not, which is the only way this stays fixed. */
  /* ---------- THE PAGER COUNTED A LIST THE SCREEN DOES NOT DRAW ----------------------------------
     IT CALLED `mePages()`. That function fed the old You COLUMN, and its own comment in me.js says
     so — "mePages fed the You column, which no longer exists". `screen('account')` draws
     `accountPages_()` plus `termsPages_()`. So the number of pages the pager believed in and the
     number of pages on screen were worked out by two different functions that had not agreed since
     the column was folded into the funnel.

     WHAT IT LOOKED LIKE: you could not move down the profile column. Not an error — the pager
     reported one page, so there was nowhere to go, while the pages sat underneath waiting. Adding
     other people's profiles beneath your own made it obvious, because suddenly there was something
     to miss.

     COUNTED FROM THE FUNCTIONS THAT DRAW IT, which is the rule this table already states for
     `stuff` twenty lines down: "a pager that counts for itself is a pager that can disagree". */
  account: () => {
    const n = (typeof accountPages_ === 'function' ? accountPages_().length : 0)
            + (typeof termsPages_ === 'function' ? termsPages_().length : 0);
    return Array.from({ length: n }, (_, i) => (n > 1 ? (i + 1) + ' of ' + n : ''));
  },
  /* `book` WAS HERE — a pager for a column that no longer exists. Find has its own count. */

  /* Empty names, one per post. The pager needs the COUNT — that is what it pages through — and
     a post has no name worth putting in a header: "1 of 10" is a fact about the list rather than
     about the photograph, and it changed on every swipe where a title should hold still.
     Empty falls through to the tab's own title, so no special case is needed anywhere. */
  /* One name per page, and the ＋ card is a page — so it is counted here too, or the pager stops
     one short and the last post can never be reached. The count and the render come from the same
     two facts on purpose: a pager that disagrees with its own screen is a post that exists and
     cannot be swiped to. */
  /* The ＋ card is a page and everybody signed in has one, so everybody's count includes it. This
     said `isAdmin()`, which was right while only an admin had the card — and would now stop the
     pager one short for everybody else, which is a post that exists and cannot be swiped to. */
  /* ---------- THE FEED IS FOUR KINDS OF PAGE NOW, NOT TWO ------------------------------------------
     SPOTLIGHT AND THE FESTIVE CARDS JOINED IT and this counted neither, so the pager ran short by
     however many of them there were — and `paintPager` clamps to the names it is given, which makes
     the tail of the feed unreachable from the header. Exactly the fault the Find pager had when
     saved things became pages: a count kept by hand beside a list built somewhere else.

     Each group asks the function that DRAWS it. `spotPages` and `DATA.festive` are what `posts.js`
     splices in, so the two cannot disagree. */
  /* GUARDED, because shell.js is file five and collections.js is file twenty-one. Both of these run
     long after the load — but `paintPager` fires on the app's first frame, and a `ReferenceError`
     there takes the whole boot with it. The same guard `posts.js` uses. */
  /* ---------- TOOLS AND GAMES PAGE NOW, SO THEY NEED NAMING ----------------------------------------
     Both screens used `stack` — one page holding everything — and about sixty per cent of each was
     unreachable, because `.pane` is `overflow-y: hidden` and one page means nothing to page to
     either. They use `pages` now, and a paged screen without an entry here gets no `paged` class
     and no axis: the pages exist and nothing reaches them, which is the fault the feed and You
     spent months in.

     THE NAME IS THE WIDGET'S OWN, so the header reads "Chess" rather than "3 of 5". On a feed of
     photographs a position is the only thing worth saying; on five named games the name is.

     GUARDED, for the reason the `feed` entry below is: shell.js is file five and arcade.js is file
     nineteen. `paintPager` fires on the app's first frame and a ReferenceError there takes the
     boot with it. `widgetsOf_` is also what `widgetColumn_` renders from, so the count and the
     screen cannot disagree. */
  tools:  () => (typeof widgetsOf_ === 'function' ? widgetsOf_('tool') : []).map(w => w.name || ''),
  games:  () => (typeof widgetsOf_ === 'function' ? widgetsOf_('game') : []).map(w => w.name || ''),
  /* THE SAME LIST THE COLUMN IS BUILT FROM, which is the rule every other entry here follows: a
     pager that counts for itself is a pager that can disagree with its own screen, and that
     disagreement is what made the You column unmovable. `savedCards_` answers with one card when
     there is nothing kept, so this is never nought over a page that exists. */
  saved:  () => (typeof savedCards_ === 'function' ? savedCards_().length : 1),
  /* NEVER 0, because the column always draws SOMETHING — the sentence saying nothing is spotlit is
     a page, and a count of nothing over a page that exists is a column you cannot be on. Same
     reason `reelPages_` answers one when there are no clips. */
  spotlight: () => (typeof spotlightCards_ === 'function' ? spotlightCards_().length : 1),
  /* AND THE SAME AGAIN FOR SETTINGS. `settingsPages_` is the list `screen('settings')` draws, so
     there is one answer to how many pages there are. It is never nought: signed out it returns the
     one card that says to sign in, which is a page somebody has to be able to be on. */
  settings: () => (typeof settingsPages_ === 'function' ? settingsPages_().length : 1),
  /* THE SHOP, COUNTED FROM `shopCards_`, the list `screen('shop')` draws. Never nought: the basket
     is always page 0, and with nothing for sale the shop says so in a page of its own. */
  shop: () => (typeof shopCards_ === 'function' ? shopCards_().length : 1),
  /* PROGRESS, COUNTED FROM `progressCards_`, the list `screen('progress')` draws. One card today —
     the placeholder — and counted anyway rather than written as 1: the day it is built it will be
     a page per something, and a count kept here by hand is the fault every entry above records. */
  progress: () => (typeof progressCards_ === 'function' ? progressCards_().length : 1),
  /* THE BUSINESS RECORDS, COUNTED FROM `bizPages_`, the list `screen('biz')` draws — five cards for an
     admin. Nought for anybody else, and that is not the "column you cannot be on" the entries above
     guard against: for anybody else there is no column (`columnsFor_`), so nothing asks. */
  biz: () => (typeof bizPages_ === 'function' ? bizPages_().length : 0),

  /* ---------- AND `booking` HAD NO ENTRY AT ALL, WHICH IS THE FAULT THE NOTE ABOVE DESCRIBES ------
     `screen('booking')` USES `pages()` AND THERE WAS NO KEY HERE. The paragraph over `tools` says
     what that costs, in the words of the two columns it already happened to: *"a paged screen
     without an entry here gets no `paged` class and no axis: the pages exist and nothing reaches
     them."* The booking form is page 0 and every session receipt is a page after it — so none of
     them could be swiped to, and the column looked like one card that sometimes changed.

     FOUND BY TRYING TO TURN TO ONE. `goPage` opens with `if (!PAGER[id]) return;`, so sending
     somebody from the week planner to a session's page returned silently and left them on the form.
     The pieces were all correct and the pager had never heard of the screen.

     THE COUNT COMES FROM THE BUILDER, one call, because "a pager that counts for itself is a pager
     that can disagree" — which is the rule the `stuff` entry below follows and the fault
     `check-flow`'s pager journey exists for. The NAMES are derived from the same list the pages are
     built from, so page n and name n cannot drift.

     A SESSION IS NAMED FOR WHAT IT IS, not "3 of 7". On a column of receipts the subject and the day
     are what somebody is looking for; the position is not a fact about the session. Same judgement
     as `tools` naming the widget above. */
  booking: () => {
    if (typeof bookingPages_ !== 'function') return [];
    let n = 0;
    try { n = bookingPages_({ column: true }).length; } catch (e) { return []; }
    if (!n) return [];
    const jobs = typeof myJobsOrdered_ === 'function' ? myJobsOrdered_() : [];
    return Array.from({ length: n }, (_, i) => {
      if (i === 0) return typeof USER !== 'undefined' && USER ? 'Book' : 'Sign in';
      const j = jobs[i - 1];
      /* PAST THE SESSIONS IS THE BASKET — `bookingPages_` appends it in column mode only. Derived
         from running off the end of the job list rather than from a second count of it. */
      if (!j) return 'Basket';
      return [j.subject, j.weekday].filter(Boolean).join(' \u00b7 ') || 'Session';
    });
  },

  /* `.concat(USER ? [''] : [])` WAS HERE, COUNTING THE ＋ CARD. That card is gone from the feed —
     it was drawn there AND as the column to its left, one swipe apart, which is the duplicate you
     could see. Counting a page that is no longer built pages once past the end onto nothing. */
  /* ---------- AND `spotPages()` WENT FROM HERE, BECAUSE THE FEED STOPPED DRAWING IT ------------
     IT COUNTED A GROUP `postsBlocks` HAS NOT BUILT SINCE SPOTLIGHT LEFT THE FEED — the fault the
     note directly above records about the ＋ card, on the very next line, unfixed. Invisible for as
     long as it has existed only because `spotPages()` was measurably always empty: `doGet` sent no
     `DATA.spotlight` and there was no handler to write one. It becomes a real over-count the moment
     anything is spotlit, which is a page number at the end of the feed with nothing on it. */
  /* COUNTED FROM `feedColumn_`, the list `screen('feed')` draws, which now holds the camera as
     well — one page directly above the newest post. The same rule every entry here states: a pager
     that counts for itself is a pager that can disagree with its own screen. */
  feed:   () => (typeof feedColumn_ === 'function' ? [].concat(feedColumn_()) : ['']).map(() => ''),
  /* ---------- THE REELS COLUMN HAD NO ENTRY HERE, AND THAT IS WHY IT MOVED DIFFERENTLY -----------
     IT WAS THE ONE COLUMN THE DIAL DID NOTHING ON. `paint` does `classList.toggle('paged',
     !!PAGER[id])` and `PAGER.reel` was undefined, so the class never went on and the vertical axis
     was never registered — exactly the silent loss the note above records for `me` and `posts`.
     What moved instead was a scroller inside the card, with its own snap and its own momentum, and
     the pane's `touch-action: none` switched off so the browser could have the gesture. One widget
     per reel makes it an ordinary column, and an ordinary column is counted here.

     `reelPages_` IS THE SAME COUNTER THE SCREEN BUILDS FROM, which is the rule every other entry in
     this table follows: a pager that counts for itself is a pager that can disagree with the screen
     it is a pager for. */
  reel:   () => (typeof reelPages_ === 'function' ? reelPages_() : ['']),
  /* ---------- AND MESSAGES WAS THE SIXTH COLUMN TO LOSE ITS AXIS THIS WAY -------------------------
     `screen('dm')` USED `stack()` AND THERE WAS NO KEY HERE, which is the pair of facts the note
     over `tools` says costs a column: no `paged` class, no vertical axis, and a `.pane` that is
     `overflow: hidden` holding every conversation in one box. **Measured at 390×844 with six
     conversations: 1,298px of content inside an 805px pane — 493px of somebody's messages on the
     page with no scroll and no page to turn to.**

     `me` and `posts` lost it to a rename, `booking` and `reel` to having no key at all, `tools` and
     `games` to `stack`. This is the same fault as the last two, and the reason it keeps recurring is
     that nothing MEASURES the axis — `check/ui.js` has always asked whether a box scrolls sideways
     and never whether one hides content below its own fold. It asks both now.

     COUNTED FROM `dmPages_`, the one list `screen('dm')` maps its markup from, so page n and name n
     are the same n. */
  dm:     () => (typeof dmPages_ === 'function' ? dmPages_().map(p => p.name) : ['']),
  /* THE CAMERA, WHICH IS ONE PAGE AND IS COUNTED ANYWAY. `check-doors.js` asks whether every screen
     built with `pages()` has an entry here, and this was the one that did not — right today because
     the list holds one card, and the accident that `booking`, `reel` and `dm` each turned into a
     column you could not move on. Empty names: a single-page screen has no "1 of 1" worth saying,
     which is what the head of this table already says about them. */
  /* `make:` WAS HERE, counting the camera column's one card. The camera is a page of the feed
     now and `PAGER.feed` counts it — see the note there. */
  /* The controls, then the results. Named so the header says which page of how many — on a list
     you are working through, that is the one thing a title cannot tell you and the number is
     worth having. */
  /* ---------- THE FIND PAGER COUNTS EVERY PAGE, NOT JUST THE RESULTS -------------------------------
     IT NAMED TWO KINDS OF PAGE and there are four: the things you saved sit in front of the search,
     and the booking form sits between the search and the results. Named as "Search" plus N results,
     the pager ran short of the pages actually there — and `paintPager` clamps to the names it is
     given, so the tail of the list became unreachable by the header even though the pages existed.

     Each group asks the function that DRAWS it how many there are, which is the same rule the rest
     of this table follows: a pager that counts for itself is a pager that can disagree. */
  /* A COUNT RATHER THAN A LIST OF NAMES, and it is the only entry that needs to be. The names were
     read by the header, there is no header, and building `(i + 1) + ' of ' + n` five thousand times
     to be counted was real work on the path every tap goes down. `pageCount` takes either.
     NO `Basket` HERE ANY MORE — it is on the Booking column now, and this count has to match what
     `screen('stuff')` actually builds or the pager and the screen disagree. */
  /* ---------- THE SAME GROUPS `screen('stuff')` BUILDS FROM, WHICH IS THIS TABLE'S OWN RULE ------
     IT COUNTED `bookingPages_()` WHERE THE SCREEN DRAWS `frontPages_()`, and `frontPages_` is
     `bookingPages_` CONCAT `feedPages_` — so every saved-feed page was a page this dial did not
     know about. It also did not count `spotPages()`, which the screen had at the front until that
     list became a column of its own. Two undercounts, both meaning the tail of the column cannot be
     reached, and both invisible because the two groups are empty on the fixture.
     `frontPages_` is asked rather than its halves added up, for the reason every other entry here
     gives: a pager that counts for itself is a pager that can disagree with its own screen. */
  stuff:  () => finderPageCount_('stuff'),
  /* THE SECOND FINDER, counted by the same engine in its own binding (`finderPageCount_` in find.js)
     — the question, then its results; it has no pages in front of the question. */
  res:    () => finderPageCount_('res'),
};

/** The page names for a screen, whether they are a list or worked out each time. */
function pagerNames(id) {
  const v = PAGER[id];
  return typeof v === 'function' ? v() : (v || []);
}

/* Which page each paged screen is showing. Kept per screen, so leaving Tools on the calendar and
   coming back puts you on the calendar — a pager that resets is a pager you have to re-navigate
   every time you check something on another tab. */
/* ---------- WHERE EACH COLUMN OPENS ---------------------------------------------------------------
   NOT ALWAYS THE TOP, and that is the point. Every column started at page 0, which is the first
   thing built rather than the first thing worth reading:

     posts  page 0 is the ＋ New post card, added by `unshift` for anybody signed in. So the app
            opened on a form to make a post rather than on the most recent post — the feed's own
            front page is the one BELOW it.
     me     page 0 is the name and role card. The thing somebody actually came for is the one after.

   A DEFAULT IS A JUDGEMENT ABOUT WHAT SOMEBODY CAME FOR, and 0 is only the right answer when the
   first pane happens to be it. Written per column so it can differ, and so changing one is a number
   rather than an argument about ordering.

   IT IS ONLY THE OPENING POSITION. `PAGE` is live from then on — leave Tools on the calendar and
   coming back puts you on the calendar, which is the behaviour that was always here and is worth
   keeping. This decides where a column stands the first time it is drawn, and never again. */
/* A FUNCTION, NOT A NUMBER, and the Posts column is why. Its first pane is the ＋ New post card,
   which is only there for somebody signed IN — so a fixed 1 opens on the newest post for them and
   on the SECOND newest for a visitor, silently skipping the most recent thing the business posted
   to the one person most likely to be new.
   Asked at the moment the column is first drawn, when whether anybody is signed in is known. */
const PAGE_HOME = {
  /* ---------- SPOTLIGHT IS WHAT THE COLUMN OPENS ON, WHEN THERE IS ONE ---------------------------
     It is the business choosing what to put in front of people, and a thing put in front of people
     that opens one swipe behind them is a thing nobody sees — which is what happened to it as a
     column and is the reason it moved.

     WITH NOTHING SPOTLIT, NOTHING CHANGES: past the ＋ card if it is there, on the newest post
     either way. */
  /* SAME RENAME AS `PAGER` ABOVE, and the same silent failure: `PAGE_HOME['feed']` was undefined,
     so the feed opened on page 0 rather than past the ＋ card, and spotlight — the whole reason
     this entry exists — was one swipe behind where nobody saw it. */
  /* THE `USER ? 1 : 0` SKIPPED PAST THE ＋ CARD, which is no longer on this screen — so it now
     skips past the first festive card or the newest post instead, which is a page somebody wants
     to see. Spotlight still wins when there is one. */
  /* ---------- THE NEWEST POST, PAST THE CAMERA ABOVE IT -------------------------------------
     "still make the latest post widget be the default front door of site." The camera is the page
     directly above the newest post, so the front door is the page after it: `feedCamAt_() + 1`.
     Anything in front of the camera — the festive cards, when the calendar has any — is above it
     and is reached by swiping up, which is the price of the camera sitting directly on top of the
     newest post as asked. */
  /* ---------- AND WHEN THERE IS NO POST, NOT THE CAMERA EITHER ------------------------------------
     A FESTIVE CARD AND AN EMPTY POSTS TAB made the column `[festive, camera]`: "the page after the
     camera" was past the end, `pageHome_` clamped it back onto the last page, and the last page IS
     the camera — so the app opened on it and asked for it, which is *"it should only go when you
     swipe to go up"* broken by a second road. With nothing under the camera the front door is the
     page above it instead, and the camera is one swipe away like it is on every other day. (With no
     festive card either there is always a page under it: `postsBlocks` draws "Nothing posted yet".) */
  feed:    () => {
    if (typeof feedCamAt_ !== 'function') return 0;
    const at = feedCamAt_();
    return pageCount('feed') > at + 1 ? at + 1 : Math.max(0, at - 1);
  },
  /* ---------- AND `account` HAS BEEN OPENING ON SOMEBODY ELSE ---------------------------------
     REPORTED AS *"im logged into halex, i dont see account settings."* It was there: the door to
     the Settings column is the `Your settings` tile, and that tile is on YOUR OWN card, which is
     page 0 of this column. This line opened the column on page 1.

     THE ENTRY WAS RIGHT WHEN IT WAS WRITTEN AND STOPPED BEING RIGHT. Its own comment says "past
     the name card", and page 0 WAS a name card — a name, a role and a button. `meCard` draws your
     photograph, your credits, your e-mail, and every tile you own: your settings, add your child,
     your figure, sign out. Skipping it opens the column called You on the first OTHER person in
     the roster, which is exactly what the screenshot showed — George's card, with no way from
     there to anything of your own.

     THE SAME SHAPE AS `PAGE_HOME.dm` FOUR LINES DOWN, which was deleted for it: a rule outliving
     the thing it was written about. That one was caught when its head card went; this one was not,
     because the page it skips never disappeared — it simply became the page you want. */
  account: () => 0,
  /* `dm` WAS HERE, AT 1, TO SKIP THE HEAD CARD — and the head card is gone, so page 0 is the newest
     conversation by construction (`messageThreads_` sorts most-recent-first). An entry left behind
     would open the column on the SECOND conversation for ever: a rule outliving the thing it was
     written about, which is the shape `resource_type` in `VOCAB` and the dead `kind === 'paper'`
     guard already cost this repository twice. */
};
/* `book` WAS HERE — a column that no longer exists. */
/* ---------- THE ICON, FROM THE SHEET ---------------------------------------------------------------
   `brand.logo_square` IS ALREADY A ROW ON THE BRAND TAB and has always been empty. Fill it with a
   URL and the tab icon becomes it on the next load, with no deploy — which is the arrangement every
   other piece of wording in this app already has, and there is no reason the mark should be the one
   thing that needs a commit to change.

   IT CANNOT BE THE FIRST ANSWER. A favicon is read while the page parses; this runs when the sheet
   replies, a second or two later. So `icon.png` in the `<link>` is what the tab shows immediately
   and this replaces it — nobody sees the swap unless the two differ, and if the sheet is empty it
   does not happen at all.

   THE `<link>` IS REPLACED, NOT EDITED. Setting `href` on an existing icon link is ignored by some
   browsers, which cache the icon against the element rather than the URL. Removing the node and
   adding a fresh one is what reliably makes them look again.

   iOS IS SET TOO, and unlike the tab icon it is not decoration: `apple-touch-icon` is read at the
   moment somebody taps Add to Home Screen, which is always long after this has run. */
function applyBrandIcon_() {
  /* ---------- A DRIVE SHARE LINK IS A PAGE, NOT A PICTURE -------------------------------------------
     `logo_square` is filled in by pasting from Drive, and what Drive gives you is a link to a
     VIEWER — an HTML page with a toolbar. Put that in a `<link rel="icon">` and the browser fetches
     a page, fails to decode it as an image, and falls back to the globe. Which looks exactly like
     the value being missing, and is the same fault `pic()` exists to fix on every post.

     So the id is pulled out and rebuilt as a thumbnail address, the same way posts do it. A value
     that is already a plain URL is left alone. */
  const raw = ((DATA || {}).brand || {}).logo_square;
  if (!raw) return;
  const m = String(raw).match(/[-\w]{25,}/);
  const url = /^https?:\/\//i.test(raw) && !/drive\.google\.com\/file/.test(raw)
    ? String(raw)
    : (m ? 'https://drive.google.com/thumbnail?id=' + m[0] + '&sz=w512' : String(raw));
  [['favicon', 'icon'], ['favicon-ios', 'apple-touch-icon']].forEach(([id, rel]) => {
    const old = document.getElementById(id);
    if (old) old.remove();
    const el = document.createElement('link');
    /* THE DEFAULT `logo_square` IS `icon.png`, THE SQUARE ONE, so taken as given it would put the
       square back on the tab the moment the payload lands. The tab icon keeps its circle unless
       the sheet names a real picture of its own; the home-screen icon stays square either way. */
    el.id = id; el.rel = rel;
    el.href = (rel === 'icon' && url === 'icon.png') ? 'favicon.png' : url;
    document.head.appendChild(el);
  });
}

/* KEYED BY SCREEN ID, like `PAGER` and `PAGE_HOME` — and `posts` and `me` are not screen ids. See
   the long note on `PAGER`. Every screen that pages needs an entry here or its position is not
   remembered between visits. */
/* `booking` AND `dm` WERE MISSING, and this table's own sentence above is the rule they broke:
   every screen that pages needs an entry or its position is not remembered between visits. Both
   page — `booking` since the receipts became pages, `dm` since the conversations did. */
const PAGE = { feed: 0, stuff: 0, account: 0, tools: 0, games: 0, reel: 0, booking: 0, dm: 0, make: 0,
               saved: 0, settings: 0, spotlight: 0, shop: 0, progress: 0, res: 0, biz: 0 };

/* ==================================================================================================
   A COLUMN MAY HOLD FEWER PAGE ELEMENTS THAN IT HAS PAGES.

   EVERY SCREEN BUT ONE BUILDS ALL OF ITS PAGES, and should: Tools has nine, the feed has as many
   posts as there are. The Find screen has one page per QUESTION IN THE LIBRARY -- 5,226 of them on
   one answer -- and built every one on every tap, which is what "its so fycking slow man ... its
   only slow on mobile" was. One element per library row is a cost that grows with every paper
   transcribed and has nothing to do with what is on the screen.

   SO THE RESULT PAGES ARE A WINDOW that slides, and these two numbers are the whole of it:

     PAGE_KEEP[id]  how many leading pages are always present -- the question, the saved things,
                    the booking pages. They hold real elements with ids in them and may not be
                    recycled.
     PAGE_LO[id]    how many pages BEYOND those have been scrolled past and are not in the document.

   SO A DOM POSITION AND A PAGE NUMBER ARE NO LONGER THE SAME NUMBER, and every place that treated
   them as one goes through these two functions. Both default to nought, so every other screen maps
   a page to itself and is untouched by construction -- which is what makes this safe to put on the
   path every column shares. */
const PAGE_KEEP = {};
const PAGE_LO = {};
/* WHICH ELEMENT IS PAGE `i` — AND -1 FOR A PAGE THAT HAS SCROLLED OFF THE FRONT OF THE WINDOW.
   `i - PAGE_LO` alone answered a number for those too, and it was the number of a LEADING page:
   with one page kept and the window starting eight results in, result page 8 came out as element
   nought, which is the question. `fillStuffPages` walks five pages either side of where you are,
   so swiping back up a list wrote a practical's card into the question's pane — measured: the
   search box, the chips and every answer gone from the screen with nothing thrown, and `goPage(0)`
   landing on a card. A page past the END already had no element; this makes the front the same. */
const domIndex_ = (id, i) => {
  const keep = PAGE_KEEP[id] || 0;
  if (i < keep) return i;
  const d = i - (PAGE_LO[id] || 0);
  return d < keep ? -1 : d;
};
/* AND WHICH PAGE ELEMENT `p` IS. */
const logIndex_ = (id, p) => (p < (PAGE_KEEP[id] || 0) ? p : p + (PAGE_LO[id] || 0));

/* WHETHER A COLUMN HAS BEEN OPENED YET. The home position applies once — after that `PAGE` is where
   somebody left it, and putting them back at the top every time is a pager they have to
   re-navigate on every glance at another tab. */
const PAGE_OPENED = {};
function pageHome_(id) {
  if (PAGE_OPENED[id]) return;
  const home = PAGE_HOME[id];
  if (!home) { PAGE_OPENED[id] = true; return; }

  /* ---------- NOT UNTIL THE COLUMN IS THE SHAPE IT WILL BE -------------------------------------
     THIS RAN AT BOOT AND WAS THEREFORE ALWAYS WRONG. `paintPager` fires while the app is drawing
     its first frame, long before the payload has landed — so `feedPosts()` was empty, the column
     was one pane long, and `Math.min` clamped the home position to 0. `PAGE_OPENED` then marked it
     done for ever, and signing in or the posts arriving could never put it right. The ＋ card stayed
     the front page and looked like the setting had simply been ignored.

     TWO CONDITIONS, and both are about the column being real yet:

       · THE PAGES HAVE TO EXIST. A column of one pane cannot honour a home position of 1, and
         clamping against a count of nothing is how this failed.
       · SOMEBODY HAS TO BE SIGNED IN OR NOT, SETTLED. `USER` is null for the whole of the first
         frame and is filled from localStorage a moment later, and it is the thing that decides
         whether the ＋ card is there at all — so asking before it is known is asking the wrong
         question and recording the answer permanently.

     Until both hold, this does nothing AND DOES NOT MARK ITSELF DONE, so the next paint asks
     again. Once they hold it applies once and never again — which is the original promise: the
     home position is where a column OPENS, not somewhere it keeps returning to. */
  if (pageCount(id) < 2) return;
  if (!LOADED) return;

  PAGE_OPENED[id] = true;
  const n = home();
  PAGE[id] = Math.max(0, Math.min(n, Math.max(0, pageCount(id) - 1)));
}

/* A NUMBER OR A LIST. The names were read by the header and there is no header, so `pagerNames` is
   only ever asked for its LENGTH -- and `PAGER.stuff` was building 5,226 strings to be counted, on
   every call, on the same hot path as everything else this window is about. A screen whose pages
   have no names may answer with the count itself. */
/* ---------- AND COUNTED ONCE A HANDLER, NOT FIVE TIMES A FLICK ---------------------------------------
   A COUNT IS A BUILD on half the columns: `PAGER.settings` is `settingsPages_().length`, which writes
   every settings card's markup to find out how many there are, and Saved, the Spotlight, the shop,
   the feed and Messages are the same shape. One page turn asked five times (six on a diagonal) —
   as the finger chose its axis and again for its last page, then the release, `goPage`, and
   `paintPager` twice — and on Settings at 4x CPU that was 20–33ms of the release and up to 60ms of
   the first moving frame (measured on 6 October, rapid flicks): the card frozen under the thumb at
   the exact moment it should leave. Now twice: once as the axis is chosen, once at the release.

   SO A GESTURE HOLDS THE COUNT (`countHold_`, from overworld.js) for the length of one handler, which
   is a stretch of code in which nothing adds or removes a page. Outside a hold nothing is kept, so a
   paint that changes the pages and counts them a line later still sees the new number. */
let COUNT_HOLD = null;
function countHold_(on) { COUNT_HOLD = on ? new Map() : null; }
/* ---------- AND NOT BUILT AT ALL WHILE THE COLUMN IS THE ONE IT WAS --------------------------------------
   THE HOLD ABOVE STILL LEFT TWO BUILDS A GESTURE, and a fast run of flicks is five gestures a second.
   Measured at 4x CPU on 11 Oct (docs/history/341), each count a whole column's markup written to a string
   and thrown away: Feed 16.6ms, Saved 38.6, Settings 45.6, the Spotlight 16.3, the shop 15.6 — twice per
   flick, inside the axis decision and the release, which is where *"if I scrol fast … it's still clunky"*
   lives. A count that cannot have changed is a count that need not be made.
   KEPT PER COLUMN AGAINST ITS FIRST PAGE ELEMENT AND HOW MANY CHILDREN IT HAS. Both change with every paint
   (a paint writes new elements) and every top-up (the reels append, which is the count changing), so a
   count kept against them is the count of the pages that ARE ON THE SCREEN — which is the number the pager
   needs: a column marked `STALE` whose facts have grown is still showing its old pages, and a turn past
   them would be a turn to a page that is not there. NOT FOR THE FINDERS, whose pages are a window over
   thousands and whose count is `finderPageCount_`'s, memoised by the engine on its own terms. */
const COUNT_MEMO = new Map();
const pageCount = id => {
  if (COUNT_HOLD && COUNT_HOLD.has(id)) return COUNT_HOLD.get(id);
  const host = typeof finderOf_ === 'function' && finderOf_(id) ? null : document.getElementById('s-' + id);
  const k = host && host.firstElementChild;
  const m = k ? COUNT_MEMO.get(id) : null;
  let n;
  if (m && m.k === k && m.len === host.childElementCount) n = m.n;
  else {
    const v = pagerNames(id);
    n = typeof v === 'number' ? Math.max(0, v | 0) : v.length;
    if (k) COUNT_MEMO.set(id, { k: k, len: host.childElementCount, n: n });
  }
  if (COUNT_HOLD) COUNT_HOLD.set(id, n);
  return n;
};

/**
 * THE DIAL.
 *
 * Every widget sits on the same spindle and only the one at the front is full size. Its
 * neighbours are still there — smaller, dimmer, a little way off — so the shape of the whole
 * screen is visible while you are using one part of it. A full-page slide showed one thing and
 * gave no sense that there was anything else, which is why the dots had to exist to say so.
 *
 * Each page is told two numbers and CSS does the rest:
 *   --o  how far from the front, SIGNED: -1 is the one above, +1 the one below
 *   --a  the same, unsigned, because CSS has no dependable abs() and scale and fade both want it
 *
 * `instant` is the difference between arriving and travelling. Coming back to a tab has to put
 * you where you left off — not fly you there from the top, which is what it did, and which reads
 * as the app losing your place and then correcting itself.
 */
/* ---------- WORK THAT MUST NOT HAPPEN DURING A SLIDE ---------------------------------------------
   Every screen but one turns a page by moving markup that is already in the document. Find is the
   exception: its pages are filled as you approach them, because four hundred resources' worth of
   markup all at once is not worth building for pages nobody reaches.

   That filling was happening BEFORE the transform moved — deliberately, so a page would "arrive
   with its contents rather than filling in underneath somebody". Which is the same well-meant
   mistake as repainting a screen on a tab change: a synchronous rebuild fired at the exact moment
   the animation starts, so the browser does the rebuild and drops the frames the slide needed. It
   is why the second column has never felt like the others.

   So it goes after. One booking at a time, so a run of quick swipes fills once at the end rather
   than once per swipe, and the timer is a little longer than the transition so the fill lands on a
   grid that has already settled. */
/* ---------- ONE TIMER HELD ONE JOB, AND THERE HAVE ALWAYS BEEN THREE -----------------------------
   IT KEPT ONE `setTimeout` AND CLEARED IT ON EVERY CALL. That is exactly right for one caller asked
   twice — a run of quick swipes should fill once at the end — and it is silently wrong the moment
   two DIFFERENT jobs are booked for the same slide, because the second cancels the first.

   `paint()` books two, four lines apart: `reelsWatch_` and then `startScreen_(AT)`. The second
   always wins. **So the reel column's observer has never once run**, which means no slide has ever
   asked for its photograph and every reel anybody has ever seen has been the bare gradient the
   comment above `.feed-art` calls "the floor, not a placeholder". Nothing threw, nothing was
   missing, and the screen worked — it just quietly did half of what it was written to do. Found by
   counting the observers in a browser rather than by reading, which is the only way this one could
   have been found: both lines are correct and the fault is in what they meet in.

   COALESCED PER JOB, NOT ACROSS JOBS. The key is the function itself where the caller passes a
   named one, and a word where it passes an arrow — a fresh arrow is a different key every call, so
   keying on identity alone would queue one `startScreen_` per swipe and undo the coalescing this
   was built for. Last booking of a key wins; every key runs. */
let AFTER_SLIDE = null;
const AFTER_SLIDE_JOBS = new Map();
let AFTER_SLIDE_HELD = 0;   // when the booked jobs first found a finger down, for the cap below

function afterSlide_(fn, key) {
  AFTER_SLIDE_JOBS.set(key || fn, fn);
  if (AFTER_SLIDE) clearTimeout(AFTER_SLIDE);
  AFTER_SLIDE = setTimeout(function run() {
    /* NOT INSIDE A SETTLE, AND NOT UNDER A FINGER. A swipe's settle is 260-420ms now
       (`settleCurve_`), so a fixed 300ms landed widgets drawing themselves and pages being filled in
       the middle of it — measured on Tools: a widget starting at +322ms for 85ms, then a re-placement
       retargeting the glide at +412ms. The slide itself is composited and survives that work; what
       does not is the next swipe, which waits behind it, and a widget that grows mid-glide restarts
       the curve. So it waits for the settle's end, or for a finger to lift; the timer was only ever
       a stand-in for "the slide has finished". */
    /* ---------- A FINGER DOWN AT ALL, NOT ONLY ONE THAT HAS CHOSEN ITS AXIS ----------------------------
       THIS WAS `SWIPE.live && SWIPE.axis`, and the axis is claimed only after ten pixels of travel —
       so the first ten pixels of the next flick were not a finger at all as far as this was
       concerned. Instrumented on the iPad complaint (*"if i scroll down quickly it does glitch out or
       clip fast"*, 8 Oct): the next touch went down at 4805ms and Find's late fill re-aimed the column
       at 4806ms, one millisecond into the gesture, emptying pages over the card and filling them under
       it while the thumb was on the glass. `widgetsLater_` in arcade.js made this same correction for
       the widgets on 5 October; this is its twin.
       AND NOT FOR EVER, for the reason that one gives: a finger resting on the glass, or a `pointerup`
       the browser never sent, is `SWIPE.live` with nothing moving, and a page never filled is worse
       than one filled under a still thumb. A second and a half, then on regardless. */
    const now = performance.now();
    const down = typeof SWIPE !== 'undefined' && !!SWIPE.live;
    if (!down) AFTER_SLIDE_HELD = 0;
    else if (!AFTER_SLIDE_HELD) AFTER_SLIDE_HELD = now;
    const wait = SETTLE_ON && now < SETTLE_ON.until ? Math.ceil(SETTLE_ON.until - now) + 50
               : down && now - AFTER_SLIDE_HELD < 1500 ? 100 : 0;
    if (wait) { AFTER_SLIDE = setTimeout(run, wait); return; }
    AFTER_SLIDE_HELD = 0;
    const jobs = [...AFTER_SLIDE_JOBS.values()];
    AFTER_SLIDE_JOBS.clear();
    /* ---------- AND STILL "BOOKED" UNTIL THE LAST OF THEM HAS RUN (`AFTER_SLIDE` is this run's mark) ----------
       It was set to null HERE, before the first job ran, while the rest waited one task each — so for the
       length of the chain everything that asks "is anything booked after the slide?" was told no: the
       builder's gate (`aheadGate_`, "work for the glass goes first"), and every check that waits for quiet.
       Found by review round 1 (12 Oct) through the word-game journeys, which failed under a load average of
       15–23 — on cafb838 too — and failed every time with each timer held back up to 300ms: the harness
       said "quiet" while the job that stops a round left behind (`widgetsSettle_`) was still four tasks
       away. A new booking made while the chain runs replaces the mark with its own timer, and the chain
       then leaves it alone. */
    const mark = {};
    AFTER_SLIDE = mark;
    /* ONE JOB THAT THROWS MUST NOT TAKE THE REST WITH IT. They are unrelated — an observer, a
       widget's `start`, a page fill — and before there was a list there was nothing to protect.
       AND ONE PER TASK, so a finger that lands between them is answered between them rather than
       after all of them. */
    const next = () => {
      const f = jobs.shift();
      if (f) { try { f(); } catch (e) {} }
      if (jobs.length) { setTimeout(next, 0); return; }
      if (AFTER_SLIDE === mark) AFTER_SLIDE = null;
      /* AND THEN THE BUILDER, which waits for exactly this list to be empty — see `ahead_` below. */
      if (typeof aheadKick_ === 'function') aheadKick_();
    };
    next();
  }, 300);
}

/* ==================================================================================================
   AHEAD: WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE

   THE OWNER, 11 Oct: *"If I scrol fast left right up or down it's still clunky. I think because it only
   loads things which are close to pov. Increase loading scope. Make it more massive so it's never really
   an issue."* He was right about the cause. Measured that day at 4x CPU on a phone and an iPad
   (docs/history/341): after any landing twelve of thirteen columns were `STALE` and were drawn on
   arrival, inside the release (34–98ms each, up to 450 for an admin); every widget slot was drawn only by
   starting it, after the slide, so a card arrived as the loader for 1–4s; Find filled five pages either
   side and a run of flicks outran it; and 42 of 53 late pictures were asked for after their card was
   already in front. Everything a finger could reach was built when the finger got there.

   SO ONE BUILDER DRAWS EVERYTHING AHEAD, in the quiet: every column marked `STALE`, every widget slot,
   both finders' whole windows, the pictures well ahead in the direction of travel, the reels ahead of you,
   the chosen book of the Bible. It never decides what is current — `paint`'s `delete STALE[id]` is the
   one definition of fresh — it only shortens how long a column stays stale.

   WHEN IT MAY RUN (`aheadGate_`), all of: the first good payload's screen is up (two frames after its
   landing task — nothing is built before the first drawn screen); the page is visible; no finger down; no
   settle and no tapped slide running; the placement caught up (`GLASS.at === AT`, nothing booked); the
   work for the glass done first (`afterSlide_`'s list and the widget queue empty); 400ms since the last
   pointer, wheel or key; nobody typing and no pen stroke; and `window.__aheadHold` unset (the checks set
   it to test the arrival floor). 400ms and not 250: a 291ms chess draw started 250ms after a flick lands
   inside the next flick of a 200–400ms cadence.

   ONE JOB PER IDLE SLICE, CHOSEN AFRESH FROM LIVE STATE (`aheadPick_`), nearest first — the moves it
   takes to reach it, columns across plus pages down, half a move less in the direction last travelled —
   and ties by kind: a paint, a finder page, a widget, pictures, the reels, re-centring a finder's window,
   the Bible. Nothing is ever queued as an object, so a job a repaint, a sign-out or a new question has
   made obsolete cannot run. `requestIdleCallback` with NO timeout (a timeout forces work into a
   saturated thread, which is exactly when a fast run is happening), and a 60ms timer where there is none
   — iPadOS Safari, the device this is for. ONE SLOW RULE: a job that last took over 150ms (a finder's
   cold paint, an admin's Settings, chess) waits for a whole second of quiet, and the next job is taken
   meanwhile. No cost model, no averaging: one bit per job, learned on the device.

   NOTHING PERIODIC. A slice is booked only when the picker finds a job, and the builder is kicked by
   what makes work: a repaint or landing, `go`, `goPage`, the end of a settle, a box left, a stroke
   lifted, the page shown again, the columns changing, a finder's new question or moved window. With
   nothing stale it costs nothing, and while the page is hidden it does nothing. A job that ran and left
   its own reason standing (a paint refused under typing) is not picked again until the next kick. */
const AHEAD = { open: false, opened: 0, input: 0, booked: 0, timer: 0, dir: { x: 0, y: {} }, stuck: new Set(), running: false };
const AHEAD_SLOW = new Set();
const AHEAD_QUIET = 400, AHEAD_QUIET_SLOW = 1000, AHEAD_SLOW_MS = 150;
/* ---------- THE SLOW BIT IS KEPT ON THE DEVICE, AND A COLUMN'S FIRST DRAW IS SLOW UNTIL IT HAS BEEN TIMED ----------
   FOUND BY REVIEW, 12 Oct: the first twenty to thirty seconds after the first screen were clunkier than base.
   `AHEAD_SLOW` started empty on every load, so every heavy job ran once at full cost after only 400ms of quiet
   before the rule could know it was heavy — Find's first draw, Booking's, an admin's Settings, the cheat sheet
   — and a flick begun inside one waited for all of it (the median first-touch delay 55→170ms at 390, its p95
   463→935). And the quiet itself was measured from nothing (`AHEAD.input` 0), so the first slices needed none.
   Three answers, each the least that does it:
     · the bit is KEPT ON THE DEVICE between visits (`familyAheadSlow`, the column paints and widget draws
       only — a page fill's key names a page and means nothing next time), so a second visit knows;
     · until a column has been drawn from a payload once (`PRE_PAYLOAD`), its draw counts as slow — that is
       every column's first draw of every visit, the coldest it will ever be;
     · the quiet is measured from the moment the builder opens (`aheadOpen_`), when the screen has just come up
       and a hand is about to touch it — so the first slice needs its 400ms, or its second, like any other. */
const AHEAD_SLOW_KEY = 'familyAheadSlow';
try { (JSON.parse(localStorage.getItem(AHEAD_SLOW_KEY) || '[]') || []).forEach(k => { if (typeof k === 'string') AHEAD_SLOW.add(k); }); } catch (e) {}
function aheadSlowKeep_() {
  try { localStorage.setItem(AHEAD_SLOW_KEY, JSON.stringify([...AHEAD_SLOW].filter(k => /^(paint|widget):/.test(k)))); } catch (e) {}
}
/* THE LAST TWO HUNDRED SLICES, for the harness and the journeys: what ran, for how long, and whether any
   gate was open that should not have been. */
window.__aheadLog = [];
/* ONE PASSIVE LISTENER FOR THE QUIET — the time of the last thing a hand did. A pointer lifting is a stroke
   or a swipe ending, which is a reason to look again once the quiet has come. */
['pointerdown', 'pointermove', 'wheel', 'keydown'].forEach(t =>
  addEventListener(t, () => { AHEAD.input = performance.now(); }, { capture: true, passive: true }));
addEventListener('pointerup', () => { AHEAD.input = performance.now(); aheadKick_(AHEAD_QUIET); }, { capture: true, passive: true });
document.addEventListener('focusout', () => { AHEAD.stuck.clear(); aheadKick_(AHEAD_QUIET); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) aheadKick_(); });

/* OPENED TWO FRAMES AFTER THE FIRST GOOD PAYLOAD'S LANDING TASK — the screen in front has been drawn and
   shown before anything is built behind it. */
function aheadOpen_() {
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f => setTimeout(f, 16));
  raf(() => raf(() => { AHEAD.open = true; AHEAD.opened = performance.now(); AHEAD.input = Math.max(AHEAD.input, AHEAD.opened); aheadKick_(); }));
}

/* -1: SHUT UNTIL SOMETHING KICKS IT (not open, hidden, held, somebody writing). >0: shut for about that
   long — looked at again then. 0: open, apart from the quiet, which the caller weighs per job. */
function aheadGate_() {
  if (!AHEAD.open || document.hidden || window.__aheadHold) return -1;
  const now = performance.now();
  if (typeof SWIPE !== 'undefined' && SWIPE.live) return 100;
  if (SETTLE_ON && now < SETTLE_ON.until) return SETTLE_ON.until - now + 20;
  if (now < SLIDE_UNTIL) return SLIDE_UNTIL - now + 20;
  if (GLASS.at !== AT || PLACE_FRAME) return 50;
  if (AFTER_SLIDE || AFTER_SLIDE_JOBS.size || (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length)) return 150;
  /* SOMEBODY WRITING: a box focused anywhere — Find's answer box too, whatever `typingBox_` leaves out for
     its own reasons — or the pen's ink in a stroke. Kicked again by `focusout` and by the pointer lifting. */
  const a = document.activeElement;
  if (a && a.matches && a.matches(TYPING_)) return -1;
  if (typeof PAD_GO !== 'undefined' && PAD_GO) return -1;
  /* AN INPUT ALREADY WAITING FOR THE PAGE — `inputWaiting_`, below. */
  if (inputWaiting_()) return 50;
  return 0;
}
/* ---------- AND NOT WHILE AN INPUT IS ALREADY WAITING FOR THE PAGE -------------------------------------------------
   FOUND MEASURING THE FIRST THIRTY SECONDS AGAIN (review round 1, 12 Oct). The quiet is counted from the last
   pointer, wheel or key the PAGE has heard — and a touch the browser has received but not yet handed to the page
   has not been heard. Read touch by touch (a flick down the Feed every 0.9–1.7s from the first screen, 4x CPU): of
   the touches that waited over 100ms, a third waited behind slices that STARTED after the touch had been sent — one
   behind four in a row, 247ms. Chromium says whether input is queued (`navigator.scheduling.isInputPending`, a
   moving finger included), and asked at every look the builder steps aside and the touch goes first: those touches
   went from 23 of 65 to 2 of 20. Safari has no such call, so on an iPad this is nothing and the quiet is all there
   is; anywhere else it is one call per look. */
function inputWaiting_() {
  try { return !!(navigator.scheduling && navigator.scheduling.isInputPending && navigator.scheduling.isInputPending({ includeContinuous: true })); }
  catch (e) { return false; }
}

/* LOOK AGAIN IN `ms` — once; a look already booked is the one that happens. */
function aheadKick_(ms) {
  if (AHEAD.timer || AHEAD.booked) return;
  AHEAD.timer = setTimeout(aheadCheck_, ms == null ? 30 : Math.max(16, ms));
}
function aheadCheck_() {
  AHEAD.timer = 0;
  if (AHEAD.booked) return;
  const g = aheadGate_();
  if (g < 0) return;
  if (g > 0) { AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, Math.max(16, g))); return; }
  const quiet = performance.now() - AHEAD.input;
  if (quiet < AHEAD_QUIET) { AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, AHEAD_QUIET - quiet + 5)); return; }
  const pick = aheadPick_(quiet >= AHEAD_QUIET_SLOW);
  if (!pick.job) {
    if (pick.slow) AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, AHEAD_QUIET_SLOW - quiet + 5));
    return;
  }
  AHEAD.booked = 1;
  if (typeof requestIdleCallback === 'function') requestIdleCallback(aheadSlice_);
  else setTimeout(aheadSlice_, 60);
}
function aheadSlice_() {
  AHEAD.booked = 0;
  const g = aheadGate_();
  const quiet = performance.now() - AHEAD.input;
  if (g !== 0 || quiet < AHEAD_QUIET) { aheadKick_(g > 0 ? g : AHEAD_QUIET - quiet); return; }
  const job = aheadPick_(quiet >= AHEAD_QUIET_SLOW).job;
  if (!job) { aheadKick_(AHEAD_QUIET_SLOW - quiet); return; }
  const t0 = performance.now();
  /* THE JOB'S KEY WHILE IT RUNS — truthy, so `AHEAD.running` still says "a slice is running"; and what a draw
     or a check asks to know which job it is inside (the dm draw asks nobody when drawn ahead, posts.js). */
  AHEAD.running = job.key || true;
  let left = false;
  try { left = job.run() === false; }
  catch (e) { left = true; try { console.warn('[ahead]', job.key, e); } catch (x) {} }
  finally { AHEAD.running = false; }
  const ms = performance.now() - t0;
  const was = AHEAD_SLOW.has(job.key);
  if (ms > AHEAD_SLOW_MS) AHEAD_SLOW.add(job.key); else AHEAD_SLOW.delete(job.key);
  if (was !== AHEAD_SLOW.has(job.key) && /^(paint|widget):/.test(job.key)) aheadSlowKeep_();
  /* A JOB WHOSE REASON IS STILL STANDING AFTER IT RAN is not picked again until something kicks — a paint
     refused under typing, a widget whose start threw. Without this it would be picked every slice. */
  if (left || aheadStill_(job)) AHEAD.stuck.add(job.key);
  const log = window.__aheadLog;
  log.push({ key: job.key, ms: Math.round(ms * 10) / 10, t: Math.round(t0), quiet: Math.round(quiet),
    live: !!(typeof SWIPE !== 'undefined' && SWIPE.live), settle: !!(SETTLE_ON && t0 < SETTLE_ON.until),
    after: !!(AFTER_SLIDE || AFTER_SLIDE_JOBS.size) });
  if (log.length > 200) log.splice(0, log.length - 200);
  aheadKick_(0);
}
/* WHETHER A JOB THAT JUST RAN IS STILL WANTED — asked of the picker, which is the one place a job is made. */
function aheadStill_(job) {
  try { return aheadJobs_(true).some(j => j.key === job.key); } catch (e) { return false; }
}

/* ---------- THE JOBS, AS THEY STAND NOW ----------------------------------------------------------------
   Every kind is a function of live state returning `{ key, kind, d, run }` — `d` the moves it takes to
   reach (columns across from the one in front, plus pages down from its page in front), `run` the work.
   Kinds register themselves in `AHEAD_KINDS` in the order ties go to. */
const AHEAD_KINDS = [];
const AHEAD_RANK = ['paint', 'fill', 'widget', 'pics', 'reels', 'centre', 'bible'];
function aheadJobs_(all) {
  const out = [];
  AHEAD_KINDS.forEach(k => { try { (k() || []).forEach(j => out.push(j)); } catch (e) {} });
  return all ? out : out.filter(j => !AHEAD.stuck.has(j.key));
}
/* HOW FAR, IN MOVES, AND HALF A MOVE NEARER IN THE DIRECTION OF TRAVEL. */
function aheadDist_(id, page) {
  const ti = TABS.findIndex(t => t.id === AT), ci = TABS.findIndex(t => t.id === id);
  if (ci < 0 || ti < 0) return Infinity;
  const dc = ci - ti;
  let d = Math.abs(dc);
  if (dc && AHEAD.dir.x && Math.sign(dc) === AHEAD.dir.x) d -= 0.5;
  if (page != null) {
    const dp = page - (PAGE[id] || 0);
    d += Math.abs(dp);
    const dy = AHEAD.dir.y[id] || 0;
    if (dp && dy && Math.sign(dp) === dy) d -= 0.5;
  }
  return d;
}
function aheadPick_(slowOk) {
  let best = null, slow = false;
  aheadJobs_(false).forEach(j => {
    if ((AHEAD_SLOW.has(j.key) || j.cold) && !slowOk) { slow = true; return; }
    if (!best || j.d < best.d - 1e-9
        || (Math.abs(j.d - best.d) < 1e-9 && AHEAD_RANK.indexOf(j.kind) < AHEAD_RANK.indexOf(best.kind))) best = j;
  });
  return { job: best, slow: slow };
}
/* WHETHER ANYTHING IS LEFT TO BUILD — for the checks, which wait for it as they wait for `afterSlide_`. */
function aheadBusy_() {
  if (!AHEAD.open || window.__aheadHold) return false;
  if (AHEAD.booked || AHEAD.running) return true;
  try { return aheadJobs_(false).length > 0; } catch (e) { return false; }
}

/* ---------- PAINT: A COLUMN MARKED `STALE`, DRAWN AGAIN BEFORE ANYBODY ARRIVES --------------------------
   The column in front is never the builder's (`repaint` draws it at once), and a column the person cannot
   reach (no section, or not in `TABS` for them — the admin's column comes and goes with `columnsFor_`) is
   not asked about: `TABS` is read again on every slice. Drawn as `go` would draw it on arrival — `fresh`
   if its markup predates the first payload — then placed on its own (`placeOne_`), its panes measured now
   (`paneWatch_`, so a release later finds them seen and measures nothing), and the half of `startScreen_`
   that starts nothing (`drawnScreen_`). Never the camera, a clip, a widget's start or a poll: those run for
   somebody looking, and are `startScreen_`'s. A paint `paint` refuses (a box being typed in, a stroke) leaves
   the mark, and the column waits for the next kick. `go`'s own paint stays as the floor, for an arrival
   that beats the builder. */
AHEAD_KINDS.push(() => TABS.filter(t => t.id !== AT && STALE[t.id] && $('s-' + t.id)).map(t => ({
  key: 'paint:' + t.id, kind: 'paint', d: aheadDist_(t.id, null),
  /* NEVER TIMED ON A PAYLOAD YET — slow until it has been (see `AHEAD_SLOW_KEY`'s note). */
  cold: PRE_PAYLOAD.has(t.id),
  run: () => aheadPaint_(t.id),
})));
function aheadPaint_(id) {
  const host = $('s-' + id);
  if (!host || id === AT) return;
  paint(id, false, { ahead: true });
  if (STALE[id]) return false;
  PRE_PAYLOAD.delete(id);
  if (PAGER[id] && host.querySelector(':scope > .page')) {
    pageHome_(id);
    PAGE[id] = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
  }
  /* A FINDER ON THE GLASS (beside the one in front, on a wide window) is filled as far as the glass shows, in
     this slice and before it is placed — its draw no longer fills it a microtask later, outside the slice's
     time (find.js, `finderScreen_`). One off the glass is filled one card per slice by the fill job. */
  const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
  if (F && typeof stuffOnGlass_ === 'function' && stuffOnGlass_(id)) {
    try { inFinder_(F, () => { if ($(id + '-controls')) stuffBandFill_(); }); } catch (e) {}
  }
  placeOne_(id);
  if (typeof paneWatch_ === 'function') paneWatch_(host);
  drawnScreen_(id);
}
/* THE HALF OF `startScreen_` THAT RUNS NOTHING — a conversation opened at its newest message. */
function drawnScreen_(id) {
  if (id === 'dm' && typeof dmFoot_ === 'function') { try { dmFoot_(); } catch (e) {} }
}

function paintPager(id, instant) {
  if (!PAGER[id]) return;
  const host = $('s-' + id);
  if (!host || !host.querySelector(':scope > .page')) return;
  /* THE HOME POSITION, on first sight of this column only. Here rather than at startup because the
     pages do not exist until now — a count taken before the screen is built is a count of nothing,
     and clamping against it would put every column back at 0. */
  pageHome_(id);
  const n = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
  PAGE[id] = n;

  /* THE SAME PLACER THE TABS USE. There were two of these — one setting `--o` on a page and one
     that did not exist at all for screens — which is precisely why the two axes drifted apart. */
  placeCells('y', instant, 0, id);


  /* The page's name used to be written into the header here. There is no header, so it is not.
     `pagerNames` is still what decides how many pages a screen has, which was always the
     load-bearing half of it. */
}

function goPage(id, to, instant) {
  if (!PAGER[id]) return;
  /* A FINDER IS TURNED IN ITS OWN BINDING — Find, or the second finder (find.js, `inFinder_`) — so
     its window, its fills and its kept place below are its own and never the other's. Bound once,
     here; inside, `F` is the bound finder and the call goes straight through. */
  const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
  if (F && F !== FINDER) return inFinder_(F, () => goPage(id, to, instant));
  const n = Math.max(0, Math.min(pageCount(id) - 1, to));
  const was = PAGE[id] || 0;
  if (n === was && !instant) return;
  PAGE[id] = n;
  /* AND WHICH WAY THIS COLUMN WAS LAST TURNED — the builder fills and fetches on that side first. */
  if (n !== was) AHEAD.dir.y[id] = n > was ? 1 : -1;
  aheadKick_(AHEAD_QUIET);
  /* MOVE FIRST, FILL AFTER — as long as the page being turned to is already there.

     `fillStuffPages` keeps two pages ready either side, which is further than anybody can swipe in
     one gesture, so normally there is nothing to build at this moment and nothing to wait for.
     Whatever has newly come into range is built once the grid has settled.

     But "normally" is not "always": jumping several pages at once, or arriving before the first
     fill has run, lands on a page with nothing on it. An empty pane has no height, so the grid
     places it as though it were nothing and the cards around it come out on top of one another.
     If the page you are going to is empty, it is filled before anything moves. */
  /* Page 0 is the question, which is drawn with the screen and never filled lazily — so it has no
     `filled` mark and must not be mistaken for an empty one. */
  /* ---------- THE WINDOW FIRST, BECAUSE EVERYTHING BELOW MEASURES ELEMENTS ----------------------
     `columnShift_` and `stepY_` read the page you are going TO, and on the Find screen that page is
     an element only once the window covers it. So the window is moved before anything looks. Every
     other screen has no window and this is one guarded call that returns immediately. */
  if (F && typeof stuffWindow_ === 'function') { try { stuffWindow_(); } catch (e) {} }
  const bare = !!F && n > 0 && (() => {
    const host = $('s-' + id);
    const el = host && host.querySelectorAll(':scope > .page')[domIndex_(id, n)];
    return !el || el.dataset.filled !== '1';
  })();
  /* ---------- AND THE FAR EDGE OF THE GLASS, ONE CARD PER TURN ---------------------------------------
     REPORTED FROM A PUPIL'S iPAD, 8 Oct: *"if i scroll down quickly it does glitch out or clip fast or
     idk."* Measured at 820x1180 on the Corbettmaths subtraction sheet, ten quick flicks: the pages two
     and three below the card in front sat on the glass as empty 31px slivers for 600–700ms at a time
     — 96 of 192 frames had one, and 48 of 207 at 390x844.

     THE FILL THAT SHOULD HAVE BEEN THERE NEVER RAN. The rest of a turn's filling is booked through
     `afterSlide_`, which waits for 300ms of quiet and for the settle to end — so a flick every 150ms
     starves it completely, by design. Only a page EMPTY ON ARRIVAL was filled on the spot (`bare`),
     and that fill builds the card in front and one either side (`STUFF_SOON`) because it is paid for
     in the tap. But the glass shows two either side on a phone and three on a wide window
     (`glassRows_`), and `placeGrid`'s own note says what that edge is for: "a fast swipe never shows
     an empty rectangle". It showed one every other turn.

     SO THE PAGE ARRIVING AT THE FAR EDGE IS FILLED NOW, BEFORE THE COLUMN MOVES — the one the turn
     brings onto the glass, plus any empty page between it and the card in front. In a run of turns
     that is exactly ONE card per turn, which is the window's own promise (`STUFF_WIN` in find.js:
     "turning a page still draws exactly one card"); everything past the edge is still the late
     pass's. ONLY FOR A TURN: a jump of more than the glass is the `bare` path's, which `STUFF_SOON`
     keeps cheap on purpose. */
  /* ---------- AND NOW AS FAR AS THE BAND WILL SHOW, IN ITS OWN UNITS (docs/history/341) ------------------
     The band draws every page whose box meets the turn's glass widened by a glass height, in pixels — so
     "the far edge" is that, and `stuffEdgeFill_` (find.js) fills to it, bounded per release. After any
     rest the builder has already filled the whole window, so in a run of turns this finds nothing to do;
     it is the floor for a turn that beats the builder. */
  const edge = !!F && n !== was && Math.abs(n - was) <= glassRows_() && typeof stuffEdgeFill_ === 'function';
  /* ---------- AND A CARD DRAWN ABOVE THE ONE IN FRONT DOES NOT MOVE IT ------------------------------
     GOING DOWN THE PAPER the edge is below the card in front and nothing it draws can move that card.
     GOING BACK UP it is above, and so is the page before a `bare` landing: a card arriving there is
     taller than the empty page it fills, and everything under it, the card in front included, is
     pushed down the layout while the column is still where the finger left it. Measured flicking back
     up the subtraction sheet at 820x1180: the card jumped about 280px down the glass and slid back.
     So the page being turned to is measured either side of those fills and the column moved by the
     difference, from where it is drawn (`stuffKeepPlace_`, the window's own correction in find.js).
     Asked only when something CAN land above, so a turn down the paper forces no layout here. */
  const above = !!F && (bare || (edge && n < was));
  const ref = above && $('s-' + id) ? $('s-' + id).querySelectorAll(':scope > .page')[domIndex_(id, n)] : null;
  const top0 = ref ? (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop) : 0;
  if (bare) fillStuffPages();
  if (edge) { try { stuffEdgeFill_(n, n > was ? 1 : -1); } catch (e) {} }
  if (ref && typeof stuffKeepPlace_ === 'function') stuffKeepPlace_($('s-' + id), top0 - (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop));
  /* A WIDGET STILL WAITING ITS TURN to start is started now if this is its page — see `widgetsNear_`
     in arcade.js. Before the placement, for the reason the fill above is: a card that grows after
     the column was placed is a card the placement never saw. */
  if (typeof widgetsNear_ === 'function') widgetsNear_(id);
  /* AND THE REELS KEPT SIX AHEAD, one slide appended now if fewer are left — markup only (`reelAhead_`). */
  if (id === 'reel' && typeof reelAhead_ === 'function') { try { reelAhead_(n); } catch (e) {} }
  if (id === AT) placeCells('y', instant);
  /* AFTER THE SLIDE, THE LANDING'S OWN WORK — the page in front and one either side if a jump left them
     empty, its textbook animation and its running widget. Not the far pages any more: the late pass that
     drew eight of them in one task of up to 551ms went with docs/history/341, and the builder fills the
     window in the quiet. */
  if (F && !bare) afterSlide_(() => inFinder_(F, fillStuffPages), 'fill:' + id);
  /* ---------- THE REEL BEING WATCHED IS THE PAGE BEING SHOWN -------------------------------------
     THIS IS THE ONE PLACE `PAGE[id]` CHANGES, so it is the one place that can say a different reel
     is on the screen. The column used to answer that question with an IntersectionObserver over a
     scroller of its own — a ratio measuring a thing the app had already decided.

     `reelsWatch_`, NOT AN ARROW, and the key is why: `paint()` books the same function on arrival,
     and `afterSlide_` coalesces on identity — so a run of quick flicks plays the clip you stopped
     on rather than starting and pausing one per swipe. A fresh arrow here would be a different key
     every call and would undo exactly that. */
  if (id === 'reel' && typeof reelsWatch_ === 'function') afterSlide_(reelsWatch_);
  /* AND THE TEXTBOOK'S ANIMATION ON THE PAGE TURNED TO, by name for the reason `reelsWatch_` is. */
  if (F && typeof tbAnimWatch_ === 'function') afterSlide_(tbAnimWatch_);
  /* AND THE CAMERA, WHICH IS A PAGE OF THE FEED — started when its page arrives and let go when the
     page turns away, booked under its own name for the reason `reelsWatch_` is: a run of quick
     flicks is one decision at the end rather than a camera started and stopped per swipe. */
  if (id === 'feed' && typeof feedCamWatch_ === 'function') afterSlide_(feedCamWatch_);
  /* AND A TURN OFF THE CAMERA'S PAGE PUTS ITS VIEWFINDER AT REST NOW, not after the slide: the slide is what
     carries the page across the glass, loader and all (`camRest_`, posts.js; docs/history/341). */
  if (id === 'feed' && n !== 0 && typeof camRest_ === 'function') camRest_();
  paintPager(id);
}

/** Wrap a screen's cards into a vertical strip of pages.

    NO DOTS. There was a column of them down the right edge saying how many widgets there were and
    which one you were on — and once each page fills the screen, the header already names the
    widget, so the dots were saying the same thing twice in a less readable way. The count they
    also carried is not worth a permanent mark on every screen: you find out by turning the dial,
    which takes one movement. */
/* A SCREEN'S PAGES, all of them, in one scroller.
   They used to be eight absolutely-positioned cells with one visible. Now they are a list, and the
   peek above and below is what a list looks like when its items are shorter than the viewport —
   which is a fact about the layout rather than something anybody has to maintain. */
/* THE CELL AND THE GLASS ARE TWO THINGS.
   A page was both: the box the grid positions AND the pane you look at. A positioned cell is
   `inset: 0` — the full screen, always — so a post with a picture and two lines of caption sat in a
   pane the height of the phone with two thirds of it empty glass.
   `.page` is the cell and is invisible. `.pane` inside it is the glass and is as tall as what is on
   it. Nothing that styles a page's contents changes: every rule was written as a DESCENDANT
   (`.page .post`), not a child, so a wrapper between them is not something they can notice. */
/* ---------- THE MARKS, ADOPTED FROM THE PAYLOAD JUST LANDED ------------------------------------
   BOTH SETS, AND AFTER `DATA` IS THE NEW ONE. `adoptFavourites_` used to be called a few lines
   ABOVE the `DATA = new Proxy(d, ...)` assignment, so it read `DATA.favourites` off the payload
   BEFORE this one — one load behind on every load, and on the very first load `DATA` is `{}` so
   it adopted nothing at all. Every star was device-only and nobody could have seen why.
   Called from `adoptMarks_` so the two cannot drift apart again. */
function adoptMarks_() {
  try { adoptFavourites_(); } catch (e) {}
  try { adoptSpotlight_(); } catch (e) {}
  /* AND THE LATEST ANSWER SENT FOR EACH QUESTION, from the account — onto the cards and into the boxes —
     and whatever this device has waiting to send goes up. See `subAdopt_` in js/submit.js. Here for the
     same reason as the two above: `DATA` is the payload that has just landed. It was `attemptsSync_`,
     the done dates, until the owner's *"Just whether it's right or not"* (9 Oct). */
  try { if (typeof subAdopt_ === 'function') subAdopt_(); } catch (e) {}
  /* AND A MARK WITH AI TILE DRAWN WAITING FOR THIS PAYLOAD (`aiDecided_`, keypad.js) — let go where it stands,
     because the column holding it may be held back from the repaint that would draw it again. */
  try { if (typeof aiDecided_ === 'function') aiDecided_(); } catch (e) {}
  /* AND WHAT THIS PERSON HAS WRITTEN ON THEIR OTHER DEVICES — once a visit, and whatever this device has
     waiting for the account goes up with it. See `answersPull_` in js/answers.js. */
  try { if (typeof answersPull_ === 'function') answersPull_(); } catch (e) {}
}

const pages = (id, cards) =>
  cards.map(c => `<section class="page"><div class="pane">${c}</div></section>`).join('');

/* ---------- ALL OF THEM ON ONE, WHICH IS WHAT A LIST IS -------------------------------------------
   `pages` GIVES EVERY CARD ITS OWN PAGE AND ITS OWN PANE. That is right when a card IS the screen —
   a post you look at, a paper you read — and wrong the moment there are eight small things, because
   eight panes are eight lit rectangles floating separately on black, and a stack of floating
   rectangles reads as a stack of pop-ups. It is the pane doing its job in a place that does not
   want one.

   SO: ONE PAGE, ONE PANE, THE CARDS INSIDE IT. Which is what the layout sheet already says — the
   tools column has one thing in it, c1, and nothing at c2 or c3. One screenful holding a list, not
   one screen per tool.

   AND THE VERTICAL AXIS STANDS DOWN, because there is one page and nothing to page to. The drag
   falls through to ordinary scrolling, which shell.js describes a few hundred lines down as exactly
   what happens on a screen that is not paged. Nothing here is a special case. */
const stack = (id, cards) =>
  `<section class="page"><div class="pane">${cards.join('')}</div></section>`;

/** The glass inside a page — where content actually goes. */
/* THE PANE INSIDE A PAGE — AND ONE IS MADE IF THERE IS NOT ONE.

   This has been three things and only the third is right.

   IT WAS `|| el`: no pane, so the contents were written into the PAGE, which threw the glass away
   and drew the cards straight onto the black. Silent, and it looked like a screen half finished.

   THEN IT RETURNED NOTHING, so the caller could skip rather than write somewhere wrong. Honest, and
   it made this file depend on another one: a page built without a pane got nothing at all, so an
   older `find.js` beside a newer `shell.js` meant the filter did nothing when pressed. A fix that
   only works when two files are updated together is a fix that breaks when one of them is not.

   NOW IT BUILDS THE MISSING PANE. The contents want a pane; if there is not one, that is a thing to
   put right rather than a reason to give up. Nothing can go wrong whichever file is newer, no
   caller has to check, and the glass is right either way. */
function paneOf_(el) {
  if (!el) return null;
  const found = el.querySelector(':scope > .pane');
  if (found) return found;
  const pane = document.createElement('div');
  pane.className = 'pane';
  el.appendChild(pane);
  return pane;
}


/* `watchPages` and its observer lived here — they reported which pane the scroller had centred.
   Gone with the scroller. Which page is in front is decided by this file again, which is the only
   way it can be decided once. */

/* `chunk` was here — splitting a list into pages. The Find screen pages by index rather than by
   slicing, and nothing else has ever paged a list. */


/* How many of each thing a phone holds without cutting the last one in half. Different per screen
   because a tile is not a card and a card is not a post — one number for all of them would be
   wrong four times out of five. */
/* `me` is not here any more — the You screen is one scrolling page. See `mePages`. */
/* Book fits more now that a session is a stub rather than a whole receipt — five full receipts was
   a page you scrolled, and the point of a stub is that a page of them is a page you scan. */
/* `book` is not here any more — a session is a pane of its own. See `bookPages`. */
const PER_PAGE = { library: 12 };

/* The dot's handler is registered further down, WITH the other actions. `on()` writes into
   `ACTIONS`, which is a `const` declared after this point — and a const read before its own line
   throws rather than coming back undefined. The same trap the comment beside `wake` describes,
   and the reason that one is a hoisted function declaration. */

/* ---------- THE SHEET ---------------------------------------------------------------------------
   One element, reused. Anything needing the whole screen opens here rather than in a card that
   pushes the page around — and it keeps the thing underneath, so somebody filling in a booking has
   not left the list they found it in.
--------------------------------------------------------------------------------------------- */
let sheetOnClose = null;

/* THE CARD THAT WAS PRESSED, caught on its way past.

   The click handler sees the element; `openSheet` is called from inside the handler for it and is
   given a title and some markup, not an element. Rather than thread a fifth argument through every
   one of the fifty handlers that opens a sheet — most of which do not care — the press is recorded
   as it goes by and used if a sheet opens during the same press.

   CLEARED THE INSTANT IT IS USED, so a sheet opened a second later by something else does not grow
   out of a card somebody pressed before. It is only ever true for the length of one click. */
let SHEET_FROM = null;

/**
 * The four numbers that say where the panel starts: the middle of the card, and how big it is
 * beside the panel. Written as custom properties for the stylesheet to animate from.
 *
 * MEASURED AGAINST THE SCREEN, not the document — a fixed panel is positioned against the viewport,
 * so an origin measured any other way would be right only while nothing had scrolled.
 */
function setSheetOrigin_(el) {
  const root = $('sheet');
  if (!root) return;
  const st = root.style;
  if (!el || !el.getBoundingClientRect) {
    /* From the middle, at nearly full size — a small, quiet arrival rather than nothing at all. */
    st.setProperty('--from-x', '0px');
    st.setProperty('--from-y', '0px');
    st.setProperty('--from-s', '.94');
    return;
  }
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) { st.setProperty('--from-s', '.94'); return; }

  const panel = root.getBoundingClientRect();
  const px = panel.left + panel.width / 2;
  const py = panel.top + panel.height / 2;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  /* HOW SMALL IT STARTS: the card's width against the panel's. Floored, because a very small card
     — a chip, an arrow — would otherwise start as a dot and read as an explosion rather than as
     something opening. */
  const scale = Math.max(.25, Math.min(1, r.width / (panel.width || r.width)));
  st.setProperty('--from-x', Math.round(cx - px) + 'px');
  st.setProperty('--from-y', Math.round(cy - py) + 'px');
  st.setProperty('--from-s', scale.toFixed(3));
}

/* ---------- WHAT THE SHEET IS ONE OF -------------------------------------------------------------
   A SHEET IS OPENED WITH A TITLE AND SOME HTML AND KNOWS NOTHING ELSE, which is why reading three
   past papers meant open, close, swipe, open, close, swipe. The card underneath is one of a list —
   the app knows that; the sheet was simply never told.

   `step` IS OPTIONAL AND IS THE WHOLE OF IT. A caller that has neighbours hands over a function
   taking -1 or 1; it returns true if it moved, having re-opened the sheet on the next one. A caller
   with nothing to step through passes nothing and the sheet behaves exactly as it always has, which
   is what keeps this from being a change to twenty-five call sites. */
let sheetStep = null;

function openSheet(title, html, onClose, step) {
  /* A SHEET OPENED OVER A SHEET. The second overwrote the first and the first's `onClose` was
     dropped on the floor — never called, and then replaced, so whatever it was going to put right
     never happened. Rare, and the kind of thing that goes unnoticed for a year and then loses
     somebody's half-typed booking.
     Run it first, so opening a second sheet is the same as closing the first and opening one. */
  if (sheetOnClose) { const f = sheetOnClose; sheetOnClose = null; try { f(); } catch (err) {} }

  /* SET AFTER the old sheet's `onClose` above, which may itself open a sheet. */
  sheetStep = typeof step === 'function' ? step : null;

  /* ---------- WHERE IT GROWS FROM -----------------------------------------------------------
     The panel opens OUT OF the thing you pressed. Measured here, at the moment of opening, because
     that is the only moment the card is definitely on the screen and definitely where it looks —
     a rectangle remembered earlier would be a rectangle from before the last placement.

     Four numbers, published as custom properties, and the stylesheet does the rest. No animation is
     driven from JavaScript: the panel simply has a closed shape and an open one, and the transition
     between them is the same `.hidden` rule that was already there. Nothing new can get out of
     step, because there is nothing new to keep in step.

     NO CARD, NO ORIGIN — and then it grows from the middle, which is what a panel with no parent
     should do. That is the case for a sheet opened by a button in the header, or from the keyboard,
     and it should not look like a mistake. */
  /* ---------- ALREADY OPEN? THEN IT DOES NOT MOVE ------------------------------------------
     The booking wizard opens a sheet, you answer, and it opens the next one — six times over. The
     calendar does the same, and so does a reaction list opened from inside a post.

     In every one of those the panel is ALREADY in the middle of the screen, and the thing that was
     pressed is INSIDE it. Growing from that would shrink the panel into one of its own options and
     blow it back up, which reads as a glitch rather than as a step forward: nothing arrived, you
     answered a question and got the next one.

     So the origin is only set when the panel is actually opening. Answering inside an open one just
     swaps what it says, which is what it looks like from the outside and now what it is. */
  const wasOpen = !$('sheet').classList.contains('hidden');
  if (!wasOpen) setSheetOrigin_(SHEET_FROM);
  SHEET_FROM = null;

  $('sheet-title').textContent = title;
  $('sheet-body').innerHTML = html;
  $('sheet').classList.remove('hidden');
  $('sheet-back').classList.remove('hidden');
  sheetOnClose = onClose || null;
  /* The page behind must not scroll while a sheet is open — two scrolling things at once is the
     thing that makes a phone feel broken. */
  document.body.style.overflow = 'hidden';
}

/* ---------- CLOSING IT --------------------------------------------------------------------------
   THE CONTENTS USED TO BE THROWN AWAY ON THE SAME LINE that started it closing — so the panel slid
   down EMPTY, which is half of why the ending looked wrong. What you want to see is the thing you
   were reading going away, not an empty box going away.

   So the class goes on now and the contents go once the slide has finished. The delay matches the
   transition in the stylesheet, and if the two ever drift the worst case is a panel that empties a
   little early or a little late — not a panel that breaks.

   EVERYTHING ELSE HAPPENS AT ONCE, deliberately. The page behind can scroll again immediately, and
   `onClose` runs immediately, because those are about the app rather than about the animation and
   waiting a quarter of a second to save something would be an animation deciding when work happens.
--------------------------------------------------------------------------------------------- */
let sheetClear = 0;

function closeSheet() {
  sheetStep = null;
  $('sheet').classList.add('hidden');
  $('sheet-back').classList.add('hidden');
  document.body.style.overflow = '';
  const f = sheetOnClose; sheetOnClose = null;
  if (f) { try { f(); } catch (err) { console.error('[sheet onClose]', err); } }

  /* Emptied after it has gone. A second close before the first has finished cancels the pending
     one rather than stacking another — otherwise a fast double-close empties the sheet somebody
     has just reopened. */
  clearTimeout(sheetClear);
  sheetClear = setTimeout(() => {
    /* Only if it is still closed. Reopened in the meantime and there is nothing to tidy — the new
       contents are somebody's, not the old sheet's to throw away. */
    if ($('sheet') && $('sheet').classList.contains('hidden')) $('sheet-body').innerHTML = '';
  }, 300);
}

/* ---------- ONE WAY TO POST ----------------------------------------------------------------------
   Twenty-odd places call the backend, each with its own `.then(r => r.json())` and its own idea of
   what counts as a failure. That is twenty chances to miss something the server said — and the
   server has just started saying something new: a request that wrote to a column that does not
   exist comes back with `unwritten`, because a save that saved nothing must not report success.

   Handled here, once, so no caller has to know. Anything that reaches the `.then` of `send()` has
   genuinely worked; anything else lands in the `.catch` with a sentence worth showing.
--------------------------------------------------------------------------------------------- */
/**
 * ONE REQUEST, BUILT IN ONE PLACE.
 *
 * Called `api` rather than `post`, because `post` is a NOUN in this app before it is a verb — a
 * photograph with a caption — and three handlers already hold one in a local variable of exactly
 * that name. A shadowed function is a "post is not a function" thrown from a line that looks
 * correct, which is what happened the moment this was introduced.
 *
 * Every call to the backend carried its own copy of the method, the cache policy and the JSON
 * encoding — twenty-one copies of four lines, which is twenty-one places to edit the day any of
 * them has to carry a header, a timeout, a retry, or a queue for when the phone is offline. None
 * of that exists yet; all of it becomes one edit from here rather than twenty-one.
 *
 * IT DOES NOT THROW ON A REFUSAL. That was the tempting version, and it would have meant rewriting
 * every caller's reply handling by hand — most of them already read `d.error` and say something
 * specific about it, which is better than a generic catch. The reply comes back as it came.
 */
/* ==================================================================================================
   WHAT ACTUALLY WENT WRONG, IN WORDS, WHERE THEY CAN BE READ AND COPIED.

   "COULD NOT REACH THE SERVER" WAS PRINTED BY NINE CALL SITES and was true at none of them. Every
   one was written `.catch(() => …)` — a catch that ignores its own argument — so the message the
   backend had already sent was thrown away and replaced with a guess. `doPost` has always ended
   `catch (err) { return jsonOut({ error: err.toString() }) }`, so the real sentence was in hand
   every single time and never shown.

   FOUR DIFFERENT FAULTS LOOKED IDENTICAL: no signal, a backend that threw, a deployment serving
   old code, and an action the backend has never heard of. Each needs a different thing done about
   it and none of them was named.

   ---------- AND IT PUT EVERY ONE OF THEM IN THE BANNER, WHICH WAS WRONG ------------------------
   THE ARGUMENT WAS *"the line under a button is where somebody looks; the banner is where text can
   be selected and pasted to somebody who can fix it. Both, from one place."* That is right about a
   DIAGNOSTIC and wrong about a REFUSAL, and this function could not tell them apart.

   REPORTED AS *"I don't like how name or pin not recognised is a banner. It should be like the
   other pop ups that come up at the bottom of screen."* Measured: typing the wrong PIN puts a gold
   bar across the top of the app — **and it is still there after you sign in correctly.** Nothing
   clears it. `banner('')` is called in exactly two places, the `retry` handler and `load()` when
   the load was slow, so a wrong PIN is an alarm for the rest of the session on every screen.

   That is the complaint this repository already recorded once and half-fixed: *"the name or PIN
   not recognised doesn't disappear after i just logged in correctly"*. The fix went onto the faint
   line under the button, with a note calling itself *"belt and braces rather than the only thing
   standing between the two"* — and the thing it thought it was bracing was itself. The loud copy
   was never touched.

   IT IS A DUPLICATE AT EVERY CALLER, WHICH IS WHAT SETTLES IT. Measured across the thirteen: eight
   are `toast(why_(err))` and five write the sentence into a line under their own button. Every one
   already has somewhere to say it, so the banner was never the only copy anywhere — it was a
   second one, at alarm volume, that outlived the thing it was about.

   THE BANNER IS FOR A STANDING CONDITION and the calls that raise it directly are all of that
   shape: the sheet is missing columns, the questions did not load, a newer build is ready, a file
   did not arrive. Each is true until something changes, so persisting is the point. A failed
   action is a MOMENT, and a moment belongs in a toast. */
function why_(err) {
  const msg = String((err && err.message) || err || '').trim();
  /* A GENUINELY UNREACHABLE SERVER IS THE ONE CASE THE OLD SENTENCE WAS RIGHT ABOUT. `fetch`
     rejects with a TypeError and no useful text when there is no connection at all, which is the
     only time nothing better can be said. */
  if (msg && !/^(TypeError|Failed to fetch|NetworkError|Load failed)/i.test(msg)) return msg;
  /* "NO CONNECTION" WAS SAID TO A PHONE THAT HAD ONE. Reported with a screenshot of a Save on the
     Photos page: the thumbnails beside it had just loaded from Google, so the phone was online, and
     the sentence sent the reader to their Wi-Fi. `fetch` rejects with the same bare TypeError ("Load
     failed" on an iPhone) for a phone that is offline AND for a server that answered with something a
     browser will not hand over — Apps Script's own error page when the script cannot run or is over a
     quota, or a request it gave up on. Only `navigator.onLine` can tell those apart from here, and it
     is honest in one direction: false means offline. True means the server is the likelier half. */
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  return offline
    ? 'No connection — this phone is offline. Nothing was saved.'
    : 'The server did not answer, so nothing was saved. Try again in a minute.';
}

/* `opts.keepalive` — a request the browser finishes after the page has gone, for the last answers sent as
   an iPad's cover closes (`answersPush_` in js/answers.js). Nothing else passes it. */
function api(body, opts) {
  /* ---------- THE TOKEN GOES ON EVERY REQUEST, FROM ONE PLACE ------------------------------------
     ADDED HERE BECAUSE EVERY WRITE IN THE APP COMES THROUGH THIS FUNCTION. Threading it through
     forty call sites would mean forty chances to forget one, and the one forgotten is a feature
     that stops working for everybody signed in — or worse, a handler that falls back to trusting a
     name because that is what it was given.

     A REQUEST WITH NO TOKEN IS STILL SENT. Registering and signing in have none by definition, and
     the gate decides which actions need one. */
  const b = Object.assign({}, body);
  if (!b.token && typeof USER === 'object' && USER && USER.token) b.token = USER.token;
  return fetch(API, Object.assign({ method: 'POST', cache: 'no-store', body: JSON.stringify(b) },
                                  opts && opts.keepalive ? { keepalive: true } : {}))
    /* ---------- A REPLY THAT IS NOT JSON IS STILL A REPLY -------------------------------------
       `r.json()` ON AN APPS SCRIPT ERROR PAGE THROWS `Unexpected token '<'`, which is how a
       perfectly clear server-side error — a missing column, a bad id, a permission — arrived on
       the phone as a parse failure and got reported as no connection. Apps Script answers an
       uncaught throw with an HTML page saying exactly what happened, and that page was being
       binned unread.

       SO THE TEXT IS READ FIRST AND PARSED SECOND. If it is JSON, nothing changes. If it is not,
       the human sentence is dug out of the HTML and raised as the error — which is the difference
       between "could not reach the server" and the name of the function that threw. */
    .then(r => r.text().then(txt => {
      try { return JSON.parse(txt); } catch (e) {}
      const m = txt.match(/<div[^>]*>([^<]{10,400})<\/div>/i)
             || txt.match(/>\s*(TypeError|ReferenceError|Exception|Error)([^<]{0,300})</i);
      const said = m ? (m[1] + (m[2] || '')).replace(/\s+/g, ' ').trim()
                     : txt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
      throw new Error('Backend: ' + (said || ('HTTP ' + r.status)));
    }))
    .then(d => {
      /* A value the sheet had nowhere to put. The server turns this into an error where it can, so
         reaching here means it could not — a read that wrote, or a reply with no `success` to take
         away. Rare, and worth a word rather than nothing. */
      if (d && d.unwritten && d.unwritten.length) {
        banner('Some values were not saved: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + ' — those columns are not in the sheet.');
      }
      /* ---------- A SESSION THE SERVER HAS ENDED IS ENDED HERE TOO ---------------------------------
         `why: 'signed-out'` IS THE GATE SAYING THE TOKEN IS NO GOOD — expired after thirty days,
         ended by a PIN change on another phone, or from before sessions moved off the sheet. Every
         request after it would be refused with "Please sign in again." under a screen that still
         shows somebody signed in, which reads as the app being broken rather than as a sign-in to
         do. So the phone forgets the account the way Sign out does, once, and says why. A code rather
         than the sentence, so a reworded refusal cannot turn this off. */
      /* THROUGH `signedOut_` (me.js), THE ONE WAY OUT — this branch cleared `USER` and nothing else, so
         the person's inbox, stars and done dates outlived a session the server had already ended.
         `ended`, BECAUSE NOBODY LEFT: the person is still holding the phone, often mid-question — the
         refusal is usually the answer they just typed going up — so Find keeps its place for them to sign
         in again to (docs/history/318). Everything else of theirs goes, as for Sign out. */
      if (d && d.why === 'signed-out' && typeof USER === 'object' && USER && USER.token === b.token) {
        /* WHOSE SESSION IT WAS, read before it is forgotten — see `ansGoneSay_` (answers.js): the box
           that person wrote in is drawn empty under the signed-out key now, and says why (317). */
        const gone = typeof whoIs_ === 'function' ? whoIs_() : '';
        if (typeof signedOut_ === 'function') { try { signedOut_({ ended: true }); } catch (e) {} }
        else { USER = null; try { localStorage.removeItem('familyUser'); } catch (e) {} try { repaint(); } catch (e) {} }
        /* THROUGH `ansRecPut_`, held for the visit when the store refuses or throws: without it a
           browser keeping no site data never knew whose the next answer was (review of the merge). */
        try {
          const rec = gone ? JSON.stringify({ who: gone, at: Date.now() }) : '';
          if (rec && typeof ansRecPut_ === 'function') ansRecPut_('familyGone', rec);
          else if (rec) localStorage.setItem('familyGone', rec);
        } catch (e) {}
        try { if (typeof ansSavedPaint_ === 'function') ansSavedPaint_(); } catch (e) {}
        toast('Signed out — please sign in again');
      }
      return d || {};
    });
}

/** The same request, refusing to resolve on a refusal — for callers that would rather catch. */
function send(body) {
  return api(body).then(d => {
    /* ---------- AN ACTION THE LIVE BACKEND HAS NEVER HEARD OF -------------------------------------
       "THAT ACTION IS NOT RECOGNISED" IS THE WRONG SENTENCE. It reads as "you did something wrong",
       and nine times out of ten it means "the .gs file has not been pasted in yet" — a fault in a
       deploy step, not in anything the person just pressed. The payload has advertised `features`
       since before the rewrite and nothing ever read it, so the app had the answer all along and
       never used it.
       Now it says which, and which version is live, so the next move is obvious. */
    if (d && d.error && /unknown action|not recognis/i.test(String(d.error))) {
      const act = (String(d.error).match(/:\s*(\w+)/) || [])[1] || 'that action';
      const has = (DATA.features || []).indexOf(act) !== -1;
      throw new Error(has
        ? act + ' is not working — the backend knows it but returned an error'
        : 'The backend does not have `' + act + '` yet. Paste the newest .gs files into Apps '
          + 'Script and deploy. Live version: ' + (DATA.version || 'unknown'));
    }
    /* THE WHOLE REPLY RIDES ON THE ERROR. A refusal is a sentence for a person and sometimes a fact
       for the code as well — `sendMessage` says `why: 'files'` when only the photographs stood in
       the way, and the bubble offers "Words only" on that and nothing else. Recognising the
       sentence instead would turn a rewording on the server into a button that silently vanishes. */
    if (d && d.error) { const e = new Error(d.error); e.reply = d; throw e; }
    return d;
  });
}

/* ---------- SAYING SOMETHING BRIEFLY ------------------------------------------------------------ */
let toastTimer = null;
function toast(msg) {
  let el = $('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

/* ---------- ONE CLICK HANDLER -------------------------------------------------------------------
   Delegated from the document, so markup can be replaced without rewiring anything. A screen emits
   `data-do="something"` and handles it here; nothing ever attaches its own listener to a card that
   is about to be thrown away.
--------------------------------------------------------------------------------------------- */
const ACTIONS = {};
/** Register what a `data-do` means. */
/* EVERY ACTION MOVES `ACT_EPOCH` (see the note over `STALE`): a press is what can edit a column in place,
   and a column edited in place must not be kept by a landing on the grounds that its markup is the same. */
function on(name, fn) {
  ACTIONS[name] = function () { ACT_EPOCH++; return fn.apply(this, arguments); };
}

/* Asking again. A failure that offers no way to retry costs a whole page reload, and on a phone a
   reload is the thing most likely to lose whatever was half-typed on another screen. */

/* Asking again. A failure that offers no way to retry costs a whole page reload, and on a phone a
   reload is the thing most likely to lose whatever was half-typed on another screen. */
on('retry', () => { LOADED = false; LOAD_FAILED = ''; LIBRARY_FAILED = '';
  /* THE LIBRARY IS MEMOISED and `Try again` has to actually try again: `libraryRows_`
     returns `LIBRARY_ROWS` untouched once it is set, so leaving the empty array in place
     would make the button repaint the same failure for ever. */
  LIBRARY_ROWS = null;
  banner(''); splashOn_(); repaint(); load(); });

/* CARDS OPEN A SHEET, and an attempt to open them in place has been taken out again.

   The idea was sound and the reason for it still holds — a sheet is for a task, and reading a thing
   you just tapped is not a task. What went in was not: the detail replaced the card's own pane, so
   it had to be remembered, restored, and put back on every move — three states where there had been
   one, and every one of them a way for a card to come back wrong.

   The sheet has none of that. It is one surface, it is over everything, and closing it leaves what
   was underneath exactly as it was because nothing underneath was touched.

   If it is worth doing again it wants a different shape: a page of its own that the grid navigates
   to, rather than a pane rewritten in place. Then going back is a swipe, which the grid already
   knows how to do, and there is no state to keep. */


/* ---------- WHAT HAPPENED WHEN YOU PRESSED THAT ---------------------------------------------------
   Type `clicks()` in the console and press something. Every press then prints what this handler
   actually saw: what was under your finger, the nearest thing carrying a `data-do`, whether a
   handler is registered for it, and whether it ran.

   IT EXISTS BECAUSE GUESSING HAS COST FOUR ROUNDS. "Nothing happens when I click" has exactly four
   causes and they need completely different fixes:

     the scripts never loaded        — no listener at all, so nothing prints
     nothing carries a `data-do`     — the press lands on plain markup
     it does, and no handler is on   — the name in the markup and the name in `on()` disagree
     the handler ran and did nothing — the fault is inside it

   From the outside all four look identical. This says which, in one line, without anybody having
   to read a file. Off unless asked for, so it costs nothing. */
let CLICK_LOG = false;
function clicks(on) {
  CLICK_LOG = (on === undefined) ? !CLICK_LOG : !!on;
  console.log(CLICK_LOG
    ? 'Watching presses. Tap something. `clicks(false)` to stop.'
    : 'Stopped watching presses.');
  return CLICK_LOG;
}

/* ---------- A SWIPE IS NOT A PRESS, AND THE BROWSER CANNOT TELL ----------------------------------
   REPORTED AS "if i scroll down far enough then scroll back up eventually the widgets above
   disappear". They did not disappear. **Every swipe was pressing whatever it started on.**

   Measured: twenty-five downward drags on the Find screen, each starting on an answer row. The
   page never moved. What happened instead was `facet-pick`, `facet-pick`, `facet-pick` — three
   more questions answered, the list narrowed from 5,333 results to 4 and then to the funnel's
   first question with nothing behind it. The column had not scrolled; it had been emptied.

   THE BROWSER FIRES A CLICK AFTER A DRAG, on the nearest common ancestor of where the finger went
   down and where it came up. That is correct and unavoidable — `pointerup` does not cancel it, and
   nothing here was asking it to.

   `overworld.js` RECORDS WHY THE OBVIOUS GUARD IS NOT THERE. `setPointerCapture` was tried, and it
   sent every release to the root so that no card, chip or tick ever answered — "nothing threw, the
   app rendered perfectly and simply stopped answering". Removing it was right, and it left the
   opposite case unhandled: a press that should not have counted.

   SO THE FINGER'S OWN TRAVEL DECIDES. Past the same ten pixels the grid uses to tell a drag from a
   wobble, the gesture is a drag and the click it produces is swallowed. Set in `pointermove`
   BEFORE the axis is chosen, so a drag the grid refuses — a textarea scrolling, a pad being drawn
   on — still counts as a drag rather than becoming a press.

   IT IS CLEARED BY THE PRESS IT SWALLOWS, and again by the next `pointerdown`, so a gesture that
   ends without a click cannot eat the tap after it. */
let PRESS_MOVED = false;
/* AND A PRESS THAT BEGAN ON A CARD STILL SLIDING — see `SLIDE_UNTIL` above `placeGrid`. Decided at
   `pointerdown`, because that is when the finger chose what to touch; cleared by the click it
   swallows and by the next `pointerdown`, exactly as `PRESS_MOVED` is. */
let PRESS_SLIDING = false;

/* ==================================================================================================
   THE THING YOU PRESSED STAYS LIT UNTIL THE SCREEN HAS ANSWERED.

   REPORTED AS *"make the button pressing feel more responsive on the finder"*, and measured before
   anything was changed: at 8x CPU — an ordinary phone — answering one of the funnel's questions is
   **130 ms from the finger lifting to the screen having changed**. `:active` ends at the LIFT. So
   what a tap actually looks like is a brief flash, then an eighth of a second of a screen identical
   to the one you were just looking at, and only then the answer. That gap is the whole complaint:
   nothing on the phone says the tap landed.

   AND ON THE OWNER'S PHONE THERE MAY BE NO FLASH AT ALL. `:active` on touch is a browser heuristic
   rather than a rule — it is withheld until the gesture is known not to be a scroll, and Safari has
   historically wanted a touch listener on the element itself. Every listener this app has is on the
   WINDOW. So the one piece of feedback a press had was the piece nothing here can test, on the one
   platform this environment cannot reach.

   A CLASS DOES NOT DEPEND ON ANY OF THAT. It goes on at `pointerdown`, which has already happened
   by the time a browser is deciding what the gesture is, and it comes off two frames after the
   handler has run — by which time either the screen has changed or the markup carrying it has been
   replaced. So the lit state covers exactly the window the complaint is about.

   ---------- IT IS NOT A SECOND PRESS STATE, IT IS THE SAME ONE -----------------------------------
   `.is-pressed` is added to the `:active` selectors that already exist rather than given rules of
   its own — see `.row.tap.counted:active` in style.css. Two descriptions of one look is the fault
   this repository records under `.reel .over`, and here they would sit on the same element a tenth
   of a second apart, which is the version that gets noticed.

   A CONTROL WITH NO `:active` RULE IS UNCHANGED, and that is deliberate: the mark is on every
   control in the app and the stylesheet decides which of them show it, exactly as `:active` does.

   ---------- WHAT CLEARS IT, AND THE ONE THAT IS NOT OPTIONAL -------------------------------------
   THE DRAG. `PRESS_MOVED` is set the moment a finger travels ten pixels, and a swipe that began on
   an answer must not leave that answer lit for the length of the gesture — it would read as the row
   being held down while the column slides under it. Cleared at the same line, so there is one place
   that decides a press has become a drag.

   AND A TIMEOUT BEHIND ALL OF IT, because a mark that is never cleared is a control that looks
   permanently pressed, and the cost of one wrong clear is nothing. */
let PRESSED = null;
let PRESSED_OFF = 0;

function pressMark_(t) {
  pressClear_();
  /* THE NEAREST THING THAT ACTS, not the exact target — pressing a word inside a card lights the
     card, which is the same rule `SHEET_FROM` follows for where a sheet grows from. */
  const el = t && t.closest && t.closest('[data-do], .tab');
  /* NOT A DISABLED CONTROL. A disabled button never fires the click whose handler would clear the
     mark, so it stayed lit for the length of a swipe that began on it — the camera's shutter while
     the camera is starting was the one `check/press.js` caught. */
  if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
  PRESSED = el;
  el.classList.add('is-pressed');
  PRESSED_OFF = setTimeout(pressClear_, 1200);
}

function pressClear_() {
  clearTimeout(PRESSED_OFF);
  if (PRESSED) { try { PRESSED.classList.remove('is-pressed'); } catch (e) {} }
  PRESSED = null;
}

/* TWO FRAMES, NOT ONE. A handler that repaints does its work synchronously and the browser paints
   it on the NEXT frame; clearing on the first would take the mark off before the answer it is
   covering for has been drawn, which is the gap this exists to fill, one frame shorter. */
function pressDone_() {
  requestAnimationFrame(() => requestAnimationFrame(pressClear_));
}

addEventListener('pointerdown', e => {
  if (!e.isPrimary) return;
  if (e.pointerType === 'mouse' && e.buttons !== 1) return;
  /* THE LAST 60ms ARE LET THROUGH — by then the card has all but arrived. AND ONLY ON THE CARDS: the
     sheet, its backdrop and the keypad are not in `#screen` and do not move with it. The first version swallowed any tap during a slide, and `check/press.js` caught it
     closing nothing — a tap on a sheet's backdrop opened over a column still sliding in. */
  PRESS_SLIDING = performance.now() < SLIDE_UNTIL - 60
    && !!(e.target && e.target.closest && e.target.closest('#screen'));
  /* AND NOTHING IS LIT UNDER A FINGER THAT IS CATCHING A MOVING CARD rather than pressing it. */
  if (PRESS_SLIDING) { pressClear_(); return; }
  pressMark_(e.target);
}, { passive: true, capture: true });
addEventListener('pointercancel', pressClear_, { passive: true });
/* A FIELD ON THE CARD IN FRONT TAKING FOCUS, OR A SELECT OR A BOX CHANGED ON IT, HOLDS IT TOO — see
   `HOLD_AT`. A box that grows as you type grows downward, and the line you are typing on stays put.
   `change` as well as `focusin` because a select's answer arrives from the platform's own list, which
   is not on the card, and a checkbox is answered by a tap that may never focus it. */
document.addEventListener('focusin', e => holdHere_(e.target), true);
document.addEventListener('change', e => holdHere_(e.target), true);

/* ---------- ON A WIDE WINDOW, PRESSING A CARD BESIDE THE ONE IN FRONT BRINGS IT TO THE FRONT -------
   A wide window shows whole screens either side (THE GRID SHOWS MORE OF ITSELF), and a card you can
   read is a card you will reach for. They still take no presses of their own — `placeGrid` leaves
   `pointer-events: none` on every card but the one in front — so a press over one lands on the
   column or on `#screen` behind it, and THIS asks which card was drawn there. By the boxes rather than
   by `elementFromPoint`, because the thing being asked about is exactly the thing that does not take
   pointer events.

   AND THE PRESS GOES NO FURTHER THAN THAT. Pressing a star on a card that is still beside the one
   in front would star a card that is about to slide under the pointer; arriving first and pressing
   second is the carousel every reader already knows, and it is also what keeps every handler in the
   app answering for the card in front only, which is what all of them were written to assume.

   A SWIPE THAT ENDS OVER ONE IS NOT A PRESS — `PRESS_MOVED`, the same flag the click handler below
   reads; this one runs first (window, capture) and leaves it for that one to clear. */
function wideHit_(x, y) {
  if (!WIDE) return null;
  const pages = document.querySelectorAll('#screen > .screen > .page');
  for (const pg of pages) {
    if (pg.classList.contains('on') || pg.style.visibility === 'hidden') continue;
    const host = pg.parentElement;
    if (!host || host.style.visibility === 'hidden' || host.style.opacity === '0') continue;
    const r = pg.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    const id = host.id.replace(/^s-/, '');
    if (!TABS.some(t => t.id === id)) continue;
    const pos = Array.prototype.indexOf.call(host.querySelectorAll(':scope > .page'), pg);
    return { id: id, p: logIndex_(id, pos), el: pg };
  }
  return null;
}
addEventListener('click', e => {
  if (!WIDE || PRESS_MOVED || PRESS_SLIDING) return;
  /* ---------- A CLICK WITH NO POINTER UNDER IT IS NOT A PRESS BESIDE THE CARD -------------------
     `e.detail` IS HOW MANY TIMES A POINTER PRESSED, and it is 0 for the two clicks no pointer made:
     Enter or Space on a focused control, and `el.click()` from code. Both arrive with clientX and
     clientY at 0,0 — not where anything was pressed, just the top-left corner of the window — and
     this handler read that corner as a place, asked `wideHit_` which card was drawn there, and
     brought it to the front.

     FOUND AS EIGHT SETTINGS STATES "NOT MEASURED" AT 768, and only in a full run of check/ui.js:
     green with `--screen=settings`, green in either `--part`. The states turn a page and click a
     control on it in the same tick, before the placement that marks that page `.on` — so the click
     was "not on the card in front", and 0,0 at 768 is inside You, the column left of Settings.
     Alone, You is on its first page and nothing of it covers that corner; after You's own states
     have left it a page down, the page above does, and the first click sent the app to You. Every
     Settings state after it measured a column that was no longer in front.

     AND A PERSON CAN DO IT WITH A KEYBOARD, which is what makes it the app's and not the lab's:
     Tab past the last control on the card in front, into the next card down (drawn, so tabbable),
     and press Enter — measured at 768 with You a page down: `click x0 y0 detail0`, and Settings
     swapped for You's first page. A keyboard press has a target and no position; the target's own
     handler answers it, exactly as it does on a phone. */
  if (!e.detail) return;
  const t = e.target;
  /* ONLY A PRESS THAT NOTHING IN FRONT TOOK — on the front card it is that card's press. */
  if (t && t.closest && t.closest('#screen .page.on')) return;
  if (!(t && t.closest && t.closest('#screen'))) return;
  const hit = wideHit_(e.clientX, e.clientY);
  if (!hit) return;
  try {
    /* THE PAGE FIRST, while its column is still beside: `goPage` on a column not in front only
       records where it is and places it, and `go` then slides the whole grid once. */
    if (PAGER[hit.id] && hit.p !== (PAGE[hit.id] || 0)) goPage(hit.id, hit.p);
    if (hit.id !== AT) go(hit.id, true);
  } catch (err) { /* a press that moved nothing is the behaviour before this existed */ }
}, true);

/* AND THE POINTER SAYS SO BEFORE THE PRESS. One rect test a frame while a mouse moves over the grid,
   and only on a wide window: the card under it comes half into focus (`.wide-over` in style.css)
   and the pointer becomes a hand, which is how a desktop says "this can be pressed". */
let WIDE_OVER = null, WIDE_OVER_F = 0;
addEventListener('pointermove', e => {
  if (!WIDE || e.pointerType !== 'mouse' || WIDE_OVER_F) return;
  const x = e.clientX, y = e.clientY;
  WIDE_OVER_F = requestAnimationFrame(() => {
    WIDE_OVER_F = 0;
    const onFront = document.elementFromPoint(x, y);
    const hit = onFront && onFront.closest && onFront.closest('#screen .page.on') ? null : wideHit_(x, y);
    const el = hit ? hit.el : null;
    if (el === WIDE_OVER) return;
    if (WIDE_OVER) WIDE_OVER.classList.remove('wide-over');
    WIDE_OVER = el;
    if (el) el.classList.add('wide-over');
    const scr = $('screen');
    if (scr) scr.style.cursor = el ? 'pointer' : '';
  });
}, { passive: true });
/* ---------- LEAVING A WIDE WINDOW TAKES THE HAND AWAY ---------------------------------------------
   THE LISTENER ABOVE IS THE ONLY THING THAT WRITES THE CURSOR, and it returns at once when the
   window is not wide — so a window snapped or zoomed below `WIDE_FROM` with the mouse resting on a
   side card (Win+Left on a 1280 screen, Ctrl+Plus to 200%; neither moves the mouse) kept
   `cursor: pointer` on `#screen` for the rest of the session: a phone layout with a hand over plain
   text, every word looking pressable. Found by the review of 6 October. Cleared by `wideSet_` the
   moment the window stops being wide, which is where the state stops meaning anything. A hover
   frame already booked is harmless: `wideHit_` answers nothing on a narrow window, so it clears too. */
function wideOverClear_() {
  try {
    if (WIDE_OVER) WIDE_OVER.classList.remove('wide-over');
    WIDE_OVER = null;
    const scr = $('screen');
    if (scr) scr.style.cursor = '';
  } catch (e) { /* before this file has finished loading there is nothing to clear */ }
}

/* ---------- A SWIPE THAT BEGAN ON A FIELD OPENS NOTHING AND TICKS NOTHING -------------------------
   THE GUARD BELOW SWALLOWS A SWIPE'S CLICK — `stopPropagation`, so no handler of this app runs — and
   that is all it ever had to do while every control here was a `data-do`. A FORM'S CONTROLS ARE THE
   BROWSER'S, AND THE BROWSER ACTS ON THE DEFAULT, NOT ON A HANDLER: a select opens its list from the
   `mousedown` a phone sends at the lift of a tap, a `<label>` focuses its select (which is what an
   iPhone opens its wheel for) or ticks its checkbox from the click. A drag of ten to fifteen pixels is
   a swipe to this app and can still be a tap to the browser, and note 226 measured exactly that: a
   12–14px drag ending on a select's caption ran the label's activation.

   SO ON A FIELD, THE DEFAULT IS CANCELLED TOO — the `mousedown` here, before the select can open, and
   the click in the guard below, before a label can act. Only while the gesture is a swipe or began on
   a card still sliding; a tap that stayed put reaches the select exactly as the platform intends.
   This is what lets a swipe that starts on a dropdown move the column (`axisFree`, overworld.js)
   without the dropdown opening under the finger as it lifts. Note 315 has the measurements.

   AND A `<summary>`, which opens its `<details>` from the click's default exactly as a label ticks its
   box — the settings column's several-of-a-list field is one. Found by review on 9 October with real
   touch: a 12px drag starting on the venues field logged `click:SUMMARY, TOGGLE:open`, the guard having
   swallowed the click and the browser opening the list anyway, so a thumb starting a scroll there
   pushed the card down. The ticks under it were already guarded, as labels. */
const FIELD_ACTS_ = 'select, label, summary, input[type="checkbox"], input[type="radio"]';
addEventListener('mousedown', e => {
  if (!PRESS_MOVED && !PRESS_SLIDING) return;
  if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
}, true);

document.addEventListener('click', e => {
  /* FIRST, because a swipe that ends on a tab must not change tab either. */
  if (PRESS_MOVED) {
    PRESS_MOVED = false;
    PRESS_SLIDING = false;
    pressClear_();
    /* AND ON A FIELD, NOT EVEN THE BROWSER'S OWN DEFAULT — see `FIELD_ACTS_` above. */
    if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
    if (CLICK_LOG) console.log('[click] swallowed — the finger moved, so this was a swipe');
    return;
  }
  /* A TAP ON A CARD STILL GLIDING STOPS NOTHING AND PRESSES NOTHING — see `SLIDE_UNTIL`. */
  if (PRESS_SLIDING) {
    PRESS_SLIDING = false;
    pressClear_();
    if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
    if (CLICK_LOG) console.log('[click] swallowed — it began on a card still sliding');
    return;
  }
  pressDone_();
  if (CLICK_LOG) {
    const d = e.target.closest('[data-do]');
    console.log('[click]', {
      pressed: e.target.tagName + (e.target.className ? '.' + String(e.target.className).split(' ')[0] : ''),
      nearestAction: d ? d.dataset.do : '(nothing carries a data-do)',
      handlerRegistered: d ? !!ACTIONS[d.dataset.do] : false,
      /* A select or a checkbox is deliberately handled by `change` instead, so "no handler ran" is
         the right answer for those and not a fault. */
      handledByChange: !!(d && (d.tagName === 'SELECT' || d.type === 'checkbox')),
    });
  }
  /* A PRESS ON THE CARD IN FRONT HOLDS IT WHERE IT IS, before the handler below changes it — see
     `HOLD_AT`. After the two swallows above, because a swipe is not somebody using the card. */
  holdHere_(e.target);
  const tab = e.target.closest('.tab');
  if (tab) { go(tab.dataset.tab); return; }

  if (e.target.closest('#sheet-close') || e.target.id === 'sheet-back') { closeSheet(); return; }

  const doer = e.target.closest('[data-do]');
  /* THE CARD, remembered for the length of this press. If a handler opens a sheet, it grows out of
     whatever was pressed; if none does, this is cleared on the next press and nothing has happened.
     The visible CARD rather than the exact target, so pressing a word inside a card opens from the
     card and not from the word. */
  /* `.pass` WAS IN THIS LIST and the class no longer exists — a person is `.card.is-widget` now,
     which the first entry already catches. See `findCard`. */
  SHEET_FROM = e.target.closest('.card, .rc, .rc-stub, .paper, .slip, .post, .thing') || doer;
  /* A SELECT AND A CHECKBOX SPEAK THROUGH `change`, NOT `click`.
     A click on a select is the dropdown OPENING — its value is still the old one — so running the
     handler here fired every action with a stale answer and then redrew the markup out from under
     the list the person had just opened. Three finding controls did nothing at all, silently,
     which is the same failure as every entry on the list in the notes.
     They are refused here and picked up by the `change` listener further down. */
  if (doer && (doer.tagName === 'SELECT' || doer.type === 'checkbox')) return;
  if (doer && ACTIONS[doer.dataset.do]) {
    /* CAUGHT HERE, WHERE THE MESSAGE STILL EXISTS.
       Almost everything this app does runs from this one line, and an error escaping it reaches
       the window — where a browser serving from file:// reports it as "Script error." with no
       message, no file and no line, because it treats every local script as cross-origin. A real
       fault becomes two words that could mean anything.
       Caught, it keeps its message and names the action that produced it, which is the difference
       between "Script error." and "react — Cannot read properties of null". */
    try {
      ACTIONS[doer.dataset.do](doer, e);
    } catch (err) {
      console.error('[' + doer.dataset.do + ']', err);
      toast(doer.dataset.do + ' — ' + String((err && err.message) || err));
    }
  }
});

/* Swiping between tabs is further down, with the gesture handling it belongs to — I wrote a
   second, cruder version here before noticing the first. The one that survives follows the finger
   and resists at the ends; this one only decided after the fact. */

/* Escape closes the sheet, for anybody on a keyboard. Costs one line and is the first thing
   somebody tries. */
/* ---------- THE ARROW KEYS ------------------------------------------------------------------------
   The grid is a grid, and a grid is the one shape arrow keys already mean something on. Somebody at
   a keyboard has been able to swipe with a mouse and not to press right — which on a screen laid
   out in columns and rows is the obvious thing to try first.

   THE SAME MOVES A SWIPE MAKES, not their own path: `AXES` already holds what a direction means and
   `ax.go` already handles the ends, the animation and the remembering. A second way in that did its
   own arithmetic would be a second thing to keep in step, which is how the two axes came apart in
   the first place.

   NOT WHILE SOMEBODY IS TYPING. An arrow key in a search box moves the caret, and stealing it to
   turn a page is the app deciding it wanted the keystroke more than the person did. A sheet is the
   same case: it is over the grid, so the grid is not what the keys are for. */
const ARROWS = { ArrowLeft: ['x', -1], ArrowRight: ['x', 1],
                 ArrowUp: ['y', -1], ArrowDown: ['y', 1] };

addEventListener('keydown', e => {
  /* ESCAPE SHUT `#drop` FIRST while there was one. A select's own list is the platform's, and the
     platform closes it on Escape before this page ever hears the key; a list of checkboxes in a card
     is not over anything, so there is nothing for Escape to close but the sheet. */
  if (e.key === 'Escape' && !$('sheet').classList.contains('hidden')) { closeSheet(); return; }

  const arrow = ARROWS[e.key];
  if (!arrow) return;
  /* A modifier means the key belongs to the browser — ⌘← is back, alt+arrow is word-by-word. */
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  /* Typing, or anywhere a caret could be. `isContentEditable` catches the cases a tag name does
     not, which is the sort of thing a list of tag names quietly misses. */
  const t = e.target;
  if (t && (t.isContentEditable
    || /^(input|textarea|select)$/i.test(t.tagName || ''))) return;
  /* The sheet is over the grid; while it is open the grid is not what these are for. */
  if (!$('sheet').classList.contains('hidden')) return;

  const ax = AXES[arrow[0]];
  if (!ax || ax.count() < 2) return;
  e.preventDefault();
  ax.go(ax.at() + arrow[1]);
});

/* THE EDGES OF THE SCREEN were tappable from here — a second `click` listener that turned to the
   next card when you pressed the sliver either side.

   REMOVED, because it was a SECOND click listener on the document. Everything this app does runs
   through one, and the whole reason that is true is so there is one place where a press is decided.
   A second one meant two things reading every press and each having to be careful not to take one
   meant for the other — and being careful is not the same as being unable to get it wrong.

   The arrow keys stay: a key is not a press and cannot be confused with one. */



/* ---------- LOADING ------------------------------------------------------------------------------ */
/* ==================================================================================================
   WHAT THE APP IS MADE OF WHEN THE BACKEND SAYS NOTHING.

   REPORTED AS "the loading is taking forever. surely, it shouldnt take long anymore as its pulling
   info from live file not from appscript anymore." That is exactly right and it was not what
   happened. Measured with the backend hanging and a student signed in from a previous visit:
   **60.8 seconds of splash, and then a library of ZERO questions.**

   THE CAUSE IS ONE `if`. `libraryInto_`, `libraryExtras_` and `settingsInto_` all sat inside
   `if (d && !d.error)`, so the four thousand nine hundred questions, the practicals, the brand,
   the facets and the columns -- every one of them a FILE in this repository, fetched in parallel
   with the payload and usually landed long before it -- were merged onto the payload or not at
   all. A backend that answered slowly did not delay the library; it deleted it.

   SO THE FILES STAND ON THEIR OWN. They are not the payload's luggage: they are the thing the app
   is mostly made of, and the payload is the business on top of them. This is the same rule the
   files already carry one level down -- `libraryExtras_` and `settingsInto_` leave a key alone
   when their file has no rows -- pointed at the other failure: a file with rows should win over a
   payload that never came.

   WHAT IS STILL LOST WITHOUT THE BACKEND, said rather than implied: people, jobs, prices, the
   shop, posts and messages. A student's paper, their answers, the marking and the mark schemes are
   all here, because all of them are a file or the device's own storage.

   IT NEVER OVERWRITES A GOOD PAYLOAD. `load()` runs again on every retry and every sign-in, so a
   failure after a success must not empty what is already standing -- which is the `|| []` fault
   this file records under `nothingHere`, wearing the other coat. */
async function filesOnly_() {
  try {
    if (DATA && DATA.questions && DATA.questions.length) return;
  } catch (e) { return; }
  const d = {};
  try {
    libraryInto_(d, await libraryRows_());
    const extra = await libraryExtraRows_();
    libraryExtras_(d, extra);
    settingsInto_(d, extra);
    try { splashSync_(d, extra); } catch (e) {}
  } catch (e) {}
  /* THE SAME THREE REPAIRS THE PAYLOAD PATH MAKES, because every reader downstream expects them
     and an absent `checklists` is a throw rather than an empty screen. */
  d.questions = d.questions || [];
  d.dropdowns = d.dropdowns || {};
  d.dropdowns.checklists = d.dropdowns.checklists || {};
  /* A PLAIN OBJECT, NOT THE PROXY. The proxy records every key nothing sent so `missingKeys()` can
     name them, and on this path NOTHING was sent -- it would report the whole payload as missing
     on a load where that is already the headline. */
  DATA = d;
  /* THE COLUMNS AND THE ICON ARE IN `data/settings/`, so they are knowable here and are the two
     things that decide what the app looks like before anything is drawn. */
  try { applyColumns_(); } catch (e) {}
  try { applyBrandIcon_(); } catch (e) {}
}

/* The boot reply as JSON, or an error whose message says what arrived instead. See the note in
   `load()` where it is called; `not valid JSON` is the phrase `load()`'s banner listens for. */
async function bootJson_(res) {
  if (!res || typeof res.text !== 'function') return res.json();
  const body = await res.text();
  try { return JSON.parse(body); }
  catch (e) {
    /* The page's text rather than its title: an Apps Script error page is titled just "Error". */
    const said = String(body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 160);
    const no = new Error('The reply was not valid JSON (HTTP ' + res.status + ')'
      + (said ? ': ' + said : ': it was empty'));
    /* A WEB PAGE, as against an empty or cut-off reply. The second is a connection and asking again
       mends it; the first is Apps Script saying something only a person can act on — see
       `RECONNECT`, which shows an admin the advice at once for this and only this. */
    no.page = /^\s*</.test(body);
    throw no;
  }
}

/* ==================================================================================================
   A PAYLOAD THAT DID NOT ARRIVE IS ASKED FOR AGAIN BY THE APP, NOT REPORTED TO THE VISITOR.

   REPORTED WITH A SCREENSHOT, 9 Oct: an orange bar across the top of Find — "Could not reach the
   backend. Something else went wrong on the way. Open it in a tab — the page itself will say which
   it is. timeout · site … · css …" — and *"I don't like when this happens I would rather site just
   refreshed itself."* The owner had just run `clearPayloadCache`, so that load built the payload cold
   and ran past the sixty-second deadline in `load()`. Apps Script finishes that work anyway and
   caches it, so a second ask a moment later would have been answered at once — and nothing asked.
   The app gave up after one try and handed whoever was holding the phone a deployment checklist.

   SO A FAULT ON THE WAY — the deadline, no connection ("Failed to fetch", Safari's "Load failed",
   NetworkError), a reply that is not JSON — books the next ask, and the app stays up on what it has:
   the files (`filesOnly_`) and whatever was already drawn. STRAIGHT AWAY after a timeout, because the
   server's own work finished and was cached; three seconds after a fast failure; then about 10s, 30s,
   60s, and every two minutes for as long as the page is open. At once on `online`, and on coming
   back to the page. A success stops it; a load somebody asked for — a sign-in, a save, Try again —
   starts the count again.

   AN ASK THAT COMES ROUND WHILE A LOAD IS IN THE AIR WAITS FOR IT, AND IS NOT FORGOTTEN. It was
   dropped, on the word that "the one in the air books what comes next" — and found by review, that
   one did not always: a retry overtaken by a Try again landed, saw it had been overtaken, and booked
   nothing, so "Reconnecting…" stayed on the screen for good over a backend that had been healthy for
   minutes. Now it is marked `due`, and `load()`'s `finally` asks the moment nothing is in the air,
   unless the load that landed settled it (a success, or a failure that booked the next rung itself).

   A REPLY IS CHECKED AGAINST WHOM IT WAS ASKED FOR (`loadWho_`), and against the newest payload
   already drawn. Retries make a request in the air the ordinary state for the whole of an outage, so
   the answer to an old question can arrive at any moment — and found by review: an admin signed out
   while a retry carrying their token was out, the retry landed, and the signed-out phone held the
   admin's payload, films and all. SIGNING OUT CALLS NO `load()`, so no counter moved on it, and only
   the question itself could say. A reply for somebody who is no longer here, or older than what is on
   the screen, is dropped whole — and if the person who IS here has no payload of their own yet, they
   are owed an ask, which the same `finally` makes.

   A SUCCESS TAKES THE ORDINARY PATH, which is what "refreshed itself" means here: the payload lands
   and the late-payload repaint fills the screen in. NOT `location.reload()`. A reload throws away the
   caret in a half-typed answer, the column the pupil is on and the keypad, and against a backend that
   is down for an hour a reload every two minutes is a page that never holds still — worse than a line
   of text. (A NEW BUILD is a different question and does reload, once: see `bootStale_`.)

   A REFUSAL IS ASKED AGAIN, ON THE SLOWEST RUNG. `{ error }` from `doGet` was taken as a real answer
   and never asked again — true of the refusals written on purpose (a missing tab), and not of the
   one the client cannot tell from them: doGet's last line turns ANY exception into `{ error }`, so a
   one-off throw while the payload was built stopped the app for good, which is the opposite of what
   the owner asked for. Every two minutes is cheap against a deliberate refusal and mends a passing
   one. What is still not asked again is a reply our own code threw on: the same reply would throw the
   same way. The server's sentence and that throw are an admin's to read, and nobody else's.

   WHILE IT ASKS, ONE QUIET LINE: `#reconnect` in index.html, a `role="status"` saying "Reconnecting…".
   From the first failure, even when that retry is instant — by then a timeout has been a minute of
   columns with no people and no sessions in them, and a minute with nothing said is the fault the
   slow line under the splash was written for. After two minutes of failures it says the one plain
   thing, "Can't reach the server — still trying.", and never the address. AND AN EMPTY COLUMN SAYS
   THE SAME KIND OF THING: `nothingHere` printed "Couldn't load. timeout. Try again" in the middle of
   the Feed under "Reconnecting…" — two statements contradicting each other, the second telling a
   visitor to act and its Try again putting the splash back up. While the app is asking it says it is
   waiting, with no reason and no button (`reconnecting_`).

   A PAYLOAD THAT LANDS DOES NOT REBUILD THE BOX SOMEBODY IS TYPING IN. Before retries the late
   repaint could land only in the first minute; now it can land at any moment, and found by review: a
   pupil writing in the Tools notepad lost the focus mid-word when a retry succeeded, and the next key
   with it. See `landRepaint_`.

   THE DIAGNOSTIC BANNER IS AN ADMIN'S, AND ONLY FOR A FAULT A PERSON MUST FIX: a reply that is a web
   page (the "Authorization is required" case), a page opened from `file:`, a refusal ("The server
   said: …"), or failures still going on after two minutes. Its advice is kept word for word — every
   paragraph of it is a fault that happened. THE ADMIN IS KNOWN BEFORE THE PAYLOAD: data.js reads
   `USER` out of storage before any of this runs, so `isAdmin()` answers on a cold boot;
   `hasRole('admin')` beside it for an admin looking at the app as a tutor, because the fix is theirs
   whichever hat they have on.
================================================================================================== */
const RECONNECT = {
  timer: 0,        /* the next ask, booked */
  at: 0,           /* when it comes round */
  tries: 0,        /* failures in a row; 0 is "nothing is failing" */
  since: 0,        /* when the first of them happened */
  flying: 0,       /* loads in the air */
  asked: 0,        /* when the last one went */
  due: false,      /* an ask is owed: it came round while nobody was looking or a load was in the air,
                      or a reply was dropped and the person here has no payload of their own */
  seq: 0,          /* every load's number, in the order they went */
  shown: 0,        /* the number of the load whose payload is drawn */
  shownFor: null,  /* and whom it was asked for — `loadWho_` */
  banner: false,   /* the diagnostic is up, put there by this */
  hold: null,      /* the box being typed in, only while a landing payload repaints — `landRepaint_` */
  kept: null,      /* the box a landing payload was not drawn under, until it is left */
};
const RECONNECT_SOON = 3000;
/* THE LADDER, and its last step repeats for as long as the page is open. */
const RECONNECT_STEPS = [10000, 30000, 60000, 120000];
/* "ABOUT TWO MINUTES" — when the line says the plain sentence and an admin is shown why. */
const RECONNECT_TELL = 120000;
/* COMING BACK TO THE PAGE within this long of the last ask is flicking between apps, not an ask. */
const RECONNECT_FLICK = 5000;

function reconnectAdmin_() {
  try {
    return (typeof isAdmin === 'function' && isAdmin())
      || (typeof hasRole === 'function' && hasRole('admin'));
  } catch (e) { return false; }
}
function reconnectSay_(text) {
  const el = document.getElementById('reconnect');
  if (el && el.textContent !== text) el.textContent = text;
}
/* WHETHER THE APP IS ASKING AGAIN BY ITSELF — what `nothingHere` asks before it prints a failure and a
   Try again. A function rather than the object, because nothingHere is above this in the file. */
function reconnecting_() {
  try { return RECONNECT.tries > 0; } catch (e) { return false; }
}
function reconnectBook_(wait) {
  const R = RECONNECT;
  clearTimeout(R.timer);
  R.at = Date.now() + wait;
  R.timer = setTimeout(() => { R.timer = 0; reconnectAsk_('timer'); }, wait);
}
/* A real answer, or a load somebody asked for: nothing booked, nothing said. */
function reconnectStop_() {
  const R = RECONNECT;
  clearTimeout(R.timer);
  R.timer = 0; R.tries = 0; R.since = 0; R.due = false;
  reconnectSay_('');
}
/* AND THE DIAGNOSTIC THIS PUT UP GOES WITH IT — but only while it still says what this put there. A
   banner written since (a missing column, a newer build) is somebody else's, and true. */
function reconnectDone_() {
  const had = RECONNECT.banner;
  RECONNECT.banner = false;
  reconnectStop_();
  const el = document.getElementById('banner');
  if (had && el && /^(Could not reach the backend|The server said)/.test(el.textContent || '')) banner('');
}
/* A LOAD FAILED. Books the next ask, says the quiet line, and answers whether an admin should be
   shown the diagnostic now. `how`: 'ours' — the reply arrived and our own code threw on it, which is
   not asked again; 'refused' — `{ error }`, asked again on the slowest rung; anything else is a fault
   on the way, and climbs the ladder. */
function reconnectFail_(err, how) {
  const R = RECONNECT;
  if (how === 'ours') {
    reconnectStop_();
    R.banner = reconnectAdmin_();
    return R.banner;
  }
  const now = Date.now();
  if (!R.tries) R.since = now;
  R.tries++;
  const timeout = (err && err.name === 'AbortError') || String((err && err.message) || err) === 'timeout';
  const slowest = RECONNECT_STEPS[RECONNECT_STEPS.length - 1];
  let wait = how === 'refused' ? slowest
    : R.tries === 1 ? (timeout ? 0 : RECONNECT_SOON)
    : RECONNECT_STEPS[Math.min(R.tries - 2, RECONNECT_STEPS.length - 1)];
  /* THE ASK THAT WOULD LAND PAST THE TWO-MINUTE MARK IS BROUGHT FORWARD TO IT, so the sentence that
     says it has been two minutes is said at two minutes, and by a failure rather than by a clock. */
  const left = R.since + RECONNECT_TELL - now;
  if (left > 0 && wait > left) wait = left;
  /* WHATEVER WAS OWED IS ANSWERED: this load was the ask, and the next one is booked here. */
  R.due = false;
  reconnectBook_(wait);
  const late = now - R.since >= RECONNECT_TELL;
  const tell = reconnectAdmin_()
    && (how === 'refused' || !!(err && err.page) || location.protocol === 'file:' || late);
  if (tell) R.banner = true;
  /* THE BANNER SAYS IT FOR AN ADMIN, so the line says nothing under it: one statement at a time. */
  reconnectSay_(tell ? '' : late ? 'Can’t reach the server — still trying.' : 'Reconnecting…');
  return tell;
}
function reconnectAsk_(why) {
  const R = RECONNECT;
  if (!R.tries && !R.due) return;               /* nothing is failing, and nothing is owed */
  /* A LOAD IN THE AIR: owed, and asked by `load()`'s `finally` if that one does not settle it. */
  if (R.flying) { R.due = true; return; }
  /* NOBODY IS LOOKING — a tab in the background, a phone in a pocket. Coming back asks at once, so a
     backend that is down all afternoon is not asked every two minutes by a tab nobody has open. */
  if (document.hidden) { R.due = true; return; }
  /* FLICKING BETWEEN APPS IS NOT FIVE ASKS — but the ask is only put off to the end of the five
     seconds, never left to a rung two minutes away. Found by review: back 3.5s after a failed ask, with
     the backend mended meanwhile, and the next ask was the one booked for 120s later. */
  if (why === 'back' && !R.due && Date.now() - R.asked < RECONNECT_FLICK) {
    const end = R.asked + RECONNECT_FLICK;
    if (!R.timer || R.at > end) reconnectBook_(Math.max(0, end - Date.now()));
    return;
  }
  clearTimeout(R.timer);
  R.timer = 0; R.due = false;
  load(true);
}
addEventListener('online', () => reconnectAsk_('online'));
document.addEventListener('visibilitychange', () => { if (!document.hidden) reconnectAsk_('back'); });

/* ---------- WHOM A LOAD WAS ASKED FOR ----------------------------------------------------------------
   The query string the payload is asked with — and so exactly what the server decided who you are
   from (`doGet` reads these three and nothing else). One function for the request and for the check
   on its reply, so the two cannot be spelt differently. */
function loadWho_() {
  const q = [];
  if (USER && USER.personId) q.push('person=' + encodeURIComponent(USER.personId));
  if (USER && USER.name) q.push('name=' + encodeURIComponent(USER.name));
  if (USER && USER.token) q.push('token=' + encodeURIComponent(USER.token));
  return q.length ? '?' + q.join('&') : '';
}
/* ---------- IS THIS REPLY STILL THE ANSWER ---------------------------------------------------------
   NOT when it was asked for somebody who has since signed out, or in as somebody else; NOT when a
   load sent after it has already drawn its payload. Either way it is dropped whole — painted, it would
   be one person's payload on another's screen, or an older one over a newer; failed, it would put the
   quiet line back over a payload that arrived. AND IF THE PERSON HERE NOW HAS NO PAYLOAD OF THEIR OWN,
   they are owed an ask: nothing else will make one when it was their sign-out, which calls no `load()`. */
function loadStale_(n, who) {
  const R = RECONNECT;
  const now = loadWho_();
  if (who === now && n > R.shown) return false;
  if (R.shownFor !== now) R.due = true;
  return true;
}

/* ---------- A PAYLOAD THAT LANDS DOES NOT REBUILD THE BOX SOMEBODY IS TYPING IN ---------------------
   FOUND BY REVIEW, 390x844 with touch: a pupil writing in the Tools notepad, the caret two from the
   end, and a retry succeeded behind it. `repaint` rebuilt the column, the focus went to BODY, the
   caret to the end, and the next key went nowhere — on a phone, the keyboard closing mid-word. The
   text survived only because the notepad saves on every keystroke. Before retries the late repaint
   could land only in the first minute; now it can land at any moment of an afternoon's outage.

   SO THE REPAINTS A LANDING PAYLOAD MAKES — its own, and the inbox's a moment later — leave the column
   holding the focused box alone: marked STALE, and NOT RESTARTED either (`startScreen_`), because a
   widget's `start` writes its box's value back, which on its own moves the caret to the end. It is
   drawn a moment after the box is left, or on arriving at it. Only those: the flag is up for the
   length of the call, so a press that repaints (Send under a message) is never held. Find is not this
   rule's — `findKeep_` holds it on its own, stricter terms, and redraws it itself; Settings' unsaved
   cards are `settingsKeep_`'s and still are. */
/* ---------- AND NOT THE SELECT WHOSE LIST IS OPEN EITHER ---------------------------------------------
   FOUND BY REVIEW, 390x844 with real touch, on 9 October: tap the booking form's Kind, so the phone's
   own list is up over it, and let a payload land behind it. The column was rebuilt, the select the
   list belonged to was thrown away, and the pick went to a node nobody could see — `BOOKING.how`
   stayed empty and the row said `—`. The settings column's favourite colour the same. While the panel
   stood (note 226) it found its select again after a repaint; the platform's list cannot, because the
   list IS that element's. So the landing repaint holds a FOCUSED select as it holds a box being typed
   in: on a phone a focused select is its list open (iOS draws the wheel from focus, Android its sheet),
   and on a laptop it is the list or the keyboard's arrows on it. A pick then lands on the select it was
   made in, its own `change` redraws what it changes, and the column is drawn when the select is left.
   Only for a LANDING payload: a select's own `change` still redraws its card at once (`drawBooker`). */
const TYPING_ = 'textarea, input[type="text"], input[type="search"], input[type="email"], '
  + 'input[type="tel"], input[type="number"], input:not([type]), [contenteditable="true"], select';
function typingBox_() {
  const a = document.activeElement;
  if (!a || !a.matches || !a.matches(TYPING_)) return null;
  const stuff = document.getElementById('s-stuff');
  return stuff && stuff.contains(a) ? null : a;
}
/* `draw` IS ANY OTHER REPAINT THAT A LANDING REPLY MAKES — `profileRefresh_` (me.js) drawing your own
   settings once per app open is the other one, and it rebuilt the column under an open list exactly as
   the payload did. Without it, the whole `repaint`, as before. */
function landRepaint_(draw) {
  const R = RECONNECT;
  R.hold = typingBox_();
  /* A LANDING MARKS `'maybe'`, not 1 — see the note over `STALE`: a column it marks is drawn again, and
     written only if what it would draw differs from what it holds. */
  REPAINT_MARK = 'maybe';
  try { (typeof draw === 'function' ? draw : repaint)(); } finally { R.hold = null; REPAINT_MARK = 1; }
  DRAW_EPOCH++;
  if (typeof aheadKick_ === 'function') aheadKick_();
}
/* `paint` asks this beside `settingsKeep_` and `findKeep_`, and `startScreen_` before it restarts
   anything. In a `try`, because both are hoisted and this const is not. */
function reconnectKeep_(id) {
  try {
    const box = RECONNECT.hold;
    if (!box || document.activeElement !== box) return false;
    const host = document.getElementById('s-' + id);
    if (!host || !host.contains(box)) return false;
    RECONNECT.kept = box;
    return true;
  } catch (e) { return false; }
}
/* AND DRAWN WHEN IT IS LEFT — a moment after, so a tap from one box to the next in the same column
   (focusout, then focusin) finds the next box focused and waits on that one instead. */
document.addEventListener('focusout', () => {
  if (!RECONNECT.kept) return;
  setTimeout(() => {
    const box = RECONNECT.kept;
    if (!box) return;
    const a = document.activeElement;
    if (a === box && box.isConnected) return;
    const host = box.isConnected && box.closest ? box.closest('[id^="s-"]') : null;
    if (host && a && a !== box && host.contains(a) && a.matches && a.matches(TYPING_)) { RECONNECT.kept = a; return; }
    RECONNECT.kept = null;
    /* REDRAWN SINCE — a press, or arriving — and there is nothing left to do. */
    try { if (host && host.id === 's-' + AT && STALE[AT]) repaint(); } catch (e) {}
  }, 400);
});

/* THE LOAD, AS EVERY CALLER ASKS FOR IT. `again` is the retry above and nothing else passes it: any
   other caller is somebody signing in, saving, or pressing Try again, and that starts the count over. */
async function load(again) {
  const R = RECONNECT;
  if (!again) reconnectStop_();
  R.asked = Date.now();
  R.flying++;
  try { await loadOnce_(again, ++R.seq); }
  finally {
    R.flying--;
    /* THE ASK THAT WAITED FOR THIS ONE — see `due`. Not while another is still in the air: the last
       to land makes it, so two that land together are still one ask. */
    if (!R.flying && R.due) reconnectAsk_('owed');
  }
}

/* WHETHER A GOOD PAYLOAD HAS EVER BEEN PAINTED — see the end of `load()`. */
let FIRST_PAINT_DONE = false;
async function loadOnce_(again, n) {
  /* THE REPLY ARRIVED AND WAS DATA — so a throw after this is our own code, not the connection. */
  let reached = false;
  /* AND IT BECAME `DATA` — the one outcome a retry repaints for. */
  let got = false;
  /* WHOM IT IS ASKED FOR, kept to check the reply against — see `loadStale_`, and the note below on
     why each of the three keys is sent. */
  const who = loadWho_();
  try {
    /* The person's id goes with the request so the server can say which posts YOU liked — it
       cannot know otherwise, and sending every like to every phone to answer it would be absurd. */
    /* AND THE NAME, which is a different question from the id and was never being asked.
       The backend decides `viewerIsAdmin` from `p.name` and nothing else. This request has only
       ever carried `person`, so that flag has been FALSE on every payload ever built — including
       for an admin — and four things silently followed from it:
         · an unlisted tutor is absent, so the switch that hid them cannot un-hide them
         · a deleted post and a deleted resource are absent, for the same reason
         · `orders` holds only your own, so the queue of paper to print is always empty
         · `health.problems` is never filled in
       None of those looks like a fault. Each looks like a feature that does nothing. */
    /* ---------- AND THE TOKEN, WHICH IS THE ONLY ONE OF THE THREE THAT PROVES ANYTHING -----------
       `doGet` DECIDED WHO YOU WERE FROM `name`, and the name of every tutor is on the screen — so the
       admin payload was one query string away for anybody. `api()` has attached `USER.token` to every
       POST since sessions were built and `accessDenied` has resolved it there; the GET was simply
       never moved onto it. The block at the top of `doget.gs` has the measurement and the trade.

       ALL THREE ARE STILL SENT, and that is what makes this safe to push before the backend deploys
       — which is blocked on the Cloud-project switch, so the two land days apart whichever order they
       are written in. Old backend, new phone: `name` still decides, nothing changes. New backend, old
       phone: no token, so an admin is served the ordinary payload — degraded, and safe. Both new: the
       token decides. There is no ordering in which somebody is served more than they should be. */
    /* ALL THREE ARE BUILT BY `loadWho_` — `who`, at the top of this function. */
    /* NO CACHE, AND A DIFFERENT URL EVERY TIME. Both, because either alone can be got round.
       This is a plain GET, which a browser is entitled to hold — so an edit to the spreadsheet
       could be live, the deploy correct, the site current, and the phone still showing what it
       fetched ten minutes ago. That is indistinguishable from the change not having saved, and it
       is the third time on this project that a stale copy has been mistaken for a broken feature.
       `no-store` tells the browser not to keep it; `_` makes the URL one it has never seen, which
       is what covers the proxies and the service workers that ignore the header. */
    const bust = (who ? '&' : '?') + '_=' + Date.now();
    /* THE SLOW-LOAD LINE STARTS ITS CLOCK HERE, beside the request it is about, rather than at boot:
       this is the moment the app begins waiting, and it is the only moment worth timing from. */
    splashWaitWatch_();
    /* ---------- AND AT THE SAME MOMENT, COME UP ON THE FILES ---------------------------------------
       REPORTED AS "the loading is taking forever. surely, it shouldnt take long anymore as its
       pulling info from live file not from appscript anymore." Measured with the backend hanging:
       **60.8 seconds of splash**, because `splashOff_()` is at the end of this function and the end
       of this function is behind the payload's sixty-second deadline.

       THE DEADLINE IS RIGHT AND IT IS NOT WHAT THIS IS ABOUT. Its own note explains why it is not
       shorter: this backend answers in about fifteen seconds, and a deadline under the thing it is
       timing reports a healthy backend as a dead one. That argument is about when to STOP WAITING.
       This is a different question -- when there is enough to SHOW -- and the answer is: as soon as
       the files have landed, which is usually long before the payload.

       THE SAME FIFTEEN SECONDS THE SLOW LINE USES, and deliberately the same constant rather than a
       second number: that line is the app saying "this is taking longer than it should", and the
       moment it is true is exactly the moment to stop waiting to draw. One figure, derived from the
       one already written down -- which is the fault this file records every time a number is
       stated twice.

       IT KEEPS WAITING. Nothing here cancels the payload; it lands behind the app and repaints, the
       ordinary late-payload path. `filesOnly_` declines if a good payload is already standing, so a
       retry after a success cannot empty the screen. */
    clearTimeout(splashEarlyTimer);
    splashEarlyTimer = setTimeout(() => {
      if (LOADED) return;
      filesOnly_().then(() => {
        if (LOADED) return;
        try { repaint(); } catch (e) {}
        splashOff_();
      }).catch(() => {});
    }, SPLASH_SAY_AFTER);
    /* ---------- A DEADLINE, BECAUSE A REQUEST THAT NEVER ANSWERS IS THE WORST FAILURE -------------
       `fetch` waits for ever by default, and `splashOff_()` is at the END of this function — the
       only place the loading screen ever comes off. So a backend that hung left the app behind the
       roundel indefinitely with the animation still playing, and nothing on screen could tell
       "still trying" from "will never finish". That is why it survived: every other failure here
       ends with a message and a Retry.

       A RACE, NOT AN ABORT. `AbortController` is tidier and is one more thing that has to exist on
       every browser this runs on — and this line is the one every single load goes through, so
       anything it depends on that is missing takes the whole app down behind a splash that never
       lifts. A promise that rejects on a timer needs nothing but `setTimeout`.

       THE REQUEST IS NOT CANCELLED, and that is the honest trade: it carries on and its answer is
       thrown away. For a GET that reads a spreadsheet that costs nothing — no write happens and the
       work at the server was going to finish anyway. Not waiting for ever was the point.

       SIXTY SECONDS, and the number is not arbitrary: this backend answers in about fifteen. A
       deadline shorter than the thing it is timing cancels every request and reports it as "no
       answer", which reads exactly like a dead backend and is one caused by the timeout meant to
       diagnose it. That happened, at twelve seconds, and cost an afternoon. */
    let bell;
    const deadline = new Promise((unused, no) => {
      bell = setTimeout(() => {
        const e = new Error('timeout');
        e.name = 'AbortError';
        no(e);
      }, 60000);
    });
    /* ---------- THE ONE THE HEAD ALREADY STARTED ---------------------------------------------------
       index.html FIRES THIS REQUEST DURING PARSING, before the twenty-three script files have even
       been asked for — see the note there. By the time this line runs it has usually been in flight
       for seconds, so making a second one would be throwing that away and starting the wait again.

       TAKEN ONCE. Cleared as it is read, so a retry after a failure asks properly rather than being
       handed the same dead promise for ever — which would make the Retry button do nothing at all,
       the most convincing kind of broken.

       AND IT IS ONLY A HEAD START. It is null when the browser has no `fetch`, when storage was
       refused, when the page was opened from a file, or when it simply failed; every one of those
       falls through to the request below exactly as before. */
    const early = window.BOOT_GET || null;
    window.BOOT_GET = null;
    let res;
    try {
      /* FROM A FILE, ASK A DIFFERENT WAY. `fetch` is refused outright by a page with no origin;
         a script tag is not. Served properly — Live Server, GitHub Pages — `fetch` is better in
         every way and this stays out of the way. */
      res = await Promise.race([
        early
          ? early.then(r => (r && r.ok ? r : (location.protocol === 'file:'
              ? jsonp(API + who + bust)
              : fetch(API + who + bust, { cache: 'no-store' }))))
          : location.protocol === 'file:'
          ? jsonp(API + who + bust)
          : fetch(API + who + bust, { cache: 'no-store' }),
        deadline]);
    } finally {
      /* Cleared whichever way it went, or a load that answered at 59 seconds leaves a timer running
         to reject a promise nobody is holding. */
      clearTimeout(bell);
    }
    /* JSONP HANDS BACK THE VALUE ITSELF — a script tag delivers a value, not a reply, so there is
       nothing to unwrap. Given the shape of a response so the code below need not know which route
       it came by.
       HELD IN ITS OWN NAME FIRST: written as `res = { json: () => res.__jsonp }` it reads the
       variable it is in the middle of replacing, so `json()` returns undefined and the payload is
       silently dropped — which looks exactly like a backend answering with nothing. */
    if (res && res.__jsonp) {
      const got = res.__jsonp;
      res = { ok: true, status: 200, statusText: 'OK', json: () => got };
    }
    /* ---------- READ AS TEXT, THEN PARSE, so a web page says what it is -------------------------
       `res.json()` ON AN HTML REPLY THROWS A DIFFERENT SENTENCE IN EVERY BROWSER, and Safari's is
       "The string did not match the expected pattern." — which matched none of the branches below,
       so an iPhone looking at an Apps Script error page was told "something else went wrong" and
       never shown the page's own words. `api()` already reads text first for this reason; the boot
       read did not. The message carries the page's title or first line, so the banner names the
       fault (an authorisation prompt, a script that failed to load) without anybody opening a tab. */
    const d = await bootJson_(res);
    reached = true;
    /* THE ANSWER TO A QUESTION NOBODY IS ASKING ANY MORE — for somebody who has signed out or been
       signed in over since it went, or older than a payload already drawn. Dropped whole; see
       `loadStale_`, and `load()`, which asks for whoever is here if they are owed it. */
    if (loadStale_(n, who)) return;
    if (d && !d.error) {
      /* WHAT WAS ASKED FOR AND NOT SENT.
         `DATA.liveJobs` was read for weeks and never sent — the `|| []` beside it turned that into
         an empty list, so the Book screen said "No sessions yet" whatever was in the tab. The same
         happened to `DATA.messages` and `DATA.resources`. None of the three throws, none of them
         logs, and all three look exactly like an empty database.

         So a key nothing sends is written down the first time anything reaches for it. Not a
         banner: a key can be genuinely absent for a client and present for an admin, and shouting
         about that would be shouting on every load. It is recorded, and `missingKeys()` typed into
         the console says what they were.

         Costs nothing. A Proxy is only consulted on a property that is not there. */
      /* `splashOff` WAS WRITTEN HERE, and that is why retiring a splash never reached a device. This
         line ran BEFORE `settingsInto_` below, so it wrote the payload's `splashOff` -- which
         `doGet` sends as `[]` on every load, the list having moved to data/settings/splashes.json --
         and the file's list, built a few lines later, was never written anywhere. It is written by
         `splashSync_` now, after the file has been read; see there. */
      /* AND THE STARS THE SHEET KNOWS ABOUT — see `adoptFavourites_`. Called here rather than in
         `find.js` because this is the moment a payload becomes DATA, and a favourite read before
         that is the last device's guess. */
      /* ---------- THE LIBRARY, MERGED IN BEFORE THIS BECOMES `DATA` ------------------------------
         `questions` AND `dropdowns.checklists` NO LONGER COME FROM THE BACKEND. They are built from
         `data/questions.json` in this repository — see the header of `library.js` for why, and for
         the three columns that were left behind in the spreadsheet because they held children's
         handles.

         BEFORE THE PROXY, DELIBERATELY. `DATA` is wrapped to record keys nothing sends; writing
         these two afterwards would record both as missing on every single load, which is the list
         `missingKeys()` exists to keep honest.

         AWAITED, AND IT HAS USUALLY LANDED. `index.html` starts the request in parallel with the
         payload's, so by here the slower of the two is what we are waiting on rather than the sum.

         A FAILURE IS AN EMPTY LIBRARY, not a dead app: `libraryRows_` answers `[]` and every
         section reads as an empty tab, which is what the rest of this payload does with anything
         it cannot read. */
      /* ---------- NOT `d = ...`, AND THAT LINE HAD BEEN THROWING ON EVERY LOAD --------------
         `d` IS `const` — declared `const d = await res.json()` about forty lines up — so
         `d = libraryInto_(d, …)` threw "Assignment to constant variable" every single time this
         ran, and the catch below swallowed it.

         NOTHING LOOKED WRONG, WHICH IS WHY IT LASTED. `libraryInto_` MUTATES `d` in place and
         returns the same object, so the questions were already written by the time the assignment
         was attempted; the throw happened after the useful work and the catch's repair
         (`d.questions = d.questions || []`) found the key already populated and left it alone. A
         correct fallback hiding a broken line, which is the shape CLAUDE.md records under
         `check-flow` and `.mat-out` and now here.

         IT ONLY BECAME VISIBLE WHEN SOMETHING WAS PUT AFTER IT. The three extra library tabs are
         the first code to sit on the next line, and they simply never ran — proved by booting the
         app with a row in `data/boxers.json` and watching the payload's copy win anyway. */
      try {
        libraryInto_(d, await libraryRows_());
        /* THE OTHER THREE TABS, WHICH MAY STILL BE EMPTY. `libraryExtras_` leaves a key alone
           unless its file has rows in it, so while `data/boxers.json` and the rest are `[]` the
           payload's own copy stands and nothing here changes. See the header of library.js. */
        const extra = await libraryExtraRows_();
        libraryExtras_(d, extra);
        /* AND THE SETTINGS TABS, ON THE SAME RULE AND FROM THE SAME FETCH. A file with no rows
           leaves the payload's key alone, so this is identical while a tab has not been exported —
           and it is what keeps the site standing if the spreadsheet is deleted before the Apps
           Script sync has run, which is the ordering this project cannot control. */
        settingsInto_(d, extra);
        /* AND WHAT THE NEXT LOAD'S SPLASH IS CHOSEN FROM — see `splashSync_`. Its own `try`, so a
           full or forbidden storage cannot cost this payload its library. */
        try { splashSync_(d, extra); } catch (e) {}
      } catch (e) {
        d.questions = d.questions || [];
        d.dropdowns = d.dropdowns || {};
        d.dropdowns.checklists = d.dropdowns.checklists || {};
      }

      /* AND ASKED AGAIN AT THE MOMENT IT BECOMES `DATA`. The check above runs before the library's
         awaits, and on a first load over a slow line those are seconds — the file is the largest the
         app asks for. Measured in the harness with the file held: an admin signed out inside that
         wait and their payload, films and all, was committed on the signed-out phone after all. */
      if (loadStale_(n, who)) return;
      DATA = new Proxy(d, {
        get(t, k) {
          /* `then` is asked for by anything that awaits an object, to find out whether it is a
             promise. It is not a missing key, and counting it would put it at the top of the list
             on every single load. */
          if (typeof k === 'string' && !(k in t) && k !== 'then') {
            MISSING_KEYS[k] = (MISSING_KEYS[k] || 0) + 1;
          }
          return t[k];
        }
      });
      LOAD_FAILED = '';
      got = true;
      RECONNECT.shown = n; RECONNECT.shownFor = who;

      /* THE STARS AND THE SPOTLIGHTS, from the payload that has just landed. Called HERE rather
         than a few lines above, which is where `adoptFavourites_` used to sit: up there `DATA` was
         still the PREVIOUS payload, so every load adopted the load before it and the very first
         one — where `DATA` is `{}` — adopted nothing. */
      adoptMarks_();
      /* BEFORE THE ICON AND BEFORE ANYTHING IS DRAWN. `applyColumns_` can change which screen you
         are on, and everything painted after it reads `AT`. */
      applyColumns_();
      applyBrandIcon_();

      /* ---------- THE WATCHDOG'S MESSAGE IS NOT TRUE ANY MORE ---------------------------------
         THE PAYLOAD ARRIVED. Whatever the 30-second watchdog in index.html wrote is now a
         statement about a load that has since finished — "Still loading… Data: not yet" sitting
         above a screen full of posts, which is the app contradicting itself in the one place
         somebody looks when they think it is broken.

         NOTHING TOOK IT DOWN. The watchdog writes straight to the element and only `retry` ever
         cleared it, so a slow load that SUCCEEDED looked exactly like one that never did — and
         reading that banner is what has sent us both after the wrong thing more than once today.

         CLEARED HERE, first thing, before any of the checks below get their turn to write their
         own. If one of them has something to say it says it a line later and this has not eaten
         it; if none of them does, the banner goes, which is the truthful outcome. */
      if (LOAD_SLOW) banner('');
      /* AND THE ASKING-AGAIN STOPS — the quiet line goes, and an admin's diagnostic with it. Here, for
         the same reason as the line above: before the checks below write anything of their own. */
      reconnectDone_();

      /* WHAT THE BACKEND CAN DO, against what this site needs. `features` has been in the payload
         since before the rewrite and nothing has ever read it — which is why a stale deploy shows
         up as "That action is not recognised", a sentence written for somebody who did something
         wrong rather than for a deployment that is out of date. */
      /* A payload that could not write something — the schema check ran and a column is still
         missing. Said on load rather than waiting for somebody to try to save into it. */
      if (d.unwritten && d.unwritten.length) {
        banner('The sheet is missing columns: '
          + d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
          + '. Anything saved to them is discarded.');
      }
      /* ---------- AND THE QUESTION FILE, WHICH FAILS SEPARATELY AND USED TO FAIL SILENTLY --------
         `nothingHere` REPORTS A DROPPED LIBRARY ONLY WHEN THE LIST IS EMPTY, AND ON THIS SITE THE
         LIST IS NEVER EMPTY. The payload carries tutors and venues, so a question file that did not
         arrive leaves a Find screen holding three venues and no questions — measured in the harness:
         2 items, `LIBRARY_FAILED` set, and the empty-state branch never reached once. The person
         sees an app that works and has no questions in it, which is the complaint this came from.

         SO IT IS A BANNER, because a banner does not depend on the list being empty. Written last
         of the three so it wins: a missing column is an admin's problem with saving, and this is
         every visitor's problem with the thing the app is for.

         IT IS ALSO THE REQUEST MOST LIKELY TO FAIL. 346 KB compressed, 3.4 MB parsed — the largest
         single thing the app asks for, and the only one big enough to be dropped by a weak signal
         or an old handset that everything else survives. */
      if (LIBRARY_FAILED) {
        banner('The questions did not load — ' + LIBRARY_FAILED
          + '. Everything else is here; reload the page to try again.');
      }

      /* ---------- THE MESSAGE WIDGETS COULD NOT EXIST UNTIL YOU OPENED THE MESSAGE SCREEN --------
         REPORTED AS "I just sent a message to George but I don't see it pop up in my messages
         widget", and the dependency was circular.

         `msgWidgets_()` BUILDS ONE WIDGET PER CONVERSATION out of `MESSAGES`. `MESSAGES` starts
         `null` and `loadMessages()` — measured, every caller — was reachable from exactly four
         places: the first draw of the `dm` screen, the `dm-refresh` button on it, `fillThread_`
         (which needs a thread widget that cannot exist yet), and after a send. So on a phone that
         had never opened the Messages column there were NO message widgets, and nothing anywhere
         said why: `messageThreads_` reads `MESSAGES || []` and an empty list looks exactly like
         having no conversations.

         THAT IS THE `liveJobs` SHAPE AND THE `DATA.messages` SHAPE, which the note above
         `loadMessages` already describes about this very feature: "the widget and the sheet both
         read undefined, fell to `|| []`, and said 'Nothing yet.' to everybody for ever". It was
         fixed there and reintroduced one layer out, in what loads it.

         SO IT IS FETCHED WITH THE PAYLOAD. One POST, once per load, only when somebody is signed
         in — a conversation is private and there is nobody to fetch for otherwise. It cannot fail
         loudly: `loadMessages` swallows its own errors by design (an unreachable backend is not an
         empty inbox), so this can only make widgets appear, never take a screen down. */
      if (USER && typeof loadMessages === 'function') {
        loadMessages().then(() => { try { landRepaint_(); } catch (e) {} });
      }
      /* AND YOUR OWN SETTINGS, AS THE SHEET HOLDS THEM — see `profileRefresh_` in me.js. Once per
         app open, beside the inbox and for the same reason: a private thing, fetched only for somebody
         signed in, and never part of a payload that is cached and shared. */
      if (USER && typeof profileRefresh_ === 'function') profileRefresh_();
      /* NO BANNER FOR A VERSION MISMATCH ANY MORE.
         It was built when a cached stylesheet was a real and invisible problem — twice a rule had
         been changed and the browser was serving an old copy, and there was no way to tell that
         from a rule that was simply wrong.
         index.html fixed that at the source: both files are requested with `?t=` and the current
         millisecond, so neither can be cached at all. What is left is a mismatch that means "the
         other file has not been pasted yet", which is true, harmless, and self-correcting — and an
         orange bar across the top of every screen is a heavy way to say it.
         Both versions are still on the You screen, which is where you look when you want to know. */
      /* `editResource` AND `deleteResource` WERE IN THIS LIST. They are not actions any more —
         the library is `data/questions.json` in this repository and a relabel is a commit — so
         leaving them here would have put a permanent orange bar across every screen saying the
         backend cannot do something nothing asks it to. */
      const NEEDS = ['editPost', 'deletePost'];
      const missing = NEEDS.filter(f => (d.features || []).indexOf(f) === -1);
      if (missing.length) {
        /* THE VERSION IT ACTUALLY REACHED, said out loud. "The backend is older" was true and
           useless: it did not say WHICH backend, and the answer turned out to be a second
           deployment nobody knew was there. A version string in the message is the difference
           between redeploying again and going to look at the URL. */
        banner('The backend at this URL is ' + (d.version || 'an unknown version')
             + ', which cannot ' + missing.join(', ') + '. Either that deployment is old, or '
             + 'this site is pointed at the wrong one — check the id in API against the '
             + 'Deployment ID in Manage deployments.');
      }
    }
    else {
      LOAD_FAILED = String(d.error || 'the server refused the request');
      /* THE FILES STILL STAND -- see `filesOnly_`. A refusal from the backend is not a reason for
         a student to lose the paper they are working through. */
      await filesOnly_();
      /* ASKED AGAIN, EVERY TWO MINUTES — doGet's catch-all answers ANY exception this way, and the
         client cannot tell a throw that will pass from a refusal that will not; see `RECONNECT`. The
         sentence is for whoever can act on it: a visitor has the files, the quiet line, and an empty
         column that says it is waiting. */
      if (reconnectFail_(null, 'refused')) banner('The server said: ' + (d.error || 'something went wrong'));
    }
  } catch (err) {
    /* A FAILURE IS STALE THE SAME WAY — it would put the quiet line back over a payload that came. Not
       once the payload is `DATA`: a throw after that is this load's own, and this load is current. */
    if (!got && loadStale_(n, who)) return;
    LOAD_FAILED = String((err && err.message) || err || 'could not reach the backend');
    await filesOnly_();
    /* ASKED AGAIN, AND SAID QUIETLY — see `RECONNECT`. What follows is the diagnostic, and it is drawn
       only when `reconnectFail_` says an admin should see it now. */
    const tell = reconnectFail_(err, reached ? 'ours' : 'way');
    /* WHICH URL IT TRIED, as something you can press.
       "Could not reach the server" is true of four different faults and useful for none of them:
       a wrong deployment id, a deployment whose access is still "Only myself", a browser with no
       connection, and a script that threw while parsing the reply all produce it. The URL is the
       one piece of evidence that separates them, and opening it in a tab answers the question in
       ten seconds — JSON means the address is right, a Google sign-in page means the deployment
       is private, a 404 means the id is wrong. */
    const el = tell ? $('banner') : null;
    if (el) {
      el.classList.remove('hidden');
      /* NOT A DOOR. `banner(msg, true)` makes the whole bar a "tap to load the new build", and this
         writes its own markup over it — found by review: an admin's diagnostic over the boot's
         newer-version banner kept `data-do`, so pressing "Open it in a tab" reloaded the app as well. */
      el.removeAttribute('data-do');
      /* THE ADVICE MATCHES THE FAULT. It used to print all of it every time — including "Failed
         to fetch means the reply never arrived" underneath an error that plainly was a reply. Two
         paragraphs of which one applied, and no way to tell which, is worse than one sentence. */
      const msg = String((err && err.message) || err || '');
      const why = /Unexpected token|not valid JSON/.test(msg)
        /* A reply arrived and it was a web page. Apps Script serves its own errors as HTML, and
           since the scopes were written into the manifest the commonest one by far is a consent
           that has not been given — a manifest change invalidates the authorisation, and only a
           run from the EDITOR can raise the prompt again. */
        ? 'The backend answered with a web page instead of data. Open it in a tab and read what '
          + 'it says — “Authorization is required” means the scopes changed and nobody has '
          + 'consented yet: run authoriseDrive from the Apps Script editor, accept the prompt with '
          + 'every box ticked, and deploy a new version once its last line says READY.'
        /* ---------- A PAGE OPENED FROM A FILE CANNOT REACH ANYTHING -------------------------------
           THE COMMONEST CAUSE OF THIS EXACT MESSAGE, and this told people to go and check their
           deployment instead. Double-click index.html and the browser gives the page the origin
           `null`, then refuses any request to another address INSTANTLY — no network, no status,
           "Failed to fetch" in zero seconds. Nothing is wrong with the backend, the deployment or
           the code, and every minute spent looking at those is a minute wasted.

           IT IS KNOWABLE, WHICH IS WHY IT GOES FIRST. `location.protocol` says outright which
           situation this is, so the app never has to guess between two faults that produce the
           same words. */
        : location.protocol === 'file:'
        ? 'This page was opened from a file, so the browser blocked the request before it left — '
          + 'that is what “Failed to fetch” in no time at all means, and nothing is wrong with the '
          + 'backend. Serve the folder instead: in VS Code, right-click index.html → Open with '
          + 'Live Server. The address then starts http:// and everything works.'
        : /Failed to fetch|NetworkError|Load failed/.test(msg)
        /* Served properly and still nothing arrived — so now it IS the address or the access. */
        ? 'The reply never arrived, so this URL is not being served. Check Manage deployments: the '
          + 'one under ACTIVE is the only one that answers, an archived id looks exactly like '
          + 'this, and “Only myself” access does too.'
        /* ---------- THE DEADLINE, WHICH WAS FILED UNDER "SOMETHING ELSE" -------------------------
           THE OWNER'S SCREENSHOT OF 9 OCT read "timeout" over "Something else went wrong on the
           way" — the commonest fault of the lot, given no advice. A cold payload (after
           `clearPayloadCache`, or a script redeployed) can outrun the minute; Apps Script finishes
           and caches it anyway. An admin sees this only after two minutes of them, so by then it is
           not one slow build. */
        : /^timeout$/.test(msg)
        ? 'The backend took longer than a minute, again and again. One slow answer is a payload '
          + 'built cold (after clearPayloadCache) and the next ask gets the copy it kept; minutes of '
          + 'them is the script itself — open it in a tab and see how long it takes.'
        : 'Something else went wrong on the way.';

      el.innerHTML = 'Could not reach the backend.' + (reached ? '' : ' Still trying by itself.') + '<br>'
        + '<span class="faint">' + esc(why) + '</span><br>'
        + '<a class="link" href="' + esc(API) + '" target="_blank" rel="noopener">Open it in a '
        + 'tab</a> — the page itself will say which it is.<br>'
        + '<span class="faint">' + esc(msg)
        + ' · site ' + esc(SITE_VERSION) + ' · css ' + esc(cssVersion()) + '</span>';
    }
  }
  /* A RETRY THAT BROUGHT NO PAYLOAD CHANGED NOTHING — failed on the way, or refused: the files are
     what they were, the splash came off with the load before it, and the next ask is booked.
     Repainting every column under somebody using the app — the keypad, the column they are on — every
     ten seconds, then every two minutes, for a load that brought nothing, is the disturbance asking
     again exists to avoid. UNLESS NO LOAD HAS FINISHED YET — an ask owed after the first load's reply
     was dropped (`loadStale_`) is the one that has to take the splash off — or the asking has
     stopped, on a reply our own code threw on, when the columns that said "waiting" must now say
     what went wrong and offer Try again. */
  if (again && !got && LOADED && reconnecting_()) return;
  /* Set whether it SUCCEEDED or failed — a failed load is still a finished one, and leaving the
     loader up for ever would be the app pretending it is still trying. */
  LOADED = true;
  /* THE SPLASH COMES OFF HERE, and here is the only place it can: this line runs whether the
     payload arrived or the request failed, and a splash that only lifts on SUCCESS turns a failed
     load into a hang — the app would sit behind a tag that is still cheerfully being sprayed while
     the thing it is covering has already given up.
     Faded by a class rather than removed from the document, so a retry can put it back. */
  splashOff_();

  /* THE OFFER TO KEEP IT, a bar three seconds in, was here — removed at the owner's word; see me.js. */

  /* ---------- THE STALE SCREENS, CLEARED BEFORE THE REDRAW ---------------------------------------
     Every screen but the one in front was drawn before this request came back, so each holds the
     loader. Emptied here, and `repaint` below draws them again with the data that has just
     arrived.

     EMPTYING WITHOUT REDRAWING WAS THE BUG. It was left to `go` to rebuild each on arrival, which
     put the cost on the tab somebody actually opens — every word of which is true, and it forgot
     the peek: you can SEE the edge of the tab either side without going to it, and an emptied
     screen has nothing to show. The columns left and right went blank while the card above and
     below stayed visible, because those live inside the screen you are on.

     `repaint` now paints the neighbours as part of the sequence, so this is one line rather than
     three and cannot fall out of step with it. */
  /* ---------- ONCE, NOT ON EVERY LOAD ------------------------------------------------------------------
     THE SKELETONS ARE A FACT ABOUT THE FIRST PAYLOAD. After it, every column already holds real markup,
     and emptying all eleven made `repaint` below rebuild all eleven in one go — measured on the iPad
     (diag-signin), 0.5–0.6 s of frozen main thread at full speed and 2 s at 4× slower, landing fifteen
     to thirty-five seconds after "Signed in", usually under a child already swiping or typing. That is
     the *"janky and unresponsive"* in the owner's sentence. From the second good payload on, `repaint`
     alone: it draws the column in front and marks the rest stale, and `go` draws each on arrival. */
  /* ---------- AND NOT EMPTIED AT ALL ANY MORE — THE GLASS IS DRAWN, THE REST IN THE QUIET AFTER IT -------
     THE FIRST PAYLOAD EMPTIED EVERY COLUMN BUT THE ONE IN FRONT, and `repaint` drew all fifteen again in
     the same task. Measured on 11 Oct at 390 wide and 4x CPU, signed in as an admin (docs/history/341):
     1,367ms in that task, Find 459 and Settings 490 of it and the Feed in front 5 — then Find's own cold
     fill (1,197ms) in the same long task, 3,070ms during which no frame could be drawn, with the splash
     already told to lift. So nothing is emptied: `repaint` marks every other column `STALE` and draws
     the one in front, and a column beside it that a wide window shows (`GLASS.cols`) is drawn here too;
     every other column keeps the boot's markup — the one loader, never a blank, which is what the note
     above wanted for the peek — until the builder draws it, nearest first, in the first quiet moments
     after the screen is up (`ahead_`). The cost of a column is paid once, as before; it is no longer all
     paid before the first frame. A column whose markup predates this payload is drawn `fresh` whenever
     it is drawn (`PRE_PAYLOAD`), so a widget started on the boot's markup starts again in the payload's
     (331's "flyer maker beside You"). */
  const first = !FIRST_PAINT_DONE && !LOAD_FAILED;
  if (first) TABS.forEach(t => { if (t.id !== AT && screenHasMarkup_(t.id)) PRE_PAYLOAD.add(t.id); });
  if (!LOAD_FAILED) FIRST_PAINT_DONE = true;

  /* AND THE WHOLE SEQUENCE, in the one order it may happen in — see `repaint`. Around the box somebody
     is typing in, if they are: see `landRepaint_`. */
  landRepaint_();
  /* THE FIRST PAYLOAD IS A FACT, NOT A MAYBE — every column holding the boot's markup is drawn from it. */
  if (first) {
    PRE_PAYLOAD.forEach(id => { if (STALE[id]) STALE[id] = 1; });
    GLASS.cols.forEach(id => {
      if (id === AT || !STALE[id]) return;
      paint(id);
      if (!STALE[id]) { PRE_PAYLOAD.delete(id); if (PAGER[id]) paintPager(id, true); }
    });
    aheadOpen_();
  }
  openSharedPost();     // if the app was opened on a shared link, go to that post
  /* AND BACK TO THE QUESTION A RELOAD TOOK YOU AWAY FROM — once a visit, on the first payload that
     arrived, when the column came back too. See `findPlaceBack_` in find.js and docs/history/317. */
  if (!LOAD_FAILED && typeof findPlaceBack_ === 'function') findPlaceBack_();
}

/* ---------- THE SPLASH, OFF AND ON ---------------------------------------------------------------
   Two lines, named, because they are called from three places — the load finishing, the boot
   failing, and a retry — and three copies of `classList.add('done')` is three chances for one of
   them to be spelt differently. */
/* ---------- AND THE LINE UNDER IT, WHICH ONLY A SLOW LOAD EVER SEES ------------------------------
   THE SPLASH SAID NOTHING FOR A WHOLE MINUTE. Measured with the backend answering nothing: the
   deadline in `load()` is sixty seconds — and the note over it explains why it is not less, because
   this backend answers in about fifteen and a deadline shorter than the thing it times reports a
   healthy backend as a dead one. So the honest floor on "how long can this take" is a minute, and
   for all of it the animation played over an app that was getting no answer, with nothing on screen
   telling "still trying" from "stuck".

   FIFTEEN SECONDS, FROM THE SAME MEASURED NUMBER THE DEADLINE IS BUILT ON. Past the backend's own
   normal time, so an ordinary load never sees it and a slow one says so rather than sitting there.
   One number, one place, derived from the one already written down rather than guessed at
   separately — which is the fault this file records every time a figure is stated twice.

   IT IS CLEARED WHEREVER THE SPLASH IS, because the two are one state: a splash that has lifted
   with the line still on it would be a sentence about loading over a loaded app. */
const SPLASH_SAY_AFTER = 15000;
let splashSayTimer = null;
/* The one that draws the app on its files rather than the one that says it is slow -- see `load`. */
let splashEarlyTimer = null;
function splashSay_(on) {
  const el = $('splash-wait');
  if (el) el.hidden = !on;
}
function splashWaitWatch_() {
  clearTimeout(splashSayTimer);
  splashSay_(false);
  /* ONLY WHILE THE SPLASH IS ACTUALLY UP. `load()` runs again on every retry, on signing in and
     whenever the payload is refreshed, and by then the splash is long gone — a line about loading
     appearing over a working app is worse than the silence it replaces. */
  const sp = $('splash');
  if (!sp || sp.classList.contains('done')) return;
  splashSayTimer = setTimeout(() => {
    const now = $('splash');
    if (now && !now.classList.contains('done')) splashSay_(true);
  }, SPLASH_SAY_AFTER);
}
/* ---------- WHAT THE NEXT LOAD'S SPLASH IS CHOSEN FROM ----------------------------------------------
   THE SPLASH IS CHOSEN WHILE THE PAGE IS STILL PARSING — that is what makes it right on the first
   frame — so it cannot ask `DATA` anything, and it cannot fetch. It reads what the last visit left in
   this device's storage instead: one load behind, which for a decorative choice nobody will notice,
   and the alternative is a splash that changes after it appears.

   `splashOff` IS THE SHEET'S RETIRED SPLASHES, as `settingsInto_` reads them off
   data/settings/splashes.json. Written only when that file came back with rows: a fetch that failed
   is not the sheet saying "retire nothing", and writing `[]` for it would bring every retired splash
   back until the next good load. It was written once before, from the payload and before the file had
   been read, which is why no splash retired in the sheet ever left anybody's phone.

   AND THE TEACHING ANIMATIONS THEMSELVES. "The animation from loading screen are pulling and syncing
   from the text book animations" — the owner, 8 Oct. The books are where each one lives (a row of
   data/textbooks.json under its chapter, `libraryExtras_`); the splash draws from a copy kept here:
     `splashAnims`        {f, ids, h}: the shape's number, the ids in the books' order, each one's hash
     `splashAnim:<id>`    {h, html, css}: one drawing, exactly as its row has it
   A drawing is written again only when its hash moved, so a load where nothing changed writes one
   small index. The index goes LAST and names only what was written, so a load cut off half way leaves
   either the old index or none — never one that names a record that is not there; and the picker
   checks every record's hash against the index before it draws, so a damaged one costs the still
   splash (the name and the loader) and a full rewrite next time, never a garbled screen.
   A FAILED FETCH LEAVES THE COPY ALONE, for the reason a failed splashes file leaves `splashOff`.
   OUT OF STORAGE, THE WHOLE COPY GOES (`splashGiveWay_`). This said "out of storage on one drawing
   leaves that one out, and nothing else is touched … a child's saved answers and drawings cannot be
   pushed out by a loading screen", and both halves were true word for word and the effect was the
   opposite: a `setItem` that throws evicts nothing, so the drawings that DID fit stayed — in the last
   free space on the device, where a child's next answer needed to go. Measured on a store with about
   100 000 characters free: fourteen drawings kept, and a 2 000-character answer then refused, which
   `ansLocalPut_` swallowed, so a child who was not signed in lost it on reload. And on a store with
   room for the 27 but not for the index after them, all 27 were written, the index failed, and the
   27 stayed behind with nothing naming them — never drawn, rewritten whole on every load, the index
   failing again each time. A decoration has no claim on the last of the room. So: any write here that
   throws takes the index and every `splashAnim:` key with it, and the splash is the still name and
   the loader, as on a first visit; the next load tries again from nothing. And a child's write that throws
   (`ansLocalPut_`, answers.js) takes the copy away and tries once more, so a copy that fitted
   yesterday cannot hold space a child needs today. WHAT IS GUARANTEED, then: this never removes
   anything but its own keys, never keeps a part-copy after a refusal, and never stands between an
   answer or a drawing and the store. Other writes (`favs`, the signed-in user) are not covered.
   `SPLASH_CACHE_MAX` is the ceiling on the lot, in a 5 MB store shared with everything else this app
   keeps. THE 28 COME TO ABOUT 173 000 OF ITS 200 000 — this said "about twice" when it was written,
   before the rows were real, and it was not. The room left is a few drawings, not twenty-eight; a
   drawing past the ceiling is left off the splash (never out of its chapter), and `check-anims.js`
   fails before the books get there, so raising it is a decision made in the open.
   `SPLASH_CACHE_F` IS THE SHAPE. The picker in index.html reads `f === 1` written out, because it runs
   before any of this file exists; `check-anims.js` holds the two to the same number. Change the shape
   and both move, and every device starts again from an empty copy. */
const SPLASH_CACHE_F = 1;
const SPLASH_CACHE_MAX = 200000;
function splashSync_(d, extra) {
  const rows = extra && extra['settings/splashes'];
  if (rows && rows.length) {
    try { localStorage.setItem('splashOff', JSON.stringify((d && d.splashOff) || [])); } catch (e) {}
  }
  const tb = extra && extra.textbooks;
  if (!tb || !tb.length || !d || !d.textbooks || !d.textbooks.length) return;
  let was = null;
  try { was = JSON.parse(localStorage.getItem('splashAnims') || 'null'); } catch (e) { was = null; }
  const old = was && was.f === SPLASH_CACHE_F && was.h && typeof was.h === 'object' ? was.h : {};
  const idx = { f: SPLASH_CACHE_F, ids: [], h: {} };
  let size = 0, full = false;
  d.textbooks.forEach(b => (b.chapters || []).forEach(c => (c.animations || []).forEach(a => {
    if (full || !a || !a.id || idx.h[a.id]) return;
    const n = String(a.html).length + String(a.css).length;
    if (size + n > SPLASH_CACHE_MAX) return;
    if (old[a.id] !== a.h) {
      try { localStorage.setItem('splashAnim:' + a.id, JSON.stringify({ h: a.h, html: a.html, css: a.css })); }
      catch (e) { full = true; return; }
    }
    size += n;
    idx.ids.push(a.id);
    idx.h[a.id] = a.h;
  })));
  /* A REFUSED WRITE GIVES THE WHOLE COPY BACK — see above. Before the sweep, which would only be
     tidying what is about to go. */
  if (full) { splashGiveWay_(); return; }
  /* EVERY KEPT DRAWING THE BOOKS NO LONGER HAVE GOES, and so does one left half-written by a load that
     stopped. Only this file's own prefix: nothing else in the store is this function's to touch. */
  try {
    const gone = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('splashAnim:') === 0 && !idx.h[k.slice(11)]) gone.push(k);
    }
    gone.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
  /* AND AN INDEX THE STORE REFUSES TAKES ITS DRAWINGS WITH IT: without it nothing can name them, so
     they are room taken for a splash nobody will be shown. */
  try { localStorage.setItem('splashAnims', JSON.stringify(idx)); }
  catch (e) { splashGiveWay_(); }
}
/* THE WHOLE KEPT COPY, OUT: the index and every drawing, and nothing that is not this file's own
   prefix. Called when the store refuses a write — here, or a child's in `ansLocalPut_` — and answers
   whether there was anything to give, so the caller knows whether trying again can help. */
function splashGiveWay_() {
  const gone = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === 'splashAnims' || k.indexOf('splashAnim:') === 0)) gone.push(k);
    }
    gone.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
  return gone.length > 0;
}
function splashOff_() {
  clearTimeout(splashSayTimer); clearTimeout(splashEarlyTimer); splashSay_(false);
  const el = $('splash'); if (el) el.classList.add('done');
  /* AND OUT OF THE DOCUMENT ONCE IT HAS FADED. `done` hides it, and a hidden splash still runs its
     endless animations — one kept eight of them restyling on every frame, drags included. Half a
     second is past the fade; `splashOn_` puts it back. */
  /* AND A DRAWING THE PICKER PUT ON IT FROM THE BOOKS' COPY GOES WITH IT, back to the still name and
     the loader — so a Try again (`splashOn_`) shows the app waiting rather than an empty black screen
     whose class names a root that is no longer there. It went back to the tag until the tag was
     deleted (docs/history/322); the loader is the truer answer anyway, because a Try again IS a wait.
     The drawing's `<style>` stays: a chapter page may be using it. */
  if (el) setTimeout(() => {
    if (!el.classList.contains('done')) return;
    el.style.display = 'none';
    const root = el.querySelector(':scope > [class|="an"]');
    if (root) root.remove();
    if (el.classList.contains('is-an')) { el.classList.remove('is-an'); el.classList.add('is-still'); }
  }, 500);
}
function splashOn_()  { const el = $('splash'); if (el) { el.style.display = ''; el.classList.remove('done'); } }

/* `tap` IS OPTIONAL AND EVERY OLD CALLER PASSES NOTHING, which is why it is a second argument
   rather than a second function: a banner that says a column is missing is a statement, and one
   that says a newer version is ready is a door. Same strip, same place, and the only difference is
   whether pressing it does anything.

   THE ACTION IS WRITTEN OUT HERE RATHER THAN PASSED IN, and that is for the checker rather than for
   the code: `check-doors.js` reads `setAttribute('data-do', 'x')` with a LITERAL and cannot follow
   a variable — so an action handed in as an argument becomes a handler it reports as unreachable,
   which is a red with nothing behind it. There is one thing this strip can ever do, so it says
   which one. */
function banner(msg, tap) {
  const el = $('banner');
  if (!msg) { el.classList.add('hidden'); el.removeAttribute('data-do'); return; }
  el.textContent = msg;
  if (tap) el.setAttribute('data-do', 'reload-build'); else el.removeAttribute('data-do');
  el.classList.remove('hidden');
}

/* ================================================================================================
   THE VERSION THE SERVER HAS, ASKED FOR RATHER THAN ASSUMED

   REPORTED FROM A PHONE, WITH A SCREENSHOT: the Reels column looked exactly as it had the day
   before. Measured from the other end — GitHub had built and deployed the new files an hour before
   that screenshot, and the screen was drawing a FACT, which the code on the server cannot do. So
   the phone was holding files from at least fifteen hours earlier, across a deploy, and nothing
   anywhere said so.

   AND THAT IS THE SHAPE THIS REPOSITORY ALREADY KNOWS: "my fix did not work" against "I am looking
   at yesterday's file" cost this project eleven hours once, and the whole `LOAD` / `sw.js`
   arrangement exists because of it. What that arrangement gets right is the RELOAD: open the site
   again and the new deploy arrives. What it cannot do is notice, because a tab that is never
   reloaded never asks — an app left open on a phone yesterday is showing yesterday for as long as
   it is left open, and switching back to it is not a reload.

   SO IT ASKS, ONCE, WITH A HEAD REQUEST. The entry point's own `ETag` is the server's answer to
   "which build is this" — no version file to bump, no second stamp to keep in step with the first,
   and nothing new for anybody to remember. Held at boot and compared when the tab is returned to.

   AND IT NEVER RELOADS BY ITSELF. `purge()` is a few lines down and its note is the reason: a
   reload nobody asked for is an infinite loop one mistake away, and this project has already
   written that loop once. The banner is a sentence and a tap.
================================================================================================ */
let BUILD_TAG = null;
/* THE SERVER'S `Last-Modified` FOR THE ENTRY POINT, as a time — against the one this page was built
   from. See `bootStale_`. */
let BUILD_AT = 0;
let BUILD_ASKED = 0;
/* WHEN THE PAGE WENT AWAY, so a resume can be told from an app-switch. See `checkBuild_`. */
let BUILD_HID = 0;
/* The number is `AWAY_AGAIN`, up beside `TAB_HOME`, because two things now ask it. */

/* HEAD, so nothing is downloaded, and `no-store` so the answer is the server's rather than the
   browser's copy of it. `sw.js` returns early on anything that is not a GET, so this goes past the
   worker to the network — which is the whole point of asking. */
async function buildTag_() {
  try {
    const res = await fetch(location.pathname.replace(/[^/]*$/, '') + 'index.html',
                            { method: 'HEAD', cache: 'no-store' });
    if (!res || !res.ok) return null;
    BUILD_AT = Date.parse(res.headers.get('last-modified') || '') || 0;
    return res.headers.get('etag') || res.headers.get('last-modified') || null;
  } catch (e) { return null; }
}

async function watchBuild_() {
  /* NO SIGNAL MEANS SAY NOTHING. A server that sends neither header cannot be compared against,
     and a banner drawn on a guess is the fault this file records about `figure` and about the
     boot check that killed the page: a confident sentence with nothing behind it. */
  BUILD_TAG = await buildTag_();
  if (!BUILD_TAG) return;
  bootStale_();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { BUILD_HID = Date.now(); return; }
    checkBuild_();
  });
  /* ---------- AND `pageshow`, BECAUSE OF THE HOME SCREEN ------------------------------------------
     THIS SITE IS AN INSTALLED APP ON A PHONE. The manifest says `display: standalone` and
     `apple-mobile-web-app-capable` is in the head, so an icon added to the home screen opens a
     window with no address bar, its own storage, and — the part that caused this — iOS SUSPENDS AND
     RESUMES it rather than reloading it. A web app left open yesterday is yesterday's page, restored
     from a snapshot, with no request made at all.

     THAT ALSO TAKES `?dev` AWAY. There is nowhere to type it, and the standalone window does not
     share Safari's copies, so clearing it there clears the wrong one. Which makes this banner the
     only door out that somebody holding the phone can actually reach.

     BOTH EVENTS, because a restore is not always a visibility change: `pageshow` with
     `persisted: true` is the page coming back from the browser's own hold, and the two fire in
     different orders on different systems. `checkBuild_` is rate-limited, so two of them is one
     request. */
  window.addEventListener('pageshow', e => { if (e && e.persisted) checkBuild_(); });
}

async function checkBuild_() {
  /* NOT ON EVERY GLANCE. Switching apps twice in a minute is not two deploys, and a HEAD per
     switch is a request nobody asked for on somebody's data. */
  if (Date.now() - BUILD_ASKED < 30000) return;
  BUILD_ASKED = Date.now();
  const now = await buildTag_();
  if (!now || !BUILD_TAG || now === BUILD_TAG) return;
  if (buildMayReload_(now) && buildMark_(now)) {
    location.reload();
    return;
  }
  banner('A newer version of the app is ready. Tap to load it.', true);
}

/* ---------- AND ON A HOME SCREEN, IT LOADS ITSELF --------------------------------------------------
   ASKED FOR AS "can you make it so added to homescreen version will always be up to date?". The
   banner above was the answer while the only safe thing to do was ASK, and in an installed app that
   is a sentence somebody has to notice and tap on a screen they opened to do something else.

   THE REASON IT ONLY ASKED IS FOUR LINES BELOW THIS FUNCTION and it is not a small one: `purge()`
   called `location.reload()` and became an infinite loop the day the site installed a worker of its
   own — register, purge, reload, register. For every visitor, with the app never finishing opening.

   SO THE THREE THINGS THAT MAKE THAT IMPOSSIBLE HERE, and each is doing a different job:

   1. IT CANNOT LOOP, because the reload is remembered against the TAG it was for. `purge`'s loop
      was unconditional; this one has a fact to compare against, and a build that reloads and still
      reports a different tag is a build that reloads once and then asks. `sessionStorage` rather
      than `localStorage` deliberately — it survives the reload and dies with the window, so
      tomorrow's first open is judged on its own.
   2. IT ONLY HAPPENS ON A RESUME, not on an app-switch. Six minutes away is somebody opening the
      app again; twenty seconds is somebody answering a message. Reloading under the second is
      taking the screen away from somebody who is using it.
   3. IT NEVER THROWS ANYTHING AWAY. An answer box persists on every keystroke and the notepad saves
      as you type, so those are safe to reload over. A message being composed, a comment being
      written and a profile being edited are NOT — nothing has been written down and a reload loses
      the lot. Anything typed and unsaved holds the reload and gets the banner instead, which is the
      right answer for somebody mid-sentence.

   ON A DESKTOP TAB THIS ALMOST NEVER FIRES, and that is correct rather than a limitation: a tab left
   open is one somebody is working in. The case this is for is an icon on a home screen opened the
   next morning, where iOS resumes a snapshot rather than loading anything. */
function buildMayReload_(tag, booted) {
  /* 1. NOT TWICE FOR ONE BUILD. */
  try { if (sessionStorage.getItem('familyBuiltFor') === tag) return false; } catch (e) { return false; }
  /* 2. A RESUME, NOT A GLANCE. `BUILD_HID` is 0 before the page has ever been hidden, which is the
        first load — and reloading the load somebody just made is the loop this is avoiding.
        EXCEPT A PAGE THAT OPENED OLDER THAN THE SERVER (`booted`, see `bootStale_`): that is not a
        guess about a glance, it is a measured fact about the file, and 1 is what stops it looping.
        Only in the first seconds, while there has not been time to start anything a reload loses;
        after that it is the banner, the same as a resume too short to reload under. */
  if (booted) {
    const sp = document.getElementById('splash');
    const up = !!(sp && !sp.classList.contains('done'));
    if (!up && !(typeof performance !== 'undefined' && performance.now() < SPLASH_SAY_AFTER)) return false;
  } else if (!BUILD_HID || Date.now() - BUILD_HID < AWAY_AGAIN) return false;
  /* 3. NOTHING TYPED AND UNSAVED. `qp-ans` writes to localStorage on every keystroke and the
        notepad does the same, so both survive a reload — and so does every box carrying a DRAFT
        (`data-draft`, data.js), drawn again holding it; everything else in a box would not. */
  const typed = [].slice.call(document.querySelectorAll('textarea, input[type="text"], input:not([type])'))
    .filter(el => String(el.value || '').trim())
    .filter(el => el.getAttribute('data-do') !== 'qp-ans' && el.id !== 'notepad' && !el.hasAttribute('data-draft'));
  /* 4. NOTHING THE STORE REFUSED — that is in this page and nowhere else, and a reload is the loss
        (`keepAtRisk_`, data.js; 317). */
  if (typeof keepAtRisk_ === 'function' && keepAtRisk_().length) return false;
  return !typed.length;
}

on('reload-build', () => location.reload());

/* ---------- THE MARK THAT STOPS A SECOND RELOAD, WRITTEN AND READ BACK BEFORE THE FIRST --------------
   "IT CANNOT LOOP" RESTED ON A WRITE NOBODY CHECKED. `setItem` was in a `try` that swallowed its
   failure and the reload went ahead regardless — and found by review: a store that refuses the write
   (full, or Safari's private mode before iOS 11, where `getItem` answers null and `setItem` throws)
   booted the same stale page three times and reloaded three times, with nothing to stop a fourth.
   `buildMayReload_`'s read fails closed only when `getItem` THROWS. So the reload goes only when the
   mark can be read back; otherwise it is the banner and a tap, which cannot loop. */
function buildMark_(tag) {
  try {
    sessionStorage.setItem('familyBuiltFor', tag);
    return sessionStorage.getItem('familyBuiltFor') === tag;
  } catch (e) { return false; }
}

/* ==================================================================================================
   A PAGE THAT OPENS OLDER THAN THE SITE IT CAME FROM REFRESHES ITSELF, ONCE.

   THE OWNER'S SCREENSHOT OF 9 OCT DATED ITS OWN ENTRY POINT. Its footer line read "site 06 Oct at
   14:32 · css 2026-10-09-films-from-notflix": the stylesheet of that morning's deploy under an
   `index.html` three days old. Not a misleading stamp — the minute is exactly when GitHub Pages built
   PR #129 (its run started 13:32:33 UTC on 6 Oct, 14:32 on a phone in London), nine more Pages builds
   had succeeded since, the last forty minutes before the screenshot, and that page's `window.FILES`
   has no `answers` in it, so the phone was running the newest code minus a whole file. It is the PAGE
   that was old, and the page decides which files exist.

   HOW IT WAS HELD IS NOT SETTLED, AND THE TWO HALVES OF THE STORY DO NOT FIT. Each `?t=` comes from the
   page's own stamp, so a 6 Oct page asks for 6 Oct URLs, which `sw.js` answers from its store unless
   those paths were since re-filed under a later build's URLs (`file()` drops the old key then) — yet
   a later build loaded on that phone went through `page()`, which re-files index.html on every
   navigation that reaches the network and would have replaced the 6 Oct copy. Nothing that would say
   which half is wrong can be measured from here (the live site is behind the proxy).

   `watchBuild_` COULD NOT SEE IT, because it compares the server with the SERVER: the tag is taken at
   boot, from a HEAD, and only a later change raises the banner — a page that boots stale records the
   current tag as its baseline and is satisfied for ever. What knows which build is RUNNING is the
   page's own `Last-Modified`, which index.html already reads as `LOAD_AT` (the footer's stamp).

   SO THE TWO ARE COMPARED, ONCE, AT BOOT. The server's newer by more than a minute — a deploy, not a
   clock — and the page reloads, under the three rules of `buildMayReload_`: once per build (a reload
   that is still stale finds its own tag in sessionStorage and gets the banner — and the reload goes
   only when that mark reads back, `buildMark_`), only in the first seconds, and never over something
   typed. A server that sends no `Last-Modified` gives nothing to compare and nothing happens; an older
   one never reloads anything.

   WHAT IT DOES NOT COVER, said rather than assumed. It runs only after its HEAD reached the server, so
   a reload normally reaches it too; but if the old page is `page()`'s own fallback because the
   navigation keeps failing while the HEAD gets through, the reload returns the same copy, and so does
   the banner's tap — a sentence that does nothing, though not a loop. A page RESTORED rather than
   booted (an iOS resume) never runs this; `checkBuild_` is the resume's. If the stale entry point
   comes back with the network up, the lever not yet pulled is `page()`'s `fetch(req)` in sw.js — its
   own note records `cache: 'no-cache'` tried there and taken out because `check/deploy.js` passed with
   and without it, and names it as the line to change if the stale page came back. Not changed here:
   how this one was held is not known, and a service-worker change is a deploy of its own. */
function bootStale_() {
  const mine = typeof window.LOAD_AT === 'number' ? window.LOAD_AT : 0;
  if (!mine || !BUILD_AT || BUILD_AT - mine < 60000) return;
  if (buildMayReload_(BUILD_TAG, true) && buildMark_(BUILD_TAG)) {
    location.reload();
    return;
  }
  banner('A newer version of the app is ready. Tap to load it.', true);
}

/* ---------- NOTHING MAY BE HELD — AND THEN SOMETHING DELIBERATELY WAS -----------------------------
   `purge()` WAS HERE AND IT UNREGISTERED EVERY SERVICE WORKER ON EVERY LOAD, emptying every cache
   with it. Its argument was sound for as long as it was true: a worker outlives a reload, a hard
   reload and on some browsers clearing history, and while one is installed it can serve a file from
   months ago whatever the server sends — which looks exactly like an edit not saving. It ended
   "This project has never deliberately registered one."

   IT DOES NOW. sw.js is ours, and what this function did to somebody else's leftover it did to
   ours: the store came back holding one entry, every load, with nothing anywhere saying why.

   THIS COPY WAS THE DANGEROUS ONE. Finding a worker, it unregistered it and then called
   `location.reload()` — right when the only worker that could exist was an accident, and an
   infinite loop the moment the site installs one on purpose: register at `load`, purge on the next
   open, reload, register, purge. On a live site, for every visitor, with the app never finishing
   opening. It would not have shown up in any check here; the harness that found the first copy
   found this one by reading the file it was in.

   THE ESCAPE IT PROVIDED IS STILL THERE AND IT IS `?dev`, which unregisters the worker and empties
   the store — the publisher's link that already existed for exactly this class of problem. See the
   registration and the long note at the foot of index.html.
--------------------------------------------------------------------------------------------- */