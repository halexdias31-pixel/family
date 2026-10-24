#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-textbooks.js THE @family. § */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { cutFrom } = require('./check-marks-load.js');
const fail = [];
const note = [];

/* ONE OBJECT PER LINE, `[` and `]` alone — `check-projects.js`'s reader, for its reason. */
function readLines(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) { fail.push(rel + ' does not exist'); return []; }
  /* A LIBRARY FILE WITH ITS WORDS PUT BACK (397, check/lib-full.js) — the repository's copy is card metadata only. */
  const lib = /^data\/([a-z]+)\.json$/.exec(rel), LF = require('../check/lib-full.js');
  const lines = (lib && LF.isLib(lib[1]) ? LF.text(lib[1]) : fs.readFileSync(p, 'utf8')).replace(/\n$/, '').split('\n');
  if (lines[0].trim() !== '[') fail.push(rel + ' line 1 is not a bare [');
  if (lines[lines.length - 1].trim() !== ']') fail.push(rel + ' does not end with a bare ]');
  const rows = [];
  lines.slice(1, -1).forEach((raw, i) => {
    const s = raw.trim().replace(/,$/, '');
    if (!s) return;
    try { rows.push(JSON.parse(s)); }
    catch (e) { fail.push(rel + ' line ' + (i + 2) + ' does not parse — ' + e.message.slice(0, 60)); }
  });
  return rows;
}

const rows = readLines('data/textbooks.json');
const tree = readLines('data/topics.json');
/* THE QUESTION LIBRARY, read once: the join's other end below, and the content cards' spellings. */
let lib = [];
try { lib = readLines('data/questions.json'); } catch (e) { lib = []; }

const key = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
const known = new Set();
tree.forEach(t => {
  if (!t || !t.label) return;
  known.add(key(t.label));
  known.add(key(String(t.topic_id || '').replace(/-/g, ' ')));
  String(t.aliases || '').split(',').forEach(a => { if (a.trim()) known.add(key(a)); });
});

/* ---------- THE SOURCE. The grouping tables went in 396: every facet's answers are drawn as they are. */
const findSrc = fs.readFileSync(path.join(root, 'js', 'find.js'), 'utf8');

/* THE REAL `typeset_`, and `tbMath_`'s one line in front of it, which is the whole of how a cell
   becomes markup. If `tbMath_` changes its recipe this check has to change with it — so it is
   read and compared rather than assumed. */
const tsBody = cutFrom(findSrc, 'typeset_');
let typeset_ = null;
if (!tsBody) fail.push('typeset_ is not in js/find.js — the formulas were NOT checked, which is not a pass');
else typeset_ = new Function(tsBody + '\nreturn typeset_;')();
/* `tbSub_` around it only turns Unicode subscript digits into `<sub>`, which can neither make nor
   unmake a fraction, so the drawing below leaves it out and the recipe names it. */
