/* ---------- IMPOSTER: A DOUBLE TAP IS ONE PRESS § */
check('imposter takes a double tap on Show, Hide, Reveal or the reveal\'s buttons as one press', async () => {
  const { w } = boot({ before: w => { try { w.localStorage.setItem('wg-game', 'imp'); } catch (e) {} } });
  await wait(300);
  const t = w.__t;
  try { t.findGroup('Games'); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(700);
  const d = w.document;
  if (!d.getElementById('imp-card')) return ['the imposter game did not draw on the Games column'];
  const bad = [];
  const press = act => t.ACTIONS[act](d.createElement('button'));
  const tap = act => t.ACTIONS[act](d.createElement('button'), { type: 'click' });
  const PAST = 750;
  const now = () => { const S = t.IMP(); return S.phase + ' ' + (S.at + 1) + (S.shown ? ' shown' : ''); };
  const want = (is, why) => { if (now() !== is) bad.push(why + ' (the round is at "' + now() + '", wanted "' + is + '")'); };
  press('imp-start');
  await wait(PAST);

  tap('imp-show');
  want('deal 1 shown', 'Show pressed on its own did not bring up the card');
  tap('imp-hide');
  want('deal 1 shown', "a second tap straight after Show pressed Hide, and player 1's turn went by unseen");

  await wait(PAST);
  tap('imp-hide');
  want('deal 2', 'Hide pressed on its own did not hand the phone on');
  tap('imp-show');
  want('deal 2', "a second tap straight after Hide pressed Show, and player 2's card opened in player 1's hands");

  /* TO THE LAST PLAYER WITHOUT A FINGER, then the last Hide by one. */
  const n = t.IMP().n;
  while (t.IMP().phase === 'deal' && t.IMP().at < n - 1) { press('imp-show'); press('imp-hide'); }
  press('imp-show');
  await wait(PAST);
  tap('imp-hide');
  if (t.IMP().phase !== 'play') bad.push('the last Hide pressed on its own did not start play: "' + now() + '"');
  tap('imp-reveal');
  if (t.IMP().phase !== 'play') bad.push('a second tap straight after the last Hide pressed Reveal, and the imposter was named before anybody played');

  await wait(PAST);
  tap('imp-reveal');
  if (t.IMP().phase !== 'reveal') bad.push('Reveal pressed on its own did not reveal: "' + now() + '"');
  /* AND THE SECOND TAP OF A DOUBLE TAP ON REVEAL LANDS ON THE REVEAL'S OWN BUTTONS — Players, at 390 and 320, by the browser's touch adjustment § */
  tap('imp-players');
  if (t.IMP().phase !== 'reveal') bad.push('a second tap straight after Reveal pressed Players, and the reveal was gone before anybody saw it ("' + now() + '")');
  tap('imp-again');
  if (t.IMP().phase !== 'reveal') bad.push('a second tap straight after Reveal pressed the reveal\'s Deal, and the reveal was gone before anybody saw it ("' + now() + '")');

  /* THE REVEAL'S DEAL AND THE SETUP'S DEAL OVERLAP SHOW'S BOX TOO, so a second tap on either is a card
     shown to whoever dealt. (The reveal's was "Play again" until the 11 Oct trim, note 343.) */
  await wait(PAST);
  tap('imp-again');
  if (t.IMP().phase !== 'deal') bad.push('the reveal\'s Deal pressed on its own did not deal: "' + now() + '"');
  tap('imp-show');
  want('deal 1', "a second tap straight after the reveal's Deal pressed Show");

  /* AND A CARD THAT ARRIVED WITHOUT A PRESS TAKES THE FIRST TAP ON IT. § */
  await wait(PAST);
  press('imp-players');
  press('imp-start');
  tap('imp-show');
  want('deal 1 shown', 'a card drawn without a press refused the first tap on it — the guard timed the draw, not the last press');

  /* AND PLAYERS, TAPPED ON ITS OWN ON THE REVEAL, STILL GOES BACK TO THE SETUP SCREEN — the guard that
     swallows a second tap must not swallow the first. Walked to the reveal without a finger, then
     tapped past the gap. */
  press('imp-hide');
  while (t.IMP().phase === 'deal') { press('imp-show'); press('imp-hide'); }
  press('imp-reveal');
  await wait(PAST);
  tap('imp-players');
  if (t.IMP().phase !== 'idle') bad.push('Players tapped on its own on the reveal did not go back to the setup screen: "' + now() + '"');
  return bad;
});
/* ---------- SENTENCE SCRAMBLE: TAPPED IN ORDER IS RIGHT, AND EVERY STATED ORDER IS RIGHT § */
check('the sentence scramble marks the right order right, every stated order, and nothing else', async () => {
  const { w } = boot({ before: w => { try { w.localStorage.setItem('wg-game', 'ss'); } catch (e) {} } });  /* a game inside Word games (441) */
  await wait(300);
  const t = w.__t;
  if (!t.ss || !t.setSs || !t.SS_SENTENCES) return ['the sentence scramble is not exported'];
  try { t.findGroup('Games'); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(300);
  const d = w.document;
  if (!d.getElementById('ss-box')) return ['the sentence scramble did not draw on the Games column'];
  const bad = [];
  const press = (act, attrs) => {
    const el = d.createElement('button');
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    t.ACTIONS[act](el);
  };
  /* PRESS THE CHIPS THAT SPELL `words`, choosing an unused chip with that text each time — which is
     what a person does when two chips both say "the". */
  const build = words => {
    words.forEach(wd => {
      const s = t.ss();
      const i = s.chips.findIndex((c, k) => c === wd && s.picked.indexOf(k) === -1);
      if (i < 0) { bad.push('no unused chip says ' + JSON.stringify(wd)); return; }
      press('ss-word', { 'data-i': String(i) });
    });
  };
  const deal = entry => {
    const words = t.ssOrders(entry)[0];
    t.setSs({ band: 'KS2', entry: entry, chips: words.slice().reverse(), picked: [], verdict: '', said: '' });
    t.ssPaint();
  };
  let alts = 0;
  Object.keys(t.SS_SENTENCES).forEach(band => t.SS_SENTENCES[band].forEach(entry => {
    const orders = t.ssOrders(entry);
    if (!t.ssRight(entry, orders[0])) bad.push(JSON.stringify(orders[0].join(' ')) + ' is not marked right against itself');
    orders.forEach((o, k) => {
      if (!k) return;
      alts++;
      deal(entry);
      build(o);
      press('ss-check');
      if (t.ss().verdict !== 'right') {
        bad.push('the stated alternative ' + JSON.stringify(o.join(' ')) + ' was marked ' + JSON.stringify(t.ss().verdict));
      }
    });
  }));
  if (!alts) bad.push('no sentence states an alternative order, so that half was NOT checked');

  /* ONE SENTENCE, THE WHOLE WAY ROUND, on the card. */
  const entry = t.SS_SENTENCES.KS3[0];
  const right = t.ssOrders(entry)[0];
  deal(entry);
  const check = () => d.querySelector('#ss-box [data-do="ss-check"]');
  build(right.slice(0, 2));
  if (!check() || !check().disabled) bad.push('Check can be pressed with two of ' + right.length + ' words placed');
  const built = String((d.querySelector('#ss-box .ss-built') || {}).textContent || '');
  if (built.trim() !== right.slice(0, 2).join(' ')) bad.push('the strip reads "' + built.trim() + '" after two taps');
  /* A USED CHIP TAKES ITS WORD BACK. */
  const s0 = t.ss();
  press('ss-word', { 'data-i': String(s0.picked[1]) });
  if (t.ss().picked.length !== 1) bad.push('tapping a used chip does not take its word back out');
  build(right.slice(1));
  if (!check() || check().disabled) bad.push('Check is not pressable with every word placed');
  press('ss-check');
  if (t.ss().verdict !== 'right' || !d.querySelector('#ss-box .ss-built.is-right')
      || !d.querySelector('#ss-box [data-do="ss-next"]')) {
    bad.push('the right order was not marked right on the card');
  }
  press('ss-next');
  if (t.ss().picked.length || t.ss().verdict) bad.push('Next sentence does not start from an empty strip');

  /* AND A WRONG ORDER IS WRONG, and says how far it got. */
  deal(entry);
  const wrong = right.slice(0, 2).concat(right.slice(2).reverse());
  if (t.ssRight(entry, wrong)) bad.push('the wrong order used here is accidentally right — pick another sentence');
  build(wrong);
  press('ss-check');
  if (t.ss().verdict !== 'wrong') bad.push('a wrong order was marked ' + JSON.stringify(t.ss().verdict));
  if (!/first 2 words are right/.test(t.ss().said)) bad.push('a wrong order says "' + t.ss().said + '" rather than how far it got');

  /* A DEAL NEVER ARRIVES SOLVED. */
  for (let i = 0; i < 200; i++) {
    t.ssDeal('KS2');
    if (t.ssRight(t.ss().entry, t.ss().chips)) { bad.push('a deal arrived already in order: ' + t.ss().chips.join(' ')); break; }
  }
  return bad;
});

/* ---------- WORD SEARCH: EVERY WORD IS IN THE GRID, AND TWO TAPS FIND IT § */
check('the word search hides every word where it says, and two taps find it', async () => {
  const { w } = boot({ before: w => { try { w.localStorage.setItem('wg-game', 'ws'); } catch (e) {} } });  /* a game inside Word games (441) */
  await wait(300);
  const t = w.__t;
  if (!t.wsBuild || !t.WS_THEMES) return ['the word search is not exported'];
  try { t.findGroup('Games'); } catch (e) { return ['go("games") threw: ' + e.message]; }
  await wait(300);
  const d = w.document;
  if (!d.getElementById('ws-grid')) return ['the word search did not draw on the Games column'];
  const bad = [];
  const dirOf = (n, a, b) => [Math.sign((b % n) - (a % n)), Math.sign(((b / n) | 0) - ((a / n) | 0))];
  t.WS_THEMES.forEach(th => {
    for (let k = 0; k < 15; k++) {
      const p = t.wsBuild(th);
      if (!p) { bad.push(th.id + ': a puzzle could not be built'); return; }
      if (p.words.length !== th.n) bad.push(th.id + ': ' + p.words.length + ' words placed, wanted ' + th.n);
      if (t.wsRude(p.grid, p.size)) { bad.push(th.id + ': a grid spells a word the filter refuses'); return; }
      /* ONE WORD AT MOST ACROSS THE WHOLE GRID — the note in `wsBuild_` is why: without it a younger
         8x8 drew six eight-letter words as six whole rows, a list rather than a puzzle. */
      const full = p.words.filter(x => x.key.length === p.size).length;
      if (full > 1) bad.push(th.id + ': ' + full + ' words run the whole width of one grid');
      p.words.forEach(wd => {
        const read = wd.cells.map(c => p.grid[c]).join('');
        if (read !== wd.key) bad.push(th.id + ': ' + wd.word + ' reads "' + read + '" off its own cells');
        const [dx, dy] = dirOf(p.size, wd.cells[0], wd.cells[1]);
        const name = Object.keys(t.WS_DIRS).find(n => t.WS_DIRS[n][0] === dx && t.WS_DIRS[n][1] === dy);
        if (th.young && t.WS_FORWARD.indexOf(name) === -1) {
          bad.push(th.id + ' is for younger players and hid ' + wd.word + ' going ' + name);
        }
      });
    }
  });
  const press = i => {
    const el = d.createElement('button');
    el.setAttribute('data-i', String(i));
    t.ACTIONS['ws-cell'](el);
  };
  const th = t.WS_THEMES.find(x => !x.young);
  const p = t.wsBuild(th);
  t.setWs(p);
  t.wsPaint();
  /* NOT IN A LINE IS NOTHING FOUND, AND THE SECOND TAP IS THE NEW START. */
  const a = 0, b = p.size * 2 + 1;
  press(a); press(b);
  if (t.ws().words.some(x => x.found)) bad.push('two taps not in a line found a word');
  if (t.ws().sel !== b) bad.push('a second tap off the line does not become the new start');
  press(b);
  p.words.forEach((wd, i) => {
    const first = wd.cells[0], last = wd.cells[wd.cells.length - 1];
    if (i % 2) { press(last); press(first); } else { press(first); press(last); }
    if (!t.ws().words[i].found) bad.push(wd.word + ' was not found by tapping ' + (i % 2 ? 'its last then first' : 'its first then last') + ' letter');
  });
  const struck = d.querySelectorAll('#ws-words li.got s').length;
  if (struck !== p.words.length) bad.push(struck + ' of ' + p.words.length + ' found words are struck through in the list');
  const lit = d.querySelectorAll('#ws-grid .ws-c.got').length;
  const cells = new Set([].concat(...p.words.map(x => x.cells))).size;
  if (lit !== cells) bad.push(lit + ' cells are highlighted where the found words cover ' + cells);
  if (!/All \d+ found/.test(String((d.getElementById('ws-said') || {}).textContent || ''))) bad.push('finishing the puzzle does not say so');
  if (d.querySelector('#ws-grid .ws-c:not([disabled])')) bad.push('a finished grid can still be tapped');
  return bad;
});


/* ---------- WHAT A PLACEHOLDER MAY HOLD, ASKED ONE WAY OF EVERY PLACEHOLDER § */
const PLACEHOLDER_KEYS_ = 'button, [data-do], input, select, textarea, a[href], summary, details, label, '
  + '[tabindex], [onclick], [role], [contenteditable]';

/* ---------- THE WHITEBOARD SINCE 377: a maths notebook (board.js), driven here through its own listeners ---------- */
const nbFire_ = (w, el, type, x, y, id) => {
  const e = new w.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  Object.defineProperty(e, 'pointerId', { value: id || 1 });
  el.dispatchEvent(e);
};
/* ONE STROKE ON THE NOTEBOOK'S PAD. jsdom lays nothing out, so the pad is its 300 x 300 default and pad px are client px. */
const nbDraw_ = (w, root, pts, id) => {
  const pad = root.querySelector('.nb-pad');
  nbFire_(w, pad, 'pointerdown', pts[0][0], pts[0][1], id);
  pts.slice(1).forEach(p => nbFire_(w, pad, 'pointermove', p[0], p[1], id));
  nbFire_(w, pad, 'pointerup', pts[pts.length - 1][0], pts[pts.length - 1][1], id);
};
/* `n` FINGERS TAPPED TOGETHER ON THE PAD: two undo, three redo. */
const nbTapN_ = (w, root, n) => {
  const pad = root.querySelector('.nb-pad');
  for (let i = 1; i <= n; i++) nbFire_(w, pad, 'pointerdown', 60 + 40 * i, 120, 10 + i);
  for (let i = 1; i <= n; i++) nbFire_(w, pad, 'pointerup', 60 + 40 * i, 120, 10 + i);
};
const nbCount_ = (w, root) => { const el = root && root.querySelector('.nb'); return el ? w.nbState_(el.getAttribute('data-k')).items.length : 0; };
/* THE BOARD AS TOOLS DRAWS IT, in a host of the check's own: `initBoard_` fills every `.nb-box`, and `boardWhoChanged_` draws it again for whoever signs in. */
const nbEdge_ = w => {
  const host = w.document.createElement('div');
  host.className = 'nb-box';
  w.document.body.appendChild(host);
  w.initBoard_();
  return { host, key: () => { const el = host.querySelector('.nb'); return el ? el.getAttribute('data-k') : ''; },
           strokes: () => nbCount_(w, host), draw: pts => nbDraw_(w, host, pts) };
};
/* THE PEN ON A BLANK SHEET, which the pen's journeys below draw on: mounted in the whiteboard's slot, which holds the notebook since 377. */
async function penSheet_(w, d) {
  for (let i = 0; i < 100 && !d.querySelector('#s-stuff #wgt-whiteboard'); i++) await wait(100);
  const slot = d.querySelector('#s-stuff #wgt-whiteboard');
  if (!slot) return false;
  if (!slot.querySelector('.wb-box')) { const host = d.createElement('div'); host.className = 'wb-box'; slot.appendChild(host); }
  w.initWhiteboard();
  return true;
}

/* ---------- THE WHITEBOARD: WRITTEN ON, UNDONE BY TWO FINGERS, KEPT THROUGH A REPAINT, CLEARED -- AND NEVER AN ANSWER ---------- */
check('the whiteboard notebook draws, undoes, survives a repaint and clears under a board: key — and is never sent as an answer', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, A = t && t.ACTIONS, d = w.document, bad = [];
  if (!t || typeof w.initBoard_ !== 'function' || typeof w.nbState_ !== 'function' || typeof t.widgetsOf !== 'function' || typeof t.allWidgets !== 'function'
      || !A['nb-clear'] || typeof w.answersAdopt_ !== 'function' || typeof w.axisFree !== 'function') {
    return ['initBoard_, nbState_, the nb-clear handler, answersAdopt_ or axisFree are not reachable — the whiteboard was NOT checked'];
  }
  const tools = t.allWidgets().filter(x => x.kind === 'tool').map(x => String(x.id));
  /* THE LIBRARY CARDS ARE APPENDED AFTER IT (docs/history/339, its review) — the same rule kept: nothing above. */
  if (tools.slice(-3).join(' ') !== 'verse whiteboard libcards') bad.push('the whiteboard is not appended after the e-ink screen, with only the library cards after it: ' + tools.join(', '));
  const wb = t.allWidgets().find(x => x.id === 'whiteboard');
  if (!wb || !wb.solid || wb.name !== 'Whiteboard') bad.push('the whiteboard is not a solid tool called Whiteboard');

  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] };
  const kit = { name: 'Kit Other', personId: 'P8', role: 'student', roles: ['student'] };
  t.USER(sam);
  const roster = t.widgetsOf('tool').map(x => String(x.id));
  if (roster.slice(-2).join(' ') !== 'whiteboard libcards') bad.push('the whiteboard is not the last page but the library cards of a student\'s Tools column: ' + roster.join(', '));
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  t.findPage(roster.indexOf('whiteboard'), true);
  const slot = () => d.querySelector('#s-stuff #wgt-whiteboard');
  const nb = () => d.querySelector('#s-stuff #wgt-whiteboard .nb');
  for (let i = 0; i < 100 && !nb(); i++) await wait(100);
  await woken_();
  if (!nb()) return bad.concat(['the whiteboard did not draw a notebook on the Tools column']);
  const k = nb().getAttribute('data-k');
  if (k !== 'board:u:P9:whiteboard') bad.push('the board is kept under ' + JSON.stringify(k) + ', wanted "board:u:P9:whiteboard" — a `pad:` key is a question\'s answer');
  try { w.localStorage.removeItem(k); } catch (e) {}
  w.initBoard_();

  /* THE BAR: Picture and Clear, as tiles (the maths tiles went in 491) -- no padlock: the pad is always a pad, and the page lets a swipe through. */
  const bar = [...nb().querySelectorAll('.nb-bar [data-do]')].map(b => b.getAttribute('data-do') + (b.getAttribute('data-shape') ? ':' + b.getAttribute('data-shape') : '')).join(' ');
  if (bar !== 'nb-pic nb-clear') bad.push('the bar offers [' + bar + '], wanted Picture and Clear only (491: no maths tiles)');
  /* A PICTURE (402) COMES BACK FROM THE STORE AS IT WENT IN, moved keeps its size, and an older element beside it survives. */
  try {
    const el = { im: 1, i: 'p1', x: 56, y: 40, w: 800, h: 400, s: 'data:image/jpeg;base64,AAAA' };
    const it = w.nbItem_(el), mv = w.nbPicItem_(it, it.x + 10, it.y, it.w, it.h);
    if (!it.im || it.w !== 200 || it.h !== 100 || it.enc !== el) bad.push('a stored picture did not decode to a 200 by 100 picture item');
    if (mv.enc.x !== 96 || mv.enc.w !== 800 || mv.enc.s !== el.s) bad.push('a moved picture changed its size or its picture: ' + JSON.stringify(mv.enc));
  } catch (e) { bad.push('the picture item threw: ' + e.message); }
  if (!/Kept on this device only/.test((nb().querySelector('.nb-note') || {}).textContent || '')) bad.push('the note under the board does not say it is kept on this device');
  const padEl = () => nb().querySelector('.nb-pad'), bookEl = () => nb().querySelector('.nb-book');
  if (w.axisFree(padEl(), 'x', -1) || w.axisFree(padEl(), 'y', 1)) bad.push('the grid may take a drag that starts on the pad, so a stroke slides the column');
  if (!w.axisFree(bookEl(), 'x', -1)) bad.push('a swipe that starts on the page is refused the grid — an empty board eating the column\'s swipe, the notepad\'s fault');

  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
  nbDraw_(w, slot(), [[60, 150], [110, 165], [160, 180]]);
  let s = stored();
  if (s.length !== 1 || !s[0] || !Array.isArray(s[0].p) || nbCount_(w, slot()) !== 1) bad.push('a stroke on the pad stored ' + JSON.stringify(s).slice(0, 120) + ', wanted one stroke in the notebook\'s format');

  nbTapN_(w, slot(), 2);
  if (stored().length || nbCount_(w, slot())) bad.push('a two-finger tap left ' + stored().length + ' stroke(s) stored and ' + nbCount_(w, slot()) + ' drawn');
  nbTapN_(w, slot(), 3);
  if (stored().length !== 1) bad.push('a three-finger tap did not put the stroke back: ' + JSON.stringify(stored()).slice(0, 100));

  /* THE APP'S OWN REPAINT, which rebuilds the column and restarts its widgets. */
  try { t.repaint(); } catch (e) { bad.push('repaint threw: ' + e.message); }
  await wait(50);
  if (!nb()) return bad.concat(['the whiteboard was not drawn again after a repaint']);
  if (nbCount_(w, slot()) !== 1) bad.push('after a repaint the board shows ' + nbCount_(w, slot()) + ' mark(s), wanted the one kept');

  /* NEVER AN ANSWER: the backlog sweep is what sends every `pad:<who>:` on the device to the account. */
  w.answersAdopt_('P9', {});
  let dirty = [];
  try { dirty = JSON.parse(w.localStorage.getItem('ansDirty:u:P9') || '[]') || []; } catch (e) {}
  if (dirty.some(x => /whiteboard/.test(x))) bad.push('the answers sweep marked the board to be sent to the account as an answer: ' + JSON.stringify(dirty));
  const keys = []; for (let i = 0; i < w.localStorage.length; i++) keys.push(w.localStorage.key(i));
  if (keys.some(x => /^(ans|pad):/.test(x) && /whiteboard/.test(x))) bad.push('the board left a key an answer reader would take for a question: ' + keys.filter(x => /whiteboard/.test(x)).join(', '));

  /* SOMEBODY ELSE ON THE SAME PHONE GETS A BLANK BOARD, through the repaint a sign-in does. */
  t.USER(kit);
  try { t.repaint(); } catch (e) {}
  await wait(50);
  if (nb() && nbCount_(w, slot())) bad.push('a second person signed in on the phone sees the first one\'s board');
  t.USER(sam);
  try { t.repaint(); } catch (e) {}
  await wait(50);
  if (!nb() || nbCount_(w, slot()) !== 1) bad.push('signing back in does not bring the board back');

  /* CLEAR, AND TWO FINGERS PUT IT BACK. */
  A['nb-clear'](nb().querySelector('.nb-clear'));
  if (w.localStorage.getItem(k) !== null || nbCount_(w, slot())) bad.push('Clear left ' + stored().length + ' stroke(s) stored and ' + nbCount_(w, slot()) + ' drawn');
  nbTapN_(w, slot(), 2);
  if (stored().length !== 1) bad.push('two fingers straight after Clear did not put the board back: ' + JSON.stringify(stored()).slice(0, 100));

  try { w.localStorage.removeItem(k); } catch (e) {}
  return bad;
});

