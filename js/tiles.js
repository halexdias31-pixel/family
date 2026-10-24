/* @family. — tiles.js THE SHEET IS GONE. § */


/* ---------- THE MARKS ON THE BUTTONS § */
/* ---------- ONE SPEAKER, DRAWN ONCE, FOR THE THREE MARKS THAT HAVE ONE § */
const TILE_CONE_  = '<path d="M2.5 6.5h3l4-3.5v11l-4-3.5h-3z"/>';
const TILE_WAVES_ = '<path d="M12 6.2a3.2 3.2 0 0 1 0 4.6"/><path d="M14 4a6 6 0 0 1 0 9"/>';
const TILE_ICONS = {
  play:  '<path d="M5 3.5v11l9-5.5z"/>',
  pause: '<path d="M6 3.5v10"/><path d="M12 3.5v10"/>',
  doc:   '<path d="M4.5 2.5h6l3 3v10h-9z"/><path d="M10.5 2.5v3.5h3"/>',
  /* A PRINTER: the sheet going in at the top, the body, the sheet coming out at the foot. § */
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
  flag:  '<path d="M4 15.5v-13"/><path d="M4 3h9l-2 3 2 3H4"/>',
  spot:  '<path d="M9 1.5v2.5"/><path d="M9 14v2.5"/><path d="M2.2 8.5h2.4"/>'
       + '<path d="M13.4 8.5h2.4"/><circle cx="9" cy="8.5" r="3"/>',
  edit:  '<path d="M11.5 2.8 14.2 5.5 6 13.7l-3.4.7.7-3.4z"/><path d="m10.2 4.1 2.7 2.7"/>',
  bin:   '<path d="M2.8 4.5h12.4"/><path d="M6.5 4.5V2.8h5v1.7"/>'
       + '<path d="M4.5 4.5 5.3 15h7.4l.8-10.5"/>',
  undo:  '<path d="M2.8 8.5h8a3.5 3.5 0 1 1 0 7H6"/><path d="M5.5 5.5 2.5 8.5l3 3"/>',
  show:  '<path d="M1.5 8.5S4.2 4 9 4s7.5 4.5 7.5 4.5S13.8 13 9 13s-7.5-4.5-7.5-4.5z"/>'
       + '<circle cx="9" cy="8.5" r="2.2"/>',
  /* A TICK, FOR CHECK -- "check button should be a tile". § */
  tick:  '<path d="M3.5 9.5l3.5 3.5 7.5-8"/>',
  hide:  '<path d="M3 3.5 15 14"/>'
       + '<path d="M7 5.1A7.7 7.7 0 0 1 9 4c4.8 0 7.5 4.5 7.5 4.5a14 14 0 0 1-2.6 2.9"/>'
       + '<path d="M11.4 10.6A2.2 2.2 0 0 1 7.5 8.9"/>'
       + '<path d="M12 12.4A7.6 7.6 0 0 1 9 13c-4.8 0-7.5-4.5-7.5-4.5a14 14 0 0 1 3.3-3.4"/>',
  close: '<path d="M4 4.5 14 14"/><path d="M14 4.5 4 14"/>',
  /* ---------- A PADLOCK, AND THE TWO DIFFER BY ONE STROKE § */
  lock:   '<rect x="4" y="8" width="10" height="6.8" rx="1.5"/>'
        + '<path d="M6.2 8V6a2.8 2.8 0 0 1 5.6 0v2"/>',
  unlock: '<rect x="4" y="8" width="10" height="6.8" rx="1.5"/>'
        + '<path d="M6.2 8V6a2.8 2.8 0 0 1 5.6 0"/>',
  /* A SPEECH BUBBLE, ON "change message tile to look like a speach bubble". § */
  chat:  '<path d="M4.5 2.5h9a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-2.5 2.5H9L4.5 15.5V12'
       + 'a2.5 2.5 0 0 1-2.5-2.5V5a2.5 2.5 0 0 1 2.5-2.5z"/>',
  /* THE SHARE MARK. An arrow leaving a tray — the same idea the ↗ on a post was reaching for, drawn
     properly so it is the same weight and the same size as every other mark in the row. */
  share: '<path d="M9 11.5V2.5"/><path d="M5.8 5.7 9 2.5l3.2 3.2"/>'
       + '<path d="M3.5 9.5v5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-5"/>',
  /* THE PAPER AEROPLANE. § */
  send:  '<path d="M16 2.5 2.5 7.8l5.4 2.3z"/><path d="M16 2.5 10.2 16l-2.3-5.9z"/>'
       + '<path d="M7.9 10.1 16 2.5"/>',
  /* SAVE IS A TICK, not a floppy disk: nobody who uses this app has held one, and a tick is what
     every form here already means by "done". */
  save:  '<path d="M3.5 9.5 7.3 13.3 14.8 4.8"/>',
  /* ADD IS A PLUS, the one mark every phone already puts on "one more of these" — the qualifications
     card's `+` under its list (see `qualShelf_` in me.js). Two strokes, open, the set's 1.4. */
  plus:  '<path d="M9 3.5v11"/><path d="M3.5 9h11"/>',
  /* A CAMERA, FOR CHOOSING YOUR PICTURE: the body, the bump the shutter sits on, and the lens. The
     word beside it says choose rather than take, because the phone offers its gallery first. */
  photo: '<rect x="2.5" y="5.5" width="13" height="9" rx="1.5"/><path d="M6.5 5.5 7.5 3.5h3l1 2"/>'
       + '<circle cx="9" cy="10" r="2.4"/>',
  /* SIGN OUT: a door frame and an arrow leaving it. */
  out:   '<path d="M8.5 2.5h-5v13h5"/><path d="M7.5 9h8.5"/><path d="m13 6 3 3-3 3"/>',
  /* ---------- AND THE THREE ON THE SIGN-IN CARD § */
  in:    '<path d="M9.5 2.5h5v13h-5"/><path d="M2 9h8.5"/><path d="m7.5 6 3 3-3 3"/>',
  key:   '<circle cx="5.5" cy="9" r="3"/><path d="M8.5 9h7"/><path d="M13.5 9v2.5"/>'
       + '<path d="M11.2 9v1.8"/>',
  join:  '<circle cx="7" cy="5.5" r="2.6"/><path d="M2 15.5a5 5 0 0 1 10 0"/>'
       + '<path d="M14 6v5"/><path d="M11.5 8.5h5"/>',
  /* FULL SCREEN: four corners pushed outward, the mark every video player puts on the button that
     asked for it — asked for in those words on the Videos widget. Four open paths, so it sits in
     the set as one more outline. */
  full:  '<path d="M2.5 6.5v-4h4"/><path d="M11.5 2.5h4v4"/>'
       + '<path d="M15.5 11.5v4h-4"/><path d="M6.5 15.5h-4v-4"/>',
  /* EXIT FULL SCREEN: the same four corners turned inward, the mark every video player puts on the button that gives the screen back — the videos card's own full § */
  unfull: '<path d="M6.5 2.5v4h-4"/><path d="M11.5 2.5v4h4"/>'
        + '<path d="M15.5 11.5h-4v4"/><path d="M2.5 11.5h4v4"/>',
  /* SYNC: two arrows chasing each other round a circle, the mark every phone puts on "fetch it again from where it really lives" — the videos card's Sync from § */
  sync:  '<path d="M3.1 6.3a6.3 6.3 0 0 1 10.4-2.35L16.7 7"/><path d="M16.7 2.8V7h-4.2"/>'
       + '<path d="M14.9 10.7a6.3 6.3 0 0 1-10.4 2.35L1.3 10"/><path d="M1.3 14.2V10h4.2"/>',
  /* ---------- AND THREE THAT ARE NOT ON A TILE: THE VIDEOS CARD'S, AFTER YOUTUBE § */
  search: '<circle cx="7.6" cy="7.4" r="4.9"/><path d="m11.2 11 4.6 4.5"/>',
  film:  '<rect x="2.5" y="2.5" width="13" height="12" rx="1.5"/>'
       + '<path d="M5.5 2.5v12M12.5 2.5v12M2.5 6.5h3M2.5 10.5h3M12.5 6.5h3M12.5 10.5h3"/>',
  ext:   '<path d="M8 3.5H3.5v11h11V10"/><path d="M10.5 2.5h5v5"/><path d="m15.5 2.5-7 7"/>',
  /* ---------- A QUESTION'S PAGES, WHICH ARE ALL TILES NOW § */
  pen:   '<path d="M12.6 2.6 15 5 7.2 12.8l-3.2.8.8-3.2z"/>'
       + '<path d="M9 15.2c1.6-1.2 2.6.6 4 0s1.8-1 2.6-1"/>',
  ruler: '<g transform="rotate(-38 9 8.5)"><rect x="1.5" y="5.8" width="15" height="5.4" rx="1"/>'
       + '<path d="M4.5 5.8v2.2M7.5 5.8v1.4M10.5 5.8v2.2M13.5 5.8v1.4"/></g>',
  protractor: '<path d="M2 13.5h14M2 13.5a7 7 0 0 1 14 0"/><path d="M9 13.5 13 8.2M9 6.5v1.6M4.1 8.6l1.1 1.1M13.9 8.6l-1.1 1.1"/>',
  compass: '<circle cx="9" cy="3" r="1.3"/><path d="M8.4 4.2 4.2 15.5"/><path d="M9.6 4.2 13.8 15.5"/>'
         + '<path d="M5.6 11.6c2.2 1.3 4.6 1.3 6.8 0"/>',
  spark: '<path d="M8 3c.5 3.3 2.2 5 5.5 5.5-3.3.5-5 2.2-5.5 5.5-.5-3.3-2.2-5-5.5-5.5 3.3-.5 5-2.2 5.5-5.5z"/>'
       + '<path d="M14.5 1.8v3.4M12.8 3.5h3.4"/>',
  /* THE FIGURE IS A FRAMED PICTURE -- a hill and a sun in a frame, the mark every phone uses for "an image" -- and not `photo`, the camera, which means "take one". § */
  figure: '<rect x="2" y="2.5" width="14" height="12" rx="1.5"/><path d="m2.5 13 4.5-5 3.5 3.5 2-2 3 3.2"/>'
        + '<circle cx="12" cy="6" r="1.2"/>',
  /* A SPEAKER WITH ITS TWO WAVES, FOR IMPOSTER'S LISTEN AND ITS READ ALOUD SWITCH -- "so young ones who can’t read can play. Like it will read it out for them." § */
  speak: TILE_CONE_ + TILE_WAVES_,
  /* ---------- THE REELS' SOUND, AND THE TWO DIFFER BY WHAT COMES OUT OF THE CONE § */
  sound: TILE_CONE_ + TILE_WAVES_,
  mute:  TILE_CONE_ + '<path d="M2.5 2.5 15.5 14.5"/>',
  /* ---------- THE WHITEBOARD'S SHAPES (board.js, 377): each the sign and the empty box it brings to write in ---------- */
  frac:  '<rect x="6" y="1.5" width="6" height="4.5" rx=".8"/><path d="M3 8.5h12"/><rect x="6" y="11" width="6" height="4.5" rx=".8"/>',
  power: '<rect x="2" y="6.5" width="8" height="8" rx="1"/><rect x="11.5" y="2" width="4.5" height="4.5" rx=".8"/>',
  root:  '<path d="M1.5 9.5 3.5 8.5 6 14.5 9 2.5h7.5"/><rect x="10" y="6" width="5.5" height="7" rx=".8"/>',
  integral: '<path d="M3.5 15c1.6.6 2.6-.2 3-2.2l1.6-8.6c.4-2 1.4-2.8 3-2.2"/><rect x="11" y="7" width="5" height="6" rx=".8"/>',
  /* THE RETURN KEY'S ARROW: down the right and back to the left, where the next line starts. */
  newline: '<path d="M15 2.5v7H3.5"/><path d="M7 6 3.5 9.5 7 13"/>',
  /* SPEED READ (403): the reader's two guide ticks, and a line of words running through them. */
  speed: '<path d="M9 1.5v3.5"/><path d="M9 12v3.5"/><path d="M2 8.5h4.5"/><path d="M8 8.5h2"/><path d="M11.5 8.5h4.5"/>',
};

