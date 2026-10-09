/* ==================================================================================================
   @family. — collections.js
   THREE COLUMNS THAT ARE ONE IDEA.

   Spotlight, Favourites and Basket are the same screen three times: a SET OF KEYS, and the cards
   for whatever those keys name. Nothing here knows what a tutor or a past paper is — it asks
   `stuffItems()` for everything findable and keeps the rows whose key is in its set, which is why
   a kind added to Find next month appears in all three of these without anybody coming back here.

   WHAT DIFFERS IS ONLY WHERE THE SET COMES FROM:

     Spotlight   admin's, and everybody's. One list, kept in the `spotlight` tab, shown to all.
     Favourites  the person's, kept in `FAVS` and synced per row to the `favourites` tab.
     Basket      the person's, kept in `CART` in localStorage, and not yet sent anywhere.

   LOADED AFTER `find` AND `resource`, because it reads `stuffItems`, `stuffCard`, `FAVS` and
   `CART` and all four live there. index.html lists the order; the list is the order.
================================================================================================== */


/* ---------- HOW MANY CARDS TO A PAGE -------------------------------------------------------------
   THE SAME EIGHT FIND USES. A different number on a screen that draws the identical cards is a
   difference somebody has to notice and then explain, and there is no reason for one. */
const COLL_PER = 8;


/* ---------- THE SPOTLIT SET ----------------------------------------------------------------------
   NOT PER PERSON, which is the whole difference between this and a favourite. A favourite is a
   statement about you and a spotlight is a statement about the business — so it is one list, it is
   the same list on every phone, and only an admin can change it.

   FROM THE PAYLOAD ONLY. There is no localStorage fallback here on purpose: a favourite that
   survives a bad connection is your own mark and worth keeping, while a spotlight remembered from
   last week is the site telling somebody the business is promoting something it has stopped
   promoting. Empty is the honest answer when the payload has not landed. */
let SPOT = new Set();

/* ---------- THE SHEET IS THE AUTHORITY THE MOMENT IT HOLDS A ROW, AND THE FILE IS THE FLOOR -------
   THE BACKEND DEPLOY IS BLOCKED and has been for weeks — `pullFromGitHub` on the Cloud-project
   switch, clasp unconfigured — so a feature whose only source is a tab is a feature that does
   nothing until somebody runs a sync. The front end reaches Pages in a minute. That gap is exactly
   what `factsNow_` and `clipsNow_` are shaped for, and this is that rule a third time: ask the
   sheet, fall through to what is committed here when it has nothing.

   WHICH WAY ROUND IT GOES IS THE OPPOSITE OF `settingsInto_`, and getting it backwards would break
   the control. Those nine tabs became files because nothing writes to them; this one an ADMIN
   writes to from the phone, so a file that WON would silently throw away every tap. The sheet wins.

   AND A ROW SWITCHED OFF IS STILL A ROW, which is why `spotlight` in dopost.gs sets a cell rather
   than deleting one. An admin who cleared the window would otherwise leave an empty tab, fall
   through to the file, and watch the things they had just removed come straight back.

   `DATA.spotlight` ABSENT IS NOT THE SAME AS EMPTY. `doGet` sends the key only when it managed to
   read the tab — a read that threw deletes it — so an absent key means "no answer" and an empty
   array means "an admin has emptied the window on purpose". Reading a failure as an empty list is
   this repository's oldest fault and the one `nothingHere` exists for. */
function spotNow_() {
  const sheet = (DATA && DATA.spotlight);
  /* AN ARRAY IS THE ANSWER, EMPTY OR NOT. This tested `sheet.length`, so an admin who took the last
     thing out of the window got `[]` back — and `[]` fell through to the committed file, which puts
     straight back whatever the file holds: the resurrection the note above says a switched-off row
     prevents, happening anyway. The payload sends only the rows switched ON, so an emptied window
     and an unused tab both arrived as `[]`; `doGet` tells them apart now by sending NO key for a tab
     with no rows at all, which is the one case the file is the floor for. */
  if (Array.isArray(sheet)) return sheet.map(String);
  const file = (DATA && DATA.spotlightFile) || [];
  return (Array.isArray(file) ? file : []).map(String);
}

function adoptSpotlight_() {
  SPOT = new Set(spotNow_());
}

const isSpot = k => SPOT.has(String(k));

/* Toggled by an admin, and saved one row at a time for the reason `favourite` is: writing a whole
   list back is a read-modify-write, and two admins on two phones would lose one of the two taps. */

/* ---------- ONE PLACE THAT SAYS WHETHER A KEY IS SPOTLIT, AND EVERYTHING THAT SHOWS IT FOLLOWS ------
   REPORTED AS *"spotlight is a bit buggy. if i unspotlight something for example it doesnt feel like
   it responds as it is still there in spotlight tab."* Measured: the tap changed `SPOT` and the word
   on the tile, and nothing else — so the card stayed on the Spotlight column, which is the one screen
   whose whole content is that set. THE UNSTAR-FROM-SAVED FAULT, ONE COLUMN ALONG, and the answer is
   the same three cases `on('fav')` records: on Spotlight the card IS a page, so the column is rebuilt
   and its position clamped; everywhere else the card stays and is correct, and what is out of date is
   the Spotlight column you are not on, which is marked `STALE` rather than redrawn.

   AND `DATA.spotlight` MOVES WITH THE SET. `adoptSpotlight_` rebuilds `SPOT` from it on every load,
   so a tap that changed only the set would be undone by the next `load()` that landed before the
   write did — a payload fetched a moment before the POST finished, holding the old list. Writing the
   set back into the payload's own key means every reader, and every re-adoption, sees the tap.
   Written as an array whatever it was before, because an admin's tap IS a row in the tab: from that
   moment the tab is the authority, which is `spotNow_`'s own rule.

   THE TILE IS FOUND BY KEY, not handed in, because a repaint has already replaced the element that
   was pressed — the one in the hand is detached by the time a refusal comes back. */
function spotSet_(key, on) {
  if (on) SPOT.add(key); else SPOT.delete(key);
  try { DATA.spotlight = Array.from(SPOT); } catch (e) {}
  const label = on ? 'Spotlit' : 'Spotlight';
  document.querySelectorAll('[data-do="spot"]').forEach(el => {
    if (el.getAttribute('data-key') === key) tileSet_(el, { label: label, on: on });
  });
  TABS.forEach(t => { if (t.id !== AT) STALE[t.id] = 1; });
  if (AT === 'spotlight') repaint(true);
}

