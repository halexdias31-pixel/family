/* ================= ONE MODEL FOR EVERY WRITTEN WORK (520): ONE SHELF, ONE FACET SET, ONE AGE, ONE REGISTRY ================= */
/* "texts and writings?? what's the difference?" — none now: every loader (the Bible, talmud, quran, hadith, works, texts,
   pdtexts, orthodox, hymns) maps its index onto `writingUnit_`, one shape. */

/* ONE COLLECTION, THREE NAMES (520): the Protestant, Catholic and Orthodox words for the same books. */
const WRITING_DEUTERO = 'Deuterocanon / Apocrypha / Anagignoskomena';
const WRITING_DEUTERO_BOOKS = ['Tobit', 'Judith', 'Additions to Esther', 'Esther (Greek)', 'Wisdom of Solomon', 'Wisdom', 'Sirach', 'Ecclesiasticus',
  'Baruch', 'Letter of Jeremiah', 'Epistle of Jeremiah', 'Prayer of Azariah', 'Song of the Three Children', 'Susanna', 'Bel and the Dragon',
  '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees', '1 Esdras', '2 Esdras', 'Prayer of Manasseh', 'Prayer of Manasses', 'Psalm 151', 'Odes'];

/* THE WORKS REGISTRY (520): each source's work, its tradition (a topic) and its subject; a source not here is literature or
   history and keeps its own subject. Keyed by loader, then by the index's own id. */
const WRITING_WORKS = {
  bible: { work: 'Bible', topic: 'Christianity' },
  quran: { work: 'Quran', topic: 'Islam' },
  hadith: { work: 'Hadith', topic: 'Islam' },
  talmud: { work: 'Talmud', topic: 'Judaism', collection: 'Mishnah and Talmud' },
  'texts:apocrypha': { work: 'Bible', topic: 'Christianity' },
  'texts:enoch': { topic: 'Judaism' }, 'texts:jubilees': { topic: 'Judaism' }, 'texts:josephus': { topic: 'Judaism' },
  'texts:mishnah': { topic: 'Judaism', collection: 'Mishnah and Talmud' }, 'texts:mishnah-en': { topic: 'Judaism', collection: 'Mishnah and Talmud' },
  'texts:zohar': { topic: 'Judaism' },
  'texts:fathers-grc': { topic: 'Christianity', collection: 'Apostolic Fathers' }, 'texts:fathers-en': { topic: 'Christianity', collection: 'Apostolic Fathers' },
  'texts:justin-en': { topic: 'Christianity', collection: 'Church Fathers' }, 'texts:justin-grc': { topic: 'Christianity', collection: 'Church Fathers' },
  'texts:confessions': { topic: 'Christianity', collection: 'Church Fathers' },
  'texts:gilgamesh': { topic: 'Mesopotamian religion' },
  'works:WR-0001': { topic: 'Christianity', collection: 'Apostolic Fathers' },
  'works:WR-0002': { topic: 'Judaism' },
  orthodox: { topic: 'Christianity' },
  hymns: { topic: 'Christianity', collection: 'Hymns' },
};
const writingWork_ = (src, id) => WRITING_WORKS[src + ':' + id] || WRITING_WORKS[src] || {};

/* ONE AGE PER INDEX ENTRY (520), through the scripture rule: a religious work (a tradition) is scripture's age, anything else none. */
const writingAge_ = entry => (entry && entry.topic ? scriptureMinAge_() : 0);
/* WHETHER THIS VIEWER MAY HAVE A SOURCE AT ALL, asked before its index is fetched: the same age, read the same way. */
const writingFor_ = entry => viewerOfAge_(writingAge_(entry));

/* TEXT IS BUILT, NEVER WRITTEN (520): "<language>, <translator> (<year>)" from structured fields, keyed by what each index calls it. */
const WRITING_LANG = { en: 'English', he: 'Hebrew', hbo: 'Hebrew', grc: 'Greek', ar: 'Arabic', arc: 'Aramaic', la: 'Latin', akk: 'Akkadian' };
const WRITING_TEXTS = {
  KJV: { language: 'English', translator: 'King James Version', year: 1611 },
  WEB: { language: 'English', translator: 'World English Bible', year: 2000 },
  HBO: { language: 'Hebrew', translator: 'Masoretic text' },
  LXX: { language: 'Greek', translator: 'Septuagint' },
  BRENTON: { language: 'English', translator: 'Brenton', year: 1851 },
  GNT: { language: 'Greek', translator: 'Robinson–Pierpont', year: 2018 },
  'Arabic (Tanzil)': { language: 'Arabic', translator: 'Tanzil' },
  'English (Pickthall)': { language: 'English', translator: 'Pickthall', year: 1930 },
  Charles: { language: 'English', translator: 'R. H. Charles' },
  Whiston: { language: 'English', translator: 'Whiston', year: 1737 },
  'De Sola and Raphall': { language: 'English', translator: 'De Sola and Raphall', year: 1843 },
  Lightfoot: { language: 'English', translator: 'Lightfoot', year: 1891 },
  ANF: { language: 'English', translator: 'Ante-Nicene Fathers', year: 1885 },
  Pusey: { language: 'English', translator: 'Pusey', year: 1838 },
  'Jastrow and Clay': { language: 'English', translator: 'Jastrow and Clay', year: 1920 },
};
function writingText_(t) {
  if (!t) return '';
  const who = t.translator && t.translator !== t.language ? t.translator + (t.year ? ' (' + t.year + ')' : '') : '';
  return [t.language || 'English', who].filter(Boolean).join(', ');
}
/* A LABEL AS AN INDEX SAYS IT ("Macaulay (1890)", "1818 text", "Greek", "English (Andrews)", a language code) → its fields. */
function writingTextOf_(label, lang, year) {
  const s = String(label == null ? '' : label).trim();
  if (WRITING_TEXTS[s]) return WRITING_TEXTS[s];
  const L = WRITING_LANG[lang] || '';
  if (Object.values(WRITING_LANG).indexOf(s) >= 0) return { language: s };
  const m = s.match(/^(Arabic|English|Greek|Hebrew|Latin|Aramaic) \((.+)\)$/);
  if (m) return { language: m[1], translator: m[2] };
  const y = s.match(/\((\d{4})\)/) || s.match(/^(\d{4}) text$/);
  const who = s.replace(/\s*\(\d{4}\)/, '').replace(/^\d{4} text$/, '').replace(/ text$/, '').trim();
  return { language: L || 'English', translator: who, year: y ? Number(y[1]) : (/^first edition/i.test(who) && year ? year : '') };
}