function tileIcon_(name) {
  const d = TILE_ICONS[name];
  if (!d) return '';
  /* ---------- THE MARK CARRIES ITS OWN NAME § */
  return `<svg class="tile-i tile-i-${esc(name)}" viewBox="0 0 18 17" aria-hidden="true"
    focusable="false" fill="none" stroke="currentColor" stroke-width="1.4"
    stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}


/* ---------- ONE CONTROL § */
/* ONE CHECK ON EVERY QUESTION (368): the same mark, word and place whatever marks it; an ordinary tile like its neighbours, last in the row (374, the owner: uniformity) */
function checkTile_(o) {
  return tile_(Object.assign({ icon: 'send', label: 'Check' }, o));
}
function tile_(o) {
  /* `cls` IS A NAME A CHECK OR A NEIGHBOUR FINDS THE TILE BY (`.qp-check`), never a look: the tile's
     appearance is this renderer's alone, which is the point of having one. */
  const cls = 'tile' + (o.tone ? ' is-' + o.tone : '') + (o.on ? ' on' : '') + (o.cls ? ' ' + o.cls : '');
  const name = o.label + (o.note ? ' · ' + o.note : '');
  const attrs = ` title="${esc(name)}" aria-label="${esc(name)}"`;
  /* A MARK IS REQUIRED. A control with neither word nor mark is a blank square, so anything that
     has not been given one falls back to the word — visibly wrong, rather than invisible. */
  const body = tileIcon_(o.icon) || `<span class="tile-k">${esc(o.label)}</span>`;

  /* ---------- A TILE MAY LEAVE, BUT ONLY FOR SOMEWHERE ELSE § */
  if (o.href && /^https?:\/\//i.test(String(o.href))) {
    return `<a class="${cls}" href="${esc(o.href)}"${attrs}
      target="_blank" rel="noopener">${body}</a>`;
  }
  const data = Object.keys(o.data || {})
    .map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  /* `pressed` IS FOR A TILE THAT IS A SWITCH -- the pen's lock and its Pen / Ruler / Compass -- and is said in `aria-pressed` beside the `on` the eye reads § */
  const pressed = o.pressed != null ? ` aria-pressed="${o.pressed ? 'true' : 'false'}"` : '';
  return `<button class="${cls}" data-do="${esc(o.act)}"${data}${attrs}${pressed}${o.off ? ' disabled' : ''}
    >${body}</button>`;
}


/* ---------- "+" AT THE TOP OF A LIST THAT CAN GROW (373) ---------- */
/* ONE CARD, THE WHOLE OF IT THE TARGET: a plus and what it adds. `{ act, label, data }`; a list adopts it by putting it first. */
function addCard_(o) {
  const data = Object.keys(o.data || {}).map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  return `<button type="button" class="card tap add-card" data-do="${esc(o.act)}"${data} aria-label="${esc(o.label)}">
    <span class="add-plus">${tileIcon_('plus')}</span><span class="add-say">${esc(o.label)}</span></button>`;
}

/* ---------- FILLING THE SHAPE § */
function tileSet_(el, o) {
  if (!el) return;
  /* THE NAME, NOT THE TEXT. § */
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
  /* A SWITCH SAYS SO TWICE, as `tile_` writes it: the plate for the eye and `aria-pressed` for a
     screen reader. Rewritten in place, the two would drift exactly as the label and the title would. */
  if (o.pressed != null) el.setAttribute('aria-pressed', o.pressed ? 'true' : 'false');
  if (o.off != null) el.disabled = !!o.off;
}


/* ---------- THE ADMIN ROW § */
/* ---------- AND NOT ON ANYTHING FIND TEACHES WITH § */
let SPOT_TILES = false;
const adminLearn_ = x => typeof kindOf_ === 'function'
  && asList_(kindOf_(x).group).indexOf('Learning') !== -1;
function adminTiles_(x, t) {
  if (!isAdmin() || (adminLearn_(x) && !SPOT_TILES)) return '';
  /* A `span`, NOT A ROW. These go inside the one row every card has now — see `tilesFor_`. It keeps
     the group for a screen reader, which is the half of the old wrapper worth having. */
  return `<span class="tile-group is-admin" role="group" aria-label="Admin">
    ${tile_({ icon: 'spot', label: isSpot(x.key) ? 'Spotlit' : 'Spotlight', tone: 'admin',
              on: isSpot(x.key), act: 'spot',
              data: { key: x.key, kind: x.kind || 'item' } })}
  </span>`;
}


/* ---------- THE STAR, WHICH IS AN ACTION LIKE ANY OTHER § */
function favTile_(x) {
  if (!x.key || !USER) return '';
  return tile_({ icon: 'star', label: isFav(x.key) ? 'Saved' : 'Save', on: isFav(x.key),
                 act: 'fav', data: { key: x.key, kind: x.kind || 'item' } });
}


/* ---------- `topicTiles_` WAS HERE, AND THERE ARE NO DOCUMENTS TO ACT ON § */




/* ---------- A SHOP THING § */
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


/* ---------- A TUTOR § */
/* ---------- A TUTOR'S OWN ACTIONS, AND NOT THE ONES EVERY CARD HAS § */
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
    ${/* ---------- `Book with them` WAS HERE § */
          ''}
    ${/* SILVER, IN THE ORDINARY ROW. § */
          ''}
    ${/* ---------- WRITE TO THEM, FROM THE ONE PLACE YOU ARE LOOKING AT THEM § */
          ''}
    ${(USER && !isMe_(x)) ? tile_({ icon: 'chat', label: 'Message',
              note: 'a note to them', act: 'msg-open',
              data: { to: x.name, id: (x.row && x.row.personId) || '' } }) : ''}
    ${/* EDIT, FOR AN ADMIN, ON SOMEBODY ELSE'S CARD ON THE YOU COLUMN — `updateProfile` lets an admin write another person's row, so the card turns into its form for § */
          ''}
    ${/* SHARE, ON A LISTED TUTOR WITH A HANDLE (400) — their own `?tutor=` address (`tutorLink_`, posts.js). */
          (t.handle && t.listed !== false) ? tile_({ icon: 'share', label: 'Share', note: 'their link',
              act: 'tutor-share', data: { handle: t.handle } }) : ''}
    ${typeof cardEditTile_ === 'function' ? cardEditTile_(x) : ''}
    ${isAdmin() ? tile_({ icon: t.listed === false ? 'hide' : 'show',
              label: t.listed === false ? 'Not listed' : 'Listed', tone: 'admin',
              on: t.listed !== false, act: 'set-listed',
              note: t.listed === false ? 'clients cannot see them' : 'clients can see them',
              /* THE ID AS WELL AS THE NAME. `x.key` is a display name, and naming a person by
                 one is the fault `findPerson` exists to fall back from rather than rely on. */
              data: { who: x.key, pid: (x.row && x.row.personId) || '' } }) : ''}`;
}