function toggleSpot(k, kind) {
  if (!isAdmin()) return;
  const key = String(k);
  const want = !SPOT.has(key);
  /* AT ONCE, BEFORE THE SERVER HAS SAID ANYTHING. The backend answers in seconds; a card that stays
     on the Spotlight column for that long after being taken off it is the complaint. The set is put
     back below if the write is refused, so the screen never disagrees with the sheet for longer than
     one round trip. */
  spotSet_(key, want);

  /* ---------- THIS CALLED `send` WITH TWO ARGUMENTS AND `send` TAKES ONE ------------------------
     `send(body)` passes its single argument straight to `api`. Written as
     `send('spotlight', { … })` the body was the STRING "spotlight" and the whole object, name,
     itemId, kind and all, was dropped on the floor before the request was built.

     AND `.catch(() => {})` MADE IT LOOK LIKE IT WORKED. The set had already changed, so the tile
     lit the moment it was pressed; the request then failed and the empty catch discarded the
     failure without a word. An admin spotlights six things, sees six, reloads, and has none — with
     nothing anywhere having said no. `send` throws on a refusal, and the catch below says so. */
  send({
    action: 'spotlight',
    name: USER.name,
    /* ---------- AND THE ID, BECAUSE A NAME IS A CELL SOMEBODY CAN EDIT ------------------------
       `findPerson` FALLS BACK TO MATCHING THE NAME when no id comes, which is right for a row
       typed into the sheet before anybody has one and silently wrong the day two people share a
       name — the denial `changePin` already caused for real, to one person. `check-post.js` asks
       exactly one question, that a handler reading `body.personId` is sent one, and it named this
       call the moment the handler existed. */
    personId: (USER && USER.personId) || '',
    /* THE KEY GOES ACROSS WHOLE and the kind is passed separately, for the same reason the star
       does it: some keys are a bare title and some are prefixed, and splitting on the colon turns
       a venue called "Colliers Wood Library" into a kind. */
    kind: kind || 'item', itemId: key,
    on: want ? 'TRUE' : '',
  }).then(res => {
    /* RECONCILED WITH WHAT THE SHEET NOW HOLDS. The handler answers `{ on }`, and where that is a
       boolean that disagrees with the tap it wins — the sheet is the authority and the phone was a
       guess. Only while nobody has pressed the same tile again: a second tap in flight is a newer
       intention than this reply. */
    if (res && typeof res.on === 'boolean' && res.on !== want && SPOT.has(key) === want) {
      spotSet_(key, res.on);
    }
  }).catch(err => {
    /* PUT BACK WHAT WAS NOT SAVED, and only if it is still what this tap left — a second tap has
       already said something newer. Leaving the card on (or off) the column after the save failed
       is the lie this was built on. */
    if (SPOT.has(key) === want) spotSet_(key, !want);
    toast(String((err && err.message) || 'That did not save'));
  });
}

on('spot', el => {
  /* THE TILE, THE PAYLOAD'S COPY AND THE COLUMN ARE ALL DONE IN `spotSet_`, so the press and the
     refusal that may undo it go through one function rather than two that could disagree. */
  toggleSpot(el.getAttribute('data-key'), el.getAttribute('data-kind'));
});


/* ---------- A SET, AS CARDS ----------------------------------------------------------------------
   ONE FUNCTION FOR ALL THREE, because the only thing that varies is the test. */
/* ---------- LOOKED UP IN EVERY ITEM, NOT IN THE ONES THE FUNNEL IS OFFERING ----------------------
   THIS READ `stuffItems()` AND THAT IS THE FILTERED LIST. The funnel takes Booking out of what it
   OFFERS — see `FUNNEL_NOT_FOR` in find.js — and this turned that into "your starred tutor has
   disappeared", silently, on the one list in the app whose entire job is to not lose things. The
   row was still in the `favourites` tab, the star still posted, and the card was simply not found.

   A DECISION ABOUT WHAT TO ASK IS NOT A DECISION ABOUT WHAT SOMEBODY KEPT. `stuffItemsAll_` is
   every item the app has, memoised the same way, so a thing stays saved whatever the funnel is
   asking this week — and a kind taken out of the funnel next year cannot empty this list either.

   FOUND BY AUDITING FAVOURITES on the same afternoon the funnel changed, which is the only reason
   it is not a fault somebody reports in a month as "my saved things vanished". */
function collItems_(has) {
  const all = typeof stuffItemsAll_ === 'function' ? stuffItemsAll_()
            : (typeof stuffItems === 'function' ? stuffItems() : []);
  const kept = all.filter(x => x.key && has(x.key));
  /* AND THE BIBLE'S VERSES, WHICH ARE ON NO LIST HERE. A verse is not one of Find's items (see the head
     of the Bible section in find.js), so a starred one has to be looked up by its key — which is its
     address — or every star on a verse would be a card that vanished from the one column whose job is
     to keep it. Nothing for anybody but an admin, and nothing built unless a kept key is a verse. */
  return typeof bibleKept_ === 'function' ? kept.concat(bibleKept_(has)) : kept;
}

/* Empty is a SENTENCE, not a blank screen. A column with nothing in it and nothing to say reads as
   broken — and all three of these are empty for everybody on their first day. */
function collPages_(items, credits, empty) {
  if (!items.length) return [`<div class="card"><p class="note">${empty}</p></div>`];
  const out = [];
  for (let i = 0; i < items.length; i += COLL_PER) {
    out.push(items.slice(i, i + COLL_PER)
      .map(x => stuffCard(x, credits)).join(''));
  }
  return out;
}

const collCredits_ = () => (USER ? (USER.credits || 0) : 0);


