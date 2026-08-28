/* ==================================================================================================
   @family. — tiles.js
   THE SHEET IS GONE. Everything it offered is a row on the card itself.

   WHAT WAS WRONG WITH IT. Opening a panel to reach a tick is two taps to do a one-tap thing, and
   the panel then had to repeat the card — the name, the subject, the page count — because a panel
   floating over a list has to say which of the list it is about. So the same six facts were drawn
   twice, in two places that could disagree, and the second copy cost a tap to see and a tap to
   dismiss. A screen whose first job is to identify itself is a screen that did not need to exist.

   ---------- ONE ACTION, ONE LINE ----------------------------------------------------------------
   FULL WIDTH, STACKED, IN WORDS. This was a grid of three symbols across, and a grid is a promise
   that everything in it is the same size — a promise you then have to keep with flex arithmetic,
   with placeholders standing in for actions that do not exist, and with glyphs chosen because they
   are one character wide rather than because they mean anything.

   A stack keeps that promise for nothing. Every row is the width of the card, so uniformity is not
   maintained, it is simply unavoidable. And once nothing is competing for horizontal room the label
   can be the word — HTML, Paper — which needs no long-press text to explain it and no guess about
   whether a framed block reads as a document.

   WHICH ALSO REMOVES THE PLACEHOLDERS. The dim dead slots existed to hold a column position steady
   so that a thumb would find the paper copy in the same place on every card. A stacked row has no
   column to hold, so an action that is not offered is simply not drawn — and a card with two rows
   sits beside one with three without either looking wrong.

   THE DETAIL SITS ON THE RIGHT OF ITS OWN LINE — the same key-on-the-left, value-on-the-right shape
   every other row on this card already uses. "£0.40" belongs beside the thing that charges it.

   ---------- ONE RULE FOR ADMIN CONTROLS: THEY ARE SILVER ----------------------------------------
   Everywhere, without exception. An admin sees every card twice over — once as the app and once as
   the thing they maintain — and a colour that means "only you can see this" is the only way to tell
   those apart at a glance. Nothing a client can press is ever silver.

   LOADED AFTER `find`, `resource` and `collections`: it reads `printPrice`, `canPrint` and
   `tickRow` from find, `paperRows` and `CART` from resource, and `isSpot` from collections.
   index.html lists them; the list is the order.
================================================================================================== */


/* ---------- THE MARKS ON THE BUTTONS ---------------------------------------------------------------
   ONE SET, DRAWN ONCE, IN THE APP'S OWN STROKE. Inline SVG rather than characters: ▷ and 🛒 are
   whatever the phone happens to have, which on one device is a thin outline and on another a
   full-colour emoji sitting at a different height from the word beside it. These take their colour
   from the text they sit with, so a silver admin tile gets a silver mark without a second rule.

   BESIDE THE WORD, NEVER INSTEAD OF IT. This app took its glyphs out once already — `tile_` still
   says why underneath: a ✦ needed a `title` AND an `aria-label` to explain it, and a label that has
   to be explained twice was the wrong label. A mark next to the word is the opposite trade: the
   word still says what happens, and the mark is what lets you find the right button without
   reading four of them. Nothing here is ever the only thing on a tile.

   `aria-hidden`, for the same reason. The word is already the accessible name, and a screen reader
   announcing "graphic, play" before it would be the second explanation all over again. */