const RECIPE = "const tbMath_ = s => tbSub_(typeset_(esc(s).replace(/\\//g, '&frasl;')));";
if (findSrc.indexOf(RECIPE) < 0) {
  fail.push('`tbMath_` in js/find.js is not `' + RECIPE + '` — this check draws the formulas the way '
    + 'that line did, so it would be checking a recipe the app no longer uses');
}
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tbMath = s => typeset_(esc(s).replace(/\//g, '&frasl;'));
/* WHAT CAME OUT UNSET. Drop every stacked fraction and every superscript, and anything left that
   is a slash or a caret is maths drawn as plain text. */
function unset(html) {
  const bare = html
    .replace(/<span class="frac">[\s\S]*?<span class="frac-d">[\s\S]*?<\/span><\/span>/g, '')
    .replace(/<sup>[\s\S]*?<\/sup>/g, '');
  const m = /&frasl;|\^/.exec(bare);
  return m ? m[0] : '';
}

/* ---------- FIND, READ OUT OF THE FILES THAT DO IT -------------------------------------------- */
const kindM = /\n\s*content:\s*\{\s*group:\s*'([^']*)',\s*label:\s*'([^']*)'/.exec(findSrc);
if (!kindM) {
  fail.push('js/find.js has no `content:` entry in KINDS — Find cannot offer a content card');
} else {
  if (kindM[1] !== 'Learning') fail.push('the content kind is in group "' + kindM[1] + '", not Learning');
  /* THE CODE'S OWN LABEL, so an empty `kinds` tab still says it — the owner's word, "content card". */
  if (kindM[2] !== 'Content') fail.push('the content kind is labelled "' + kindM[2] + '" — it is its own answer, `Content`, under What kind');
}
/* THE SHELF, AN ORDINARY QUESTION (396): asked by the one rule like every facet. The textbooks' shelf on it went with the books. */
const shelfM = /\{\s*field:\s*'shelf',[^}]*\}/.exec(findSrc);
if (!shelfM) fail.push('FACETS has no `shelf` entry — Resources has no shelf question');
/* A CONTENT CARD IS ON NO SHELF. A shelf only the cards carried would be the old textbooks' door back,
   asked over a list of questions and cards where it says nothing about the questions. */
const itemM = /function contentItem_\([^)]*\)\s*\{([\s\S]*?)\n\}/.exec(findSrc);
if (!itemM) fail.push('js/find.js has no `contentItem_` — nothing makes a content card of a chapter');
else if (/\bshelf\s*:/.test(itemM[1])) fail.push('`contentItem_` puts a content card on a shelf — the textbooks\' shelf went (347, part 2)');
['Boxers', 'Fights'].forEach(k => {
  if (!new RegExp("boxKind: '" + k + "', shelf: 'Boxing'").test(findSrc)) {
    fail.push(k + " are not on the 'Boxing' shelf — a shelf only the book carries fails the coverage rule and is never asked");
  }
});
const libSrc = fs.readFileSync(path.join(root, 'js', 'library.js'), 'utf8');
const libM = /const LIB_EXTRA = \[([^\]]*)\]/.exec(libSrc);
if (!libM || libM[1].indexOf("'textbooks'") < 0) {
  fail.push("js/library.js LIB_EXTRA does not name 'textbooks', so data/textbooks.json is never fetched");
}

/* ---------- THE ROWS ---------------------------------------------------------------------------- */
const POINTS_MIN = 3, POINTS_MAX = 5, POINT_LEN = 200, WORDS_MIN = 3;
const NUMBERED = /^(word|formula|point|topic)s?_\d+$/;
const books = new Map();
const unknownTopics = new Map();
const chapterRows = [];
let higherItems = 0, formulas = 0, words = 0, points = 0, live = 0;