/* ---------- A VENUE HAS NO ACTIONS OF ITS OWN § */
function venueTiles_(x) { return ''; }


/* ---------- A SUBJECT § */
function subjectTiles_(x) {
  return `
    ${tile_({ icon: 'book', label: 'Book this', act: 'book-with', data: { name: '' } })}
  `;
}


/* ---------- A LEVEL § */
function levelTiles_(x) {
  const t = x.row || {};
  return `
    ${tile_({ icon: 'book', label: t.listed === false ? 'Not on the booking form' : 'Book this',
              note: t.listed === false ? 'add it to the options tab' : '',
              off: t.listed === false,
              act: 'book-with', data: { name: '' } })}
  `;
}


/* ---------- A WEARABLE § */
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


/* ---------- A TOOL OR A GAME § */
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
  /* AND ONLY ONE THIS PERSON MAY OPEN — `widgetFor_` in arcade.js, which the columns ask as well. § */
  if (!wgt || !slot || !widgetFor_(wgt)) return;

  /* A SECOND PRESS PUTS IT AWAY. A thing that can only be opened is a thing that fills the card and
     stays there — and on a list, the way back has to be the same control that got you in. */
  /* THROUGH `tileSet_`, NOT INTO `.tile-k`. § */
  if (slot.innerHTML) {
    slot.innerHTML = '';
    tileSet_(el, { icon: 'open', label: 'Open', on: false });
    return;
  }
  slot.innerHTML = wgt.html;
  tileSet_(el, { icon: 'close', label: 'Close', on: true });
  startWidget_(wgt);
});