/* ---------- AND WHAT THE REVIEWS OF THE OLD BOARD FOUND, ASKED OF THE NOTEBOOK ---------- */
check('the whiteboard notebook keeps one finger to a stroke, is not cut by a repaint, owns up to a refused stroke, stops at its ceiling and leaves with whoever signs out', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (!t || typeof w.initBoard_ !== 'function' || typeof w.boardHold_ !== 'function' || typeof w.boardWhoChanged_ !== 'function'
      || typeof w.signedOut_ !== 'function' || typeof w.signedIn_ !== 'function' || !w.Storage) {
    return ['initBoard_, boardHold_, boardWhoChanged_ or signedOut_/signedIn_ are not reachable — the board was NOT checked'];
  }
  const toasts = [];
  const realToast = w.toast;
  w.toast = m => { toasts.push(String(m)); };
  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] };
  t.USER(sam);
  const roster = t.widgetsOf('tool').map(x => String(x.id));
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  t.findPage(roster.indexOf('whiteboard'), true);
  const slot = () => d.querySelector('#s-stuff #wgt-whiteboard');
  const nb = () => d.querySelector('#s-stuff #wgt-whiteboard .nb');
  for (let i = 0; i < 100 && !nb(); i++) await wait(100);
  await woken_();
  if (!nb()) { w.toast = realToast; return ['the whiteboard did not draw a notebook on the Tools column']; }
  const k = nb().getAttribute('data-k');
  try { w.localStorage.removeItem(k); } catch (e) {}
  w.initBoard_();
  const pad = () => nb().querySelector('.nb-pad');
  const fire = (type, px, py, id) => nbFire_(w, pad(), type, px, py, id);
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
  const count = () => nbCount_(w, slot());

  /* ONE FINGER: finger 1 draws 120px, then a palm lands, moves and lifts in the middle of it -- a hand settling, not a gesture. */
  fire('pointerdown', 50, 140, 1);
  fire('pointermove', 110, 140, 1);
  fire('pointermove', 170, 140, 1);
  fire('pointerdown', 280, 270, 2);
  fire('pointermove', 270, 260, 2);
  fire('pointermove', 230, 140, 1);
  fire('pointerup', 270, 260, 2);
  fire('pointermove', 290, 200, 1);
  fire('pointerup', 290, 200, 1);
  let s = stored();
  if (s.length !== 1 || count() !== 1) bad.push('a palm mid-stroke left ' + s.length + ' stroke(s) stored and ' + count() + ' drawn, wanted finger 1\'s one stroke');

  /* A REPAINT HALF WAY THROUGH A STROKE -- a payload landing, or the inbox reply after every load. */
  fire('pointerdown', 50, 200, 1);
  fire('pointermove', 100, 205, 1);
  const was = nb();
  if (!w.boardHold_('stuff')) bad.push('a finger on the board does not hold the Tools column against a repaint');
  const realStart = w.toolsStart_, restarted = [];
  w.toolsStart_ = function (kind) { restarted.push(kind); return realStart.apply(this, arguments); };
  try { t.repaint(); } catch (e) { bad.push('repaint threw: ' + e.message); }
  finally { w.toolsStart_ = realStart; }
  if (restarted.indexOf('tool') !== -1) bad.push('a repaint half way through a stroke restarted every widget on the Tools column under the finger');
  if (nb() !== was) bad.push('a repaint replaced the board under a stroke being drawn — the rest of the stroke goes into a detached copy');
  fire('pointermove', 200, 215, 1);
  fire('pointerup', 200, 215, 1);
  if (stored().length !== 2 || count() !== 2) bad.push('the stroke a repaint landed in was not kept: ' + stored().length + ' stored');

  /* A STROKE THE DEVICE REFUSED: held for the visit, drawn, and said. */
  const S = w.Storage.prototype, realSet = S.setItem;
  const refuse = () => { S.setItem = function (key, v) {
    if (key === k) { const e = new Error('the quota has been exceeded'); e.name = 'QuotaExceededError'; throw e; }
    return realSet.call(this, key, v);
  }; };
  const note = () => ((nb().querySelector('.nb-note') || {}).textContent || '').trim();
  const held = () => { try { return JSON.parse(w.ansValue_(k) || '[]'); } catch (e) { return []; } };
  const n0 = stored().length;
  toasts.length = 0;
  refuse();
  try { nbDraw_(w, slot(), [[60, 250], [130, 255], [200, 260]]); } finally { S.setItem = realSet; }
  if (stored().length !== n0) bad.push('the refused write was NOT set up: the device holds ' + stored().length + ' stroke(s), wanted ' + n0);
  if (count() !== n0 + 1 || held().length !== n0 + 1) bad.push('a stroke the device refused is not held and drawn: ' + count() + ' drawn, ' + held().length + ' held for the visit, wanted ' + (n0 + 1));
  if (note() !== 'Not saved — this browser is not keeping it.') bad.push('under a stroke the device refused the board says ' + JSON.stringify(note()));
  if (!toasts.some(m => /not saving/i.test(m))) bad.push('nothing said the device refused the stroke (toasts: ' + JSON.stringify(toasts) + ')');
  nbDraw_(w, slot(), [[60, 280], [130, 285], [200, 290]]);
  if (stored().length !== n0 + 2 || count() !== n0 + 2) bad.push('with room again the board stores ' + stored().length + ' and draws ' + count() + ', wanted ' + (n0 + 2));
  if (!/Kept on this device only/.test(note())) bad.push('with every stroke stored again the board still says ' + JSON.stringify(note()));

  /* AND ONE PAST THE BOARD'S CEILING: a board already holding more than it may (the pen's old format, 26,000 numbers). */
  const big = []; for (let i = 0; i < 26000; i++) big.push(i % 340, (i * 7) % 340);
  w.localStorage.setItem(k, JSON.stringify([big]));
  w.initBoard_();
  toasts.length = 0;
  nbDraw_(w, slot(), [[60, 250], [130, 255], [200, 260]]);
  if (stored().length !== 1 || count() !== 1) bad.push('a stroke past the board\'s ceiling was kept or left drawn: ' + stored().length + ' stored, ' + count() + ' drawn');
  if (!toasts.some(m => /board is full/i.test(m))) bad.push('nothing said the board is full (toasts: ' + JSON.stringify(toasts) + ')');
  /* AND A BOARD FROM BEFORE 377 IS DRAWN AND KEPT AS IT WAS. */
  w.ansStore_(k, JSON.stringify([[34, 34, 306, 306]]));
  w.initBoard_();
  if (count() !== 1) bad.push('a board in the pen\'s old format draws ' + count() + ' stroke(s), wanted its one');

  /* A SIGN-OUT FROM ANOTHER COLUMN: Tools is left STALE by its repaint, and its board must not be Sam's. */
  t.go('feed', false, true);
  await wait(LEAVE_MS); await woken_();
  try { w.signedOut_(); } catch (e) { bad.push('signedOut_ threw: ' + e.message); }
  await wait(50);
  if (!nb()) bad.push('after the sign-out there is no board on the Tools column at all');
  else {
    if (nb().getAttribute('data-k') !== 'board:whiteboard') bad.push('after a sign-out the stale Tools column still holds the board keyed ' + JSON.stringify(nb().getAttribute('data-k')) + ' — the last person\'s, on the shared iPad');
    if (count()) bad.push('after a sign-out the last person\'s marks are still drawn on the Tools column');
  }
  try { w.signedIn_(Object.assign({ token: 't-sam' }, sam)); } catch (e) { bad.push('signedIn_ threw: ' + e.message); }
  await wait(50);
  if (!nb() || nb().getAttribute('data-k') !== k || count() !== 1) {
    bad.push('after signing back in the stale Tools column shows ' + (nb() ? JSON.stringify(nb().getAttribute('data-k')) + ' with ' + count() + ' mark(s)' : 'no board') + ', wanted Sam\'s board and its one stroke');
  }
  w.toast = realToast;
  try { w.localStorage.removeItem(k); w.localStorage.removeItem('board:whiteboard'); } catch (e) {}
  t.USER(null);
  return bad;
});