/* ---------- AN ANIMATION IS A ROW TOO, AND IT IS NOT A CHAPTER § */
/* A CARD WHOSE WORDS THIS MACHINE HAS NOT GOT: marked pending and holding none of the three lists. */
const LFp = require('../check/lib-full.js');
const wordless = r => LFp.pending(r) && !['words', 'points', 'formulas'].some(c => String(r[c] || '').trim());
let pendingCards = 0, pendingAbout = 0;
const ANIM_FIELDS = ['book_id', 'chapter', 'anim', 'title', 'about', 'html', 'css', 'active'];
const isAnim = r => !!(r && Object.prototype.hasOwnProperty.call(r, 'anim'));
const on_ = v => /^(true|yes|1|y|on|)$/i.test(String(v == null ? '' : v).trim());
const animIds = new Map();
let animCount = 0;
{
  const chapterRow = (b, n) => rows.find(x => !isAnim(x) && String(x.book_id || '').trim() === b && x.chapter === n);
  rows.forEach((r, line) => {
    if (!isAnim(r)) return;
    animCount++;
    const where = 'animation row ' + (line + 2) + ' (' + JSON.stringify(r.anim) + ')';
    const keys = Object.keys(r);
    if (keys.join() !== ANIM_FIELDS.join()) fail.push(where + ' has the fields ' + keys.join(', ') + ' — an animation row is exactly ' + ANIM_FIELDS.join(', ') + ', in that order');
    const id = String(r.anim || '');
    if (!/^[a-z][a-z0-9]*$/.test(id)) fail.push(where + ' — `anim` is a lower-case id, a letter then letters or digits, as splashes.json names it');
    if (animIds.has(id)) fail.push(where + ' — the id ' + id + ' is also on row ' + animIds.get(id) + '; one animation is in one chapter');
    animIds.set(id, line + 2);
    if (!String(r.title || '').trim()) fail.push(where + ' has no title — it is the heading of its page');
    if (!String(r.active) || !on_(r.active)) { /* off: in neither the chapter nor the splash; nothing to place */ }
    const b = String(r.book_id || '').trim(), n = r.chapter;
    const ch = chapterRow(b, n);
    if (!ch) { fail.push(where + ' names ' + b + ' chapter ' + JSON.stringify(n) + ', which is not a chapter in this file'); return; }
    if (n === 0) { fail.push(where + ' hangs on the title page of ' + b + ' — an animation teaches a chapter'); return; }
    if (!on_(ch.active)) fail.push(where + ' is under ' + b + ' chapter ' + n + ', which is switched off — the page would vanish with it');
    const title = rows.find(x => !isAnim(x) && String(x.book_id || '').trim() === b && x.chapter === 0);
    if (title && !on_(title.active)) fail.push(where + ' is in ' + b + ', whose title page is switched off');
    /* STRAIGHT UNDER ITS CHAPTER: the rows above it, back to the chapter, are animations of the same chapter. */
    let k = line - 1;
    while (k >= 0 && isAnim(rows[k]) && String(rows[k].book_id || '').trim() === b && rows[k].chapter === n) k--;
    if (k < 0 || rows[k] !== ch) fail.push(where + ' is not directly under ' + b + ' chapter ' + n + ' — file order is page order, so it would be drawn after ' + (k >= 0 ? (isAnim(rows[k]) ? 'animation ' + rows[k].anim : rows[k].book_id + ' chapter ' + rows[k].chapter) : 'nothing'));
    /* WHAT IT IS ABOUT, FOUND IN ITS CHAPTER. */
    const about = String(r.about || '').split('|').map(t => t.trim()).filter(Boolean);
    if (!about.length) fail.push(where + ' is about nothing — `about` names at least one key word, formula or worked line of its chapter');
    if (wordless(ch)) { pendingAbout++; return; }
    const names = ['words', 'formulas'].flatMap(col => String(ch[col] || '').split('|').map(t => t.trim().replace(/^\[H\] /, ''))
      .filter(Boolean).map(t => { const at = t.indexOf(' — '); return at > 0 ? t.slice(0, at).trim() : ''; }).filter(Boolean));
    const lines = String(ch.points || '').split('|').map(t => t.trim().replace(/^\[H\] /, '')).filter(Boolean);
    about.forEach(a => {
      const opens = lines.some(p => p.indexOf(a) === 0 && !/[A-Za-z0-9]/.test(p.charAt(a.length)));
      if (names.indexOf(a) < 0 && !opens) fail.push(where + ' is about "' + a + '", which is not a key word or formula of ' + b + ' chapter ' + n + ', nor how a worked line there opens');
    });
  });
}