/* ---------- SPOTLIGHT, ON THE FEED --------------------------------------------------------------
   IT WAS A COLUMN AND IT IS THE BUSINESS TALKING. Spotlight is what @family. has chosen to put in
   front of people — a tutor worth meeting, a class worth knowing about — which is the same act as
   posting a photograph with a caption. Two columns for one voice, and the quieter one cost a swipe
   on every screen whether or not anything was in it.

   ABOVE THE ＋, unlike the festive cards which sit just below it. The ＋ is a control for the
   person; spotlight is the thing the business most wants seen, and the top of the feed is where
   that goes. The order down the column is: what we are showing you, the way to add your own, what
   is happening soon, then everything posted.

   IT DRAWS NOTHING WHEN NOTHING IS SPOTLIT. The two sentences it used to show — one for an admin,
   one for everybody else — made sense on a column somebody had deliberately opened; an empty
   column with no explanation reads as broken. At the top of a feed they would be a permanent
   notice above every post, for everyone, saying nothing is there.

   THE ADMIN ONE IS WORTH KEEPING SOMEWHERE, and it is: pressing ✧ on a card is how a thing gets
   here, and that control says what it does. A sentence explaining a button is not the same as the
   button. */
function spotPages() {
  const items = collItems_(isSpot);
  if (!items.length) return [];
  const credits = collCredits_();
  /* THE WINDOW'S OWN CARDS KEEP THE ADMIN'S SPOTLIGHT TILE, even on a question -- see `SPOT_TILES` in
     tiles.js: Find draws a question the same for everybody, and this is not Find. */
  SPOT_TILES = true;
  try { return keptPages_(items, credits); }
  finally { SPOT_TILES = false; }
}

/* ---------- AND IT IS A COLUMN AGAIN, WHICH IS THE THIRD TIME IT HAS MOVED -----------------------
   ASKED FOR AS *"can you also make a spot light column after the saved column. what admin
   spotlights will appear there. similar to favourites but with admin in control and for all."*
   It WAS a column, and `TABS`'s own note lists Spotlight among the ones that were folded into the
   funnel. So this is a decision being reversed, and the reason it is not the mistake CLAUDE.md
   warns about is that the thing being reversed was never working: measured, `spotPages()` returned
   `[]` for everybody on every load, because there was no handler, no tab, and no payload key.
   A list that is always empty is a list whose home nobody could have judged.

   ONE HOME NOW, NOT TWO. It came off the front of the Find screen in the same commit — a page of
   business promotion in front of somebody's search results is the duplication this file already
   records producing twice, and two readers of one list is the `documents_()` fault. Which also
   repairs both pagers: `PAGER.feed` had gone on counting these pages after the feed stopped drawing
   them, and `PAGER.stuff` had never counted them while the Find screen did.

   THREE SENTENCES, NOT ONE, BECAUSE THERE ARE THREE STATES AND THEY ARE NOT THE SAME FACT. "I did
   not manage to look" printed as "I looked and there was nothing there" is this repository's oldest
   fault, and a column whose whole content comes off a payload is exactly where it lands. */
function spotlightCards_() {
  /* THE PAYLOAD DID NOT COME. `nothingHere` is the one thing that can tell a failed request from an
     empty list, and it draws the reason and a Try again. */
  if (typeof LOAD_FAILED !== 'undefined' && LOAD_FAILED && typeof nothingHere === 'function') {
    return [nothingHere()];
  }
  /* ---------- AND THE THIRD STATE WAS MISSING: NOT ARRIVED YET -----------------------------------
     THIS ASKED WHETHER THE PAYLOAD HAD FAILED AND NEVER WHETHER IT HAD COME. So for the fifteen
     seconds it takes, the column said "Nothing is being featured just now" — measured on 9 Oct with
     the payload held — over a window that was full and on its way. The note above calls that this
     repository's oldest fault, and it was one line short of avoiding it. While it is on its way the
     column is the one loader, as every column is (`loading_`, shell.js). */
  if (typeof LOADED !== 'undefined' && !LOADED && typeof loading_ === 'function') return [loading_()];
  const cards = spotPages();
  if (cards.length) return cards;
  /* AN ADMIN IS TOLD HOW TO FILL IT, because they are the only person who can — and a column that
     says "nothing here" to the one person able to change that is the fault `savedCards_` fixed on
     the column next door. Everybody else is told what the column is FOR, so an empty one reads as
     a shop window nobody has dressed rather than as a screen that failed. */
  const admin = typeof isAdmin === 'function' && isAdmin();
  return [`<div class="card"><h3>Spotlight</h3><p class="note">${admin
    ? `Nothing in the window yet.<br><span class="faint">Press <b>Spotlight</b> on a card — a
       tutor, a class, a thing in the shop — and it turns up here for everybody.</span>`
    : `Nothing is being featured just now.<br><span class="faint">This is where @family. puts the
       things worth a look.</span>`}</p></div>`];
}


/* ---------- FAVOURITES, ON THE FIND SCREEN --------------------------------------------------------
   THE STARS ALREADY EXISTED AND HAD NOWHERE TO GO. `FAVS` has been filled since favourites were
   built and nothing has ever listed it — you could mark a thing and then never find the marks.

   IT WAS A COLUMN OF ITS OWN AND IS NOT ANY MORE. Saved is not an errand — nobody opens the app
   in order to look at what they saved, they save something WHILE looking for something else, and
   then want it back the next time they are on that same screen. So it belongs under Find, which
   is where both halves of that happen, and the app is one swipe narrower for it.

   IT DRAWS NOTHING WHEN THERE IS NOTHING. The empty sentence made sense on a column somebody had
   deliberately opened — an empty column with no explanation reads as broken. Under a search box it
   is the opposite: a permanent "nothing starred yet" sitting above every result anybody ever looks
   at, saying nothing, for the whole time before they star their first thing.

   ---------------------------------------------------------------------------------------------
   ONE BOX EACH, AND THAT IS NOT WHAT `.card` GIVES YOU.

   A `.card` is not a box in this app — `background: none`, `border: 0`, one hairline underneath.
   It is a ROW. What reads as a box is the `.pane`, which is why every screen looks like a stack of
   panels: each panel is a pane and the cards are the lines inside it. So a run of `stuffCard`s
   dropped under the search box came out as more hairline rows on the search panel itself, which is
   the opposite of "its own widget".

   ---------------------------------------------------------------------------------------------
   ONE PAGE EACH, WHICH IS WHAT MAKES IT ITS OWN WIDGET.

   Two versions of this were wrong in the same way. Cards under the search box were rows on the
   search panel; boxes above it were still inside the search page's pane, sharing its scroll. Both
   were a thing sitting ON another thing, because a `.card` is a row and only a `.pane` is a box.

   A PAGE IS THE UNIT OF "ITS OWN WIDGET" HERE. Every other screen in the app already works this
   way — one pane, one thing, turned to rather than scrolled past — so a saved thing becomes a page
   like any result page, and it is styled by the rules that already exist rather than by a copy of
   them. All the CSS the box versions needed goes away.

   THEY COME BEFORE THE SEARCH PAGE, so what you kept is what you meet first and the question is
   the page after it. `savedPages_` returns the cards; `screen('stuff')` puts them in front. */