/* ---------- THE FINGER PEN: TWO FINGERS, A PALM OR A THUMB LEAVE NOTHING (338) § */
const penEv_ = (w, el, type, o) => {
  const e = new w.MouseEvent(type, { bubbles: true, cancelable: true, clientX: o.x, clientY: o.y });
  const put = (n, v) => Object.defineProperty(e, n, { value: v });
  put('pointerId', o.id);
  put('pointerType', o.type === undefined ? 'touch' : o.type);
  put('isPrimary', !!o.prim);
  if (o.t !== undefined) put('timeStamp', o.t);
  put('width', o.size || 16); put('height', o.size || 16);
  if (o.co) put('getCoalescedEvents', () => o.co);
  el.dispatchEvent(e);
  return e;
};
/* EVERY STORED VALUE IS A LIST OF LISTS OF WHOLE NUMBERS -- the format every device and account holds. */
const penWhole_ = all => Array.isArray(all) && all.every(st => Array.isArray(st) && st.length % 2 === 0
  && st.every(v => typeof v === 'number' && Number.isInteger(v)));

check('the finger pen: on a question\'s pad a two-finger tap, pan or pinch, a third finger or a palm leave nothing, a palm that lands first does not take the finger\'s line, and a cancel keeps only a real line', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (!t || typeof t.padWrap !== 'function' || typeof t.padKey !== 'function' || typeof t.padOn !== 'function'
      || typeof w.padBusy_ !== 'function' || typeof w.padDrop_ !== 'function' || typeof t.padTouch !== 'function' || !t.padTouch()) {
    return ['padWrap_, padKey_, padBusy_, padDrop_ or PAD_TOUCH are not reachable — the finger pen was NOT checked'];
  }
  const x = { kind: 'question', answerType: 'drawing', html: '<p>Draw it.</p>', key: 'q:Q-FINGER-1' };
  const k = t.padKey(x);
  const host = d.createElement('div');
  d.body.appendChild(host);
  /* (100, 50) to (440, 220) on the screen: x units = px - 100, y units = (py - 50) * 2. */
  const L = 100, T = 50, W = 340, H = 170;
  const ink = () => host.querySelector('.qpad-ink');
  const fresh = () => {
    w.padDrop_();
    try { w.localStorage.removeItem(k); } catch (e) {}
    t.padOn(k);
    host.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 170"></svg>', '');
    ink().getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
  };
  const fire = (type, id, px, py, ts, o) => penEv_(w, ink(), type, Object.assign({ id: id, x: px, y: py, t: ts }, o || {}));
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  const clean = (what, want) => {
    const s = stored();
    if (JSON.stringify(s) !== JSON.stringify(want)) bad.push(what + ': stored ' + JSON.stringify(s).slice(0, 160) + ', wanted ' + JSON.stringify(want).slice(0, 160));
    if (!penWhole_(s)) bad.push(what + ': the store holds something that is not a list of lists of whole numbers: ' + JSON.stringify(s).slice(0, 80));
    const paths = host.querySelectorAll('.qpad-g path').length;
    if (paths !== s.length) bad.push(what + ': ' + paths + ' path(s) drawn for ' + s.length + ' stored');
    if (host.querySelector('[data-live]')) bad.push(what + ': a live preview was left on the picture');
    if ((host.querySelector('.qpad-aid') || {}).innerHTML) bad.push(what + ': the aid was left on the picture');
    if (w.padBusy_()) bad.push(what + ': padBusy_ still says a finger is on the drawing, so the column could never be swiped off it');
    if (t.padTouch().size) bad.push(what + ': ' + t.padTouch().size + ' contact(s) left behind after every finger lifted');
  };
  /* A LINE OF n STEPS from (x0, y0) by (dx, dy) a step, every `dt` ms from `t0`, as one finger's moves. */
  const line = (id, x0, y0, dx, dy, n, t0, dt) => { for (let i = 1; i <= n; i++) fire('pointermove', id, x0 + dx * i, y0 + dy * i, t0 + dt * i); };
  /* AND TWO FINGERS MOVING TOGETHER, each frame's moves one after the other, as the platform sends them. */
  const both = (a, b, n, t0, dt) => {
    for (let i = 1; i <= n; i++) {
      fire('pointermove', a.id, a.x + a.dx * i, a.y + a.dy * i, t0 + dt * i);
      fire('pointermove', b.id, b.x + b.dx * i, b.y + b.dy * i, t0 + dt * i);
    }
  };
  /* IN UNITS BY THE PEN'S OWN ARITHMETIC (`padMap_`), so a half is rounded the way the pen rounds it. */
  const units = (pts) => [].concat(...pts.map(p => [Math.round((p[0] - L) / W * 340), Math.round((p[1] - T) / H * 340)]));

  /* P2: A TWO-FINGER TAP, 40ms apart, both still, lifted in either order. */
  for (const first of [1, 2]) {
    fresh();
    fire('pointerdown', 1, 150, 100, 1000, { prim: true });
    fire('pointerdown', 2, 250, 110, 1040);
    if (host.querySelector('[data-live]')) bad.push('a second finger 40ms after the first left the first one\'s dot showing');
    fire('pointerup', first, first === 1 ? 150 : 250, 100, 1100);
    fire('pointerup', 3 - first, first === 1 ? 250 : 150, 110, 1110);
    clean('a two-finger tap, finger ' + first + ' lifted first', []);
  }
  /* P3: A TWO-FINGER PAN, 40ms apart, 150px up together -- in 5px steps, and in 15px steps (several samples
     folded into one event, finger 1's arriving before finger 2's of the same frame). */
  for (const step of [5, 15]) {
    fresh();
    fire('pointerdown', 1, 150, 210, 1000, { prim: true });
    fire('pointerdown', 2, 230, 212, 1040);
    both({ id: 1, x: 150, y: 210, dx: 0, dy: -step }, { id: 2, x: 230, y: 212, dx: 0, dy: -step }, 150 / step, 1040, 8);
    fire('pointerup', 1, 150, 60, 1300); fire('pointerup', 2, 230, 62, 1302);
    clean('a two-finger pan in ' + step + 'px steps', []);
  }
  /* P4: A PINCH, then one finger lifts and the other drags on 100px. */
  fresh();
  fire('pointerdown', 1, 200, 135, 1000, { prim: true });
  fire('pointerdown', 2, 260, 135, 1040);
  both({ id: 1, x: 200, y: 135, dx: -4, dy: 0 }, { id: 2, x: 260, y: 135, dx: 4, dy: 0 }, 10, 1040, 8);
  fire('pointerup', 1, 160, 135, 1200);
  line(2, 300, 135, 5, 0, 20, 1200, 8);
  fire('pointerup', 2, 400, 135, 1400);
  clean('a pinch, then the other finger dragged on', []);
  /* P5: A THIRD FINGER while the first two are held. */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  fire('pointerdown', 2, 300, 100, 1040);
  fire('pointerdown', 3, 220, 180, 1060);
  line(1, 150, 100, 3, 0, 5, 1060, 8);
  fire('pointerup', 3, 220, 180, 1120); fire('pointerup', 2, 300, 100, 1125); fire('pointerup', 1, 165, 100, 1130);
  clean('a third finger while two were held', []);
  /* P6: A PALM FIRST (its size unknown), the fingertip 40ms later drawing 4.5px a step, the palm trembling
     by a pixel: exactly the finger's line, from its own first point, and nothing of the palm. */
  fresh();
  fire('pointerdown', 1, 380, 190, 1000, { prim: true, size: 1 });
  fire('pointerdown', 2, 150, 80, 1040);
  const finger = [[150, 80]];
  for (let i = 1; i <= 30; i++) {
    finger.push([150 + 4.5 * i, 80 + 2 * i]);
    fire('pointermove', 2, 150 + 4.5 * i, 80 + 2 * i, 1040 + 8 * i);
    fire('pointermove', 1, 380 + ((i % 3) - 1) * 1.2, 190 + ((i + 1) % 3) * 0.4, 1040 + 8 * i, { size: 1 });
  }
  fire('pointerup', 2, 285, 140, 1300);
  fire('pointerup', 1, 380, 190, 1320);
  clean('a palm first and then the finger', [units(finger)]);
  /* P7: A FINGER HELD STILL 300ms, A PALM LANDS ON THE INK, the finger draws 100px, the palm lifts: § */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  fire('pointerdown', 2, 380, 190, 1300);
  if (host.querySelector('[data-live]')) bad.push('a palm landing beside a finger held still left the finger\'s dot showing — it is not yet known which is the finger');
  const held = [[150, 100]];
  for (let i = 1; i <= 10; i++) { held.push([150 + 2 * i, 100]); fire('pointermove', 1, 150 + 2 * i, 100, 1300 + 8 * i); }
  await wait(5);
  if (!host.querySelector('[data-live]')) bad.push('the finger moved 20px with the palm still and its line did not come back within a frame');
  for (let i = 11; i <= 50; i++) { held.push([150 + 2 * i, 100]); fire('pointermove', 1, 150 + 2 * i, 100, 1300 + 8 * i); }
  fire('pointerup', 2, 380, 190, 1800);
  fire('pointerup', 1, 250, 100, 1810);
  clean('a finger held still, then a palm, then the line', [units(held)]);
  /* P8: A BRUSH -- a still touch 80px away at +60ms, lifted while the finger draws on: one stroke, every
     sample. */
  fresh();
  const brush = [[150, 100]];
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  for (let i = 1; i <= 50; i++) {
    if (i === 8) fire('pointerdown', 2, 230, 100, 1060);
    if (i === 13) fire('pointerup', 2, 230, 100, 1100);
    brush.push([150 + 2 * i, 100]);
    fire('pointermove', 1, 150 + 2 * i, 100, 1000 + 8 * i);
  }
  fire('pointerup', 1, 250, 100, 1410);
  clean('a brush of another finger while drawing', [units(brush)]);
  /* P9: A STAGGERED PAN -- the second finger 150ms after the first has gone 30px, and 300ms after with the
     first still. */
  fresh();
  fire('pointerdown', 1, 150, 200, 1000, { prim: true });
  line(1, 150, 200, 0, -2, 15, 1000, 10);
  fire('pointerdown', 2, 250, 200, 1150);
  both({ id: 1, x: 150, y: 170, dx: 0, dy: -5 }, { id: 2, x: 250, y: 200, dx: 0, dy: -5 }, 20, 1150, 8);
  fire('pointerup', 1, 150, 70, 1400); fire('pointerup', 2, 250, 100, 1402);
  clean('a pan whose second finger came 150ms late', []);
  fresh();
  fire('pointerdown', 1, 150, 200, 1000, { prim: true });
  fire('pointerdown', 2, 250, 200, 1300);
  both({ id: 1, x: 150, y: 200, dx: 0, dy: -5 }, { id: 2, x: 250, y: 200, dx: 0, dy: -5 }, 20, 1300, 8);
  fire('pointerup', 1, 150, 100, 1500); fire('pointerup', 2, 250, 100, 1502);
  clean('a pan whose second finger came 300ms after a still first', []);
  /* P10: A THUMB AND AN INDEX FINGER PINCHING, sizes 24 and 16. */
  fresh();
  fire('pointerdown', 1, 200, 135, 1000, { prim: true, size: 24 });
  fire('pointerdown', 2, 260, 135, 1040, { size: 16 });
  for (let i = 1; i <= 15; i++) {
    fire('pointermove', 1, 200 - 4 * i, 135, 1040 + 8 * i, { size: 24 });
    fire('pointermove', 2, 260 + 4 * i, 135, 1040 + 8 * i, { size: 16 });
  }
  fire('pointerup', 1, 140, 135, 1200); fire('pointerup', 2, 320, 135, 1202);
  clean('a thumb-and-finger pinch', []);
  /* P12: A CANCEL 50ms IN (a system gesture, the platform's own palm rejection) withdraws; A CANCEL AFTER
     500ms AND 200px of a real line keeps it, every sample. */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  line(1, 150, 100, 5, 0, 6, 1000, 8);
  fire('pointercancel', 1, 180, 100, 1050);
  clean('a cancel 50ms into a stroke', []);
  fresh();
  const real = [[110, 60]];
  fire('pointerdown', 1, 110, 60, 2000, { prim: true });
  for (let i = 1; i <= 50; i++) { real.push([110 + 4 * i, 60 + 2 * i]); fire('pointermove', 1, 110 + 4 * i, 60 + 2 * i, 2000 + 10 * i); }
  fire('pointercancel', 1, 310, 160, 2500);
  clean('a cancel after 500ms and 200px', [units(real)]);
  /* P13: TWO FINGERS WITH ONE LIFT NEVER SENT, then a touch the platform calls primary -- nothing else is
     down -- draws its line. */
  fresh();
  fire('pointerdown', 1, 150, 100, 1000, { prim: true });
  fire('pointerdown', 2, 250, 100, 1040);
  both({ id: 1, x: 150, y: 100, dx: 5, dy: 0 }, { id: 2, x: 250, y: 100, dx: 5, dy: 0 }, 6, 1040, 8);
  fire('pointerup', 1, 180, 100, 1200);
  const after = [[120, 150]];
  fire('pointerdown', 3, 120, 150, 3000, { prim: true });
  for (let i = 1; i <= 10; i++) { after.push([120 + 3 * i, 150]); fire('pointermove', 3, 120 + 3 * i, 150, 3000 + 8 * i); }
  fire('pointerup', 3, 150, 150, 3100);
  clean('a primary touch after a lost lift', [units(after)]);

  w.padDrop_();
  t.padOn('');
  try { w.localStorage.removeItem(k); } catch (e) {}
  host.remove();
  return bad;
});

