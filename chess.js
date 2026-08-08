/* ==================================================================================================
   @family. — chess.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   chess.js is number 3 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- MOVES A PIECE COULD MAKE, ignoring whether the king is left in check ---------------
   Split out because "can this piece reach that square" and "is this move legal" are different
   questions, and conflating them is what makes check detection recursive and slow. */
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
    /* Pawns are the exception: they MOVE forward and CAPTURE diagonally, so their moves are not
       the squares they attack. Using pseudoMoves here would have a pawn "attacking" the square in
       front of it, which is the classic way a king ends up able to walk into check. */
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

/* ---------- THE OPPONENT -----------------------------------------------------------------------
   Minimax with alpha-beta. Deliberately shallow: a student wants an opponent that can be beaten
   with thought, not one that cannot be beaten at all — and a browser on a Chromebook has to answer
   within a second. */
const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

/* Where a piece would rather be. Crude, but it is the difference between an engine that develops
   and one that shuffles its rooks — and the tables cost nothing to evaluate. */
const PAWN_MAP = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0];
const KNIGHT_MAP = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50];

function evaluate(pos) {
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = pos.board[i];
    if (p === '_') continue;
    const w = isWhite(p);
    let v = VALUE[p.toLowerCase()];
    // The maps are written from black's point of view, so white reads them mirrored.
    const at = w ? i : 63 - i;
    if (p.toLowerCase() === 'p') v += PAWN_MAP[at];
    if (p.toLowerCase() === 'n') v += KNIGHT_MAP[at];
    score += w ? v : -v;
  }
  return score;                                    // positive favours white
}

