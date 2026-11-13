/* @family. — map.js ONE FILE, SPLIT. § */



/* THREE, AND THEN YOU — AND THE NUMBER IS MEASURED RATHER THAN CHOSEN. § */
const SCORE_TOP = 3;

function scoreRanks_(field) {
  const people = [].concat(DATA.students || [], DATA.tutors || []);
  const seen = {}, all = [];
  people.forEach(p => {
    if (!p) return;
    const who = String(p.handle || p.name || p.title || '').trim();
    if (!who) return;
    /* A HANDLE IS THE KEY BECAUSE A PERSON CAN BE ON BOTH LISTS. A tutor who is also carried as a
       student would otherwise appear twice with the same score, which reads as two people tying. */
    const key = norm(who);
    if (seen[key]) return;
    seen[key] = 1;
    const score = Number(p[field]) || 0;
    if (score > 0) all.push({ who, score, me: mineIs_(p) });
  });
  /* Highest first, and ties settled by name rather than by whatever order the sheet is in — two
     children on the same score should not swap places between one load and the next. */
  all.sort((a, b) => b.score - a.score || cmpText(a.who, b.who));
  /* THE SAME SCORE IS THE SAME PLACE. § */
  all.forEach((x, i) => { x.pos = (i && all[i - 1].score === x.score) ? all[i - 1].pos : i + 1; });
  return { people: people.length, all };
}

/* THE ROW IS THE APP'S OWN `.row`, not a thing of its own: § */
function boardRow_(x) {
  return `<div class="row${x.me ? ' is-me' : ''}">`
    + `<span class="k">${esc(x.pos + ' · ' + x.who)}</span>`
    + `<span class="v mono">${esc(String(x.score))}</span></div>`;
}

function scoreBoard_(field) {
  const r = scoreRanks_(field);
  /* ---------- AND "NOT ARRIVED" WHILE THEY ARE ON THEIR WAY IS THE ONE LOADER § */
  if (!r.people && typeof awaiting_ === 'function' && awaiting_()) return loading_();
  if (!r.people) return '<p class="note">Scores have not arrived yet.</p>';
  if (!r.all.length) return '<p class="note">No scores yet. Be the first.</p>';
  const top = r.all.slice(0, SCORE_TOP);
  const mine = r.all.filter(x => x.me)[0];
  /* ASKED OF THE ROWS ON SCREEN RATHER THAN OF THE PLACE. § */
  return '<p class="board-head">High scores</p>'
    + top.map(boardRow_).join('')
    + (mine && top.indexOf(mine) < 0 ? boardRow_(mine) : '');
}

/* Called from `initFlappy` and `initTables`, which is to say from `startScreen_` — so the board is rebuilt on every paint of the column, which is what puts the § */
function paintBoard_(id, field) {
  const el = $(id);
  if (el) el.innerHTML = scoreBoard_(field);
}