rows.forEach((r, line) => {
  if (isAnim(r)) return;
  const id = String((r && r.book_id) || '').trim();
  if (!id) { fail.push('row ' + (line + 1) + ' has no book_id'); return; }
  if (!/^TB-[A-Z0-9]+(-[A-Z0-9]+)*$/.test(id)) fail.push(id + ' is not shaped TB-… — one id space per data file is how a key never collides');
  Object.keys(r).forEach(k => {
    if (NUMBERED.test(k)) fail.push(id + ' carries `' + k + '` — a numbered column; the list is one pipe-separated cell');
  });
  const n = r.chapter;
  const where = id + ' chapter ' + JSON.stringify(n);
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) { fail.push(where + ' — `chapter` is a whole number, 0 for the title page'); return; }
  if (!books.has(id)) books.set(id, { title: null, chapters: [] });
  const b = books.get(id);
  if (/^(true|yes|1|y|on|)$/i.test(String(r.active == null ? '' : r.active).trim())) live++;

  if (n === 0) {
    if (b.title) fail.push(id + ' has two title pages (chapter 0)');
    b.title = r;
    /* NOT THE BOARD. The cover's cells are the defaults its chapters inherit, and a board on every chapter of a GCSE Maths book is a chip that hides every board's § */
    ['title', 'summary', 'subject', 'level'].forEach(col => {
      if (!String(r[col] || '').trim()) fail.push(id + "'s title page has no " + col);
    });
    const subj = String(r.subject || '').trim(), lvl = String(r.level || '').trim();
    ['words', 'formulas', 'points', 'topics', 'tier'].forEach(col => {
      if (String(r[col] || '').trim()) fail.push(id + "'s title page carries " + col + ' — that belongs to a chapter');
    });
    return;
  }
  if (b.chapters.some(c => c.chapter === n)) fail.push(where + ' appears twice — a repeat silently replaces a chapter');
  b.chapters.push(r);
  if (!String(r.title || '').trim()) fail.push(where + ' has no title');

  const tier = String(r.tier || '').trim();
  if (tier && tier !== 'Higher') fail.push(where + ' has tier "' + tier + '" — blank (both tiers) or Higher');
  chapterRows.push({ id: id, n: n, r: r, where: where });
  const wholeHigher = tier === 'Higher';

  /* ONE LIST, ITS ITEMS AS THE MAPPER READS THEM. */
  const items = (col, needName) => {
    const raw = String(r[col] || '');
    if (!raw.trim()) return [];
    return raw.split('|').map((t, i) => {
      const s = t.trim();
      if (!s) { fail.push(where + ' ' + col + ' has an empty item — a doubled pipe'); return null; }
      if (/^\[[hH]\]/.test(s) && !/^\[H\] \S/.test(s)) fail.push(where + ' ' + col + ' item ' + (i + 1) + ' has a Higher mark that is not exactly "[H] "');
      if (/\[H\]/.test(s.replace(/^\[H\] /, ''))) fail.push(where + ' ' + col + ' item ' + (i + 1) + ' has "[H]" somewhere other than the front');
      const higher = /^\[H\] /.test(s);
      if (higher && wholeHigher) fail.push(where + ' ' + col + ' item ' + (i + 1) + ' is marked [H] inside a chapter that is Higher all through — one mark on the heading says it');
      if (higher) higherItems++;
      const body = s.replace(/^\[H\] /, '');
      const at = body.indexOf(' — ');
      if (needName && (at <= 0 || !body.slice(at + 3).trim())) {
        fail.push(where + ' ' + col + ' item ' + (i + 1) + ' is not `name — text`: "' + body.slice(0, 50) + '"');
      }
      return { name: at > 0 ? body.slice(0, at) : '', text: at > 0 ? body.slice(at + 3) : body };
    }).filter(Boolean);
  };

  const w = items('words', true);
  words += w.length;
  /* WORDS NEWER THAN THE PINNED SEED (lib_pending, docs/library.md): on a machine without them the card is all there is. */
  if (wordless(r)) { pendingCards++; return; }
  if (w.length < WORDS_MIN) fail.push(where + ' has ' + w.length + ' key words — the bones are key words, at least ' + WORDS_MIN);
  w.forEach(i => {
    /* A DEFINITION IS DRAWN AS TEXT, NOT TYPESET, so maths in one is maths nobody draws. */
    if (/[\/^]/.test(i.text)) fail.push(where + ' key word "' + i.name + '" has a / or ^ in its definition, which is drawn as plain text — put the maths in formulas');
  });

  const f = items('formulas', true);
  formulas += f.length;
  const p = items('points', false);
  points += p.length;
  if (p.length < POINTS_MIN || p.length > POINTS_MAX) {
    fail.push(where + ' has ' + p.length + ' worked lines — bare bones is ' + POINTS_MIN + ' to ' + POINTS_MAX);
  }
  p.forEach((i, k) => {
    if (i.text.length > POINT_LEN) fail.push(where + ' worked line ' + (k + 1) + ' is ' + i.text.length + ' characters — a worked line, not a paragraph (max ' + POINT_LEN + ')');
  });
  if (typeset_) {
    f.concat(p).forEach(i => {
      const left = unset(tbMath(i.text));
      if (left) fail.push(where + ' "' + i.text.slice(0, 60) + '" draws a ' + (left === '^' ? 'caret' : 'slash')
        + ' as plain text — typeset_ could not read both sides. Bracket a multi-word operand: (class width)');
    });
    /* AND A FRACTION THAT CUT A PHRASE IN HALF. § */
    f.forEach(i => {
      const html = tbMath(i.text);
      if (/<\/span><\/span> [A-Za-z]/.test(html) || /[A-Za-z;] <span class="frac">/.test(html)) {
        fail.push(where + ' formula "' + i.text.slice(0, 60) + '" stacks one word of a phrase — '
          + 'typeset_ takes the term touching the slash, so bracket the whole operand: (class width)');
      }
    });
  }

  String(r.topics || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
    if (known.has(key(t))) return;
    if (!unknownTopics.has(t)) unknownTopics.set(t, []);
    unknownTopics.get(t).push(id + ' ch' + n);
  });
});

