#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-bible.js THE KING JAMES BIBLE: § */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { cutFrom } = require('./check-marks-load.js');
const fail = [];
const note = [];
const rel = p => path.relative(root, p);

/* ---------- THE TWO ENDS -------------------------------------------------------------------------- */
const ARCHIVE = path.join(root, 'data', 'archive', 'bible.json');
const DIR = path.join(root, 'data', 'bible');
let rows = [];
try { rows = JSON.parse(fs.readFileSync(ARCHIVE, 'utf8')); }
catch (e) { fail.push(rel(ARCHIVE) + ' does not parse — the split cannot be checked against it: ' + e.message.slice(0, 80)); }
if (!Array.isArray(rows) || !rows.length) fail.push(rel(ARCHIVE) + ' holds no verses — nothing was checked, which is not a pass');

let index = null;
try { index = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8')); }
catch (e) { fail.push('data/bible/index.json is missing or does not parse — run `python3 tools/bible-split.py`'); }
const books = (index && Array.isArray(index.books)) ? index.books : [];
if (index && !books.length) fail.push('data/bible/index.json names no books');

/* EVERY FILE THE INDEX NAMES, AND NOTHING ELSE IN THE FOLDER. A stray file is one a doctored or stale
   index could point a phone at, and one the splitter would have removed. */
const onDisk = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f !== 'index.json').sort() : [];
const named = books.map(b => b.file).sort();
onDisk.filter(f => named.indexOf(f) < 0).forEach(f => fail.push('data/bible/' + f + ' is not in index.json — a file no book points at'));
named.filter(f => onDisk.indexOf(f) < 0).forEach(f => fail.push('index.json names data/bible/' + f + ', which is not there'));

/* ---------- THE SPLIT, VERSE BY VERSE ------------------------------------------------------------ */
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const split = {};
let verses = 0, chapters = 0;
books.forEach((b, i) => {
  const where = 'book ' + (i + 1) + ' (' + b.book + ')';
  if (b.n !== i + 1) fail.push(where + ' is numbered ' + b.n + ' — the index is in canonical order, 1 to 66');
  if (b.testament !== 'OT' && b.testament !== 'NT') fail.push(where + ' has testament "' + b.testament + '"');
  const want = String(b.n).padStart(2, '0') + '-' + slug(b.book) + '.json';
  if (b.file !== want) fail.push(where + ' is filed as ' + b.file + ', not ' + want + ' — the name the reader is held to');
  const p = path.join(DIR, String(b.file || ''));
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, 'utf8');
  let d;
  try { d = JSON.parse(raw); } catch (e) { fail.push('data/bible/' + b.file + ' does not parse'); return; }
  if (d.book !== b.book || d.testament !== b.testament) fail.push('data/bible/' + b.file + ' says it is ' + d.book + ' (' + d.testament + ')');
  if (!Array.isArray(d.chapters)) { fail.push('data/bible/' + b.file + ' has no chapters list'); return; }
  /* ONE CHAPTER PER LINE: the head, then a line per chapter, then the close. */
  const lines = raw.replace(/\n$/, '').split('\n');
  if (lines.length !== d.chapters.length + 2) fail.push('data/bible/' + b.file + ' is ' + lines.length + ' lines for ' + d.chapters.length + ' chapters — not one chapter per line');
  if (d.chapters.length !== b.chapters) fail.push(where + ': the index says ' + b.chapters + ' chapters, the file has ' + d.chapters.length);
  const vs = d.chapters.reduce((s, c) => s + (Array.isArray(c) ? c.length : 0), 0);
  if (vs !== b.verses) fail.push(where + ': the index says ' + b.verses + ' verses, the file has ' + vs);
  chapters += d.chapters.length;
  verses += vs;
  split[b.n] = d;
});
if (index && index.totals) {
  const t = index.totals;
  if (t.books !== books.length || t.chapters !== chapters || t.verses !== verses) {
    fail.push('index.json totals say ' + JSON.stringify(t) + ' and the files hold ' + books.length + ' books, ' + chapters + ' chapters, ' + verses + ' verses');
  }
}

