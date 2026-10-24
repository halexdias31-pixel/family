#!/usr/bin/env node
/* @family. — check-widgets.js EVERY WIDGET IS THE SAME SHAPE, AND NOTHING WAS CHECKING THAT IT WAS. § */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report

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

/* ---------- AND THE ONE THAT MEANS IT, WITH ITS REASON WRITTEN DOWN § */
const ACCEPTED_UNTITLED = {
  chess: 'a chessboard names itself; the widget says so in its own comment and always has.',
};
const seen = {};

/* ---------- THE KINDS A COLUMN ASKS FOR, READ OFF THE CODE THAT ASKS § */
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

  /* ---------- THE WIDGET'S OWN MARKUP CARRIES ITS TITLE § */
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

/* ---------- AN ENGINE WITH NO WIDGET, WHICH IS HOW THREE GAMES VANISHED § */
/* KEPT ON PURPOSE, WITH A REASON EACH — the same arrangement check-payload.js and check-access.js use, and for the same reason: § */
const ACCEPTED_ENGINE = {
  initOverworldBoard: 'The Overworld widget was removed on request; the board renderer stays because '
                    + 'the map it draws is used elsewhere in overworld.js. Deleting a working '
                    + 'renderer because one entry point closed is how a codebase loses things it '
                    + 'still needs.',
  initRound: 'Articulate and Charades are games inside the Word games widget; WORD_GAMES in '
           + 'games.js starts them from initWordGames, which is the starter a widget names.',
  initConnect4: 'Connect 4 is a game inside the Board games widget (414); BOARD_GAMES in games.js starts it from initBoardGames, the starter a widget names.',
  initOthello: 'Othello is a game inside the Board games widget (414); BOARD_GAMES in games.js starts it from initBoardGames, the starter a widget names.',
  initScrabble: 'Scrabble is a game inside the Board games widget (414); BOARD_GAMES in games.js starts it from initBoardGames, the starter a widget names.',
  initImposter: 'Imposter is a game inside the Word games widget; WORD_GAMES in games.js starts it '
              + 'from initWordGames, which is the starter a widget names.',
  initHerd: 'Herd Mentality is a game inside the Word games widget since the owner moved it there '
          + '("heard mentality is a word game so should go there."); WORD_GAMES in games.js starts '
          + 'it from initWordGames, which is the starter a widget names.',
  initWhiteboard: 'The Whiteboard widget is the maths notebook in board.js since 377 (initBoard_). The pen on a '
                + 'blank sheet stays in find.js as the sheet check/pen.js, check/press.js and the pen journeys '
                + 'draw on; whether to delete it waits on the branch changing the pen.',
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
/* THE ROSTER, PRINTED EVERY RUN. § */
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

/* ---------- AND THE WORD DECKS THAT ARE DEALT ON ONE COLUMN § */
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
  /* EMPTY SINCE ALIBI WENT. § */
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
    /* AND IT FOLDS A PLURAL, WORD BY WORD, which the first version of this rule did not. § */
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

/* ---------- IMPOSTER'S DECK, WHICH IS LEFT OUT OF THE COMPARISON ABOVE AND NOT OUT OF EVERYTHING § */
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
    const CAT_WORD_OK = {};
    const NEWER = [[0x26a7, 0x26a7], [0x1f6d6, 0x1f6d8], [0x1f6dc, 0x1f6df], [0x1f6fb, 0x1f6fc], [0x1f7f0, 0x1f7f0],
      [0x1f90c, 0x1f90c], [0x1f972, 0x1f972], [0x1f977, 0x1f979], [0x1f9a3, 0x1f9a4], [0x1f9ab, 0x1f9ad],
      [0x1f9cb, 0x1f9cc], [0x1fa74, 0x1fa77], [0x1fa7b, 0x1fa7c], [0x1fa83, 0x1fa8a], [0x1fa8e, 0x1fa8f],
      [0x1fa96, 0x1fac6], [0x1fac8, 0x1fac8], [0x1facd, 0x1fadc], [0x1fadf, 0x1faea], [0x1faef, 0x1faf8],
      [0x1fb00, 0xdffff]];
    const ZWJ_OK = {
      '👩‍🏫': '4.0', '👨‍⚕️': '4.0', '👩‍🚒': '4.0', '👨‍🌾': '4.0', '👩‍🍳': '4.0', '👨‍✈️': '4.0',
      '👩‍🔬': '4.0', '👨‍🎨': '4.0', '👩‍🔧': '4.0', '👨‍⚖️': '4.0', '👨‍💼': '4.0', '👩‍💻': '4.0',
      '👩‍🏭': '4.0', '👨‍🎤': '4.0', '👩‍🎤': '4.0', '👩‍🎓': '4.0', '👩‍🚀': '4.0',
      '🧙‍♀️': '5.0', '🧙‍♂️': '5.0', '🧜‍♀️': '5.0',
      '👩‍🦱': '11.0', '👩‍🦰': '11.0', '👨‍🦲': '11.0', '🏴‍☠️': '11.0',
    };
    /* PICTURES A CHILD WOULD CALL ONE THING. § */
    const LOOKALIKE = [
      ['🐯🐅', 'a tiger'], ['🐶🐕🦮🐩🐕‍🦺', 'a dog'], ['🐱🐈', 'a cat'], ['🐮🐄', 'a cow'], ['🐷🐖🐽', 'a pig'],
      ['🐴🐎', 'a horse'], ['🐭🐁', 'a mouse'], ['🐰🐇', 'a rabbit'], ['🐵🐒', 'a monkey'], ['🐤🐥🐣', 'a chick'],
      ['🐲🐉', 'a dragon'], ['🐳🐋', 'a whale'], ['🐪🐫', 'a camel'],
      ['🏅🥇🥈🥉🎖️', 'a medal'], ['📚📖📕📗📘📙📓📒📔', 'a book'], ['🎶🎵', 'music notes'], ['👚👕', 'a top'],
      ['🎉🎊🥳', 'confetti and a party'], ['🏖️⛱️', 'a beach umbrella'], ['🛣️🛤️', 'a road or a railway, drawn the same way'],
      ['💿📀', 'a disc'], ['📣📢', 'a megaphone'], ['☂️☔🌂', 'an umbrella'], ['☀️🌞', 'the sun'],
      ['🌙🌛🌜🌒🌓🌔🌕🌖🌗🌘🌝🌑🌚🌃', 'the moon'], ['🌅🌄🌇', 'the sun on the horizon'], ['🏘️🏡🏠', 'a house'],
      ['🎤🎙️', 'a microphone'], ['🔊🔉🔈', 'a speaker'], ['🔔🛎️🔕', 'a bell'], ['🍦🍨', 'an ice cream'],
      ['🍗🍖', 'meat on a bone'], ['😠😡', 'an angry face'], ['❌✖️❎', 'a cross'], ['✔️☑️✅', 'a tick'],
      ['🌐🌍🌎🌏', 'a globe'], ['🧚🧚‍♀️🧚‍♂️', 'a fairy'], ['🚥🚦', 'traffic lights'],
      ['🛍️🛒', 'shopping'], ['🥘🍳', 'a pan with food in it, seen from above'], ['⭐🌟🌠🌌🌃', 'stars'],
    ].map(([s, what]) => ({ what: what, pics: [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].map(x => x.segment.replace(/\uFE0F/g, '')) }));
    /* WHAT A CHILD CALLS EACH CATEGORY'S PICTURE, by the picture — see "a category's picture is never
       one of its own cards" above. Not every name it could have: the names a child at the table would
       say first, looking at it. */
    const SYM_SAYS = {
      '😋': ['yum', 'yummy', 'tasty', 'hungry'], '🥗': ['salad'], '🥘': ['paella', 'stew', 'pan', 'pan of food'],
      '🏠': ['house', 'home'], '🧰': ['toolbox', 'tool box', 'tools'], '👚': ['top', 'blouse', 'shirt', 't-shirt'],
      '🧍': ['person', 'standing', 'body'], '🎭': ['mask', 'masks', 'theatre', 'drama'],
      '🚶': ['walking', 'walk', 'person walking'], '👥': ['people', 'person', 'shadow'], '🐯': ['tiger'],
      '🐾': ['paw prints', 'paws', 'paw'], '🌊': ['wave', 'waves', 'sea'], '🏞️': ['park', 'countryside', 'river', 'lake'],
      '🔭': ['telescope'], '🧚': ['fairy'], '🌐': ['globe', 'world'],
      '🏘️': ['houses', 'street', 'town', 'village'], '🏅': ['medal', 'gold medal'],
      '🎒': ['backpack', 'school bag', 'bag', 'rucksack'], '🚥': ['traffic lights', 'traffic light'],
      '🎈': ['balloon'], '🎲': ['dice'], '🎶': ['music', 'notes', 'music notes', 'musical notes', 'musical note', 'music note'],
      '🔣': ['symbols'],
    };
    const NEAR_OK = {
      'Fruit and veg|potato|sweet potato': 'a different vegetable: orange inside, and roasted, where 🥔 is mashed and chipped',
      'At home|clock|alarm clock': 'the one with bells that wakes you up: 🕰️ is the mantelpiece clock, and "ring", "morning" are not clues for it',
      'At home|toilet|toilet roll': 'a roll of paper and a toilet are two things, drawn nothing alike',
      'Clothes|boots|walking boots': 'a hiking boot (🥾, laces and mud) against a tall heeled boot (👢)',
      'Clothes|coat|lab coat': 'what a scientist wears, white, in a lab — 🥼 against a winter 🧥',
      'Space and weather|star|shooting star': 'a streak across the sky that you wish on, not a point of light',
      'Space and weather|moon|full moon': 'the round bright one werewolves wait for, where 🌙 is the crescent a child draws — kept because Space and weather has no other honest picture left at 12.0, and `half moon` went',
      'Space and weather|satellite|satellite dish': 'one is in space and one is on the side of a house: 🛰️ against 📡',
      'Nature|tree|pine tree': 'the needles-and-cones tree, drawn green and pointed (🌲), against the round 🌳',
      'Nature|tree|palm tree': 'the beach tree with coconuts — its own talk: sand, hot, island',
      'Celebrations|Christmas|Father Christmas': 'the day (a tree, 🎄) against the man (🎅) — "presents" fits both, "beard" and "sleigh" only him',
      'Sport|football|American football': 'two games: 🏈 is egg-shaped, thrown and padded, and in Britain "football" is the other one',
      'Sport|hockey|ice hockey': 'two games on two surfaces, 🏑 grass and 🏒 ice, drawn with two different sticks',
      'School|pen|fountain pen': 'the one with a nib and ink, drawn as its nib (🖋️), against a biro (🖊️)',
      'Transport|train|bullet train': 'the Japanese one, white and pointed (🚅), against a steam train (🚂)',
      'Transport|train|train track': 'what a train runs on, not a train: rails and sleepers, drawn with no train on them',
      'Transport|car|police car': 'a police car is talked about as police — siren, blue lights, robbers — not as a car',
      'Transport|car|racing car': 'a Formula 1 car, drawn low and open (🏎️): fast, track, helmet',
      'Transport|car|cable car': 'not a car at all: a box hanging from a wire up a mountain',
      'Transport|ship|cruise ship': 'a holiday on a floating hotel (🛳️) against an old liner (🚢) — kept, with the ferry, because Transport has no other honest vehicle left at 12.0; `truck` went, being `lorry` again',
      'Pets and farm animals|dog|guide dog': 'the dog that helps a blind person, in its harness (🦮): its talk is the job, not the dog',
      'Pets and farm animals|chick|hatching chick': 'a chick still breaking out of its egg (🐣) — kept because the pets and farm animals at 12.0 are all in the deck',
    };
    /* LOOKED AT AND KEPT — a category's picture beside cards of its own that it draws, or is drawn like, and is not: § */
    const KEPT = {
      'Fruit and veg|🥗|lettuce,tomato,cucumber': 'a salad is three cards in one bowl, so it points at all three and at none — and every fruit and vegetable drawn at 12.0 is a card already (🍏 went as `apple` again), so there is no other picture to give it',
      'Clothes|👚|vest': 'two tops laid flat, but a blouse with sleeves and a collar against a sleeveless running vest with a sash — a child calls them "top" and "vest" — and every Clothes picture is a garment laid flat',
      'Feelings|🎭|happy,sad': 'the masks are two faces at once, one happy and one sad, so they point at both and at neither — and FEELINGS under them gives every imposter those two as the first guesses anyway. No picture of a feeling at 12.0 is not one of the thirty: every face is a card, a heart is `in love`, a thought bubble is `thinking`',
      'Actions|🚶|running': 'the same person in a stride, walking against running — upright and leaning in both drawings — and no card is walking. Every Actions card is a person doing something, so any picture of one is beside one of them',
      'At the seaside|🌊|surfing': 'Apple\'s 🏄 is a surfer on a board with no wave at all, and Noto\'s wave is behind him. A wave is the sea every seaside card is in or beside — swimming, sailing boat, beach — and a child names 🌊 "wave", never "surfing"',
      'Nature|🏞️|mountain,tree,pine tree': 'a landscape is several Nature cards at once, and in Apple\'s drawing a mountain is the biggest thing in it — the nearest of these to the pairs the second review failed. Kept because nothing is left to put in either place: every other landscape at 12.0 is a mountain again (🏔️ 🗻), a Nature card already (🏜️ 🌋) or another category\'s (🌄 🏕️), and every plant left is a double of one (🌿 of 🌱, 🍁 of 🍂)',
      'Space and weather|🔭|satellite dish': 'both point at the sky, but one is a tube on legs you look through and the other a dish on the side of a house; a child names them apart in both drawings',
      'Music|🎶|treble clef': '🎼 is a clef on a stave, and neither Noto nor Apple draws a note on it — a child names it by the clef. The one name it shares with 🎶 is "music", the category\'s own name, printed under the picture for every imposter anyway',
      'Signs and symbols|🔣|hashtag': 'a key of four symbols against a key of one, but the blue key is how both sets draw every keycap — ℹ️ and 🆕 are the same key — so the key points at none of them, and a child calls 🔣 "symbols", never "hashtag"',
    };
    const keptOk = [];
    const catOk = [];
    const fold = w => String(w).toLowerCase().replace(/[’']/g, '').split(/[\s-]+/).filter(Boolean)
      .map(t => t.replace(/s$/, '')).join(' ');
    const hex = s => [...String(s)].map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join(' ');
    /* ONE EMOJI, ASKED OF UNICODE'S OWN LIST — see "each picture is one emoji" above. § */
    let RGI = null;
    try { RGI = new RegExp('^\\p{RGI_Emoji}$', 'v'); } catch (e) { RGI = null; }
    if (!RGI) impBad.push('this Node cannot ask for \\p{RGI_Emoji} (it needs the v flag, Node 20 or later), so no picture was checked to be one emoji — not a pass');
    /* WHAT IS WRONG WITH ONE PICTURE, or '' — the rules above, in the order a fault is likeliest. */
    const pictureFault = p => {
      const cps = [...String(p)].map(c => c.codePointAt(0));
      if (!cps.length) return 'has no picture';
      if (/[A-Za-z\s]/.test(p)) return 'has a picture with a letter or a space in it (' + JSON.stringify(p) + ')';
      if (!cps.every(c => /[\p{Extended_Pictographic}\p{Emoji_Component}\p{Emoji_Presentation}]/u.test(String.fromCodePoint(c)))) {
        return 'has a picture that is not emoji (' + hex(p) + ')';
      }
      const late = cps.find(c => NEWER.some(([a, b]) => c >= a && c <= b));
      if (late !== undefined) return 'has ' + p + ', newer than Emoji 12.0 (U+' + late.toString(16).toUpperCase() + ') — an empty box on an older iPad';
      if (cps.indexOf(0x200d) !== -1 && !ZWJ_OK[p]) return 'has ' + p + ' (' + hex(p) + '), a joined picture nobody has looked up — find its version in Unicode\'s emoji-zwj-sequences and add it to ZWJ_OK if it is 12.0 or older';
      if (ZWJ_OK[p] && !(parseFloat(ZWJ_OK[p]) <= 12)) return 'has ' + p + ', a joined picture of Emoji ' + ZWJ_OK[p] + ' by ZWJ_OK\'s own entry — newer than 12.0, an empty box or two pictures on an older iPad';
      const tone = cps.find(c => c >= 0x1f3fb && c <= 0x1f3ff);
      if (tone !== undefined) return 'has ' + p + ' with a skin tone (U+' + tone.toString(16).toUpperCase() + ') — every person in the deck is the default, and a toned picture can be newer than its parts';
      for (let k = 0; k < cps.length; k++) {
        const ch = String.fromCodePoint(cps[k]);
        const textFirst = /\p{Extended_Pictographic}/u.test(ch) && !/\p{Emoji_Presentation}/u.test(ch);
        if (textFirst && cps[k + 1] !== 0xfe0f) return 'has ' + p + ' without its U+FE0F after ' + hex(ch) + ' — plain black text on some phones';
        if (cps[k] === 0x20e3 && cps[k - 1] !== 0xfe0f) return 'has the keycap ' + p + ' without its U+FE0F';
      }
      /* LAST, so the faults above keep their own words: `☀` with no U+FE0F is not RGI either, and
         "without its U+FE0F" says what to do about it where "not one emoji" does not. */
      if (RGI && !RGI.test(p)) return 'has ' + p + ' (' + hex(p) + '), which is not one emoji — two pictures, a flag that is no country, or a sequence Unicode does not list';
      return '';
    };
    const cats = Object.keys(D);
    if (cats.length < CATS) impBad.push('IMP_DECK has ' + cats.length + ' categories — fewer than ' + CATS);
    const where = new Map();
    const pics = new Map();
    const sizes = new Map();
    let total = 0;
    const bare = x => String(x || '').replace(/\uFE0F/g, '');
    const SAYS = new Map(Object.keys(SYM_SAYS).map(k => [bare(k), SYM_SAYS[k]]));
    const saysUsed = new Set(), nearSeen = new Set(), nearOk = [];
    const picOnce = (p, who) => {
      if (!p) return;
      if (pics.has(p)) impBad.push(who + ' has ' + p + ', the picture of ' + pics.get(p));
      else pics.set(p, who);
    };
    cats.forEach(c => {
      const cat = D[c] || {};
      if (!Array.isArray(cat.cards)) { impBad.push(c + ' is not { sym, cards: [...] }, so none of its cards could be read'); return; }
      const cf = pictureFault(cat.sym);
      if (cf) impBad.push('the category ' + c + ' ' + cf);
      picOnce(cat.sym, 'the category ' + c);
      const list = cat.cards;
      total += list.length;
      sizes.set(list.length, (sizes.get(list.length) || []).concat([c]));
      if (list.length < PER) impBad.push(c + ' holds ' + list.length + ' words — fewer than ' + PER);
      const cw = fold(c).split(' ').filter(t => t && !CAT_STOP.has(t));
      const got = [];
      list.forEach(s => {
        /* SPLIT AS `impCards_` SPLITS IT: a letter before the first space means there is no picture. */
        const str = String(s), sp = str.indexOf(' ');
        const p = sp > 0 && !/[A-Za-z]/.test(str.slice(0, sp)) ? str.slice(0, sp) : '';
        const w = p ? str.slice(sp + 1) : str;
        if (!w.trim()) { impBad.push(c + ' ' + JSON.stringify(str) + ' has a picture and no word'); return; }
        const pf = pictureFault(p);
        if (pf) impBad.push(c + ' ' + JSON.stringify(w) + ' ' + pf);
        picOnce(p, c + ' ' + JSON.stringify(w));
        got.push([w, p]);
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
      /* THE CATEGORY'S PICTURE AGAINST ITS OWN CARDS, by picture and by word — see "a category's
         picture is never one of its own cards". The same picture exactly is `picOnce`'s, above. */
      /* EVERY FAMILY THE PICTURE IS IN, not the first: 🌃 is stars and a moon. */
      LOOKALIKE.filter(f => f.pics.indexOf(bare(cat.sym)) !== -1).forEach(fam => {
        got.forEach(([w, p]) => {
          if (p && bare(p) !== bare(cat.sym) && fam.pics.indexOf(bare(p)) !== -1) {
            impBad.push('the category ' + c + '\'s picture ' + cat.sym + ' and its card ' + p + ' ' + JSON.stringify(w) + ' are both ' + fam.what + ' — the imposter would be holding the word');
          }
        });
      });
      /* A JOINED PICTURE IS ITS PARTS — 👨‍🍳 is 👨 and 🍳, and is drawn holding the pan. Either way
         round: the category's picture built from a card's, or a card's built from the category's. */
      const parts = x => bare(x).split('\u200d').filter(Boolean);
      got.forEach(([w, p]) => {
        if (!p || bare(p) === bare(cat.sym)) return;
        const inCat = parts(cat.sym).length > 1 && parts(cat.sym).indexOf(bare(p)) !== -1;
        const inCard = parts(p).length > 1 && parts(p).indexOf(bare(cat.sym)) !== -1;
        if (inCat || inCard) {
          impBad.push('the category ' + c + '\'s picture ' + cat.sym + ' and its card ' + p + ' ' + JSON.stringify(w) + ' — ' + (inCat ? 'the category\'s picture is joined from the card\'s' : 'the card\'s picture is joined from the category\'s') + ', drawn as the one holding the other, and side by side where the join is not drawn');
        }
      });
      const says = SAYS.get(bare(cat.sym));
      if (!says) {
        impBad.push('the category ' + c + '\'s picture ' + cat.sym + ' is not in SYM_SAYS — write down what a child calls it, so it can be held against ' + c + '\'s cards');
      } else {
        saysUsed.add(bare(cat.sym));
        /* THE END OF THE CARD'S WORD, whole words — a frying pan is a pan, a top hat is not a top. */
        const names = says.map(n => fold(n).split(' '));
        got.forEach(([w]) => {
          const tw = fold(w).split(' ');
          const hit = names.find(tn => tn.length <= tw.length && tn.every((t, x) => tw[tw.length - tn.length + x] === t));
          if (hit) impBad.push('the category ' + c + '\'s picture ' + cat.sym + ' is what a child calls ' + JSON.stringify(w) + (hit.length < tw.length ? ' ("' + hit.join(' ') + '" is what a ' + JSON.stringify(w) + ' is)' : '') + ', one of its own cards — the imposter would be holding the word');
        });
      }
      /* LOOKED AT AND KEPT — see `KEPT`. */
      Object.keys(KEPT).forEach(key => {
        const [kc, kp, kws] = key.split('|');
        if (kc !== c) return;
        const cards = kws.split(',').map(kw => [kw, got.find(([w]) => w === kw)]);
        const gone = cards.filter(([, card]) => !card).map(([kw]) => JSON.stringify(kw));
        if (bare(kp) !== bare(cat.sym) || gone.length) impBad.push('KEPT has ' + JSON.stringify(key) + ', which the deck no longer holds — ' + c + '\'s picture is ' + cat.sym + (gone.length ? ' and it has no card ' + gone.join(', ') : ''));
        else keptOk.push(c + ' ' + cat.sym + ' beside ' + cards.map(([kw, card]) => card[1] + ' ' + JSON.stringify(kw)).join(', ') + ' — ' + KEPT[key]);
      });
      /* NOT THE SAME CARD TWICE UNDER TWO NAMES — see the note above `NEAR_OK`. */
      got.forEach(([wa]) => got.forEach(([wb]) => {
        const ta = fold(wa).split(' '), tb = fold(wb).split(' ');
        if (ta.length >= tb.length) return;
        let inside = false;
        for (let k = 0; k + ta.length <= tb.length && !inside; k++) inside = ta.every((t, x) => tb[k + x] === t);
        if (!inside) return;
        const key = c + '|' + wa + '|' + wb;
        nearSeen.add(key);
        if (NEAR_OK[key]) nearOk.push(c + ' ' + JSON.stringify(wa) + ' and ' + JSON.stringify(wb) + ' — ' + NEAR_OK[key]);
        else impBad.push(c + ' ' + JSON.stringify(wb) + ' is ' + JSON.stringify(wa) + ' again under a longer name — swap one for a different card, or let it through in NEAR_OK with its reason');
      }));
    });
    Object.keys(SYM_SAYS).forEach(k => {
      if (!saysUsed.has(bare(k))) impBad.push('SYM_SAYS names ' + k + ', which no category has for its picture any more');
    });
    Object.keys(KEPT).forEach(k => {
      if (!D[k.split('|')[0]]) impBad.push('KEPT has ' + JSON.stringify(k) + ', and the deck has no category ' + k.split('|')[0]);
    });
    Object.keys(NEAR_OK).forEach(k => {
      if (!nearSeen.has(k)) impBad.push('NEAR_OK lets through ' + JSON.stringify(k) + ', which is not a pair in the deck any more');
    });
    if (sizes.size > 1) {
      impBad.push('the categories are not all one size, so some come up more often than others: '
        + [...sizes].map(([n, cs]) => n + ' in ' + cs.join(', ')).join('; '));
    }
    /* AN ACCEPTED ENTRY THE DECK NO LONGER HOLDS IS SAID, so the list cannot outlive its cards. */
    Object.keys(CAT_WORD_OK).forEach(key => {
      const [c, w] = key.split('|');
      const has = ((D[c] || {}).cards || []).some(s => String(s) === w || String(s).endsWith(' ' + w));
      if (!has) impBad.push('CAT_WORD_OK lets through ' + JSON.stringify(key) + ', which the deck no longer holds');
    });
    Object.keys(ZWJ_OK).forEach(p => {
      if (!pics.has(p)) impBad.push('ZWJ_OK lets through ' + p + ', which no card or category in the deck has any more');
    });
    if (!impBad.length) {
      console.log('');
      console.log('  imposter: ' + cats.length + ' categories, ' + total + ' words, none twice, none naming its category, '
                  + pics.size + ' pictures, each one emoji, none twice, none newer than Emoji 12.0, '
                  + 'no category\'s picture one of its own cards'
                  + (catOk.length ? ' but ' + catOk.length + ' let through:' : ''));
      catOk.forEach(x => console.log('    ' + x));
      console.log('  imposter: ' + nearOk.length + ' cards inside another card\'s name in the same category, each let through in NEAR_OK:');
      nearOk.forEach(x => console.log('    ' + x));
      console.log('  imposter: ' + keptOk.length + ' category pictures beside cards of their own that they draw or are drawn like, looked at and kept (KEPT):');
      keptOk.forEach(x => console.log('    ' + x));
    }
  }
  if (impBad.length) {
    console.log('');
    console.log('IMPOSTER\'S DECK  (' + impBad.length + ')');
    impBad.forEach(x => console.log('  ' + x));
    bad = true;
  }
}

/* ---------- THE SENTENCE SCRAMBLE'S SENTENCES AND THE WORD SEARCH'S WORDS § */
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

/* A WIDGET DRAWN AHEAD RUNS NOTHING — AND ONE THAT SAYS IT READS NO FACTS READS NONE § */
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
  /* THE CHANGED PAYLOAD: § */
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
  /* WHO, OVER WHICH FACTS. § */
  const SCEN = [
    { key: 'signed out', user: null, data: fixture },
    { key: 'student', user: P('P9', 'student'), data: fixture },
    /* WITH A WEEK OF HER OWN: § */
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
  /* PURE, IF AND ONLY IF THE SAME IN EVERY SCENARIO — and drawn under two people and two sets of facts. § */
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

  /* ONE DRAW, WATCHED. The slot goes back to what `widgetOnColumn_` writes, the clocks and the dice are held still, `$` is told which copy § */
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