function search(pos, depth, alpha, beta) {
  const end = outcome(pos);
  if (end === 'mate') return pos.turn === CH_WHITE ? -99999 + depth : 99999 - depth;
  if (end === 'stalemate') return 0;
  if (depth === 0) return evaluate(pos);

  const moves = legalMoves(pos);
  // Captures first: alpha-beta prunes far more when good moves come early.
  moves.sort((a, b) => (pos.board[b.to] !== '_' ? 1 : 0) - (pos.board[a.to] !== '_' ? 1 : 0));

  if (pos.turn === CH_WHITE) {
    let best = -Infinity;
    for (const m of moves) {
      best = Math.max(best, search(play(pos, m), depth - 1, alpha, beta));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    best = Math.min(best, search(play(pos, m), depth - 1, alpha, beta));
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function bestMove(pos, depth) {
  const moves = legalMoves(pos);
  if (!moves.length) return null;
  let best = null, bestScore = pos.turn === CH_WHITE ? -Infinity : Infinity;
  // Shuffled, so an engine facing the same position twice does not play the same game twice.
  moves.sort(() => Math.random() - 0.5);
  for (const m of moves) {
    const s = search(play(pos, m), depth - 1, -Infinity, Infinity);
    if (pos.turn === CH_WHITE ? s > bestScore : s < bestScore) { bestScore = s; best = m; }
  }
  return best;
}


const FEED_FACTS = [
  ['Space', 'You are seeing the sun as it was eight minutes ago',
   'Light takes 8 minutes 20 seconds to cross 150 million km. If it went out you would carry on reading in bright daylight for the length of a song.', 'sun solar corona'],
  ['Space', 'There is a planet where it rains glass, sideways',
   'HD 189733b is cobalt blue and its winds run at 5,400 mph. The blue is silicate particles — glass — blown horizontally through the atmosphere.', 'exoplanet artist impression'],
  ['Space', 'Saturn would float',
   'It is less dense than water. Find an ocean big enough and the whole planet would sit on top of it.', 'Saturn planet rings'],
  ['Space', 'A day on Venus is longer than its year',
   'It turns once every 243 Earth days and orbits in 225. The sun rises in the west, twice a year, very slowly.', 'Venus planet surface'],

  ['Animals', 'Octopuses have three hearts and blue blood',
   'Two pump to the gills, one to the body — and that one stops when they swim, which is why they prefer crawling.', 'octopus underwater'],
  ['Animals', 'A shrimp can boil water by clicking',
   'The pistol shrimp snaps its claw fast enough to form a collapsing bubble that reaches thousands of degrees for a fraction of a millisecond.', 'pistol shrimp'],
  ['Animals', 'Wombats produce cube-shaped droppings',
   'The last stretch of intestine has patches of differing elasticity that mould them. Cubes do not roll away, which matters if you mark territory with them.', 'wombat'],
  ['Animals', 'One jellyfish can reverse its own ageing',
   'Turritopsis dohrnii reverts to its juvenile stage under stress and starts again. In principle it need never die of old age.', 'Turritopsis jellyfish'],
  ['Animals', 'Crows hold grudges, and tell their friends',
   'They recognise individual human faces, remember who treated them badly, and pass the grievance to birds that were never there.', 'crow corvid'],

  ['Everyday', 'Honey never goes off',
   'Jars from Egyptian tombs are still edible. Too acidic and too dry for bacteria, and bees add an enzyme that makes hydrogen peroxide.', 'honey jar honeycomb'],
  ['Everyday', 'Bananas are clones',
   'Almost every banana sold is a Cavendish, grown from cuttings — genetically one plant. That is why a single fungus can threaten the entire crop, and did once before.', 'banana plantation'],
  ['Everyday', 'Carrots were purple first',
   'Orange ones were bred in the Netherlands in the 16th century. The colour you think of as natural is a few hundred years old.', 'purple carrots'],
  ['Everyday', 'The QWERTY layout is not slowing you down',
   'The jamming story outlived the typewriter. Tests against faster layouts find differences small enough to vanish with practice.', 'typewriter keyboard'],
  ['Everyday', 'Bubble wrap was invented as wallpaper',
   'It failed. Then it was sold as greenhouse insulation. It failed again. Only on the third attempt did anyone think of packaging.', 'bubble wrap'],

  ['History', 'Zero was banned in Florence',
   'India had a symbol for it by the 7th century; Europe resisted 400 years, and Florence outlawed it in 1299. A digit meaning nothing looked like a way to forge a ledger.', 'medieval manuscript numerals'],
  ['History', 'Oxford is older than the Aztec Empire',
   'Teaching at Oxford began around 1096. Tenochtitlan was founded in 1325. Two things that feel like different eras overlapped by centuries.', 'Oxford university old building'],
  ['History', 'Cleopatra lived closer to the moon landing than to the pyramids',
   'The Great Pyramid was already 2,500 years old when she was born. She is 2,000 years from us.', 'Cleopatra bust'],
  ['History', 'The last execution by guillotine was in 1977',
   'The same year Star Wars opened and the Apple II went on sale. France kept it until 1981.', 'guillotine museum'],

  ['Language', 'Every word for "brother" sounds the same',
   'Bhrātṛ in Sanskrit, frater in Latin, bróðir in Norse. They did not borrow it — they inherited it from one language nobody wrote down, spoken 6,000 years ago.', 'ancient manuscript writing'],
  ['Language', 'Quarantine is a length of time',
   'Quaranta giorni — forty days. Venice held arriving ships that long during the plague, and the word carries the number inside it.', 'Venice harbour'],
  ['Language', '"Nice" used to mean stupid',
   'From Latin nescius, not-knowing. It drifted through foolish, fussy, precise, and only landed on pleasant in the 1700s.', 'old dictionary pages'],

  ['Body', 'You replace your skeleton about every ten years',
   'Osteoclasts dissolve old bone; osteoblasts lay down new. The shape stays, the material does not. You are the same skeleton the way a river is the same river.', 'human skeleton anatomy'],
  ['Body', 'Your gut has more bacteria than you have cells',
   'Roughly 38 trillion of them to 30 trillion of you. By headcount you are a minority in your own body.', 'bacteria microscope'],
  ['Body', 'Nothing you touch is actually touching you',
   'The floor holds you up by electromagnetic repulsion between electrons. What you feel as contact is a force at a distance.', 'atom model physics'],

  ['Earth', 'Africa is bigger than every map has shown you',
   'The USA, China, India and most of Europe fit inside it at once. Mercator stretches the poles to keep angles true and squashes the equator to pay for it.', 'Africa map satellite'],
  ['Earth', 'The sky is blue for the reason sunsets are red',
   'Air scatters short wavelengths hardest. At sunset the light crosses far more air, the blue is scattered away entirely, and what is left is what reaches you.', 'sunset sky'],
  ['Earth', 'Ice floats, and almost nothing else does',
   'Water expands when it freezes because the hydrogen bonds lock into a lattice with gaps. If it did not, lakes would freeze from the bottom and stay frozen.', 'iceberg ice'],
  ['Earth', 'Russia spans eleven time zones',
   'When it is Monday morning in Kaliningrad it is Monday evening in Kamchatka. One country, one working day, twelve hours apart.', 'Kamchatka landscape'],

  ['Making', 'Blue was the most expensive colour for 600 years',
   'Ultramarine came from lapis lazuli, mined in one valley in Afghanistan. It cost more than gold, which is why painters saved it for the Virgin Mary robes.', 'lapis lazuli ultramarine'],
  ['Making', 'An octave is a doubling',
   'The A above middle C is 440 vibrations a second; the next A is 880. Every octave doubles, and that ratio is why they sound like the same note.', 'piano keys'],
  ['Making', 'The Eiffel Tower is taller in summer',
   'Iron expands. It grows about 15cm on a hot day and leans slightly away from the sun.', 'Eiffel Tower'],

  ['Study', 'Reading it twice is one of the weakest ways to learn',
   'Recall beats review: shut the book, write what you remember, then check. It feels worse and works better, which is exactly why people avoid it.', 'student notebook studying'],
  ['Study', 'Sleep is when the learning gets filed',
   'The hippocampus replays the day during deep sleep and hands it to the cortex. Revising until 2am and sitting the paper at 9 skips the step that makes it stick.', 'sleeping night'],
  ['Study', 'Spacing beats cramming at equal total time',
   'Six hours over six days beats six hours in one. Each time you nearly forget and then retrieve it, the memory is rebuilt stronger.', 'calendar planning'],

  ['Money', 'The £ sign is a letter L',
   'Libra — Roman for pound weight. The two strokes through it mean abbreviation. Same root as lb for pounds, which is why neither looks like the word it stands for.', 'pound sterling coins'],
  ['Money', 'A Post Office was once the biggest bank in the country',
   'Before high street banking reached most towns, the Post Office Savings Bank held more accounts than every bank combined. It is why post offices still feel institutional.', 'old post office building'],
  ['Money', 'Nobody agrees what a billion is',
   'It meant a million million in Britain until the 1970s and a thousand million in America. The government switched officially in 1974 and old textbooks did not.', 'calculator numbers'],

  ['Sport', 'The marathon distance comes from a royal box',
   'It was 25 miles until London 1908, when the start moved to Windsor Castle so the children could watch from the nursery. The extra 385 yards has been standard ever since.', 'marathon runners'],
  ['Sport', 'Football nearly had no crossbar',
   'Until 1875 the goal was two posts and a tape. Teams argued endlessly about whether a ball had passed over or under it, which is a fair description of most sport before rules.', 'football goal posts'],
  ['Sport', 'Table tennis was banned in the Soviet Union for 20 years',
   'Officials decided it was harmful to the eyes. The ban lasted from 1930 to 1950, by which time the rest of the world had a considerable head start.', 'table tennis'],

  ['Tech', 'The first computer bug was a moth',
   'Grace Hopper taped it into the Harvard Mark II logbook in 1947 with the note "first actual case of bug being found". The word already meant a fault; she found a literal one.', 'computer punch card'],
  ['Tech', 'Wi-Fi does not stand for anything',
   'A branding agency invented it to sound like hi-fi. IEEE 802.11b Direct Sequence is what it replaced, and the meaninglessness was the point.', 'wifi router'],
  ['Tech', 'The @ sign was nearly extinct',
   'It survived on typewriter keyboards as an accounting shorthand — 3 widgets @ £2. Ray Tomlinson picked it for email in 1971 because nobody used it in names.', 'typewriter keys'],
  ['Tech', 'Nokia started as a paper mill',
   'Then rubber boots, then cables, then phones. Companies that last a century rarely do it by staying in the same business.', 'paper mill'],

  ['Nature', 'Trees talk through fungus',
   'Mycorrhizal networks link roots across a forest, moving sugar and warning signals between trees. A dying tree will push its carbon into its neighbours.', 'forest fungi roots'],
  ['Nature', 'A single aspen colony can be one organism',
   'Pando in Utah is 47,000 trunks sharing one root system, thought to weigh 6,000 tonnes. It is possibly the heaviest living thing on Earth.', 'aspen forest'],
  ['Nature', 'Bamboo can grow nearly a metre a day',
   'Some species add 90cm in 24 hours — fast enough that you could watch it if you were patient. It is a grass, not a tree.', 'bamboo forest'],
  ['Nature', 'Lightning is five times hotter than the sun',
   'About 30,000°C at the channel, against 5,500°C at the sun surface. Only for a few millionths of a second, which is the only reason anyone survives being near it.', 'lightning storm'],

  ['Buildings', 'The Empire State Building went up in 410 days',
   'Finished ahead of schedule and under budget in 1931. Modern equivalents take four or five years, and mostly for reasons that have nothing to do with the building.', 'Empire State Building'],
  ['Buildings', 'Notre-Dame took nearly 200 years',
   'Begun 1163, largely finished 1345. Nobody who laid the first stone saw the roof. Cathedrals were built by people who accepted they would not see the end.', 'Notre Dame Paris'],
  ['Buildings', 'Venice is built on wooden piles that never rotted',
   'Millions of alder trunks driven into the mud. Without oxygen the wood petrified instead of decaying, and it has held the city up for 1,200 years.', 'Venice canal buildings'],

  ['People', 'The inventor of the Pringles tube is buried in one',
   'Fredric Baur was so pleased with it that he asked to be interred in one. His children stopped at a supermarket on the way to the funeral to buy the tube.', 'pringles tube'],
  ['People', 'Nikola Tesla died owing money in a New York hotel',
   'He had 300 patents and had lit the world, and spent his last years feeding pigeons. Being right and being paid are different achievements.', 'Nikola Tesla portrait'],
  ['People', 'Roald Dahl helped invent a brain valve',
   'After his son was injured, he worked with an engineer and a surgeon on the Wade-Dahl-Till valve for hydrocephalus. It was used on thousands of children.', 'Roald Dahl'],

  ['Oddities', 'There is a town where it is illegal to die',
   'Longyearbyen in Svalbard. The permafrost stops bodies decomposing, so burials preserve whatever killed you — including the 1918 flu, still viable in graves there.', 'Longyearbyen Svalbard'],
  ['Oddities', 'A cloud weighs about 500 tonnes',
   'An average cumulus holds roughly that much water. It stays up because the droplets are tiny and the air beneath is warmer and rising.', 'cumulus cloud sky'],
  ['Oddities', 'The shortest war lasted 38 minutes',
   'Britain against Zanzibar, 1896. The Sultan surrendered before the ships had finished firing, and the war was over before most people knew it had begun.', 'Zanzibar historic'],
  ['Oddities', 'Scotland has 421 words for snow',
   'Feefle, flindrikin, snitter, spitters, unbrak. A language grows vocabulary where its speakers need precision, which is why English has so many words for rain.', 'snow scotland landscape'],
];

/* THE COMPUTED GENERATORS lived here — times tables, factors, squares, percentages. Removed.
   They were endless, which was their whole justification, and endless arithmetic is still
   arithmetic: a feed that keeps handing you 7 x 8 is a feed you stop opening. Length comes from
   the list being long instead. */


function feedShuffle() {
  const deck = FEED_FACTS.map((_, i) => i);
  /* Seeded by the day and by how many decks have been through, so:
       · reloading gives the SAME order, which is what makes remembering your place worth anything
       · tomorrow gives a different one
       · a second pass today is a different order again, rather than the same 58 in the same run */
  let x = (feedToday() * 2654435761 + FEED_PASS * 40503) >>> 0;
  const rnd = () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
  FEED_PASS++;
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  /* Never open on the card that just closed. Reshuffling can otherwise deal the same one twice in
     a row across the join, which is the one repeat anybody actually notices. */
  if (FEED_SEEN.length && FEED_FACTS[deck[0]] &&
      FEED_FACTS[deck[0]][1] === FEED_SEEN[FEED_SEEN.length - 1]) {
    deck.push(deck.shift());
  }
  FEED_DECK = deck;
}


function feedItem(n) {
  if (FEED_BUILT[n]) return FEED_BUILT[n];       // going back shows what you already saw

  if (!FEED_DECK.length) feedShuffle();
  const [subject, heading, body, pic] = FEED_FACTS[FEED_DECK.shift()];

  FEED_SEEN.push(heading);
  if (FEED_SEEN.length > 4) FEED_SEEN.shift();

  FEED_BUILT[n] = { id: 'g' + n, subject, heading, body, pic };
  return FEED_BUILT[n];
}


function feedToday() { return Math.floor(Date.now() / 864e5); }