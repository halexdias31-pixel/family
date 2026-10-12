#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-widgets.js

   EVERY WIDGET IS THE SAME SHAPE, AND NOTHING WAS CHECKING THAT IT WAS.

   `WIDGETS` in map.js is the list of things this app can open. A widget is an object, and the
   contract is entirely by convention: an `id`, a `kind`, a `name`, some `html`, and — if it has
   anything to run — an `into` naming the element to run in and a `start` to run. Nothing enforced
   any of it, so the failures were all of the same family and all silent:

     • `into` NAMING AN ID THE HTML DOES NOT CONTAIN. `start` runs, looks the element up, finds
       nothing and returns. The card draws, the widget is dead, and nothing anywhere says so. This
       is the `DATA.messages` fault in another costume — wired at one end.
     • `start` WITH NO `into`. Same outcome, one line earlier.
     • A DUPLICATE `id`. `widgetsOf_` returns both, the pager counts both, and `$(into)` finds the
       first — so the second is a page you can swipe to that shows somebody else's widget.
     • A `kind` THAT IS NEITHER `tool` NOR `game`. `widgetsOf_` filters on exactly those two
       strings, so anything else is a widget that exists and appears on no column at all.

   WHY THIS IS PARSED AND NOT GREPPED. I wrote the first version of this audit as a regex over
   `map.js` and it silently missed three widgets — the three I had added that day — because their
   `html` contains `${}` and braces. A checker that quietly skips what it cannot parse reports a
   clean bill of health for the part it did not read, which is the worst answer it could give.
   acorn is already a dependency; the file is parsed and the array is walked.

     node js/check-widgets.js
================================================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const jsDir = fs.existsSync(path.join(__dirname, 'map.js')) ? __dirname : path.join(__dirname, 'js');
const mapPath = path.join(jsDir, 'map.js');
if (!fs.existsSync(mapPath)) {
  console.log('FAILED — map.js not found, so NOTHING was checked. Looked in: ' + jsDir);
  process.exit(1);
}

const src = fs.readFileSync(mapPath, 'utf8');
let ast;
try {
  ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script' });
} catch (err) {
  console.log('FAILED — map.js does not parse: ' + err.message);
  process.exit(1);
}

/* The `WIDGETS` array literal, found by name rather than by position. */
let arr = null;
(function walk(n) {
  if (!n || typeof n !== 'object' || arr) return;
  if (n.type === 'VariableDeclarator' && n.id && n.id.name === 'WIDGETS'
      && n.init && n.init.type === 'ArrayExpression') { arr = n.init; return; }
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v.type === 'string') walk(v);
  }
})(ast);

if (!arr) {
  console.log('FAILED — no `WIDGETS` array in map.js, so NOTHING was checked.');
  process.exit(1);
}

/* Every widget, as {key: rawSourceText}. The VALUES are kept as source rather than evaluated: an
   `html` is a template string full of calls that cannot run outside a browser, and all this needs
   to know is what the text contains. */
const widgets = arr.elements.filter(Boolean).filter(e => e.type === 'ObjectExpression').map(obj => {
  const w = { _keys: [] };
  obj.properties.forEach(p => {
    if (!p.key) return;
    const k = p.key.name || p.key.value;
    w._keys.push(k);
    w[k] = src.slice(p.value.start, p.value.end);
  });
  return w;
});