function savedPages_() {
  if (!USER) return [];
  const credits = collCredits_();
  /* A QUESTION'S KEPT PARTS TOGETHER, ITS OPENING ONCE -- see `keptPages_`. */
  return keptPages_(collItems_(isFav), credits);
}


/* ---------- BASKET --------------------------------------------------------------------------------
   NOT BUILT FROM `stuffItems`, and this is the one that is different. A basket line carries facts
   that belong to the LINE rather than to the thing — how many pages this printed copy runs to, and
   which of the two currencies it is priced in — so it is drawn from `CART` itself. Reaching back to
   the catalogue for a name would also mean a line silently changing price after it was added.

   IT IS ALSO THE ONLY WAY IN. `find.js` builds a `basket ‧ n` chip and hands it to `screen()` as a
   THIRD argument, which `screen(id, draw)` does not take — so the only `open-cart` control in the
   app has never been rendered. Things could go into the basket and nothing could open it. */
/* ---------- THE BASKET IS A TOOL NOW -------------------------------------------------------------
   ASKED FOR AS *"i want the cart to be a tool in the tool column ... it should just be consistent
   like everything else. should like slightly like booking widgets. but not fully as its only
   recording items and sheets and wether to upgrade a specific sheet to lamininated."*

   IT HAS BEEN A COLUMN, A SHEET, A PAGE OF FIND AND A PAGE OF BOOKING. Every one of those was the
   same difficulty: a basket is empty most of the time, so wherever it lives it is either a swipe
   that usually leads to nothing or a page that appears and disappears under somebody's thumb. A
   TOOL is the shape that does not have that problem — `widgetsOf_`'s own note says so: *"a column
   is the place you go to see all of them; hiding half of it because the calendar is empty this week
   is the column failing to be a place."* So the basket is always there, and when it is empty it
   says so in a card the same size as the one it will be.

   AND THAT IS ALSO WHY THE EMPTY STATE CAME BACK. It was deleted on the argument that *"an empty
   basket should be no basket"*, which is right for a page in front of a search box and wrong for a
   widget: a tool that draws nothing is a tool that reads as broken, which is this repository's
   oldest shape — *I did not manage to look*, printed as *I looked and there was nothing there*.

   "SLIGHTLY LIKE BOOKING WIDGETS" IS `receiptHtml`, AND IT ALREADY WAS. The basket and the booking
   are the same document — a list of things you are about to pay for, a total, and the button on the
   paper rather than under it — so this keeps the paper and changes where it hangs. The green
   terminal the complaint names went several commits ago, with the other three skins; the argument
   for its removal is kept below where the class was.

   ONE STRING, NOT A LIST OF PAGES. A widget is a card rather than a column, so there is nothing to
   page to and nothing to count. */
/* ---------- THE LAMINATE TOGGLE ON ONE BASKET LINE ------------------------------------------------
   ONE SWITCH, TWO STATES, AND THE PRICE IN BOTH. Off it says what it would cost; on it says what it
   is costing, so nobody has to take it off to find out. The ✕ next to it removes the whole line, so
   this one says "plain" rather than a second ✕ — two crosses on one row, meaning different things,
   is the sort of thing somebody presses once and then does not trust again.

   A REAL BUTTON, with a title, because the row is read by a thumb and by a screen reader and the
   label is three words either way. */
/* ---------- AND ON A PAPER NOBODY HAS COUNTED THE PAGES OF, TOO -----------------------------------
   IT RETURNED NOTHING when `laminatePrice` did, and `laminatePrice` answers null for two different
   reasons: the sheet has no rate (laminating is not offered) and the paper has no page count (it is
   offered and cannot be priced yet). The first is a reason not to draw the switch; the second is
   not — "laminate it" is a decision about the copy, and the price follows the count exactly as the
   print's does. 153 of the 266 papers with questions have no count, so the second case is most of
   what a bundle puts in here. `laminateOffered_` asks the first question on its own. */
function lamControl_(c) {
  if (!c || c.kind !== 'print') return '';
  if (typeof laminateOffered_ === 'function' && !laminateOffered_()) return '';
  const p = typeof laminatePrice === 'function' ? laminatePrice(c.pages) : null;
  const cost = p === null ? '' : ' ' + money(p);
  const at = ` data-key="${esc(c.key)}" data-kind="${esc(c.kind)}"`;
  /* ---------- ✓ LAMINATED, NOT "laminated · plain" ------------------------------------------------
     `laminated £7.00 · plain` IS SEVEN CHARACTERS LONGER THAN THE OFF STATE, and on a 320px phone
     that was the difference between the ✕ sitting at the end of the strip and wrapping onto a line
     of its own — a paper 44px taller the moment it was laminated, measured on the bundle's own
     basket. The tick is the ON state in one character, in the gold that already says "chosen", and
     the way back is the same press that got here, which the title says for anybody who asks. */
  return c.laminate
    ? ` <button class="text-action lam-on" data-do="cart-laminate" data-on=""${at}
        title="Laminated — press again for plain paper">✓ laminated${esc(cost)}</button>`
    : ` <button class="text-action" data-do="cart-laminate" data-on="1"${at}
        title="Laminate this copy">+ laminate${esc(cost)}</button>`;
}

/* ---------- ONE LINE OF THE BASKET ---------------------------------------------------------------
   Lifted out of `cartCard_` so the grouped and the ungrouped lines are one builder — a title row
   above some of them is the only difference, and it is not this function's business. */