/* THE ARCHIVE, IN ITS OWN ORDER, AGAINST THE SPLIT. § */
let seen = 0, wrong = 0;
const firstWrong = [];
rows.forEach(r => {
  const n = Number(r.book_no), c = Number(r.chapter), v = Number(r.verse);
  const d = split[n];
  const got = d && d.chapters[c - 1] ? d.chapters[c - 1][v - 1] : undefined;
  seen++;
  if (got !== r.text) {
    wrong++;
    if (firstWrong.length < 5) firstWrong.push(r.ref + ' — archive "' + String(r.text).slice(0, 50) + '", split ' + (got === undefined ? 'has no such verse' : '"' + String(got).slice(0, 50) + '"'));
  }
});
if (wrong) fail.push(wrong + ' of ' + seen + ' verses in the split are not the archive\'s, first: ' + firstWrong.join(' | '));
if (rows.length && verses !== rows.length) fail.push('the split holds ' + verses + ' verses and the archive ' + rows.length + ' — a verse added or lost');
/* AND IN ORDER: the archive's rows walk the split's positions front to back with no step backwards. */
let last = [0, 0, 0], back = 0;
rows.forEach(r => {
  const k = [Number(r.book_no), Number(r.chapter), Number(r.verse)];
  if (k[0] < last[0] || (k[0] === last[0] && (k[1] < last[1] || (k[1] === last[1] && k[2] <= last[2])))) back++;
  last = k;
});
if (back) fail.push(back + ' archive rows step backwards — the split keeps positions, not numbers, so an out-of-order archive would move verses');

/* ---------- THE GROUPS, AGAINST THIS FILE'S OWN COPY § */
const GROUPS = [
  ['Torah', 1, 5], ['History', 6, 17], ['Poetry & Wisdom', 18, 22], ['Major Prophets', 23, 27],
  ['Minor Prophets', 28, 39], ['Gospels', 40, 43], ['Church History', 44, 44],
  ['Pauline Epistles', 45, 57], ['General Epistles', 58, 65], ['Prophecy', 66, 66],
];
const groupOf = n => (GROUPS.find(g => n >= g[1] && n <= g[2]) || [''])[0];
let groupWrong = 0;
const firstGroupWrong = [];
books.forEach(b => {
  if (b.group !== groupOf(b.n)) {
    groupWrong++;
    if (firstGroupWrong.length < 4) firstGroupWrong.push(b.book + ' is "' + b.group + '", not "' + groupOf(b.n) + '"');
  }
});
if (groupWrong) fail.push(groupWrong + ' book(s) are in the wrong group in index.json, first: ' + firstGroupWrong.join(' | '));
/* AND THE SHAPE, ASKED OF THE INDEX ITSELF: what the funnel draws is what the index says, so the index
   is held to it whether or not it agrees with the copy above. */
const seenGroups = [];
books.forEach((b, i) => {
  const prev = books[i - 1];
  if (!prev || prev.group !== b.group) {
    if (seenGroups.indexOf(b.group) >= 0) fail.push('the group "' + b.group + '" comes back at ' + b.book + ' — a group is a run of consecutive books, or the funnel draws it as two');
    seenGroups.push(b.group);
  } else if (prev.testament !== b.testament) {
    fail.push('the group "' + b.group + '" crosses from ' + prev.book + ' into ' + b.book + ' — a group inside two testaments is cut in half by the Testament question');
  }
});
if (books.length && seenGroups.length !== 10) fail.push('index.json has ' + seenGroups.length + ' groups, not the ten: ' + seenGroups.join(', '));
const bookNames = books.map(b => b.book);
seenGroups.filter(g => bookNames.indexOf(g) >= 0).forEach(g => fail.push('the group "' + g + '" is named like a book — its Group chip and the Book tag on a verse would say the same word for two answers'));
/* THE FOUR DECISIONS, BY NAME — the ones somebody could argue the other way, pinned so that the
   argument happens in a commit and not in a re-run. */
const PINNED = { Hebrews: 'General Epistles', Lamentations: 'Major Prophets', Daniel: 'Major Prophets',
                 Acts: 'Church History', Revelation: 'Prophecy', Genesis: 'Torah' };
Object.keys(PINNED).forEach(name => {
  const b = books.find(o => o.book === name);
  if (!b) fail.push(name + ' is not in index.json');
  else if (b.group !== PINNED[name]) fail.push(name + ' is in "' + b.group + '" — it was decided to be in "' + PINNED[name] + '" (see GROUPS in tools/bible-split.py)');
});

