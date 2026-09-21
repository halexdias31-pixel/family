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

   LOADED AFTER `find`, `resource` and `collections`: it reads `printPrice` and `canPrint` from
   find, `paperRows` and `CART` from resource, and `isSpot` from collections.
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
  /* A PRINTER: the sheet going in at the top, the body, the sheet coming out at the foot. Drawn as
     three open paths at the same 1.4 stroke as the rest — a solid printer would be the only filled
     mark in the row and would read as a state rather than an action. */
  print: '<path d="M5.5 6.5v-4h7v4"/><path d="M3.5 6.5h11v4h-11z"/><path d="M5.5 10.5h7v4h-7z"/>',
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
  show:  '<path d="M1.5 8.5S4.2 4 9 4s7.5 4.5 7.5 4.5S13.8 13 9 13s-7.5-4.5-7.5-4.5z"/>'
       + '<circle cx="9" cy="8.5" r="2.2"/>',
  hide:  '<path d="M3 3.5 15 14"/>'
       + '<path d="M7 5.1A7.7 7.7 0 0 1 9 4c4.8 0 7.5 4.5 7.5 4.5a14 14 0 0 1-2.6 2.9"/>'
       + '<path d="M11.4 10.6A2.2 2.2 0 0 1 7.5 8.9"/>'
       + '<path d="M12 12.4A7.6 7.6 0 0 1 9 13c-4.8 0-7.5-4.5-7.5-4.5a14 14 0 0 1 3.3-3.4"/>',
  close: '<path d="M4 4.5 14 14"/><path d="M14 4.5 4 14"/>',
  /* THE SHARE MARK. An arrow leaving a tray — the same idea the ↗ on a post was reaching for, drawn
     properly so it is the same weight and the same size as every other mark in the row. */
  /* AN ENVELOPE, WHICH IS THE ONE PICTURE EVERYBODY ALREADY READS. The paper aeroplane below means
     SEND — the act — and this means a message as a thing, which is what the control on a person's
     pass offers: it opens a sheet, it does not post anything. Two marks, two meanings, and the tile
     that actually sends sits inside the sheet using the aeroplane. */
  mail:  '<path d="M2.5 4h13v9.5h-13z"/><path d="m2.5 4.6 6.5 4.4 6.5-4.4"/>',
  share: '<path d="M9 11.5V2.5"/><path d="M5.8 5.7 9 2.5l3.2 3.2"/>'
       + '<path d="M3.5 9.5v5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-5"/>',
  /* THE PAPER AEROPLANE. Sending, and nothing else in the app sends — so it can be the one mark
     that means it. Drawn as an outline like the rest rather than the solid dart most apps use: a
     filled shape beside eleven outlined ones is a different set. */
  send:  '<path d="M16 2.5 2.5 7.8l5.4 2.3z"/><path d="M16 2.5 10.2 16l-2.3-5.9z"/>'
       + '<path d="M7.9 10.1 16 2.5"/>',
};

