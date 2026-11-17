/* @family. — boardgames.js THE BOARD GAMES (414, 461; back 15 Nov 2026): Chess, Maze, Connect 4, Othello, Scrabble; chess rules from attic/js/chess-engine.js, boards from games.js before 133b259. */

const START = 'rnbqkbnrpppppppp________________________________PPPPPPPPRNBQKBNR'.split('');

const CH_WHITE = 'w', CH_BLACK = 'b';
const isWhite = p => p !== '_' && p === p.toUpperCase();
const colourOf = p => p === '_' ? null : (isWhite(p) ? CH_WHITE : CH_BLACK);

/* A position is the board plus the four things you cannot see on it: § */
function newGame() {
  return {
    board: START.slice(),
    turn: CH_WHITE,
    castle: { K: true, Q: true, k: true, q: true },   // K/Q = white king/queen side
    ep: -1,                                            // square a pawn may be captured on, or -1
    halfmove: 0,                                       // for the fifty-move rule
  };
}

const file = i => i % 8;
const rank = i => Math.floor(i / 8);
const onBoard = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;
const idx = (f, r) => r * 8 + f;

/* ---------- MOVES A PIECE COULD MAKE, ignoring whether the king is left in check § */
function pseudoMoves(pos, from) {
  const b = pos.board, p = b[from];
  if (p === '_') return [];
  const me = colourOf(p);
  const f = file(from), r = rank(from);
  const out = [];
  const add = (tf, tr, opts) => {
    if (!onBoard(tf, tr)) return false;
    const to = idx(tf, tr);
    const t = b[to];
    if (t !== '_' && colourOf(t) === me) return false;      // own piece blocks
    out.push({ from, to, ...(opts || {}) });
    return t === '_';                                        // may continue if empty
  };
  const ray = (df, dr) => {
    for (let k = 1; k < 8; k++) if (!add(f + df * k, r + dr * k)) break;
  };

  const up = me === CH_WHITE ? -1 : 1;                          // white moves toward rank 0
  switch (p.toLowerCase()) {
    case 'p': {
      const one = idx(f, r + up);
      if (onBoard(f, r + up) && b[one] === '_') {
        // Promotion: a pawn reaching the last rank must become something.
        const last = (me === CH_WHITE && r + up === 0) || (me === CH_BLACK && r + up === 7);
        if (last) 'QRBN'.split('').forEach(q => out.push({ from, to: one, promote: q }));
        else out.push({ from, to: one });

        const startRank = me === CH_WHITE ? 6 : 1;
        const two = idx(f, r + up * 2);
        if (r === startRank && b[two] === '_') out.push({ from, to: two, double: true });
      }
      // Captures, including en passant — the one capture that lands on an empty square.
      [-1, 1].forEach(df => {
        const tf = f + df, tr = r + up;
        if (!onBoard(tf, tr)) return;
        const to = idx(tf, tr);
        const t = b[to];
        if (t !== '_' && colourOf(t) !== me) {
          const last = tr === 0 || tr === 7;
          if (last) 'QRBN'.split('').forEach(q => out.push({ from, to, promote: q }));
          else out.push({ from, to });
        } else if (to === pos.ep) {
          out.push({ from, to, enpassant: true });
        }
      });
      break;
    }
    case 'n':
      [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]
        .forEach(([df, dr]) => add(f + df, r + dr));
      break;
    case 'b': [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'r': [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'q': [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'k':
      [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]].forEach(([df,dr]) => add(f+df, r+dr));
      break;
  }
  return out;
}

/** Is `sq` attacked by `by`? Asked of the king's square to find check. */
function attacked(pos, sq, by) {
  for (let i = 0; i < 64; i++) {
    const p = pos.board[i];
    if (p === '_' || colourOf(p) !== by) continue;
    /* Pawns are the exception: § */
    if (p.toLowerCase() === 'p') {
      const up = by === CH_WHITE ? -1 : 1;
      const f = file(i), r = rank(i);
      if ((onBoard(f-1, r+up) && idx(f-1, r+up) === sq) ||
          (onBoard(f+1, r+up) && idx(f+1, r+up) === sq)) return true;
      continue;
    }
    if (pseudoMoves(pos, i).some(m => m.to === sq)) return true;
  }
  return false;
}

const kingSquare = (pos, side) =>
  pos.board.indexOf(side === CH_WHITE ? 'K' : 'k');

const inCheck = (pos, side) =>
  attacked(pos, kingSquare(pos, side), side === CH_WHITE ? CH_BLACK : CH_WHITE);

/** Play a move and hand back a NEW position. Nothing mutates, so undo is free and search is safe. */
function play(pos, m) {
  const n = {
    board: pos.board.slice(),
    turn: pos.turn === CH_WHITE ? CH_BLACK : CH_WHITE,
    castle: { ...pos.castle },
    ep: -1,
    halfmove: pos.halfmove + 1,
  };
  const p = n.board[m.from];
  const isPawn = p.toLowerCase() === 'p';
  if (isPawn || n.board[m.to] !== '_') n.halfmove = 0;

  n.board[m.to] = m.promote ? (isWhite(p) ? m.promote : m.promote.toLowerCase()) : p;
  n.board[m.from] = '_';

  // En passant: the captured pawn is not on the square you landed on.
  if (m.enpassant) n.board[idx(file(m.to), rank(m.from))] = '_';
  if (m.double) n.ep = idx(file(m.from), (rank(m.from) + rank(m.to)) / 2);

  // Castling moves the rook too.
  if (m.castle === 'K') { n.board[63] = '_'; n.board[61] = 'R'; }
  if (m.castle === 'Q') { n.board[56] = '_'; n.board[59] = 'R'; }
  if (m.castle === 'k') { n.board[7]  = '_'; n.board[5]  = 'r'; }
  if (m.castle === 'q') { n.board[0]  = '_'; n.board[3]  = 'r'; }

  /* Rights are lost by the king or rook MOVING, and also by a rook being captured on its home
     square — the second is the one implementations forget. */
  if (p === 'K') { n.castle.K = n.castle.Q = false; }
  if (p === 'k') { n.castle.k = n.castle.q = false; }
  if (m.from === 63 || m.to === 63) n.castle.K = false;
  if (m.from === 56 || m.to === 56) n.castle.Q = false;
  if (m.from === 7  || m.to === 7)  n.castle.k = false;
  if (m.from === 0  || m.to === 0)  n.castle.q = false;

  return n;
}

/** Every LEGAL move for the side to play — pseudo-moves, minus those that leave the king in check. */
function legalMoves(pos) {
  const side = pos.turn;
  const out = [];
  for (let i = 0; i < 64; i++) {
    if (pos.board[i] === '_' || colourOf(pos.board[i]) !== side) continue;
    for (const m of pseudoMoves(pos, i)) {
      if (!inCheck(play(pos, m), side)) out.push(m);
    }
  }

  /* Castling, which has four conditions and is where most implementations leak:
     the right survives, the squares between are empty, the king is not in check now, and it does
     not PASS THROUGH or land on an attacked square. */
  const them = side === CH_WHITE ? CH_BLACK : CH_WHITE;
  const k = kingSquare(pos, side);
  const safe = sq => !attacked(pos, sq, them);
  if (!inCheck(pos, side)) {
    if (side === CH_WHITE && k === 60) {
      if (pos.castle.K && pos.board[61] === '_' && pos.board[62] === '_'
          && pos.board[63] === 'R' && safe(61) && safe(62))
        out.push({ from: 60, to: 62, castle: 'K' });
      if (pos.castle.Q && pos.board[59] === '_' && pos.board[58] === '_' && pos.board[57] === '_'
          && pos.board[56] === 'R' && safe(59) && safe(58))
        out.push({ from: 60, to: 58, castle: 'Q' });
    }
    if (side === CH_BLACK && k === 4) {
      if (pos.castle.k && pos.board[5] === '_' && pos.board[6] === '_'
          && pos.board[7] === 'r' && safe(5) && safe(6))
        out.push({ from: 4, to: 6, castle: 'k' });
      if (pos.castle.q && pos.board[3] === '_' && pos.board[2] === '_' && pos.board[1] === '_'
          && pos.board[0] === 'r' && safe(3) && safe(2))
        out.push({ from: 4, to: 2, castle: 'q' });
    }
  }
  return out;
}

/** Checkmate, stalemate, or neither. No legal moves plus check is mate; without check it's a draw. */
function outcome(pos) {
  if (legalMoves(pos).length) return null;
  return inCheck(pos, pos.turn) ? 'mate' : 'stalemate';
}


/* THE GAME IN PLAY and the solid glyphs for both sides (the colour comes from CSS); these sat in receipt.js before 133b259. */
let CHESS = null, CHESS_PICK = -1, CHESS_HIST = [], CHESS_PROMO = null, CHESS_LAST = null, CHESS_ARM = 0;
const GLYPH = { K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟', k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟' };

/* ---------- CHESS, TWO PLAYERS ROUND ONE PHONE § */
const CH_FILES = 'abcdefgh';
const CH_NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const chSide_ = s => s === CH_WHITE ? 'White' : 'Black';
const chSq_ = i => CH_FILES[file(i)] + (8 - rank(i));
/* ---------- THE BOARD MOVES LIKE A BOARD (429, "make it more cinematic") ---------- */
/* WHAT THE LAST PRESS DID, for the next draw to show ONCE: a glide, a capture, a check, an ending. A draw for any other reason (a pick, a note) shows the position still. */
let CHESS_FX = null;
/* THE BOARD TURNS TO FACE WHOEVER IS TO MOVE, if asked; per device, a convenience (`chess-turns`). Off, White stays at the foot as it always did. */
let CHESS_TURNS = keep_.get('chess-turns') === '1';
let CHESS_FACE_T = 0;
/* REDUCED MOTION MOVES INSTANTLY: no glide, no shake, no fall — the ending is drawn as it ends. Asked through the app's one `motionOK_` (537). */
/* A GLIDE TAKES LONGER THE FURTHER IT GOES, but never long enough to wait for: a rook across the board is 380ms. */
const chessGlideMs_ = (a, b) => Math.min(380, 170 + 32 * Math.hypot(file(a) - file(b), rank(a) - rank(b)));
const CH_ROOK = { K: [63, 61], Q: [56, 59], k: [7, 5], q: [0, 3] };
const CH_END_SAID = { mate: 'Checkmate', stalemate: 'Stalemate', fifty: 'Draw', material: 'Draw' };
function chessReset_() {
  CHESS = newGame(); CHESS_HIST = []; CHESS_PICK = -1; CHESS_PROMO = null; CHESS_LAST = null; CHESS_ARM = 0;
  CHESS_FX = null;
}
function initChess() {
  if (!$('chess-board')) return;
  if (!CHESS) chessReset_();
  drawChess();
}
/* THE GAME IS OVER, and why. § */
function chessEnd_(pos) {
  const end = outcome(pos);
  if (end) return end;
  if (pos.halfmove >= 100) return 'fifty';
  const rest = pos.board.filter(p => p !== '_' && p.toLowerCase() !== 'k');
  if (!rest.length || (rest.length === 1 && /[bn]/i.test(rest[0]))) return 'material';
  return null;
}
function chessStatus_() {
  const end = chessEnd_(CHESS);
  const side = chSide_(CHESS.turn), other = chSide_(CHESS.turn === CH_WHITE ? CH_BLACK : CH_WHITE);
  if (end === 'mate') return `Checkmate — ${other} wins.`;
  if (end === 'stalemate') return `Stalemate — ${side} has no legal move. A draw.`;
  if (end === 'fifty') return 'A draw — 50 moves each with no capture and no pawn move.';
  if (end === 'material') return 'A draw — neither side has enough left to checkmate.';
  if (CHESS_PROMO) return `${side} — promote the pawn to:`;
  return inCheck(CHESS, CHESS.turn) ? `${side} to move — check!` : `${side} to move`;
}
/* THE ROW UNDER THE BOARD IS TILES — the board is a thing. Drawn here and not in the widget's markup because tiles.js loads after map.js. */
function chessTiles_() {
  return tile_({ icon: 'undo', label: 'Undo', note: 'take back the last move', act: 'chess-undo', off: !CHESS_HIST.length })
    + tile_({ icon: 'turn', label: chessTurnSaid_(), act: 'chess-turn', on: CHESS_TURNS, pressed: CHESS_TURNS })
    + tile_({ icon: 'again', label: 'New game', act: 'chess-new' });
}
const chessTurnSaid_ = () => CHESS_TURNS ? 'The board turns to face each player' : 'The board stays with White at the foot';
function drawChess(note) {
  if (!CHESS) return;
  const fx = CHESS_FX; CHESS_FX = null;
  const moving = !!fx && motionOK_();
  const end = chessEnd_(CHESS);
  const mine = CHESS_PICK >= 0 ? legalMoves(CHESS).filter(m => m.from === CHESS_PICK) : [];
  const checked = inCheck(CHESS, CHESS.turn) ? kingSquare(CHESS, CHESS.turn) : -1;
  const board = CHESS.board.map((p, i) => {
    const cls = ['sq', 'chess-sq', (file(i) + rank(i)) % 2 ? 'dk' : 'lt'];
    if (i === CHESS_PICK) cls.push('pick');
    /* A CAPTURE IS RINGED AND A QUIET MOVE IS A DOT — and en passant is a capture that lands on an
       empty square, so it is asked of the move rather than of what is standing on the square. */
    const hit = mine.find(m => m.to === i);
    if (hit) cls.push(p !== '_' || hit.enpassant ? 'take' : 'can');
    if (CHESS_LAST && (i === CHESS_LAST.from || i === CHESS_LAST.to)) cls.push('last');
    if (i === CHESS_LAST?.to) cls.push('last-to');
    if (i === checked) cls.push('chk');
    if (i === checked && moving && fx.check) cls.push('is-new');
    const fell = end === 'mate' && i === checked;
    if (fell) cls.push('fell');
    if (p !== '_') cls.push(isWhite(p) ? 'wp' : 'bp');
    const who = p === '_' ? '' : ', ' + (isWhite(p) ? 'white ' : 'black ') + CH_NAME[p.toLowerCase()];
    /* THE PIECE IS ITS OWN BOX so it can travel over the squares without the square going with it. */
    return tile_({ form: true, look: cls.join(' '), act: 'chess-sq', data: { sq: i }, aria: chSq_(i) + who,
      html: p === '_' ? '' : `<span class="pc${fell ? ' fallen' : ''}">${GLYPH[p]}</span>` });
  }).join('');
  /* PROMOTION IS ASKED, NOT ASSUMED. § */
  const promo = CHESS_PROMO ? 'QRBN'.split('').map(q => {
    const g = CHESS.turn === CH_WHITE ? q : q.toLowerCase();
    return tile_({ form: true, look: 'btn quiet chess-pro ' + (CHESS.turn === CH_WHITE ? 'wp' : 'bp'), act: 'chess-promo',
      data: { p: q }, aria: CH_NAME[q.toLowerCase()], html: GLYPH[g] });
  }).join('') : '';
  const armed = Date.now() - CHESS_ARM < 3000;
  document.querySelectorAll('.chess-game').forEach(root => {
    const b = root.querySelector('.chess');
    if (b) {
      b.innerHTML = board;
      /* THE ENDING IS THE BOARD'S OWN LAYERS (`data-end`, ::before and ::after), not a child: every child of a board is a square (check/ui.js). */
      b.classList.toggle('is-over', !!end);
      b.classList.toggle('is-mate', end === 'mate');
      if (end) b.setAttribute('data-end', CH_END_SAID[end] || 'Draw'); else b.removeAttribute('data-end');
      b.classList.toggle('is-fresh', moving && !!fx.end);
      if (moving) chessShow_(b, fx);
    }
    const s = root.querySelector('.chess-say');
    if (s) { s.textContent = note || chessStatus_(); s.classList.toggle('is-note', !!note); }
    const pr = root.querySelector('.chess-promo'); if (pr) { pr.innerHTML = promo; pr.hidden = !promo; }
    const ctl = root.querySelector('.chess-ctl');
    if (ctl) {
      ctl.hidden = !!promo;
      if (!ctl.querySelector('.tile')) ctl.innerHTML = chessTiles_();
      tileSet_(ctl.querySelector('[data-do="chess-undo"]'), { off: !CHESS_HIST.length });
      tileSet_(ctl.querySelector('[data-do="chess-turn"]'), { label: chessTurnSaid_(), on: CHESS_TURNS, pressed: CHESS_TURNS });
      tileSet_(ctl.querySelector('[data-do="chess-new"]'), { label: armed ? 'Tap again to start over' : 'New game', on: armed });
    }
  });
  chessFace_(moving && fx.glides ? Math.max(...fx.glides.map(g => chessGlideMs_(g[0], g[1]))) + 90 : 0);
}
/* THE SCALE AT EACH STEP OF THE TURN: a square turned by θ fits its old box at 1 / (|cos θ| + |sin θ|). Same easing as the stylesheet's turn, so they keep step. */
const CHESS_TURN_KEYS = Array.from({ length: 13 }, (_, k) => {
  const th = Math.PI * k / 12;
  return { transform: `scale(${(1 / (Math.abs(Math.cos(th)) + Math.abs(Math.sin(th)))).toFixed(3)})`, offset: k / 12 };
});
/* ---------- THE BOARD TURNS AFTER THE PIECE HAS LANDED, never under it. A game that is over stays as it ended. ---------- */
function chessFace_(wait) {
  clearTimeout(CHESS_FACE_T);
  const turn = () => {
    const end = CHESS && chessEnd_(CHESS);
    const flip = !!(CHESS && CHESS_TURNS && CHESS.turn === CH_BLACK);
    document.querySelectorAll('.chess-game .chess').forEach(b => {
      if (b.classList.contains('is-flipped') === flip || (end && CHESS_TURNS)) return;
      b.classList.toggle('is-flipped', flip);
      /* DRAWN BACK AS IT TURNS, exactly as far as keeps a turned square inside its own footprint, so no corner covers the words or leaves the screen. */
      /* ITS TIME AND CURVE ARE THE BOARD'S OWN `--chess-turn`/`--chess-ease`, the ones its rotate transition uses, so the two never part (537). */
      if (motionOK_() && typeof b.animate === 'function') {
        const cs = getComputedStyle(b), sec = parseFloat(cs.getPropertyValue('--chess-turn'));
        b.animate(CHESS_TURN_KEYS, { duration: isFinite(sec) ? sec * 1000 : MOTION_.move,
                                     easing: cs.getPropertyValue('--chess-ease').trim() || MOTION_.spring });
      }
    });
  };
  /* A BOARD JUST REDRAWN IS STYLED FIRST, so its new pieces turn with it rather than starting the turn already turned. */
  if (wait > 0) CHESS_FACE_T = setTimeout(turn, wait);
  else { document.querySelectorAll('.chess-game .chess').forEach(b => void b.offsetWidth); turn(); }
}
/* ---------- WHAT A MOVE LOOKS LIKE: transforms and opacity only, so a phone composites it and paints nothing. ---------- */
function chessShow_(b, fx) {
  if (typeof b.animate !== 'function') return;
  const sq = i => b.querySelector(`[data-sq="${i}"]`);
  let land = 0;
  (fx.glides || []).forEach(([a, z]) => {
    const from = sq(a), to = sq(z), pc = to && to.querySelector('.pc');
    if (!from || !pc) return;
    const ra = from.getBoundingClientRect(), rz = to.getBoundingClientRect();
    if (!ra.width) return;                                   // a copy that is not drawn has nothing to see
    const dx = ra.left - rz.left, dy = ra.top - rz.top, ms = chessGlideMs_(a, z);
    land = Math.max(land, ms);
    to.classList.add('mv');
    /* LIFTED, CARRIED, SET DOWN: a little bigger in the middle of the journey, as a hand lifts a piece. */
    const an = pc.animate([
      { transform: `translate(${dx}px, ${dy}px)` },
      { transform: `translate(${dx / 2}px, ${dy / 2}px) scale(1.14)`, offset: 0.5 },
      { transform: 'none' }], { duration: ms, easing: MOTION_.spring });
    const done = () => to.classList.remove('mv');
    an.onfinish = done; an.oncancel = done;
  });
  /* A CAPTURE: the taken piece holds its square until the taker arrives, then is knocked away, and the board jolts once. */
  if (fx.took >= 0 && fx.gone && !fx.back) {
    const at = sq(fx.took);
    if (at) {
      const g = document.createElement('span');
      g.className = 'pc ghost ' + (isWhite(fx.gone) ? 'wp' : 'bp');
      g.setAttribute('aria-hidden', 'true');
      g.textContent = GLYPH[fx.gone];
      at.prepend(g);
      const knock = MOTION_.enter, hit = land ? Math.max(0.5, (land - 40) / (land + knock)) : 0;
      const an = g.animate([
        { opacity: 1, transform: 'none' },
        { opacity: 1, transform: 'none', offset: hit },
        { opacity: 0, transform: 'scale(.5) rotate(-18deg)' }], { duration: land + knock, easing: MOTION_.in, fill: 'forwards' });
      const gone = () => g.remove();
      an.onfinish = gone; an.oncancel = gone;
      b.animate([
        { transform: 'none' }, { transform: 'translate(-3px, 1px)' }, { transform: 'translate(3px, -1px)' },
        { transform: 'translate(-1px, 0)' }, { transform: 'none' }], { duration: knock, delay: Math.max(0, land - 30) });
    }
  }
  /* AN UNDONE CAPTURE COMES BACK, faded up where it stood. */
  if (fx.back && fx.took >= 0) {
    const pc = sq(fx.took)?.querySelector('.pc');
    if (pc) pc.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }],
                       { duration: MOTION_.move, delay: land * 0.5, easing: MOTION_.out, fill: 'backwards' });
  }
  /* CHECK: the king flinches as the threat lands; the ring that pulses round it is the stylesheet's (`.chk.is-new`). */
  if (fx.check) {
    const k = b.querySelector('.chk .pc');
    if (k) k.animate([
      { transform: 'none' }, { transform: 'translateX(-.06em) rotate(-6deg)' }, { transform: 'translateX(.06em) rotate(5deg)' },
      { transform: 'translateX(-.03em) rotate(-2deg)' }, { transform: 'none' }], { duration: MOTION_.move * 1.5, delay: land });
  }
}
/* ---------- AND WHAT IT SOUNDS LIKE, through the marking sounds' own context (`markHear_`, submit.js), woken by this press. ---------- */
/* A KNOCK OF WOOD for a move, a deeper one for a capture, two rising notes for check, three falling for mate. Quiet: two people are talking over this board. */
const CHESS_TONES = {
  move:  [['triangle', 196, 0, 0.09, 0.07]],
  take:  [['triangle', 131, 0, 0.16, 0.09], ['triangle', 262, 0, 0.06, 0.04]],
  check: [['sine', 659, 0, 0.12, 0.03], ['sine', 988, 0.1, 0.2, 0.03]],
  mate:  [['sine', 523, 0, 0.22, 0.035], ['sine', 392, 0.18, 0.26, 0.035], ['sine', 262, 0.4, 0.6, 0.04]],
};
function chessSound_(kind, wait) {
  const notes = CHESS_TONES[kind];
  if (!notes || typeof markHear_ !== 'function') return;
  const ac = markHear_();
  if (!ac) return;
  const go = () => {
    try {
      if (ac.state !== 'running') return;
      const t0 = ac.currentTime + 0.02 + (wait || 0) / 1000;
      let end = t0;
      notes.forEach(([type, f, at, len, peak]) => {
        const a = t0 + at, z = a + len;
        const g = ac.createGain();
        g.gain.setValueAtTime(0, a);
        g.gain.linearRampToValueAtTime(peak, a + 0.006);
        g.gain.exponentialRampToValueAtTime(peak / 1000, z);
        g.connect(ac.destination);
        const o = ac.createOscillator();
        o.type = type;
        o.frequency.setValueAtTime(f, a);
        o.connect(g);
        o.start(a);
        o.stop(z + 0.02);
        end = Math.max(end, z);
      });
      if (typeof markRest_ === 'function') markRest_(Math.max(0, end - ac.currentTime) * 1000 + MARK_REST_MS);
    } catch (e) {}
  };
  if (ac.state === 'running') { go(); return; }
  try { const p = ac.resume(); if (p && typeof p.then === 'function') p.then(go, () => {}); } catch (e) {}
}
function chessPlay_(m) {
  const took = m.enpassant ? idx(file(m.to), rank(m.from)) : (CHESS.board[m.to] !== '_' ? m.to : -1);
  const fx = { glides: [[m.from, m.to]].concat(m.castle ? [CH_ROOK[m.castle]] : []),
               took: took, gone: took >= 0 ? CHESS.board[took] : '' };
  CHESS_HIST.push({ pos: CHESS, last: CHESS_LAST, fx: fx });
  CHESS = play(CHESS, m);
  CHESS_LAST = { from: m.from, to: m.to };
  CHESS_PICK = -1; CHESS_PROMO = null; CHESS_ARM = 0;
  const end = chessEnd_(CHESS), check = !end && inCheck(CHESS, CHESS.turn);
  CHESS_FX = Object.assign({}, fx, { end: end, check: check });
  drawChess();
  /* HEARD AS THE PIECE LANDS, not as the finger lifts. */
  const land = motionOK_() ? Math.max(...fx.glides.map(g => chessGlideMs_(g[0], g[1]))) : 0;
  chessSound_(end === 'mate' ? 'mate' : check ? 'check' : took >= 0 ? 'take' : 'move', land);
}
/* A TAP. Three things it can mean and they are tried in the order a player means them: § */
on('chess-sq', el => {
  if (!CHESS) chessReset_();
  const i = Number(el.dataset.sq);
  if (chessEnd_(CHESS)) return drawChess('The game is over — New game to play again.');
  if (CHESS_PROMO) return drawChess();
  const moves = legalMoves(CHESS);
  if (CHESS_PICK >= 0) {
    const hits = moves.filter(m => m.from === CHESS_PICK && m.to === i);
    if (hits.length) {
      if (hits.some(m => m.promote)) { CHESS_PROMO = { from: CHESS_PICK, to: i }; return drawChess(); }
      return chessPlay_(hits[0]);
    }
  }
  const p = CHESS.board[i];
  if (p !== '_' && colourOf(p) === CHESS.turn) {
    CHESS_PICK = CHESS_PICK === i ? -1 : i;        // the same piece again puts it back down
    if (CHESS_PICK >= 0 && !moves.some(m => m.from === i))
      return drawChess(`That ${CH_NAME[p.toLowerCase()]} has no legal move${inCheck(CHESS, CHESS.turn) ? ' — you are in check' : ''}.`);
    return drawChess();
  }
  const wasPicked = CHESS_PICK >= 0;
  CHESS_PICK = -1;
  if (wasPicked) return drawChess(inCheck(CHESS, CHESS.turn) ? 'Not legal — you are in check.' : 'That piece cannot go there.');
  if (p !== '_') return drawChess(`It is ${chSide_(CHESS.turn)}'s move.`);
  drawChess();
});
on('chess-promo', el => {
  if (!CHESS_PROMO) return drawChess();
  const m = legalMoves(CHESS).find(x => x.from === CHESS_PROMO.from && x.to === CHESS_PROMO.to && x.promote === el.dataset.p);
  if (m) chessPlay_(m); else { CHESS_PROMO = null; drawChess(); }
});
/* UNDO takes back one move, either side's — two people at one board agree on that out loud, and an app that refused it would be stricter than the table. § */
on('chess-undo', () => {
  if (!CHESS) return;
  if (CHESS_PROMO) { CHESS_PROMO = null; CHESS_PICK = -1; return drawChess(); }
  const h = CHESS_HIST.pop();
  /* THE MOVE GOES BACK THE WAY IT CAME, and what it took is put back on its square. */
  if (h) {
    CHESS = h.pos; CHESS_LAST = h.last;
    if (h.fx) CHESS_FX = { glides: h.fx.glides.map(([a, z]) => [z, a]), took: h.fx.took, back: true };
  }
  CHESS_PICK = -1; CHESS_ARM = 0;
  drawChess();
});
/* TURN THE BOARD: a switch, saying the state it is in. On, the board turns now if it is Black's move, and after every move from here. */
on('chess-turn', () => {
  CHESS_TURNS = !CHESS_TURNS;
  keep_.put('chess-turns', CHESS_TURNS ? '1' : null);
  if (!CHESS) chessReset_();
  drawChess(CHESS_TURNS ? 'The board turns with each move.' : 'White stays at the foot.');
});
/* NEW GAME THROWS A GAME AWAY, so a game in progress asks twice — the line above the board says so and goes back
   by itself. A finished game or an empty board starts over at once: there is nothing to lose. */