/* A TOPIC THE LIBRARY SPELLS IS JOINED TOO: § */
const libKeys = new Set();
lib.forEach(q => String(q.topics || '').split(',').forEach(t => { if (t.trim()) libKeys.add(key(t)); }));
unknownTopics.forEach((ids, t) => {
  if (libKeys.has(key(t))) return;
  fail.push('topic "' + t + '" (on ' + ids.join(', ') + ') is not a label, alias or id in data/topics.json — the join reaches nothing');
});

/* THE ORDER. Numbered 1 to N with no gap, and in that order down the file — the mapper sorts, so
   the app would survive a shuffle, but a person editing chapter 9 should find it after 8. */
books.forEach((b, id) => {
  if (!b.title) fail.push(id + ' has no title page (chapter 0) — a book with no name is left out of Find');
  const ns = b.chapters.map(c => c.chapter);
  if (!ns.length) fail.push(id + ' has no chapters');
  ns.forEach((n, i) => {
    if (n !== i + 1) fail.push(id + ' chapter ' + (i + 1) + ' in the file is numbered ' + n + ' — chapters run 1, 2, 3 … in order, with no gap');
  });
  const titles = new Set();
  b.chapters.forEach(c => {
    const t = String(c.title || '').trim().toLowerCase();
    if (t && titles.has(t)) fail.push(id + ' has two chapters called "' + c.title + '"');
    titles.add(t);
  });
});
if (!live && rows.length) fail.push('every textbook row is switched off — Find would offer nothing on the shelf');

/* ---------- THE JOIN'S OTHER END: WHAT THE LIBRARY HOLDS ON EACH CHAPTER'S TOPICS § */
const libTopics = new Map();
let stats1st0 = 0, alevelStats = 0;
lib.forEach(q => {
  if (/1ST0/.test(String(q.paper_id || '') + String(q.spec_code || ''))) stats1st0++;
  if (/Statistics/.test(String(q.name || '')) && /9MA0|Paper (21|31|3):/.test(String(q.paper_id || '') + String(q.name || ''))) alevelStats++;
  if (/^gcse$/i.test(String(q.level || '').trim()) || /KS4/i.test(String(q.key_stage || ''))) {
    String(q.topics || '').split(',').map(t => key(t)).filter(Boolean).forEach(t => libTopics.set(t, (libTopics.get(t) || 0) + 1));
  }
});

