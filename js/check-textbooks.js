#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-textbooks.js
   THE @family. TEXTBOOKS, WHETHER EACH CHAPTER HAS ITS BONES, AND WHETHER FIND CAN REACH THEM.

   ASKED FOR AS "the @family textbook should be bare bones for now and the textbooks will be in the
   resources tag in the finder. first one can be gcse statistics." So this is `check-projects.js`'s
   sibling, and the bones are the rule: a chapter is a title, its key words with one line each, its
   formulas, and three to five short worked lines. A chapter missing its key words is a heading; a
   chapter with nine paragraphs of worked lines is the prose page the owner said not to write.

   WHAT FAILS:
     · ids — `book_id` shaped `TB-…`, one title page (`chapter: 0`) per book, no repeated chapter
     · ORDER — chapters numbered 1, 2, 3 … with no gap, in that order down the file
     · the bones — key words present, every item `name — text`, 3 to 5 worked lines each kept short
     · the drawing — every formula and worked line through the REAL `typeset_`, cut out of find.js
       by name, and a `/` or `^` that came out unset fails: "it shouldnt be 4/5 it should be 4 over
       the five". A key word's definition is not typeset, so a slash in one fails outright.
     · the Higher mark — `[H] ` exactly, and never inside a chapter whose `tier` is already Higher
     · the join — every topic a label, alias or id in data/topics.json, the practicals' stricter
       standard (named, not contained)
     · FIND — `textbook` is a kind in Learning wearing `Resources`, `Resources` is placed in
       `KIND_BUCKET`, the subject and level are placed in their tables, `LIB_EXTRA` fetches the
       file, the `Shelf` door exists and is a door, and the textbook mapper puts the book on the
       `@family. textbooks` shelf. All read out of the source rather than copied.

   AND IT COUNTS, because a silence is not a count: chapters, Higher items, formulas, and how many
   GCSE questions in the library already share each chapter's topics — the join's other end. The
   library holds no GCSE Statistics (1ST0) paper; its `Paper 31: Statistics` rows are A-level 9MA0,
   a different qualification, so they are printed as a note and not joined.

     node js/check-textbooks.js
================================================================================================== */
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
  const lines = fs.readFileSync(p, 'utf8').replace(/\n$/, '').split('\n');
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

const key = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
const known = new Set();
tree.forEach(t => {
  if (!t || !t.label) return;
  known.add(key(t.label));
  known.add(key(String(t.topic_id || '').replace(/-/g, ' ')));
  String(t.aliases || '').split(',').forEach(a => { if (a.trim()) known.add(key(a)); });
});

/* ---------- THE SOURCE, AND THE THREE TABLES THAT GROUP THE FUNNEL ------------------------------
   `check-projects.js`'s reader, for its reason: a copy here is a second list. */
const findSrc = fs.readFileSync(path.join(root, 'js', 'find.js'), 'utf8');
function table(name) {
  const m = new RegExp('const ' + name + ' = bucketTable_\\(\\[([\\s\\S]*?)\\]\\);').exec(findSrc);
  if (!m) { fail.push(name + ' is not in js/find.js any more — this check cannot see what groups the funnel'); return null; }
  const out = new Set();
  m[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/'([^']*)'/g, (_, v) => { out.add(v); return _; });
  return out;
}
const SUBJECTS = table('SUBJECT_BUCKET');
const LEVELS = table('LEVEL_BUCKET');
const KINDS_PLACED = table('KIND_BUCKET');

/* THE REAL `typeset_`, and `tbMath_`'s one line in front of it, which is the whole of how a cell
   becomes markup. If `tbMath_` changes its recipe this check has to change with it — so it is
   read and compared rather than assumed. */