function cartRow_(c, i, under) {
  return receiptRow({
    /* WIDE, because a basket line is a name and a price and nothing else — see `receiptRow`. The
       kind column said "Paper" beside a title that already begins "Paper 31", and the quantity
       column held "8pp" three columns from the thing it counts. Both are in the name now, where
       somebody reads them in one go. */
    wide: true,
    n: String(i + 1).padStart(3, '0'),
    k: '',
    v: '',
    /* THE ✕ RIDES IN THE VALUE CELL. `receiptRow` escapes `v` and inserts `sel` raw — that hook
       exists for the booking's dropdowns and is exactly what is wanted here: the name, and the way
       to take it out, on the line it belongs to. A separate list of remove buttons underneath would
       be every title printed twice. */
    /* ---------- THE UPGRADE BELONGS WHERE THE THING IS, NOT WHERE IT WAS BOUGHT --------------------
       LAMINATING WAS ASKED FOR IN THE BASKET rather than on the paper's own card, and that is the
       right place for it: it is a decision about a copy you have already decided to buy, and
       putting it on the card means every paper in the funnel carries a control that only means
       anything to somebody who is buying one.

       ONLY ON A PRINTED LINE, and only when the sheet has a rate. A credits line and a shop item
       are not sheets of paper, and `laminatePrice` returns null when nobody has priced the pouches
       — see the note on it. Nothing is drawn in either case, so the row is exactly what it was.

       THE PRICE IS ON THE CONTROL. "+ laminate" is a question somebody has to press to find out the
       answer to; "+ laminate £1.20" is one they can decide. */
    /* ---------- THE NAME, THEN ONE STRIP OF CONTROLS -----------------------------------------------
       THE ✕ WRAPPED ONTO A LINE OF ITS OWN. Each control is a 44px target and the name, the page
       count, the laminate switch and the ✕ were four inline things wrapping wherever the width ran
       out — so a line was three lines tall with the ✕ alone on the last, 115px a paper. Twelve papers
       is the owner's own example and that was a basket you scroll for a minute. The name is one
       line; `.cart-ctl` is the other, and it wraps as a unit rather than a word at a time.

       `short` UNDER A TITLE, `name` OTHERWISE — see `cartGroups_`. */
    /* ---------- ONE STRIP ONLY WHEN IT HOLDS SOMETHING, AND A LEADER TO THE PRICE ---------------------
       ASKED FOR AS *"refine basket to look nicer."* Measured at 390 with a mixed basket: every shop
       line was 72px tall because the ✕ sat ALONE on a second row — the strip existed for the laminate
       switch, and a shop item never has one — and the dashed rule under the name stopped three
       quarters of the way across, at the end of the value column, with the price floating past it.

       SO A LINE IS A NAME AND A DOTTED LEADER RUNNING TO ITS PRICE, the way a receipt reads, and the
       ✕ sits at the end of the leader, beside the price it takes away. The strip under it is drawn
       only when there is a switch to put in it — a paper or a cheat sheet while laminating is
       offered — and then it runs the full width, so its ✕ lines up under the price. `.bk-v` lays
       nothing out itself any more (see `.bk-row.is-wide > .bk-v` in style.css): its three parts are
       placed on the row's own two columns, which is what lets the strip reach past the name column.

       `? pp`, NOT "pages not counted yet" — the total column already says `tbc` on the same line and
       the receipt's head says how many are still to price. On the name line when there is no strip.

       A `<button>`, NOT A `<span>`, FOR THE ✕ — a span with a `data-do` cannot be reached by a
       keyboard and is invisible to `check/ui.js`. `short` UNDER A TITLE, `name` OTHERWISE — see
       `cartGroups_`. */
    sel: (() => {
      const lam = lamControl_(c);
      const pp = c.kind === 'print'
        ? `<span class="faint cart-pp">${c.pages ? esc(c.pages) + 'pp' : '? pp'}</span>` : '';
      const drop = `<button class="text-drop" data-do="cart-drop" title="Take this out"
          data-key="${esc(c.key)}" data-kind="${esc(c.kind)}">✕</button>`;
      return `<span class="cart-ln"><span class="cart-nm">${esc(under && c.short ? c.short : c.name)}</span>${
        lam ? '' : pp}<i class="cart-lead" aria-hidden="true"></i>${lam ? '' : drop}</span>${
        lam ? `<span class="cart-ctl">${pp}${lam}${drop}</span>` : ''}`;
    })(),
    mul: '',
    rate: '',
    /* CREDITS AND MONEY IN THE SAME COLUMN, because a line costs one or the other and never both —
       `cart-add` writes `money` for a paper and `cost` for anything bought with credits. */
    /* `tbc`, NOT `free`, FOR A PAPER NOBODY HAS COUNTED — the `cost: 0` fault written down four
       times in this repository, on the one column that is a price. Three characters, because the
       track is sized for `£270.00` and a longer word would take the row sideways. */
    total: c.kind === 'print' && cartUnpriced_(c) ? 'tbc'
         : cartMoney_(c) ? money(cartMoney_(c)) : (c.cost ? c.cost + ' cr' : 'free'),
    /* THE ✕ IS THE ROW'S OWN CONTROL, drawn where a receipt's line already ends. */
    end: true,
  });
}

/* ---------- THE BASKET'S LINES, GROUPED BY THE BUNDLE THEY CAME FROM ------------------------------
   IN ORDER OF FIRST APPEARANCE, so the basket reads in the order things went into it. A paper taken
   out and put back by pressing its bundle again lands at the end of `CART` — and here it rejoins its
   own title rather than starting a second copy of it at the foot of the list.

   ONLY A LINE THAT CARRIES BOTH `from` AND `short` IS GROUPED. `short` is unique inside its bundle and
   nowhere else, so a line without it has to be read on its own and keeps its library-wide `name` —
   which is also every line saved in somebody's browser before this existed, and those have to go on
   drawing exactly as they did. One reader, used by the basket and by the order message, so the two
   cannot disagree about which lines belong under which title. */
function cartGroups_(lines) {
  const order = [];
  const by = {};
  (lines || []).forEach(c => {
    const f = c && c.kind === 'print' && c.short && c.from ? String(c.from) : '';
    if (!by[f]) { by[f] = []; order.push(f); }
    by[f].push(c);
  });
  return order.map(f => ({ from: f, lines: by[f] }));
}