/* ---------- A BOUT § */
/* ---------- WHAT YOU CAN DO ABOUT YOURSELF — NOTHING, ON THIS CARD § */
function fightTiles_(x) {
  const f = x.row || {};
  return f.video ? tile_({ icon: 'play', label: 'Watch', href: f.video }) : '';
}

/* ---------- A FIGHTER'S ONE DOOR: HIS FIGHTS, ON FILM § */
function boxerTiles_(x) {
  const b = x.row || {};
  const name = String(b.name || x.name || '').trim();
  if (!name) return '';
  return tile_({ icon: 'play', label: 'Highlights', note: 'on YouTube',
                 href: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' boxing highlights') });
}

/* `filmTiles_` WAS HERE — a film's Watch tile, a link out to Drive in the row under its Find card. § */


/* THE ONE ENTRY POINT the card builders call. A kind with nothing of its own still gets its admin
   rows, so a spotlight can go on anything findable rather than only on the two kinds that happen to
   have actions today. */
function cardTiles_(x) {
  /* ---------- ONE ROW OF MARKS, UNDER THE CARD § */
  /* AND `Open`, to Find, under a kept card that Saved or the Spotlight cannot draw whole — a practical's method, a project's steps, a textbook's chapters, a § */
  /* `more` IS WHAT ONE COLUMN ADDS TO THE ROW — the people column's Edit and Delete for an admin (373). */
  /* AND `Read aloud` ON A PRIMARY QUESTION OR CONTENT CARD (394) -- `readAloudTile_`, find.js. */
  const mine = favTile_(x) + cardActions_(x) + (typeof readAloudTile_ === 'function' ? readAloudTile_(x) : '')
    + (typeof speedTile_ === 'function' ? speedTile_(x) : '')
    + finderOpenTile_(x) + (x.more || '');
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
  if (x.kind === 'boxer') return boxerTiles_(x);
  /* THE BIBLE'S COVER OPENS IT; A VERSE GOES TO ITS CHAPTER; A BOOK THAT DID NOT COME TRIES AGAIN —
     `bibleTiles_` in find.js, which says nothing at all to anybody but an admin. */
  if (x.kind === 'bible') return typeof bibleTiles_ === 'function' ? bibleTiles_(x) : '';
  /* `me` HAS ONE ACTION, SIGN OUT, AND IT IS IN THE SAME ROW AS THE STAR. § */
  /* AND "SEND THE LINK AGAIN" BESIDE IT while your own address is unproved — the paragraph under the row says why § */
  /* AND EDIT FIRST, on your own card — the owner, 10 Oct: § */
  if (x.kind === 'me') return (typeof cardEditTile_ === 'function' ? cardEditTile_(x) : '')
    /* SHARE MY PROFILE (400), for staff and an admin who teaches: their own `?tutor=` link, to send a family. */
    + (rankAtLeast_('staff') && USER.handle ? tile_({ icon: 'share', label: 'Share my profile', note: 'your link',
        act: 'tutor-share', data: { handle: USER.handle } }) : '')
    + tile_({ icon: 'out', label: 'Sign out', act: 'signout' })
    + (typeof pendingAddr_ === 'function' && pendingAddr_() && typeof resendTile_ === 'function' ? resendTile_() : '');
  if (x.kind === 'receipt') return jobTiles_(x);
  /* A QUESTION'S ROW HOLDS THE STAR AND THE DAY YOU DID IT -- `questionTiles_` in find.js. § */
  /* AND, WHERE THE QUESTION HAS A FIGURE BEHIND THIS PART AND IT IS ANSWERED BY TAPPING AN OPTION, `Figure` -- which opens it over the card. § */
  if (x.kind === 'question') return (typeof questionTiles_ === 'function' ? questionTiles_(x) : '')
    /* AND `Report`, for anybody signed in (395) — `reportTile_` in submit.js. */
    + (typeof reportTile_ === 'function' ? reportTile_(x) : '');
  /* THE `group` TILE WAS HERE — "Open", on a card standing for a whole paper. § */
  return '';
}

