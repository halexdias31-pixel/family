/* @family. — map.js ONE FILE, SPLIT. § */



/* A WIDGET'S MARKUP IS DATA (owner, 12 Nov, rule 1.26): its title, then its parts, drawn by the one card maker's blocks. */
const mapHead_ = text => ({ type: 'msgHead', text });
const mapBox_ = (id, look, more) => Object.assign({ type: 'group', id, look }, more || {});
const mapHtml_ = (name, ...parts) => cardBlocks_([mapHead_(name)].concat(parts));

/* ---------- `draw` AND `pure`: WHAT THE BUILDER MAY DO WITH A WIDGET BEFORE ANYBODY ARRIVES § */
const WIDGETS = [
  /* `stop` IS THE CLIP. This card deals a fact on a tap and some of those facts are videos, so leaving the column with one playing left it playing — the same fault § */
  /* A TOOL (owner, 12 Nov): a Find card under Tools, like every widget brought back. */
  { id: 'reels', kind: 'tool', name: 'One more thing', start: () => initFeed?.(),
    /* DRAWN AHEAD AS THE FACT'S CARD AND NOTHING ELSE (`feedPaint_`, overworld.js): § */
    draw: () => feedPaint_?.(),
    stop: () => { if (typeof window.clipsStop_ === 'function') window.clipsStop_($('feed-screen')); },
    into: 'feed-screen', what: 'This',
    get html() { return mapHtml_('One more thing', mapBox_('feed-screen', 'feed', { attrs: { 'data-do': 'feed-tap' } })); } },

  /* ---------- VIDEOS — TYPE, TAP, WATCH § */
  { id: 'videos', kind: 'reel', name: 'Videos', start: () => window.initVideos?.(),
    /* DRAWN AHEAD FROM WHAT IS ALREADY HERE (`vidPaint_`): `initVideos` asks the network for the list and,
       for an admin, the films' sync. */
    draw: () => window.vidPaint_?.(),
    stop: () => window.videosStop_?.(),
    into: 'vid-box', what: 'The videos',
    get html() { return mapHtml_('Videos', mapBox_('vid-box', 'vid-box')); } },
  /* ---------- NEWSPAPER (owner, 12 Nov): a Sunday paper's fun section, one page on one card, never endless — newspaper.js reads data/settings/newspaper.json. */
  { id: 'newspaper', kind: 'tool', name: 'Sunday Funday', pure: true, start: () => window.initNewspaper_?.(),
    into: 'np-box', what: 'The newspaper',
    get html() { return mapHtml_('Sunday Funday', mapBox_('np-box', 'np-box')); } },
  /* `solid` — AN INSTRUMENT, NOT A CARD. § */
  /* MESSAGES, as a widget. § */
  /* MESSAGES IS NOT A WIDGET ANY MORE. § */

  { id: 'docket', kind: 'tool', name: 'Docket', solid: true, pure: true, start: () => paintDocket?.(),
    into: 'docket-body', what: 'The docket',
    get html() { return mapHtml_('Docket', mapBox_('docket-body'),
      mapBox_(null, 'dock-new', { blocks: [{ type: 'control', attrs: { id: 'dock-add', placeholder: 'Add a line…', autocomplete: 'off' } }],
        tiles: [{ form: true, label: '＋', act: 'dock-add', kind: 'quiet', cls: 'tiny' }] }),
      mapBox_('dock-said', 'said said-s', { tag: 'p' }),
      mapBox_('docket-gtasks')); } },
  { id: 'notepad', kind: 'tool', name: 'Notepad', solid: true, pure: true, start: () => initPad?.(),
    into: 'notepad', what: 'The notepad',
    get html() { return mapHtml_('Notepad',
      { type: 'control', tag: 'textarea', attrs: { id: 'notepad', placeholder: 'Jot something down…' } },
      mapBox_('pad-said', 'said said-s', { tag: 'p', text: 'Saves as you type.' }),
      { type: 'tiles', tiles: [{ icon: 'doc', label: 'Copy', note: 'the notes', act: 'pad-copy' }] }); } },
  /* ---------- SPEED READ (403): paste, then one word at a time — reader.js ---------- */
  { id: 'speedread', kind: 'tool', name: 'Speed reader', solid: true, pure: true, start: () => initSpeedRead?.(),
    into: 'sr-text', what: 'The speed reader',
    get html() { return mapHtml_('Speed reader',
      { type: 'control', tag: 'textarea', attrs: { id: 'sr-text', placeholder: 'Paste text to read…' } },
      /* A TILE, NOT A BUTTON (720): Read is the thing's action, so it is a tile in a row under it (house style). */
      { type: 'tiles', tiles: [{ icon: 'play', label: 'Read it', act: 'sr-read' }] }); } },

  /* ---------- THE BASKET, WHICH HAS NOW LIVED IN FOUR PLACES § */
  { id: 'cart', kind: 'shop', name: 'Basket', start: () => initCart?.(),
    into: 'cart-box', what: 'What is in it',
    /* BOTH AN ID AND A CLASS. § */
    get html() { return mapHtml_('Basket', mapBox_('cart-box', 'cart-box')); } },
  /* SEARCH THE SHOP (491): the shared pill, and what matches listed under it; a tap goes to the item. */
  { id: 'shopfind', kind: 'tool', name: 'Search the shop', pure: true, start: () => paintShopFind_?.(),
    into: 'shop-find-box', what: 'The shop search',
    get html() { return mapHtml_('Search the shop', mapBox_('shop-find-box', 'shop-find')); } },

  /* ---------- TERM DATES AND COUNTDOWNS (466): the owner — "a widget in the Tools column telling the user the end dates of the next 3 academic intervals"; countdowns "available for everyone under Tools". */
  { id: 'termdates', kind: 'tool', name: 'Term dates', pure: true, start: () => paintTermDates_?.(),
    draw: () => paintTermDates_?.(),
    into: 'td-box', what: 'The term dates',
    get html() { return mapHtml_('Term dates', mapBox_('td-box', 'td-box')); } },
  { id: 'countdowns', kind: 'tool', name: 'Countdowns', start: () => paintCountdowns_?.(),
    draw: () => paintCountdowns_?.(),
    into: 'cd-box', what: 'The countdowns',
    get html() { return mapHtml_('Countdowns', mapBox_('cd-box', 'cd-box')); } },

  /* ---------- FAVOURITE LINKS (509): ten a person keeps on their account; for everybody, so signing in moves no page (339) — favlinks.js ---------- */
  { id: 'favlinks', kind: 'tool', name: 'Favourite links', solid: true,
    start: () => window.initFavLinks_?.(),
    into: 'fav-box', what: 'Your favourite links',
    get html() { return mapHtml_('Favourite links', mapBox_('fav-box')); } },
  /* ---------- THE PIXEL EDITOR (547): bare bones -- a grid, a colour, pen or eraser, Clear, a PNG; this device only -- pixel.js ---------- */
  { id: 'pixel', kind: 'tool', name: 'Pixel editor', solid: true, pure: true,
    start: () => window.initPixel_?.(),
    into: 'pxe-box', what: 'The pixel editor',
    get html() { return mapHtml_('Pixel editor', mapBox_('pxe-box')); } },
  /* ---------- THE CONSOLE (389, 441; owner 12 Nov): game files you own, Linked pictures and the guesser behind one picker — games.js. */
  { id: 'console', kind: 'game', name: 'Console', start: () => window.initConsole?.(),
    draw: () => window.consoleStill_?.(),
    stop: () => { window.consoleStop_?.(); },
    into: 'cs-slot', what: 'The console',
    get html() {
      return mapHtml_('Console',
        { type: 'group', tag: 'label', look: 'mat-sel ws-top', blocks: [{ type: 'control', tag: 'select',
          attrs: { id: 'cs-pick', 'data-do': 'cs-pick', 'aria-label': 'Which game' }, inner: window.csOptions_ ? window.csOptions_() : '' }] },
        mapBox_('cs-slot', null, { inner: window.csSlot_ ? window.csSlot_() : '' }));
    } },
  /* ---------- THE WORD GAMES (238, 441; owner 12 Nov): Articulate to Word Search behind one picker — games.js. */
  { id: 'wordgames', kind: 'game', name: 'Word games', start: () => window.initWordGames?.(),
    draw: () => window.wgPaint_?.(),
    stop: () => { window.wordGamesStop_?.(); },
    into: 'wg-slot', what: 'The game',
    get html() {
      return mapHtml_('Word games',
        { type: 'group', tag: 'label', look: 'mat-sel ws-top', blocks: [{ type: 'control', tag: 'select',
          attrs: { id: 'wg-pick', 'data-do': 'wg-pick', 'aria-label': 'Which game' }, inner: window.wgOptions_ ? window.wgOptions_() : '' }] },
        mapBox_('wg-slot', null, { inner: window.wgSlot_ ? window.wgSlot_() : '' }));
    } },
  /* ---------- THE BOARD GAMES (414, 461; back 15 Nov): Chess, Maze, Connect 4, Othello and Scrabble behind one picker — boardgames.js. */
  { id: 'boardgames', kind: 'game', name: 'Board games', start: () => window.initBoardGames?.(),
    draw: () => window.bgPaint_?.(),
    stop: () => { window.boardGamesStop_?.(); },
    into: 'bg-slot', what: 'The board',
    get html() {
      return mapHtml_('Board games',
        { type: 'group', tag: 'label', look: 'mat-sel ws-top', blocks: [{ type: 'control', tag: 'select',
          attrs: { id: 'bg-pick', 'data-do': 'bg-pick', 'aria-label': 'Which game' }, inner: window.bgOptions_ ? window.bgOptions_() : '' }] },
        mapBox_('bg-slot', null, { inner: window.bgSlot_ ? window.bgSlot_() : '' }));
    } },
  /* ---------- YOUR LIBRARY CARDS (docs/history/339) § */
  { id: 'libcards', kind: 'tool', name: 'Library cards', solid: true, signedIn: true,
    start: () => initLibCards_?.(),
    into: 'lib-box', what: 'Your library cards',
    /* THE BOX ONLY: its host draws the card round it, and a card here showed twice (card-render). */
    get html() { return cardBlocks_(mapBox_('lib-box')); } },
];
/* SECONDARY (860): every widget here not named core in data/settings/tiers.json throws into oops_, never into its caller. */
tierGuardWidgets_(WIDGETS);



