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
  /* CONSOLE (389, 391, 441): game files (jsnes, EmulatorJS), Flabby Pird and the Colliers Wood racer behind one picker — `CONSOLE_GAMES`, games.js. */
  { id: 'console', kind: 'game', name: 'Console', start: () => initConsole?.(),
    draw: () => consoleStill_?.(),
    stop: () => { if (typeof consoleStop_ === 'function') consoleStop_(); },
    into: 'cs-slot', what: 'The console',
    get html() {
      return `<div class="card">
    <h3>Console</h3>
    <label class="mat-sel ws-top"><select id="cs-pick" data-do="cs-pick"
      aria-label="Which game">${typeof csOptions_ === 'function' ? csOptions_() : ''}</select></label>
    <div id="cs-slot">${typeof csSlot_ === 'function' ? csSlot_() : ''}</div>
  </div>`;
    } },
  /* THE BOARD, NOT THE DRAWING. § */
  /* THE BOARD, which is SVG now rather than three.js — so it draws immediately, needs no loader,
     and leaves nothing running when the widget closes. */
  /* `The Overworld` WAS A WIDGET HERE and is gone on request: § */

  /* `chess`, `tables` and `maze` WERE CARDS HERE (461): Chess and Maze are Board games now, the sprint a Word & number game. */
  /* ---------- BOARD GAMES (414, 461): Connect 4, Othello, Scrabble, Chess and Maze in one widget with a picker — the word games' shape (238); `BOARD_GAMES`, games.js */
  { id: 'boardgames', kind: 'game', name: 'Board games', start: () => initBoardGames?.(),
    pure: true,
    draw: () => bgPaint_?.(),
    stop: () => { if (typeof boardGamesStop_ === 'function') boardGamesStop_(); },
    into: 'bg-slot', what: 'The board',
    /* A GETTER, so the chosen game's board is in the markup `paint` puts down (238's reason). */
    get html() {
      return `<div class="card">
    <h3>Board games</h3>
    <label class="mat-sel ws-top"><select id="bg-pick" data-do="bg-pick"
      aria-label="Which game">${typeof bgOptions_ === 'function' ? bgOptions_() : ''}</select></label>
    <div id="bg-slot">${typeof bgSlot_ === 'function' ? bgSlot_() : ''}</div>
  </div>`;
    } },

  /* A PAD, NOT A SWIPE. Up, down, left and right are the four gestures this app navigates by, so a maze that read them would fight the pager on the one screen it § */
  /* ---------- WORD GAMES — EIGHT GAMES, ONE WIDGET § */
  { id: 'wordgames', kind: 'game', name: 'Word & number games', start: () => initWordGames?.(),
    pure: true,
    /* DRAWN AHEAD AS MARKUP ONLY: the picker and the chosen game's card (`wgPaint_`, games.js). Its start
       drives `PARTY`, which is shared by the four classroom games, and must run for somebody looking. */
    draw: () => wgPaint_?.(),
    stop: () => { if (typeof wordGamesStop_ === 'function') wordGamesStop_(); },
    into: 'wg-slot', what: 'The game',
    /* A GETTER, SO THE CHOSEN GAME IS IN THE MARKUP `paint` PUTS DOWN. § */
    get html() {
      return `<div class="card">
    <h3>Word &amp; number games</h3>
    <label class="mat-sel ws-top"><select id="wg-pick" data-do="wg-pick"
      aria-label="Which game">${typeof wgOptions_ === 'function' ? wgOptions_() : ''}</select></label>
    <div id="wg-slot">${typeof wgSlot_ === 'function' ? wgSlot_() : ''}</div>
  </div>`;
    } },

  /* `alibi` WAS HERE, a card of its own between Scrabble and the maze, and is deleted on request ("delete alibi game.") — the note where its engine was in games.js § */




  /* `herd` WAS HERE, Herd Mentality's own card, and it is a game inside Word games now — see the note over the `wordgames` entry above. § */

  /* `stop` IS THE CLIP. This card deals a fact on a tap and some of those facts are videos, so leaving the column with one playing left it playing — the same fault § */
  /* `reel` (414): with Videos it leads the Reels column — things to watch sit with the reels, not the games. */
  { id: 'reels', kind: 'reel', name: 'One more thing', start: () => initFeed?.(),
    /* DRAWN AHEAD AS THE FACT'S CARD AND NOTHING ELSE (`feedPaint_`, overworld.js): § */
    draw: () => feedPaint_?.(),
    stop: () => clipsStop_($('feed-screen')),
    into: 'feed-screen', what: 'This',
    html: `<div class="card">
    <h3>One more thing</h3>
    <p class="sub">Something worth knowing. Tap for another.</p>
    <div id="feed-screen" class="feed" data-do="feed-tap"></div>
  </div>` },

  /* ---------- VIDEOS — TYPE, TAP, WATCH § */
  { id: 'videos', kind: 'reel', name: 'Videos', start: () => initVideos?.(),
    /* DRAWN AHEAD FROM WHAT IS ALREADY HERE (`vidPaint_`): `initVideos` asks the network for the list and,
       for an admin, the films' sync. */
    draw: () => vidPaint_?.(),
    stop: () => videosStop_?.(),
    into: 'vid-box', what: 'The videos',
    html: `<h3>Videos</h3>
    <div id="vid-box" class="vid-box"></div>` },
  /* ---------- NEWSPAPER (466): a placeholder on Reels, its title alone until it has something to say. */
  { id: 'newspaper', kind: 'reel', name: 'Newspaper',
    html: `<h3>Newspaper</h3>` },
  /* `solid` — AN INSTRUMENT, NOT A CARD. § */
  /* MESSAGES, as a widget. § */
  /* MESSAGES IS NOT A WIDGET ANY MORE. § */

  { id: 'calculator', kind: 'tool', name: 'Calculator', solid: true, start: () => initMiniCalc?.(),
    pure: true,
    into: 'mc-display', what: 'The calculator',
    html: `<div class="card">
    <h3 class="calc-name">Calculator</h3>
    ${/* A DIV, not an input. § */
          ''}
    <div class="calc">
      <div class="calc-bezel">
        <div id="mc-display" class="mc-display" tabindex="0" aria-live="polite" aria-label="Calculator display"></div>
        <div class="calc-label">${esc(typeof brand === 'function' ? brand('name', '@family.') : '@family.')}</div>
      </div>
      ${[['top', 'calc-top', '<i class="calc-pad" aria-hidden="true"></i><i class="calc-pad calc-pad-v" aria-hidden="true"></i>'], ['fn', 'calc-fn', ''], ['num', 'calc-num', '']].map(([part, cls, extra]) =>
        `<div class="${cls}">${extra}${CALC_KEYS.filter(k => k[2].split(' ')[0] === part).map(([v, label, kc, legend, name]) =>
          `<button type="button" class="mc-btn ${kc}${/^\w+$/.test(v) ? ' mc-k-' + v : ''}" data-mc="${esc(v)}" aria-label="${esc(name || v)}">${/pad|pg/.test(kc) ? '' : `<small class="mc-alt">${legend || ''}</small>`}<span class="mc-lab">${label}</span></button>`
        ).join('')}</div>`).join('')}
    </div>
  </div>` },
  /* THE FLYER MAKER WAS FOLDED INTO THE CHEAT SHEET MAKER ONCE, AND IS ITS OWN TOOL AGAIN — the `flyers` entry below. § */

  /* THE CHEAT SHEET MAKER. § */
  /* THE FLYER MAKER, WHICH IS A TOOL AND NOT A PIECE OF THE CHEAT SHEET. § */
  { id: 'flyers', kind: 'tool', name: 'Make a flyer', solid: true, admin: true,
    start: () => initFlyer?.(),
    into: 'fm-wrap', what: 'The flyer',
    html: `<div class="card">
    <h3>Make a flyer</h3>
    <p class="sub">Campaign, style, colours and size. Two to a sheet, or nine stickers. Prices come
      from the venue you pick.</p>
    <div id="fm-wrap"></div>
  </div>` },

  /* THE `avail` TOOL (My teaching hours) WAS HERE — the hours are the Staff hub's Hours now (432). */

  { id: 'mat', kind: 'tool', name: 'Cheat sheet maker (maths mat)', solid: true,
    start: () => initMat?.(),
    into: 'mat-box', what: 'The cheat sheet',
    /* NO BLURB. It said "one sheet of A4, tick what goes on it" over a list of tickboxes on a page showing a sheet of A4 — three sentences describing what is already § */
    html: `<div class="card">
    <h3>Cheat sheet maker</h3>
    <div id="mat-box"></div>
  </div>` },
  { id: 'timer', kind: 'tool', name: 'Timer', solid: true, start: () => initTimer?.(),
    pure: true,
    into: 'timer-display', what: 'The timer',
    html: `<div class="card">
    <h3>Timer</h3>
    <p class="mono" id="timer-display" style="font-size:2.1rem;text-align:center;margin:.4rem 0">25:00</p>
    <div class="btn-row">
      ${/* A `data-do`, not an id. The delegated click handler only ever looks for `data-do`, so a
            button carrying an id alone is a button nothing is listening to — which is why this
            has never started anything. */''}
      <button class="btn quiet" data-do="timer-toggle" id="timer-toggle">▶</button>
      <button class="btn quiet" data-do="timer-reset">Reset</button>
    </div>
    ${/* The lengths people actually use. A number field for a duration is a keyboard and four taps
          for a question whose answer is almost always one of four. */''}
    <div class="btn-row" style="margin-top:.4rem">
      ${[5, 15, 25, 45].map(m =>
        `<button class="btn quiet tiny" data-do="timer-set" data-min="${m}">${m}</button>`).join('')}
    </div>
  </div>` },
  { id: 'docket', kind: 'tool', name: 'Docket', solid: true, start: () => paintDocket?.(),
    into: 'docket-body', what: 'The docket',
    html: `<div class="card">
    <h3>Docket</h3>
    <p class="sub">What there is to do. Tick it off as you go.</p>
    <div id="docket-body"></div>
    <div class="dock-new">
      <input id="dock-add" placeholder="Add a line…" autocomplete="off">
      <button class="btn quiet tiny" data-do="dock-add">＋</button>
    </div>
    <p class="faint" id="dock-said" style="margin:.35rem 0 0"></p>
  </div>` },
  { id: 'notepad', kind: 'tool', name: 'Notepad', solid: true, start: () => initPad?.(),
    into: 'notepad', what: 'The notepad',
    html: `<div class="card">
    <h3>Notepad</h3>
    <textarea id="notepad" placeholder="Jot something down…"></textarea>
    <p class="faint" id="pad-said" style="margin:.35rem 0 0">Saves as you type.</p>
  </div>` },
  /* ---------- SPEED READ (403): paste, then one word at a time — reader.js ---------- */
  { id: 'speedread', kind: 'tool', name: 'Speed reader (one word at a time)', solid: true, pure: true, start: () => initSpeedRead?.(),
    into: 'sr-text', what: 'The speed reader',
    html: `<div class="card">
    <h3>Speed reader</h3>
    <p class="sub">Paste anything; it is shown a word at a time, the eye kept still on the gold letter.</p>
    <textarea id="sr-text" placeholder="Paste text to read…"></textarea>
    <button class="btn" data-do="sr-read">Read it</button>
  </div>` },
  /* ---------- `Your week` WAS HERE, AND IS IN THE TIMETABLE NOW § */
  /* ---------- THE `live` WIDGET WAS HERE § */

  /* ---------- THE TIMETABLE, THE ONE WEEK VIEW § */
  /* NOT `pure`, though it was until the review of 12 Oct: § */
  { id: 'timetable', kind: 'tool', name: 'Timetable', solid: true, start: () => initTimetable?.(),
    into: 'tmt-box', what: 'Your timetable',
    /* NO `.card` OF ITS OWN. § */
    html: `<h3>Timetable</h3>
    <div id="tmt-box" class="tmt-box"></div>` },

  /* ---------- TOUCH TYPING § */
  { id: 'typing', kind: 'tool', name: 'Touch typing (keyboard practice)', solid: true,
    pure: true,
    start: () => initTyping?.(), into: 'kt-box', what: 'The lesson',
    html: `<h3>Touch typing</h3>
    <div id="kt-box" class="kt-box"></div>` },

  /* ---------- THE BASKET, WHICH HAS NOW LIVED IN FOUR PLACES § */
  { id: 'cart', kind: 'shop', name: 'Basket', start: () => initCart?.(),
    into: 'cart-box', what: 'What is in it',
    html: `<h3>Basket</h3>
    ${/* BOTH AN ID AND A CLASS. § */
          ''}
    <div id="cart-box" class="cart-box"></div>` },

  { id: 'calendar', kind: 'tool', name: 'Calendar', pure: true, start: () => initCalendar?.(),
    into: 'cal-body', what: 'The calendar',
    html: `<div class="card">
    <div class="cal-head">
      <span class="cal-arrow" data-do="cal-back">‹</span>
      <h3 id="cal-label" style="margin:0">Calendar</h3>
      <span class="cal-arrow" data-do="cal-fwd">›</span>
    </div>
    <div id="cal-body" class="cal"></div>
  </div>` },

  /* ---------- TERM DATES AND COUNTDOWNS (466): the owner — "a widget in the Tools column telling the user the end dates of the next 3 academic intervals"; countdowns "available for everyone under Tools". */
  { id: 'termdates', kind: 'tool', name: 'Term dates', start: () => paintTermDates_?.(),
    draw: () => paintTermDates_?.(),
    into: 'td-box', what: 'The term dates',
    html: `<h3>Term dates</h3>
    <div id="td-box" class="td-box"></div>` },
  { id: 'countdowns', kind: 'tool', name: 'Countdowns', start: () => paintCountdowns_?.(),
    draw: () => paintCountdowns_?.(),
    into: 'cd-box', what: 'The countdowns',
    html: `<h3>Countdowns</h3>
    <div id="cd-box" class="cd-box"></div>` },

  /* ---------- THE E-INK SCREEN (470): the widget is the screen; syncing a real one is a bonus. The owner: "Keep it in the widget." */
  { id: 'verse', kind: 'tool', name: 'E-ink screen', start: () => { einkLoad_?.(); paintEink_?.(); },
    pure: true,
    draw: () => paintEink_?.(),
    into: 'eink-box', what: 'The e-ink screen',
    html: `<h3>E-ink screen</h3>
    <div id="eink-box" class="eink-box"></div>` },

  /* CHECK UPLOADS IS GONE (owner, 26 Oct: "delete this"): authoriseDrive's log in the editor says READY. */


  /* ---------- THE WHITEBOARD § */
  { id: 'whiteboard', kind: 'tool', name: 'Whiteboard', solid: true, start: () => initBoard_?.(),
    into: 'nb-box', what: 'The whiteboard',
    html: `<h3>Whiteboard</h3>
    <div id="nb-box" class="nb-box"></div>` },

  /* ---------- YOUR LIBRARY CARDS (docs/history/339) § */
  { id: 'libcards', kind: 'tool', name: 'Library cards', solid: true, signedIn: true,
    start: () => initLibCards_?.(),
    into: 'lib-box', what: 'Your library cards',
    html: `<div class="card">
    <h3>Library cards</h3>
    <div id="lib-box"></div>
  </div>` },
];



/* The calculator keys go through the same delegated handler as everything else. § */
document.addEventListener('click', e => {
  const k = e.target.closest('[data-mc]');
  if (k) window._mcClick?.(k.dataset.mc);
});