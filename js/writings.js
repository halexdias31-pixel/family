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
  /* QURAN OR HADITH FIRST (owner, 6 Nov): two collections, asked before the six books. */
  quran: { work: 'Quran', topic: 'Islam', collection: 'Quran' },
  hadith: { topic: 'Islam', collection: 'Hadith' },
  talmud: { work: 'Talmud', topic: 'Judaism', collection: 'Rabbinic' },
  'texts:apocrypha': { work: 'Bible', topic: 'Christianity' },
  /* JUDAISM BY WHAT A WORK IS (600): Rabbinic, Second Temple, Kabbalah — asked as Collection before Work, as Christianity's are. */
  'texts:enoch': { topic: 'Judaism', collection: 'Second Temple' }, 'texts:jubilees': { topic: 'Judaism', collection: 'Second Temple' },
  'texts:josephus': { topic: 'Judaism', collection: 'Second Temple' },
  'texts:mishnah': { topic: 'Judaism', collection: 'Rabbinic' }, 'texts:mishnah-en': { topic: 'Judaism', collection: 'Rabbinic' },
  'texts:zohar': { topic: 'Judaism', collection: 'Kabbalah' },
  'texts:fathers-grc': { topic: 'Christianity', collection: 'Apostolic Fathers' }, 'texts:fathers-en': { topic: 'Christianity', collection: 'Apostolic Fathers' },
  'texts:justin-en': { topic: 'Christianity', collection: 'Church Fathers' }, 'texts:justin-grc': { topic: 'Christianity', collection: 'Church Fathers' },
  'texts:confessions': { topic: 'Christianity', collection: 'Church Fathers' },
  'texts:desert-en': { topic: 'Christianity', collection: 'Desert Fathers' },
  'texts:gilgamesh': { topic: 'Mesopotamian religion' },
  'works:WR-0001': { topic: 'Christianity', collection: 'Apostolic Fathers' },
  'works:WR-0002': { topic: 'Judaism', collection: 'Second Temple' },
  orthodox: { topic: 'Christianity' },
  /* ANCIENT EGYPT (546): Budge's translations of the Egyptian legends of Horus, Isis and Osiris, and Plutarch's Isis and Osiris. */
  'pdtexts:TX-0085': { topic: 'Ancient Egyptian religion' }, 'pdtexts:TX-0086': { topic: 'Ancient Egyptian religion' },
  hymns: { topic: 'Christianity', collection: 'Hymns' },
};
const writingWork_ = (src, id) => WRITING_WORKS[src + ':' + id] || WRITING_WORKS[src] || {};

/* WHETHER A SOURCE IS FETCHED: always — no age gates on learning (1040); kept as the one hook every source asks. */
const writingFor_ = () => true;

/* TEXT IS BUILT, NEVER WRITTEN (520): "<language>, <translator> (<year>)" from structured fields, keyed by what each index calls it. */
const WRITING_LANG = { en: 'English', he: 'Hebrew', hbo: 'Hebrew', grc: 'Greek', ar: 'Arabic', arc: 'Aramaic', la: 'Latin', akk: 'Akkadian' };
/* THE SOURCE TEXT IS A TEXT'S BASE (529: "pick Bible, then original text like LXX or MT, then translation"): what it was made
   from, by Collection where its testaments came from different originals; an original is its own base. */