const tsBody = cutFrom(findSrc, 'typeset_');
let typeset_ = null;
if (!tsBody) fail.push('typeset_ is not in js/find.js — the formulas were NOT checked, which is not a pass');
else typeset_ = new Function(tsBody + '\nreturn typeset_;')();
const RECIPE = "const tbMath_ = s => typeset_(esc(s).replace(/\\//g, '&frasl;'));";
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
const kindM = /\n\s*textbook:\s*\{\s*group:\s*'([^']*)',\s*label:\s*'([^']*)'/.exec(findSrc);
if (!kindM) {
  fail.push('js/find.js has no `textbook:` entry in KINDS — Find cannot offer a textbook');
} else {
  if (kindM[1] !== 'Learning') fail.push('the textbook kind is in group "' + kindM[1] + '", not Learning');
  if (kindM[2] !== 'Resources') fail.push('the textbook kind is labelled "' + kindM[2] + '" — the owner asked for it in "Resources"');
  if (KINDS_PLACED && !KINDS_PLACED.has(kindM[2])) {
    fail.push('"' + kindM[2] + '" is not in KIND_BUCKET — one unplaced kind stands `What kind` down to the alphabet');
  }
}
/* THE DOOR. Without `always` the balance rule refuses a 1-against-417 split, and the book is
   reachable by search alone — the state this door was built to end. */
const shelfM = /\{\s*field:\s*'shelf',[^}]*\}/.exec(findSrc);
if (!shelfM) fail.push('FACETS has no `shelf` entry — Resources has no third rung, so the book is under four hundred boxers');
else if (!/always:\s*true/.test(shelfM[0])) {
  fail.push('the `shelf` facet is not `always` — FACET_MIN_MINORITY will refuse one book against the boxing, and the door never opens');
}
if (!/kind:\s*'textbook'[\s\S]{0,400}?shelf:\s*'@family\. textbooks'/.test(findSrc)) {
  fail.push("the textbook mapper does not put the book on the '@family. textbooks' shelf");
}
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
let higherItems = 0, formulas = 0, words = 0, points = 0, live = 0;

rows.forEach((r, line) => {
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
    ['title', 'summary', 'subject', 'level', 'board', 'spec'].forEach(col => {
      if (!String(r[col] || '').trim()) fail.push(id + "'s title page has no " + col);
    });
    const subj = String(r.subject || '').trim(), lvl = String(r.level || '').trim();
    if (subj && SUBJECTS && !SUBJECTS.has(subj)) fail.push(id + ' has subject "' + subj + '", which SUBJECT_BUCKET does not place — one unplaced subject stands the whole Subject grouping down');
    if (lvl && LEVELS && !LEVELS.has(lvl)) fail.push(id + ' has level "' + lvl + '", which LEVEL_BUCKET does not place');
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
  }

  String(r.topics || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
    if (known.has(key(t))) return;
    if (!unknownTopics.has(t)) unknownTopics.set(t, []);
    unknownTopics.get(t).push(id + ' ch' + n);
  });
});

unknownTopics.forEach((ids, t) => {
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

/* ---------- THE JOIN'S OTHER END: WHAT THE LIBRARY HOLDS ON EACH CHAPTER'S TOPICS --------------
   A COUNT, NOT A RULE. The library is exported, not written here, and a chapter about the
   enquiry cycle has no past-paper question to point at. Printed so the owner can see which
   chapters already have questions behind them. */
let lib = [];
try { lib = readLines('data/questions.json'); } catch (e) { lib = []; }
const libTopics = new Map();
let stats1st0 = 0, alevelStats = 0;
lib.forEach(q => {
  if (/1ST0/.test(String(q.paper_id || '') + String(q.spec_code || ''))) stats1st0++;
  if (/Statistics/.test(String(q.name || '')) && /9MA0|Paper (21|31|3):/.test(String(q.paper_id || '') + String(q.name || ''))) alevelStats++;
  if (/^gcse$/i.test(String(q.level || '').trim()) || /KS4/i.test(String(q.key_stage || ''))) {
    String(q.topics || '').split(',').map(t => key(t)).filter(Boolean).forEach(t => libTopics.set(t, (libTopics.get(t) || 0) + 1));
  }
});

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
  + '   items marked Higher: ' + higherItems);
note.push('GCSE Statistics (1ST0) questions in the library: ' + stats1st0
  + '. The ' + alevelStats + ' "Statistics" paper rows are A-level 9MA0 — a different qualification, not joined.');
note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.forEach(f => console.log('  ' + f));
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with data/textbooks.json or the way Find reaches it.');
  process.exit(1);
}
console.log('\nOK — every book has a title page and chapters 1 to N in order; every chapter has key words,\n'
  + '     3 to 5 short worked lines and formulas that typeset_ draws; topics name real branches of\n'
  + '     the tree; and Find offers the books under Resources, on the "@family. textbooks" shelf.');