check('the finger pen on the whiteboard: a hand resting on the card never moves the column under a stroke, a repaint does not cut a held stroke, Undo and Clear wait for the drawing hand, a change of person puts it all down', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, A = t && t.ACTIONS, d = w.document, bad = [];
  if (!t || typeof w.initWhiteboard !== 'function' || typeof w.padBusy_ !== 'function' || typeof w.padDrop_ !== 'function'
      || typeof w.padHold_ !== 'function' || typeof w.padWhoChanged_ !== 'function' || typeof t.swipe !== 'function' || !t.swipe()
      || typeof t.padTouch !== 'function' || !t.padTouch() || !A['pad-undo'] || !A['pad-clear']) {
    return ['the board, padBusy_, padDrop_, padHold_, padWhoChanged_, SWIPE or PAD_TOUCH is not reachable — the finger pen on the board was NOT checked'];
  }
  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] };
  t.USER(sam);
  const roster = t.widgetsOf('tool').map(x => String(x.id));
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  t.findPage(roster.indexOf('whiteboard'), true);
  const pad = () => d.querySelector('#s-stuff #wgt-whiteboard .qpad');
  await penSheet_(w, d);
  for (let i = 0; i < 100 && !pad(); i++) await wait(100);
  await woken_();
  if (!pad()) return ['the whiteboard did not draw a pad on the Tools column'];
  const k = pad().getAttribute('data-k');
  const page0 = t.PAGE.stuff;
  /* THE BOARD AT (20, 100), 300 x 400 -- note 310's. */
  const L = 20, T = 100, W = 300, H = 400;
  const ink = () => pad().querySelector('.qpad-ink');
  const fix = () => { ink().getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T }); };
  const fresh = () => { w.padDrop_(); try { w.localStorage.removeItem(k); } catch (e) {} t.padOn(k); w.initWhiteboard(); fix(); };
  const fire = (type, id, px, py, ts, o) => penEv_(w, (o && o.on) || ink(), type, Object.assign({ id: id, x: px, y: py, t: ts }, o || {}));
  /* OFF THE INK: the note under the board, where a hand holding the card rests. */
  const card = () => pad().querySelector('.qpad-note');
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  const paths = () => pad().querySelectorAll('.qpad-g path').length;
  const still = (what) => {
    if (t.screenAt() !== 'stuff' || t.PAGE.stuff !== page0) bad.push(what + ': the column or page moved — now ' + t.screenAt() + ' page ' + t.PAGE.stuff);
    if (t.padNow() !== k) bad.push(what + ': the board is no longer armed');
  };
  const clean = (what, want) => {
    const s = stored();
    if (JSON.stringify(s) !== JSON.stringify(want)) bad.push(what + ': stored ' + JSON.stringify(s).slice(0, 160) + ', wanted ' + JSON.stringify(want));
    if (!penWhole_(s)) bad.push(what + ': the store holds something that is not a list of lists of whole numbers');
    if (paths() !== s.length) bad.push(what + ': ' + paths() + ' path(s) drawn for ' + s.length + ' stored');
    if (pad().querySelector('[data-live]')) bad.push(what + ': a live preview was left on the board');
    if (w.padBusy_()) bad.push(what + ': padBusy_ still says a finger is on the board');
    if (t.padTouch().size) bad.push(what + ': ' + t.padTouch().size + ' contact(s) left behind');
  };
  fresh();
  if (!pad().classList.contains('is-drawing')) return ['setup: the board did not arm, so the finger pen on it was NOT checked'];

  /* P11, TIMED: note 310's palm, landing 350ms into a line that has gone 120px, 150px from the finger -- an established stroke, so the palm is a rest and the line § */
  fire('pointerdown', 1, 50, 140, 1000, { prim: true });
  fire('pointermove', 1, 170, 140, 1300);
  fire('pointerdown', 2, 260, 260, 1350);
  fire('pointermove', 2, 255, 255, 1360);
  fire('pointermove', 1, 290, 140, 1400);
  fire('pointerup', 2, 255, 255, 1410);
  fire('pointermove', 1, 290, 300, 1450);
  fire('pointerup', 1, 290, 300, 1460);
  clean('a palm 350ms into an established line', [[34, 34, 306, 34, 306, 170]]);

  /* P14: A HAND ON THE CARD FIRST (primary), A FINGER ON THE INK 40ms LATER, BOTH MOVE: two fingers, so
     nothing -- and the hand, the pointer the grid follows, does not take the column. */
  fresh();
  fire('pointerdown', 1, 170, 560, 1000, { prim: true, on: card() });
  fire('pointerdown', 2, 150, 300, 1040);
  for (let i = 1; i <= 8; i++) {
    fire('pointermove', 1, 170 + 5 * i, 560, 1040 + 8 * i, { on: card() });
    fire('pointermove', 2, 150 + 5 * i, 300, 1040 + 8 * i);
  }
  if (t.swipe().live || t.swipe().axis) bad.push('a hand on the card and a finger on the board moving together: the swipe engine took the hand (' + JSON.stringify({ live: t.swipe().live, axis: t.swipe().axis }) + ')');
  fire('pointerup', 2, 190, 300, 1200); fire('pointerup', 1, 210, 560, 1210, { on: card() });
  clean('a hand on the card and a finger on the board moving together', []);
  still('a hand on the card and a finger on the board moving together');

  /* P15: THE HAND DOWN FOR A SECOND, A FINGER DRAWS, THEN THE HAND DRIFTS 30px SIDEWAYS: the line, and the
     column stays where it is. */
  fresh();
  fire('pointerdown', 1, 170, 560, 1000, { prim: true, on: card() });
  fire('pointerdown', 2, 60, 200, 2000);
  for (let i = 1; i <= 25; i++) fire('pointermove', 2, 60 + 4 * i, 200, 2000 + 8 * i);
  await wait(5);
  for (let i = 1; i <= 10; i++) fire('pointermove', 1, 170 + 3 * i, 560, 2300 + 8 * i, { on: card() });
  if (t.swipe().live || t.swipe().axis) bad.push('a hand drifting 30px on the card while a finger drew: the swipe engine took it (' + JSON.stringify({ live: t.swipe().live, axis: t.swipe().axis }) + ')');
  fire('pointerup', 2, 160, 200, 2400); fire('pointerup', 1, 200, 560, 2410, { on: card() });
  clean('a hand resting a second, then drifting while the finger drew', [[45, 85, 159, 85]]);
  still('a hand resting a second, then drifting while the finger drew');

  /* P16: THE HAND STILL FOR A SECOND, A FINGER LANDS, BOTH MOVE 30px: a two-finger gesture begun with a
     finger already down -- nothing. */
  fresh();
  fire('pointerdown', 1, 170, 560, 1000, { prim: true, on: card() });
  fire('pointerdown', 2, 100, 200, 2000);
  for (let i = 1; i <= 6; i++) {
    fire('pointermove', 2, 100 + 5 * i, 200, 2000 + 8 * i);
    fire('pointermove', 1, 170 + 5 * i, 560, 2000 + 8 * i, { on: card() });
  }
  fire('pointerup', 2, 130, 200, 2100); fire('pointerup', 1, 200, 560, 2110, { on: card() });
  clean('a hand already down and a finger moving together', []);
  still('a hand already down and a finger moving together');

  /* P17: A REPAINT WHILE A STROKE IS HELD, then the finger moves on: the column is held (`padHold_`), the
     board under the finger is the same one, and the whole line is kept. */
  fresh();
  fire('pointerdown', 1, 50, 140, 1000, { prim: true });
  fire('pointerdown', 2, 280, 470, 1040);
  const was = ink();
  if (!w.padHold_('stuff')) bad.push('a stroke held by a second finger does not hold the Tools column against a repaint');
  try { t.repaint(); } catch (e) { bad.push('repaint threw: ' + e.message); }
  await wait(50);
  if (ink() !== was) { bad.push('a repaint replaced the board under a held stroke'); fix(); }
  for (let i = 1; i <= 12; i++) fire('pointermove', 1, 50 + 10 * i, 140, 1040 + 8 * i);
  fire('pointerup', 2, 280, 470, 1200);
  fire('pointerup', 1, 170, 140, 1210);
  clean('a repaint while a stroke was held', [[34, 34, 170, 34]]);

  /* P18: UNDO AND CLEAR PRESSED WHILE A FINGER IS ON THE BOARD -- a palm on the bar -- do nothing, and the
     stroke under the finger is kept and drawn. */
  fresh();
  fire('pointerdown', 1, 50, 140, 1000, { prim: true });
  fire('pointermove', 1, 290, 460, 1100);
  fire('pointerup', 1, 290, 460, 1110);
  fire('pointerdown', 1, 50, 300, 2000, { prim: true });
  fire('pointermove', 1, 150, 300, 2100);
  A['pad-undo'](pad().querySelector('.qpad-undo'));
  A['pad-clear'](pad().querySelector('.qpad-clear'));
  fire('pointermove', 1, 250, 300, 2200);
  fire('pointerup', 1, 250, 300, 2210);
  clean('Undo and Clear pressed while a finger drew', [[34, 34, 306, 306], [34, 170, 261, 170]]);
  /* AND ONCE THE HAND HAS LIFTED, they work again. */
  A['pad-undo'](pad().querySelector('.qpad-undo'));
  if (stored().length !== 1) bad.push('Undo after the drawing hand lifted did nothing: ' + JSON.stringify(stored()));

  /* P19: A CHANGE OF PERSON WHILE A STROKE IS HELD puts everything down, and stores nothing. */
  fresh();
  fire('pointerdown', 1, 50, 140, 1000, { prim: true });
  fire('pointerdown', 2, 280, 470, 1040);
  w.padWhoChanged_();
  fire('pointerup', 1, 50, 140, 1100);
  fire('pointerup', 2, 280, 470, 1110);
  if (pad().querySelector('[data-live]')) bad.push('a change of person under a held stroke left its preview');
  if (w.padBusy_() || t.padTouch().size) bad.push('a change of person under a held stroke left the pen holding contacts');
  if (stored().length) bad.push('a change of person under a held stroke stored ' + JSON.stringify(stored()));

  w.padDrop_();
  t.padOn('');
  try { w.localStorage.removeItem(k); } catch (e) {}
  t.USER(null);
  return bad;
});