/* ---------- WHAT YOU CAN DO WITH A SESSION § */
/* ---------- AND FOR SOMEBODY NOT IN IT, THE ONE ACTION IS GETTING IN § */
function jobTiles_(x) {
  const j = x.row || {};
  const id = String(j.id || j.jobId || '');
  if (!id || !USER) return '';
  const mine = (j.slots || []).some(sl => norm(sl.client) === norm(USER.name));
  /* A CHILD JOINS AND PAYS THROUGH A PARENT (398) — no join tile, no Pay tile, no figure. */
  if (!mine) return childView_() ? '' : joinTile_(j, id);
  const paid = (j.slots || []).some(sl =>
    norm(sl.client) === norm(USER.name) && /^(paying|booked)$/i.test(String(sl.status || '')));
  const owed = typeof jobAccepted_ === 'function' && jobAccepted_(j) && !paid;
  return `
    ${owed && !childView_() ? tile_({ icon: 'cart', label: 'Pay and confirm', tone: 'buy',
                     note: typeof money === 'function' ? money(j.price || 0) : '',
                     act: 'job-pay', data: { id: id } }) : ''}
    ${tile_({ icon: 'undo', label: 'Withdraw from this',
              act: 'job-leave', data: { id: id, paid: paid ? '1' : '' } })}
  `;
}

