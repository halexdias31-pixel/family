#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-bible.js
   THE KING JAMES BIBLE: CUT INTO BOOKS WITHOUT LOSING A WORD, DRAWN WITHOUT ITS BRACKETS, AND SHOWN
   TO NOBODY BUT AN ADMIN.

   ASKED FOR AS "i want to add the bible to resources as a book. but only admin can see the bible."
   and "i already have a bible text in repo". `data/archive/bible.json` is the source — 31,102 verse
   rows — and `tools/bible-split.py` writes `data/bible/`, which is what the app reads. A split that
   dropped one verse, moved one, or changed one character would be a Bible that is wrong in a place
   nobody will ever look, so this reads BOTH ends and compares every verse.

   WHAT FAILS:
     · THE SPLIT — a verse missing, added, moved or altered, against the archive in its own order; a
       chapter count or a verse count in `index.json` that its file does not have; a file in
       `data/bible/` the index does not name (a phone could be sent to it) or one it names that is
       not there; a book file not one chapter per line (the diff rule `questions.json` keeps).
     · THE DRAWING — every one of the 31,102 verses through the REAL `bibleVerse_`, cut out of
       find.js by name: no `[` or `]` left standing, one `<i>` per bracket pair, the pilcrow `#` gone,
       and the words left over exactly the verse's own. And a verse that tries to be markup is text.
     · THE CUT — every chapter through the REAL `bibleCut_` at four screen sizes' budgets: the pages
       are whole verses, in order, every verse on exactly one, none empty.
     · WHO — read out of the source: the kind wears `Resources` in Learning; the one gate is
       `isAdmin()`; the item builder and every fetch ask it; the payload (`backend/doget.gs`) and the
       boot fetches (`index.html`, `LIB_EXTRA`) say nothing about the Bible at all.

   What an admin SEES, and that a student fetches nothing, is `check-flow.js`'s question — it runs
   the app. This one reads the files, so it covers every verse rather than the ones a journey reads.

     node js/check-bible.js
================================================================================================== */
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

/* THE ARCHIVE, IN ITS OWN ORDER, AGAINST THE SPLIT. Each row is looked up where the split says it
   is — book, chapter, verse as positions — and its text compared exactly. Counted as it goes, so a
   split with a verse the archive does not have is caught by the count rather than by luck. */
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

/* ---------- THE CUT, AT FOUR SCREENS' BUDGETS ------------------------------------------------------
   `bibleCut_` reads `BIBLE.budget`, `BIBLE_PAGE`, `BIBLE_VERSE` and `BIBLE_FOOT`, so all four are cut
   out with it and the budget is set the way a phone sets it. 793 and 1,280 are what 320x568 and
   390x844 measure (see `bibleBudget_`); 500 and 2,000 are its clamps. */
const cutSrc = cutFrom(findSrc, 'bibleCut_');
const consts = ['BIBLE_PAGE', 'BIBLE_VERSE', 'BIBLE_FOOT'].map(n => {
  const m = new RegExp('const ' + n + ' = (\\d+);').exec(findSrc);
  if (!m) fail.push(n + ' is not a plain number in js/find.js — the cut was NOT checked');
  return m ? 'const ' + n + ' = ' + m[1] + ';' : '';
});
let pagesAt = {};
if (cutSrc && consts.every(Boolean)) {
  [500, 793, 1280, 2000].forEach(budget => {
    const bibleCut_ = new Function(consts.join('\n') + '\nconst BIBLE = { budget: ' + budget + ' };\n' + cutSrc + '\nreturn bibleCut_;')();
    let pages = 0, bad = 0;
    const firstBad = [];
    Object.keys(split).forEach(n => split[n].chapters.forEach((ch, ci) => {
      const cuts = bibleCut_(ch);
      pages += cuts.length;
      let at = 0, why = '';
      cuts.forEach(([a, b]) => {
        if (why) return;
        if (a !== at) why = 'a page starts at verse ' + (a + 1) + ' after one ending at ' + at;
        else if (!(b > a)) why = 'an empty page';
        at = b;
      });
      if (!why && at !== ch.length) why = 'the pages end at verse ' + at + ' of ' + ch.length;
      if (why) { bad++; if (firstBad.length < 3) firstBad.push(split[n].book + ' ' + (ci + 1) + ': ' + why); }
    }));
    pagesAt[budget] = pages;
    if (bad) fail.push('at a budget of ' + budget + ', ' + bad + ' chapters are not cut into whole verses in order: ' + firstBad.join(' | '));
  });
} else if (!cutSrc) fail.push('bibleCut_ is not in js/find.js — the pages were NOT checked, which is not a pass');

/* ---------- WHO IS SHOWN IT, READ OUT OF THE FILES THAT DECIDE -------------------------------------- */
const kindM = /\n\s*bible:\s*\{\s*group:\s*'([^']*)',\s*label:\s*'([^']*)'/.exec(findSrc);
if (!kindM) fail.push('js/find.js has no `bible:` entry in KINDS — Find cannot offer the Bible');
else if (kindM[1] !== 'Learning' || kindM[2] !== 'Resources') fail.push('the bible kind is ' + kindM[1] + ' · ' + kindM[2] + ', not Learning · Resources — the owner asked for it in Resources');
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
console.log('  pages at budgets ' + Object.keys(pagesAt).map(b => b + ': ' + pagesAt[b]).join(', '));
const kb = onDisk.reduce((s, f) => s + fs.statSync(path.join(DIR, f)).size, 0);
console.log('  ' + onDisk.length + ' book files, ' + Math.round(kb / 1024) + ' KB, the largest '
  + Math.round(Math.max(0, ...onDisk.map(f => fs.statSync(path.join(DIR, f)).size)) / 1024) + ' KB');
note.forEach(n => console.log('note: ' + n));

if (fail.length) {
  console.log('\nBROKEN  (' + fail.length + ')');
  fail.forEach(f => console.log('  ' + f));
  console.log('\nFAILED — ' + fail.length + ' thing(s) wrong with the Bible, its split, or who is shown it.');
  process.exit(1);
}
console.log('\nOK — every verse of the archive is in the split, in order and unchanged; every [word] is drawn in\n'
  + '     italics; every chapter cuts into whole verses; and only isAdmin() is shown it or fetches it.');