on('chess-new', () => {
  const live = CHESS && CHESS_HIST.length && !chessEnd_(CHESS);
  if (live && Date.now() - CHESS_ARM >= 3000) {
    CHESS_ARM = Date.now();
    setTimeout(() => drawChess(), 3100);
    return drawChess('Tap New game again to start over.');
  }
  chessReset_();
  drawChess();
});
/* CONNECT 4, OTHELLO AND HERD MENTALITY THREE GAMES, ONE SHAPE. § */

/* ---------- CONNECT 4 § */
const C4_W = 7, C4_H = 6;
let c4 = null;
/* THE TWO SIDES, NAMED ONCE. § */
const C4_NAME = { 1: 'Red', 2: 'Yellow' };
function initConnect4() {
  const host = $('c4-board');
  if (!host) return;
  /* REBUILT FROM NOTHING EVERY TIME THE WIDGET OPENS. § */
  /* `last` IS THE COUNTER JUST PLAYED, which is the one that falls — see `c4Paint`. `win` is the
     line that ended the game, which is ringed. */
  c4 = { cells: new Array(C4_W * C4_H).fill(0), turn: 1, over: false, said: 'Red starts — tap a column.',
         last: null, win: null };
  c4Paint();
}
const c4At = (x, y) => c4.cells[y * C4_W + x];
/* THE LOWEST EMPTY SQUARE IN A COLUMN, or -1 when it is full. Everything else asks this. */
function c4Drop_(cells, x) {
  for (let y = C4_H - 1; y >= 0; y--) if (!cells[y * C4_W + x]) return y;
  return -1;
}
/* FOUR IN A LINE THROUGH A SQUARE, checked in the four directions that matter. § */
function c4Line_(cells, x, y, who) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const won = [];
  dirs.forEach(([dx, dy]) => {
    const line = [y * C4_W + x];
    for (const s of [1, -1]) {
      for (let i = 1; i < 4; i++) {
        const nx = x + dx * i * s, ny = y + dy * i * s;
        if (nx < 0 || nx >= C4_W || ny < 0 || ny >= C4_H) break;
        if (cells[ny * C4_W + nx] !== who) break;
        line.push(ny * C4_W + nx);
      }
    }
    if (line.length >= 4) line.forEach(i => { if (won.indexOf(i) < 0) won.push(i); });
  });
  return won;
}
function c4Play_(x) {
  if (!c4 || c4.over) return;
  const y = c4Drop_(c4.cells, x);
  /* A FULL COLUMN PLAYS NOTHING, SO NOTHING FALLS: `last` is not set, and the paint that showed the
     previous counter has already spent it — see `c4Paint`. */
  if (y < 0) { c4.said = 'That column is full.'; return; }
  c4.cells[y * C4_W + x] = c4.turn;
  c4.last = { x, y };
  const line = c4Line_(c4.cells, x, y, c4.turn);
  if (line.length) {
    c4.over = true;
    c4.win = line;
    c4.said = C4_NAME[c4.turn] + ' wins.';
  } else if (c4.cells.every(Boolean)) {
    c4.over = true; c4.said = 'Full board — a draw.';
  } else {
    c4.turn = c4.turn === 1 ? 2 : 1;
    c4.said = C4_NAME[c4.turn] + '\u2019s go.';
  }
}
/* ---------- THE COUNTER FALLS, AND THE FOUR THAT WON ARE RINGED § */
function c4Paint() {
  const host = $('c4-board');
  if (!host || !c4) return;
  const last = c4.last;
  c4.last = null;
  const win = c4.win || [];
  let html = '';
  for (let y = 0; y < C4_H; y++) {
    for (let x = 0; x < C4_W; x++) {
      const v = c4At(x, y);
      const fell = last && last.x === x && last.y === y;
      /* THE WHOLE COLUMN IS ONE TARGET, so every square in it carries the same `data-x` and the
         same label. A screen reader hears "column 4" six times rather than 42 unnamed squares. */
      /* HOW FAR IT FELL is a class (`c4-f1`…`c4-f6`), which style.css turns into the fall's length. */
      html += tile_({ form: true, look: 'c4-cell' + (v ? (v === 1 ? ' p1' : ' p2') : '') + (fell ? ' c4-new c4-f' + (y + 1) : '')
        + (win.indexOf(y * C4_W + x) >= 0 ? ' c4-win' : ''), act: 'c4-play', data: { x }, aria: 'Column ' + (x + 1), off: !!c4.over, html: '' });
    }
  }
  host.innerHTML = html;
  const said = $('c4-said');
  if (said) {
    const draw = c4.over && !win.length;
    said.innerHTML = (draw ? '' : `<i class="c4-turn ${c4.turn === 1 ? 'p1' : 'p2'}" aria-hidden="true"></i>`)
      + esc(c4.said);
  }
}
on('c4-play', el => {
  c4Play_(Number(el.getAttribute('data-x')));
  c4Paint();
});
on('c4-again', () => { initConnect4(); });
/* ---------- OTHELLO § */
const OTH_N = 8;
let oth = null;
const OTH_NAME = { 1: 'Red', 2: 'Blue' };
function initOthello() {
  if (!$('oth-board')) return;
  const cells = new Array(OTH_N * OTH_N).fill(0);
  const m = OTH_N / 2;
  cells[(m - 1) * OTH_N + (m - 1)] = 2; cells[(m - 1) * OTH_N + m] = 1;
  cells[m * OTH_N + (m - 1)] = 1;       cells[m * OTH_N + m] = 2;
  oth = { cells, turn: 1, over: false, said: 'Red starts.' };
  othPaint();
}
function othFlips_(cells, i, who) {
  if (cells[i]) return [];
  const x0 = i % OTH_N, y0 = (i / OTH_N) | 0, them = who === 1 ? 2 : 1, out = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    if (!dx && !dy) continue;
    const run = [];
    let x = x0 + dx, y = y0 + dy;
    while (x >= 0 && x < OTH_N && y >= 0 && y < OTH_N && cells[y * OTH_N + x] === them) {
      run.push(y * OTH_N + x); x += dx; y += dy;
    }
    /* THE LINE ONLY COUNTS IF IT IS CLOSED BY ONE OF YOURS. A run that walks off the edge, or into
       an empty square, brackets nothing — which is the half of this rule that is easy to forget. */
    if (run.length && x >= 0 && x < OTH_N && y >= 0 && y < OTH_N && cells[y * OTH_N + x] === who) {
      out.push(...run);
    }
  }
  return out;
}
const othMoves_ = (cells, who) => {
  const out = [];
  for (let i = 0; i < cells.length; i++) if (othFlips_(cells, i, who).length) out.push(i);
  return out;
};
const othScore_ = cells => cells.reduce((a, v) => (v === 1 ? [a[0] + 1, a[1]] : v === 2 ? [a[0], a[1] + 1] : a), [0, 0]);
function othPlay_(i, who) {
  const flips = othFlips_(oth.cells, i, who);
  if (!flips.length) return false;
  oth.cells[i] = who;
  flips.forEach(j => { oth.cells[j] = who; });
  return true;
}
/* WHOSE TURN IT IS NEXT, which is not simply "the other one". */
function othAdvance_() {
  const other = oth.turn === 1 ? 2 : 1;
  if (othMoves_(oth.cells, other).length) { oth.turn = other; oth.said = OTH_NAME[other] + '\u2019s go.'; return; }
  if (othMoves_(oth.cells, oth.turn).length) {
    oth.said = OTH_NAME[other] + ' has no move \u2014 ' + OTH_NAME[oth.turn] + ' goes again.';
    return;                                            // the same player goes again
  }
  oth.over = true;
  const [b, w] = othScore_(oth.cells);
  oth.said = b === w ? `Level, ${b}\u2013${w}.`
           : b > w ? `Red wins, ${b}\u2013${w}.` : `Blue wins, ${w}\u2013${b}.`;
}
function othPaint() {
  const host = $('oth-board');
  if (!host || !oth) return;
  let html = '';
  for (let i = 0; i < oth.cells.length; i++) {
    const v = oth.cells[i];
    html += tile_({ form: true, look: 'oth-cell' + (v === 1 ? ' p1' : v === 2 ? ' p2' : ''), act: 'oth-play', data: { i },
      aria: 'Row ' + (((i / OTH_N) | 0) + 1) + ' column ' + ((i % OTH_N) + 1), off: !!(v || oth.over), html: '' });
  }
  host.innerHTML = html;
  const [b, w] = othScore_(oth.cells);
  const sc = $('oth-score'); if (sc) sc.textContent = b + ' \u2013 ' + w;
  const said = $('oth-said'); if (said) said.textContent = oth.said;
}
on('oth-play', el => {
  if (!oth || oth.over) return;
  /* THE TAP IS ALWAYS ANSWERED, and what it says is the rule rather than the answer: "nothing to
     trap there" is true of every illegal square and names none of the legal ones. */
  if (!othPlay_(Number(el.getAttribute('data-i')), oth.turn)) {
    oth.said = 'Nothing to trap there \u2014 ' + OTH_NAME[oth.turn] + ' again.';
    othPaint();
    return;
  }
  othAdvance_();
  othPaint();
});
on('oth-again', () => { initOthello(); });
/* ---------- MAZE § */
const MAZE_N = 11;
/* ONE BIT PER WALL, so a cell is a number and carving is two lines. Read as compass points
   everywhere below, which is why the pad's buttons carry the same four letters. */