const str = v => (v == null ? '' : String(v).replace(/^['"`]|['"`]$/g, ''));

const missingKey = [], badKind = [], dupes = [], orphanInto = [], startNoInto = [], intoNoStart = [];
/* A WIDGET WHOSE OWN MARKUP HAS NO HEADING — see the note beside the rule below. */
const noTitle = [];

/* ---------- AND THE ONE THAT MEANS IT, WITH ITS REASON WRITTEN DOWN -------------------------------
   `chess` HAS NO HEADING ON PURPOSE and says so in its own comment: "A title saying 'Chess' above a
   chessboard... A board is self-explanatory in a way almost nothing else in this app is." That was
   true and it was not what happened — `widgetColumn_` printed the roster's `name` above it anyway,
   so the widget's argument had been overruled by a line in another file for as long as both
   existed. Removing that heading is what finally does what this comment asked for.

   LISTED RATHER THAN EXEMPTED BY SHAPE, for the same reason as `ACCEPTED` in check-payload.js and
   `ACCEPTED_TAP` in check/ui.js: the next untitled widget should fail loudly instead of joining a
   red nobody reads. */
const ACCEPTED_UNTITLED = {
  chess: 'a chessboard names itself; the widget says so in its own comment and always has.',
};
const seen = {};

/* ---------- THE KINDS A COLUMN ASKS FOR, READ OFF THE CODE THAT ASKS ------------------------------
   THIS WAS `'tool' OR 'game'`, WRITTEN OUT, and the basket's move to the Shop column made it a
   false red on its first run: `cart` has kind 'shop' and `shopCards_` asks `widgetsOf_('shop')`.
   A hand-kept list of what the code asks for is the drift this repository keeps paying for, so it
   is every literal `widgetsOf_('…')` / `toolsStart_('…')` / `widgetColumn_('…')` in js/, comments
   stripped — a kind nothing asks for is still the fault this rule exists to catch. */
const ASKED_KINDS = new Set();
fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !/^check/.test(f)).forEach(f => {
  const txt = fs.readFileSync(path.join(jsDir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
  for (const m of txt.matchAll(/\b(?:widgetsOf_|toolsStart_|widgetColumn_)\(\s*'([a-z]+)'\s*\)/g)) ASKED_KINDS.add(m[1]);
});
if (!ASKED_KINDS.has('tool') || !ASKED_KINDS.has('game')) {
  console.log('FAILED — could not read which widget kinds the columns ask for (found: '
              + [...ASKED_KINDS].join(', ') + '), so the kind rule was NOT checked');
  process.exit(1);
}

widgets.forEach(w => {
  const id = str(w.id) || '(no id)';

  /* THE FOUR THAT EVERY WIDGET HAS. `what` is not among them — it is the pager's caption and a
     widget without one is untidy, not broken. */
  ['id', 'kind', 'name', 'html'].forEach(k => {
    if (!w._keys.includes(k)) missingKey.push(id + ' has no `' + k + '`');
  });

  const kind = str(w.kind);
  if (kind && !ASKED_KINDS.has(kind)) {
    badKind.push(id + " has kind '" + kind + "' — `widgetsOf_` only ever asks for "
                    + [...ASKED_KINDS].map(k => "'" + k + "'").join(', ')
                    + ', so this widget is on no column at all');
  }

  if (seen[id]) dupes.push(id); else seen[id] = 1;

  /* ---------- THE WIDGET'S OWN MARKUP CARRIES ITS TITLE ------------------------------------------
     `widgetColumn_` USED TO PRINT THE ROSTER'S `name` ABOVE THE WIDGET and every widget's html
     already had a heading, so every tool on the column showed its name twice — "Calculator ||
     Calculator" — and the cheat sheet showed three headings under two different names, because the
     roster label and the card's own title had drifted apart with nothing comparing them.

     THE WIDGET'S HEADING IS NOW THE ONLY ONE DRAWN. Which makes its absence a widget with no title
     at all rather than a widget with one — silent, and only on the column, because `name` still
     labels it everywhere else. So it is checked here, where the contract already lives. */
  if (w.html && !/<h3[\s>]/.test(w.html) && !ACCEPTED_UNTITLED[id]) {
    noTitle.push(id + ' has no <h3> in its html. `widgetColumn_` draws the widget\'s own markup and '
               + 'nothing else, so this one appears on the column with no title on it.');
  }

  const into = str(w.into);
  const hasStart = w._keys.includes('start');

  /* THE ONE THAT CATCHES A DEAD WIDGET. `into` names the element `start` draws into, and the html
     is the only thing that can contain it. */
  if (into && w.html && w.html.indexOf(into) === -1) {
    orphanInto.push(id + " points `into: '" + into + "'` and its own html never mentions that id — "
                       + 'so `start` will look it up, find nothing, and the card will draw empty');
  }
  if (hasStart && !into) {
    startNoInto.push(id + ' has a `start` and no `into` — nothing tells it where to draw');
  }
  if (into && !hasStart) {
    intoNoStart.push(id + " names `into: '" + into + "'` and has no `start` to fill it");
  }
});

/* ---------- AN ENGINE WITH NO WIDGET, WHICH IS HOW THREE GAMES VANISHED --------------------------
   I DELETED CONNECT 4, OTHELLO AND HERD MENTALITY BY ACCIDENT AND EVERY CHECK STAYED GREEN.

   Removing The Overworld, I cut from its entry to the next one I could see — and those three sat in
   between. 45 lines went. `check.js` was happy (the functions were still declared), `check-flow`
   was happy (it does not know what should be on a column), and `check/ui.js` was happy (it measures
   what is drawn, and three fewer pages measure fine). The app lost three games in silence.

   THE ONE SIGNAL THAT EXISTED WAS A SOFT NOTE. `check-dead` named `initHerd` among six other
   function names on a single comma-separated line, in a check that reports rather than fails. It
   did not name `initConnect4` or `initOthello` at all, because `on('c4-again')` still called them —
   so the code looked alive while nothing could reach it.

   SO THIS ASKS THE QUESTION FROM THE OTHER END. Not "does this widget work" but "is there machinery
   here for a widget that no longer exists": a function named like a widget's starter, in the files
   widgets are built from, that no widget's `start` mentions. A game's engine with no entry in
   WIDGETS is either a widget somebody deleted or one somebody forgot to add, and both are worth
   stopping for. The test is whether the name appears inside any widget's `start`, so a starter
   reached by a widget passes however it is spelled. */
/* KEPT ON PURPOSE, WITH A REASON EACH — the same arrangement check-payload.js and check-access.js
   use, and for the same reason: a permanently red check is one nobody opens, and a deliberate
   orphan is not a fault. An entry here is a promise that somebody looked. */
const ACCEPTED_ENGINE = {
  initOverworldBoard: 'The Overworld widget was removed on request; the board renderer stays because '
                    + 'the map it draws is used elsewhere in overworld.js. Deleting a working '
                    + 'renderer because one entry point closed is how a codebase loses things it '
                    + 'still needs.',
  initRound: 'Articulate and Charades are games inside the Word games widget; WORD_GAMES in '
           + 'games.js starts them from initWordGames, which is the starter a widget names.',
  initImposter: 'Imposter is a game inside the Word games widget; WORD_GAMES in games.js starts it '
              + 'from initWordGames, which is the starter a widget names.',
  initHerd: 'Herd Mentality is a game inside the Word games widget since the owner moved it there '
          + '("heard mentality is a word game so should go there."); WORD_GAMES in games.js starts '
          + 'it from initWordGames, which is the starter a widget names.',
};

const starters = widgets.map(w => String(w.start || '')).join(' ');
const engineFiles = ['games.js', 'map.js', 'book.js', 'me.js', 'overworld.js', 'find.js', 'receipt.js'];
const orphanEngine = [];
engineFiles.forEach(f => {
  const fp = path.join(jsDir, f);
  if (!fs.existsSync(fp)) return;
  const txt = fs.readFileSync(fp, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
  for (const m of txt.matchAll(/^function (init[A-Z]\w*)\s*\(/gm)) {
    const name = m[1];
    if (starters.indexOf(name) === -1 && !(name in ACCEPTED_ENGINE)) {
      orphanEngine.push(name + ' (' + f + ') \u2014 a widget starter that no widget start names');
    }
  }
});

const say = (title, list, soft) => {
  console.log('');
  console.log(title + '  (' + list.length + ')');
  if (!list.length) { console.log('  none'); return; }
  list.forEach(x => console.log('  ' + x));
  return soft ? 'soft' : 'hard';
};

let bad = 0, noted = 0;
[[ 'A WIDGET MISSING ONE OF THE FOUR KEYS EVERY WIDGET HAS', missingKey ],
 [ 'A `kind` NO COLUMN ASKS FOR', badKind ],
 [ 'THE SAME `id` TWICE', dupes ],
 [ 'AN `into` NAMING AN ID ITS OWN HTML DOES NOT CONTAIN', orphanInto ],
 [ 'A `start` WITH NOWHERE TO DRAW', startNoInto ],
 [ 'A WIDGET STARTER WITH NO WIDGET \u2014 deleted by accident, or never added', orphanEngine ],
 [ 'A WIDGET WITH NO TITLE \u2014 the column draws its own markup and nothing else', noTitle ],
].forEach(([t, l]) => { if (say(t, l) === 'hard') bad += l.length; });

/* SOFT: a slot waiting for its widget is how a placeholder looks, and `drill` is deliberately one. */
if (say('AN `into` WITH NO `start` YET — a placeholder, or a widget half-wired', intoNoStart, true)) {
  noted += intoNoStart.length;
}

console.log('');
/* THE ROSTER, PRINTED EVERY RUN. A count alone does not say WHICH \u2014 and the whole failure above
   was three names quietly leaving a list. Printed in full so a disappearance shows in a diff of this
   check's own output, which is the cheapest alarm there is. */
const untitled = Object.keys(ACCEPTED_UNTITLED);
if (untitled.length) {
  console.log('');
  console.log('A WIDGET WITH NO TITLE, ON PURPOSE  (' + untitled.length + ')');
  untitled.forEach(k => console.log('  ' + k + ' \u2014 ' + ACCEPTED_UNTITLED[k]));
}

const acceptedEngine = Object.keys(ACCEPTED_ENGINE);
if (acceptedEngine.length) {
  console.log('');
  console.log('A STARTER KEPT ON PURPOSE, WITH A REASON  (' + acceptedEngine.length + ')');
  acceptedEngine.forEach(k => console.log('  ' + k + ' \u2014 ' + ACCEPTED_ENGINE[k]));
}

/* ---------- AND THE WORD DECKS THAT ARE DEALT ON ONE COLUMN --------------------------------------
   ARTICULATE AND CHARADES ARE PAGES OF THE SAME COLUMN, so a word in both decks can be dealt twice
   in one sitting — once to be described and once to be mimed — and the second time the room already
   knows the answer. It happened: `Countdown` was in the charades TV deck and `a countdown` is in
   Articulate's Random, and the only thing that found it was an agent told to try to refute the deck
   rather than approve it.

   FOUR MORE DECKS JOINED THE COLUMN — Just a Minute's topics, Taboo's words, Hot Seat's words and
   20 Questions' secrets — and the argument is the same for all six: the answer to one game must not
   be the answer to another an hour later. So every pair is compared, not just the first two. Taboo's
   FORBIDDEN words are not dealt and are not compared; Imposter's deck is left out deliberately, and
   the note over `IMP_DECK` says why. A list that is dealt but never guessed goes in `OWN_ONLY` below
   and is checked for repeats within itself and nothing else.

   THE COMPARISON IGNORES A LEADING ARTICLE, because `a countdown` and `Countdown` are the same word
   to a room and different strings to a checker — which is the `spellKey_` argument one file along.

   THIS IS A FAILURE, NOT A COUNT, and it can be, because the number is zero: a collision is one word
   to change, not a backlog to work through. */
{
  const gsrc = fs.readFileSync(path.join(jsDir, 'games.js'), 'utf8');
  /* AN OBJECT ENDS AT `\n};` AND AN ARRAY AT `\n];`, and the nearer of the two is this deck's end. */
  const deck = name => {
    const i = gsrc.indexOf('const ' + name + ' =');
    if (i < 0) return null;
    const ends = ['\n};', '\n];'].map(e => gsrc.indexOf(e, i)).filter(j => j >= 0);
    if (!ends.length) return null;
    try { return new Function(gsrc.slice(i, Math.min(...ends) + 3) + '\nreturn ' + name + ';')(); }
    catch (e) { return null; }
  };
  /* A deck as one flat list of what is DEALT: a category object flattens, Taboo deals its first
     entry. */
  const flat = (d, pick) => {
    const all = Array.isArray(d) ? d : Object.keys(d).reduce((a, c) => a.concat(d[c]), []);
    return pick ? all.map(pick) : all;
  };
  const WORD_DECKS = [
    ['ART_DECK', 'articulate'], ['CHA_DECK', 'charades'], ['JAM_DECK', 'just a minute'],
    ['TABOO_DECK', 'taboo', c => c[0]], ['HOT_DECK', 'hot seat'], ['TWQ_DECK', '20 questions'],
  ];
  /* EMPTY SINCE ALIBI WENT. Its four lists — crimes, times, places and questions — were the only
     decks on the column that nobody guesses, and they were deleted with the game ("delete alibi
     game."). The list stays because the rule is still right for the next such deck, and naming a
     deck here is the whole of adding one. */
  const OWN_ONLY = [];
  /* AT LEAST 120 OF WHATEVER A ROUND IS ABOUT, which the owner asked for: below that a class gets
     the same card twice in an afternoon. */
  const FLOOR = 120;
  const SIZED = ['JAM_DECK', 'TABOO_DECK', 'HOT_DECK', 'TWQ_DECK'];

  const read = {};
  const unread = [];
  WORD_DECKS.map(d => d[0]).concat(OWN_ONLY).forEach(n => { read[n] = deck(n); if (!read[n]) unread.push(n); });
  /* A DECK THIS CANNOT READ IS NOT A PASS. "I did not manage to look" printed as "I looked and it
     was fine" is this repository's own recurring failure, and it is cheaper to say so here. */
  if (unread.length) {
    console.log('');
    console.log('COULD NOT READ ' + unread.join(', ') + ' out of games.js, so those decks were NOT compared');
    bad = true;
  } else {
    /* AND IT FOLDS A PLURAL, WORD BY WORD, which the first version of this rule did not. Comparing
       spellings let `Penguins` on Just a Minute sit beside `a penguin` on Charades, `Dinosaurs`
       beside Taboo's `dinosaur` and `Socks` beside 20 Questions' `a sock` — thirty-odd pairs a room
       hears as one word, every one of them passing a rule written to catch exactly that. So each word
       loses a plural ending and then a final e (`potatoes` and `potato`, `shoes` and `shoe`, `witches`
       and `witch` all meet), which is cruder than English and errs towards calling two words one —
       the cheaper mistake here, because the cost of a false alarm is choosing a different card.
       What it does NOT catch is one card inside another (`guitar` in `playing the guitar`): that is
       a judgement, and the five new decks were swept for it by hand rather than by a rule that would
       also refuse `a kettle` for appearing in a nursery rhyme. */
    const fold = t => t.replace(/ies$/, 'y').replace(/(sh|ch|x|ss|z)es$/, '$1')
      .replace(/([^s])s$/, '$1').replace(/([a-z]{2})e$/, '$1');
    const key = w => String(w).toLowerCase().replace(/[’']/g, '').replace(/^(a|an|the)\s+/, '')
      .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).map(fold).join(' ');
    const clash = [], twice = [], small = [], shape = [];
    const seen = new Map();
    WORD_DECKS.forEach(([n, label, pick]) => {
      const mine = new Set();
      flat(read[n], pick).forEach(w => {
        const k = key(w);
        if (mine.has(k)) { twice.push(label + ' ' + JSON.stringify(w)); return; }
        mine.add(k);
        const hit = seen.get(k);
        if (hit) clash.push(label + ' ' + JSON.stringify(w) + '  vs  ' + hit);
        else seen.set(k, label + ' ' + JSON.stringify(w));
      });
    });
    OWN_ONLY.forEach(n => {
      const mine = new Set();
      flat(read[n]).forEach(w => {
        const k = key(w);
        if (mine.has(k)) twice.push(n + ' ' + JSON.stringify(w)); else mine.add(k);
      });
    });
    SIZED.forEach(n => {
      const len = flat(read[n]).length;
      if (len < FLOOR) small.push(n + ' holds ' + len + ' — fewer than ' + FLOOR);
    });
    /* A TABOO CARD IS A WORD AND FOUR OR FIVE FORBIDDEN ONES, none of them the word itself and none
       twice — a card that forbids its own word is a card the describer cannot lose. */
    read.TABOO_DECK.forEach(c => {
      const ban = Array.isArray(c) ? c.slice(1) : [];
      if (!Array.isArray(c) || ban.length < 4 || ban.length > 5) {
        shape.push(JSON.stringify(c) + ' does not have four or five forbidden words');
      } else if (new Set(ban.map(key)).size !== ban.length || ban.some(b => key(b) === key(c[0]))) {
        shape.push(JSON.stringify(c) + ' forbids a word twice, or forbids its own word');
      }
    });
    [['ONE WORD IN TWO DECKS, ON ONE COLUMN', clash], ['THE SAME ENTRY TWICE IN ONE DECK', twice],
     ['A DECK UNDER ' + FLOOR, small], ['A TABOO CARD THE WRONG SHAPE', shape]].forEach(([t, l]) => {
      if (!l.length) return;
      console.log('');
      console.log(t + '  (' + l.length + ')');
      l.forEach(x => console.log('  ' + x));
      bad = true;
    });
    if (!bad) {
      console.log('');
      console.log('  decks: ' + WORD_DECKS.concat(OWN_ONLY.map(n => [n, n]))
        .map(([n, label, pick]) => label + ' ' + flat(read[n], pick).length).join(', '));
    }
  }
}

/* ---------- IMPOSTER'S DECK, WHICH IS LEFT OUT OF THE COMPARISON ABOVE AND NOT OUT OF EVERYTHING -------
   ASKED FOR AS "more categories and words" (8 Oct), and it went from eleven categories of twenty-two to
   twenty-seven of thirty. The note over `IMP_DECK` is the argument; this holds its shape, because every
   fault in a deck draws perfectly — a word dealt twice is a card that comes round twice as often, and
   nobody playing would ever say so.

   AT LEAST 25 CATEGORIES AND 30 WORDS IN EACH. Below that the owner's "more" quietly shrinks again; and
   the pile is every (category, word) pair, so a short category is a hint that comes up less for no
   reason anybody chose.

   NO WORD TWICE ANYWHERE, folded harder than the rule above: case, apostrophes, hyphens and a trailing
   s all go, so `hairdresser` and `hairdresser’s`, `fry-up` and `fry up`, `seed` and `seeds` meet. The
   old deck had the first pair, in Jobs and in Places, and passed every check there was.

   NO WORD THAT SAYS ITS OWN CATEGORY. The category is the imposter's whole hint, so `school bus` under
   School — the old deck had it, and `school trip` beside it — hands the imposter half of the answer.

   ANY WORD OF THE CATEGORY, NOT THE WHOLE OF IT. This tested for the whole phrase inside the card, and
   15 of the 27 categories are more than one word: `kitchen sink` under In the kitchen, `garden gnome`
   under In the garden and `toy box` under Toys and games were each put in and passed, with the line
   "none naming its category" printed under them (the review of 8 October). So each word of the
   category that carries meaning — not the, and, in, at or of — is held against each word of the card,
   folded the same way. Whole words still, so `seahorse` is not `sea`.

   `CAT_WORD_OK` IS THE ONE CARD LET THROUGH, with its reason, printed every run like the check's other
   lists: a new one is a failure, not a line added to a list nobody reads. */
{
  const gsrc = fs.readFileSync(path.join(jsDir, 'games.js'), 'utf8');
  const i = gsrc.indexOf('const IMP_DECK =');
  const j = i < 0 ? -1 : gsrc.indexOf('\n};', i);
  let D = null;
  try { if (j > i) D = new Function(gsrc.slice(i, j + 3) + '\nreturn IMP_DECK;')(); } catch (e) { D = null; }
  const impBad = [];
  if (!D || typeof D !== 'object') {
    impBad.push('COULD NOT READ IMP_DECK out of games.js, so Imposter\'s deck was NOT checked — not a pass');
  } else {
    const CATS = 25, PER = 30;
    const CAT_STOP = new Set(['the', 'and', 'in', 'at', 'of']);
    const CAT_WORD_OK = {
      'Sea life|sea urchin': 'it is the animal\'s name, and `urchin` alone is a word no six-year-old knows; '
        + 'every card in Sea life lives in the sea, which the hint has already said, and `seahorse` and '
        + '`seaweed` beside it carry the same three letters run together.',
    };
    const catOk = [];
    const fold = w => String(w).toLowerCase().replace(/[’']/g, '').split(/[\s-]+/).filter(Boolean)
      .map(t => t.replace(/s$/, '')).join(' ');
    const cats = Object.keys(D);
    if (cats.length < CATS) impBad.push('IMP_DECK has ' + cats.length + ' categories — fewer than ' + CATS);
    const where = new Map();
    let total = 0;
    cats.forEach(c => {
      const list = Array.isArray(D[c]) ? D[c] : [];
      total += list.length;
      if (list.length < PER) impBad.push(c + ' holds ' + list.length + ' words — fewer than ' + PER);
      const cw = fold(c).split(' ').filter(t => t && !CAT_STOP.has(t));
      list.forEach(w => {
        const k = fold(w);
        /* WHOLE WORDS, so `Sport` is not found in `transport` — but is in `sports day`. */
        const toks = k.split(' ');
        const hit = cw.filter(t => toks.indexOf(t) !== -1);
        if (hit.length) {
          const ok = CAT_WORD_OK[c + '|' + w];
          if (ok) catOk.push(c + ' ' + JSON.stringify(w) + ' — ' + ok);
          else impBad.push(c + ' ' + JSON.stringify(w) + ' says its own category (' + hit.join(', ') + ')');
        }
        const twin = where.get(k.replace(/ /g, ''));
        if (twin) impBad.push(c + ' ' + JSON.stringify(w) + '  is  ' + twin);
        else where.set(k.replace(/ /g, ''), c + ' ' + JSON.stringify(w));
      });
    });
    /* AN ACCEPTED ENTRY THE DECK NO LONGER HOLDS IS SAID, so the list cannot outlive its cards. */
    Object.keys(CAT_WORD_OK).forEach(key => {
      const [c, w] = key.split('|');
      if (!(D[c] || []).includes(w)) impBad.push('CAT_WORD_OK lets through ' + JSON.stringify(key) + ', which the deck no longer holds');
    });
    if (!impBad.length) {
      console.log('');
      console.log('  imposter: ' + cats.length + ' categories, ' + total + ' words, none twice, none naming its category'
                  + (catOk.length ? ' but ' + catOk.length + ' let through:' : ''));
      catOk.forEach(x => console.log('    ' + x));
    }
  }
  if (impBad.length) {
    console.log('');
    console.log('IMPOSTER\'S DECK  (' + impBad.length + ')');
    impBad.forEach(x => console.log('  ' + x));
    bad = true;
  }
}

/* ---------- THE SENTENCE SCRAMBLE'S SENTENCES AND THE WORD SEARCH'S WORDS ------------------------
   BOTH GAMES ARE ONLY AS GOOD AS THEIR LISTS, and every fault in a list draws perfectly: a sentence
   whose stated alternative uses a word the pool does not have is a right answer nobody can build; a
   theme word longer than its grid is never placed; a theme that cannot fill its puzzle three times
   over deals the same six words every time. And the word search's filter is a COPY of the backend's
   `HANDLE_BLOCKED` — the phone never sees that list — so the two are compared here, where a copy kept
   by hand would otherwise quietly fall behind. The notes over `SS_SENTENCES` and `WS_THEMES` in
   games.js are the argument for each rule. */
{
  const gsrc = fs.readFileSync(path.join(jsDir, 'games.js'), 'utf8');
  /* CUT TO THE FIRST LINE AT COLUMN ZERO THAT CLOSES IT, which is how every one of these is written,
     and evaluated on its own: a literal, so there is nothing in it that needs a browser. */
  const lit = (text, name) => {
    const i = text.indexOf('const ' + name + ' =');
    if (i < 0) return null;
    const m = /\n[\]}];/.exec(text.slice(i));
    if (!m) return null;
    try { return new Function(text.slice(i, i + m.index + 3) + '\nreturn ' + name + ';')(); }
    catch (e) { return null; }
  };
  const SENT = lit(gsrc, 'SS_SENTENCES'), THEMES = lit(gsrc, 'WS_THEMES'), NOT = lit(gsrc, 'WS_NOT');
  const csrc = (() => {
    const c = path.join(jsDir, '..', 'backend', 'constants.gs');
    return fs.existsSync(c) ? fs.readFileSync(c, 'utf8') : '';
  })();
  const BLOCKED = lit(csrc, 'HANDLE_BLOCKED');
  const lists = [];
  if (!SENT || !THEMES || !NOT || !BLOCKED) {
    lists.push('COULD NOT READ ' + [['SS_SENTENCES', SENT], ['WS_THEMES', THEMES], ['WS_NOT', NOT],
      ['HANDLE_BLOCKED (backend/constants.gs)', BLOCKED]].filter(x => !x[1]).map(x => x[0]).join(', ')
      + ', so the lists were NOT checked — not a pass');
  } else {
    /* SENTENCES */
    const seenS = new Set();
    let total = 0;
    Object.keys(SENT).forEach(band => {
      const list = SENT[band];
      if (!Array.isArray(list) || list.length < 40) {
        lists.push('scramble band ' + band + ' has ' + (list ? list.length : 0) + ' sentences — under 40 is a band '
                 + 'somebody plays through in one sitting');
      }
      (list || []).forEach(entry => {
        total++;
        const all = (Array.isArray(entry) ? entry : [entry]).map(x => String(x).trim());
        const chips = all.map(x => x.split(/\s+/));
        const head = all[0];
        if (seenS.has(head)) lists.push('scramble ' + band + ': ' + JSON.stringify(head) + ' is in the list twice');
        seenS.add(head);
        if (!/^[A-Z0-9]/.test(head)) lists.push('scramble ' + band + ': ' + JSON.stringify(head) + ' does not start with a capital');
        if (!/[.!?]$/.test(head)) lists.push('scramble ' + band + ': ' + JSON.stringify(head) + ' does not end with . ! or ?');
        if (chips[0].length < 4 || chips[0].length > 14) {
          lists.push('scramble ' + band + ': ' + JSON.stringify(head) + ' is ' + chips[0].length
                   + ' words; 4 to 14 is what a phone card can lay out as chips');
        }
        const bag = c => c.slice().sort().join('\u0001');
        chips.slice(1).forEach((c, k) => {
          if (bag(c) !== bag(chips[0])) {
            lists.push('scramble ' + band + ': the alternative ' + JSON.stringify(all[k + 1])
                     + ' is not the same words as ' + JSON.stringify(head) + ', so nobody can build it');
          }
          if (c.join(' ') === head) lists.push('scramble ' + band + ': ' + JSON.stringify(head) + ' lists itself as its own alternative');
        });
      });
    });
    if (total < 150) lists.push('the scramble has ' + total + ' sentences; the brief asks for at least 150');
    /* THEMES */
    const key = w => String(w).toUpperCase().replace(/[^A-Z]/g, '');
    const notKeys = NOT.map(key);
    const ids = new Set();
    THEMES.forEach(t => {
      if (ids.has(t.id)) lists.push('word search theme ' + t.id + ' is in the list twice');
      ids.add(t.id);
      const fits = (t.words || []).filter(w => key(w).length >= 3 && key(w).length <= t.size);
      (t.words || []).filter(w => fits.indexOf(w) === -1).forEach(w => {
        lists.push('word search ' + t.id + ': ' + JSON.stringify(w) + ' does not fit a ' + t.size + '-letter grid');
      });
      if (fits.length < t.n * 3) {
        lists.push('word search ' + t.id + ' has ' + fits.length + ' words that fit for ' + t.n + ' a puzzle — under '
                 + (t.n * 3) + ' and the same words come round every time');
      }
      const ks = new Set();
      (t.words || []).forEach(w => {
        if (ks.has(key(w))) lists.push('word search ' + t.id + ': ' + JSON.stringify(w) + ' is in the list twice');
        ks.add(key(w));
        /* NOT QUOTED BACK, which is `check-handles.js`'s rule: the word it matched is the thing nobody
           should have to read, and the theme word is enough to find it. */
        if (notKeys.some(b => key(w).indexOf(b) !== -1)) {
          lists.push('word search ' + t.id + ': ' + JSON.stringify(w) + ' contains a word the grid filter refuses, '
                   + 'so every puzzle it is placed in is thrown away');
        }
      });
    });
    const a = new Set(NOT.map(key)), b = new Set(BLOCKED.map(key));
    const only = (x, y) => [...x].filter(v => !y.has(v)).length;
    if (only(a, b) || only(b, a)) {
      lists.push('WS_NOT in games.js and HANDLE_BLOCKED in constants.gs disagree (' + only(b, a)
               + ' missing from the word search, ' + only(a, b) + ' extra) — the word search is a copy of the '
               + 'backend list and must be kept equal to it');
    }
    console.log('');
    console.log('  scramble: ' + total + ' sentences (' + Object.keys(SENT).map(k => k + ' ' + SENT[k].length).join(', ')
              + ')   word search: ' + THEMES.length + ' themes');
  }
  if (lists.length) {
    console.log('');
    console.log('A SENTENCE OR A WORD LIST THE GAME CANNOT USE  (' + lists.length + ')');
    lists.forEach(x => console.log('  ' + x));
    bad = true;
  }
}

/* ==================================================================================================
   A WIDGET DRAWN AHEAD RUNS NOTHING — AND ONE THAT SAYS IT READS NO FACTS READS NONE

   THE BUILDER DRAWS EVERY WIDGET SLOT BEFORE ANYBODY ARRIVES (`aheadDrawWidget_`, arcade.js;
   docs/history/341): a widget with no `stop` by its own `start`, one WITH a `stop` by its declared `draw`.
   The whole arrangement rests on two promises nothing else can see being broken:
     · A DRAW AHEAD RUNS NOTHING. A widget whose `start` runs something — a frame loop, a clock, a clip,
       a sound, the camera, the network — has a `stop`, and a widget with a `stop` is drawn by a `draw`
       that runs none of it. Broken, it is a game ticking or a film downloading on a column nobody is on,
       which is the flat battery arcade.js has always refused, now for every column at once. So EVERY
       draw ahead is run here in a sandbox and fails on: a fetch, an XHR, `send_` or `sendBeacon`; a media
       source (a `src` on a video, audio, source or iframe) or `play()`; an `AudioContext` or speech; the
       camera; any `setInterval`; a `setTimeout` or animation frame it set (or one of those set) still
       pending 400ms after the draw; and a write anywhere outside its own slot (any copy of it).
     · `pure: true` MEANS THE DRAWING READS NO FACTS — so it is carried through a paint and kept across a
       landing (`widgetsHeld_`, `widgetsReveil_`), and a wrong one is a drawing from old facts left on
       the glass. So each widget is drawn, with `Math.random` and `Date` held still, under five
       scenarios — signed out; a student; another student over a payload with every list changed; an
       admin; another admin over the changed payload — and its slot must come out byte-identical in
       every scenario it is drawn in IF AND ONLY IF it says `pure`. A widget drawn in fewer than two
       scenarios that differ in both person and facts cannot be proved pure, and may not say so.
   A STOP WITH NO DRAW is refused before any of it: the builder would have nothing safe to draw it by. */
const ACCEPTED_IMPURE = {
  mat: 'reads the cheat sheet tab (`DATA.cheatsheet`), which the fixture leaves empty, so both payloads draw the built-in sheet',
  reels: 'reads the facts tab through `factsNow_`, which the fixture leaves empty, so both payloads deal the built-in facts',
  videos: 'a typed search lists the owner\'s list and an admin\'s films (`DATA.films`); the bar drawn ahead with nothing typed reads neither',
};
async function drawAheadRuntime_() {
  const out = { fails: [], pureWrong: [], drawn: 0, scenarios: 0, notes: [] };
  /* EVERY WIDGET WITH A STOP DECLARES A DRAW — read off the parsed list, as the rules above are. */
  widgets.forEach(w => {
    if (w._keys.includes('stop') && !w._keys.includes('draw')) {
      out.fails.push(str(w.id) + ' has a `stop` and no `draw` — the builder cannot draw it ahead without running it');
    }
  });
  let JSDOM;
  try { ({ JSDOM } = require('jsdom')); }
  catch (e) { out.fails.push('jsdom could not be loaded (' + e.message + '), so NO draw ahead was run — not a pass'); return out; }
  const root = path.join(jsDir, '..');
  const html0 = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const fm = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html0);
  if (!fm) { out.fails.push('cannot read window.FILES out of index.html, so NO draw ahead was run'); return out; }
  const order = [...fm[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
  const appSrc = order.map(n => fs.readFileSync(path.join(jsDir, n + '.js'), 'utf8')).join('\n');
  const fixture = JSON.parse(fs.readFileSync(path.join(root, 'check', 'fixture.json'), 'utf8'));
  /* THE CHANGED PAYLOAD: every list in it different — each row's words altered, its numbers moved, its dates
     three days later, and one row more — and the settings and switches beside them moved too. A drawing
     that reads any of it differs. The few keys that say what the payload IS rather than what it holds
     (its version, which features are on, which columns exist) are left, or the app would be a different
     app rather than the same one over different facts. */
  const shiftDate = v => v.replace(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g, (m, d, mo, y) => {
    const t = new Date(Date.UTC(+y, +mo - 1, +d + 3));
    return String(t.getUTCDate()).padStart(2, '0') + '/' + String(t.getUTCMonth() + 1).padStart(2, '0') + '/' + t.getUTCFullYear();
  }).replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (m, y, mo, d) => new Date(Date.UTC(+y, +mo - 1, +d + 3)).toISOString().slice(0, 10));
  const bend = v => {
    if (typeof v === 'string') return !v ? 'x' : (shiftDate(v) !== v ? shiftDate(v) : v + ' (2)');
    if (typeof v === 'number') return v + 7;
    if (Array.isArray(v)) return v.map(bend);
    if (v && typeof v === 'object') { const o = {}; Object.keys(v).forEach(k => { o[k] = bend(v[k]); }); return o; }
    return v;
  };
  const KEEP = new Set(['version', 'cached', 'fileVersions', 'features', 'columns', 'googleClientId']);
  const changed = JSON.parse(JSON.stringify(fixture));
  Object.keys(changed).forEach(k => {
    const v = changed[k];
    if (KEEP.has(k)) return;
    if (Array.isArray(v)) changed[k] = v.length ? v.map(bend).concat([bend(v[0])]) : v;
    else if (v && typeof v === 'object') changed[k] = bend(v);
  });
  const T0 = Date.UTC(2026, 9, 7, 10, 0, 0);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const P = (id, role, extra) => Object.assign({ name: 'Test ' + id, personId: id, person_id: id, role, roles: [role],
    handle: 'test' + id.toLowerCase(), token: 't-' + id }, extra || {});
  /* WHO, OVER WHICH FACTS. The tutor is the fixture's own (P002, with a row and hours of her own), so a
     widget that reads the person's row reads one; the same basket is on the device in every scenario, so
     the basket draws its prices — which come from the facts. */
  const SCEN = [
    { key: 'signed out', user: null, data: fixture },
    { key: 'student', user: P('P9', 'student'), data: fixture },
    /* WITH A WEEK OF HER OWN: a drawing that reads the person (the timetable's `USER.timetable`) differs
       between two people here, so `pure` can only be said of one that reads nobody. Without it every
       scenario's person had an empty week and the timetable passed as pure (review, 12 Oct). */
    { key: 'student 2, changed facts', user: P('P8', 'student', { timetable: JSON.stringify({ weekend: true,
        days: [0, 1, 2, 3, 4, 5, 6].map(i => [{ id: 'L' + i, at: '09:0' + i, subject: 'Maths' }]) }) }), data: changed },
    { key: 'admin', user: P('P001', 'admin'), data: fixture },
    { key: 'tutor, changed facts', user: P('P002', 'tutor', { name: 'Ada Tutor' }), data: changed },
  ];
  const BASKET = [{ key: 'T1', name: 'Quadratics', kind: 'print', cost: 0, money: 0.16, pages: 8 }];
  const marks = {};   // id -> [{ scen, html }]
  for (const sc of SCEN) {
    let w;
    try { w = await bootFor_(sc); }
    catch (e) { out.fails.push('the app did not boot for "' + sc.key + '" (' + e.message + '), so its draws were NOT run'); continue; }
    out.scenarios++;
    const t = w.__wt;
    const seenHere = new Set();
    for (const col of ['tools', 'games', 'shop']) {
      try { if (t.STALE()[col] || !w.document.querySelector('#s-' + col + ' .widget-slot')) t.paint(col, true); } catch (e) {}
      const list = (() => { try { return t.widgetsOn(col); } catch (e) { return []; } })();
      for (const wd of list) {
        const id = String(wd.id);
        if (seenHere.has(id)) continue;
        const draw = typeof wd.draw === 'function' ? wd.draw : (!wd.stop && typeof wd.start === 'function' ? wd.start : null);
        if (!draw) continue;
        const slot = t.slotOn(col, id);
        if (!slot) continue;
        seenHere.add(id);
        const got = await sandboxDraw_(w, t, wd, col, slot, draw, T0);
        out.drawn++;
        got.fails.forEach(f => out.fails.push(id + ' (' + sc.key + '): ' + f));
        (marks[id] = marks[id] || []).push({ scen: sc, html: got.html });
        if (process.env.CW_DUMP && process.env.CW_DUMP.split(',').indexOf(id) !== -1) console.log('--- ' + id + ' (' + sc.key + ')\n' + got.html.slice(0, 1500));
      }
    }
    try { w.close(); } catch (e) {}
  }
  /* PURE, IF AND ONLY IF THE SAME IN EVERY SCENARIO — and drawn under two people and two sets of facts. A
     widget that reads facts these scenarios do not reach is listed in `ACCEPTED_IMPURE` with what it reads:
     the same arrangement as `ACCEPTED` in check-payload.js, so a new one fails loudly instead of joining it. */
  const declared = new Set(widgets.filter(x => /^\s*true\s*$/.test(String(x.pure || ''))).map(x => str(x.id)));
  Object.keys(marks).forEach(id => {
    const m = marks[id];
    const same = m.every(x => x.html === m[0].html);
    const varied = m.some(x => x.scen.data !== m[0].scen.data) && m.some(x => String((x.scen.user || {}).personId) !== String((m[0].scen.user || {}).personId));
    const isPure = same && varied;
    if (declared.has(id) && !isPure) {
      const diff = m.find(x => x.html !== m[0].html);
      out.pureWrong.push(id + ' says `pure: true` and its drawing ' + (diff
        ? 'differs between "' + m[0].scen.key + '" and "' + diff.scen.key + '" — it reads facts, and a paint would carry a stale drawing'
        : 'was drawn in only ' + m.length + ' scenario(s), which cannot prove it reads no facts'));
    }
    if (!declared.has(id) && isPure && !ACCEPTED_IMPURE[id]) {
      out.pureWrong.push(id + ' draws the same markup for every person and every payload and does not say `pure: true` — '
        + 'say it, so a paint carries its drawing instead of putting it back under the loader');
    }
  });
  declared.forEach(id => { if (!marks[id]) out.pureWrong.push(id + ' says `pure: true` and was never drawn here, so nothing proved it'); });
  out.notes.push('pure: ' + Object.keys(marks).filter(id => declared.has(id)).sort().join(', '));
  return out;

  /* ONE APP IN A REAL DOM, signed in (or not) the way the browser's own boot reads it, the builder held so
     nothing is drawn but what this asks for, and the payload landed. */
  async function bootFor_(sc) {
    const html = html0.replace(/<script[\s\S]*?<\/script>/g, '');
    const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
    const w = dom.window;
    w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
    w.confirm = () => true;
    w.prompt = () => '';
    try {
      w.HTMLMediaElement.prototype.pause = function () {};
      w.HTMLMediaElement.prototype.load = function () {};
    } catch (e) {}
    w.__sb = { on: false, hits: [] };
    const hit = what => { if (w.__sb.on) w.__sb.hits.push(what); };
    const realFetch = (url, o) => {
      hit('a fetch of ' + String(url).slice(0, 80));
      const body = o && o.body ? { success: true } : sc.data;
      return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)), json: () => Promise.resolve(body) });
    };
    w.fetch = realFetch;
    const xo = w.XMLHttpRequest && w.XMLHttpRequest.prototype.open;
    if (xo) w.XMLHttpRequest.prototype.open = function () { hit('an XHR'); return xo.apply(this, arguments); };
    try { Object.defineProperty(w.navigator, 'sendBeacon', { value: () => { hit('sendBeacon'); return true; }, configurable: true }); } catch (e) {}
    try {
      Object.defineProperty(w.navigator, 'mediaDevices', { configurable: true, value: {
        getUserMedia: () => { hit('the camera (getUserMedia)'); return new Promise(() => {}); },
        enumerateDevices: () => Promise.resolve([]) } });
    } catch (e) {}
    const fake = () => new Proxy(function () {}, { get: (o, k) => (k === 'then' ? undefined : fake()), apply: () => fake(), construct: () => fake() });
    w.AudioContext = w.webkitAudioContext = function () { hit('an AudioContext'); return fake(); };
    w.speechSynthesis = { speak: () => hit('speech'), cancel() {}, pause() {}, resume() {}, getVoices: () => [], speaking: false, pending: false,
      addEventListener() {}, removeEventListener() {} };
    w.SpeechSynthesisUtterance = function () {};
    try { w.HTMLMediaElement.prototype.play = function () { hit('play() on a ' + this.tagName.toLowerCase()); return Promise.resolve(); }; } catch (e) {}
    if (sc.user) w.localStorage.setItem('familyUser', JSON.stringify(sc.user));
    w.localStorage.setItem('familyCart', JSON.stringify(BASKET));
    w.__aheadHold = true;
    w.eval(appSrc + '\n;window.__wt = { paint, widgetsOn: c => widgetsOn_(c), slotOn: (c, i) => slotOn_(c, i),'
      + ' HOME: WIDGET_HOME, loading: () => loading_(), STALE: () => STALE, loaded: () => LOADED, user: () => USER,'
      + ' send: typeof send_ === "function" ? send_ : null, ahead: v => { AHEAD.running = v; } };');
    if (typeof w.send_ === 'function') { const s0 = w.send_; w.send_ = function () { hit('send_'); return s0.apply(this, arguments); }; }
    for (let i = 0; i < 100 && !w.__wt.loaded(); i++) await sleep(50);
    if (!w.__wt.loaded()) throw new Error('the payload never landed');
    await sleep(100);
    return w;
  }

  /* ONE DRAW, WATCHED. The slot goes back to what `widgetOnColumn_` writes, the clocks and the dice are held
     still, `$` is told which copy (`WIDGET_HOME`, as the builder does), and everything the draw — or a timer
     or frame it set — asks for is written down. Then 400ms for anything it left pending. */
  async function sandboxDraw_(w, t, wd, col, slot, draw, T0) {
    const fails = [];
    const id = String(wd.id);
    slot.innerHTML = wd.html + t.loading();
    slot.setAttribute('aria-busy', 'true');
    const RealDate = w.Date;
    class Still extends RealDate {
      constructor(...a) { if (a.length) super(...a); else super(T0); }
      static now() { return T0; }
    }
    let seed = 12345;
    const realRandom = w.Math.random;
    w.Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    w.Date = Still;
    const mine = new Map();   // timer handle -> 'pending' | 'done'
    let inMine = 0;
    const rT = w.setTimeout, rC = w.clearTimeout, rI = w.setInterval, rA = w.requestAnimationFrame, rCA = w.cancelAnimationFrame;
    const sb = w.__sb;
    const own = el => { for (let n = el; n; n = n.parentNode) { if (n.id === 'wgt-' + id && n.classList && n.classList.contains('widget-slot')) return true; } return false; };
    const media = /^(VIDEO|AUDIO|SOURCE|IFRAME)$/;
    const mo = new w.MutationObserver(() => {});
    const probes = new Set();
    const audit = () => {
      mo.takeRecords().forEach(r => {
        const tgt = r.target;
        if (r.type === 'attributes' && r.attributeName === 'src' && tgt && media.test(tgt.tagName || '') && tgt.getAttribute('src')) {
          fails.push('gave a <' + tgt.tagName.toLowerCase() + '> a source');
        }
        (r.addedNodes ? [...r.addedNodes] : []).forEach(n => {
          if (!n.querySelectorAll) return;
          [n].concat([...n.querySelectorAll('video,audio,source,iframe')]).forEach(m => {
            if (media.test(m.tagName || '') && m.getAttribute && m.getAttribute('src')) fails.push('drew a <' + m.tagName.toLowerCase() + '> with a source');
          });
        });
        /* A PROBE IS NOT A WRITE: an element put at the end of the body to be measured and taken away in the
           same tick (the cheat sheet's x-height and page gauge, mat.js) leaves nothing behind. */
        (r.addedNodes ? [...r.addedNodes] : []).forEach(n => probes.add(n));
        const probe = r.type === 'childList' && [...(r.addedNodes || [])].every(n => !n.isConnected)
          && [...(r.removedNodes || [])].every(n => probes.has(n));
        if (!own(tgt) && !probe) fails.push('wrote outside its own slot (' + r.type + ' on <' + String(tgt.nodeName).toLowerCase()
          + (tgt.id ? '#' + tgt.id : '') + (tgt.className && typeof tgt.className === 'string' ? '.' + tgt.className.split(/\s+/)[0] : '') + '>)');
      });
    };
    const wrap = fn => function () { inMine++; try { return fn.apply(this, arguments); } finally { inMine--; audit(); } };
    w.setTimeout = function (fn, ms) {
      if (!inMine || typeof fn !== 'function') return rT.apply(w, arguments);
      const h = rT.call(w, function () { mine.set(h, 'done'); return wrap(fn).apply(this, arguments); }, ms);
      mine.set(h, 'pending');
      return h;
    };
    w.clearTimeout = function (h) { if (mine.has(h)) mine.set(h, 'done'); return rC.call(w, h); };
    w.setInterval = function () { if (inMine) fails.push('set an interval'); return rI.apply(w, arguments); };
    w.requestAnimationFrame = function (fn) {
      if (!inMine) return rT.call(w, () => fn(RealDate.now()), 16);
      const h = rT.call(w, () => { mine.set(h, 'done'); wrap(fn)(RealDate.now()); }, 16);
      mine.set(h, 'pending');
      return h;
    };
    w.cancelAnimationFrame = function (h) { if (mine.has(h)) mine.set(h, 'done'); return rC.call(w, h); };
    mo.observe(w.document, { subtree: true, childList: true, attributes: true, characterData: true });
    const had = Object.prototype.hasOwnProperty.call(t.HOME, slot.id) ? t.HOME[slot.id] : undefined;
    t.HOME[slot.id] = col;
    sb.hits = []; sb.on = true;
    /* AS THE BUILDER DRAWS IT — inside a slice (`AHEAD.running`, which `aheadSlice_` holds for the job), so a
       draw that asks whether it is being drawn ahead is asked the question the app asks it. */
    try { t.ahead('widget:' + col + ':' + id); wrap(() => draw())(); }
    catch (e) { fails.push('threw: ' + e.message); }
    finally { t.ahead(false); if (had === undefined) delete t.HOME[slot.id]; else t.HOME[slot.id] = had; }
    const htmlNow = slot.innerHTML;
    /* WHAT IT LEFT FOR LATER, given its 400ms — with the dice still held, so a timer's own redraw is as still
       as the first. */
    const until = RealDate.now() + 400;
    while (RealDate.now() < until) await new Promise(r => rT.call(w, r, 20));
    sb.on = false;
    audit();
    mo.disconnect();
    sb.hits.forEach(h => fails.push('asked for ' + h));
    const pend = [...mine.values()].filter(v => v === 'pending').length;
    if (pend) fails.push(pend + ' timer(s) or frame(s) still pending 400ms after the draw — something is still running');
    w.setTimeout = rT; w.clearTimeout = rC; w.setInterval = rI; w.requestAnimationFrame = rA; w.cancelAnimationFrame = rCA;
    w.Date = RealDate; w.Math.random = realRandom;
    return { fails: [...new Set(fails)], html: htmlNow };
  }
}

drawAheadRuntime_().then(rt => {
  if (rt.fails.length) {
    console.log('');
    console.log('A WIDGET DRAWN AHEAD THAT RUNS SOMETHING  (' + rt.fails.length + ')');
    rt.fails.forEach(x => console.log('  ' + x));
    bad = true;
  }
  if (rt.pureWrong.length) {
    console.log('');
    console.log('`pure` SAYS SOMETHING THE DRAWING DOES NOT  (' + rt.pureWrong.length + ')');
    rt.pureWrong.forEach(x => console.log('  ' + x));
    bad = true;
  }
  console.log('');
  console.log('  drawn ahead in a sandbox: ' + rt.drawn + ' draws over ' + rt.scenarios + ' scenarios');
  rt.notes.forEach(x => console.log('  ' + x));
  finish_();
}, e => { console.log('FAILED — the draw-ahead sandbox threw: ' + (e && e.stack || e)); bad = true; finish_(); });

function finish_() {
console.log('');
console.log('  tools: ' + widgets.filter(w => str(w.kind) === 'tool').map(w => str(w.id)).join(', '));
console.log('  games: ' + widgets.filter(w => str(w.kind) === 'game').map(w => str(w.id)).join(', '));
console.log('');
console.log('widgets: ' + widgets.length
          + '   tools: ' + widgets.filter(w => str(w.kind) === 'tool').length
          + '   games: ' + widgets.filter(w => str(w.kind) === 'game').length);
console.log(bad
  ? 'FAILED — each of those is a widget that draws and does nothing.'
  : 'OK — every widget has the four keys, a kind a column asks for, a unique id, and an `into` its '
    + 'own html contains; every draw ahead runs nothing, and `pure` says what the drawing does.');
process.exit(bad ? 1 : 0);
}