/* ---------- ONE UNIT OF A WRITTEN WORK, whatever loaded it. `o.w` holds the facet set; everything else is the card's own. */
const WRITING_KEYS = ['work', 'book', 'chapter', 'section', 'unit', 'text', 'tradition', 'collection', 'author', 'form'];
/* ONE SPELLING AN ANSWER (520): values equal but for case or apostrophe are one answer, the first spelling kept; a unit is bare. */
const writingFold_ = v => String(v).toLowerCase().replace(/[’‘`']/g, '').replace(/\s+/g, ' ').trim();
const WRITING_SPELT = {};
function writingSpell_(k, v) {
  const by = WRITING_SPELT[k] || (WRITING_SPELT[k] = new Map()), f = writingFold_(v);
  if (!by.has(f)) by.set(f, v);
  return by.get(f);
}
function writingUnit_(src, reg, o) {
  const w = {};
  WRITING_KEYS.forEach(k => {
    const v = o.w[k], one = s => writingSpell_(k, k === 'unit' ? String(s).replace(/^§\s*/, '') : String(s));
    w[k] = Array.isArray(v) ? v.filter(Boolean).map(one) : (v == null || v === '' ? '' : one(v));
  });
  if (!w.work) w.work = reg.work || '';
  WRITING_TITLES.set(spellKey_(w.work), w.work);
  if (!w.collection || (Array.isArray(w.collection) && !w.collection.length)) w.collection = reg.collection || '';
  const subject = reg.topic ? SCRIPTURE_SUBJECT() : (o.subject || SCRIPTURE_SUBJECT());
  return Object.assign({ image: '', row: null, wDate: null }, o, {
    w: w, wSrc: src, shelf: WRITINGS_SHELF, subject: subject, topic: reg.topic || o.topic || '', min_age: writingAge_(reg),
  });
}
/* THE BIBLE'S VERSES ARE TOO MANY TO EACH CARRY A SET (find.js): the same keys, read off `bb` one at a time. */
function bibleW_(x, k) {
  const bb = x.bb;
  switch (k) {
    case 'work': return 'Bible';
    case 'book': return bb.book;
    case 'chapter': return x.ch;
    case 'unit': return x.v;
    case 'text': return bb.text || bb.translation;
    case 'section': return bb.group === 'Deuterocanon' ? '' : bb.group;
    case 'collection': {
      const col = bb.group === 'Deuterocanon' ? WRITING_DEUTERO : bb.testament;
      const more = typeof orthoBibleTags_ === 'function' ? orthoBibleTags_(x).filter(v => v !== col) : [];
      return more.length ? [col].concat(more) : col;
    }
    default: return '';
  }
}
/* A CONTENT CARD ABOUT A WORK IS LINKED, NOT COPIED (520): "Macbeth: characters" answers Work Macbeth beside the play's own cards. */
const WRITING_TITLES = new Map();
function writingLinkOf_(x) {
  if (!x || x.kind !== 'content') return '';
  return WRITING_TITLES.get(spellKey_(String(x.name || '').split(':')[0].trim())) || '';
}
const writingAt_ = (x, k) => (!x ? '' : x.w ? x.w[k] || '' : x.kind === 'bible' && x.bb ? bibleW_(x, k) || ''
  : k === 'work' ? writingLinkOf_(x) : '');
function writingOf_(x) {
  if (!x || !(x.w || (x.kind === 'bible' && x.bb))) return null;
  const w = {};
  WRITING_KEYS.forEach(k => { w[k] = writingAt_(x, k); });
  return w;
}

/* ---------- R4: THE SET A FUNNEL ANSWERS OVER IS FIXED WHEN IT STARTS (520). A source whose index comes later joins at the next
   fresh start (no chip, no words), never under an answered question. */
const WRITING_CAME = {};
function writingCame_(src) {
  WRITING_CAME[src] = true;
  if (typeof stuffForget_ === 'function') stuffForget_();
  if (typeof finderEach_ === 'function') finderEach_(F => { if ($(F.id + '-controls')) paintStuff(true); });
}
const writingNow_ = () => Object.keys(WRITING_CAME).filter(k => WRITING_CAME[k]).sort().join(',');
/* AN ANSWER PRESSED FREEZES THE SET it was pressed over; a kept place restored at boot is not a press, so it still fills in. */
function writingFreeze_() { if (STUFF.admit == null) STUFF.admit = writingNow_(); }
/* WHICH SOURCES THIS FINDER ANSWERS OVER: all that came, until a press; at the start again (no chip, no words) all that came. */
function writingAdmit_() {
  if (!(STUFF.filters || []).length && !String(STUFF.q || '').trim()) STUFF.admit = null;
  return STUFF.admit == null ? writingNow_() : STUFF.admit;
}
const writingAdmitted_ = (x, admit) => !x.wSrc || (',' + admit + ',').indexOf(',' + x.wSrc + ',') >= 0;
