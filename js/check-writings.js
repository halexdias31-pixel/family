#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-writings.js ONE MODEL FOR EVERY WRITTEN WORK (520): the loaders build their cards from the real indexes, held to
   one shape, one shelf, one facet set, a tradition topic, one age rule, no card twice. */
/* Also: facets.json and FACETS list the same fields; no two facets share a label; no answer differs from another only by case,
   punctuation or apostrophe; Apocrypha has one name; histKind never names a shelf. No flags, no port. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const json = f => JSON.parse(src(f));
const bad = [], said = [];
const find = src('js/find.js');

/* ---------- THE CARDS, BUILT BY THE LOADERS */
const LOADERS = [['talmud', 'TALMUD', 'talmudItems_', 'data/talmud/index.json'], ['quran', 'QURAN', 'quranItems_', 'data/quran/index.json'],
  ['hadith', 'HADITH', 'hadithItems_', 'data/hadith/index.json'], ['works', 'WORKS', 'worksItems_', 'data/works/index.json'],
  ['texts', 'TEXTS', 'textsItems_', 'data/texts/index.json'], ['pdtexts', 'PDTEXTS', 'pdtextsItems_', 'data/pdtexts/index.json'],
  ['orthodox', 'ORTHO', 'orthoItems_', 'data/orthodox/index.json'], ['hymns', 'HYMNS', 'hymnsItems_', 'data/hymns/index.json']];
const ctx = { window: {}, Array, String, Number, Object, Promise, Math, JSON, Set, Map, RegExp, console,
  BIBLE_SHELF: 'Writings', SCRIPTURE_SUBJECT: () => 'Religious Studies', brand: (k, v) => v, viewerOfAge_: () => true,
  ruleOn_: () => true, ANSWER_ORDERS: [], esc: s => String(s), on: () => {}, $: () => null, loading_: () => '', tagRow_: () => '', tile_: () => '', spellKey_: s => String(s).toLowerCase() };
vm.createContext(ctx);
let items = [], WR = null;
try {
  /* THE AGE RULE AND THE SHELF ARE find.js's OWN LINES, read out of it. */
  const line = re => { const m = find.match(re); if (!m) throw new Error('find.js has no ' + re); return m[0]; };
  vm.runInContext([line(/const SCRIPTURE_MIN_AGE = \d+;/), line(/const scriptureMinAge_ = [^\n]+/), line(/const WRITINGS_SHELF = [^\n]+/),
    src('js/writings.js'), ...LOADERS.map(l => src('js/' + l[0] + '.js'))].join('\n;\n')
    + '\n;this.WR = { writingFold_, writingSourceOf_, WRITING_KEYS, WRITING_WORKS, WRITING_DEUTERO, writingAge_, writingOf_, bibleW_ };', ctx);
  WR = ctx.WR;
  LOADERS.forEach(([file, store, fn, ix]) => {
    vm.runInContext(store + '.index = ' + JSON.stringify(json(ix)) + ';', ctx);
    const got = vm.runInContext(fn + '()', ctx);
    if (!got.length) bad.push(fn + ' built no cards from ' + ix);
    said.push(file + ' ' + got.length + ' cards');
    items = items.concat(got);
  });
} catch (e) { bad.push('the loaders do not build their cards — NOTHING else was checked: ' + e.message); }

/* THE BIBLE'S VERSES, read through `bibleW_` as Find reads them: one per book a testament and group, as its index says. */
let bible = [];
try {
  const ix = json('data/bible/index.json');
  const trs = [{ tr: ix.translation, dir: '', books: ix.books }].concat((ix.also || []).map(a => ({ tr: a.translation, dir: a.dir, books: a.books || ix.books })));
  trs.forEach(t => t.books.forEach(b => bible.push({ kind: 'bible', key: 'bible:' + t.tr + ':' + b.n, ch: '1', v: '1',
    bb: { book: b.book, group: b.group, testament: b.testament === 'NT' ? 'New Testament' : 'Old Testament', dir: t.dir, translation: t.tr } })));
} catch (e) { bad.push('data/bible/index.json does not load: ' + e.message); }

