/* ==================================================================================================
   node js/check-chess.js — THE MOVE GENERATOR, COUNTED RATHER THAN READ.

   The board is two players round one phone now, so the only thing standing between a child and a
   wrong move is `legalMoves` in chess.js. A move generator is the textbook case of code that reads
   correctly and is wrong: a king that can castle through check, an en-passant capture that leaves
   the pawn behind, a promotion that forgets the capture. PERFT is the standard answer — count every
   leaf of the game tree to a fixed depth and compare against numbers the whole chess-programming
   world agrees on. One wrong rule anywhere changes a count.

   NOT A SECOND IMPLEMENTATION. The engine is cut out of `price-rows.js` (the board helpers) and
   `chess.js` (the rules) by marker and run as-is, so what is counted is the code that ships.
================================================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

const cut = (src, from, to, name) => {
  const a = src.indexOf(from), b = src.indexOf(to, a);
  if (a < 0 || b < 0) { console.log('FAILED: could not find ' + name + ' — nothing was checked, not a pass'); process.exit(1); }
  return src.slice(a, b);
};
const helpers = cut(read('price-rows.js'), 'const START =', 'const idx = (f, r) => r * 8 + f;', 'the board helpers')
  + 'const idx = (f, r) => r * 8 + f;\n';
const rules = cut(read('chess.js'), 'function pseudoMoves(', '/* ---------- THERE IS NO OPPONENT', 'the rules');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(helpers + rules + '\nthis.api = { newGame, legalMoves, play, outcome, inCheck, idx };', ctx);
const { newGame, legalMoves, play, outcome, inCheck } = ctx.api;

const perft = (pos, d) => d === 0 ? 1 : legalMoves(pos).reduce((n, m) => n + perft(play(pos, m), d - 1), 0);

/* A position from FEN, so the special-move cases can be stated in the notation everybody uses. */
function fen(s) {
  const [rows, turn, castle, ep] = s.split(' ');
  const board = [];
  rows.split('/').forEach(r => [...r].forEach(c => /\d/.test(c) ? board.push(...'_'.repeat(+c)) : board.push(c)));
  const sq = ep && ep !== '-' ? (8 - Number(ep[1])) * 8 + (ep.charCodeAt(0) - 97) : -1;
  return { board, turn, ep: sq, halfmove: 0,
           castle: { K: castle.includes('K'), Q: castle.includes('Q'), k: castle.includes('k'), q: castle.includes('q') } };
}

const bad = [];
const want = (label, got, exp) => { if (got !== exp) bad.push(`${label}: got ${got}, wanted ${exp}`); };

/* The start position — 20, 400, 8,902. */
[20, 400, 8902].forEach((n, i) => want('perft start depth ' + (i + 1), perft(newGame(), i + 1), n));

/* "Kiwipete" — the position built to exercise castling, en passant, promotion and pins at once.
   48 and 2,039 are its published counts. */
const kiwi = fen('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -');
want('perft kiwipete depth 1', perft(kiwi, 1), 48);
want('perft kiwipete depth 2', perft(kiwi, 2), 2039);
want('perft kiwipete depth 3', perft(kiwi, 3), 97862);

/* Position 3 of the standard suite: rooks, pawns and an en-passant pin along a rank. */
const p3 = fen('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -');
want('perft position 3 depth 1', perft(p3, 1), 14);
want('perft position 3 depth 3', perft(p3, 3), 2812);

/* The special moves, one each, so a failure names the rule rather than a number. */
const has = (pos, pred) => legalMoves(pos).some(pred);
want('white may castle kingside', has(fen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq -'), m => m.castle === 'K'), true);
want('no castling through an attacked square', has(fen('r3k2r/8/8/8/8/8/5r2/R3K2R w KQkq -'), m => m.castle === 'K'), false);
const ep = fen('4k3/8/8/3pP3/8/8/8/4K3 w - d6');
want('en passant is offered', has(ep, m => m.enpassant), true);
const epDone = play(ep, legalMoves(ep).find(m => m.enpassant));
want('en passant removes the captured pawn', epDone.board[3 * 8 + 3], '_');
const promo = fen('4k3/1P6/8/8/8/8/8/4K3 w - -');
want('promotion offers four pieces', legalMoves(promo).filter(m => m.from === 9 && m.to === 1).length, 4);
want('promotion to a queen places a queen', play(promo, { from: 9, to: 1, promote: 'Q' }).board[1], 'Q');
want('fool\'s mate is mate', outcome(fen('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq -')), 'mate');
want('the stalemate is stalemate', outcome(fen('7k/5Q2/6K1/8/8/8/8/8 b - -')), 'stalemate');
want('check is check', inCheck(fen('4k3/8/8/8/8/8/8/4R1K1 b - -'), 'b'), true);

if (bad.length) {
  console.log('THE MOVE GENERATOR IS WRONG (' + bad.length + ')');
  bad.forEach(b => console.log('  ! ' + b));
  console.log('\nFAILED');
  process.exit(1);
}
console.log('perft start 20 / 400 / 8,902, kiwipete 48 / 2,039 / 97,862, position 3 14 / 2,812, and 10 special moves');
console.log('PASS');
