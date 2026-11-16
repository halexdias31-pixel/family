/* @family. — map.js ONE FILE, SPLIT. § */



/* A WIDGET'S MARKUP IS DATA (owner, 12 Nov, rule 1.26): its title, then its parts, drawn by the one card maker's blocks. */
const mapHead_ = text => ({ type: 'msgHead', text });
const mapBox_ = (id, look, more) => Object.assign({ type: 'group', id, look }, more || {});
const mapHtml_ = (name, ...parts) => cardBlocks_([mapHead_(name)].concat(parts));

/* ---------- `draw` AND `pure`: WHAT THE BUILDER MAY DO WITH A WIDGET BEFORE ANYBODY ARRIVES § */
const WIDGETS = [

  /* ---------- VIDEOS — TYPE, TAP, WATCH § */
  { id: 'videos', kind: 'reel', name: 'Videos', start: () => window.initVideos?.(),
    /* DRAWN AHEAD FROM WHAT IS ALREADY HERE (`vidPaint_`): `initVideos` asks the network for the list and,
       for an admin, the films' sync. */
    draw: () => window.vidPaint_?.(),
    stop: () => window.videosStop_?.(),
    into: 'vid-box', what: 'The videos',
    get html() { return mapHtml_('Videos', mapBox_('vid-box', 'vid-box')); } },
  /* ---------- NEWSPAPER (owner, 12 Nov): a Sunday paper's fun section, one page on one card, never endless — newspaper.js reads data/settings/newspaper.json. */
  /* `solid` — AN INSTRUMENT, NOT A CARD. § */
  /* MESSAGES, as a widget. § */
  /* MESSAGES IS NOT A WIDGET ANY MORE. § */

  /* ---------- SPEED READ (403): paste, then one word at a time — reader.js ---------- */

  /* ---------- THE BASKET, WHICH HAS NOW LIVED IN FOUR PLACES § */

  /* ---------- TERM DATES AND COUNTDOWNS (466): the owner — "a widget in the Tools column telling the user the end dates of the next 3 academic intervals"; countdowns "available for everyone under Tools". */
  { id: 'termdates', kind: 'tool', name: 'Term dates', pure: true, start: () => paintTermDates_?.(),
    draw: () => paintTermDates_?.(),
    into: 'td-box', what: 'The term dates',
    get html() { return mapHtml_('Term dates', mapBox_('td-box', 'td-box')); } },

  /* ---------- FAVOURITE LINKS (509): ten a person keeps on their account; for everybody, so signing in moves no page (339) — favlinks.js ---------- */
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