function cartCard_() {
  /* ---------- NOTHING IN IT IS A STATE, NOT AN ABSENCE ------------------------------------------
     THE HEADING IS OUTSIDE THIS, in the widget's own markup, so what is drawn here is the paper or
     the sentence that says there is no paper yet. It also says where things come FROM, because the
     one thing a person cannot work out from an empty basket is how to fill it: every line in here
     arrived by pressing the trolley on a card in Find. */
  if (!CART.length) {
    /* AND A BUNDLE OF PAPERS, which is the second way in and the one somebody is likelier to be
       looking for — see `bundleOf_` in find.js. */
    /* "BELOW", BECAUSE THE SHOP IS UNDER IT NOW. This said "a shop card ... in Find", and Find has
       no shop cards since the Shop column took them; a sentence sending somebody to a door that is
       gone is the stale-note fault in a place a child reads it. */
    return `<p class="empty">Nothing in your basket yet.<br><span class="faint">The trolley on a
      shop card below, or on a bundle of papers in Find, puts something in it.</span></p>`;
  }

  /* ---------- THE BASKET IS A RECEIPT, BECAUSE IT IS ONE -------------------------------------------
     IT WAS BUILT FROM `.row`, the app's generic label-and-value line, and it broke: `.k` has no
     `min-width: 0`, so a long title could not shrink and pushed the price and the ✕ off the right
     edge of the card. Three items and you could see none of the prices and remove none of them.

     THAT IS FIXABLE IN A LINE, and fixing it would still leave a list of things and prices with a
     total and a button to pay, drawn in a shape the app uses for settings screens. The app already
     has a shape for exactly this, and it is on the page above: `receiptHtml`, the same paper the
     booking is drawn on, with columns that were measured to fit a phone.

     SO THE BASKET AND THE BOOKING ARE THE SAME DOCUMENT. Both are things you are about to pay for,
     and now they look it — same torn ends, same numbered lines, same total, and the button printed
     on the paper rather than floating under it.

     `printed ‧ 26 pages` MOVES TO THE PAGES COLUMN, where a receipt puts a quantity, instead of
     trailing after the title in a smaller grey. It was the thing making the line too long. */
  /* A PENCIL SAVED AS "30 cr" BEFORE PENCE WERE READ AS MONEY is re-read first — see `cartUnits_`. */
  if (typeof cartUnits_ === 'function') cartUnits_();
  const credits = collCredits_();
  const due  = CART.reduce((n, c) => n + (c.cost || 0), 0);
  /* THROUGH `cartMoney_`, so the laminate upgrade is in the total the moment it is on the line.
     Summing `c.money` directly was the same figure in two places the day laminating was added. */
  const cash = CART.reduce((n, c) => n + cartMoney_(c), 0);
  /* A PAPER WITH NO PAGE COUNT IS NOT FREE, and the total must not add it in as nought and then
     print a figure that reads as the whole bill. Counted, and said. */
  const tbc = CART.filter(c => c.kind === 'print' && cartUnpriced_(c)).length;
  const short = due > credits;

  /* ---------- A BUNDLE'S PAPERS UNDER ITS TITLE, SAID ONCE -----------------------------------------
     `cartGroups_` puts each bundle's lines together under the words the bundle card was titled with,
     and anything else — a shop item, a print line saved before bundles existed — in a group with no
     title, drawn exactly as it always was. The title is a row of its own with nothing to price,
     because it is not a thing being bought: it is what the lines under it have in common. */
  const rows = [];
  let at = 0;
  cartGroups_(CART).forEach(g => {
    if (g.from) {
      rows.push(receiptRow({ wide: true, n: '', k: '', v: '', mul: '', rate: '', total: '',
                             sel: `<span class="cart-from">${esc(g.from)}</span>` }));
    }
    g.lines.forEach(c => rows.push(cartRow_(c, at++, !!g.from)));
  });
  /* AN ARRAY, NOT A STRING. `receiptHtml` does `(r.rows || []).join('')` itself — every other caller
     hands it the list and lets it do that, and handing it a joined string instead threw
     `.join is not a function` and took the whole screen down. */

  /* THE WORDING OFF THE SHEET THAT USED TO DUPLICATE THIS. A button saying what it will cost is a
     button somebody can agree to; one saying "Send" is one they have to work out first. And when
     it cannot be pressed it says why rather than sitting there greyed with no explanation. */
  /* ---------- "SEND ORDER", NOT "PAY" — NOTHING IS PAID HERE ---------------------------------------
     IT SAID "Pay £0.92" OVER A HANDLER THAT TOASTED "Checkout is the next thing to build". It sends
     the order to the owner now — see `cart-send` — and money changes hands when the paper does, so
     a button naming a payment would promise the one thing it does not do. The figure stays on it,
     because a button saying what it is about to ask for is one somebody can agree to. */
  const paper = cash || tbc;
  const foot = `
    <button class="btn rc-do" ${short ? 'disabled' : ''} data-do="cart-send">${
      short ? (due - credits) + ' more credits needed'
            : 'Send order' + (cash ? ' · ' + money(cash) + (tbc ? ' + tbc' : '') : '')}</button>
    <p class="rc-terms">${paper
      ? 'Printing is at cost — paper only — posted or kept for you to collect. Anything marked tbc '
        + 'is priced before you are charged for it.'
      : 'Nothing leaves your basket until you send it.'}</p>`;

  return receiptHtml({
    /* ---------- THE BASKET WORE THE GREEN TERMINAL, AND IT WAS THE LAST ONE WEARING ANYTHING ------
       `receiptHtml` HAD FOUR SKINS — screen, application, waitlist, receipt — one per stage of a
       booking, and the same session wore three of them over its life. Three went in an earlier
       change: the booking form and the saved session both pass `receipt` now, on the argument that
       a person who fills in a dark screen and is handed cream paper has been given two documents
       to reconcile rather than one document at two moments.

       THE BASKET WAS THE ONE THAT DID NOT GET THE MEMO. It kept `screen` because nothing routes
       through it from the booking side, so nobody noticed that a basket was the only thing in the
       app rendering as a CRT — scan lines, blinking cursor and all — while the card it is modelled
       on had stopped. One word, and `.rc.scr`, `.rc.app` and `.rc.wl` are all reachable by nothing:
       about 90 lines of stylesheet in three palettes that no caller could ask for, deleted in the
       same change. And with all four callers agreeing, `kind` itself is gone: one line choosing
       between four palettes is one line deciding which of four sets of rules the next control on
       this card has to obey, and the set nobody remembers is the one that gets written wrong. */
    /* ---------- ONE SHORT LINE, NOT A WRAPPED ONE ---------------------------------------------------
       IT READ "1430 credits · you have 5 · 1 to price when sent" and wrapped at 390 — the head of a
       receipt running to two lines to say what the rows and the terms under them already say. So it
       says the two figures nothing else on the card does — what the credits come to against what you
       hold — and `tbc` in the word the price column uses, which the terms line explains. */
    lines: [due ? due + ' cr of your ' + credits : '',
            tbc ? tbc + ' tbc' : ''].filter(Boolean),
    rows: rows,
    /* "TO PAY", NOT "COST". The booking card says Cost on a thing nobody has agreed to; this one has
       a Pay button under it and money genuinely about to move. */
    /* "SO FAR" WHEN ANY LINE IS STILL TO BE PRICED, because the figure beside it is then a floor
       rather than the bill. `tbc` alone when nothing is priced — a total of £0.00 over papers that
       cost money is the one figure on this card that would be flatly untrue. "TOTAL", NOT "TO PAY":
       nothing is paid by pressing the button under it. */
    totalLabel: paper ? (tbc ? 'So far' : 'Total') : 'Credits',
    total: cash ? money(cash) : tbc ? 'tbc' : String(due),
    foot: foot,
  });
}