const TILE_ICONS = {
  play:  '<path d="M5 3.5v11l9-5.5z"/>',
  doc:   '<path d="M4.5 2.5h6l3 3v10h-9z"/><path d="M10.5 2.5v3.5h3"/>',
  code:  '<path d="M6.5 5.5 2.5 9l4 3.5"/><path d="m11.5 5.5 4 3.5-4 3.5"/>',
  cart:  '<path d="M1.5 2.5h2l2 8h8"/><path d="m4.6 4.5h11l-1.4 4.5h-8.6"/>'
       + '<circle cx="6.5" cy="14" r="1.2"/><circle cx="12.5" cy="14" r="1.2"/>',
  open:  '<path d="M9.5 2.5h4v4"/><path d="M13.5 2.5 7 9"/>'
       + '<path d="M12.5 10v3.5h-10v-10H6"/>',
  book:  '<path d="M2.5 3.5h5a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2h-5z"/>'
       + '<path d="M15.5 3.5h-5a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h5z"/>',
  wear:  '<path d="M6 2.5 3 4v4h2v6h6V8h2V4l-3-1.5a2.2 2.2 0 0 1-4 0z"/>',
  star:  '<path d="m9 2.5 2 4.3 4.5.6-3.3 3.2.8 4.6L9 13l-4 2.2.8-4.6L2.5 7.4 7 6.8z"/>',
  spot:  '<path d="M9 1.5v2.5"/><path d="M9 14v2.5"/><path d="M2.2 8.5h2.4"/>'
       + '<path d="M13.4 8.5h2.4"/><circle cx="9" cy="8.5" r="3"/>',
  edit:  '<path d="M11.5 2.8 14.2 5.5 6 13.7l-3.4.7.7-3.4z"/><path d="m10.2 4.1 2.7 2.7"/>',
  bin:   '<path d="M2.8 4.5h12.4"/><path d="M6.5 4.5V2.8h5v1.7"/>'
       + '<path d="M4.5 4.5 5.3 15h7.4l.8-10.5"/>',
  undo:  '<path d="M2.8 8.5h8a3.5 3.5 0 1 1 0 7H6"/><path d="M5.5 5.5 2.5 8.5l3 3"/>',
};

