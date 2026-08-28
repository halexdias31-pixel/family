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

function adoptSpotlight_() {
  if (!DATA || !DATA.spotlight) return;
  SPOT = new Set(DATA.spotlight.map(String));
}

const isSpot = k => SPOT.has(String(k));

/* Toggled by an admin, and saved one row at a time for the reason `favourite` is: writing a whole
   list back is a read-modify-write, and two admins on two phones would lose one of the two taps. */
function toggleSpot(k, kind) {
  if (!isAdmin()) return;
  const key = String(k);
  if (SPOT.has(key)) SPOT.delete(key); else SPOT.add(key);

  send('spotlight', {
    name: USER.name,
    /* THE KEY GOES ACROSS WHOLE and the kind is passed separately, for the same reason the star
       does it: some keys are a bare title and some are prefixed, and splitting on the colon turns
       a venue called "Colliers Wood Library" into a kind. */
    kind: kind || 'item', itemId: key,
    on: SPOT.has(key) ? 'TRUE' : '',
  }).catch(() => {});
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
function collItems_(has) {
  return (typeof stuffItems === 'function' ? stuffItems() : [])
    .filter(x => x.key && has(x.key));
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
function basketPages() {
  if (!CART.length) {
    return ['<div class="card"><p class="note">Your basket is empty.</p></div>'];
  }

  const credits = collCredits_();
  const due  = CART.reduce((n, c) => n + (c.cost || 0), 0);
  const cash = CART.reduce((n, c) => n + (c.money || 0), 0);
  const short = due > credits;

  const lines = CART.map(c => `<div class="row">
      <span class="k">${esc(c.name)}${c.kind === 'print'
        ? ` <span class="faint">printed ‧ ${esc(String(c.pages))} pages</span>` : ''}</span>
      <span class="v mono">${c.money ? money(c.money) : (c.cost ? c.cost : 'free')}
        <span class="text-drop" data-do="cart-drop"
              data-key="${esc(c.key)}" data-kind="${esc(c.kind)}">✕</span></span>
    </div>`).join('');

  return [`<div class="card">${lines}
    ${due ? `<div class="row"><span class="k">Credits</span>
       <span class="v big mono">${due}</span></div>
      <div class="row"><span class="k">You have</span>
       <span class="v mono${short ? ' bad' : ''}">${credits}</span></div>` : ''}
    ${cash ? `<div class="row"><span class="k">To pay</span>
       <span class="v big gold mono">${esc(money(cash))}</span></div>` : ''}
    <button class="btn" style="margin-top:.85rem" ${short ? 'disabled' : ''}
            data-do="cart-send">Send</button>
  </div>`];
}

screen('basket', () => pages('basket', basketPages()));


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
PAGER.basket     = () => basketPages().map(() => '');

PAGE.basket = 0;