/* ---------- AND IT IS REPAINTED WHERE IT STANDS ---------------------------------------------------
   BY CLASS RATHER THAN BY ID, and that is not fussiness. The tools column and the Saved column both
   draw `widgetOnColumn_`, and every screen in this app is in the document at once — so a starred
   basket puts a SECOND `#cart-box` on the page and `$()` hands every caller the first of them. That
   is the `$('msg-text')` fault, which cost a reply posted to the wrong person, and the id has to
   stay because `into` and `startWidget_` look the widget's parts up by it.

   NO SCREEN REPAINT. `cart-drop` and `cart-laminate` used to call `paintStuff(true)` or `repaint()`
   — a whole screen rebuilt so that one line could go — and there is nothing to rebuild now: the
   basket is a box, the change is local, and `CART` is in `localStorage` rather than on a wire, so
   the press IS the change. Same argument `cart-add` already makes for using `tileSet_`. */
function cartPaint_() {
  document.querySelectorAll('.cart-box').forEach(el => { el.innerHTML = cartCard_(); });
  /* AND THE BUNDLE'S TROLLEY, WHEREVER IT IS DRAWN. It fills when every paper in it is a line here,
     so a line taken out on the Tools column has made a filled trolley on the Find screen untrue —
     and this is the one function every change to the basket already goes through. Read off the
     tile's own ids against `CART`, so it cannot disagree with `bundleInCart_`'s rule. */
  document.querySelectorAll('[data-do="cart-add"][data-kind="bundle"]').forEach(el => {
    const ids = String(el.dataset.ids || '').split(',').filter(Boolean);
    const all = ids.length && ids.every(id => CART.some(c => c.kind === 'print' && String(c.key) === id));
    tileSet_(el, all ? { label: 'In your basket', on: true, off: true }
                     : { label: 'Add bundle to basket', on: false, off: false });
  });
}

/* THE WIDGET'S OWN `start`. It is called when the tools column arrives and on every repaint of it,
   which is the list `toolsStart_` walks. */
function initCart() { cartPaint_(); }

/* `screen('basket')` WAS HERE. A screen with no tab is a screen nobody can reach — and the basket
   has been a page of Find and a page of Booking since. It is a tool now; see the note above. */


/* ==================================================================================================
   THE SHOP, A COLUMN OF ITS OWN — AND THE BASKET IS ITS FIRST PAGE

   ASKED FOR AS *"Get rid of shop tag. I will make a new coloumn for shop stuff. So finder now will
   become just learning stuff."* — and, asked whether the Shop door should come off Find before the
   column existed, the owner chose both in one change. That order is the whole care here: the forty
   shop Things had exactly one way onto a screen, the `Shop` answer to Find's first question, and
   taking the door out first would have been a deletion of forty products wearing a tidy-up's
   clothes. `FUNNEL_NOT_FOR` in find.js takes it out in the same commit as this goes in.

   A PLACE, NOT A QUESTION, which is the test `TABS` in shell.js holds every column to. Nobody
   narrows their way to a glue stick through "What for · What kind"; they open the shop and look.

   THE BASKET MOVED HERE FROM TOOLS, and it is the same widget, not a copy. It has lived in five
   places — a column, a sheet, a page of Find, a page of Booking, a tool — and each move was the
   same argument about a box that is empty most of the time. In the shop it is beside the things that
   fill it, which is the one home that argument never had. `kind: 'shop'` on the `cart` row of the
   roster in map.js is the whole move: `widgetsOf_('shop')` draws it here, `widgetsOf_('tool')` stops
   drawing it there, and `cartPaint_` writes by class, so nothing else had to learn where it went.

   FIRST, NOT LAST. The Things run to several pages, and a basket at the bottom of them is a swipe per
   page to check what you have just added — which is the one thing a basket is for. On top it is
   your running total with the shelves under it, and `cart-open` lands on a page whose number does
   not move when the shop gets longer.

   WHO SEES WHAT, ASKED HERE AND ONLY HERE. `doGet` sends `audience` and `inStock` on every shop row
   and nothing in js/ read either, so a signed-out visitor was offered the toner cartridge and the
   tutors' iPad as "Add to basket · free". A row switched off is not for sale; a row for tutors is
   for tutors (and the admin, as `isTutorRole` already answers); a row for the admin is the admin's.
   Done on the COLUMN rather than in the shared mapper, because a STARRED row still belongs on Saved
   whatever this decides — which is the `stuffItemsAll_` argument, one list further along.

   WEARABLES ARE NOT HERE. Buying one and wearing it are one act, and they have the wardrobe on
   Settings for it — see `shopTiles_`'s note in tiles.js.
================================================================================================== */