if (WR && items.length) {
  const SHAPE = new Set(['kind', 'key', 'name', 'sub', 'text', 'image', 'row', 'w', 'wSrc', 'wDate', 'shelf', 'subject', 'topic', 'min_age']);
  const OWN = new Set(['tx', 'wt', 'ot', 'hy', 'qr', 'hd', 'tal']);
  const topics = new Map(json('data/topics.json').map(t => [t.label, t]));
  const tuples = new Map(), bySrc = {};
  items.forEach(x => {
    /* R1: ONE SHAPE — the same keys on every card, one private pointer to its words, the one facet set and nothing else. */
    const extra = Object.keys(x).filter(k => !SHAPE.has(k) && !OWN.has(k));
    if (extra.length) bad.push(x.key + ' carries ' + extra.join(', ') + ' — a field outside the one writing shape');
    if (Object.keys(x).filter(k => OWN.has(k)).length !== 1) bad.push(x.key + ' does not point at its words exactly once');
    const w = x.w || {};
    if (Object.keys(w).sort().join() !== WR.WRITING_KEYS.slice().sort().join()) bad.push(x.key + '\'s facet set is ' + Object.keys(w).join(', '));
    if (!w.work) bad.push(x.key + ' names no Work');
    if (!w.text) bad.push(x.key + ' has no Text');
    if (x.shelf !== 'Writings') bad.push(x.key + ' is on the shelf ' + x.shelf + ', not Writings');
    /* R3: A RELIGIOUS WORK IS ITS TRADITION'S TOPIC, Religious Studies; anything else keeps its subject and has none. */
    if (x.subject === 'Religious Studies') {
      const t = topics.get(x.topic);
      if (!t) bad.push(x.key + ' is Religious Studies with the topic "' + x.topic + '", which data/topics.json does not have');
      else if (t.only_subject !== 'Religious Studies') bad.push('topic ' + x.topic + ' is not a Religious Studies topic in data/topics.json');
    } else if (x.topic) bad.push(x.key + ' (' + x.subject + ') has the tradition topic ' + x.topic);
    /* R5: ONE AGE, writingAge_ of its registry entry. */
    if (x.min_age !== (x.topic ? 18 : 0)) bad.push(x.key + ' is ' + x.min_age + '+, not writingAge_ of its entry (' + (x.topic ? 18 : 0) + ')');
    /* R6: NO CARD TWICE — one work, place and text is one card. */
    /* Across entries only: one index entry's own repeated headings (two "Canon 18") are its source's, not a second copy. */
    const t = WR.WRITING_KEYS.map(k => [].concat(w[k]).join('/')).join('|'), entry = x.key.split(':').slice(0, 2).join(':');
    if (tuples.has(t) && tuples.get(t).split(':').slice(0, 2).join(':') !== entry) bad.push(x.key + ' and ' + tuples.get(t) + ' are the same card: ' + t);
    tuples.set(t, x.key);
    bySrc[x.wSrc] = (bySrc[x.wSrc] || 0) + 1;
  });
  /* R6: THE APOCRYPHA HAVE ONE NAME — wherever a book of them is, its Collection is the one alias set. */
  const all = items.map(x => x.w).concat(bible.map(x => { const o = {}; WR.WRITING_KEYS.forEach(k => { o[k] = WR.bibleW_(x, k) || ''; }); return o; }));
  all.forEach(w => WR.WRITING_KEYS.forEach(k => [].concat(w[k]).forEach(v => {
    if (/^(apocrypha|deuterocanon|anagignoskomena)$/i.test(String(v))) bad.push('"' + v + '" stands alone as ' + k + ' — the one name is "' + WR.WRITING_DEUTERO + '"');
  })));
  bible.filter(x => x.bb.group === 'Deuterocanon').forEach(x => {
    if ([].concat(WR.bibleW_(x, 'collection'))[0] !== WR.WRITING_DEUTERO) bad.push(x.bb.book + ' (' + x.bb.translation + ') is not in ' + WR.WRITING_DEUTERO);
  });
  items.filter(x => x.w.work === 'Bible').forEach(x => {
    if (x.w.collection !== WR.WRITING_DEUTERO) bad.push(x.key + ' is a book of the Bible outside the Deuterocanon collection');
  });
  /* R8: NO TWO ANSWERS THAT DIFFER ONLY BY CASE, PUNCTUATION OR APOSTROPHE, within one facet. */
  const fold = v => WR.writingFold_(v);
  let lone = 0;
  WR.WRITING_KEYS.forEach(k => {
    const seen = new Map(), count = new Map();
    all.forEach(w => [].concat(w[k]).filter(Boolean).forEach(v => {
      count.set(v, (count.get(v) || 0) + 1);
      const f = fold(v);
      if (seen.has(f) && seen.get(f) !== v) bad.push(k + ': "' + v + '" and "' + seen.get(f) + '" are one answer spelt two ways');
      seen.set(f, v);
    }));
    lone += [...count.values()].filter(n => n === 1).length;
  });
  said.push(Object.keys(bySrc).map(s => s + ' ' + bySrc[s]).join(', ') + '; ' + lone + ' answers name a single card');
}

