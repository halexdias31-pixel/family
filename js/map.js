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
  { id: 'chess', kind: 'game', name: 'Chess', start: () => initChess?.(),
    pure: true,
    into: 'chess-board', what: 'The board',
    /* THE BOARD, AND NOTHING ELSE. § */
    /* AND THEN TWO PLAYERS, WHICH PUT TWO BUTTONS BACK. § */
    html: `<div class="card chess-game">
    <p class="chess-say" id="chess-say" aria-live="polite">White to move</p>
    <div id="chess-board" class="chess"></div>
    <div class="btn-row chess-promo" hidden></div>
    <div class="tile-row chess-ctl"></div>
  </div>` },
  { id: 'tables', kind: 'game', name: 'Times Tables', start: () => initTables?.(),
    /* DRAWN AHEAD BY ITS OWN START (`draw`, docs/history/341): § */
    draw: () => initTables?.(),
    /* The sprint's clock is a setInterval. Left running it goes on counting a sixty-second round
       nobody is watching, and fires its finish into a screen that is no longer there. */
    stop: () => { if (typeof ttState !== 'undefined' && ttState) { clearInterval(ttState.timer); ttState = null; } },
    into: 'tt-idle', what: 'The sprint',
    html: `<div class="card">
    <h3>Times Tables Sprint</h3>
    <div id="tt-idle">
      <p class="sub">Sixty seconds. As many as you can.</p>
      <button class="btn" id="tt-play" data-do="tt-start">Start</button>
    </div>
    <div id="tt-question" class="hidden tt">
      <p class="mono" id="tt-q" style="font-size:2rem;text-align:center;margin:.6rem 0">—</p>
      <input id="tt-answer" inputmode="numeric" placeholder="answer" autocomplete="off">
      <p class="note" id="tt-feedback" style="text-align:center;min-height:1.2em"></p>
      ${rowLive('Time', '60', 'tt-time')}
      ${rowLive('Right', '0', 'tt-score')}
      <button class="btn quiet" data-do="tt-stop" style="margin-top:.5rem">Give up</button>
    </div>
    <div id="tt-over" class="hidden"></div>
    <div id="tt-board" class="board"></div>
  </div>` },
  { id: 'flabby', kind: 'game', name: 'Flabby Pird', start: () => initFlappy?.(),
    /* DRAWN AHEAD STILL: the board, the canvas fitted, one frame of the scene — and no frame loop, no
       handler and no key listener, which `initFlappy` puts on (`flappyStill_`, receipt.js). */
    draw: () => flappyStill_?.(),
    /* An animation loop, which is the expensive one: sixty frames a second drawn into a canvas
       off the side of the screen, for as long as the tab is open. */
    stop: () => { if (typeof flappyState !== 'undefined' && flappyState && flappyState.raf) {
      cancelAnimationFrame(flappyState.raf); flappyState.raf = null; } },
    into: 'flappy-canvas', what: 'The game',
    html: `<div class="card">
    <h3>Flabby Pird</h3>
    <p class="sub">Harder than it looks.</p>
    <canvas id="flappy-canvas" class="flappy"></canvas>
    <p class="note" id="flappy-msg" style="text-align:center;margin:.4rem 0 0">Tap to play</p>
    ${rowLive('Score', '0', 'flappy-score')}
    ${rowLive('Best', '0', 'flappy-best')}
    <div id="flappy-board" class="board"></div>
  </div>` },
  /* CONSOLE (389, 391): jsnes for NES, EmulatorJS for SNES, Game Boy and N64. The game file is the person's own, picked on their device and kept there; `stop` pauses. */
  { id: 'console', kind: 'game', name: 'Console', start: () => { nesPaint_?.(); nesPadWatch_?.(); },
    draw: () => nesPaint_?.(),
    stop: () => { if (typeof nesStop_ === 'function') { nesStop_(); nesPadUnwatch_(); } },
    into: 'nes-box', what: 'The console',
    html: `<div class="card">
    <h3>Console</h3>
    <p class="sub">Plays NES, SNES, Game Boy, Game Boy Color, Game Boy Advance, N64 and DS files. Bring your own game file.</p>
    <div id="nes-box" class="nes-box"></div>
  </div>` },
  /* THE BOARD, NOT THE DRAWING. § */
  /* THE BOARD, which is SVG now rather than three.js — so it draws immediately, needs no loader,
     and leaves nothing running when the widget closes. */
  /* `The Overworld` WAS A WIDGET HERE and is gone on request: § */

  /* ---------- BOARD GAMES (414): Connect 4, Othello and Scrabble in one widget with a picker — the word games' shape (238); `BOARD_GAMES`, games.js */
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
  { id: 'wordgames', kind: 'game', name: 'Word games', start: () => initWordGames?.(),
    pure: true,
    /* DRAWN AHEAD AS MARKUP ONLY: the picker and the chosen game's card (`wgPaint_`, games.js). Its start
       drives `PARTY`, which is shared by the four classroom games, and must run for somebody looking. */
    draw: () => wgPaint_?.(),
    stop: () => { if (typeof wordGamesStop_ === 'function') wordGamesStop_(); },
    into: 'wg-slot', what: 'The game',
    /* A GETTER, SO THE CHOSEN GAME IS IN THE MARKUP `paint` PUTS DOWN. § */
    get html() {
      return `<div class="card">
    <h3>Word games</h3>
    <label class="mat-sel ws-top"><select id="wg-pick" data-do="wg-pick"
      aria-label="Which game">${typeof wgOptions_ === 'function' ? wgOptions_() : ''}</select></label>
    <div id="wg-slot">${typeof wgSlot_ === 'function' ? wgSlot_() : ''}</div>
  </div>`;
    } },

  /* `alibi` WAS HERE, a card of its own between Scrabble and the maze, and is deleted on request ("delete alibi game.") — the note where its engine was in games.js § */
  { id: 'maze', kind: 'game', name: 'Maze', start: () => initMaze?.(),
    pure: true,
    into: 'maze-grid', what: 'The maze',
    html: `<div class="card">
    <h3>Maze</h3>
    <p class="sub">Top left to bottom right. Tap the arrows, or use the arrow keys.</p>
    <div id="maze-grid" class="mz" role="img"></div>
    <div class="mz-pad">
      <button class="mz-key up" data-do="maze-go" data-d="n" aria-label="Up">&#9650;</button>
      <button class="mz-key left" data-do="maze-go" data-d="w" aria-label="Left">&#9664;</button>
      <button class="mz-key right" data-do="maze-go" data-d="e" aria-label="Right">&#9654;</button>
      <button class="mz-key down" data-do="maze-go" data-d="s" aria-label="Down">&#9660;</button>
    </div>
    <p class="note" id="maze-said" style="text-align:center;margin:.5rem 0 0"></p>
    <p class="faint" style="text-align:center;margin:.15rem 0 0">Moves: <b id="maze-moves">0</b></p>
    <button class="btn quiet" data-do="maze-again">New maze</button>
  </div>` },

  /* ---------- WORD SEARCH — TWO TAPS, NOT A DRAG § */
  { id: 'wordsearch', kind: 'game', name: 'Word Search', start: () => initWordSearch?.(),
    pure: true,
    into: 'ws-grid', what: 'The grid',
    html: `<div class="card">
    <h3>Word Search</h3>
    <p class="sub">Tap the first letter of a word, then its last.</p>
    <label class="mat-sel ws-top"><select id="ws-theme" data-do="ws-theme"
      aria-label="Which words"></select></label>
    <div id="ws-grid" class="ws"></div>
    <ul id="ws-words" class="ws-list"></ul>
    <p class="note" id="ws-said" style="text-align:center;margin:.4rem 0 0"></p>
    <button class="btn quiet" data-do="ws-again">New puzzle</button>
  </div>` },

  /* ---------- SENTENCE SCRAMBLE — CUT-UP PAPER ON A PHONE § */
  { id: 'scramble', kind: 'game', name: 'Sentence Scramble', start: () => initScramble?.(),
    pure: true,
    into: 'ss-box', what: 'The sentence',
    html: `<div class="card">
    <h3>Sentence Scramble</h3>
    <p class="sub">Tap the words in order to put the sentence back together.</p>
    <label class="mat-sel ws-top"><select id="ss-level" data-do="ss-level"
      aria-label="Level"></select></label>
    <div id="ss-box"></div>
    <p class="note" id="ss-said" style="text-align:center;margin:.4rem 0 0"></p>
  </div>` },

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
  /* `solid` — AN INSTRUMENT, NOT A CARD. § */
  /* MESSAGES, as a widget. § */
  /* MESSAGES IS NOT A WIDGET ANY MORE. § */

  { id: 'calculator', kind: 'tool', name: 'Calculator', solid: true, start: () => initMiniCalc?.(),
    pure: true,
    into: 'mc-display', what: 'The calculator',
    html: `<div class="card">
    <h3>Calculator</h3>
    ${/* A DIV, not an input. § */
          ''}
    <div id="mc-display" class="mc-display mono">0</div>
    <div class="mc-grid">
      ${CALC_KEYS.map(([v, label, cls]) =>
        `<button type="button" class="mc-btn ${cls}" data-mc="${esc(v)}">${esc(label)}</button>`
      ).join('')}
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

  /* THE HOURS A TUTOR CAN TEACH. § */
  { id: 'avail', kind: 'tool', name: 'My teaching hours (availability)', solid: true, tutor: true,
    start: () => initAvail?.(),
    into: 'avail-box', what: 'Your hours',
    html: `<div class="card">
    <h3>My teaching hours</h3>
    ${/* NOT "TICK THE HOURS YOU CAN TEACH". § */
          ''}
    <p class="sub">A family booking a session only sees the hours you have ticked — everything
      else comes up greyed, with the reason why.</p>
    <div id="avail-box"></div>
  </div>` },

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

  { id: 'calendar', kind: 'tool', name: 'Calendar', start: () => initCalendar?.(),
    into: 'cal-body', what: 'The calendar',
    html: `<div class="card">
    <div class="cal-head">
      <span class="cal-arrow" data-do="cal-back">‹</span>
      <h3 id="cal-label" style="margin:0">Calendar</h3>
      <span class="cal-arrow" data-do="cal-fwd">›</span>
    </div>
    <div id="cal-body" class="cal"></div>
  </div>` },

  /* ---------- CHECK UPLOADS — FOR AN ADMIN, AFTER A DEPLOY § */
  { id: 'uploads', kind: 'tool', name: 'Check uploads (photos and videos in messages)', admin: true,
    start: () => uploadsPaint_?.(),
    into: 'up-box', what: 'Check uploads',
    html: `<div class="card">
    <h3>Check uploads</h3>
    ${/* NO BLURB: the line under the tile says what a press does until it is pressed, and then the answer is what the card is for — at 320px a standing paragraph above § */
          ''}
    <div id="up-box" class="up-box"></div>
  </div>` },

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