/* ---------- THE CONTENT CARDS' TAGS: THE LIBRARY'S OWN SPELLINGS, AND A TOPIC ON EVERY MATHS CARD § */
const libSpelled = new Set();
lib.forEach(q => String(q.topics || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => libSpelled.add(t)));
const treeLabels = new Set(tree.filter(t => t && t.label).map(t => String(t.label)));
if (!libSpelled.size) fail.push('data/questions.json gave no topics — the content cards\' spellings were NOT checked, which is not a pass');
const MATHS_SUBJECTS = new Set(['Maths', 'Statistics']);
const KS = /^KS[1-5]$/;
let mathsCards = 0, mathsTags = 0;
chapterRows.forEach(({ id, n, r, where }) => {
  const cover = (books.get(id) || {}).title || {};
  const cell = k => String(r[k] || '').trim() || String(cover[k] || '').trim();
  const topics = String(r.topics || '').split(',').map(t => t.trim()).filter(Boolean);
  topics.forEach(t => {
    if (!libSpelled.has(t) && !treeLabels.has(t)) {
      fail.push(where + ' topic "' + t + '" is not spelled as the question library or data/topics.json spells any label — '
        + 'a content card shares a question\'s tag only in the question\'s own word');
    }
  });
  if (MATHS_SUBJECTS.has(cell('subject'))) {
    mathsCards++; mathsTags += topics.length;
    if (!topics.length) fail.push(where + ' is a maths content card with no topic — nobody can reach it by the topic they came for');
  }
  if (!!cell('board') !== !!cell('spec')) fail.push(where + ' has a board without a spec, or a spec without a board — they are one fact');
  String(cell('keystage')).split(',').map(k => k.trim()).filter(Boolean).forEach(k => {
    if (!KS.test(k)) fail.push(where + ' has key stage "' + k + '" — a comma list of KS1 … KS5, as a worksheet\'s');
  });
});
console.log('\nTHE CONTENT CARDS\' TAGS  —  ' + chapterRows.length + ' cards, ' + mathsCards + ' maths cards carrying '
  + mathsTags + ' topics, every one spelled as the library or the tree spells it');

console.log('\nTHE TEXTBOOKS  —  ' + books.size + ' book(s)');
books.forEach((b, id) => {
  console.log('  ' + id + '  ' + ((b.title && b.title.title) || '(no title page)') + '  ·  '
    + b.chapters.length + ' chapters, ' + b.chapters.filter(c => c.tier === 'Higher').length + ' Higher all through');
  b.chapters.forEach(c => {
    const ts = String(c.topics || '').split(',').map(t => t.trim()).filter(Boolean);
    const n = ts.reduce((s, t) => s + (libTopics.get(key(t)) || 0), 0);
    console.log('    ' + String(c.chapter).padStart(2) + '  ' + c.title + (c.tier === 'Higher' ? '  [H]' : '')
      + '  —  topics: ' + (ts.join(', ') || 'none') + '  ·  GCSE questions on them: ' + n);
  });
});
console.log('key words: ' + words + '   formulas: ' + formulas + '   worked lines: ' + points
  + '   items marked Higher: ' + higherItems + '   animations: ' + animCount);
note.push('GCSE Statistics (1ST0) questions in the library: ' + stats1st0
  + '. The ' + alevelStats + ' "Statistics" paper rows are A-level 9MA0 — a different qualification, not joined.');
if (pendingCards || pendingAbout) note.push(pendingCards + ' pending card(s) and ' + pendingAbout + ' animation(s) on them were NOT checked for words — data-private/ has not got them (`node tools/lib-private.js pull`)');
note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.forEach(f => console.log('  ' + f));
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/textbooks.json or the way Find reaches it.');
  process.exit(1);
}
console.log('\nOK — every book has a title page and chapters 1 to N in order; every chapter has key words,\n'
  + '     3 to 5 short worked lines and formulas that typeset_ draws; topics name real branches of\n'
  + '     the tree, spelled as the library spells them, and on every maths card; and Find offers each\n'
  + '     chapter as a content card under What kind · Content.');