const MZ_N = 1, MZ_E = 2, MZ_S = 4, MZ_W = 8;
const MZ_DIRS = {
  n: { dx: 0, dy: -1, bit: MZ_N, back: MZ_S },
  e: { dx: 1, dy: 0, bit: MZ_E, back: MZ_W },
  s: { dx: 0, dy: 1, bit: MZ_S, back: MZ_N },
  w: { dx: -1, dy: 0, bit: MZ_W, back: MZ_E }
};
let maze = null;
const mzAt_ = (x, y) => y * MAZE_N + x;
const mzIn_ = (x, y) => x >= 0 && x < MAZE_N && y >= 0 && y < MAZE_N;
/* EVERY WALL UP, THEN A WALK THAT KNOCKS THEM DOWN. Iterative rather than recursive: a 121-cell
   maze is fine either way and a bigger one would not be, and a stack written out is a stack you can
   see the size of. */
function mzBuild_() {
  const cells = new Array(MAZE_N * MAZE_N).fill(MZ_N | MZ_E | MZ_S | MZ_W);
  const seen = new Array(MAZE_N * MAZE_N).fill(false);
  const stack = [[0, 0]];
  seen[0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    /* THE NEIGHBOURS NOT YET REACHED, shuffled, because taking them in a fixed order carves the
       same maze every time and taking the first one always carves a staircase. */
    const open = Object.keys(MZ_DIRS).filter(k => {
      const d = MZ_DIRS[k];
      return mzIn_(x + d.dx, y + d.dy) && !seen[mzAt_(x + d.dx, y + d.dy)];
    });
    if (!open.length) { stack.pop(); continue; }
    const k = open[Math.floor(Math.random() * open.length)];
    const d = MZ_DIRS[k];
    const nx = x + d.dx, ny = y + d.dy;
    /* BOTH SIDES OF THE SAME WALL. A wall belongs to two cells and removing it from one leaves a
       door you can walk through in one direction only — which draws correctly and plays wrongly. */
    cells[mzAt_(x, y)] &= ~d.bit;
    cells[mzAt_(nx, ny)] &= ~d.back;
    seen[mzAt_(nx, ny)] = true;
    stack.push([nx, ny]);
  }
  return cells;
}
/* THE FEWEST MOVES THERE ARE. Breadth-first, so the first time the exit is reached is by the
   shortest route — depth-first would find A route and call it the answer. */
