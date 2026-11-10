/* @family. — the engines' entries that were in js/map.js's WIDGETS (88a): console, board games, word games, calculator, e-ink screen, whiteboard, and the calculator's key handler. Paste back into WIDGETS to restore. */

  /* CONSOLE (389, 391, 441): game files (jsnes, EmulatorJS), Flabby Pird and the Colliers Wood racer behind one picker — `CONSOLE_GAMES`, games.js. */
  { id: 'console', kind: 'game', name: 'Console', start: () => window.initConsole?.(),
    draw: () => window.consoleStill_?.(),
    stop: () => { window.consoleStop_?.(); },
    into: 'cs-slot', what: 'The console',
    get html() {
      return `<div class="card">
    <h3>Console</h3>
    <label class="mat-sel ws-top"><select id="cs-pick" data-do="cs-pick"
      aria-label="Which game">${window.csOptions_ ? window.csOptions_() : ''}</select></label>
    <div id="cs-slot">${window.csSlot_ ? window.csSlot_() : ''}</div>
  </div>`;
    } },
  /* THE BOARD, NOT THE DRAWING. § */
  /* THE BOARD, which is SVG now rather than three.js — so it draws immediately, needs no loader,
     and leaves nothing running when the widget closes. */

  /* `chess`, `tables` and `maze` WERE CARDS HERE (461): Chess and Maze are Board games now, the sprint a Word & number game. */
  /* ---------- BOARD GAMES (414, 461): Connect 4, Othello, Scrabble, Chess and Maze in one widget with a picker — the word games' shape (238); `BOARD_GAMES`, games.js */
  { id: 'boardgames', kind: 'game', name: 'Board games', start: () => window.initBoardGames?.(),
    pure: true,
    draw: () => window.bgPaint_?.(),
    stop: () => { window.boardGamesStop_?.(); },
    into: 'bg-slot', what: 'The board',
    /* A GETTER, so the chosen game's board is in the markup `paint` puts down (238's reason). */
    get html() {
      return `<div class="card">
    <h3>Board games</h3>
    <label class="mat-sel ws-top"><select id="bg-pick" data-do="bg-pick"
      aria-label="Which game">${window.bgOptions_ ? window.bgOptions_() : ''}</select></label>
    <div id="bg-slot">${window.bgSlot_ ? window.bgSlot_() : ''}</div>
  </div>`;
    } },

  /* A PAD, NOT A SWIPE. Up, down, left and right are the four gestures this app navigates by, so a maze that read them would fight the pager on the one screen it § */
  /* ---------- WORD GAMES — EIGHT GAMES, ONE WIDGET § */
  { id: 'wordgames', kind: 'game', name: 'Word & number games', start: () => window.initWordGames?.(),
    pure: true,
    /* DRAWN AHEAD AS MARKUP ONLY: the picker and the chosen game's card (`wgPaint_`, games.js). Its start
       drives `PARTY`, which is shared by the four classroom games, and must run for somebody looking. */
    draw: () => window.wgPaint_?.(),
    stop: () => { window.wordGamesStop_?.(); },
    into: 'wg-slot', what: 'The game',
    /* A GETTER, SO THE CHOSEN GAME IS IN THE MARKUP `paint` PUTS DOWN. § */
    get html() {
      return `<div class="card">
    <h3>Word &amp; number games</h3>
    <label class="mat-sel ws-top"><select id="wg-pick" data-do="wg-pick"
      aria-label="Which game">${window.wgOptions_ ? window.wgOptions_() : ''}</select></label>
    <div id="wg-slot">${window.wgSlot_ ? window.wgSlot_() : ''}</div>
  </div>`;
    } },







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

  { id: 'verse', kind: 'tool', name: 'E-ink screen', start: () => { einkLoad_?.(); paintEink_?.(); },
    draw: () => paintEink_?.(),
    into: 'eink-box', what: 'The e-ink screen',
    html: `<h3>E-ink screen</h3>
    <div id="eink-box" class="eink-box"></div>` },



  /* ---------- THE WHITEBOARD § */
  { id: 'whiteboard', kind: 'tool', name: 'Whiteboard', solid: true, start: () => window.initBoard_?.(),
    into: 'nb-box', what: 'The whiteboard',
    html: `<h3>Whiteboard</h3>
    <div id="nb-box" class="nb-box"></div>` },


/* The calculator keys go through the same delegated handler as everything else. § */
document.addEventListener('click', e => {
  const k = e.target.closest('[data-mc]');
  if (k) window._mcClick?.(k.dataset.mc);
});