/* ---------- AND HOW MANY VERSES EACH CHAPTER HOLDS § */
let cvWrong = 0;
const firstCvWrong = [];
books.forEach(b => {
  const cv = b.chapterVerses, d = split[b.n];
  let why = '';
  if (!Array.isArray(cv)) why = 'has no chapterVerses';
  else if (cv.length !== b.chapters) why = 'has ' + cv.length + ' chapterVerses for ' + b.chapters + ' chapters';
  else if (cv.reduce((s, c) => s + c, 0) !== b.verses) why = 'has chapterVerses adding to ' + cv.reduce((s, c) => s + c, 0) + ', not its ' + b.verses + ' verses';
  else if (d) {
    const k = cv.findIndex((c, i) => !Array.isArray(d.chapters[i]) || d.chapters[i].length !== c);
    if (k >= 0) why = 'says chapter ' + (k + 1) + ' has ' + cv[k] + ' verses; the file has ' + (d.chapters[k] || []).length;
  }
  if (why) { cvWrong++; if (firstCvWrong.length < 4) firstCvWrong.push(b.book + ' ' + why); }
});
if (cvWrong) fail.push(cvWrong + ' book(s) count their chapters\' verses wrongly in index.json, first: ' + firstCvWrong.join(' | '));

/* ---------- THE DRAWING ---------------------------------------------------------------------------- */
const findSrc = fs.readFileSync(path.join(root, 'js', 'find.js'), 'utf8');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const verseSrc = cutFrom(findSrc, 'bibleVerse_');
let bibleVerse_ = null;
if (!verseSrc) fail.push('bibleVerse_ is not in js/find.js — the brackets were NOT checked, which is not a pass');
else bibleVerse_ = new Function('esc', verseSrc + '\nreturn bibleVerse_;')(esc);
const unesc = s => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
let pairs = 0, italics = 0, paras = 0;
if (bibleVerse_) {
  let bad = 0;
  const firstBad = [];
  Object.keys(split).forEach(n => split[n].chapters.forEach((ch, ci) => ch.forEach((v, vi) => {
    const html = bibleVerse_(v);
    const open = (v.match(/\[/g) || []).length;
    const its = (html.match(/<i>/g) || []).length;
    pairs += open; italics += its;
    if (/^#/.test(v)) paras++;
    const plain = unesc(html.replace(/<\/?i>/g, ''));
    const want = v.replace(/^#\s*/, '').replace(/[\[\]]/g, '');
    const why = /[\[\]]/.test(html) ? 'a bracket is left standing'
              : its !== open ? its + ' italic runs for ' + open + ' bracketed words'
              : /^#|>#/.test(html) ? 'the pilcrow # is drawn'
              : plain !== want ? 'the words are not the verse\'s own'
              : /<(?!\/?i>)/.test(html) ? 'markup other than <i> came out'
              : '';
    if (why) { bad++; if (firstBad.length < 4) firstBad.push(split[n].book + ' ' + (ci + 1) + ':' + (vi + 1) + ' — ' + why + ': ' + html.slice(0, 80)); }
  })));
  if (bad) fail.push(bad + ' verses are drawn wrongly, first: ' + firstBad.join(' | '));
  /* THE ONE EVERYBODY KNOWS, by eye: Genesis 1:2's supplied word. */
  const g = bibleVerse_('And the earth was without form, and void; and darkness [was] upon the face of the deep.');
  if (g.indexOf('darkness <i>was</i> upon') < 0) fail.push('Genesis 1:2 is drawn as "' + g + '" — "[was]" should be "<i>was</i>"');
  /* AND A VERSE THAT TRIES TO BE MARKUP IS TEXT: escaped first, brackets second. */
  const evil = bibleVerse_('<img src=x onerror=alert(1)> [and] it was so');
  if (/<img/.test(evil) || evil.indexOf('<i>and</i>') < 0) fail.push('a verse holding markup is drawn as markup: ' + evil);
}

/* ---------- AND THE VERSE AS THE CARD DRAWS IT: `bibleV_`, OVER EVERY VERSE § */
const vSrc = cutFrom(findSrc, 'bibleV_');
let bibleV_ = null, drawnCards = 0, drawnParas = 0;
if (!vSrc) fail.push('bibleV_ is not in js/find.js — what a verse card prints was NOT checked, which is not a pass');
else if (verseSrc) bibleV_ = new Function('esc', verseSrc + '\n' + vSrc + '\nreturn bibleV_;')(esc);
if (bibleV_) {
  const PARA = '<span class="bb-para" aria-hidden="true">¶</span> ';
  let bad = 0;
  const firstBad = [];
  Object.keys(split).forEach(n => split[n].chapters.forEach((ch, ci) => ch.forEach((v, vi) => {
    const html = bibleV_(v);
    const para = /^#/.test(v);
    const inner = /^<p class="bb-v">([\s\S]*)<\/p>$/.exec(html);
    const body = inner ? inner[1] : '';
    const marks = (html.match(/bb-para/g) || []).length;
    const words = unesc((para && body.indexOf(PARA) === 0 ? body.slice(PARA.length) : body).replace(/<\/?i>/g, ''));
    const want = v.replace(/^#\s*/, '').replace(/[\[\]]/g, '');
    const why = !inner ? 'it is not one <p class="bb-v">'
              : para && body.indexOf(PARA) !== 0 ? 'it opens a paragraph in the 1611 text and does not start with the pilcrow'
              : marks !== (para ? 1 : 0) ? marks + ' pilcrow(s) on a verse that ' + (para ? 'opens one paragraph' : 'opens none')
              : words !== want ? 'the words on the card are not the verse\'s own'
              : '';
    drawnCards++;
    if (para && !why) drawnParas++;
    if (why) { bad++; if (firstBad.length < 4) firstBad.push(split[n].book + ' ' + (ci + 1) + ':' + (vi + 1) + ' — ' + why + ': ' + html.slice(0, 90)); }
  })));
  if (bad) fail.push(bad + ' verse cards print the wrong thing, first: ' + firstBad.join(' | '));
}

/* ---------- THE VERSE LIST, BUILT BY THE REAL FUNCTION OVER THE REAL INDEX § */
const LIST_NAMES = ['BIBLE_NAME', 'BIBLE_WORDS', 'BIBLE_SHELF', 'bibleTestament_', 'bibleCite_', 'bibleBookWords_', 'bibleVerseList_'];
const listSrc = LIST_NAMES.map(n => cutFrom(findSrc, n));
let listed = 0;
if (listSrc.some(s => !s)) {
  fail.push('`' + LIST_NAMES.filter((n, i) => !listSrc[i]).join('`, `') + '` not found in js/find.js — the verse list was NOT checked, which is not a pass');
} else if (index && books.length) {
  let made = null;
  try { made = new Function(listSrc.join('\n') + '\nreturn bibleVerseList_;')()(index); }
  catch (e) { fail.push('bibleVerseList_ threw on the real index: ' + e.message); }
  const list = made && Array.isArray(made.list) ? made.list : [];
  listed = list.length;
  if (made && list.length !== rows.length) fail.push('the verse list holds ' + list.length + ' items and the archive ' + rows.length + ' verses — every verse is a card, once');
  const keys = new Set(list.map(x => x && x.key));
  if (made && keys.size !== list.length) fail.push((list.length - keys.size) + ' verse keys are not unique — two cards would share one star');
  /* THE CITATION, WRITTEN HERE RATHER THAN BY `bibleCite_`: a psalm is `Psalm 23`, every other book is
     its own name. */
  const cite = (book, c, v) => (book === 'Psalms' ? 'Psalm' : book) + ' ' + c + ':' + v;
  const tr = String(index.translation || '').toLowerCase();
  let off = 0;
  const firstOff = [];
  rows.forEach((r, i) => {
    const x = list[i];
    const n = Number(r.book_no), c = Number(r.chapter), v = Number(r.verse);
    const b = books[n - 1] || {};
    const why = !x ? 'no item'
      : x.key !== 'bible:' + tr + ':' + n + ':' + c + ':' + v ? 'its key is ' + x.key
      : x.name !== cite(r.book, c, v) ? 'it is named "' + x.name + '"'
      : x.kind !== 'bible' || !x.bb || x.bb.n !== n || x.ch !== String(c) || x.v !== String(v) ? 'its book, chapter or verse fields are wrong'
      : x.sub !== r.book ? 'its sub is "' + x.sub + '"'
      : ['testament', 'group', 'book'].some(k => String(x.bb[k] || '') === '') ? 'its book record is missing a field'
      : ['bible', 'kjv', b.book, b.group, x.bb.testament].some(w => String(x.text || '').toLowerCase().indexOf(String(w).toLowerCase()) < 0)
        ? 'a search for its book, group or testament would not find it'
      : '';
    if (why) { off++; if (firstOff.length < 4) firstOff.push(r.ref + ': ' + why); }
  });
  if (off) fail.push(off + ' of ' + rows.length + ' verses are not where, or what, the archive says in the verse list, first: ' + firstOff.join(' | '));
  /* `starts` IS HOW A STAR FINDS ITS VERSE WITHOUT A SEARCH: each chapter's first verse, by position. */
  let lost = 0;
  books.forEach(b => (b.chapterVerses || []).forEach((_, ci) => {
    const at = made && made.starts && made.starts[b.n - 1] ? made.starts[b.n - 1][ci] : undefined;
    const x = at == null ? null : list[at];
    if (!x || x.key !== 'bible:' + tr + ':' + b.n + ':' + (ci + 1) + ':1') lost++;
  }));
  if (lost) fail.push(lost + ' chapter(s) are not where `starts` says they begin — `bibleByKey_` would hand back the wrong verse');
}

/* ---------- WHO IS SHOWN IT, READ OUT OF THE FILES THAT DECIDE -------------------------------------- */
const kindM = /\n\s*bible:\s*\{\s*group:\s*'([^']*)',\s*label:\s*'([^']*)'/.exec(findSrc);
if (!kindM) fail.push('js/find.js has no `bible:` entry in KINDS — Find cannot offer the Bible');
else if (kindM[1] !== 'Learning' || kindM[2] !== 'Library') fail.push('the bible kind is ' + kindM[1] + ' · ' + kindM[2] + ', not Learning · Library — Resources went at the owner\'s word (445)');
/* THE GATE IS ONE LINE AND IT IS `isAdmin()`. A tutor check, a role list, or nothing at all here is
   the Bible shown to somebody the owner did not name. */
const gateM = /const bibleFor_ = \(\) => ([^;]+);/.exec(findSrc);
if (!gateM) fail.push('`bibleFor_` is not in js/find.js — there is no one place deciding who sees the Bible');
else if (gateM[1].replace(/\s+/g, ' ').trim() !== "typeof isAdmin === 'function' && isAdmin()") {
  fail.push('`bibleFor_` is `' + gateM[1].trim() + '` — the owner said "only admin can see the bible", which is isAdmin() and nothing else');
}
const itemsSrc = cutFrom(findSrc, 'bibleItems_') || '';
if (!/^function bibleItems_\(\) \{\s*if \(!bibleFor_\(\)\) return \[\];/.test(itemsSrc)) {
  fail.push('`bibleItems_` does not open by returning nothing unless `bibleFor_()` — the item would be built for everybody');
}
const getSrc = cutFrom(findSrc, 'bibleGet_') || '';
if (!/^function bibleGet_\(file\) \{\s*if \(!bibleFor_\(\)\) return Promise\.resolve\(null\);/.test(getSrc)) {
  fail.push('`bibleGet_` does not refuse to fetch unless `bibleFor_()` — a book could be downloaded for somebody never shown it');
}
/* EVERY FETCH OF THE FOLDER GOES THROUGH THAT ONE FUNCTION. */
const fetches = (findSrc.match(/fetch\([^)]*data\/bible/g) || []).length;
const viaGet = (getSrc.match(/fetch\([^)]*data\/bible/g) || []).length;
if (fetches !== viaGet || !viaGet) fail.push(fetches + ' fetches of data/bible in find.js, ' + viaGet + ' of them inside bibleGet_ — every one has to be behind the gate');
const stuffSrc = cutFrom(findSrc, 'stuffItemsRaw_') || '';
if (!/\.\.\.bibleItems_\(\)/.test(stuffSrc)) fail.push('`stuffItemsRaw_` does not list `...bibleItems_()` — the Bible never reaches Find');
/* ---------- AND THE REST OF THE GATE: EVERY DOOR INTO THE VERSES ASKS IT § */
const opens = (name, why) => {
  const s = cutFrom(findSrc, name) || '';
  if (!new RegExp('^function ' + name + '\\([^)]*\\) \\{\\s*if \\(!bibleFor_\\(\\)\\) return \\[\\];').test(s)) fail.push('`' + name + '` does not open by returning nothing unless `bibleFor_()` — ' + why);
};
opens('bibleVerses_', 'the 31,102 verses would be built for anybody');
opens('bibleKept_', 'a starred verse would be drawn on anybody\'s Saved');
if (!/bibleFor_\(\)/.test(cutFrom(findSrc, 'bibleInside_') || '')) fail.push('`bibleInside_` does not ask `bibleFor_()` — Find would read the verses for anybody holding a Bible chip');
if (!/bibleFor_\(\)/.test(cutFrom(findSrc, 'bibleTiles_') || '')) fail.push('`bibleTiles_` does not ask `bibleFor_()` — the Bible\'s tiles would be drawn for anybody');
/* A HANDLER IS `on('name', el => { … })`, which `cutFrom` cannot name, so its block is read from there. */
const handler = act => {
  const i = findSrc.indexOf("on('" + act + "'");
  if (i < 0) return '';
  let j = findSrc.indexOf('{', i), depth = 0;
  for (let k = j; k < findSrc.length; k++) {
    if (findSrc[k] === '{') depth++;
    if (findSrc[k] === '}' && --depth === 0) return findSrc.slice(i, k + 1);
  }
  return '';
};
['bible-go', 'bible-retry'].forEach(act => {
  const h = handler(act);
  if (!h) fail.push('there is no `on(\'' + act + '\')` in js/find.js — its tile would do nothing');
  else if (!/^on\('[^']+', el => \{\s*if \(!bibleFor_\(\)/.test(h)) fail.push('`on(\'' + act + '\')` does not open by asking `bibleFor_()` — a forged button would work for anybody');
});
/* THE OLD READER'S DOORS ARE GONE, and a handler left behind for a button nothing draws is a way in
   nothing checks. */
['bible-book', 'bible-ch', 'bible-to'].forEach(act => {
  if (findSrc.indexOf("on('" + act + "'") >= 0) fail.push('`on(\'' + act + '\')` is still in js/find.js — the reader it served is gone');
});

/* ---------- THE SIX QUESTIONS, AS DECLARED § */
const SIX = ['bibleTranslation', 'bibleTestament', 'bibleGroup', 'bibleBook', 'bibleChapter', 'bibleVerse'];
const facetsSrc = (() => { const i = findSrc.indexOf('const FACETS = ['); const j = findSrc.indexOf('\n];', i); return i < 0 || j < 0 ? '' : findSrc.slice(i, j); })();
const declared = [...facetsSrc.matchAll(/\{ field: '(bible\w+)',([^\n]*)/g)].map(m => ({ field: m[1], line: m[2] }));
if (declared.map(d => d.field).join(',') !== SIX.join(',')) {
  fail.push('FACETS declares ' + (declared.map(d => d.field).join(', ') || 'no Bible questions') + ' — not the six, in the owner\'s order: ' + SIX.join(', '));
}
/* ORDINARY QUESTIONS (396): a field, a label and a reader each — the one rule asks them, in the facets tab's order, and
   only the Bible's own list (admin-only, `bibleFor_`) can answer them. */
declared.forEach(d => {
  const flags = (d.line.match(/\b(only|folder|grid|always|tagOnly|asIs|orderOf|cmp|not|min)\s*:/g) || []);
  if (flags.length) fail.push('`' + d.field + '` carries ' + flags.join(' ') + ' — a Bible question is an ordinary facet, asked by the one rule');
});
/* AND A COLOUR EACH, so a chip and the card's tag say the same thing the same way. */
const tagSrc = (() => { const i = findSrc.indexOf('const TAG_OF = {'); const j = findSrc.indexOf('\n};', i); return i < 0 || j < 0 ? '' : findSrc.slice(i, j); })();
SIX.forEach(f => { if (!new RegExp('\\b' + f + ":\\s*'\\w+'").test(tagSrc)) fail.push('TAG_OF does not name `' + f + '` — its chip would be the plain outline beside the card\'s coloured tag'); });
/* AND THE SHEET: a live row for each, in order, between the shelf they are asked after and the
   textbook's question they come before — the tab's sort_order is the only thing that orders them. */
let sheet = [];
try { sheet = JSON.parse(fs.readFileSync(path.join(root, 'data', 'settings', 'facets.json'), 'utf8')); }
catch (e) { fail.push('data/settings/facets.json does not parse — the sheet\'s rows were NOT checked'); }
const row = f => sheet.find(r => r && r.field === f);
const at = f => Number((row(f) || {}).sort_order);
SIX.forEach(f => {
  const r = row(f);
  if (!r) fail.push('data/settings/facets.json has no row for `' + f + '` — it would be placed by its position in the code');
  else if (r.active === false) fail.push('data/settings/facets.json switches `' + f + '` off — every Bible question below it would never be asked');
});
const ats = SIX.map(at);
if (sheet.length && !(ats.every((v, i) => isFinite(v) && (i === 0 || v > ats[i - 1])) && ats[0] > at('shelf') && ats[5] < at('book'))) {
  fail.push('the Bible\'s rows in data/settings/facets.json are not in order between `shelf` (' + at('shelf') + ') and `book` (' + at('book') + '): ' + SIX.map((f, i) => f + ' ' + ats[i]).join(', '));
}

/* NOTHING ABOUT IT IN THE PAYLOAD OR THE BOOT. The text is public domain and this repository is public,
   so it is not that the server must hide it — it is that every visitor's phone would pay for it. */
/* CODE, NOT PROSE: `doget.gs` already records that the old `Library` sheet's `bible` tab is 31,102 rows
   nothing reads, and a sentence about the Bible is not the Bible in the payload. So comments go first. */
const code = src => String(src).replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');
const gsDir = path.join(root, 'backend');
fs.readdirSync(gsDir).filter(f => /\.gs$/.test(f)).forEach(f => {
  if (/bible/i.test(code(fs.readFileSync(path.join(gsDir, f), 'utf8')))) fail.push('backend/' + f + ' names the Bible in its code — nothing about it belongs in the doGet payload');
});
if (/bible/i.test(code(fs.readFileSync(path.join(root, 'index.html'), 'utf8')))) fail.push('index.html names the Bible in its code — the boot must not fetch it for every visitor');
const libM = /const LIB_EXTRA = \[([^\]]*)\]/.exec(fs.readFileSync(path.join(root, 'js', 'library.js'), 'utf8'));
if (libM && /bible/i.test(libM[1])) fail.push('LIB_EXTRA names the Bible — every visitor would fetch it at boot');

/* ---------- THE COUNT, SO A SILENCE IS NOT A PASS -------------------------------------------------- */
console.log('THE BIBLE (KJV)  —  ' + books.length + ' books, ' + chapters + ' chapters, ' + verses + ' verses in data/bible/, '
  + seen + ' rows in the archive');
console.log('  [bracketed] words: ' + pairs + ', drawn as ' + italics + ' italic runs;  pilcrows: ' + paras);
console.log('  ' + drawnCards + ' verses printed as a card by bibleV_, ' + drawnParas + ' of them under the pilcrow');
console.log('  ' + seenGroups.length + ' groups: ' + seenGroups.map(g => g + ' ' + books.filter(b => b.group === g).length).join(', '));
console.log('  ' + listed + ' verse cards named from index.json, ' + books.reduce((s, b) => s + ((b.chapterVerses || []).length), 0)
  + ' chapters counted');
const kb = onDisk.reduce((s, f) => s + fs.statSync(path.join(DIR, f)).size, 0);
console.log('  ' + onDisk.length + ' book files, ' + Math.round(kb / 1024) + ' KB, the largest '
  + Math.round(Math.max(0, ...onDisk.map(f => fs.statSync(path.join(DIR, f)).size)) / 1024) + ' KB');
note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.forEach(f => console.log('  ' + f));
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with the Bible, its split, its questions, or who is shown it.');
  process.exit(1);
}
console.log('\nOK — every verse of the archive is in the split, in order and unchanged; every book is in the group\n'
  + '     decided for it and every chapter counted; every [word] is drawn in italics and every verse card\n'
  + '     prints its own words under its own pilcrow; every verse is a card named for its own place; and\n'
  + '     only isAdmin() is shown it, opens it or fetches it.');
