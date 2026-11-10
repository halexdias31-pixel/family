/* @family. — tiles.js THE SHEET IS GONE. § */


/* ---------- THE MARKS ON THE BUTTONS § */
/* ---------- ONE SPEAKER, DRAWN ONCE, FOR THE THREE MARKS THAT HAVE ONE § */
const TILE_CONE_  = '<path d="M2.5 6.5h3l4-3.5v11l-4-3.5h-3z"/>';
const TILE_WAVES_ = '<path d="M12 6.2a3.2 3.2 0 0 1 0 4.6"/><path d="M14 4a6 6 0 0 1 0 9"/>';
const TILE_ICONS = {
  play:  '<path d="M5 3.5v11l9-5.5z"/>',
  /* THREE DOTS: the rest of a card's buttons, opened in place (owner, 9 Nov). */
  more:  '<circle cx="4" cy="8.5" r=".9"/><circle cx="9" cy="8.5" r=".9"/><circle cx="14" cy="8.5" r=".9"/>',
  /* FOUR ARROWS, for a widget's admin layout tiles (463): up or down its column, to the previous or next widget column. */
  up:    '<path d="M9 14.5v-12"/><path d="m4.5 7 4.5-4.5 4.5 4.5"/>',
  down:  '<path d="M9 2.5v12"/><path d="m4.5 10 4.5 4.5 4.5-4.5"/>',
  left:  '<path d="M15 8.5h-12"/><path d="m7.5 4 -4.5 4.5 4.5 4.5"/>',
  right: '<path d="M3 8.5h12"/><path d="m10.5 4 4.5 4.5-4.5 4.5"/>',
  /* A WHOLE COLUMN MOVED (730): a column's bar beside the arrow, so it is told from a card's own ◀ ▶. */
  'col-left':  '<path d="M15.5 2.5v12"/><path d="M12 8.5h-9.5"/><path d="m6.5 4.5 -4 4 4 4"/>',
  'col-right': '<path d="M2.5 2.5v12"/><path d="M6 8.5h9.5"/><path d="m11.5 4.5 4 4-4 4"/>',
  /* SPLIT AND JOIN (464): one card into a card a field, and back. */
  split: '<path d="M2.5 4.5h5v9h-5z"/><path d="M10.5 4.5h5v9h-5z"/>',
  merge: '<path d="M2.5 4.5h13v9h-13z"/><path d="M9 6.5v5"/>',
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
  heart: '<path d="M9 15S2 10.6 2 6.2A3.6 3.6 0 0 1 9 4.6a3.6 3.6 0 0 1 7 1.6C16 10.6 9 15 9 15z"/>',
  pound: '<path d="M12.5 4.2A3 3 0 0 0 7 5.5V13c0 1-.6 1.8-1.5 2h9"/><path d="M4.5 9h6"/>',
  star:  '<path d="m9 2.5 2 4.3 4.5.6-3.3 3.2.8 4.6L9 13l-4 2.2.8-4.6L2.5 7.4 7 6.8z"/>',
  /* START HERE (466): a house — where the column opens. */
  home:  '<path d="M2.5 8.5 9 3l6.5 5.5"/><path d="M4.5 7v7.5h9V7"/><path d="M7.5 14.5v-4h3v4"/>',
  flag:  '<path d="M4 15.5v-13"/><path d="M4 3h9l-2 3 2 3H4"/>',
  /* SUGGEST A CHANGE (494): a speech bubble with a pencil in it — words to Claude about this thing; not the pen, not the flag. */
  suggest: '<path d="M3.5 2.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H8.5l-4 3.5v-3.5h-1A1.5 1.5 0 0 1 2 11V4a1.5 1.5 0 0 1 1.5-1.5z"/><path d="m6 10.5.5-2 4-4 1.5 1.5-4 4z"/>',
  /* FRONT DOOR (489): a door ajar — where everybody lands on opening the app; the house is where one column opens. */
  door:  '<path d="M3.5 15.5h11"/><path d="M5 15.5v-13h8v13"/><path d="M5 2.5l5 1.5v12"/><circle cx="8.6" cy="9.5" r=".5"/>',
  /* SPOTLIGHT IS A MEGAPHONE (489): its rayed circle read as a second star beside Save's — "two different stars". */
  spot:  '<path d="M2.5 7v4h2.5l7 3.5v-11L5 7z"/><path d="M5.5 11l1 4h2l-1-3.5"/><path d="M14.5 7.5v3"/>',
  edit:  '<path d="M11.5 2.8 14.2 5.5 6 13.7l-3.4.7.7-3.4z"/><path d="m10.2 4.1 2.7 2.7"/>',
  bin:   '<path d="M2.8 4.5h12.4"/><path d="M6.5 4.5V2.8h5v1.7"/>'
       + '<path d="M4.5 4.5 5.3 15h7.4l.8-10.5"/>',
  undo:  '<path d="M2.8 8.5h8a3.5 3.5 0 1 1 0 7H6"/><path d="M5.5 5.5 2.5 8.5l3 3"/>',
  show:  '<path d="M1.5 8.5S4.2 4 9 4s7.5 4.5 7.5 4.5S13.8 13 9 13s-7.5-4.5-7.5-4.5z"/>'
       + '<circle cx="9" cy="8.5" r="2.2"/>',
  /* A TICK, FOR CHECK -- "check button should be a tile". § */
  tick:  '<path d="M3.5 9.5l3.5 3.5 7.5-8"/>',
  /* A RAISED HAND (455): four fingers up and a thumb, for asking the tutor over. */
  hand:  '<path d="M6 9V4a1 1 0 0 1 2 0v4M8 8V3a1 1 0 0 1 2 0v5M10 8V3.5a1 1 0 0 1 2 0V9M12 9V5.5a1 1 0 0 1 2 0V11a4.5 4.5 0 0 1-4.5 4.5h-.5a4.5 4.5 0 0 1-3.6-1.8L3.6 10.6a1 1 0 0 1 1.6-1.2L6 10.4"/>',
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
  /* A KEYBOARD: its outline, two rows of keys and the space bar — the Console's key list (419). */
  keys:  '<path d="M1.5 4.5h15v9h-15z"/><path d="M4 7h1M7 7h1M10 7h1M13 7h1M4 9.5h1M7 9.5h1M10 9.5h1M13 9.5h1"/><path d="M5.5 11.5h7"/>',
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
  /* A MAGNIFIER WITH A PLUS: ZOOM ON EVERY QUESTION (457) */
  /* THE QUESTION'S TOOL ROW (qtools.js): a grid, a calculator, a table, and the folded row's own mark. */
  grid:  '<path d="M2.5 2.5h13v12h-13z"/><path d="M2.5 6.5h13M2.5 10.5h13M6.8 2.5v12M11.2 2.5v12"/>',
  calc:  '<path d="M4 1.5h10v14h-10z"/><path d="M6 4h6v2.5h-6z"/><path d="M6.3 9h.1M9 9h.1M11.7 9h.1M6.3 12h.1M9 12h.1M11.7 12h.1"/>',
  table: '<path d="M2 3h14v11h-14z"/><path d="M2 6.7h14M2 10.3h14M7 3v11"/>',
  tools: '<path d="M3 14.5 9.5 8"/><path d="M11.5 2.5a3 3 0 0 0 3.6 3.9l-2.3 2.3-2.6-.8-.8-2.6z"/><path d="M10 11l4.5 4.5M12.5 9l2 2"/>',
  zoom: '<circle cx="7.6" cy="7.4" r="4.9"/><path d="m11.2 11 4.6 4.5M5.3 7.4h4.6M7.6 5.1v4.6"/>',
  film:  '<rect x="2.5" y="2.5" width="13" height="12" rx="1.5"/>'
       + '<path d="M5.5 2.5v12M12.5 2.5v12M2.5 6.5h3M2.5 10.5h3M12.5 6.5h3M12.5 10.5h3"/>',
  ext:   '<path d="M8 3.5H3.5v11h11V10"/><path d="M10.5 2.5h5v5"/><path d="m15.5 2.5-7 7"/>',
  /* ---------- A QUESTION'S PAGES, WHICH ARE ALL TILES NOW § */
  pen:   '<path d="M12.6 2.6 15 5 7.2 12.8l-3.2.8.8-3.2z"/>'
       + '<path d="M9 15.2c1.6-1.2 2.6.6 4 0s1.8-1 2.6-1"/>',
  ruler: '<g transform="rotate(-38 9 8.5)"><rect x="1.5" y="5.8" width="15" height="5.4" rx="1"/>'
       + '<path d="M4.5 5.8v2.2M7.5 5.8v1.4M10.5 5.8v2.2M13.5 5.8v1.4"/></g>',
  /* A STRAIGHT LINE IS A LINE BETWEEN TWO DOTS -- the pen's mode, apart from the Ruler that measures (owner, 1 Nov). */
  line: '<path d="M3.5 14.5 14.5 3.5"/><circle cx="3.5" cy="14.5" r="1.4"/><circle cx="14.5" cy="3.5" r="1.4"/>',
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
  /* TURN THE BOARD (chess, 429): one side going up and the other coming down, the mark for changing ends. */
  turn:  '<path d="M6 15V3"/><path d="M3 6l3-3 3 3"/><path d="M12 3v12"/><path d="M9 12l3 3 3-3"/>',
  /* NEW GAME (chess, 429): one arrow coming round to where it began. */
  again: '<path d="M14.8 9.5A5.8 5.8 0 1 1 13 5"/><path d="M13.4 1.6v3.6H9.8"/>',
  /* SPEED READ (403): the reader's two guide ticks, and a line of words running through them. */
  /* DICTATE (562): a microphone on its stand, the keypad's mic key. */
  mic: '<rect x="6.5" y="1.5" width="5" height="8.5" rx="2.5"/><path d="M3.8 8a5.2 5.2 0 0 0 10.4 0"/><path d="M9 13.2v2.3"/>',
  speed: '<path d="M9 1.5v3.5"/><path d="M9 12v3.5"/><path d="M2 8.5h4.5"/><path d="M8 8.5h2"/><path d="M11.5 8.5h4.5"/>',
};