/* THE SOURCE TEXT (526): every scripture card names the original its Text was made from, read off the Text's base (writingSourceOf_),
   never set by a loader; asked Work → Source → Translation → Book. */
if (WR && items.length) {
  const srcOf = w => [].concat(w.source).join('/');
  const want = { 'King James Version': { 'Old Testament': 'Hebrew Masoretic Text', 'New Testament': 'Greek New Testament' },
    'World English Bible': { 'Old Testament': 'Hebrew Masoretic Text', 'New Testament': 'Greek New Testament' } };
  const bibleW = bible.map(x => { const o = { tr: x.bb.translation, testament: x.bb.testament, group: x.bb.group }; WR.WRITING_KEYS.forEach(k => { o[k] = WR.bibleW_(x, k) || ''; }); return o; });
  const fixed = { HBO: 'Hebrew Masoretic Text', LXX: 'Greek Septuagint', BRENTON: 'Greek Septuagint', GNT: 'Greek New Testament' };
  bibleW.forEach(o => {
    const by = { KJV: 'King James Version', WEB: 'World English Bible' }[o.tr];
    const w = fixed[o.tr] || (by && o.group !== 'Deuterocanon' ? want[by][o.testament] : by ? 'Greek Septuagint' : '');
    if (!w) bad.push('the Bible text ' + o.tr + ' has no expected source in this check — add it');
    else if (srcOf(o) !== w) bad.push(o.book + ' (' + o.tr + ') has the Source text "' + srcOf(o) + '", not its base "' + w + '"');
  });
  const scripture = { Quran: 'Arabic', Talmud: 'Babylonian Talmud (Bavli)' };
  items.forEach(x => {
    const w = x.w || {};
    if (scripture[w.work] && srcOf(w) !== scripture[w.work]) bad.push(x.key + ' (' + w.work + ', ' + w.text + ') has the Source text "' + srcOf(w) + '", not "' + scripture[w.work] + '"');
    if (w.work === 'Bible' && srcOf(w) !== 'Greek Septuagint') bad.push(x.key + ' (a Deuterocanon book, ' + w.text + ') has the Source text "' + srcOf(w) + '"');
  });
  const bibleSources = new Set(bibleW.map(srcOf));
  if (bibleSources.size < 3) bad.push('the Bible offers ' + bibleSources.size + ' Source texts (' + [...bibleSources].join(', ') + ') — wanted the Masoretic, the Septuagint and the Greek NT');
  /* NO LOADER SETS ITS OWN: the Source comes from the Text's base in writings.js, so one rule decides it for every writing. */
  LOADERS.forEach(l => { if (/\bsource:\s/.test((src('js/' + l[0] + '.js').match(/w: \{[^}]*\}/g) || []).join(' '))) bad.push('js/' + l[0] + '.js sets a Source text itself — it is the Text\'s base (writingSourceOf_)'); });
  /* THE ORDER ASKED: Work, Source text, Translation, then the groups above Book, Book, Chapter, Unit (facets tab sort_order). */
  const so = {};
  json('data/settings/facets.json').forEach(f => { so[f.field] = Number(f.sort_order); });
  const order = ['wWork', 'wSource', 'wText', 'wBook', 'wChapter', 'wUnit'];
  for (let i = 1; i < order.length; i++) if (!(so[order[i - 1]] < so[order[i]])) bad.push('the facets tab asks ' + order[i] + ' (' + so[order[i]] + ') before ' + order[i - 1] + ' (' + so[order[i - 1]] + ') — wanted ' + order.join(' → '));
  said.push('source text: ' + [...bibleSources].sort().join(', ') + ' for the Bible; asked ' + order.join(' → '));
}

/* A WRITING IS ITS PAGES (520): no work is both a profile row (data/writings.json) and unit cards; a row may stand only for a
   work with none (named-only, or an artefact). */