function mzShortest_(cells) {
  const dist = new Array(MAZE_N * MAZE_N).fill(-1);
  const q = [0];
  dist[0] = 0;
  for (let i = 0; i < q.length; i++) {
    const at = q[i], x = at % MAZE_N, y = (at / MAZE_N) | 0;
    Object.keys(MZ_DIRS).forEach(k => {
      const d = MZ_DIRS[k];
      if (cells[at] & d.bit) return;                       // a wall is not a way out
      const nx = x + d.dx, ny = y + d.dy;
      if (!mzIn_(nx, ny) || dist[mzAt_(nx, ny)] !== -1) return;
      dist[mzAt_(nx, ny)] = dist[at] + 1;
      q.push(mzAt_(nx, ny));
    });
  }
  return dist[MAZE_N * MAZE_N - 1];
}
/* ---------- A MAZE IS KEPT UNTIL IT IS FINISHED, OR UNTIL `New maze` § */
function initMaze() {
  if (!$('maze-grid')) return;
  if (!maze || maze.over) mzDeal_();
  mazePaint();
}
function mzDeal_() {
  const cells = mzBuild_();
  /* NOTHING SAID AT THE START, because the line under the heading already says where you are going and this sat under it repeating it word for word -- which is the § */
  maze = { cells, x: 0, y: 0, moves: 0, best: mzShortest_(cells),
           trail: { 0: true }, over: false, said: '' };
}
function mzMove_(k) {
  if (!maze || maze.over) return;
  const d = MZ_DIRS[k];
  if (!d) return;
  /* A WALL STOPS YOU AND SAYS NOTHING. § */
  if (maze.cells[mzAt_(maze.x, maze.y)] & d.bit) return;
  const nx = maze.x + d.dx, ny = maze.y + d.dy;
  if (!mzIn_(nx, ny)) return;
  maze.x = nx; maze.y = ny;
  maze.moves++;
  maze.trail[mzAt_(nx, ny)] = true;
  if (nx === MAZE_N - 1 && ny === MAZE_N - 1) {
    maze.over = true;
    maze.said = maze.moves === maze.best
      ? 'Out in ' + maze.moves + ' — the shortest way there is.'
      : 'Out in ' + maze.moves + '. The shortest way is ' + maze.best + '.';
  }
}
function mazePaint() {
  const host = $('maze-grid');
  if (!host || !maze) return;
  let html = '';
  for (let y = 0; y < MAZE_N; y++) {
    for (let x = 0; x < MAZE_N; x++) {
      const v = maze.cells[mzAt_(x, y)];
      /* THE WALLS ARE `mz-n`/`mz-e`/`mz-s`/`mz-w`, AND THEY WERE `wn`/`we`/`ws`/`ww`. § */
      const cls = ['mz-cell'];
      if (v & MZ_N) cls.push('mz-n');
      if (v & MZ_E) cls.push('mz-e');
      if (v & MZ_S) cls.push('mz-s');
      if (v & MZ_W) cls.push('mz-w');
      if (maze.trail[mzAt_(x, y)]) cls.push('been');
      if (x === maze.x && y === maze.y) cls.push('you');
      if (x === MAZE_N - 1 && y === MAZE_N - 1) cls.push('out');
      html += '<i class="' + cls.join(' ') + '"></i>';
    }
  }
  /* NOT A LIST OF 121 SQUARES TO A SCREEN READER. § */
  host.innerHTML = html;
  host.setAttribute('aria-label',
    'Maze, row ' + (maze.y + 1) + ' of ' + MAZE_N + ', column ' + (maze.x + 1) + ' of ' + MAZE_N
    + (maze.over ? ', out' : ''));
  const said = $('maze-said'); if (said) said.textContent = maze.said;
  const n = $('maze-moves'); if (n) n.textContent = String(maze.moves);
}
on('maze-go', el => { mzMove_(el.getAttribute('data-d')); mazePaint(); });
on('maze-again', () => { mzDeal_(); mazePaint(); });
/* SCRABBLE — two, three or four people, one phone. § */
const SCR_N = 15;
/* THE STANDARD ENGLISH SET — 100 tiles, and the two blanks are the empty string. § */
const SCR_SET = [
  ['A', 9, 1], ['B', 2, 3], ['C', 2, 3], ['D', 4, 2], ['E', 12, 1], ['F', 2, 4], ['G', 3, 2],
  ['H', 2, 4], ['I', 9, 1], ['J', 1, 8], ['K', 1, 5], ['L', 4, 1], ['M', 2, 3], ['N', 6, 1],
  ['O', 8, 1], ['P', 2, 3], ['Q', 1, 10], ['R', 6, 1], ['S', 4, 1], ['T', 6, 1], ['U', 4, 1],
  ['V', 2, 4], ['W', 2, 4], ['X', 1, 8], ['Y', 2, 4], ['Z', 1, 10], ['', 2, 0],
];
const SCR_VALUE = {};
/* ---------- THE PREMIUM SQUARES, BUILT FROM ONE QUADRANT § */
const SCR_QUAD = [
  'T..d...T',
  '.D...t..',
  '..D...d.',
  'd..D...d',
  '....D...',
  '.t...t..',
  '..d...d.',
  'T..d...D',
];
function scrPrem_(i) {
  const r = (i / SCR_N) | 0, c = i % SCR_N;
  return SCR_QUAD[Math.min(r, SCR_N - 1 - r)][Math.min(c, SCR_N - 1 - c)];
}
const SCR_MID = ((SCR_N * SCR_N) - 1) / 2;
let scrabble = null;
/* Fisher-Yates, for the reason `herdShuffle_` gives: `sort(() => Math.random() - .5)` is the famous
   wrong one and deals the same few orders far too often. */