/* ONE SEARCH BAR (487): the pill Reels draws -- a magnifier inside a round box -- for every search; `attrs` is the input's own markup. */
function searchPill_(attrs, cls) {
  return `<label class="search-pill${cls ? ' ' + cls : ''}">${tileIcon_('search')}<input type="search" autocomplete="off" enterkeyhint="search" ${attrs}></label>`;
}
function tileIcon_(name) {
  const d = TILE_ICONS[name];
  if (!d) return '';
  /* ---------- THE MARK CARRIES ITS OWN NAME § */
  return `<svg class="tile-i tile-i-${esc(name)}" viewBox="0 0 18 17" aria-hidden="true"
    focusable="false" fill="none" stroke="currentColor" stroke-width="1.4"
    stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}


/* ---------- ONE CONTROL § */
function tile_(o) {
  /* ONE MAKER, ANY AMOUNT (950): a place passes one tile's data, a list of them, or nothing when it has none to show. */
  if (Array.isArray(o)) return o.map(tile_).join('');
  if (!o) return '';
  /* A FORM'S STEP (950) IS A WORD, NOT A MARK: `form: true` draws the one `.btn` (44px up); `kind` quiet, danger or ghost. */
  if (o.form) return `<button type="button" class="btn${o.kind ? ' ' + o.kind : ''}${o.cls ? ' ' + o.cls : ''}" data-do="${esc(o.act)}"${
    Object.keys(o.data || {}).map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('')}${o.off ? ' disabled' : ''}>${esc(o.label)}</button>`;
  /* ONE CHECK ON EVERY QUESTION (368, 374): `send: true` is the same mark, word and `is-submit` name whatever marks it. */
  if (o.send) o = Object.assign({ icon: 'send', label: 'Check' }, o, { cls: ((o.cls || '') + ' is-submit').trim() });
  /* `cls` IS A NAME A CHECK OR A NEIGHBOUR FINDS THE TILE BY (`.qp-check`), never a look: the tile's
     appearance is this renderer's alone, which is the point of having one. */
  const cls = 'tile' + (o.tone ? ' is-' + o.tone : '') + (o.on ? ' on' : '') + (o.cls ? ' ' + o.cls : '');
  const name = o.label + (o.note ? ' · ' + o.note : '');
  /* ITS ONE WORD (owner, 8 Nov): `data-w` is what a long press shows (`tileWordShow_`); `word` overrides the label's first. */
  const word = String(o.word || o.label || '').split(' ')[0];
  const attrs = ` title="${esc(name)}" aria-label="${esc(name)}" data-w="${esc(word)}"`;
  /* A MARK IS REQUIRED. A control with neither word nor mark is a blank square, so anything that
     has not been given one falls back to the word — visibly wrong, rather than invisible. */
  /* `face` IS A KEYPAD KEY'S OWN DRAWN FACE (a fraction, a power), trusted markup from keypad-keys.js, never data. */
  const body = o.face || tileIcon_(o.icon) || `<span class="tile-k">${esc(o.label)}</span>`;

  /* OPENS IN PLACE (owner 68a, 9 Nov): an https address opens inside its card (`fileView_`); only `leave: true` (a sign-in, a consent) goes to a new tab. */
  if (o.href && !o.leave && /^https:\/\//i.test(String(o.href))) return tile_(Object.assign({}, o, { href: '', act: 'file-view', data: Object.assign({ url: o.href, title: o.label }, o.data || {}) }));
  /* ---------- A TILE MAY LEAVE, BUT ONLY FOR SOMEWHERE ELSE § */
  if (o.href && /^https?:\/\//i.test(String(o.href))) {
    return `<a class="${cls}" href="${esc(o.href)}"${attrs}
      target="_blank" rel="noopener">${body}</a>`;
  }
  const data = Object.keys(o.data || {})
    .map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  /* `pressed` IS FOR A TILE THAT IS A SWITCH -- the pen's lock and its Pen / Ruler / Compass -- and is said in `aria-pressed` beside the `on` the eye reads § */
  const pressed = o.pressed != null ? ` aria-pressed="${o.pressed ? 'true' : 'false'}"` : '';
  /* ONLY AN ADMIN SEES AN ADMIN'S TILE (owner, 8 Nov, 11a), and it looks like any other tile. */
  if (o.tone === 'admin' && !(typeof isAdmin === 'function' && isAdmin())) return '';
  const barred = '';
  const style = o.style ? ` style="${esc(o.style)}"` : '';
  return `<button type="button" class="${cls}" data-do="${esc(o.act)}"${data}${attrs}${style}${pressed}${barred}${o.off ? ' disabled' : ''}
    >${body}</button>`;
}


/* ---------- A LONG PRESS SAYS THE WORD (owner, 8 Nov, 4c) ---------- */
/* One handler for every tile: hold ~500ms (touch or mouse) and its word floats above it; the press that follows is not a tap. */
const TILE_HOLD = { t: 0, el: null, shown: false };
function tileWordShow_(el) {
  const word = el.getAttribute('data-w') || el.getAttribute('aria-label') || '';
  if (!word) return;
  const r = el.getBoundingClientRect();
  let tip = document.querySelector('.tile-word');
  if (!tip) { tip = document.createElement('span'); tip.className = 'tile-word'; tip.setAttribute('aria-hidden', 'true'); document.body.appendChild(tip); }
  tip.textContent = word;
  tip.style.left = (r.left + r.width / 2) + 'px';
  tip.style.top = r.top + 'px';
  TILE_HOLD.shown = true;
}
function tileWordHide_() {
  clearTimeout(TILE_HOLD.t); TILE_HOLD.el = null;
  const tip = typeof document !== 'undefined' && document.querySelector('.tile-word');
  if (tip) tip.remove();
}
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('pointerdown', e => {
    const el = e.target && e.target.closest && e.target.closest('.tile');
    tileWordHide_(); TILE_HOLD.shown = false;
    if (!el) return;
    TILE_HOLD.el = el;
    TILE_HOLD.t = setTimeout(() => { if (TILE_HOLD.el === el) tileWordShow_(el); }, 500);
  }, { passive: true });
  ['pointerup', 'pointercancel', 'scroll'].forEach(k => document.addEventListener(k, () => {
    clearTimeout(TILE_HOLD.t);
    if (TILE_HOLD.shown) setTimeout(tileWordHide_, 900);
  }, { passive: true, capture: true }));
  /* A HOLD THAT SHOWED THE WORD IS NOT ALSO A PRESS. */
  document.addEventListener('click', e => {
    if (!TILE_HOLD.shown || !(e.target && e.target.closest && e.target.closest('.tile'))) return;
    TILE_HOLD.shown = false; e.preventDefault(); e.stopPropagation();
  }, true);
  document.addEventListener('contextmenu', e => { if (e.target && e.target.closest && e.target.closest('.tile')) e.preventDefault(); });
}

/* ONE EMPTY STATE (owner, 8 Nov): a short, specific sentence in ordinary text ("No bookings yet."), the same everywhere. */
function empty_(text) {
  return `<p class="empty">${esc(String(text || 'Nothing here yet.'))}</p>`;
}

/* ---------- "+" AT THE TOP OF A LIST THAT CAN GROW (373) ---------- */
/* ONE CARD, THE WHOLE OF IT THE TARGET: a plus and what it adds. `{ act, label, data }`; a list adopts it by putting it first. */
function addCard_(o) {
  const data = Object.keys(o.data || {}).map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
  return `<button type="button" class="card tap add-card" data-do="${esc(o.act)}"${data} aria-label="${esc(o.label)}">
    <span class="add-plus">${tileIcon_('plus')}</span><span class="add-say">${esc(o.label)}</span></button>${
    /* A "+" IS A THING ON THE COLUMN TOO (720, 486): its Suggest in the row right after it, as a person's card has. */
    typeof suggestTile_ === 'function' && suggestTile_('card', 'add:' + o.act, o.label) ? `<div class="tile-row rep-row">${suggestTile_('card', 'add:' + o.act, o.label)}</div>` : ''}`;
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
  if (adminLearn_(x) && !SPOT_TILES) return '';
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






/* ---------- A SHOP THING § */
function shopTiles_(x) {
  const inCart = CART.some(c => c.key === x.key && isShop_(c));
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

/* BOOK THIS TUTOR: never on your own card or a child's; the tutor card and Find › Profiles share it (1150). */
function bookTile_(x) {
  const t = (x && x.row) || {};
  return !isMe_(x) && !childView_() && t.listed !== false ? tile_({ icon: 'book', label: 'Book', tone: 'buy',
    act: 'book-with', data: { tutor: x.name || '' } }) : '';
}
function tutorTiles_(x) {
  const t = x.row || {};
  return `
    ${/* BOOK, FIRST (owner, 7 Nov): Find › Booking with this tutor's row answered. */ bookTile_(x)}
    ${/* THEIR INTRO VIDEO: the uploaded one plays on the card (`intro-play`); an older row's link still goes out. */
          String(t.videoFile || '').trim() ? tile_({ icon: 'play', label: 'Watch intro', act: 'intro-play', data: { file: t.videoFile } })
          : /^https?:\/\//i.test(String(t.mediaUrl || '')) ? tile_({ icon: 'play', label: 'Watch intro', href: t.mediaUrl }) : ''}
    ${/* SILVER, IN THE ORDINARY ROW. § */
          ''}
    ${/* ---------- WRITE TO THEM, FROM THE ONE PLACE YOU ARE LOOKING AT THEM § */
          ''}
    ${/* NOT FOR A CHILD, unless they are the business (405): `MESSAGING` lets a student write to an admin only — no tile the server refuses. */
          (USER && !isMe_(x) && (!childView_() || /admin/i.test(String(t.role || '')))) ? tile_({ icon: 'chat', label: 'Message',
              note: 'a note to them', act: 'msg-open',
              data: { to: x.name, id: (x.row && x.row.personId) || '' } }) : ''}
    ${/* EDIT, FOR AN ADMIN, ON SOMEBODY ELSE'S CARD ON THE YOU COLUMN — `updateProfile` lets an admin write another person's row, so the card turns into its form for § */
          ''}
    ${typeof cardEditTile_ === 'function' ? cardEditTile_(x) : ''}
    ${x.key ? tile_({ icon: t.listed === false ? 'hide' : 'show',
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
    ${tile_({ icon: 'book', label: 'Book this', act: 'book-with', data: { name: '', subject: x.name || '' } })}
  `;
}


/* ---------- A LEVEL § */
function levelTiles_(x) {
  const t = x.row || {};
  return `
    ${tile_({ icon: 'book', label: t.listed === false ? 'Not on the booking form' : 'Book this',
              note: t.listed === false ? 'add it to the options tab' : '',
              off: t.listed === false,
              act: 'book-with', data: { name: '', level: x.name || '' } })}
  `;
}


/* ---------- WHO MAY WRITE TO WHOM, THE SERVER'S `MESSAGING` (constants.gs) read on the phone, so no Message tile is one it refuses ---------- */
const MSG_MAY_ = { admin: ['admin', 'staff', 'client', 'student'], staff: ['admin', 'staff', 'client'], client: ['admin', 'staff'], student: ['admin'] };
const msgRankOf_ = role => /admin/i.test(role) ? 'admin' : /tutor|teacher|staff/i.test(role) ? 'staff' : /student|child|kid/i.test(role) ? 'student' : 'client';
const msgMay_ = role => !!USER && (MSG_MAY_[rank_()] || []).indexOf(msgRankOf_(String(role || ''))) !== -1;
const msgTile_ = (name, id) => tile_({ icon: 'chat', label: 'Message ' + String(name).split(' ')[0], note: 'a note to them', act: 'msg-open', data: { to: name, id: id || '' } });
/* THE PEOPLE ON A SESSION BESIDES YOU: its families and its tutor, each with the role the server judges by (1040 friction). */
function jobPeople_(j) {
  if (!j || !USER) return [];
  const idOf = (list, n) => ((list || []).find(p => p && norm(p.title || p.name) === norm(n)) || {}).personId || '';
  const out = [], seen = {};
  const add = (name, role, id) => { const k = norm(name); if (!k || seen[k] || norm(USER.name) === k) return; seen[k] = 1; out.push({ name, role, id }); };
  (j.slots || []).map(sl => sl && sl.client).concat([j.client]).filter(Boolean)
    .forEach(n => add(n, 'client', idOf(DATA.clients, n) || idOf(DATA.everyone, n)));
  [j.tutor].concat((j.tutorSlots || []).map(sl => sl && (sl.tutor || sl.name))).filter(Boolean)
    .forEach(n => add(n, 'tutor', idOf(DATA.tutors, n)));
  return out.filter(p => msgMay_(p.role));
}
const jobMsgTiles_ = x => jobPeople_(x && x.row).map(p => msgTile_(p.name, p.id)).join('');
/* A PROFILE'S Message, by the same rule — the tutor card draws its own (`tutorTiles_`). */
const personTiles_ = x => { const t = (x && x.row) || {}; const name = t.title || t.name || x.name;
  return name && !isMe_(x) && msgMay_(t.role) ? msgTile_(name, t.personId) : ''; };

/* EVERY CARD'S ROW STARTS WITH THESE (950); health.js's "card tile rows" holds it. */
const CARD_CORE_ = ['share', 'fav', 'suggest', 'top'];
/* EACH KIND'S EXTRAS (data, not branches); find, hymns and mechanics add theirs to `window.CARD_EXTRAS_MORE`, which needs no load order (1000). */
const CARD_EXTRAS_ = { shop: shopTiles_, tutor: tutorTiles_, venue: venueTiles_, subject: subjectTiles_,
  level: levelTiles_, receipt: x => jobMsgTiles_(x) + jobTiles_(x), person: x => personTiles_(x), talmud: x => talmudTiles_(x) };
function cardCore_(x) {
  const one = {
    share: () => tile_({ icon: 'share', label: 'Share', act: 'card-share', data: { key: x.key } }),
    fav: () => favTile_(x),
    suggest: () => (typeof suggestTileFor_ === 'function' ? suggestTileFor_(x) : ''),
    top: () => tile_({ icon: 'up', label: 'Top', act: 'find-top' }) };
  return x.key ? CARD_CORE_.map(k => one[k]()).join('') : '';
}
/* A CARD'S `lead` (a question's Help) straight after the core four, the same place for every rank (owner, 6 Nov). */
function cardExtras_(x) {
  const fn = CARD_EXTRAS_[x.kind] || (window.CARD_EXTRAS_MORE || {})[x.kind];
  if (typeof fn !== 'function') return x.lead || '';
  const r = fn(x);
  return (x.lead || '') + (typeof r === 'string' ? r : tile_(r));
}
/* `flat` HANDS THE TILES BACK UNWRAPPED, for a card that sorts them into its four and its ⋯ (`kcFour_`). */
function cardTiles_(x, flat) {
  /* THEN WHAT ANY KIND MAY ADD: Read aloud, Hear it, speed, magnifier, Open, a column's `more`, the padlock. */
  /* ONE READ-ALOUD PER CARD (owner's look rule): a language card's Hear it stands in for Read aloud, never beside it. */
  const hear = typeof hearItOpts_ === 'function' ? hearItOpts_(x) : null;
  const mine = (typeof kcTilesFill_ === 'function' ? kcTilesFill_ : (a, h) => h)(x, cardCore_(x) + cardExtras_(x)
    /* a question's Read aloud is each part's (`qtRow_`) */
    + tile_(hear || (typeof readAloudOpts_ === 'function' && !isQ_(x) ? readAloudOpts_(x) : null))
    + tile_([typeof speedOpts_ === 'function' ? speedOpts_(x) : null, typeof magCardOpts_ === 'function' ? magCardOpts_(x) : null, finderOpenOpts_(x)]) + (x.more || '')
    /* a question's padlock is its tool row's (`qtRow_`), so it has one, not two */
    + (x.key && !isMeCard_(x) && !isQ_(x) && typeof gameLockTile_ === 'function' ? gameLockTile_('c:' + x.key) : ''));
  const admin = adminTiles_(x, x.topic || null);
  if (flat) return mine + admin;
  if (!mine && !admin) return '';
  /* YOUR OWN CARD IS ALL YOURS: nothing on it is split off as an admin's (the hub's gold means "terms to agree" there). */
  return tileRow_(mine + admin, '', isMeCard_(x));
}
/* ---------- EVERY TILE SHOWN (420), ONE FLOW (487): nothing hides behind a "More" -- "I DONT LIKE POP UP MENUS" (420). */
const TILE_RE_ = /<(button|a)\b[^>]*\bclass="tile\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g;
/* AN ADMIN'S OR OWNER'S TILE is one drawn in the admin or danger tone; these lead their group in this order, a danger tile last. */
const TILE_ADMIN_ORDER_ = ['card-edit', 'spot', 'set-listed'];
const tileIsAdmin_ = t => /\bclass="tile\b[^"]*\bis-(admin|danger)\b/.test(t);
const tileAct_ = t => (t.match(/\bdata-do="([^"]*)"/) || [])[1] || '';
function tileAdminRank_(t) {
  if (/\bclass="tile\b[^"]*\bis-danger\b/.test(t)) return 99;
  const i = TILE_ADMIN_ORDER_.indexOf(tileAct_(t));
  return i === -1 ? TILE_ADMIN_ORDER_.length : i;
}
function tileRow_(html, cls, own) {
  const src = String(html || '');
  const wrap = inner => `<div class="tile-row${cls ? ' ' + cls : ''}">${inner}</div>`;
  const all = src.match(TILE_RE_) || [];
  const admin = own ? [] : all.filter(tileIsAdmin_);
  if (!admin.length) return wrap(src);
  const viewer = all.filter(t => admin.indexOf(t) === -1);
  /* WHAT IS NOT A TILE (a verdict, a note) stays, after the viewer's tiles; the old admin wrapper goes, regrouped below. */
  const rest = all.reduce((s, t) => s.replace(t, ''), src)
    .replace(/<span class="tile-group is-admin"[^>]*>\s*<\/span>/g, '').trim();
  const sorted = admin.map((t, i) => [t, i]).sort((a, b) => tileAdminRank_(a[0]) - tileAdminRank_(b[0]) || a[1] - b[1]).map(p => p[0]);
  const group = list => (list.length ? `<span class="tile-group is-admin" role="group" aria-label="Admin">${list.join('')}</span>` : '');
  const brk = '<span class="tile-break" aria-hidden="true"></span>';
  /* ONE FLOW LIKE WORDS (487): every tile in one left-aligned wrapping run, the admin's last; no line breaks or rebalancing. */
  return wrap(viewer.join('') + rest + group(sorted));
}

/* ---------- WHAT YOU CAN DO WITH A SESSION § */
/* ---------- AND FOR SOMEBODY NOT IN IT, THE ONE ACTION IS GETTING IN § */
function jobTiles_(x) {
  const j = x.row || {};
  const id = String(j.id || j.jobId || '');
  if (!id || !USER) return '';
  const mine = (j.slots || []).some(sl => norm(sl.client) === norm(USER.name));
  /* THE ASKED TUTOR, OR AN ADMIN, ANSWERS IN PLACE (488) — Accept, or Decline with an optional line why. */
  const asked = requestAsked_(j);
  const answer = asked && (norm(asked) === norm(USER.name) || (typeof isAdmin === 'function' && isAdmin()))
    ? tile_({ icon: 'tick', label: 'Accept request', tone: 'buy', note: 'it becomes a booking',
              act: 'job-request-answer', data: { id: id, yes: '1' } })
      + tile_({ icon: 'close', label: 'Decline request', note: 'a line why, if you like',
                act: 'job-request-answer', data: { id: id, yes: '' } })
    : '';
  /* A CHILD JOINS AND PAYS THROUGH A PARENT (398) — no join tile, no Pay tile, no figure. */
  if (!mine) return answer + jobApplyTile_(j, id) + (answer || childView_() ? '' : joinTile_(j, id));
  const paid = (j.slots || []).some(sl =>
    norm(sl.client) === norm(USER.name) && /^(paying|booked)$/i.test(String(sl.status || '')));
  const owed = typeof jobAccepted_ === 'function' && jobAccepted_(j) && !paid;
  return jobChooseTiles_(j, id) + `
    ${owed && !childView_() ? tile_({ icon: 'pound', label: 'Pay and confirm', tone: 'buy',
                     note: typeof money_ === 'function' ? money_(j.price || 0) : '',
                     act: 'job-pay', data: { id: id } }) : ''}
    ${tile_({ icon: 'undo', label: 'Withdraw from this',
              act: 'job-leave', data: { id: id, paid: paid ? '1' : '' } })}
  `;
}

/* NO PREFERENCE (decision): tutors apply, the client picks. Apply is for an approved tutor not yet on it, while nobody is confirmed. */
const jobOpenToTutors_ = j => !!(j && j.stealable) && !(j.tutorSlots || []).some(sl => /^confirmed$/i.test(String(sl.status || '')));
function jobApplyTile_(j, id) {
  if (!USER || !jobOpenToTutors_(j) || !(typeof isTutorRole === 'function' && isTutorRole())) return '';
  if ((j.tutorSlots || []).some(sl => norm(sl.name) === norm(USER.name))) return '';
  return tile_({ icon: 'join', label: 'Apply to teach', tone: 'buy', note: 'the family picks', act: 'job-apply', data: { id: id } });
}
/* THE CLIENT'S PICK: one tile per tutor who applied. */
function jobChooseTiles_(j, id) {
  if (!jobOpenToTutors_(j) || childView_()) return '';
  return (j.tutorSlots || []).filter(sl => sl && sl.name && /^applied$/i.test(String(sl.status || '')))
    .map(sl => tile_({ icon: 'tick', label: 'Choose ' + displayName_(sl.name), tone: 'buy', note: 'they teach it',
                       act: 'job-choose', data: { id: id, tutor: String(sl.name) } })).join('');
}

/* WHICH TUTOR A REQUEST IS WAITING ON (488): a named tutor not yet Confirmed on a job not open to others. */
function requestAsked_(j) {
  if (!j || j.stealable) return '';
  const t = (j.tutorSlots || []).find(sl => /^applied$/i.test(String(sl.status || '')));
  return t ? String(t.name || '') : '';
}

/* WHERE A REQUEST STANDS, IN ONE LINE BOTH SIDES READ (488): waiting, accepted, or declined and why. */
function requestSaid_(j) {
  if (!j) return '';
  const asked = requestAsked_(j);
  if (asked) return 'Waiting for ' + asked + ' to accept or decline.';
  const evs = j.events || [];
  const last = evs.filter(e => e.role === 'tutor' && (e.action === 'Decline' || e.action === 'Accept')).pop();
  if (!last) return '';
  if (last.action === 'Decline' && norm(last.target) === norm(last.actor) && !(j.tutorSlots || []).length) {
    return 'Declined by ' + last.actor + (last.message && last.message !== 'declined the request' ? ': \u201c' + last.message + '\u201d' : '.');
  }
  if (last.action === 'Accept' && /^accepted the request/.test(String(last.message || ''))) {
    return 'Accepted by ' + last.actor + '.';
  }
  return '';
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
    rows.push(tile_({ icon: 'tick', label: 'Accept', tone: 'buy', note: 'settles the terms',
                      act: 'job-answer', data: { id: id, yes: '1' } }));
    rows.push(tile_({ icon: 'close', label: 'Decline', note: 'turns it down',
                      act: 'job-answer', data: { id: id, yes: '' } }));
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
  const admin = typeof isAdmin === 'function' && isAdmin();
  const rows = [tile_({ icon: 'share', label: 'Share', note: 'as a picture', act: 'share', data: { id: id } })];
  /* WAITING (413): the admin decides on the post itself; its author may still change the words or take it back. */
  if (p.waiting && admin) {
    rows.push(tile_({ icon: 'tick', label: 'Approve', tone: 'buy', note: 'everyone sees it',
                      act: 'post-approve', data: { id: id, on: '1' } }));
    rows.push(tile_({ icon: 'close', label: 'Decline', note: 'stays hidden',
                      act: 'post-approve', data: { id: id, on: '' } }));
  } else if (p.refused && admin) {
    /* ALREADY DECLINED: only the way back; declining again is a control that does nothing. */
    rows.push(tile_({ icon: 'tick', label: 'Approve', tone: 'buy', note: 'everyone sees it',
                      act: 'post-approve', data: { id: id, on: '1' } }));
  }
  if (p.waiting && p.mine && !admin) rows.push(tile_({ icon: 'edit', label: 'Edit', note: 'until it is approved', act: 'post-edit', data: { id: id } }));
  /* UP IS FINAL (413): nobody changes the words; an admin still pins it or fixes its date. */
  if (admin && !p.waiting && !p.refused) rows.push(tile_({ icon: 'edit', label: 'Pin or date', act: 'post-edit', data: { id: id } }));
  /* YOUR OWN TOO (720): every thing carries the tile (486), and the owner's posts are his own. */
  if (typeof suggestTile_ === 'function') rows.push(suggestTile_('post', id, String(p.title || p.body || '').slice(0, 80)));
  if (admin || p.mine) rows.push(tile_({ icon: 'bin', label: 'Delete', tone: 'danger', note: 'takes it off the feed', act: 'post-delete', data: { id: id } }));
  return tileRow_(rows.join(''));
}

on('noop', () => {});

/* ---------- ONE TILE ROW PER THING (489): rows one under another become one; a joined row is a `tile-group` keeping its classes and data ---------- */
const coreIn_ = row => !!row.querySelector('[data-do="card-share"]');
function tileRowsJoin_(html) {
  const h = String(html == null ? '' : html);
  if (h.indexOf('tile-row') === h.lastIndexOf('tile-row') || typeof document === 'undefined') return h;
  let t;
  try { t = document.createElement('template'); t.innerHTML = h; } catch (e) { return h; }
  let joined = 0;
  const group = (from, into, first) => {
    const g = document.createElement('span');
    g.className = ['tile-group'].concat([...from.classList].filter(c => c !== 'tile-row')).join(' ');
    [...from.attributes].forEach(a => { if (a.name !== 'class') g.setAttribute(a.name, a.value); });
    while (from.firstChild) g.appendChild(from.firstChild);
    if (first) into.insertBefore(g, into.firstChild); else into.appendChild(g);
    from.remove();
    joined++;
  };
  /* A ROW UNDER A BOX THAT ENDS IN A ROW (a form's Save, a list's last item): it joins that row, inside the box, so the box's own handlers still hold. */
  /* A RULE (496), locked: `form-save-row` — a settings form keeps its own Save row. */
  const formOwn = typeof ruleOn_ !== 'function' || ruleOn_('form-save-row');
  t.content.querySelectorAll('.tile-row').forEach(row => {
    const prev = row.previousElementSibling;
    if (!prev || prev.hidden || prev.classList.contains('tile-row') || prev.matches('.merged-part, .widget-slot') || row.classList.contains('wgt-foot') || (formOwn && row.parentElement && row.parentElement.closest('.me-form'))) return;
    /* AN EMPTY STATUS LINE AFTER THE ROW (a form's "Saved" before anything is saved) does not count as something between. */
    const last = e => { let k = e.lastElementChild; while (k && k.tagName === 'P' && !k.textContent.trim()) k = k.previousElementSibling; return k; };
    let d = prev;
    while (last(d) && !d.classList.contains('tile-row') && !d.matches('.merged-part, .widget-slot, .rep-box, ' + (formOwn ? '.me-form, form, ' : '') + '[class*="qual"], ul, ol, table')) d = last(d);
    /* A CARD'S ROW LEADS WHAT IT JOINS (950) */
    if (d !== prev && d.classList.contains('tile-row') && !d.classList.contains('person-tiles')) group(row, d, coreIn_(row));
  });
  t.content.querySelectorAll('.tile-row').forEach(row => {
    const prev = row.previousElementSibling;
    if (!prev || !prev.classList.contains('tile-row') || !row.parentNode || (formOwn && prev.closest('.me-form')) || prev.classList.contains('person-tiles')) return;
    group(prev, row, !coreIn_(row));
  });
  return joined ? t.innerHTML : h;
}

/* WATCH INTRO: the Drive player opens under the card's tiles, and a second tap closes it. */
on('intro-play', el => {
  const card = el.closest('.card') || el.parentNode;
  if (!card) return;
  const was = card.querySelector('.vid-frame.intro');
  if (was) { was.remove(); return; }
  const f = document.createElement('div');
  f.className = 'vid-frame intro';
  f.innerHTML = `<iframe src="${esc(introSrc_(el.dataset.file))}" title="Intro video" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  const row = el.closest('.tile-row');
  if (row && row.parentNode) row.parentNode.insertBefore(f, row.nextSibling); else card.appendChild(f);
});