/* ---------- THE FINGER PEN, AFTER REVIEW: A HAND THAT STAYS, A HAND THAT SETTLES, A PIN, A LATE REPORT, ANOTHER KIND § */
check('the finger pen on the whiteboard after review: a hand left down after two fingers, a thumb or palm that settles, a held pin, a late report and a pointer of another kind all leave the line that was meant, and Undo takes off one stroke without redrawing the rest', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, A = t && t.ACTIONS, d = w.document, bad = [];
  if (!t || typeof w.initWhiteboard !== 'function' || typeof w.padBusy_ !== 'function' || typeof w.padDrop_ !== 'function'
      || typeof t.padTouch !== 'function' || !t.padTouch() || typeof t.padWrap !== 'function' || typeof t.padKey !== 'function'
      || !A['pad-undo'] || !A['qt-inst'] || typeof w.padSegs_ !== 'function') {
    return ['the board, padBusy_, padDrop_, PAD_TOUCH, padWrap_, padSegs_ or the pad-undo / qt-inst handlers are not reachable — the review\'s cases were NOT checked'];
  }
  t.USER({ name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] });
  const roster = t.widgetsOf('tool').map(x => String(x.id));
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  t.findPage(roster.indexOf('whiteboard'), true);
  const pad = () => d.querySelector('#s-stuff #wgt-whiteboard .qpad');
  await penSheet_(w, d);
  for (let i = 0; i < 100 && !pad(); i++) await wait(100);
  await woken_();
  if (!pad()) return ['the whiteboard did not draw a pad on the Tools column'];
  const bk = pad().getAttribute('data-k');

  /* ==================== ON THE BOARD, AT (20, 100), 300 x 400 -- note 310's ==================== */
  const BL = 20, BT = 100, BW = 300, BH = 400;
  const bink = () => pad().querySelector('.qpad-ink');
  const bfix = () => { bink().getBoundingClientRect = () => ({ left: BL, top: BT, width: BW, height: BH, right: BL + BW, bottom: BT + BH, x: BL, y: BT }); };
  const bfresh = () => { w.padDrop_(); try { w.localStorage.removeItem(bk); } catch (e) {} t.padOn(bk); w.initWhiteboard(); bfix(); };
  const card = () => pad().querySelector('.qpad-note');
  const bfire = (type, id, px, py, ts, o) => penEv_(w, (o && o.on) || bink(), type, Object.assign({ id: id, x: px, y: py, t: ts }, o || {}));
  const bstored = () => { try { return JSON.parse(w.localStorage.getItem(bk) || '[]'); } catch (e) { return ['unreadable']; } };
  /* WHAT THE PEN STORES FOR A TRACK, by its own arithmetic: each point in units, a repeat of the one before dropped. The
     board thins at one unit, and a straight track thins to its two ends. */
  const btrack = pts => { const o = []; pts.forEach(p => { const x = Math.round((p[0] - BL) / BW * 340), y = Math.round((p[1] - BT) / BH * 340);
    if (o.length && o[o.length - 2] === x && o[o.length - 1] === y) return; o.push(x, y); }); return typeof w.ansSimplify_ === 'function' ? w.ansSimplify_(o, 1) : o; };
  const bclean = (what, want) => {
    const s = bstored();
    if (JSON.stringify(s) !== JSON.stringify(want)) bad.push(what + ': stored ' + JSON.stringify(s).slice(0, 160) + ', wanted ' + JSON.stringify(want).slice(0, 160));
    if (!penWhole_(s)) bad.push(what + ': the store holds something that is not a list of lists of whole numbers');
    if (pad().querySelectorAll('.qpad-g path').length !== s.length) bad.push(what + ': ' + pad().querySelectorAll('.qpad-g path').length + ' path(s) drawn for ' + s.length + ' stored');
    if (pad().querySelector('[data-live]')) bad.push(what + ': a live preview was left on the board');
    if (w.padBusy_()) bad.push(what + ': padBusy_ still says a finger is on the board');
    if (t.padTouch().size) bad.push(what + ': ' + t.padTouch().size + ' contact(s) left behind');
  };
  /* A LINE ACROSS THE BOARD at 300px/s -- 2.4px every 8ms, a child's steady stroke -- from (x0, y), `n` steps, with a FRAME every fourth step: § */
  const bline = async (id, x0, y, n, t0, also) => {
    const pts = [[x0, y]];
    bfire('pointerdown', id, x0, y, t0);
    for (let i = 1; i <= n; i++) {
      pts.push([x0 + 2.4 * i, y]); bfire('pointermove', id, x0 + 2.4 * i, y, t0 + 8 * i); if (also) also(i, t0 + 8 * i);
      if (!(i % 4)) await wait(1);
    }
    bfire('pointerup', id, x0 + 2.4 * n, y, t0 + 8 * n + 4);
    return pts;
  };

  /* A HAND LEFT DOWN AFTER TWO FINGERS (the review's case, as note 338's P16 begins): § */
  bfresh();
  bfire('pointerdown', 1, 170, 560, 1000, { prim: true, on: card() });
  bfire('pointerdown', 2, 100, 200, 2000);
  for (let i = 1; i <= 6; i++) { bfire('pointermove', 2, 100 + 5 * i, 200, 2000 + 8 * i); bfire('pointermove', 1, 170 + 5 * i, 560, 2000 + 8 * i, { on: card() }); }
  bfire('pointerup', 2, 130, 200, 2100);
  if (bstored().length) bad.push('a hand and a finger moving 30px together stored ' + JSON.stringify(bstored()) + ' — two fingers draw nothing');
  bfire('pointerdown', 3, 60, 300, 2400);
  for (let i = 1; i <= 25; i++) bfire('pointermove', 3, 60 + 4 * i, 300, 2400 + 12 * i);
  bfire('pointerup', 3, 160, 300, 2700);
  bfire('pointerdown', 4, 60, 400, 3000);
  for (let i = 1; i <= 25; i++) bfire('pointermove', 4, 60 + 4 * i, 400, 3000 + 12 * i);
  bfire('pointerup', 4, 160, 400, 3300);
  bfire('pointerup', 1, 200, 560, 3400, { on: card() });
  bclean('a hand left still on the card after a two-finger gesture, then two lines', [[45, 170, 159, 170], [45, 255, 159, 255]]);

  /* A THUMB GRIPPING THE EDGE ROLLS 9px IN 48ms AS THE LINE STARTS, then is still; a second line with the thumb still down. */
  bfresh();
  bfire('pointerdown', 1, 8, 340, 1000, { prim: true, on: card() });
  const r1 = await bline(2, 40, 200, 100, 2000, (i, ts) => { if (i <= 6) bfire('pointermove', 1, 8, 340 - 1.5 * i, ts, { on: card() }); });
  const r2 = await bline(3, 40, 400, 100, 3200);
  bfire('pointerup', 1, 8, 331, 4200, { on: card() });
  bclean('a thumb at the edge that rolled 9px as the line started', [btrack(r1), btrack(r2)]);

  /* A PALM ON THE CARD SETTLES 12px SIDEWAYS IN 80ms AS THE LINE STARTS. */
  bfresh();
  bfire('pointerdown', 1, 170, 560, 1000, { prim: true, on: card() });
  const r3 = await bline(2, 40, 200, 100, 2000, (i, ts) => { if (i <= 10) bfire('pointermove', 1, 170 + 1.2 * i, 560, ts, { on: card() }); });
  bfire('pointerup', 1, 182, 560, 3000, { on: card() });
  bclean('a palm on the card that settled 12px as the line started', [btrack(r3)]);

  /* A PALM LANDS ON THE BOARD 120ms INTO A LINE, 110px BELOW IT, AND ITS CENTRE SETTLES 10px IN 60ms as it flattens -- the
     finger draws on throughout. The whole line, every sample, and nothing of the palm. */
  bfresh();
  const r4 = await bline(1, 40, 200, 100, 2000, (i, ts) => {
    if (i === 15) bfire('pointerdown', 2, 90, 310, ts + 2);
    else if (i > 15 && i <= 23) bfire('pointermove', 2, 90 + 1.25 * (i - 15), 310, ts + 2);
  });
  bfire('pointerup', 2, 100, 310, 3000);
  bclean('a palm that landed 120ms into a line and settled 10px', [btrack(r4)]);

  /* A PALM FIRST, ON THE BOARD, SETTLING 12px IN 80ms WHILE THE FINGER, 40ms LATER, DRAWS: the finger's line, from its own
     first point, every sample. */
  bfresh();
  bfire('pointerdown', 1, 300, 450, 1000, { prim: true });
  const r5 = await bline(2, 40, 200, 60, 1040, (i, ts) => { if (i <= 10) bfire('pointermove', 1, 300 - 1.2 * i, 450, ts); });
  bfire('pointerup', 1, 288, 450, 1600);
  bclean('a palm first that settled 12px as the finger drew', [btrack(r5)]);

  /* A PALM THAT CAME LATER TO ONE LINE IS NOT LATER THAN THE NEXT (found while fixing these). § */
  bfresh();
  const r6 = await bline(1, 40, 150, 100, 1000, (i, ts) => { if (i === 98) bfire('pointerdown', 2, 250, 450, ts + 2); });
  bfire('pointerdown', 3, 60, 250, 1850);
  for (let i = 1; i <= 6; i++) bfire('pointermove', 2, 250 - 5 * i, 450, 1850 + 8 * i);
  await wait(5);
  const r7 = [[60, 250]];
  for (let i = 1; i <= 25; i++) { r7.push([60 + 4 * i, 250]); bfire('pointermove', 3, 60 + 4 * i, 250, 1910 + 12 * i); if (!(i % 4)) await wait(1); }
  bfire('pointerup', 3, 160, 250, 2220);
  bfire('pointerup', 2, 220, 450, 2240);
  bclean('a palm left down from one line, sliding as the next finger lands', [btrack(r6), btrack(r7)]);

  /* AND A TWO-FINGER GESTURE STILL IN PROGRESS TAKES IN A FINGER THAT LANDS: § */
  bfresh();
  bfire('pointerdown', 1, 150, 300, 1000, { prim: true });
  bfire('pointerdown', 2, 230, 300, 1040);
  for (let i = 1; i <= 10; i++) { bfire('pointermove', 1, 150 - 4 * i, 300, 1040 + 8 * i); bfire('pointermove', 2, 230 + 4 * i, 300, 1040 + 8 * i); }
  bfire('pointerup', 1, 110, 300, 1130);
  for (let i = 1; i <= 30; i++) {
    if (i === 10) bfire('pointerdown', 3, 120, 200, 1130 + 8 * i - 2);
    if (i === 14) bfire('pointerup', 3, 120, 200, 1130 + 8 * i - 2);
    bfire('pointermove', 2, 270, 300 - 4 * i, 1130 + 8 * i);
  }
  bfire('pointerup', 2, 270, 180, 1400);
  bclean('a tap landing while the other finger of a pinch dragged on', []);

  /* UNDO TAKES OFF ONE STROKE AND REDRAWS NOTHING ELSE ==================== MEASURED BY THE REVIEW: § */
  const ring = (cx, cy, r, n) => { const st = []; for (let i = 0; i <= n; i++) { const a = 2 * Math.PI * i / n; st.push(Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))); } return st; };
  bfresh();
  const three = [ring(100, 100, 60, 12), ring(240, 120, 70, 12), ring(170, 250, 50, 12)];
  w.ansStore_(bk, JSON.stringify(three));
  w.initWhiteboard(); bfix();
  const was = [...pad().querySelectorAll('.qpad-g path')];
  if (was.length !== 3 || !/C/.test(was[0].getAttribute('d'))) bad.push('setup: the board drew ' + was.length + ' path(s) for three rings, or drew them without curves — Undo was NOT checked');
  else {
    const seg = w.padSegs_;
    let calls = 0;
    w.padSegs_ = function () { calls++; return seg.apply(this, arguments); };
    try { A['pad-undo'](pad().querySelector('.qpad-undo')); } finally { w.padSegs_ = seg; }
    const now = [...pad().querySelectorAll('.qpad-g path')];
    if (bstored().length !== 2) bad.push('Undo on three rings left ' + bstored().length + ' stored');
    if (now.length !== 2 || now[0] !== was[0] || now[1] !== was[1]) bad.push('Undo redrew the strokes it did not take off (' + now.length + ' paths, the first two ' + (now[0] === was[0] && now[1] === was[1] ? 'kept' : 'replaced') + ') — one comes off, the rest are already the store\'s');
    if (calls) bad.push('Undo recomputed ' + calls + ' stroke(s)\' curves for strokes already drawn');
    if (now.map(p => p.getAttribute('d')).join('|') !== three.slice(0, 2).map(st => w.padPath_(st, 1.3333)).join('|')) bad.push('after Undo the board does not draw exactly what is stored');
  }
  /* AND WHAT IS KEPT IS HELD TO A SIZE, NOT A COUNT: § */
  try {
    const big = [];
    /* EACH STEP ABOUT 10-14 UNITS AND TURNING 7 DEGREES: long and gentle, so every segment is a curve -- the size a fast
       stroke really draws at. */
    for (let s = 0; s < 150; s++) { const st = []; for (let i = 0; i < 1200; i++) { const a = i / 8 + s; st.push(Math.round(170 + (80 + s % 30) * Math.cos(a)), Math.round(170 + (80 + s % 30) * Math.sin(a * 1.01))); } big.push(st); }
    big.forEach(st => w.padPath_(st, 1));
    const memo = t.padPaths && t.padPaths();
    if (!memo) throw new Error('PAD_PATHS is not reachable');
    const held = [...memo].reduce((a, e) => a + e[0].length + e[1].length, 0);
    if (held > 4.1e6) bad.push('the kept paths hold ' + Math.round(held / 1e3) + 'K characters after 150 long strokes — a memo held to a count of strokes is hundreds of megabytes on a long visit; it is held to 4M characters');
    if (memo.get('1|' + big[149].join(',')) !== w.padPath_(big[149], 1)) bad.push('the memo does not hold the stroke drawn last');
  } catch (e) { bad.push('the kept paths could not be read (' + e.message + ') — the memo\'s size was NOT checked'); }

  /* ==================== ON A QUESTION'S PAD, 340 x 170 AT (100, 50) ==================== */
  const L = 100, T = 50, W = 340, H = 170;
  const host = d.createElement('div');
  d.body.appendChild(host);
  let x = { kind: 'question', answerType: 'drawing', html: '<p>Draw it.</p>', key: 'q:Q-FINGER-5' };
  let k = t.padKey(x);
  const ink = () => host.querySelector('.qpad-ink');
  const fresh = (item) => {
    w.padDrop_();
    if (item) { x = item; k = t.padKey(x); }
    try { w.localStorage.removeItem(k); } catch (e) {}
    t.padOn(k);
    host.innerHTML = t.padCard(x, '<svg viewBox="0 0 340 170"></svg>', '');
    ink().getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
  };
  const fire = (type, id, px, py, ts, o) => penEv_(w, (o && o.on) || ink(), type, Object.assign({ id: id, x: px, y: py, t: ts }, o || {}));
  const stored = () => { try { return JSON.parse(w.localStorage.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  const units = pts => { const o = []; pts.forEach(p => { const a = Math.round((p[0] - L) / W * 340), b = Math.round((p[1] - T) / H * 340);
    if (o.length && o[o.length - 2] === a && o[o.length - 1] === b) return; o.push(a, b); }); return o; };
  /* `steady`: a stylus's or a mouse's line is steadied (368), so it is asked to start and end where the pointer did and keep within 2 units of its path */
  const along = (s, want) => s.length === want.length && s.every((a, i) => { const b = want[i], seg = [];
    for (let j = 0; j + 1 < b.length; j += 2) seg.push([b[j], b[j + 1]]);
    const dSeg = (x, y) => Math.min.apply(null, seg.slice(1).map((q, k) => { const p = seg[k], dx = q[0] - p[0], dy = q[1] - p[1], L = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((x - p[0]) * dx + (y - p[1]) * dy) / L)); return Math.hypot(x - p[0] - u * dx, y - p[1] - u * dy); }));
    let ok = a[0] === b[0] && a[1] === b[1] && a[a.length - 2] === b[b.length - 2] && a[a.length - 1] === b[b.length - 1];
    for (let j = 0; ok && j + 1 < a.length; j += 2) ok = dSeg(a[j], a[j + 1]) <= 2;
    return ok; });
  const clean = (what, want, steady) => {
    const s = stored();
    if (steady ? !along(s, want) : JSON.stringify(s) !== JSON.stringify(want)) bad.push(what + ': stored ' + JSON.stringify(s).slice(0, 160) + ', wanted ' + JSON.stringify(want).slice(0, 160));
    if (!penWhole_(s)) bad.push(what + ': the store holds something that is not a list of lists of whole numbers');
    if (host.querySelectorAll('.qpad-g path').length !== s.length) bad.push(what + ': ' + host.querySelectorAll('.qpad-g path').length + ' path(s) drawn for ' + s.length + ' stored');
    if (host.querySelector('[data-live]')) bad.push(what + ': a live preview was left on the picture');
    if ((host.querySelector('.qpad-aid') || {}).innerHTML) bad.push(what + ': the aid was left on the picture');
    if (w.padBusy_()) bad.push(what + ': padBusy_ still says a finger is on the drawing');
    if (t.padTouch().size) bad.push(what + ': ' + t.padTouch().size + ' contact(s) left behind after every finger lifted');
  };

  /* A PINCH, ONE FINGER LIFTS, THE OTHER RESTS ON THE PICTURE half a second -- then a third finger draws: its line. */
  fresh();
  fire('pointerdown', 1, 200, 135, 1000, { prim: true });
  fire('pointerdown', 2, 260, 135, 1040);
  for (let i = 1; i <= 10; i++) { fire('pointermove', 1, 200 - 4 * i, 135, 1040 + 8 * i); fire('pointermove', 2, 260 + 4 * i, 135, 1040 + 8 * i); }
  fire('pointerup', 1, 160, 135, 1200);
  const q3 = [[120, 80]];
  fire('pointerdown', 3, 120, 80, 1700);
  for (let i = 1; i <= 20; i++) { q3.push([120 + 5 * i, 80]); fire('pointermove', 3, 120 + 5 * i, 80, 1700 + 8 * i); }
  fire('pointerup', 3, 220, 80, 1900);
  fire('pointerup', 2, 300, 135, 2000);
  clean('a finger left resting after a pinch, then a third finger drew', [units(q3)]);

  /* THE OTHER FINGER'S REPORT COMES LATE: § */
  fresh();
  fire('pointerdown', 1, 150, 210, 1000, { prim: true });
  fire('pointerdown', 2, 230, 212, 1005);
  const s2 = i => ({ clientX: 230, clientY: 212 - 4 * i, timeStamp: 1005 + 8 * i });
  fire('pointermove', 1, 150, 206, 1008);
  fire('pointermove', 1, 150, 202, 1016);
  fire('pointermove', 1, 150, 198, 1024);
  fire('pointermove', 2, 230, 208, 1029, { co: [s2(1)] });
  /* A FRAME HERE: finger 1 has gone 12px by 1024, finger 2 has reported only to 1013 -- so it is judged at 1013, where neither
     has gone 10px, and not at 1024 with finger 2 taken to be where its old sample left it. */
  await wait(5);
  fire('pointermove', 2, 230, 196, 1037, { co: [s2(2), s2(3), s2(4)] });
  for (let i = 4; i <= 37; i++) {
    fire('pointermove', 1, 150, 210 - 4 * i, 1000 + 8 * i); fire('pointermove', 2, 230, 212 - 4 * (i + 1), 1005 + 8 * (i + 1));
    if (!(i % 4)) await wait(1);
  }
  fire('pointerup', 1, 150, 62, 1310); fire('pointerup', 2, 230, 60, 1315);
  clean('a two-finger pan whose second finger reported late', []);

  /* A STYLUS DRAWS AND A PALM LANDS ON THE PICTURE -- the palm is the PRIMARY TOUCH, primary being per kind of pointer: the
     stylus's line, and nothing of the palm. */
  fresh();
  const sty = [[150, 100]];
  fire('pointerdown', 3, 150, 100, 1000, { prim: true, type: 'pen' });
  for (let i = 1; i <= 50; i++) {
    if (i === 21) fire('pointerdown', 4, 380, 190, 1000 + 8 * i - 2, { prim: true });
    if (i === 41) fire('pointerup', 4, 380, 190, 1000 + 8 * i - 2);
    sty.push([150 + 5 * i, 100 + 2 * i]);
    fire('pointermove', 3, 150 + 5 * i, 100 + 2 * i, 1000 + 8 * i, { type: 'pen' });
  }
  fire('pointerup', 3, 400, 200, 1420, { type: 'pen' });
  clean('a stylus line with a palm landing as the primary touch', [units(sty)], true);

  /* A FINGER DRAWS AND A MOUSE CLICKS BESIDE THE PICTURE (a touchscreen laptop) -- the mouse is primary among mice: the
     finger's line. */
  fresh();
  const fin = [[110, 60]];
  fire('pointerdown', 2, 110, 60, 1000, { prim: true });
  for (let i = 1; i <= 50; i++) {
    if (i === 21) { penEv_(w, host, 'pointerdown', { id: 1, x: 60, y: 30, t: 1166, prim: true, type: 'mouse' }); penEv_(w, host, 'pointerup', { id: 1, x: 60, y: 30, t: 1170, prim: true, type: 'mouse' }); }
    fin.push([110 + 4 * i, 60 + 2 * i]);
    fire('pointermove', 2, 110 + 4 * i, 60 + 2 * i, 1000 + 8 * i);
  }
  fire('pointerup', 2, 310, 160, 1410);
  clean('a finger line with a mouse click beside the picture', [units(fin)]);

  /* ==================== A PIN HELD ON A COMPASS'S CENTRE OR A RULER'S END ==================== */
  const tq = { kind: 'question', answerType: 'drawing', html: '<p>Use a ruler and compasses to construct the bisector of angle ABC.</p>', key: 'q:Q-FINGER-6' };
  fresh(tq);
  /* THE PEN'S STRAIGHT EDGE is the Straight line tile (553); inside the pad it is still the `ruler` mode. */
  const tool = name => host.querySelector('.qt-row .qt-t[data-tool="' + (name === 'ruler' ? 'line' : name) + '"]');
  if (!tool('compass') || !tool('ruler')) bad.push('setup: the construction question has no Straight line and Compass tiles — the held pin was NOT checked');
  else {
    for (const name of ['compass', 'ruler']) {
      fresh();
      (e => A[e.getAttribute('data-do')](e))(tool(name));
      ink().getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
      /* THE PIN: finger 1 on (270, 135), held 300ms, trembling under a pixel. Finger 2 lands 60px right and swings 270
         degrees round it (the compass) or slides 40px (the ruler). Nothing is stored -- as before 338. */
      fire('pointerdown', 1, 270, 135, 1000, { prim: true });
      for (let i = 1; i <= 30; i++) fire('pointermove', 1, 270 + (i % 2 ? 0.4 : -0.4), 135, 1000 + 10 * i);
      fire('pointerdown', 2, 330, 135, 1302);
      for (let i = 1; i <= 60; i++) {
        const a = 1.5 * Math.PI * i / 60;
        if (name === 'compass') fire('pointermove', 2, 270 + 60 * Math.cos(a), 135 + 60 * Math.sin(a), 1302 + 10 * i);
        else if (i <= 20) fire('pointermove', 2, 330 + 2 * i, 135, 1302 + 10 * i);
        fire('pointermove', 1, 270 + (i % 2 ? 0.4 : -0.4), 135, 1305 + 10 * i);
      }
      fire('pointerup', 2, 330, 135, 1920); fire('pointerup', 1, 270, 135, 1925);
      clean('a pin held on the ' + name + (name === 'ruler' ? '\'s end' : '\'s centre') + ' and a second finger moving', []);
    }
    /* WHAT IS ON THE PICTURE WHILE IT HAPPENS (third review, 12 Oct): § */
    const aidOf = () => host.querySelector('.qpad-aid');
    const unseen = what => {
      const live = host.querySelector('[data-live]');
      if (live) bad.push(what + ': a preview was on the picture (' + (live.getAttribute('d') || '').slice(0, 50) + ') for a mark that cannot be kept');
      if (aidOf() && aidOf().innerHTML) bad.push(what + ': the ruler\'s or compass\'s aid was on the picture for a mark that cannot be kept');
    };
    const tfresh = name => {
      fresh();
      (e => A[e.getAttribute('data-do')](e))(tool(name));
      ink().getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
    };
    /* AND A PIN THAT ROLLS (second review, 12 Oct; third, the same day): § */
    for (const name of ['compass', 'ruler']) for (const roll of [6, 12, 16, 24]) {
      tfresh(name);
      fire('pointerdown', 1, 270, 135, 1000, { prim: true });
      for (let i = 1; i <= 30; i++) fire('pointermove', 1, 270 + (i % 2 ? 0.4 : -0.4), 135, 1000 + 10 * i);
      fire('pointerdown', 2, 330, 135, 1302);
      for (let i = 1; i <= 60; i++) {
        const a = 1.5 * Math.PI * i / 60;
        if (name === 'compass') fire('pointermove', 2, 270 + 60 * Math.cos(a), 135 + 60 * Math.sin(a), 1302 + 10 * i);
        else if (i <= 20) fire('pointermove', 2, 330 + 2 * i, 135, 1302 + 10 * i);
        fire('pointermove', 1, 270 + roll * Math.min(1, i / 30), 135, 1305 + 10 * i);
        if (!(i % 4)) await wait(1);
      }
      const what = 'a pin held on the ' + name + (name === 'ruler' ? '\'s end' : '\'s centre') + ' that rolled ' + roll + 'px while a second finger moved';
      unseen(what);
      fire('pointerup', 2, 330, 135, 1920); fire('pointerup', 1, 270 + roll, 135, 1925);
      clean(what, []);
    }
    /* A PALM RESTING ON THE PICTURE FIRST, 400ms BEFORE THE FINGER, drifting as the finger uses the tool -- all of it in the finger's first 120ms (a palm settling) § */
    for (const name of ['ruler', 'compass']) for (const drift of [6, 12, 16, 24]) for (const quick of [true, false]) {
      tfresh(name);
      fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
      for (let i = 1; i <= 40; i++) fire('pointermove', 1, 420 + (i % 2 ? 0.4 : -0.4), 210, 1000 + 10 * i, { size: 50 });
      const what = 'a palm resting on the picture 400ms before the ' + name + ' finger, drifting ' + drift + 'px ' + (quick ? 'in 120ms' : 'over the line') + ', and a second line while it stayed';
      for (const t0 of [1400, 2200]) {
        fire('pointerdown', 2, 130, 85, t0);
        for (let i = 1; i <= 30; i++) {
          if (name === 'compass') fire('pointermove', 2, 130 + 5 * Math.min(i, 12), 85, t0 + 10 * i);
          else fire('pointermove', 2, 130 + 4 * i, 85 + i, t0 + 10 * i);
          if (t0 === 1400 && (!quick || i <= 12)) fire('pointermove', 1, 420 - drift * Math.min(1, i / (quick ? 12 : 30)), 210, t0 + 10 * i + 3, { size: 50 });
          if (!(i % 4)) await wait(1);
        }
        if (t0 === 1400) unseen(what);
        fire('pointerup', 2, name === 'compass' ? 190 : 250, name === 'compass' ? 85 : 115, t0 + 320);
      }
      fire('pointerup', 1, 420 - drift, 210, 2700, { size: 50 });
      clean(what, []);
    }
    /* THE PALM STILL WHILE THE FINGER DRAWS, THEN SLIDING ONCE IT HAS LIFTED (third review): § */
    for (const name of ['ruler', 'compass']) for (const slide of [12, 60]) {
      tfresh(name);
      fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
      for (let i = 1; i <= 40; i++) fire('pointermove', 1, 420 + (i % 2 ? 0.4 : -0.4), 210, 1000 + 10 * i, { size: 50 });
      fire('pointerdown', 2, 130, 85, 1400);
      for (let i = 1; i <= 30; i++) {
        if (name === 'compass') fire('pointermove', 2, 130 + 5 * Math.min(i, 12), 85, 1400 + 10 * i);
        else fire('pointermove', 2, 130 + 4 * i, 85 + i, 1400 + 10 * i);
        if (!(i % 4)) await wait(1);
      }
      fire('pointerup', 2, name === 'compass' ? 190 : 250, name === 'compass' ? 85 : 115, 1720);
      for (let i = 1; i <= 60; i++) { fire('pointermove', 1, 420 - slide * i / 60, 210, 1800 + 10 * i, { size: 50 }); if (!(i % 4)) await wait(1); }
      const what = 'a palm still while the ' + name + ' finger drew, then sliding ' + slide + 'px after it lifted';
      unseen(what);
      fire('pointerup', 1, 420 - slide, 210, 2420, { size: 50 });
      clean(what, []);
    }
    /* A PALM DOWN THROUGH THREE TRIES, CREEPING 22px IN 2.4s (third review): round 2 stored its 22px line, or a ring round it,
       when it lifted -- and none of the three lines. Nothing. */
    for (const name of ['ruler', 'compass']) {
      tfresh(name);
      fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
      const tries = [1400, 2100, 2800];
      for (let t = 1010; t <= 3400; t += 10) {
        tries.forEach((t0, n) => {
          const i = (t - t0) / 10, id = 2 + n;
          if (i === 0) fire('pointerdown', id, 130, 85, t0);
          else if (i >= 1 && i <= 30) {
            if (name === 'compass') fire('pointermove', id, 130 + 5 * Math.min(i, 12), 85, t);
            else fire('pointermove', id, 130 + 4 * i, 85 + i, t);
          } else if (i === 32) fire('pointerup', id, name === 'compass' ? 190 : 250, name === 'compass' ? 85 : 115, t);
        });
        fire('pointermove', 1, 420 - 22 * (t - 1000) / 2400, 210, t + 3, { size: 50 });
        if (!(t % 40)) await wait(1);
      }
      const what = 'a palm down through three ' + name + ' lines, creeping 22px';
      unseen(what);
      fire('pointerup', 1, 398, 210, 3410, { size: 50 });
      clean(what, []);
    }
    /* A FINGER'S SHORT RULER TICK, REFUSED, AND THE PALM THEN DRIFTING 15px, and 28px (third review's rule, and the fourth's): § */
    for (const drift of [15, 28]) {
      tfresh('ruler');
      fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
      for (let i = 1; i <= 40; i++) fire('pointermove', 1, 420 + (i % 2 ? 0.4 : -0.4), 210, 1000 + 10 * i, { size: 50 });
      fire('pointerdown', 2, 130, 85, 1400);
      for (let i = 1; i <= 5; i++) { fire('pointermove', 2, 130 + 4 * i, 85 + i, 1400 + 10 * i); if (!(i % 4)) await wait(1); }
      await wait(5);
      fire('pointerup', 2, 150, 90, 1470);
      for (let i = 1; i <= 30; i++) { fire('pointermove', 1, 420 - drift * i / 30, 210, 1500 + 10 * i, { size: 50 }); if (!(i % 4)) await wait(1); }
      const what = 'a palm drifting ' + drift + 'px after a finger\'s 20px ruler tick was refused';
      unseen(what);
      fire('pointerup', 1, 420 - drift, 210, 1820, { size: 50 });
      clean(what, []);
    }
    /* AND A FINGER THAT WAS AIMING STILL GETS ITS LINE: § */
    for (const along of [0, 40]) {
      tfresh('ruler');
      fire('pointerdown', 2, 130, 85, 1000, { prim: true });
      for (let i = 1; i <= 30; i++) fire('pointermove', 2, 130 + (i % 2 ? 0.4 : -0.4), 85, 1000 + 10 * i);
      fire('pointerdown', 1, 420, 210, 1302, { size: 50 });
      for (let i = 1; i <= 8; i++) { fire('pointermove', 1, 420 - 1.5 * i, 210, 1302 + 10 * i, { size: 50 }); fire('pointermove', 2, 130 + (i % 2 ? 0.4 : -0.4), 85, 1305 + 10 * i); }
      await wait(5);
      const what = 'a ruler finger aiming 300ms, a palm landing and settling 12px before it moved' + (along ? ', then sliding ' + along + 'px along with the line' : '');
      for (let i = 1; i <= 30; i++) {
        fire('pointermove', 2, 130 + 4 * i, 85 + i, 1500 + 10 * i);
        if (along) fire('pointermove', 1, 408 - along * i / 30, 210, 1503 + 10 * i, { size: 50 });
        if (!(i % 4)) await wait(1);
        if (i === 20 && !host.querySelector('[data-live]')) bad.push(what + ': the finger\'s line was not shown as it was drawn');
      }
      fire('pointerup', 2, 250, 115, 1820);
      fire('pointerup', 1, 408 - along, 210, 1900, { size: 50 });
      clean(what, [[30, 70, 150, 130]]);
    }
    /* AND THE RACE IS RUN BY THE SAMPLES' OWN CLOCK, not by which event came first: § */
    {
      tfresh('ruler');
      fire('pointerdown', 2, 130, 85, 1000, { prim: true });
      for (let i = 1; i <= 30; i++) fire('pointermove', 2, 130 + (i % 2 ? 0.4 : -0.4), 85, 1000 + 10 * i);
      fire('pointerdown', 1, 420, 210, 1302, { size: 50 });
      for (let i = 1; i <= 8; i++) { fire('pointermove', 1, 420 - 1.5 * i, 210, 1302 + 10 * i, { size: 50 }); fire('pointermove', 2, 130 + (i % 2 ? 0.4 : -0.4), 85, 1305 + 10 * i); }
      await wait(5);
      const fp = t => ({ clientX: 130 + 0.4 * (t - 1500), clientY: 85 + 0.1 * (t - 1500), timeStamp: t });
      const pp = t => ({ clientX: 408 - 0.2 * (t - 1500), clientY: 210, timeStamp: t });
      const fold = (id, from, to, at, o) => { const co = []; for (let t = from; t <= to; t += 5) co.push(at(t)); const z = co[co.length - 1]; fire('pointermove', id, z.clientX, z.clientY, to, Object.assign({ co }, o || {})); };
      for (let t = 1505; t <= 1545; t += 5) fold(2, t, t, fp);
      fold(1, 1505, 1550, pp, { size: 50 });
      await wait(5);
      for (let t = 1550; t <= 1570; t += 5) fold(2, t, t, fp);
      fold(1, 1555, 1600, pp, { size: 50 });
      await wait(5);
      fold(2, 1575, 1600, fp);
      await wait(5);
      for (let t = 1610; t <= 1800; t += 10) { fold(2, t - 5, t, fp); fold(1, t - 5, t, pp, { size: 50 }); if (!(t % 40)) await wait(1); }
      fire('pointerup', 2, 250, 115, 1805);
      fire('pointerup', 1, 348, 210, 1850, { size: 50 });
      clean('a ruler finger aiming, a settled palm sliding along, the palm\'s moves folded ahead of the finger\'s', [[30, 70, 150, 130]]);
    }
    /* A THUMB ON THE CARD, OFF THE PICTURE, landing 300ms after the ruler finger and sliding 40px before the finger moves: § */
    tfresh('ruler');
    fire('pointerdown', 2, 130, 85, 1000, { prim: true });
    for (let i = 1; i <= 30; i++) fire('pointermove', 2, 130 + (i % 2 ? 0.4 : -0.4), 85, 1000 + 10 * i);
    fire('pointerdown', 3, 300, 260, 1302, { on: host });
    for (let i = 1; i <= 8; i++) { fire('pointermove', 3, 300 + 5 * i, 260, 1302 + 10 * i, { on: host }); fire('pointermove', 2, 130 + (i % 2 ? 0.4 : -0.4), 85, 1305 + 10 * i); }
    await wait(5);
    for (let i = 1; i <= 30; i++) { fire('pointermove', 2, 130 + 4 * i, 85 + i, 1500 + 10 * i); if (!(i % 4)) await wait(1); }
    fire('pointerup', 2, 250, 115, 1820);
    fire('pointerup', 3, 340, 260, 1900, { on: host });
    clean('a ruler finger aiming 300ms and a thumb on the card sliding 40px before it moved', [[30, 70, 150, 130]]);
    /* AND A PALM LEFT DOWN FROM ONE RULER LINE, SLIDING 30px AS THE NEXT FINGER LANDS (the board's case, with the ruler): § */
    tfresh('ruler');
    fire('pointerdown', 1, 130, 85, 1000, { prim: true });
    for (let i = 1; i <= 30; i++) {
      fire('pointermove', 1, 130 + 4 * i, 85 + i, 1000 + 10 * i);
      if (i === 29) fire('pointerdown', 2, 420, 210, 1000 + 10 * i + 2, { size: 50 });
      if (!(i % 4)) await wait(1);
    }
    fire('pointerup', 1, 250, 115, 1310);
    fire('pointerdown', 3, 130, 150, 1356);
    for (let i = 1; i <= 6; i++) fire('pointermove', 2, 420 - 5 * i, 210, 1356 + 8 * i, { size: 50 });
    await wait(5);
    for (let i = 1; i <= 30; i++) { fire('pointermove', 3, 130 + 4 * i, 150 + i, 1420 + 10 * i); if (!(i % 4)) await wait(1); }
    fire('pointerup', 3, 250, 180, 1730);
    fire('pointerup', 2, 390, 210, 1800, { size: 50 });
    clean('a palm left down from one ruler line, sliding 30px as the next finger landed', [[30, 70, 150, 130], [30, 200, 150, 260]]);
    /* WITHIN `PAD_TOGETHER_MS` THE PALM STILL HANDS THE TOOL OVER (round 1 kept it; checked so the pin rule cannot widen unseen): § */
    for (const [name, gap] of [['ruler', 120], ['pen', 400]]) {
      fresh();
      if (!tool(name)) { bad.push('setup: the construction question has no ' + name + ' tile — the palm ' + gap + 'ms before was NOT checked'); continue; }
      (e => A[e.getAttribute('data-do')](e))(tool(name));
      ink().getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
      fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
      for (let i = 1; i <= gap / 10; i++) fire('pointermove', 1, 420 + (i % 2 ? 0.4 : -0.4), 210, 1000 + 10 * i, { size: 50 });
      const t0 = 1000 + gap, fin = [[130, 85]];
      fire('pointerdown', 2, 130, 85, t0);
      for (let i = 1; i <= 30; i++) {
        fin.push([130 + 4 * i, 85 + i]);
        fire('pointermove', 2, 130 + 4 * i, 85 + i, t0 + 10 * i);
        if (i <= 12) fire('pointermove', 1, 420 - 0.5 * i, 210, t0 + 10 * i + 3, { size: 50 });
        if (!(i % 4)) await wait(1);
      }
      fire('pointerup', 2, 250, 115, t0 + 320);
      fire('pointerup', 1, 414, 210, t0 + 400, { size: 50 });
      clean('a palm ' + gap + 'ms before the ' + name + ' finger, drifting 6px', [name === 'pen' ? units(fin) : [30, 70, 150, 130]]);
    }
    /* AND A PALM FIRST, THEN THE COMPASS FINGER 40ms LATER: the finger's circle, about where IT went down. */
    fresh();
    (e => A[e.getAttribute('data-do')](e))(tool('compass'));
    ink().getBoundingClientRect = () => ({ left: L, top: T, width: W, height: H, right: L + W, bottom: T + H, x: L, y: T });
    fire('pointerdown', 1, 420, 210, 1000, { prim: true });
    fire('pointerdown', 2, 270, 135, 1040);
    for (let i = 1; i <= 12; i++) fire('pointermove', 2, 270 + 5 * i, 135, 1040 + 8 * i);
    fire('pointerup', 2, 330, 135, 1150); fire('pointerup', 1, 420, 210, 1160);
    const s = stored(), rg = s[0] || [];
    const xs = rg.filter((v, i) => !(i % 2)), ys = rg.filter((v, i) => i % 2);
    if (s.length !== 1 || rg.length < 40 || Math.abs((Math.max(...xs) + Math.min(...xs)) / 2 - 170) > 1 || Math.abs((Math.max(...ys) + Math.min(...ys)) / 2 - 170) > 1) {
      bad.push('a palm first and then the compass finger stored ' + JSON.stringify(s).slice(0, 80) + ' — wanted one ring about where the finger went down, (170, 170)');
    }

    /* FOURTH REVIEW (12 Oct): § */
    const nearPalm = s => s.some(st => { for (let i = 0; i + 1 < st.length; i += 2) if (Math.hypot(st[i] - 320, st[i + 1] - 320) < 30) return true; return false; });
    /* THE COMPASS'S ARC, centred where the finger went down: every point 60px off it (a unit is 1px across, 0.5px down). */
    const arcAt = (st, cx, cy) => {
      if (st.length < 16) return false;
      for (let i = 0; i + 1 < st.length; i += 2) if (Math.abs(Math.hypot((st[i] - cx) * W / 340, (st[i + 1] - cy) * H / 340) - 60) > 3) return false;
      return true;
    };
    const quiver = i => (i % 2 ? 0.3 : -0.3);
    /* THE FINGER'S STROKE FROM `t0`: § */
    const draw = async (name, t0, also, what) => {
      const pts = [[130, 85]];
      for (let i = 1; i <= 40; i++) {
        const t = t0 + 10 * i;
        let p;
        if (name === 'compass') { const g = Math.PI * Math.max(0, i - 16) / 24; p = i <= 16 ? [130 + 60 * i / 16, 85] : [130 + 60 * Math.cos(g), 85 + 60 * Math.sin(g)]; }
        else p = [130 + 3 * i, 85 + 0.5 * i];
        pts.push(p);
        fire('pointermove', 2, p[0], p[1], t);
        if (also) also(i, t);
        if (!(i % 4)) await wait(1);
        if (what && i === 32 && !host.querySelector('[data-live]')) bad.push(what + ': the finger\'s line was not shown as it was drawn');
      }
      fire('pointerup', 2, pts[40][0], pts[40][1], t0 + 405);
      return pts;
    };
    const fingers = (name, pts) => name === 'pen' ? [units(pts)] : name === 'ruler' ? [[30, 70, 150, 110]] : null;
    const theFinger = (what, name, pts) => {
      const s = stored();
      if (nearPalm(s)) bad.push(what + ': a mark at the PALM was stored: ' + JSON.stringify(s).slice(0, 120));
      if (name === 'compass') {
        if (s.length !== 1 || !arcAt(s[0], 30, 70)) bad.push(what + ': stored ' + JSON.stringify(s).slice(0, 120) + ' — wanted one arc about where the finger went down, (30, 70)');
        clean(what, s.length === 1 && arcAt(s[0], 30, 70) ? s : [['the finger\'s arc']]);
      } else clean(what, fingers(name, pts));
    };
    /* THE FINGER HELD ON ITS POINT FROM 1000; THE PALM LANDS `gap` LATER AND SETTLES `S` px IN 80ms (8 moves), then rests,
       trembling, both of them, for 400ms from its landing -- unless `lift` names one of them that goes at +210. */
    const aimAndSettle = async (name, gap, S, lift) => {
      tfresh(name);
      const g0 = 1000 + gap;
      fire('pointerdown', 2, 130, 85, 1000, { prim: true });
      for (let t = 1010; t < g0; t += 10) fire('pointermove', 2, 130 + quiver(t / 10), 85, t);
      fire('pointerdown', 1, 420, 210, g0, { size: 50 });
      for (let i = 1; i <= 40; i++) {
        if (lift !== 'palm' || i <= 20) fire('pointermove', 1, 420 - S * Math.min(1, i / 8) + (i > 8 ? quiver(i) : 0), 210, g0 + 10 * i, { size: 50 });
        if (lift !== 'finger' || i <= 20) fire('pointermove', 2, 130 + quiver(i), 85, g0 + 10 * i + 2);
        if (i === 21 && lift === 'palm') fire('pointerup', 1, 420 - S, 210, g0 + 205, { size: 50 });
        if (i === 21 && lift === 'finger') fire('pointerup', 2, 130, 85, g0 + 205);
        if (!(i % 4)) await wait(1);
        /* HELD, AND SO NOTHING ON THE PICTURE: the review watched the palm's settle drawn in 28-48 frames. */
        if (i === 12) unseen('a palm landing ' + gap + 'ms after a ' + name + ' finger and settling ' + S + 'px');
      }
      return g0 + 400;
    };
    /* THE MUST-FIX: THE FINGER HELD STILL TO AIM, A PALM LANDING AFTER IT AND SETTLING 9, 12 OR 16px -- the pen at 300ms and at 1.5s § */
    for (const [name, gap] of [['pen', 300], ['pen', 1500], ['ruler', 120], ['compass', 120]]) for (const S of [9, 12, 16]) {
      const what = 'a ' + name + ' finger aiming, a palm landing ' + gap + 'ms after it and settling ' + S + 'px, then the finger drew';
      const go = await aimAndSettle(name, gap, S);
      const pts = await draw(name, go, (i, t) => fire('pointermove', 1, 420 - S + quiver(i), 210, t + 3, { size: 50 }), what);
      fire('pointerup', 1, 420 - S, 210, go + 500, { size: 50 });
      theFinger(what, name, pts);
    }
    /* AND A LIFT HANDS NOTHING OVER (decided while fixing the above -- 338 section 4). § */
    for (const [name, gap] of [['pen', 300], ['ruler', 120], ['compass', 120]]) for (const S of [12, 16]) {
      let what = 'a ' + name + ' finger aiming, a palm landing ' + gap + 'ms after it, settling ' + S + 'px and lifting, then the finger drew';
      const go = await aimAndSettle(name, gap, S, 'palm');
      theFinger(what, name, await draw(name, go, null, what));
      what = 'a ' + name + ' finger tapping still while a palm landed ' + gap + 'ms after it and settled ' + S + 'px';
      const end = await aimAndSettle(name, gap, S, 'finger');
      for (let i = 1; i <= 20; i++) { fire('pointermove', 1, 420 - S + quiver(i), 210, end + 10 * i, { size: 50 }); if (!(i % 4)) await wait(1); }
      unseen(what);
      fire('pointerup', 1, 420 - S, 210, end + 210, { size: 50 });
      if (nearPalm(stored())) bad.push(what + ': a mark at the PALM was stored: ' + JSON.stringify(stored()).slice(0, 120));
      clean(what, []);
    }
    /* THE COST OF THAT, CHECKED SO IT CANNOT GROW UNSEEN: § */
    {
      tfresh('pen');
      fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
      const rest = (a, b) => { for (let t = a; t < b; t += 10) fire('pointermove', 1, 420 + quiver(t / 10), 210, t + 3, { size: 50 }); };
      rest(1010, 1400);
      const kept = [];
      for (const [t0, len, y] of [[1400, 20, 85], [1700, 20, 105], [2000, 60, 125], [2400, 20, 145]]) {
        const pts = [[130, y]];
        fire('pointerdown', 2, 130, y, t0);
        for (let i = 1; i <= len / 2; i++) { pts.push([130 + 2 * i, y]); fire('pointermove', 2, 130 + 2 * i, y, t0 + 10 * i); fire('pointermove', 1, 420 + quiver(i), 210, t0 + 10 * i + 3, { size: 50 }); if (!(i % 4)) await wait(1); }
        await wait(2);
        fire('pointerup', 2, 130 + len, y, t0 + 5 * len + 5);
        rest(t0 + 5 * len + 10, t0 + 300);
        if (len === 60 || t0 === 2400) kept.push(units(pts));
      }
      fire('pointerup', 1, 420, 210, 2800, { size: 50 });
      clean('a palm resting first, then the pen: two 20px ticks, a 60px line and a 20px tick', kept);
      tfresh('ruler');
      fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
      rest(1010, 1100);
      fire('pointerdown', 2, 130, 85, 1100);
      for (let i = 1; i <= 10; i++) { fire('pointermove', 2, 130 + 2 * i, 85, 1100 + 10 * i); fire('pointermove', 1, 420 + quiver(i), 210, 1100 + 10 * i + 3, { size: 50 }); if (!(i % 4)) await wait(1); }
      await wait(2);
      fire('pointerup', 2, 150, 85, 1205);
      fire('pointerup', 1, 420, 210, 1400, { size: 50 });
      clean('a palm resting 100ms first, then a 20px ruler tick', []);
    }
    /* AND THE ONE LEFT ALONE IN A HELD STROKE IS HANDED IT ONLY AT 30px, WHICHEVER CAME FIRST (decision 4, again). § */
    {
      const slide = (a, dx) => { for (let i = 1; i <= 15; i++) fire('pointermove', 1, 420 - dx * i / 15, 210, a + 10 * i, { size: 50 }); };
      for (const [name, gap, line] of [['pen', 400, true], ['pen', 400, false], ['ruler', 100, false]]) {
        tfresh(name);
        fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
        for (let t = 1010; t < 1000 + gap; t += 10) fire('pointermove', 1, 420 + quiver(t / 10), 210, t + 3, { size: 50 });
        const t0 = 1000 + gap;
        fire('pointerdown', 2, 130, 85, t0);
        for (let i = 1; i <= 10; i++) { fire('pointermove', 2, 130 + 2 * i, 85, t0 + 10 * i); fire('pointermove', 1, 420 + quiver(i), 210, t0 + 10 * i + 3, { size: 50 }); if (!(i % 4)) await wait(1); }
        await wait(2);
        fire('pointerup', 2, 150, 85, t0 + 105);
        await wait(2);
        slide(t0 + 200, 15);
        await wait(5);
        const what = 'a palm resting first, a ' + name + ' finger\'s 20px tick, then the palm sliding 15px' + (line ? ' and a finger drawing 60px' : ' and lifting');
        unseen(what);
        const kept = [];
        if (line) {
          const pts = [[130, 125]];
          fire('pointerdown', 2, 130, 125, t0 + 500);
          for (let i = 1; i <= 30; i++) { pts.push([130 + 2 * i, 125]); fire('pointermove', 2, 130 + 2 * i, 125, t0 + 500 + 10 * i); fire('pointermove', 1, 405 + quiver(i), 210, t0 + 500 + 10 * i + 3, { size: 50 }); if (!(i % 4)) await wait(1); }
          await wait(2);
          fire('pointerup', 2, 190, 125, t0 + 805);
          kept.push(units(pts));
        }
        fire('pointerup', 1, 405, 210, t0 + 900, { size: 50 });
        if (nearPalm(stored())) bad.push(what + ': a mark at the PALM was stored: ' + JSON.stringify(stored()).slice(0, 120));
        clean(what, kept);
      }
      for (const len of [20, 40]) {
        const go = await aimAndSettle('pen', 300, 12, 'palm');
        const pts = [[130, 85]];
        for (let i = 1; i <= len / 2; i++) { pts.push([130 + 2 * i, 85]); fire('pointermove', 2, 130 + 2 * i, 85, go + 10 * i); if (!(i % 4)) await wait(1); }
        await wait(2);
        fire('pointerup', 2, 130 + len, 85, go + 5 * len + 5);
        clean('a pen finger aiming, a palm brushing the picture 300ms after it (settling 12px and lifting), then a ' + len + 'px line', len < 30 ? [] : [units(pts)]);
      }
    }
    /* AND THE ONE IT WENT TO AT A LIFT STAYS OWED WITH A NEW FINGER BESIDE IT: § */
    {
      const end = await aimAndSettle('pen', 300, 12, 'finger');
      const pts = [[130, 125]];
      fire('pointerdown', 3, 130, 125, end + 10);
      for (let i = 1; i <= 10; i++) { fire('pointermove', 1, 408 - 1.2 * i + quiver(i), 210, end + 10 + 10 * i, { size: 50 }); fire('pointermove', 3, 130 + quiver(i), 125, end + 12 + 10 * i); if (!(i % 4)) await wait(1); }
      await wait(5);
      unseen('a palm handed a tap\'s stroke, then a finger landing beside it while it drifted 12px');
      for (let i = 1; i <= 30; i++) { pts.push([130 + 2 * i, 125]); fire('pointermove', 3, 130 + 2 * i, 125, end + 120 + 10 * i); fire('pointermove', 1, 396 + quiver(i), 210, end + 123 + 10 * i, { size: 50 }); if (!(i % 4)) await wait(1); }
      await wait(2);
      fire('pointerup', 3, 190, 125, end + 425);
      fire('pointerup', 1, 396, 210, end + 500, { size: 50 });
      const what = 'a palm handed a tap\'s stroke, a finger landing while it drifted 12px, then drawing 60px';
      if (nearPalm(stored())) bad.push(what + ': a mark at the PALM was stored: ' + JSON.stringify(stored()).slice(0, 120));
      clean(what, [units(pts)]);
    }
    /* THE SHOULD-FIX: THE RACE COUNTED THE STILL ONE FROM ITS OWN DOWN. § */
    {
      const mj = u => { u = Math.max(0, Math.min(1, u)); return 10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5; };
      const slow = (name, i, t, id, cx, cy) => {
        const u = i / 60;
        if (name === 'compass') { if (u < 0.8) fire('pointermove', id, cx + 60 * mj(u / 0.8), cy, t); else { const g = Math.PI * (u - 0.8) / 0.2; fire('pointermove', id, cx + 60 * Math.cos(g), cy + 60 * Math.sin(g), t); } }
        else fire('pointermove', id, cx + 120 * mj(u), cy + 20 * mj(u), t);
      };
      for (const name of ['ruler', 'compass']) for (const [pre, more] of [[9, 2], [9, 3], [9, 4], [8, 4], [9, 0], [0, 12]]) {
        tfresh(name);
        fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
        for (let i = 1; i <= 8; i++) fire('pointermove', 1, 420 - pre * i / 8, 210, 1000 + 10 * i, { size: 50 });
        for (let i = 9; i <= 40; i++) fire('pointermove', 1, 420 - pre + quiver(i), 210, 1000 + 10 * i, { size: 50 });
        fire('pointerdown', 2, 130, 85, 1400);
        for (let i = 1; i <= 60; i++) {
          slow(name, i, 1400 + 10 * i, 2, 130, 85);
          fire('pointermove', 1, 420 - pre - more * Math.min(1, i / 20) + quiver(i), 210, 1400 + 10 * i + 3, { size: 50 });
          if (!(i % 2)) await wait(1);
        }
        const what = 'a palm 400ms first that settled ' + pre + 'px, then drifting ' + more + 'px while a slow-starting ' + name + ' finger drew';
        unseen(what);
        fire('pointerup', 2, 250, 105, 2010);
        fire('pointerup', 1, 420 - pre - more, 210, 2100, { size: 50 });
        clean(what, []);
      }
      /* AND RACED FROM WHERE IT WAS WHEN THE FINGER LANDED: § */
      for (const name of ['ruler', 'compass']) {
        tfresh(name);
        fire('pointerdown', 1, 420, 210, 1000, { prim: true, size: 50 });
        for (let i = 1; i <= 8; i++) fire('pointermove', 1, 420 - 9 * i / 8, 210, 1000 + 10 * i, { size: 50 });
        for (let i = 9; i <= 40; i++) fire('pointermove', 1, 411 + quiver(i), 210, 1000 + 10 * i, { size: 50 });
        fire('pointerdown', 2, 130, 85, 1400);
        for (let i = 1; i <= 4; i++) { fire('pointermove', 2, 130 + 3 * i, 85, 1400 + 10 * i); fire('pointermove', 1, 411 + quiver(i), 210, 1403 + 10 * i, { size: 50 }); }
        await wait(2);
        for (let i = 1; i <= 20; i++) {
          fire('pointermove', 2, 142 + quiver(i), 85, 1440 + 10 * i);
          fire('pointermove', 1, 411 - 22 * Math.min(1, i / 15) + quiver(i), 210, 1443 + 10 * i, { size: 50 });
          if (!(i % 4)) await wait(1);
        }
        for (let i = 1; i <= 30; i++) {
          if (name === 'compass') { if (i <= 12) fire('pointermove', 2, 142 + 4 * i, 85, 1640 + 10 * i); else { const g = Math.PI * (i - 12) / 18; fire('pointermove', 2, 130 + 60 * Math.cos(g), 85 + 60 * Math.sin(g), 1640 + 10 * i); } }
          else fire('pointermove', 2, 142 + 4 * i, 85 + i, 1640 + 10 * i);
          if (!(i % 4)) await wait(1);
        }
        const what = 'a palm 400ms first that settled 9px, a ' + name + ' finger refused at 12px and pausing while the palm drifted 22px more';
        unseen(what);
        fire('pointerup', 2, 262, 115, 1950);
        fire('pointerup', 1, 389, 210, 2000, { size: 50 });
        clean(what, []);
      }
      for (const name of ['ruler', 'compass']) for (const [pre, more] of [[9, 3], [8, 5], [0, 12]]) {
        tfresh(name);
        fire('pointerdown', 1, 270, 135, 1000, { prim: true });
        for (let i = 1; i <= 8; i++) fire('pointermove', 1, 270 + pre * i / 8, 135, 1000 + 10 * i);
        for (let i = 9; i <= 30; i++) fire('pointermove', 1, 270 + pre + quiver(i), 135, 1000 + 10 * i);
        fire('pointerdown', 2, 330, 135, 1302);
        for (let i = 1; i <= 60; i++) {
          const u = i / 60;
          if (name === 'compass') { const g = 1.5 * Math.PI * mj(u); fire('pointermove', 2, 270 + 60 * Math.cos(g), 135 + 60 * Math.sin(g), 1302 + 10 * i); }
          else fire('pointermove', 2, 330 + 60 * mj(u), 135, 1302 + 10 * i);
          fire('pointermove', 1, 270 + pre + more * Math.min(1, i / 20) + quiver(i), 135, 1305 + 10 * i);
          if (!(i % 2)) await wait(1);
        }
        const what = 'a pin on the ' + name + (name === 'ruler' ? '\'s end' : '\'s centre') + ' that settled ' + pre + 'px as it was put down, then rolled ' + more;
        unseen(what);
        fire('pointerup', 2, 330, 135, 1920); fire('pointerup', 1, 270 + pre + more, 135, 1925);
        clean(what, []);
      }
    }
    /* THE NIT: THE RACE WAS JUDGED AGAINST HOW FAR THE PALM HAD GONE BY THE FRAME, not by the finger's samples. § */
    {
      tfresh('ruler');
      fire('pointerdown', 2, 130, 85, 1000, { prim: true });
      for (let i = 1; i <= 30; i++) fire('pointermove', 2, 130 + quiver(i), 85, 1000 + 10 * i);
      fire('pointerdown', 1, 420, 210, 1302, { size: 50 });
      for (let i = 1; i <= 8; i++) { fire('pointermove', 1, 420 - 1.5 * i, 210, 1302 + 10 * i, { size: 50 }); fire('pointermove', 2, 130 + quiver(i), 85, 1305 + 10 * i); }
      await wait(5);
      for (let i = 1; i <= 8; i++) fire('pointermove', 2, 130 + 4 * i, 85, 1500 + 10 * i);
      for (let i = 1; i <= 5; i++) { fire('pointermove', 1, 408 - 6 * i, 210, 1580 + 10 * i, { size: 50 }); fire('pointermove', 2, 162 + 4 * i, 85, 1582 + 10 * i); }
      await wait(5);
      for (let i = 1; i <= 16; i++) { fire('pointermove', 2, 182 + 4 * i, 85 + i, 1640 + 10 * i); if (!(i % 4)) await wait(1); }
      fire('pointerup', 2, 246, 101, 1810);
      fire('pointerup', 1, 378, 210, 1850, { size: 50 });
      clean('a ruler finger aiming, a settled palm, the finger 30px by its samples before the palm, one frame for all', [[30, 70, 146, 102]]);
    }
    /* THE COST OF THE 30px RACE (338 section 4): the same aiming ruler finger and settled palm, and the finger then draws only
       20px -- shorter than 30, it never shows it was the one drawing: nothing. At 40px: its line. */
    for (const len of [20, 40]) {
      tfresh('ruler');
      fire('pointerdown', 2, 130, 85, 1000, { prim: true });
      for (let i = 1; i <= 30; i++) fire('pointermove', 2, 130 + quiver(i), 85, 1000 + 10 * i);
      fire('pointerdown', 1, 420, 210, 1302, { size: 50 });
      for (let i = 1; i <= 8; i++) { fire('pointermove', 1, 420 - 1.5 * i, 210, 1302 + 10 * i, { size: 50 }); fire('pointermove', 2, 130 + quiver(i), 85, 1305 + 10 * i); }
      await wait(5);
      for (let i = 1; i <= len / 4; i++) { fire('pointermove', 2, 130 + 4 * i, 85, 1500 + 10 * i); fire('pointermove', 1, 408 + quiver(i), 210, 1503 + 10 * i, { size: 50 }); if (!(i % 4)) await wait(1); }
      await wait(2);
      fire('pointerup', 2, 130 + len, 85, 1500 + 10 * len / 4 + 5);
      fire('pointerup', 1, 408, 210, 1700, { size: 50 });
      clean('a ruler finger aiming, a palm settling 12px 300ms after it, then a ' + len + 'px line', len < 30 ? [] : [[30, 70, 30 + len, 70]]);
    }
  }

  w.padDrop_();
  t.padOn('');
  try { w.localStorage.removeItem(k); w.localStorage.removeItem(bk); } catch (e) {}
  host.remove();
  t.USER(null);
  return bad;
});