function scrShuffle_(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function scrBag_() {
  const bag = [];
  SCR_SET.forEach(t => { for (let i = 0; i < t[1]; i++) bag.push(t[0]); });
  return scrShuffle_(bag);
}
function scrDraw_(g, rack) {
  while (rack.length < 7 && g.bag.length) rack.push(g.bag.pop());
}
function scrNew_(n) {
  const g = { bag: scrBag_(), players: [], turn: 0, board: new Array(SCR_N * SCR_N).fill(null),
              placed: [], sel: null, swap: null, blank: null, first: true,
              handover: false, passes: 0, over: false, said: '' };
  for (let i = 0; i < n; i++) {
    const rack = [];
    scrDraw_(g, rack);
    g.players.push({ name: 'Player ' + (i + 1), rack, score: 0 });
  }
  return g;
}
function scrPlace_(g, i, rackIndex) {
  const p = g.players[g.turn];
  const letter = p.rack[rackIndex];
  g.board[i] = { letter: letter || '?', blank: letter === '', fresh: true, from: rackIndex };
  g.placed.push(i);
}
function scrRecall_(g) {
  g.placed.forEach(i => { g.board[i] = null; });
  g.placed = [];
  g.sel = null;
  g.blank = null;
}
/* ---------- THE RULES THAT ARE NOT A MATTER OF OPINION § */
function scrIllegal_(g) {
  if (!g.placed.length) return 'Put some tiles down first.';
  const rows = {}, cols = {};
  g.placed.forEach(i => { rows[(i / SCR_N) | 0] = 1; cols[i % SCR_N] = 1; });
  const oneRow = Object.keys(rows).length === 1, oneCol = Object.keys(cols).length === 1;
  if (!oneRow && !oneCol) return 'All your tiles have to be in one row or one column.';

  /* NO GAPS, counting the tiles that were already there — a word may bridge a letter somebody else
     played, and that is not a gap. */
  const step = oneRow ? 1 : SCR_N;
  const sorted = g.placed.slice().sort((a, b) => a - b);
  for (let i = sorted[0]; i <= sorted[sorted.length - 1]; i += step) {
    if (!g.board[i]) return 'There is a gap in your word.';
  }

  if (g.first) {
    if (g.placed.indexOf(SCR_MID) < 0) return 'The first word has to cover the middle square.';
    if (g.placed.length < 2) return 'The first word needs at least 2 letters.';
    return '';
  }
  /* AND IT HAS TO TOUCH SOMETHING. After the first move a word floating on its own is the one
     mistake that looks perfectly reasonable on screen. */
  const touches = g.placed.some(i => {
    const r = (i / SCR_N) | 0, c = i % SCR_N;
    return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([rr, cc]) => {
      if (rr < 0 || cc < 0 || rr >= SCR_N || cc >= SCR_N) return false;
      const t = g.board[rr * SCR_N + cc];
      return !!t && !t.fresh;
    });
  });
  return touches ? '' : 'Your word has to touch a tile that is already down.';
}
/* ---------- WHAT IT SCORES § */
function scrWordAt_(g, i, step) {
  let start = i;
  while (start - step >= 0 && scrSameLine_(start, start - step, step) && g.board[start - step]) {
    start -= step;
  }
  const out = [];
  for (let j = start; j < SCR_N * SCR_N && g.board[j]; j += step) {
    out.push(j);
    if (!scrSameLine_(j, j + step, step)) break;
  }
  return out;
}
/* A STEP OF 1 MAY NOT CROSS A ROW END, which an index alone cannot say — 14 and 15 are adjacent
   numbers and opposite ends of the board. */
