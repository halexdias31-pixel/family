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
  if (Array.isArray(sheet) && sheet.length) return sheet.map(String);
  const file = (DATA && DATA.spotlightFile) || [];
  return (Array.isArray(file) ? file : []).map(String);
}

function adoptSpotlight_() {
  SPOT = new Set(spotNow_());
}

const isSpot = k => SPOT.has(String(k));

/* Toggled by an admin, and saved one row at a time for the reason `favourite` is: writing a whole
   list back is a read-modify-write, and two admins on two phones would lose one of the two taps. */
function toggleSpot(k, kind) {
  if (!isAdmin()) return;
  const key = String(k);
  if (SPOT.has(key)) SPOT.delete(key); else SPOT.add(key);

  /* ---------- THIS CALLED `send` WITH TWO ARGUMENTS AND `send` TAKES ONE ------------------------
     `send(body)` — shell.js:1546 — passes its single argument straight to `api`. Written as
     `send('spotlight', { … })` the body was the STRING "spotlight" and the whole object, name,
     itemId, kind and all, was dropped on the floor before the request was built. There is no
     `action` field in a bare string, so the backend could not have known what was being asked even
     if it had the handler.

     AND `.catch(() => {})` MADE IT LOOK LIKE IT WORKED. `SPOT.add`/`delete` three lines up has
     already changed the set, so the star fills in the moment it is pressed; the request then fails
     and the empty catch discards the failure without a word. An admin stars six things, sees six
     stars, reloads, and has none — with nothing anywhere having said no.

     THE HANDLER DOES NOT EXIST EITHER. There is no `spotlight` action in dopost.gs, no spotlight
     tab in SCHEMA, and `doGet` never sends `DATA.spotlight` — which collections.js:39 reads. The
     feature is wired at both ends of the front end and has no middle. Fixing the call therefore
     does not make starring work; it makes it FAIL OUT LOUD, which is the difference between a
     feature that is missing and a feature that is lying. `send` already turns an unknown action
     into "The backend does not have `spotlight` yet", which is the true sentence. */
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
    on: SPOT.has(key) ? 'TRUE' : '',
  }).catch(err => {
    /* PUT BACK WHAT WAS NOT SAVED. Leaving the star lit after the save failed is the lie this was
       built on; the set is the only record the screen has, so it has to agree with the server. */
    if (SPOT.has(key)) SPOT.delete(key); else SPOT.add(key);
    toast(String((err && err.message) || 'That did not save'));
  });
}