function tileIcon_(name) {
  const d = TILE_ICONS[name];
  if (!d) return '';
  /* ---------- THE MARK CARRIES ITS OWN NAME -------------------------------------------------
     SO THE STYLESHEET CAN TELL A STAR FROM A TROLLEY. "Filled means done" is written over
     `.tile.on` in style.css and was never implemented: the rule it names, `.favwrap.is-fav .star`,
     does not exist anywhere in the file — deleted at some point with the sentence left standing,
     which is the shape this repository records under `resource_type` in `VOCAB` and the dead
     `kind === 'paper'` guard. So a saved star has never filled, on any card, since that rule went.

     REPORTED AS "after i fabourite it the tile should be filled in."

     AND IT CANNOT BE EVERY MARK, which is why the name is needed rather than a bare `.tile.on`.
     These are outlines — `fill="none"`, stroked in `currentColor` — and a star, a jumper and a
     lamp are closed silhouettes that read filled. A trolley is a body and two wheels drawn as open
     paths, so filling it paints a wedge between the handle and the basket. Named, so the
     stylesheet says which and a reader can check it. */
  return `<svg class="tile-i tile-i-${esc(name)}" viewBox="0 0 18 17" aria-hidden="true"
    focusable="false" fill="none" stroke="currentColor" stroke-width="1.4"
    stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}


/* ---------- ONE CONTROL ---------------------------------------------------------------------------
   A LINK WHERE IT LEAVES THE APP, A BUTTON WHERE IT DOES NOT. Written once so the difference is a
   parameter rather than two nearly-identical strings that drift apart — and so `target` and
   `rel="noopener"` exist in exactly one place.

   ---------------------------------------------------------------------------------------------
   THE MARK IS THE WHOLE BUTTON NOW, AND THE WORD IS GONE.

   These were full-width rectangles with a word in them, stacked. Four of those under a card is a
   control panel bolted to the bottom of the thing you were looking at, and on a past paper it was
   taller than the paper.

   SO `title` AND `aria-label` COME BACK, both of them, and this is the honest cost of the change
   rather than an oversight. The old comment here said a label needing a hidden copy was the wrong
   label — that was true while the word was on the button. With no word there is nothing else to
   read, so the name has to exist somewhere a pointer and a screen reader can each find it, and
   those are two different attributes. A mark alone is a thing to be learnt; that is the trade, and
   it is the one that was asked for.

   THE NOTE GOES INTO THE NAME, not onto the button. "23 questions" and "£0.46 · 23pp" have nowhere
   to sit on a 40px square, so they ride in the label — "Paper · £0.46 · 23pp" — which is what both
   attributes say and is the only place the price still appears. */
function tile_(o) {
  const cls = 'tile' + (o.tone ? ' is-' + o.tone : '') + (o.on ? ' on' : '');
  const name = o.label + (o.note ? ' · ' + o.note : '');
  const attrs = ` title="${esc(name)}" aria-label="${esc(name)}"`;
  /* A MARK IS REQUIRED. A control with neither word nor mark is a blank square, so anything that
     has not been given one falls back to the word — visibly wrong, rather than invisible. */
  const body = tileIcon_(o.icon) || `<span class="tile-k">${esc(o.label)}</span>`;

  /* ---------- A TILE MAY LEAVE, BUT ONLY FOR SOMEWHERE ELSE ---------------------------------------
     `target="_blank"` IS THE ONE EXCEPTION to the rule that nothing opens over this app — see the
     `surfaces` tab in the Engine sheet. A fight's video is on YouTube; somebody's bank is not this
     app and should not pretend to be.

     SO THE EXCEPTION IS CHECKED RATHER THAN TRUSTED. An absolute http(s) address is somewhere else.
     Anything else — a relative path, a `#` fragment, a `javascript:` — is this app opening itself in
     a tab, which is the thing being forbidden, and it falls through to an ordinary button instead of
     going out through the one door left open.

     It is also what makes `check-surfaces` able to pass this line: the guard is right here, so the
     checker can see that the address was tested rather than assumed. */
  if (o.href && /^https?:\/\//i.test(String(o.href))) {
    return `<a class="${cls}" href="${esc(o.href)}"${attrs}
      target="_blank" rel="noopener">${body}</a>`;
  }
  const data = Object.keys(o.data || {})
    .map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  return `<button class="${cls}" data-do="${esc(o.act)}"${data}${attrs}${o.off ? ' disabled' : ''}
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
  /* THE NAME, NOT THE TEXT. There is no visible word to rewrite any more — the two attributes ARE
     the label, so a control that has just become "Saved" has to say so in both or a pointer and a
     screen reader will disagree about what it does. */
  if (o.label != null) {
    const name = o.label + (o.note ? ' · ' + o.note : '');
    el.setAttribute('title', name);
    el.setAttribute('aria-label', name);
  }
  /* THE MARK CAN CHANGE TOO — a bin becomes an undo, a doc becomes a trolley — and with no word
     underneath it is the only thing that says the press worked. */
  if (o.icon) {
    const old = el.querySelector('.tile-i');
    if (old) old.outerHTML = tileIcon_(o.icon);
  }
  if (o.on != null) el.classList.toggle('on', !!o.on);
  if (o.off != null) el.disabled = !!o.off;
}


/* ---------- THE ADMIN ROW ------------------------------------------------------------------------
   SPOTLIGHT, AND IT USED TO BE SPOTLIGHT, EDIT, DELETE — the things only an admin can do to a row,
   in the same order on every kind of card.

   EDIT AND DELETE ARE GONE, and only for a paper — they were the only two that took `t`, the
   document behind the card, and wrote a cell on its row. The library is `data/questions.json` in
   this repository now: a relabel is a commit and a delete is a line changed, neither of which a
   phone can do. `check-doors.js` pairs every `act` against a handler, so leaving a silver Edit tile
   here pointed at a removed `on('topic-edit')` would have failed the build — which is exactly the
   guard that should catch it.

   `t` IS STILL TAKEN AND STILL IGNORED-IF-ABSENT, so every caller is unchanged; it costs one unused
   argument and saves touching nine call sites for a row that may yet get an admin control back.

   `x.key` rather than the row's id: the spotlight set is keyed on whatever the CARD is keyed on,
   which for a widget is `w:123` and for a venue is its name. */
function adminTiles_(x, t) {
  if (!isAdmin()) return '';
  /* A `span`, NOT A ROW. These go inside the one row every card has now — see `tilesFor_`. It keeps
     the group for a screen reader, which is the half of the old wrapper worth having. */
  return `<span class="tile-group is-admin" role="group" aria-label="Admin">
    ${tile_({ icon: 'spot', label: isSpot(x.key) ? 'Spotlit' : 'Spotlight', tone: 'admin',
              on: isSpot(x.key), act: 'spot',
              data: { key: x.key, kind: x.kind || 'item' } })}
  </span>`;
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
  return tile_({ icon: 'star', label: isFav(x.key) ? 'Saved' : 'Save', on: isFav(x.key),
                 act: 'fav', data: { key: x.key, kind: x.kind || 'item' } });
}


/* ---------- `topicTiles_` WAS HERE, AND THERE ARE NO DOCUMENTS TO ACT ON --------------------------
   It was the action row under a past paper: `Read`, which opened the whole thing in a sheet, and
   `Paper`, which put a printed copy in the basket at pages x rate. Both took `x.topic` — the
   document behind the card — and there are no document cards. See the note above `questionItems`
   in find.js.

   THE PRINT LINE IS THE REAL LOSS AND IT IS WORTH NAMING. You cannot print one question; a print is
   a whole paper, priced per page, and this screen no longer lists a whole paper. `printPrice` and
   `canPrint` are still in find.js and `CART` still holds a `print` line if anything makes one —
   nothing does. Selling paper again means a surface that lists documents, which is the thing that
   was just removed from the funnel on purpose. Somewhere else, deliberately, or not at all.
--------------------------------------------------------------------------------------------- */




/* ---------- A SHOP THING ---------------------------------------------------------------------------
   A WEARABLE IS DELIBERATELY NOT HERE. Buying and equipping it are ONE act — nothing to post and
   nothing to collect, so it never enters a basket — and that is a different gesture from anything
   on this row. It keeps its sheet until it has a screen of its own. */
function shopTiles_(x) {
  const inCart = CART.some(c => c.key === x.key && c.kind === 'shop');
  return `
    ${tile_({ icon: 'cart', label: inCart ? 'In your basket' : 'Add to basket',
              tone: 'buy', on: inCart,
              note: inCart ? '' : (x.cost ? x.cost + ' credits' : 'free'),
              act: 'cart-add', off: !USER || inCart,
              data: { key: x.key, kind: 'shop' } })}
  `;
}


/* ---------- A TUTOR --------------------------------------------------------------------------------
   THE PASS ALREADY SAYS WHO THEY ARE — photograph, name, what they teach, rate, DBS. The sheet
   repeated all of that and added a borough, a full subject list and one button. So the borough and
   the list go onto the pass where the rest of the person is, and the button comes down here.

   `Listed` IS ADMIN AND DESTRUCTIVE-ISH: unticking it takes somebody off the site for every client
   at once. It was a checkbox in a panel, which is where a switch goes to be flipped by accident;
   as a silver row it is as deliberate as Delete and reads the same way. */
/* ---------- A TUTOR'S OWN ACTIONS, AND NOT THE ONES EVERY CARD HAS ---------------------------------
   THIS DREW ITS OWN ADMIN ROW, and `cardTiles_` adds one to every card — so a tutor came out with
   Spotlight twice: once in the silver row this built, once in the silver row underneath it. The
   second row held a single mark and looked like a rendering fault, because that is what it was.

   `Listed` IS A TUTOR'S ALONE and stays here. Spotlight is not — it is on a boxer, a venue, a paper
   and a subject, drawn by `adminTiles_` for all of them — and a card that also draws it is a card
   claiming a control the system already gives it.

   THE ROW WRAPPER GOES TOO. Every other `*Tiles_` returns bare tiles and lets `cardTiles_` do the
   wrapping; this one built its own `<div class="tile-row is-admin">`, which is how it ended up
   beside a second one rather than inside it. */
/* IS THIS CARD ME? By id where there is one and by name where there is not — the same order
   `findPerson` uses on the server, so the two agree about who somebody is. */
function isMe_(x) {
  if (!USER) return false;
  const id = (x.row && x.row.personId) || '';
  if (id && USER.personId) return String(id) === String(USER.personId);
  return norm(x.name) === norm(USER.name);
}

function tutorTiles_(x) {
  const t = x.row || {};
  return `
    ${/* ---------- `Book with them` WAS HERE -----------------------------------------------------
          YOU DO NOT BOOK FROM A PERSON. A pass is who somebody is — their subjects, their rate,
          whether they are cleared — and it is read while deciding, not while arranging. The form
          asks twelve questions and a tutor is one of them; a button that jumps there from one answer
          skips the other eleven and lands somebody in a half-filled form they did not open.

          THE FORM IS ONE ANSWER AWAY. `What for · Booking` is the first question in the funnel and
          the form is the page behind it, which is a shorter route than most cards offer to anything.
          Nothing has been made harder to reach; a second entrance has been closed. */''}
    ${/* SILVER, IN THE ORDINARY ROW. Every other admin mark sits in its own silver row below —
          `adminTiles_` builds that — and `Listed` cannot join it, because that row is built for
          every kind and this control exists only for a tutor. The tone still says who it is for. */''}
    ${/* ---------- WRITE TO THEM, FROM THE ONE PLACE YOU ARE LOOKING AT THEM --------------------
          `sendMessage` HAS BEEN A DOOR WITH NO HANDLE SINCE MESSAGES WERE BUILT. The backend has
          the whole thing — a role policy, a five-minute gap, a length cap and an email to the
          recipient — and nothing in the app has ever posted to it. Measured: of the four message
          actions, one (`messages`, the read) had a caller and three had none. The note in me.js
          says exactly why and where it belongs: "there is no picker for WHO — that belongs with
          the roster, where the people you are talking to are already on screen."

          THIS IS THAT PLACE. A tutor's pass IS the picker: you are already looking at the person,
          so the control names them and nothing has to be typed or searched for.

          ONLY WHEN SIGNED IN, because a stranger has nobody to send it as — and the sheet would
          have to explain that instead of taking a message. Not shown on your own pass either;
          `sendMessage` answers "That is you." and a control whose only outcome is that sentence is
          a control that should not be there.

          WHETHER YOU MAY IS THE BACKEND'S TO SAY, and it is not repeated here. `MESSAGING` in
          constants.gs is the policy — a student may reach an admin and nobody else, parents cannot
          write to each other — and copying it into the phone is two rules to keep in step, which
          is the fault this repository records under `kinds`, under `link`/`source_url` and under
          `childrenOf`. The sheet shows the server's own sentence, which already says what to do
          instead: "You cannot message them directly. An admin can pass it on." */''}
    ${(USER && !isMe_(x)) ? tile_({ icon: 'mail', label: 'Message',
              note: 'a note to them', act: 'msg-open',
              data: { to: x.name, id: (x.row && x.row.personId) || '' } }) : ''}
    ${isAdmin() ? tile_({ icon: t.listed === false ? 'hide' : 'show',
              label: t.listed === false ? 'Not listed' : 'Listed', tone: 'admin',
              on: t.listed !== false, act: 'set-listed',
              note: t.listed === false ? 'clients cannot see them' : 'clients can see them',
              data: { who: x.key } }) : ''}`;
}


/* ---------- A VENUE HAS NO ACTIONS OF ITS OWN ---------------------------------------------------------
   THE SLIP ALREADY CARRIES EVERY FACT the sheet had — the rooms, their capacities, their rates and
   the notice period — and it carried them better, one line per room against a single "from" price.
   The sheet was a worse copy of the card in front of it. Only the button was ever new, and the
   button has gone the same way as the tutor's: a room is where a session happens, not the thing you
   are arranging, and booking starts on the form rather than on whichever fact you happened to be
   reading when you decided.

   NOTHING RETURNED, RATHER THAN AN EMPTY ROW. `cardTiles_` adds the star and the admin marks to
   every kind whether or not it has actions of its own, so a venue keeps everything that is not
   specific to being a venue — which, now, is all of it. */
function venueTiles_(x) { return ''; }


/* ---------- A SUBJECT -------------------------------------------------------------------------------
   `Book this` SENT AN EMPTY NAME in the sheet — `data-name=""` — so booking from a subject asked for
   nobody in particular. Kept exactly as it was rather than quietly fixed: booking a subject with no
   tutor named may well be right, and changing what a button DOES while moving it is how a move gets
   blamed for a bug it did not cause. */
function subjectTiles_(x) {
  return `
    ${tile_({ icon: 'book', label: 'Book this', act: 'book-with', data: { name: '' } })}
  `;
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
  return `
    ${tile_({ icon: 'book', label: t.listed === false ? 'Not on the booking form' : 'Book this',
              note: t.listed === false ? 'add it to the options tab' : '',
              off: t.listed === false,
              act: 'book-with', data: { name: '' } })}
  `;
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

  return `
    ${tile_({ icon: 'wear', label, note, tone: tooLow ? '' : 'buy', on: !!wearing,
              act: 'wear', off: !USER || tooLow || wearing,
              data: { slot: x.slot, id: x.artId } })}
  `;
}


/* ---------- A TOOL OR A GAME ------------------------------------------------------------------------
   NOT A DETAILS PANEL — the sheet held the THING ITSELF, a timer or a board, and there is nothing
   about it to summarise onto a card. So it opens in place instead of over the top: the row toggles
   the widget open inside its own card, and `startWidget_` runs once the markup is in the document.

   IN PLACE RATHER THAN INLINE-ALWAYS, because a canvas loop running on every card of a list of
   forty is a flat battery for thirty-nine things nobody is looking at. */
function widgetTiles_(x) {
  const id = (x.row && x.row.id) || '';
  return `
    ${tile_({ icon: 'open', label: 'Open', act: 'widget-open', data: { id } })}
  <div class="widget-slot" id="wgt-${esc(String(id))}"></div>`;
}

on('widget-open', el => {
  const id = el.dataset.id;
  /* THROUGH `allWidgets`, NOT THE CONST — message threads are built from the payload and are not in
     `WIDGETS`. Looking at the const would list a conversation and then fail to open it. */
  const wgt = allWidgets().find(w => w.id === id);
  const slot = $('wgt-' + id);
  if (!wgt || !slot) return;

  /* A SECOND PRESS PUTS IT AWAY. A thing that can only be opened is a thing that fills the card and
     stays there — and on a list, the way back has to be the same control that got you in. */
  /* THROUGH `tileSet_`, NOT INTO `.tile-k`. There is no `.tile-k` on an icon-only tile, so both of
     these lines were `null.textContent` — a thrown error on the first press of Open, and on the
     press that put it away again. `tileSet_` swaps the mark and rewrites the name. */
  if (slot.innerHTML) {
    slot.innerHTML = '';
    tileSet_(el, { icon: 'open', label: 'Open', on: false });
    return;
  }
  slot.innerHTML = wgt.html;
  tileSet_(el, { icon: 'close', label: 'Close', on: true });
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
/* ---------- WHAT YOU CAN DO ABOUT YOURSELF -------------------------------------------------------
   THREE TAP-CARDS BECAME THREE MARKS. "Edit your details", "Add your child" and the wardrobe were
   full cards in the `You` column, each a heading and a sentence, each doing one thing — which is
   what a tile is for.

   ADDING A CHILD IS NOT FOR EVERYBODY. A student has nobody to add, which is the same condition the
   card carried; it is asked here now so the row is right for whoever is looking. */
function meTiles_() {
  const parent = heldRoles().indexOf('client') !== -1
    || heldRoles().indexOf('parent') !== -1
    || heldRoles().indexOf('admin') !== -1;
  /* THE BUILD STAMPS, FOR YOU ONLY. They were a card of their own at the foot of the You column,
     and when that column became pages in the funnel they landed between the question and this card
     — a page of version numbers in front of everybody, answering a question only an admin asks.
     A tile is the right size for it: out of the way, one tap, on the card it is about. */
  return `${tile_({ icon: 'edit', label: 'Edit your details', act: 'edit-me' })}
    ${parent ? tile_({ icon: 'star', label: 'Add your child', act: 'add-child' }) : ''}
    ${tile_({ icon: 'wear', label: 'Your figure', act: 'wardrobe' })}
    ${isAdmin() ? tile_({ icon: 'note', label: 'Build', act: 'build-said' }) : ''}`;
}

function fightTiles_(x) {
  const f = x.row || {};
  return f.video ? tile_({ icon: 'play', label: 'Watch', href: f.video }) : '';
}


/* THE ONE ENTRY POINT the card builders call. A kind with nothing of its own still gets its admin
   rows, so a spotlight can go on anything findable rather than only on the two kinds that happen to
   have actions today. */
function cardTiles_(x) {
  /* ---------- ONE ROW OF MARKS, UNDER THE CARD ----------------------------------------------------
     THE STAR FIRST, on every kind including the ones with no actions of their own — which is most
     of them. `favTile_` returns nothing for a card with no key or a visitor who is not signed in,
     so this stays one line rather than a condition per branch.

     ---- ONE ROW NOW, AND THE SAFETY ARGUMENT IS ANSWERED RATHER THAN DROPPED ----------------------
     THIS SAID "ADMIN STAYS ITS OWN ROW", and the reason was real: a bin in the same row as a
     trolley is one mis-tap from deleting a thing somebody meant to buy. What it produced was two
     rows of controls that looked like two different species — one bare, one on tinted plates — for
     actions that are all the same act: press a mark, something happens to this card.

     THE DISTANCE IS KEPT WITHOUT THE SECOND ROW. `is-admin` pushes off the left edge with an auto
     margin, so the admin marks sit at the far end of the row with the whole gap between them and
     the trolley — further apart on a phone than they were stacked, where a bin sat directly beneath
     a trolley and a thumb travels vertically. The colour says the rest. */
  const mine = favTile_(x) + cardActions_(x);
  const admin = adminTiles_(x, x.topic || null);
  if (!mine && !admin) return '';
  return `<div class="tile-row">${mine}${admin}</div>`;
}

function cardActions_(x) {
  /* `topic` WAS HERE, routing to `topicTiles_`. No documents, no row. */
  if (x.kind === 'shop') return x.wearable ? wearTiles_(x) : shopTiles_(x);
  if (x.kind === 'tutor') return tutorTiles_(x);
  if (x.kind === 'venue') return venueTiles_(x);
  if (x.kind === 'subject') return subjectTiles_(x);
  if (x.kind === 'level') return levelTiles_(x);
  if (x.kind === 'tool' || x.kind === 'game') return widgetTiles_(x);
  if (x.kind === 'fight') return fightTiles_(x);
  if (x.kind === 'me') return meTiles_(x);
  if (x.kind === 'receipt') return jobTiles_(x);
  /* THE `group` TILE WAS HERE — "Open", on a card standing for a whole paper. Collections are gone
     from the funnel (see the note where `collectionAxes_` used to be in find.js): a paper is an
     ANSWER to an ordinary question now, so opening one is a tap on the funnel's own answer row and
     there is no card to hang a tile on. */
  return '';
}

/* ---------- WHAT YOU CAN DO WITH A SESSION -------------------------------------------------------
   PAY AND WITHDRAW WERE FULL-WIDTH BUTTONS UNDER THE PAPER, each with a paragraph beneath it — two
   blocks of prose and two slabs of colour on a card whose actual content is fourteen rows. Every
   other kind in this app answers the same question with one row of marks, and a session had no
   reason to be the exception.

   THE WORDS ARE NOT LOST. `tile_` puts the label in `title` and `aria-label`, so the mark is named
   on hover and read aloud — and the two sentences those buttons carried are facts about the
   session, which now say themselves on the receipt: `Stage` says whether it is waiting on us, and
   `Total` says what it comes to.

   ASKING IS STILL ASKED. `job-leave` confirms before it does anything and the question names the
   consequence — that was never the button's job, and shrinking the button does not change it.

   ORDER: pay, then leave. The same order they stood in, and for the same reason — one is what most
   people came to do, the other is looked for deliberately. */
function jobTiles_(x) {
  const j = x.row || {};
  const id = String(j.id || j.jobId || '');
  if (!id || !USER) return '';
  const mine = (j.slots || []).some(sl => norm(sl.client) === norm(USER.name));
  if (!mine) return '';
  const paid = (j.slots || []).some(sl =>
    norm(sl.client) === norm(USER.name) && /^(paying|booked)$/i.test(String(sl.status || '')));
  const owed = typeof jobAccepted_ === 'function' && jobAccepted_(j) && !paid;
  return `
    ${owed ? tile_({ icon: 'cart', label: 'Pay and confirm', tone: 'buy',
                     note: typeof money === 'function' ? money(j.price || 0) : '',
                     act: 'job-pay', data: { id: id } }) : ''}
    ${tile_({ icon: 'undo', label: 'Withdraw from this',
              act: 'job-leave', data: { id: id, paid: paid ? '1' : '' } })}
  `;
}

/* A tap on a tile row that is not on a row. The rows used to sit inside a card whose whole surface
   opened a sheet; the surface no longer does anything, and this exists so a stray tap is explicitly
   nothing rather than accidentally something later. */
/* ---------- AN ADMIN'S ACTIONS ON A JOB, AS TILES -------------------------------------------------
   THEY WERE FOUR `<button>`s BUILT INSIDE THE RECEIPT and `jobTiles_` twelve lines up was already
   building the client's two. So one object — a session — had its actions drawn by two different
   renderers in two files, in two shapes, and only one of them was checked by anything.

   THE RULE THIS SETTLES, and it was never written down: a THING has tiles; a FORM has buttons. A
   session is a thing. The booking form and the pay sheet are forms, and their buttons stay where
   they are — see the note in CLAUDE.md.

   WHAT IT COSTS, honestly: the old block carried a paragraph under each button explaining the
   consequence, and a tile has room for a few words. The consequences are too important to drop, so
   they are one paragraph under the row rather than one per button — the same words, said once.

   THE ORDER IS THE ORDER OF THE DECISION. Accept and Decline are two halves of one choice and sit
   together; Mark as paid only exists once it is accepted; Delete is last because it is a different
   act — Decline turns down a session never taken up, Delete ends one that was already agreed. */
function jobAdminTiles_(j, stage, accepted) {
  const id = String((j && (j.id || j.jobId)) || '');
  if (!id) return '';
  const rows = [];
  if (stage === 'application' || stage === 'waitlist') {
    rows.push(tile_({ icon: 'book', label: 'Accept', tone: 'buy', note: 'settles the terms',
                      act: 'job-answer', data: { id: id, yes: '1' } }));
    rows.push(tile_({ icon: 'close', label: 'Decline', note: 'turns it down',
                      act: 'job-answer', data: { id: id, yes: '' } }));
  }
  /* ONLY ONCE IT IS ACCEPTED. Marking an unagreed booking paid puts somebody on a session whose
     price and day nobody has settled — the backend refuses it, so this does not offer it and the
     refusal is never something to run into. */
  if (stage === 'application' && accepted) {
    rows.push(tile_({ icon: 'cart', label: 'Mark as paid', note: 'cash or transfer',
                      act: 'job-paid', data: { id: id } }));
  }
  rows.push(tile_({ icon: 'bin', label: 'Delete', tone: 'danger', note: 'ends it for everybody',
                    act: 'job-delete', data: { id: id } }));
  /* `.tile-row`, WHICH IS WHAT EVERY OTHER TILE ROW IN THIS APP USES — see `cardTiles_` above.
     `.tiles` is a different thing entirely (the widget grid) and putting these in one would have
     made an admin's four actions lay out like a drawer of tools. */
  return `<div class="tile-row">${rows.join('')}</div>`;
}

/* ---------- WHAT YOU CAN DO ABOUT A POST ----------------------------------------------------------
   A POST IS A THING, SO IT HAS TILES. That is the rule in CLAUDE.md and this was the last thing in
   the app still arguing with it: a `<span>` holding `⋯` for editing, a `<button class="post-act">`
   for sharing, and two `.btn`s for putting it up — three different controls for three actions on one
   object, in three places on the card, styled three ways.

   THE SPAN WAS THE WORST OF THE THREE and it is the same fault the docket had: a `<span>` with a
   `data-do` on it cannot be reached by a keyboard, is not announced as a control, and is invisible
   to `check/ui.js`'s tap-target pass because that pass looks at buttons, links and inputs. It
   measured nothing and was about 14px.

   `jobAdminTiles_` ABOVE IS THE PATTERN and this follows it exactly: one `.tile-row`, ordinary
   actions first, the admin's decisions after, destructive last, and any real warning as ONE
   paragraph under the row rather than one note per tile.

   SHARING STAYS OUT OF THE REACTIONS ROW. The reactions are not actions on the post — they are a
   counted response, they wrap to two lines, and the note on `.post-acts` explains that the row is
   aligned to flex-start because of it. A tile row underneath is the same place every other thing in
   this app puts its actions. */
function postTiles_(p) {
  const id = String((p && p.id) || '');
  if (!id) return '';
  const rows = [tile_({ icon: 'share', label: 'Share', act: 'share', data: { id: id } })];
  if (typeof isAdmin === 'function' && isAdmin()) {
    rows.push(tile_({ icon: 'edit', label: 'Edit', act: 'post-edit', data: { id: id } }));
    /* THE DECISION, ON THE POST ITSELF — the same argument the old button row carried and worth
       keeping: you are already looking at the photograph and the caption, which is everything the
       decision is about, and a separate approvals screen is a second place to remember to visit. */
    if (p.waiting || p.refused) {
      rows.push(tile_({ icon: 'show', label: 'Put it up', tone: 'buy', note: 'everyone sees it',
                        act: 'post-approve', data: { id: id, on: '1' } }));
      /* ALREADY REFUSED MEANS THERE IS NOTHING LEFT TO REFUSE. Offering it again is offering a
         control that does nothing, which is how somebody learns not to trust the row. */
      if (!p.refused) {
        rows.push(tile_({ icon: 'hide', label: 'Not this one', note: 'stays hidden',
                          act: 'post-approve', data: { id: id, on: '' } }));
      }
    }
  }
  return `<div class="tile-row">${rows.join('')}</div>`;
}

on('noop', () => {});