function scrSameLine_(a, b, step) {
  if (b < 0 || b >= SCR_N * SCR_N) return false;
  return step === SCR_N || ((a / SCR_N) | 0) === ((b / SCR_N) | 0);
}
function scrScoreWord_(g, idx) {
  let sum = 0, mult = 1;
  idx.forEach(i => {
    const t = g.board[i];
    let v = t.blank ? 0 : (SCR_VALUE[t.letter] || 0);
    if (t.fresh) {
      const p = scrPrem_(i);
      if (p === 'd') v *= 2;
      else if (p === 't') v *= 3;
      else if (p === 'D') mult *= 2;
      else if (p === 'T') mult *= 3;
    }
    sum += v;
  });
  return sum * mult;
}
function scrScore_(g) {
  const rows = {}, cols = {};
  g.placed.forEach(i => { rows[(i / SCR_N) | 0] = 1; cols[i % SCR_N] = 1; });
  const acrossMain = Object.keys(rows).length === 1 && g.placed.length > 1;
  const main = acrossMain ? scrWordAt_(g, g.placed[0], 1) : scrWordAt_(g, g.placed[0], SCR_N);
  const words = [];
  if (main.length > 1) words.push(main);
  /* A one-tile move belongs to both directions and neither is "the main word", so both are gathered
     the same way as a cross word and the pair is scored once each. */
  g.placed.forEach(i => {
    const cross = acrossMain || g.placed.length === 1 ? scrWordAt_(g, i, SCR_N) : scrWordAt_(g, i, 1);
    if (cross.length > 1 && !words.some(w => w[0] === cross[0] && w.length === cross.length)) {
      words.push(cross);
    }
    if (g.placed.length === 1) {
      const other = scrWordAt_(g, i, 1);
      if (other.length > 1 && !words.some(w => w[0] === other[0] && w.length === other.length)) {
        words.push(other);
      }
    }
  });
  let total = words.reduce((n, w) => n + scrScoreWord_(g, w), 0);
  /* SEVEN TILES IS FIFTY, which is the game's own number and the thing everybody plays for. */
  if (g.placed.length === 7) total += 50;
  return { total, words: words.length };
}
function scrPlay_(g) {
  const why = scrIllegal_(g);
  if (why) { g.said = why; return; }
  const { total } = scrScore_(g);
  const p = g.players[g.turn];
  p.score += total;
  /* THE RACK LOSES THE TILES THAT WENT DOWN, by index, highest first — splicing low-to-high moves
     every index after the one removed and takes the wrong tile off next. */
  g.placed.map(i => g.board[i].from).sort((a, b) => b - a).forEach(n => { p.rack.splice(n, 1); });
  g.placed.forEach(i => { g.board[i].fresh = false; delete g.board[i].from; });
  const bingo = g.placed.length === 7;
  g.placed = [];
  g.sel = null;
  g.first = false;
  g.passes = 0;
  scrDraw_(g, p.rack);
  g.said = p.name + ' scored ' + total + (bingo ? ' — all 7, 50 on top.' : '.');
  /* THE GAME ENDS WHEN SOMEBODY GOES OUT AND THERE IS NOTHING LEFT TO DRAW. § */
  if (!p.rack.length && !g.bag.length) { scrFinish_(g, p); return; }
  scrNext_(g);
}
function scrFinish_(g, out) {
  let picked = 0;
  g.players.forEach(q => {
    if (q === out) return;
    const left = q.rack.reduce((n, l) => n + (SCR_VALUE[l] || 0), 0);
    q.score -= left;
    picked += left;
  });
  if (out) out.score += picked;
  g.over = true;
  g.handover = false;
  const best = g.players.slice().sort((a, b) => b.score - a.score);
  g.said = best[0].score === best[1].score
    ? 'A draw on ' + best[0].score + '.'
    : best[0].name + ' wins on ' + best[0].score + '.';
}
function scrNext_(g) {
  g.turn = (g.turn + 1) % g.players.length;
  g.sel = null;
  g.blank = null;
  g.swap = null;
  /* THE HAND-OVER IS THE STATE, not a message. Until the next player taps, the rack is not drawn at
     all — a rack you can read on the way past is a rack that is not secret. */
  g.handover = true;
}
function scrPass_(g) {
  scrRecall_(g);
  g.passes++;
  g.said = g.players[g.turn].name + ' passed.';
  /* TWICE ROUND AND NOBODY CAN MOVE. The printed rules end it after six scoreless turns; two
     passes each is the same idea at any number of players and needs no second counter. */
  if (g.passes >= g.players.length * 2) { scrFinish_(g, null); return; }
  scrNext_(g);
}
function scrSwapDo_(g) {
  const p = g.players[g.turn];
  const marked = (g.swap || []).slice().sort((a, b) => b - a);
  if (!marked.length) { g.swap = null; g.said = ''; return; }
  if (marked.length > g.bag.length) {
    g.said = 'Only ' + g.bag.length + ' left in the bag — you can swap that many.';
    return;
  }
  const back = marked.map(n => p.rack[n]);
  marked.forEach(n => { p.rack.splice(n, 1); });
  scrDraw_(g, p.rack);
  back.forEach(l => g.bag.push(l));
  scrShuffle_(g.bag);
  g.passes++;
  g.said = p.name + ' swapped ' + back.length + '.';
  if (g.passes >= g.players.length * 2) { scrFinish_(g, null); return; }
  scrNext_(g);
}
function initScrabble() {
  if (!$('scr-board')) return;
  scrabblePaint();
}
function scrCellsHtml_(g) {
  let html = '';
  for (let i = 0; i < SCR_N * SCR_N; i++) {
    const t = g ? g.board[i] : null;
    const p = scrPrem_(i);
    const cls = ['scr-sq'];
    if (p === 'T') cls.push('tw'); else if (p === 'D') cls.push('dw');
    else if (p === 't') cls.push('tl'); else if (p === 'd') cls.push('dl');
    if (i === SCR_MID) cls.push('mid');
    if (t) cls.push('has');
    if (t && t.fresh) cls.push('new');
    const v = t && !t.blank ? (SCR_VALUE[t.letter] || 0) : 0;
    /* ---------- A SQUARE IS ONLY A CONTROL WHILE THERE IS A GAME § */
    if (!g) { html += '<i class="' + cls.join(' ') + '"></i>'; continue; }
    html += tile_({ form: true, look: cls.join(' '), act: 'scr-cell', data: { i },
      aria: 'Row ' + (((i / SCR_N) | 0) + 1) + ' column ' + ((i % SCR_N) + 1) + (t ? ', ' + (t.blank ? 'blank as ' : '') + t.letter : ''),
      html: t ? esc(t.letter) + (v ? '<i>' + v + '</i>' : '') : '' });
  }
  return html;
}
function scrRackHtml_(g) {
  const p = g.players[g.turn];
  if (g.handover) {
    return '<p class="scr-hand">Hand the phone to <b>' + esc(p.name) + '</b>.</p>'
      + '' + tile_({ form: true, label: 'I have it', act: 'scr-hand' }) + '';
  }
  /* ---------- TWENTY-SIX LETTERS, AND NOT AS TWENTY-SIX BUTTONS § */
  if (g.blank !== null) {
    let opts = '<option value="">The blank is…</option>';
    for (let n = 0; n < 26; n++) {
      const l = String.fromCharCode(65 + n);
      opts += '<option value="' + l + '">' + l + '</option>';
    }
    return '<p class="scr-say">What is the blank?</p>'
      + formSelect_('class="scr-sel" data-do="scr-blank" aria-label="What the blank stands for"', opts);
  }
  /* ---------- A TILE THAT IS ON THE BOARD IS NOT ON THE RACK § */
  const used = {};
  g.placed.forEach(i => { used[g.board[i].from] = 1; });

  let html = '<div class="scr-rack">';
  p.rack.forEach((l, n) => {
    const marked = g.swap && g.swap.indexOf(n) >= 0;
    const gone = !!used[n];
    html += tile_({ form: true, look: 'scr-tile' + (g.sel === n ? ' on' : '') + (marked ? ' mark' : '') + (gone ? ' used' : ''),
      act: 'scr-rack', data: { i: n }, aria: gone ? 'That tile is on the board' : l ? 'Tile ' + l : 'Blank tile',
      html: gone || !l ? '' : esc(l) + '<i>' + (SCR_VALUE[l] || 0) + '</i>' });
  });
  html += '</div>';
  return html;
}
function scrabblePaint() {
  const host = $('scr-board');
  if (!host) return;
  const g = scrabble;
  host.innerHTML = scrCellsHtml_(g);

  const who = $('scr-who');
  const rack = $('scr-rack-box');
  const acts = $('scr-acts');
  const said = $('scr-said');
  const start = $('scr-start');

  if (!g) {
    if (start) start.hidden = false;
    if (who) who.textContent = '';
    if (rack) rack.innerHTML = '';
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = '';
    return;
  }
  /* THE PLAYER-COUNT ROW COMES BACK WHEN THE GAME IS OVER, because at that point "2, 3 or 4 players" IS "new game" and a second control saying so is a second thing § */
  if (start) start.hidden = !g.over;

  if (who) {
    who.innerHTML = g.players.map((p, n) =>
      '<span class="scr-p' + (n === g.turn && !g.over ? ' on' : '') + '">'
      + esc(p.name) + ' <b>' + p.score + '</b></span>').join('');
  }
  if (rack) rack.innerHTML = g.over ? '' : scrRackHtml_(g);
  if (acts) {
    /* BUILT, NOT HIDDEN. See the note beside the empty div in map.js: a hidden control is still a
       control to anything that presses the page, and four of these do nothing between turns. */
    /* EVERY ACTION WRITTEN OUT AS A LITERAL, not built from a list. § */
    const playLabel = g.swap
      ? (g.swap.length ? 'Swap ' + g.swap.length : 'Cancel swap')
      : 'Play';
    acts.innerHTML = (g.over || g.handover || g.blank !== null) ? ''
      : tile_({ form: true, look: 'scr-act', act: 'scr-play', label: playLabel })
      + tile_({ form: true, look: 'scr-act', act: 'scr-recall', label: 'Take back' })
      + tile_({ form: true, look: 'scr-act', act: 'scr-swap', label: 'Swap' })
      + tile_({ form: true, look: 'scr-act', act: 'scr-pass', label: 'Pass' })
      + tile_({ form: true, look: 'scr-act', act: 'scr-again', label: 'New game' });
  }
  if (said) {
    said.textContent = g.said
      || (g.over ? '' : (g.bag.length + ' left in the bag.'));
  }
}
on('scr-new', el => {
  const n = Math.max(2, Math.min(4, Number(el.getAttribute('data-n')) || 2));
  scrabble = scrNew_(n);
  scrabblePaint();
});
on('scr-again', () => { scrabble = null; scrabblePaint(); });
on('scr-hand', () => {
  if (!scrabble) return;
  scrabble.handover = false;
  scrabble.said = '';
  scrabblePaint();
});
on('scr-rack', el => {
  const g = scrabble;
  if (!g || g.over || g.handover || g.blank !== null) return;
  const n = Number(el.getAttribute('data-i'));
  /* A TILE ALREADY ON THE BOARD CANNOT BE PICKED UP TWICE — take it off the square to get it back,
     which is the same gesture as on the table. */
  if (g.placed.some(i => g.board[i].from === n)) return;
  if (g.swap) {
    const at = g.swap.indexOf(n);
    if (at >= 0) g.swap.splice(at, 1); else g.swap.push(n);
  } else {
    g.sel = g.sel === n ? null : n;
  }
  scrabblePaint();
});
on('scr-cell', el => {
  const g = scrabble;
  if (!g || g.over || g.handover || g.blank !== null || g.swap) return;
  const i = Number(el.getAttribute('data-i'));
  const t = g.board[i];
  /* TAP A TILE YOU JUST PUT DOWN AND IT COMES BACK. A committed one does not, which is what `fresh`
     already says — so there is no separate list of what may be picked up. */
  if (t) {
    if (!t.fresh) return;
    g.board[i] = null;
    g.placed = g.placed.filter(x => x !== i);
    g.said = '';
    scrabblePaint();
    return;
  }
  if (g.sel === null) { g.said = 'Pick a tile first.'; scrabblePaint(); return; }
  const letter = g.players[g.turn].rack[g.sel];
  scrPlace_(g, i, g.sel);
  g.said = '';
  /* A BLANK IS NOT A LETTER UNTIL SOMEBODY SAYS SO, and it is worth nought whatever they say. § */
  if (letter === '') g.blank = i; else g.sel = null;
  scrabblePaint();
});
on('scr-play', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  if (g.swap) { scrSwapDo_(g); scrabblePaint(); return; }
  scrPlay_(g);
  scrabblePaint();
});
on('scr-recall', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrRecall_(g);
  g.said = '';
  scrabblePaint();
});
on('scr-swap', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrRecall_(g);
  g.swap = g.swap ? null : [];
  g.said = g.swap ? 'Tap the tiles to put back, then Swap.' : '';
  scrabblePaint();
});
on('scr-pass', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrPass_(g);
  scrabblePaint();
});
/* BOARD GAMES (414, 461) — Connect 4, Othello, Scrabble, Chess and Maze in one widget, built as the word games are (238). Two players or more on one phone, so none needs a `stop`. */
const BOARD_GAMES = [
  /* CHESS AND THE MAZE, MOVED IN BY THE OWNER (461): their own cards before. Each keeps its game in memory (`CHESS`, `maze`), so a switch loses nothing. */
  { k: 'chess', name: 'Chess', start: () => initChess(),
    body: `<div class="chess-game">
    <p class="chess-say" id="chess-say" aria-live="polite">White to move</p>
    <div id="chess-board" class="chess"></div>
    <div class="btn-row chess-promo" hidden></div>
    <div class="tile-row chess-ctl"></div>
  </div>` },
  { k: 'maze', name: 'Maze', start: () => initMaze(),
    body: `<p>Top left to bottom right. Tap the arrows, or use the arrow keys.</p>
    <div id="maze-grid" class="mz" role="img"></div>
    <div class="mz-pad">
      ${tile_({ form: true, look: 'mz-key up', act: 'maze-go', data: { d: 'n' }, aria: 'Up', html: '&#9650;' })}
      ${tile_({ form: true, look: 'mz-key left', act: 'maze-go', data: { d: 'w' }, aria: 'Left', html: '&#9664;' })}
      ${tile_({ form: true, look: 'mz-key right', act: 'maze-go', data: { d: 'e' }, aria: 'Right', html: '&#9654;' })}
      ${tile_({ form: true, look: 'mz-key down', act: 'maze-go', data: { d: 's' }, aria: 'Down', html: '&#9660;' })}
    </div>
    <p class="note game-said" id="maze-said"></p>
    <p class="game-said">Moves: <b id="maze-moves">0</b></p>
    ${tile_({ form: true, label: 'New maze', act: 'maze-again', kind: 'quiet' })}` },
  { k: 'c4', name: 'Connect 4', start: () => initConnect4(),
    body: `<p>2 players, 1 phone. Red starts. Tap a column; 4 in a line, any direction.</p>
    <div id="c4-board" class="c4"></div>
    <p class="note game-said" id="c4-said"></p>
    ${tile_({ form: true, label: 'New game', act: 'c4-again', kind: 'quiet' })}` },
  { k: 'oth', name: 'Othello', start: () => initOthello(),
    body: `<p>2 players, 1 phone. Red starts. Trap a line of the other colour between 2
       of yours.</p>
    <div id="oth-board" class="oth"></div>
    ${rowLive('Red \u2013 Blue', '2 \u2013 2', 'oth-score')}
    <p class="note game-said" id="oth-said"></p>
    ${tile_({ form: true, label: 'New game', act: 'oth-again', kind: 'quiet' })}` },
  /* SCRABBLE KEEPS ITS GAME across a switch: its state is `scrabble`, and `initScrabble` only paints it. The action row is built by `scrabblePaint`, empty until there is a turn. */
  { k: 'scr', name: 'Scrabble', start: () => initScrabble(),
    body: `<p>2 to 4 players, 1 phone. Words stand unless somebody challenges them —
       that part is yours.</p>
    <div id="scr-who" class="scr-who"></div>
    <div id="scr-board" class="scr"></div>
    <div id="scr-rack-box" class="scr-box"></div>
    <div id="scr-acts" class="scr-acts"></div>
    <p class="note game-said" id="scr-said"></p>
    <div id="scr-start" class="btn-row">
      ${tile_({ form: true, label: '2 players', act: 'scr-new', data: { n: '2' } })}
      ${tile_({ form: true, label: '3', act: 'scr-new', data: { n: '3' } })}
      ${tile_({ form: true, label: '4', act: 'scr-new', data: { n: '4' } })}
    </div>` },
];
function bgGame_(k) { return BOARD_GAMES.find(g => g.k === k) || BOARD_GAMES[0]; }
/* REMEMBERED ON THE DEVICE under `bg-game`, `wg-game`'s rule. */
function bgChosen_() {
  let k = '';
  k = keep_.get('bg-game') || '';
  return bgGame_(k).k;
}
function bgOptions_() {
  const k = bgChosen_();
  return BOARD_GAMES.map(x =>
    `<option value="${esc(x.k)}"${x.k === k ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
}
function bgSlot_() {
  const g = bgGame_(bgChosen_());
  return `<div data-g="${esc(g.k)}" class="bg-game">${g.body}</div>`;
}
/* THE PICKER AND THE CHOSEN BOARD'S MARKUP — the widget's `draw`; rebuilt only when the game changed. */
function bgPaint_() {
  const slot = $('bg-slot'), sel = $('bg-pick');
  if (!slot) return false;
  const g = bgGame_(bgChosen_());
  if (sel && sel.value !== g.k) sel.innerHTML = bgOptions_();
  const now = slot.firstElementChild;
  if (!now || now.getAttribute('data-g') !== g.k) slot.innerHTML = bgSlot_();
  return g;
}
function initBoardGames() {
  const g = bgPaint_();
  if (g) g.start();
}
/* NOTHING RUNS BETWEEN MOVES, so leaving stops nothing; declared so the widget has the word games' shape. */
function boardGamesStop_() {}
on('bg-pick', el => {
  const k = bgGame_(el.value).k;
  keep_.put('bg-game', k);
  const slot = $('bg-slot');
  if (slot) slot.innerHTML = '';
  initBoardGames();
});

/* THE LOOSE LINES THE BOARDS NEED: the tiles' values, the maze's arrow keys, the Scrabble blank's letter. */
inputKeys_({ ArrowUp: 'n', ArrowRight: 'e', ArrowDown: 's', ArrowLeft: 'w' }, k => { mzMove_(k); mazePaint(); },
  { when: () => !!maze && !maze.over && mzInFront_() });
SCR_SET.forEach(t => { SCR_VALUE[t[0]] = t[2]; });
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="scr-blank"]');
  if (!el) return;
  const g = scrabble;
  if (!g || g.blank === null) return;
  const l = String(el.value || '').toUpperCase();
  if (!/^[A-Z]$/.test(l)) return;
  const t = g.board[g.blank];
  if (t) t.letter = l;
  g.blank = null;
  g.sel = null;
  scrabblePaint();
});
/* THE ARROW KEYS, AND ONLY WHERE THE MAZE IS THE THING IN FRONT OF YOU: its grid on the column in front, no sheet over it. */
function mzInFront_() {
  if (typeof AT === 'undefined') return false;
  const sheet = $('sheet');
  if (sheet && !sheet.classList.contains('hidden')) return false;
  return [...document.querySelectorAll('[id="maze-grid"]')].some(g => !!(g.closest('.screen') && g.closest('.screen').id === 's-' + AT));
}