on('spot', el => {
  toggleSpot(el.getAttribute('data-key'), el.getAttribute('data-kind'));
  /* THE ONE BUTTON, not the screen. Redrawing would throw away the scroll position of somebody
     working down a long list — the same reason the star repaints itself and nothing else. */
  /* THE TILE'S OWN LABEL, not a glyph. This wrote ✦ / ✧ — written when the control was a small
     button in the corner beside the star, and it would now overwrite the word on the tile AND any
     value beside it, because a tile is two spans rather than a string. */
  tileSet_(el, { label: isSpot(el.getAttribute('data-key')) ? 'Spotlit' : 'Spotlight',
                 on: isSpot(el.getAttribute('data-key')) });
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
  return all.filter(x => x.key && has(x.key));
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
  return items.map(x => stuffCard(x, credits));
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
  const cards = spotPages();
  if (cards.length) return cards;
  /* AN ADMIN IS TOLD HOW TO FILL IT, because they are the only person who can — and a column that
     says "nothing here" to the one person able to change that is the fault `savedCards_` fixed on
     the column next door. Everybody else is told what the column is FOR, so an empty one reads as
     a shop window nobody has dressed rather than as a screen that failed. */
  const admin = typeof isAdmin === 'function' && isAdmin();
  return [`<div class="card"><h3>Spotlight</h3><p class="note">${admin
    ? `Nothing in the window yet.<br><span class="faint">Press <b>Spotlight</b> on any card — a
       tutor, a class, a paper — and it turns up here for everybody.</span>`
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
  return collItems_(isFav).map(x => stuffCard(x, credits));
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
function lamControl_(c) {
  if (!c || c.kind !== 'print') return '';
  const p = typeof laminatePrice === 'function' ? laminatePrice(c.pages) : null;
  if (p === null) return '';
  const at = ` data-key="${esc(c.key)}" data-kind="${esc(c.kind)}"`;
  return c.laminate
    ? ` <button class="text-action lam-on" data-do="cart-laminate" data-on=""${at}
        title="Back to plain paper">laminated ${esc(money(p))} · plain</button>`
    : ` <button class="text-action" data-do="cart-laminate" data-on="1"${at}
        title="Laminate this copy">+ laminate ${esc(money(p))}</button>`;
}

function cartCard_() {
  /* ---------- NOTHING IN IT IS A STATE, NOT AN ABSENCE ------------------------------------------
     THE HEADING IS OUTSIDE THIS, in the widget's own markup, so what is drawn here is the paper or
     the sentence that says there is no paper yet. It also says where things come FROM, because the
     one thing a person cannot work out from an empty basket is how to fill it: every line in here
     arrived by pressing the trolley on a card in Find. */
  if (!CART.length) {
    return `<p class="empty">Nothing in your basket yet.<br><span class="faint">The trolley on a
      shop card in Find puts something in it.</span></p>`;
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
  const credits = collCredits_();
  const due  = CART.reduce((n, c) => n + (c.cost || 0), 0);
  /* THROUGH `cartMoney_`, so the laminate upgrade is in the total the moment it is on the line.
     Summing `c.money` directly was the same figure in two places the day laminating was added. */
  const cash = CART.reduce((n, c) => n + cartMoney_(c), 0);
  const short = due > credits;

  const rows = CART.map((c, i) => receiptRow({
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
    sel: esc(c.name)
      + (c.kind === 'print' && c.pages ? ` <span class="faint">${esc(c.pages)}pp</span>` : '')
      + lamControl_(c)
      /* ---------- A `<span>` WITH A `data-do` ON IT IS NOT A CONTROL -------------------------------
         THE ✕ WAS ONE, and it is the third time in this codebase: the docket's delete, the post's
         ⋯, and this. A span cannot be reached by a keyboard, is not announced as a button, and is
         invisible to `check/ui.js`, which measures buttons, links and inputs — so its size has
         never been checked by anything. `.text-drop` gives it the same look either way. */
      + ` <button class="text-drop" data-do="cart-drop" title="Take this out"
          data-key="${esc(c.key)}" data-kind="${esc(c.kind)}">✕</button>`,
    mul: '',
    rate: '',
    /* CREDITS AND MONEY IN THE SAME COLUMN, because a line costs one or the other and never both —
       `cart-add` writes `money` for a paper and `cost` for anything bought with credits. */
    total: cartMoney_(c) ? money(cartMoney_(c)) : (c.cost ? c.cost + ' cr' : 'free'),
    /* THE ✕ IS THE ROW'S OWN CONTROL, drawn where a receipt's line already ends. */
    end: true,
  }));
  /* AN ARRAY, NOT A STRING. `receiptHtml` does `(r.rows || []).join('')` itself — every other caller
     hands it the list and lets it do that, and handing it a joined string instead threw
     `.join is not a function` and took the whole screen down. */

  /* THE WORDING OFF THE SHEET THAT USED TO DUPLICATE THIS. A button saying what it will cost is a
     button somebody can agree to; one saying "Send" is one they have to work out first. And when
     it cannot be pressed it says why rather than sitting there greyed with no explanation. */
  const foot = `
    <button class="btn rc-do" ${short ? 'disabled' : ''} data-do="cart-send">${
      short ? (due - credits) + ' more credits needed'
            : cash ? 'Pay ' + money(cash) : 'Confirm'}</button>
    <p class="rc-terms">${cash
      ? 'Printing is charged at cost — paper only. Collect from the library or a session.'
      : 'Nothing leaves your basket until you confirm.'}</p>`;

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
    lines: [due ? due + ' credit' + (due === 1 ? '' : 's') : '',
            due ? 'you have ' + credits : ''].filter(Boolean),
    rows: rows,
    /* "TO PAY", NOT "COST". The booking card says Cost on a thing nobody has agreed to; this one has
       a Pay button under it and money genuinely about to move. */
    totalLabel: cash ? 'To pay' : 'Credits',
    total: cash ? money(cash) : String(due),
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
}

/* THE WIDGET'S OWN `start`. It is called when the tools column arrives and on every repaint of it,
   which is the list `toolsStart_` walks. */
function initCart() { cartPaint_(); }

/* `screen('basket')` WAS HERE. A screen with no tab is a screen nobody can reach — and the basket
   has been a page of Find and a page of Booking since. It is a tool now; see the note above. */


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