if (items.length) {
  const works = new Set(items.map(x => String(x.w.work).toLowerCase()));
  const ids = new Set(json('data/works/index.json').works.map(w => w.id));
  json('data/writings.json').forEach(r => {
    const t = [r.title_english, r.title_original].filter(Boolean).map(s => String(s).toLowerCase());
    if (ids.has(r.id) || t.some(s => works.has(s))) bad.push(r.id + ' (' + (r.title_english || r.title_original) + ') is a profile card of a work that has unit cards — its facts belong on the units');
  });
}

/* R5: THE AGE IS READ ONE WAY — the constant only inside scriptureMinAge_. */
fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f)).forEach(f => {
  src('js/' + f).split('\n').forEach((l, i) => {
    if (/\bSCRIPTURE_MIN_AGE\b/.test(l) && !/const SCRIPTURE_MIN_AGE = |const scriptureMinAge_ = /.test(l)) bad.push('js/' + f + ':' + (i + 1) + ' reads SCRIPTURE_MIN_AGE outside scriptureMinAge_');
    if (/\bviewerOfAge_\(scriptureMinAge_\(\)\)/.test(l) && f !== 'find.js') bad.push('js/' + f + ':' + (i + 1) + ' asks the age its own way — writingFor_');
  });
});

/* R7: facets.json AND FACETS LIST THE SAME FIELDS; R8: NO TWO FACETS SHARE A LABEL. */
const block = find.slice(find.indexOf('const FACETS = ['), find.indexOf('\n];', find.indexOf('const FACETS = [')));
const code = [...block.matchAll(/\{ field: '(\w+)',\s*label: '([^']+)'/g)].map(m => ({ field: m[1], label: m[2] }));
if (code.length < 20) bad.push('FACETS could not be read out of js/find.js (' + code.length + ' fields)');
const sheet = json('data/settings/facets.json');
const sheetFields = new Set(sheet.map(f => f.field)), codeFields = new Set(code.map(f => f.field));
code.forEach(f => { if (!sheetFields.has(f.field)) bad.push('FACETS has ' + f.field + ' and data/settings/facets.json does not'); });
const retired = new Set([...(find.match(/const RETIRED_FACETS = \{[\s\S]*?\n\};/) || [''])[0].matchAll(/^  (\w+): /gm)].map(m => m[1]));
sheet.forEach(f => { if (!codeFields.has(f.field) && !retired.has(f.field)) bad.push('data/settings/facets.json has ' + f.field + ' and FACETS does not'); });
const byLabel = {};
code.forEach(f => {
  /* BOTH SPELLINGS COUNT: the code's own label and the facets tab's, which overrides it on the live site. */
  const s = sheet.find(r => r.field === f.field);
  new Set([f.label, s && s.label].filter(Boolean)).forEach(label => (byLabel[label] = byLabel[label] || []).push(f.field));
});
/* A WRITING'S LABEL IS ITS OWN; labels shared outside the writings (Month, Year, Level across boxing, fives and exams) are reported. */
Object.keys(byLabel).forEach(l => {
  if (byLabel[l].length < 2) return;
  const msg = 'the label "' + l + '" asks two questions: ' + byLabel[l].join(', ');
  if (byLabel[l].some(f => /^w[A-Z]/.test(f))) bad.push(msg); else said.push('note: ' + msg);
});

/* R2: histKind NEVER NAMES A SHELF — the history database's own word for a writing is Works. */
const hk = (find.match(/histKind: kind === 'manuscript' \? [^\n]+/) || [''])[0];
if (!hk) bad.push('find.js no longer says histKind where this check looks');
if (/'Writings'|'Texts'/.test(hk)) bad.push('histKind names a shelf: ' + hk.trim());
LOADERS.map(l => l[0] + '.js').concat(['writings.js']).forEach(f => {
  if (/histKind: '/.test(src('js/' + f))) bad.push('js/' + f + ' sets histKind on a card that is not a history-database row');
});

if (bad.length) { console.log('check-writings: ' + bad.length + ' FAILED'); bad.slice(0, 40).forEach(b => console.log('  ' + b)); process.exit(1); }
said.forEach(s => console.log('  ' + s));
console.log('check-writings: ' + items.length + ' writing cards and ' + bible.length + ' Bible books in one shape; ' + code.length + ' facets, every writing facet its own label');