const WRITING_MT = 'Hebrew Masoretic Text', WRITING_LXX = 'Greek Septuagint', WRITING_GNT = 'Greek New Testament';
/* A SOURCE TEXT IS A TEXT, NEVER A BARE LANGUAGE (546): the Quran's original is the Arabic Quran, as the Bible's is the Masoretic Text. */
const WRITING_QURAN = 'Arabic Quran';
const WRITING_BIBLE_BASE = { 'Old Testament': WRITING_MT, 'New Testament': WRITING_GNT, [WRITING_DEUTERO]: WRITING_LXX };
const WRITING_TEXTS = {
  KJV: { language: 'English', translator: 'King James Version', year: 1611, base: WRITING_BIBLE_BASE },
  WEB: { language: 'English', translator: 'World English Bible', year: 2000, base: WRITING_BIBLE_BASE },
  HBO: { language: 'Hebrew', base: WRITING_MT },
  LXX: { language: 'Greek', base: WRITING_LXX },
  BRENTON: { language: 'English', translator: 'Brenton', year: 1851, base: WRITING_LXX },
  GNT: { language: 'Greek', translator: 'Robinson–Pierpont', year: 2018, base: WRITING_GNT },
  'Arabic (Tanzil)': { language: 'Arabic', translator: 'Tanzil', base: WRITING_QURAN },
  'English (Pickthall)': { language: 'English', translator: 'Pickthall', year: 1930, base: WRITING_QURAN },
  /* THE TALMUD'S ONE TEXT (talmud.js): the Vilna Bavli; a Yerushalmi would be a Text of its own with its own base. */
  'Talmud Bavli': { language: 'Hebrew and Aramaic', base: 'Babylonian Talmud (Bavli)' },
  Charles: { language: 'English', translator: 'R. H. Charles' },
  Whiston: { language: 'English', translator: 'Whiston', year: 1737 },
  'De Sola and Raphall': { language: 'English', translator: 'De Sola and Raphall', year: 1843 },
  Lightfoot: { language: 'English', translator: 'Lightfoot', year: 1891 },
  ANF: { language: 'English', translator: 'Ante-Nicene Fathers', year: 1885 },
  Pusey: { language: 'English', translator: 'Pusey', year: 1838 },
  'Jastrow and Clay': { language: 'English', translator: 'Jastrow and Clay', year: 1920 },
};
/* A TEXT AS TWO ANSWERS (546): "Greek should be a tag not merged with the version" — its language, and whose translation it is. */
/* An original has no translation ('', its language alone). Read off the one built label, so every loader splits the same way. */
const writingLanguageOf_ = s => { const t = String(s || ''), i = t.indexOf(', '); return i > 0 ? t.slice(0, i) : t; };
const writingVersionOf_ = s => { const t = String(s || ''), i = t.indexOf(', '); return i > 0 ? t.slice(i + 2) : ''; };
/* THE LANGUAGES A TEXT IS WRITTEN IN, as `writingText_` says them — what the Language facet may hold and nothing else may. */
const WRITING_LANGUAGES = Object.values(WRITING_LANG).concat(['Hebrew and Aramaic', 'Syriac', 'Coptic', 'Egyptian', 'Old English', 'Middle English']);
function writingText_(t) {
  if (!t) return '';
  const who = t.translator && t.translator !== t.language ? t.translator + (t.year ? ' (' + t.year + ')' : '') : '';
  return [t.language || 'English', who].filter(Boolean).join(', ');
}
/* A TEXT'S SOURCE, from its key or the Text as built ("English, King James Version (1611)"), and its Collection where the base is by testament. */
let WRITING_BUILT = null;
function writingSourceOf_(text, collection) {
  if (!WRITING_BUILT) { WRITING_BUILT = {}; Object.keys(WRITING_TEXTS).forEach(k => { WRITING_BUILT[writingText_(WRITING_TEXTS[k])] = WRITING_TEXTS[k]; }); }
  const t = WRITING_TEXTS[text] || WRITING_BUILT[text], b = t && t.base;
  if (!b) return '';
  return typeof b === 'string' ? b : b[[].concat(collection)[0]] || '';
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
const WRITING_KEYS = ['work', 'source', 'book', 'chapter', 'section', 'unit', 'text', 'tradition', 'collection', 'author', 'form', 'primacy'];
/* PRIMARY OR SECONDARY SOURCE (owner, 7 Nov): an original text is Primary, a later study of it Secondary. */
/* Every work is Primary but those named here; one too unclear to call carries no tag (docs/history/1120). */
const WRITING_SECONDARY = ['Schaff, History of the Christian Church, vol. 1: Apostolic Christianity, AD 1–100',
  'Schaff, History of the Christian Church, vol. 2: Ante-Nicene Christianity, AD 100–325',
  'Schaff, History of the Christian Church, vol. 3: Nicene and Post-Nicene Christianity, AD 311–600',
  'Schaff, History of the Christian Church, vol. 4: Mediaeval Christianity, AD 590–1073'];
const WRITING_UNCLEAR = ['Modern Texts (GCSE)'];
const writingPrimacy_ = work => (WRITING_UNCLEAR.indexOf(work) >= 0 ? '' : WRITING_SECONDARY.indexOf(work) >= 0 ? 'Secondary' : 'Primary');
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
  if (!w.source) w.source = writingSourceOf_(w.text, w.collection);
  if (!w.primacy) w.primacy = writingPrimacy_(w.work);
  const subject = reg.topic ? SCRIPTURE_SUBJECT() : (o.subject || SCRIPTURE_SUBJECT());
  return Object.assign({ image: '', row: null, wDate: null }, o, {
    w: w, wSrc: src, shelf: WRITINGS_SHELF, subject: subject, topic: reg.topic || o.topic || '',
  });
}
/* THE BIBLE'S VERSES ARE TOO MANY TO EACH CARRY A SET (find.js): the same keys, read off `bb` one at a time. */
function bibleW_(x, k) {
  const bb = x.bb;
  switch (k) {
    case 'work': return 'Bible';
    case 'primacy': return 'Primary';
    case 'book': return bb.book;
    case 'chapter': return x.ch;
    case 'unit': return x.v;
    case 'text': return bb.text || bb.translation;
    case 'source': return writingSourceOf_(bb.text || bb.translation, bb.group === 'Deuterocanon' ? WRITING_DEUTERO : bb.testament);
    case 'section': {
      const g = bb.group === 'Deuterocanon' ? '' : bb.group, k = typeof orthoKathisma_ === 'function' ? orthoKathisma_(x) : '';
      return k ? [g, k].filter(Boolean) : g;
    }
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
/* A WRITING'S RELIGION (546) is its registry topic (Christianity, Judaism, Islam): "why is religion not coming up" — Topic holds hundreds of answers. */
const writingAt1_ = (x, k) => (!x ? '' : k === 'religion' ? ((x.w || (x.kind === 'bible' && x.bb)) && x.topic) || ''
  : x.w ? x.w[k] || '' : x.kind === 'bible' && x.bb ? bibleW_(x, k) || ''
  : k === 'work' ? writingLinkOf_(x) : '');
/* A SOURCE TEXT TWO TRADITIONS HOLD (660): "where's the bible here?" under Judaism — the Masoretic Text in its own Hebrew is the
   Old Testament's original and Judaism's Tanakh, so those cards answer both. */
const WRITING_HELD = { [WRITING_MT]: { work: 'Bible', religion: 'Judaism', collection: 'Tanakh' } };
function writingAt_(x, k) {
  const v = writingAt1_(x, k);
  if (k !== 'religion' && k !== 'collection') return v;
  const also = WRITING_HELD[writingAt1_(x, 'source')];
  /* THE ORIGINAL ONLY: a text with a translator (KJV's Old Testament) is a translation of it, not it. */
  if (!also || !also[k] || writingAt1_(x, 'work') !== also.work || writingVersionOf_(writingAt1_(x, 'text'))) return v;
  const had = [].concat(v || []);
  /* A COLLECTION IS NAMED BY THE RELIGION ASKED (770): under Judaism the Masoretic books are the Tanakh and never the Old Testament;
     under Christianity the other way; with no religion chosen, both. */
  if (k === 'collection') {
    const rel = writingReligionAsked_();
    if (rel && spellKey_(rel) === spellKey_(also.religion)) return also[k];
    if (rel) return v;
  }
  return had.indexOf(also[k]) === -1 ? had.concat(also[k]) : v;
}
/* THE RELIGION THIS FINDER'S FUNNEL HAS ANSWERED (not Any), or ''. */
function writingReligionAsked_() {
  try { const f = (STUFF.filters || []).find(g => g && g.field === 'wReligion' && !g.any); return f ? String(f.value || '') : ''; } catch (e) { return ''; }
}
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
  /* EIGHT SOURCES LANDING TOGETHER ARE ONE REPAINT, of the finder in front only (561, U4); the other is marked and the builder draws it ahead. */
  if (WRITING_PAINT) return;
  WRITING_PAINT = setTimeout(() => {
    WRITING_PAINT = 0;
    if (typeof finderEach_ === 'function') finderEach_(F => {
      if (!$(F.id + '-controls')) return;
      if (F.id === AT) paintStuff(true); else markStale_(F.id);
    });
  }, 0);
}
let WRITING_PAINT = 0;
const writingNow_ = () => Object.keys(WRITING_CAME).filter(k => WRITING_CAME[k]).sort().join(',');
/* AN ANSWER PRESSED FREEZES THE SET it was pressed over; a kept place restored at boot is not a press, so it still fills in. */
function writingFreeze_() { if (STUFF.admit == null) STUFF.admit = writingNow_(); }
/* WHICH SOURCES THIS FINDER ANSWERS OVER: all that came, until a press; at the start again (no chip, no words) all that came. */
function writingAdmit_() {
  if (!(STUFF.filters || []).length) STUFF.admit = null;
  return STUFF.admit == null ? writingNow_() : STUFF.admit;
}
const writingAdmitted_ = (x, admit) => !x.wSrc || (',' + admit + ',').indexOf(',' + x.wSrc + ',') >= 0;
/* WHETHER ANY SOURCE'S INDEX IS STILL ON ITS WAY (546) — every loader keeps `asking` on its own state, read here as one list. */
const writingAsking_ = () => [BIBLE, TALMUD, QURAN, HADITH, WORKS, TEXTS, PDTEXTS, ORTHO, HYMNS].some(S => S && S.asking);