/* ---------- TWO KINDS OF JOINING, AND THEY ARE NOT THE SAME ACT § */
function joinTile_(j, id) {
  if (!j || !j.canAsk || !id) return '';
  return norm(j.kind) === 'waitlist'
    ? tile_({ icon: 'join', label: 'Take a seat', tone: 'buy', note: 'charged once it fills',
              act: 'job-take-seat', data: { id: id } })
    : tile_({ icon: 'join', label: 'Ask to join', tone: 'buy', note: 'the family say yes first',
              act: 'job-join', data: { id: id } });
}

/* A tap on a tile row that is not on a row. § */
/* ---------- AN ADMIN'S ACTIONS ON A JOB, AS TILES § */
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
  /* TILES, NOT A ROW. This returned its own `.tile-row`, and `jobPage_` wrapped it in another beside the client's two — a row inside a row. § */
  return rows.join('');
}

/* ---------- WHAT YOU CAN DO ABOUT A POST § */
function postTiles_(p) {
  const id = String((p && p.id) || '');
  if (!id) return '';
  const rows = [tile_({ icon: 'share', label: 'Share', act: 'share', data: { id: id } })];
  if (typeof isAdmin === 'function' && isAdmin()) {
    rows.push(tile_({ icon: 'edit', label: 'Edit', act: 'post-edit', data: { id: id } }));
    /* THE DECISION, ON THE POST ITSELF — the same argument the old button row carried and worth keeping: § */
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

/* ================= THE ICONS, ON FIND 2 FOR AN ADMIN (403) =================
   Each `TILE_ICONS` mark is an ordinary item: shelf `Icons`, a group, found by its name. Same gate as the Bible (`bibleFor_`). */
const ICON_SHELF = 'Icons';
/* THE GROUP A MARK IS ASKED BY — by what it is for; a mark nobody placed is `Other`, never missing. */
const ICON_GROUPS = {
  Media: 'play pause film sound mute speak photo speed',
  Documents: 'doc print book open code figure',
  Actions: 'edit bin undo send save plus share search sync tick close ext full unfull show hide',
  Marks: 'star flag spot spark lock unlock',
  Account: 'out in key join chat',
  Shop: 'cart wear',
  'Pen and drawing': 'pen ruler protractor compass',
  'Maths keys': 'frac power root integral newline',
};
const iconGroup_ = n => Object.keys(ICON_GROUPS).find(g => (' ' + ICON_GROUPS[g] + ' ').indexOf(' ' + n + ' ') !== -1) || 'Other';
const iconFor_ = () => typeof bibleFor_ === 'function' && bibleFor_();
function iconItems_() {
  if (!iconFor_()) return [];
  return Object.keys(TILE_ICONS).map(n => ({
    kind: 'icon', name: n, key: 'icon:' + n, sub: iconGroup_(n), image: '', shelf: ICON_SHELF,
    iconGroup: iconGroup_(n), text: n + ' icon mark symbol ' + iconGroup_(n), row: null,
  }));
}
/* WHERE EACH MARK IS USED: `icon: 'name'` counted across the app's own scripts, fetched once from the cache the page loaded them into. */
const ICON_USE = { counts: null, asking: null };
function iconUses_() {
  if (ICON_USE.counts || ICON_USE.asking || !iconFor_()) return ICON_USE.counts;
  const files = (typeof window !== 'undefined' && Array.isArray(window.FILES)) ? window.FILES : [];
  const t = (typeof window !== 'undefined' && window.LOAD) || '';
  ICON_USE.asking = Promise.all(files.map(f => fetch('js/' + f + '.js?t=' + t, { cache: 'default' })
    .then(r => (r && r.ok ? r.text() : '')).catch(() => '').then(s => [f, s])))
    .then(all => {
      const c = {};
      all.forEach(([f, s]) => {
        const re = /icon:\s*'([a-z]+)'/g;
        let m;
        while ((m = re.exec(s))) { c[m[1]] = c[m[1]] || {}; c[m[1]][f] = (c[m[1]][f] || 0) + 1; }
      });
      ICON_USE.counts = c; ICON_USE.asking = null;
      try { document.querySelectorAll('.icon-use[data-icon]').forEach(el => { el.innerHTML = iconUseSay_(el.getAttribute('data-icon')); }); } catch (e) {}
    });
  return null;
}
function iconUseSay_(n) {
  const c = ICON_USE.counts;
  if (!c) return loading_();
  const by = c[n] || {}, fs = Object.keys(by).sort((a, b) => by[b] - by[a]);
  const total = fs.reduce((s, f) => s + by[f], 0);
  if (!total) return 'Not named as <code>icon: \'' + esc(n) + '\'</code> anywhere — it may be drawn by name.';
  return 'Used ' + total + (total === 1 ? ' time' : ' times') + ': ' + fs.map(f => esc(f) + '.js ' + by[f]).join(', ');
}
function iconCard_(x) {
  iconUses_();
  return `<div class="card fc icon-card" data-key="${esc(x.key)}">
    <div class="fc-head"><h3>${esc(x.name)}</h3></div>
    ${tagRow_(x)}
    <div class="icon-show">
      <span class="icon-big">${tileIcon_(x.name)}</span>
      <span class="icon-small">${tile_({ icon: x.name, label: x.name, act: 'icon-none' })}</span>
    </div>
    <p class="fc-meta">In code: <code>tile_({ icon: '${esc(x.name)}', … })</code></p>
    <div class="fc-note icon-use" data-icon="${esc(x.name)}">${iconUseSay_(x.name)}</div>
    <p class="fc-meta bb-who">Only admins are shown the icons</p>
  </div>`;
}
/* THE SMALL ONE IS A REAL TILE, so it is the size a tile is; pressing it does nothing. */
on('icon-none', () => {});