/* THREE TO A PAGE, MEASURED. `.pane` is `overflow: hidden` and caps at 534px on a 320x568 phone;
   a shop card with its tile row is about 155px there, and a page also carries its group's heading,
   so three fill the glass and a fourth never fits. Walked over the real shop (the 62-row export plus
   the twelve additions) as a visitor, a student and an admin: 13, 13 and 20 pages, none of them
   shrunk by `paneReach_` — once three two-line names on one page had been, at 0.893, which put the
   tiles at 39px. That was fixed in the names ("White vinegar", not "White vinegar (practical
   chemical)"), not here: a name that wraps is a longer name than the shelf needs. */
const SHOP_PER = 3;

/* THE GROUPS, IN THE ORDER A FAMILY LOOKS. The sheet's `kind` cell is the group; the label is how a
   person says it. A kind not named here still draws — under its own word, after these — because a
   row somebody typed a new kind into is a row, and silence about it is the fault `kindOf_` records. */
const SHOP_GROUPS = [['bundle', 'Bundles'], ['game', 'Games'], ['kit', 'Kits'],
                     ['equipment', 'Equipment'], ['stationery', 'Stationery'],
                     ['consumable', 'Consumables'], ['service', 'Made to order']];

function shopFor_(r) {
  if (!r || (typeof isWearable === 'function' ? isWearable(r) : r.kind === 'wearable')) return false;
  /* `false` ONLY. `ON_` on the backend sends a boolean, and a payload older than that sends nothing —
     which must mean "on", or every shop on an old backend would empty itself. */
  if (r.inStock === false) return false;
  const who = String(r.audience || 'all').trim().toLowerCase();
  if (who === 'admin') return typeof isAdmin === 'function' && isAdmin();
  if (who === 'tutor') return typeof isTutorRole === 'function' && isTutorRole();
  return true;
}

/* THE THINGS, GROUPED. Each one is the item `stuffItemsAll_` already builds — the card Find drew,
   tiles and all — looked up by its key, so the shop and every other surface draw one object rather
   than two that could drift. The row is what says who may see it and which group it is in. */
function shopGroups_() {
  const rows = (DATA && DATA.shop) || [];
  const byKey = {};
  (typeof stuffItemsAll_ === 'function' ? stuffItemsAll_() : [])
    .forEach(x => { if (x.kind === 'shop' && x.key && !byKey[x.key]) byKey[x.key] = x; });
  const groups = {};
  rows.forEach(r => {
    if (!shopFor_(r)) return;
    const x = byKey[r.name];
    if (!x || x.wearable) return;
    const k = String(r.kindRaw || 'thing').trim().toLowerCase() || 'thing';
    (groups[k] || (groups[k] = [])).push(x);
  });
  const named = SHOP_GROUPS.map(g => g[0]);
  const order = named.filter(k => groups[k])
    .concat(Object.keys(groups).filter(k => named.indexOf(k) < 0).sort());
  return order.map(k => {
    const g = SHOP_GROUPS.find(p => p[0] === k);
    return { kind: k, label: g ? g[1] : k.charAt(0).toUpperCase() + k.slice(1), items: groups[k] };
  });
}

function shopCards_() {
  /* THE BASKET, AND ANY OTHER WIDGET THE ROSTER FILES UNDER THE SHOP, drawn exactly as Tools draws
     its own — the star on it, the widget in its slot, started by `toolsStart_('shop')`. */
  const wgts = (typeof widgetsOf_ === 'function' ? widgetsOf_('shop') : [])
    .map(w => (typeof widgetOnColumn_ === 'function' ? widgetOnColumn_(w) : w.html));
  /* THE PAYLOAD DID NOT COME — the reason and a Try again, rather than an empty shop that looks open
     and is not. The basket stays above it: it is on this device and did not need the payload. */
  if (typeof LOAD_FAILED !== 'undefined' && LOAD_FAILED && typeof nothingHere === 'function') {
    return wgts.concat([nothingHere()]);
  }
  /* NOT ARRIVED IS NOT EMPTY — the Spotlight column's fault, the same line short: for the length of
     the payload this said "Nothing in the shop yet" over a shop on its way. The basket stays above
     the loader for the reason it stays above a failure. */
  if (typeof LOADED !== 'undefined' && !LOADED && typeof loading_ === 'function') {
    return wgts.concat([loading_()]);
  }
  const credits = collCredits_();
  const out = wgts.slice();
  shopGroups_().forEach(g => {
    for (let i = 0; i < g.items.length; i += SHOP_PER) {
      /* AN `<h2>` BETWEEN CARDS, NOT INSIDE ONE — the rule `check-dead.js` states and `split_` cuts
         on. Every page of a group carries its name, so a page reached by a long swipe still says
         which shelf it is. The count is the group's, the way the feed's emoji groups write it. */
      out.push(`<h2><span>${esc(g.label)}</span><span class="faint">${g.items.length}</span></h2>`
        + g.items.slice(i, i + SHOP_PER).map(x => stuffCard(x, credits)).join(''));
    }
  });
  if (out.length > wgts.length) return out;
  return out.concat([`<div class="card"><h3>Shop</h3><p class="note">Nothing in the shop yet.<br>
    <span class="faint">Things for sale turn up here as they are added.</span></p></div>`]);
}

screen('shop', () => pages('shop', shopCards_()));


/* ---------- THE PAGERS ---------------------------------------------------------------------------
   ASSIGNED RATHER THAN DECLARED. `PAGER`, `PAGE` and `PAGE_HOME` are objects in shell.js and a new
   column adds a property to each — which keeps the navigation in shell.js and the screens here,
   and means adding a fourth collection is four lines in one file rather than an edit in two.

   THE COUNT COMES FROM THE SAME FUNCTION THAT RENDERS, exactly as the other four do. A pager that
   disagrees with its own screen is a card that exists and cannot be swiped to. */
/* NO `PAGER.spotlight`. Spotlight is pages on Posts now, and Posts counts its own. */
/* NO `PAGER.favourites`. Saved is a strip on the Find controls page now, not a column, so it has
   no pages of its own to count — and a pager for a screen nobody registers is the exact thing
   check.js names. */
/* NO `PAGER.basket`. Find counts its own pages. */