/* ---------- `draw` AND `pure`: WHAT THE BUILDER MAY DO WITH A WIDGET BEFORE ANYBODY ARRIVES § */
const WIDGETS = [
  /* `stop` IS THE CLIP. This card deals a fact on a tap and some of those facts are videos, so leaving the column with one playing left it playing — the same fault § */
  /* A TOOL (owner, 12 Nov): a Find card under Tools, like every widget brought back. */
  { id: 'reels', kind: 'tool', name: 'One more thing', start: () => initFeed?.(),
    /* DRAWN AHEAD AS THE FACT'S CARD AND NOTHING ELSE (`feedPaint_`, overworld.js): § */
    draw: () => feedPaint_?.(),
    stop: () => clipsStop_($('feed-screen')),
    into: 'feed-screen', what: 'This',
    get html() { return `
    <h3>One more thing</h3>
    <div id="feed-screen" class="feed" data-do="feed-tap"></div>`; } },

  /* ---------- VIDEOS — TYPE, TAP, WATCH § */
  { id: 'videos', kind: 'reel', name: 'Videos', start: () => window.initVideos?.(),
    /* DRAWN AHEAD FROM WHAT IS ALREADY HERE (`vidPaint_`): `initVideos` asks the network for the list and,
       for an admin, the films' sync. */
    draw: () => window.vidPaint_?.(),
    stop: () => window.videosStop_?.(),
    into: 'vid-box', what: 'The videos',
    html: `<h3>Videos</h3>
    <div id="vid-box" class="vid-box"></div>` },
  /* ---------- NEWSPAPER (owner, 12 Nov): a Sunday paper's fun section, one page on one card, never endless — newspaper.js reads data/settings/newspaper.json. */
  { id: 'newspaper', kind: 'tool', name: 'Sunday Funday', pure: true, start: () => window.initNewspaper_?.(),
    into: 'np-box', what: 'The newspaper',
    get html() { return `
    <h3>Sunday Funday</h3>
    <div id="np-box" class="np-box"></div>`; } },
  /* HOMEWORK (owner, 6 Nov): a tutor sets a paper, the student sees it; off in tiers.json, so a Coming soon card under Tools. */
  { id: 'homework', kind: 'tool', name: 'Homework',
    html: `<h3>Homework</h3>` },
  /* `solid` — AN INSTRUMENT, NOT A CARD. § */
  /* MESSAGES, as a widget. § */
  /* MESSAGES IS NOT A WIDGET ANY MORE. § */

  /* THE FLYER MAKER WAS FOLDED INTO THE CHEAT SHEET MAKER ONCE, AND IS ITS OWN TOOL AGAIN — the `flyers` entry below. § */

  /* THE CHEAT SHEET MAKER. § */
  /* THE FLYER MAKER, WHICH IS A TOOL AND NOT A PIECE OF THE CHEAT SHEET. § */
  { id: 'flyers', kind: 'tool', name: 'Make a flyer', solid: true, admin: true,
    start: () => window.initFlyer?.(),
    into: 'fm-wrap', what: 'The flyer',
    get html() { return `
    <h3>Make a flyer</h3>
    <div id="fm-wrap"></div>`; } },


  { id: 'mat', kind: 'tool', name: 'Cheat sheet maker', solid: true,
    start: () => window.initMat?.(),
    into: 'mat-box', what: 'The cheat sheet',
    /* NO BLURB. It said "one sheet of A4, tick what goes on it" over a list of tickboxes on a page showing a sheet of A4 — three sentences describing what is already § */
    get html() { return card_(`<div class="">
    <h3>Cheat sheet maker</h3>
    <div id="mat-box"></div>
  </div>`); } },
  { id: 'timer', kind: 'tool', name: 'Timer', solid: true, start: () => window.initTimer?.(),
    pure: true,
    into: 'timer-display', what: 'The timer',
    get html() { return `
    <h3>Timer</h3>
    <p class="mono timer-big" id="timer-display">25:00</p>
    <div class="btn-row">
      ${/* A `data-do`, not an id. The delegated click handler only ever looks for `data-do`, so a
            button carrying an id alone is a button nothing is listening to — which is why this
            has never started anything. */''}
      ${tile_({ form: true, look: 'btn quiet', act: 'timer-toggle', id: 'timer-toggle', label: '▶' })}
      ${tile_({ form: true, label: 'Reset', act: 'timer-reset', kind: 'quiet' })}
    </div>
    ${/* The lengths people actually use. A number field for a duration is a keyboard and four taps
          for a question whose answer is almost always one of four. */''}
    <div class="btn-row gap-t">
      ${[5, 15, 25, 45].map(m =>
        `${tile_({ form: true, label: m, act: 'timer-set', data: { min: m }, kind: 'quiet', cls: 'tiny' })}`).join('')}
    </div>`; } },
  { id: 'docket', kind: 'tool', name: 'Docket', solid: true, pure: true, start: () => paintDocket?.(),
    into: 'docket-body', what: 'The docket',
    get html() { return `
    <h3>Docket</h3>
    <div id="docket-body"></div>
    <div class="dock-new">
      <input id="dock-add" placeholder="Add a line…" autocomplete="off">
      ${tile_({ form: true, label: '＋', act: 'dock-add', kind: 'quiet', cls: 'tiny' })}
    </div>
    <p class="said said-s" id="dock-said"></p>
    <div id="docket-gtasks"></div>`; } },
  { id: 'notepad', kind: 'tool', name: 'Notepad', solid: true, pure: true, start: () => initPad?.(),
    into: 'notepad', what: 'The notepad',
    get html() { return `
    <h3>Notepad</h3>
    <textarea id="notepad" placeholder="Jot something down…"></textarea>
    <p class="said said-s" id="pad-said">Saves as you type.</p>
    <div class="tile-row">${tile_({ icon: 'doc', label: 'Copy', note: 'the notes', act: 'pad-copy' })}</div>`; } },
  /* ---------- SPOTIFY (510): your own account, connected in this browser alone — spotify.js ---------- */
  { id: 'spotify', kind: 'tool', name: 'Spotify', solid: true, start: () => window.initSpotify?.(),
    into: 'sp-box', what: 'Spotify',
    get html() { return `
    <h3>Spotify</h3>
    <div id="sp-box">${typeof window.spCard_ === 'function' ? window.spCard_() : ''}</div>`;
    } },
  /* ---------- SPEED READ (403): paste, then one word at a time — reader.js ---------- */
  { id: 'speedread', kind: 'tool', name: 'Speed reader', solid: true, pure: true, start: () => initSpeedRead?.(),
    into: 'sr-text', what: 'The speed reader',
    get html() { return `
    <h3>Speed reader</h3>
    <textarea id="sr-text" placeholder="Paste text to read…"></textarea>
    ${/* A TILE, NOT A BUTTON (720): Read is the thing's action, so it is a tile in a row under it (house style). */''}<div class="tile-row">${tile_({ icon: 'play', label: 'Read it', act: 'sr-read' })}</div>`; } },

  /* ---------- THE TIMETABLE, THE ONE WEEK VIEW § */
  /* NOT `pure`, though it was until the review of 12 Oct: § */
  { id: 'timetable', kind: 'tool', name: 'Timetable', solid: true, start: () => window.initTimetable?.(),
    into: 'tmt-box', what: 'Your timetable',
    /* NO `.card` OF ITS OWN. § */
    html: `<h3>Timetable</h3>
    <div id="tmt-box" class="tmt-box"></div>` },

  /* ---------- TOUCH TYPING § */
  { id: 'typing', kind: 'tool', name: 'Touch typing', solid: true,
    start: () => window.initTyping?.(), into: 'kt-box', what: 'The lesson',
    html: `<h3>Touch typing</h3>
    <div id="kt-box" class="kt-box"></div>` },

  /* ---------- THE BASKET, WHICH HAS NOW LIVED IN FOUR PLACES § */
  { id: 'cart', kind: 'shop', name: 'Basket', start: () => initCart?.(),
    into: 'cart-box', what: 'What is in it',
    html: `<h3>Basket</h3>
    ${/* BOTH AN ID AND A CLASS. § */
          ''}
    <div id="cart-box" class="cart-box"></div>` },
  /* SEARCH THE SHOP (491): the shared pill, and what matches listed under it; a tap goes to the item. */
  { id: 'shopfind', kind: 'tool', name: 'Search the shop', pure: true, start: () => paintShopFind_?.(),
    into: 'shop-find-box', what: 'The shop search',
    html: `<h3>Search the shop</h3>
    <div id="shop-find-box" class="shop-find"></div>` },

  { id: 'calendar', kind: 'tool', name: 'Calendar', pure: true, start: () => window.initCalendar?.(),
    into: 'cal-body', what: 'The calendar',
    get html() { return `
    <h3>Calendar</h3>
    <p id="cal-label" class="cal-month"></p>
    <div id="cal-body" class="cal"></div>
    <div class="tile-row">${tile_({ icon: 'left', label: 'Earlier', note: 'the month before', act: 'cal-back' })}${tile_({ icon: 'right', label: 'Later', note: 'the month after', act: 'cal-fwd' })}</div>`; } },

  /* ---------- TERM DATES AND COUNTDOWNS (466): the owner — "a widget in the Tools column telling the user the end dates of the next 3 academic intervals"; countdowns "available for everyone under Tools". */
  { id: 'termdates', kind: 'tool', name: 'Term dates', pure: true, start: () => paintTermDates_?.(),
    draw: () => paintTermDates_?.(),
    into: 'td-box', what: 'The term dates',
    html: `<h3>Term dates</h3>
    <div id="td-box" class="td-box"></div>` },
  { id: 'countdowns', kind: 'tool', name: 'Countdowns', start: () => paintCountdowns_?.(),
    draw: () => paintCountdowns_?.(),
    into: 'cd-box', what: 'The countdowns',
    html: `<h3>Countdowns</h3>
    <div id="cd-box" class="cd-box"></div>` },

  /* ---------- FAVOURITE LINKS (509): ten a person keeps on their account; for everybody, so signing in moves no page (339) — favlinks.js ---------- */
  { id: 'favlinks', kind: 'tool', name: 'Favourite links', solid: true,
    start: () => window.initFavLinks_?.(),
    into: 'fav-box', what: 'Your favourite links',
    get html() { return `
    <h3>Favourite links</h3>
    <div id="fav-box"></div>`; } },
  /* ---------- THE REWRITE COACH (509, 519): admin only for now; a fact checklist and questions, never a rewrite — rewrite.js ---------- */
  { id: 'rewrite', kind: 'tool', name: 'Rewrite coach', solid: true, admin: true,
    start: () => window.initRewrite_?.(),
    into: 'rw-box', what: 'The rewrite coach',
    get html() { return `
    <h3>Rewrite coach</h3>
    <div id="rw-box"></div>`; } },
  /* ---------- THE POSTER PLANNER (547): bare bones -- a page, boxes, JSON and PNG out for Claude; this device only -- poster.js ---------- */
  { id: 'poster', kind: 'tool', name: 'Poster planner', solid: true, pure: true,
    start: () => window.initPoster_?.(),
    into: 'pst-box', what: 'The poster planner',
    get html() { return `
    <h3>Poster planner</h3>
    <div id="pst-box"></div>`; } },
  /* ---------- THE PIXEL EDITOR (547): bare bones -- a grid, a colour, pen or eraser, Clear, a PNG; this device only -- pixel.js ---------- */
  { id: 'pixel', kind: 'tool', name: 'Pixel editor', solid: true, pure: true,
    start: () => window.initPixel_?.(),
    into: 'pxe-box', what: 'The pixel editor',
    get html() { return `
    <h3>Pixel editor</h3>
    <div id="pxe-box"></div>`; } },
  /* ---------- THE CONSOLE (389, 441; owner 12 Nov): game files you own, Linked pictures and the guesser behind one picker — games.js. */
  { id: 'console', kind: 'game', name: 'Console', start: () => window.initConsole?.(),
    draw: () => window.consoleStill_?.(),
    stop: () => { window.consoleStop_?.(); },
    into: 'cs-slot', what: 'The console',
    get html() {
      return `<h3>Console</h3>
    <label class="mat-sel ws-top"><select id="cs-pick" data-do="cs-pick"
      aria-label="Which game">${window.csOptions_ ? window.csOptions_() : ''}</select></label>
    <div id="cs-slot">${window.csSlot_ ? window.csSlot_() : ''}</div>`;
    } },
  /* ---------- THE WORD GAMES (238, 441; owner 12 Nov): Articulate to Word Search behind one picker — games.js. */
  { id: 'wordgames', kind: 'game', name: 'Word games', start: () => window.initWordGames?.(),
    draw: () => window.wgPaint_?.(),
    stop: () => { window.wordGamesStop_?.(); },
    into: 'wg-slot', what: 'The game',
    get html() {
      return `<h3>Word games</h3>
    <label class="mat-sel ws-top"><select id="wg-pick" data-do="wg-pick"
      aria-label="Which game">${window.wgOptions_ ? window.wgOptions_() : ''}</select></label>
    <div id="wg-slot">${window.wgSlot_ ? window.wgSlot_() : ''}</div>`;
    } },
  /* ---------- YOUR LIBRARY CARDS (docs/history/339) § */
  { id: 'libcards', kind: 'tool', name: 'Library cards', solid: true, signedIn: true,
    start: () => initLibCards_?.(),
    into: 'lib-box', what: 'Your library cards',
    /* THE BOX ONLY: its host draws the card round it, and a card here showed twice (card-render). */
    get html() { return '<div id="lib-box"></div>'; } },
];
/* SECONDARY (860): every widget here not named core in data/settings/tiers.json throws into oops_, never into its caller. */
tierGuardWidgets_(WIDGETS);