function tileIcon_(name) {
  const d = TILE_ICONS[name];
  if (!d) return '';
  return `<svg class="tile-i" viewBox="0 0 18 17" aria-hidden="true" focusable="false"
    fill="none" stroke="currentColor" stroke-width="1.4"
    stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}


/* ---------- ONE ROW ------------------------------------------------------------------------------
   A LINK WHERE IT LEAVES THE APP, A BUTTON WHERE IT DOES NOT. Written once so the difference is a
   parameter rather than two nearly-identical strings that drift apart — and so `target` and
   `rel="noopener"` exist in exactly one place.

   NO `title`, NO `aria-label`. The label is the word, so there is nothing a hidden one could add
   that the visible one does not already say. Both existed to rescue a glyph, and a glyph that has
   to be explained twice was the wrong glyph — which is why `icon` above is drawn `aria-hidden`
   BESIDE the word rather than in place of it. */
function tile_(o) {
  const cls = 'tile' + (o.tone ? ' is-' + o.tone : '') + (o.on ? ' on' : '');
  const body = tileIcon_(o.icon)
    + `<span class="tile-k">${esc(o.label)}</span>`
    + (o.note ? `<span class="tile-v">${esc(o.note)}</span>` : '');

  if (o.href) {
    return `<a class="${cls}" href="${esc(o.href)}" target="_blank" rel="noopener">${body}</a>`;
  }
  const data = Object.keys(o.data || {})
    .map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  return `<button class="${cls}" data-do="${esc(o.act)}"${data}${o.off ? ' disabled' : ''}
    >${body}</button>`;
}


/* ---------- FILLING THE SHAPE ---------------------------------------------------------------------
   THE STAR'S PATTERN, EVERYWHERE. Press it, it fills, and that is the end of the interaction as far
   as the person is concerned. The request goes out behind it and is only ever heard from again if
   it fails.

   WHY NOT `repaint()`. Every one of these used to redraw the whole screen to change one word —
   rebuilding forty cards, the search box and the pager so that a button could say "In your basket".
   That is slow, it drops the keyboard, and on a list it is visibly a flinch. `set-listed` was worse
   again and called `load()`, which went back to the network for the entire payload.

   ONE ELEMENT, THREE THINGS: the word, the number beside it, and whether it is filled. Nothing else
   on the screen is touched, so nothing else on the screen can move. */
function tileSet_(el, o) {
  if (!el) return;
  const k = el.querySelector('.tile-k');
  const v = el.querySelector('.tile-v');
  if (k && o.label != null) k.textContent = o.label;
  if (v && o.note != null) v.textContent = o.note;
  /* AN EMPTY VALUE IS REMOVED, not left as an empty span — "In your basket" followed by a gap where
     a price used to be is the shape of a thing that failed to load. */
  if (v && o.note === '') v.remove();
  if (o.on != null) el.classList.toggle('on', !!o.on);
  if (o.off != null) el.disabled = !!o.off;
}


/* ---------- THE ADMIN ROWS -----------------------------------------------------------------------
   SPOTLIGHT, EDIT, DELETE — the three things only an admin can do to a row, in the same order on
   every kind of card, stacked like everything else.

   `x.key` rather than the row's id: the spotlight set is keyed on whatever the CARD is keyed on,
   which for a widget is `w:123` and for a venue is its name. Edit and delete want the resource's
   own id, which is a different thing — so two keys go across. */
function adminTiles_(x, t) {
  if (!isAdmin()) return '';
  const id = t ? (t.id || t.name) : x.key;
  return `<div class="tile-row is-admin">
    ${tile_({ icon: 'spot', label: isSpot(x.key) ? 'Spotlit' : 'Spotlight', tone: 'admin',
              on: isSpot(x.key), act: 'spot',
              data: { key: x.key, kind: x.kind || 'item' } })}
    ${t ? tile_({ icon: 'edit', label: 'Edit', tone: 'admin',
                  act: 'topic-edit', data: { key: id } }) : ''}
    ${t ? tile_({ icon: t.active ? 'bin' : 'undo', label: t.active ? 'Delete' : 'Restore',
                  tone: 'admin',
                  act: 'topic-delete', data: { key: id, on: t.active ? '' : '1' } }) : ''}
  </div>`;
}


/* ---------- THE STAR, WHICH IS AN ACTION LIKE ANY OTHER --------------------------------------------
   IT USED TO FLOAT IN THE CORNER. `stuffCard` wrapped every card in a `.favwrap` and dropped a
   `<button class="star">☆</button>` on top of it, absolutely positioned — which was written when it
   was the only thing you could do to a card. It is not: a paper has HTML and Paper, a bout has
   Watch, everything an admin sees has three more. So the one control that was NOT in the row was
   the one people looked for in it.

   SAME SHAPE, SAME PLACE, SAME WORDS AS THE REST. `Save` and `Saved`, filled when it is on, exactly
   like `Add to basket` / `In your basket` — a glyph in a corner had to be learnt, and this does not.

   FIRST IN THE ROW, ABOVE THE ADMIN BLOCK. Keeping a thing is something anybody can do; the silver
   rows underneath are for one person. */
function favTile_(x) {
  if (!x.key || !USER) return '';
  return `<div class="tile-row">${tile_({
    icon: 'star', label: isFav(x.key) ? 'Saved' : 'Save', on: isFav(x.key),
    act: 'fav', data: { key: x.key, kind: x.kind || 'item' } })}</div>`;
}


/* ---------- A RESOURCE'S WAYS IN -------------------------------------------------------------------
   HTML, THEN PAPER — read it here, or hold it. There were three and the PDF was the first of them;
   see the note in the list below for where it went.

   PAPER IS LAST because it is the only control that spends anything, and that is where a control
   that spends anything belongs.

   WHEN NOTHING IS OFFERED AT ALL, one line says so. That is not a placeholder — it is the answer to
   the question the card just raised by having no rows under it, and a page count nobody has run is
   something you can go and fix rather than something you have to wonder about. */
function topicTiles_(x) {
  const t = x.topic;
  if (!t) return adminTiles_(x, null);

  const price = printPrice(t.pages);
  const qs = paperRows(t).filter(r => r.kind !== 'stem').length;
  const inCart = CART.some(c => c.key === (t.id || t.name) && c.kind === 'print');

  const rows = [
    /* ---------- THE PDF ROW WAS HERE --------------------------------------------------------------
       A PDF IS OPAQUE TO EVERYTHING THIS APP DOES. You cannot tick one question inside it, filter to
       it, or pull four questions from four papers into one worksheet — and the funnel, the passes
       and the generated paper all work at question granularity. It could be linked and nothing else.

       `link` IS STILL IN THE SHEET and is deliberately left there: it is the only record of where
       those papers actually live, and a column costs nothing. It is simply no longer a way in.
    --------------------------------------------------------------------------------------------- */

    /* THE PAPER, FROM ITS OWN QUESTIONS. The only way to read a resource now — no download, no
       reader, and it is the same rows the question cards draw from, so a fix to a question fixes it
       here too. */
    qs ? tile_({ icon: 'code', label: 'HTML', note: qs + ' questions',
                 act: 'paper-read', data: { key: t.id || t.name } }) : '',

    /* THE PAPER COPY. The price sits on the line that charges it, so the thing you are agreeing to
       is written on the thing you press rather than in a row above it. */
    canPrint(t)
      ? tile_({ icon: inCart ? 'cart' : 'doc',
                label: inCart ? 'In your basket' : 'Paper', tone: 'buy', on: inCart,
                note: inCart ? '' : money(price) + ' · ' + t.pages + 'pp',
                act: 'cart-add', off: !USER || inCart,
                data: { key: t.id || t.name, kind: 'print' } })
      : '',
  ].filter(Boolean);

  /* NOTHING TO OPEN MEANS NOBODY HAS TYPED IT UP. That is now the only reason it can happen, and it
     is a thing you can go and do rather than a thing to wonder about — so the sentence says which,
     and says it to an admin as a job rather than to a client as a fault. */
  const none = rows.length ? '' : `<p class="tile-none">${
    isAdmin() ? 'No questions written up for this one yet.'
              : 'Not ready to read yet.'}</p>`;

  return `${tickRow(t)}
    ${rows.length ? `<div class="tile-row">${rows.join('')}</div>` : none}
    ${adminTiles_(x, t)}`;
}


/* ---------- A SHOP THING ---------------------------------------------------------------------------
   A WEARABLE IS DELIBERATELY NOT HERE. Buying and equipping it are ONE act — nothing to post and
   nothing to collect, so it never enters a basket — and that is a different gesture from anything
   on this row. It keeps its sheet until it has a screen of its own. */
function shopTiles_(x) {
  const inCart = CART.some(c => c.key === x.key && c.kind === 'shop');
  return `<div class="tile-row">
    ${tile_({ icon: 'cart', label: inCart ? 'In your basket' : 'Add to basket',
              tone: 'buy', on: inCart,
              note: inCart ? '' : (x.cost ? x.cost + ' credits' : 'free'),
              act: 'cart-add', off: !USER || inCart,
              data: { key: x.key, kind: 'shop' } })}
  </div>${adminTiles_(x, null)}`;
}


/* ---------- A TUTOR --------------------------------------------------------------------------------
   THE PASS ALREADY SAYS WHO THEY ARE — photograph, name, what they teach, rate, DBS. The sheet
   repeated all of that and added a borough, a full subject list and one button. So the borough and
   the list go onto the pass where the rest of the person is, and the button comes down here.

   `Listed` IS ADMIN AND DESTRUCTIVE-ISH: unticking it takes somebody off the site for every client
   at once. It was a checkbox in a panel, which is where a switch goes to be flipped by accident;
   as a silver row it is as deliberate as Delete and reads the same way. */
function tutorTiles_(x) {
  const t = x.row || {};
  return `<div class="tile-row">
    ${tile_({ label: 'Book with them', act: 'book-with', data: { name: x.key } })}
  </div>
  ${isAdmin() ? `<div class="tile-row is-admin">
    ${tile_({ label: t.listed === false ? 'Not listed' : 'Listed', tone: 'admin',
              on: t.listed !== false, act: 'set-listed',
              note: t.listed === false ? 'clients cannot see them' : 'clients can see them',
              data: { who: x.key } })}
    ${tile_({ label: isSpot(x.key) ? 'Spotlit' : 'Spotlight', tone: 'admin',
              on: isSpot(x.key), act: 'spot', data: { key: x.key, kind: 'tutor' } })}
  </div>` : ''}`;
}


/* ---------- A VENUE ---------------------------------------------------------------------------------
   THE SLIP ALREADY CARRIES EVERY FACT the sheet had — the rooms, their capacities, their rates and
   the notice period — and it carried them better, one line per room against a single "from" price.
   The sheet was a worse copy of the card in front of it. Only the button was ever new. */
function venueTiles_(x) {
  return `<div class="tile-row">
    ${tile_({ label: 'Book this room', act: 'book-with', data: { name: x.key } })}
  </div>${adminTiles_(x, null)}`;
}


/* ---------- A SUBJECT -------------------------------------------------------------------------------
   `Book this` SENT AN EMPTY NAME in the sheet — `data-name=""` — so booking from a subject asked for
   nobody in particular. Kept exactly as it was rather than quietly fixed: booking a subject with no
   tutor named may well be right, and changing what a button DOES while moving it is how a move gets
   blamed for a bug it did not cause. */
function subjectTiles_(x) {
  return `<div class="tile-row">
    ${tile_({ icon: 'book', label: 'Book this', act: 'book-with', data: { name: '' } })}
  </div>${adminTiles_(x, null)}`;
}


/* ---------- A LEVEL --------------------------------------------------------------------------------
   THE SAME EMPTY NAME AS A SUBJECT, and for the same reason: booking from a level is booking the
   level, not a person, so there is nobody to name. Kept identical to `subjectTiles_` rather than
   made cleverer — the day `book-with` learns to carry a subject or a level through to the form,
   both of these change together, and they should be the same shape when that happens.

   OFF WHEN THE FORM CANNOT ASK FOR IT. A level missing from the options tab is not on the booking
   form's dropdown, so the button would open a form that has no way to select the thing you pressed
   it from. A button that cannot work says so. */
function levelTiles_(x) {
  const t = x.row || {};
  return `<div class="tile-row">
    ${tile_({ icon: 'book', label: t.listed === false ? 'Not on the booking form' : 'Book this',
              note: t.listed === false ? 'add it to the options tab' : '',
              off: t.listed === false,
              act: 'book-with', data: { name: '' } })}
  </div>${adminTiles_(x, null)}`;
}


/* ---------- A WEARABLE ------------------------------------------------------------------------------
   THE ONE THAT IS GENUINELY NOT A BASKET. Buying and putting on are a single act — there is nothing
   to post and nothing to collect — and the credits come off at the moment it goes on, which is what
   stops a failed request leaving somebody poorer than it found them.

   SO IT IS ONE ROW, AND THE ROW SAYS WHICH ACT IT IS: put it on, buy and wear it, or how far off it
   is. A LEVEL IS NOT A PRICE and never reads as one here — "6 more ticks to go" is a distance you
   can close, where "locked" is a door. */
function wearTiles_(x) {
  const level = levelFromXp(USER && USER.xp);
  const mine = wardrobe().find(w => w.slot === x.slot && w.id === x.artId);
  const owned = mine && mine.unlocked;
  const tooLow = x.level && level < x.level;
  const wearing = USER
    && avatarConfig(USER.avatar, USER.handle || USER.name)[x.slot] === x.artId;

  const label = !USER ? 'Sign in first'
    : wearing ? 'Wearing it'
    : tooLow ? (x.level * 10 - (Number(USER.xp) || 0)) + ' more ticks to go'
    : owned ? 'Put it on' : 'Buy and wear it';

  const note = !USER ? ''
    : wearing ? ''
    : tooLow ? 'level ' + x.level
    : owned ? '' : (x.cost ? x.cost + ' credits' : 'free');

  return `<div class="tile-row">
    ${tile_({ icon: 'wear', label, note, tone: tooLow ? '' : 'buy', on: !!wearing,
              act: 'wear', off: !USER || tooLow || wearing,
              data: { slot: x.slot, id: x.artId } })}
  </div>${adminTiles_(x, null)}`;
}


/* ---------- A TOOL OR A GAME ------------------------------------------------------------------------
   NOT A DETAILS PANEL — the sheet held the THING ITSELF, a timer or a board, and there is nothing
   about it to summarise onto a card. So it opens in place instead of over the top: the row toggles
   the widget open inside its own card, and `startWidget_` runs once the markup is in the document.

   IN PLACE RATHER THAN INLINE-ALWAYS, because a canvas loop running on every card of a list of
   forty is a flat battery for thirty-nine things nobody is looking at. */
function widgetTiles_(x) {
  const id = (x.row && x.row.id) || '';
  return `<div class="tile-row">
    ${tile_({ icon: 'open', label: 'Open', act: 'widget-open', data: { id } })}
  </div>
  <div class="widget-slot" id="wgt-${esc(String(id))}"></div>
  ${adminTiles_(x, null)}`;
}

on('widget-open', el => {
  const id = el.dataset.id;
  const wgt = WIDGETS.find(w => w.id === id);
  const slot = $('wgt-' + id);
  if (!wgt || !slot) return;

  /* A SECOND PRESS PUTS IT AWAY. A thing that can only be opened is a thing that fills the card and
     stays there — and on a list, the way back has to be the same control that got you in. */
  if (slot.innerHTML) { slot.innerHTML = ''; el.querySelector('.tile-k').textContent = 'Open'; return; }
  slot.innerHTML = wgt.html;
  el.querySelector('.tile-k').textContent = 'Close';
  startWidget_(wgt);
});


/* ---------- A BOUT -----------------------------------------------------------------------------
   THE ONLY ACTION A FIGHT HAS IS WATCHING IT, and it was a loose `.btn` in the middle of the card,
   above the tile row, styled like nothing else on the screen. It is the same act as opening a paper
   or a widget, so it is the same control in the same place.

   A LINK, NOT A BUTTON. `tile_` takes `href` and draws an anchor with `target` and `rel` already
   on it — which is the whole reason that branch exists, and it is what this was reaching past.

   `video_url` OR THE SEARCH, whichever the backend found — see `video: S(r.video_url) ||
   S(r.video_search_url)` in doget. So a bout nobody has tracked down still offers a way to look,
   and there is nothing here to tell the two apart. */
function fightTiles_(x) {
  const f = x.row || {};
  return `${f.video ? `<div class="tile-row">${
    tile_({ icon: 'play', label: 'Watch', href: f.video })}</div>` : ''}${adminTiles_(x, null)}`;
}


/* THE ONE ENTRY POINT the card builders call. A kind with nothing of its own still gets its admin
   rows, so a spotlight can go on anything findable rather than only on the two kinds that happen to
   have actions today. */
function cardTiles_(x) {
  /* THE STAR BEFORE EVERYTHING ELSE, on every kind, including the ones with no actions of their
     own — which is most of them. `favTile_` returns nothing for a card with no key or a visitor
     who is not signed in, so this stays one line rather than a condition per branch. */
  return favTile_(x) + cardActions_(x);
}

function cardActions_(x) {
  if (x.kind === 'topic') return topicTiles_(x);
  if (x.kind === 'shop') return x.wearable ? wearTiles_(x) : shopTiles_(x);
  if (x.kind === 'tutor') return tutorTiles_(x);
  if (x.kind === 'venue') return venueTiles_(x);
  if (x.kind === 'subject') return subjectTiles_(x);
  if (x.kind === 'level') return levelTiles_(x);
  if (x.kind === 'tool' || x.kind === 'game') return widgetTiles_(x);
  if (x.kind === 'fight') return fightTiles_(x);
  return adminTiles_(x, null);
}

/* A tap on a tile row that is not on a row. The rows used to sit inside a card whose whole surface
   opened a sheet; the surface no longer does anything, and this exists so a stray tap is explicitly
   nothing rather than accidentally something later. */
on('noop', () => {});
