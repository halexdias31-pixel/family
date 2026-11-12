/* A LEVEL CELL AS REAL LEVELS (O1): a comma is a list and `KS3–GCSE` is every rung from one to the other, so the item is
   under each. An unknown word passes through as itself. Self-contained: check/schema.js runs this very function. */
function levelsIn_(cell) {
  const key = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9+]/g, '');
  const find = v => LEVEL_TABLE.find(l => key(l.level) === key(v) || l.says.some(s => key(s) === key(v)));
  const out = [];
  const add = v => { if (v && out.indexOf(v) === -1) out.push(v); };
  /* TWO KNOWN LEVELS JOINED: by a dash, `to` or a slash (a list), or a bare hyphen at any point where both sides are levels. */
  const pair = t => {
    const e = t.split(/\s*[–—/]\s*|\s+-\s+|\s+to\s+/i);
    if (e.length === 2 && find(e[0]) && find(e[1])) return [find(e[0]), find(e[1]), t.indexOf('/') !== -1];
    for (let i = t.indexOf('-'); i > 0; i = t.indexOf('-', i + 1)) {
      const a = find(t.slice(0, i)), b = find(t.slice(i + 1));
      if (a && b) return [a, b, false];
    }
    return null;
  };
  String(Array.isArray(cell) ? cell.join(',') : cell == null ? '' : cell).split(',').forEach(atom => {
    const t = atom.trim();
    if (!t) return;
    const l = find(t);
    if (l) { add(l.level); return; }
    const p = pair(t);
    if (!p) { add(t); return; }
    const [a, b, list] = p;
    /* Only two rungs of the ladder span the levels between; a slash, or an end off the ladder (AS, 11+), is just the two. */
    if (list || !a.rung || !b.rung) { add(a.level); add(b.level); return; }
    const lo = Math.min(a.rung, b.rung), hi = Math.max(a.rung, b.rung);
    LEVEL_TABLE.filter(e => e.rung >= lo && e.rung <= hi).forEach(e => add(e.level));
  });
  return out;
}
/* WHAT LEVEL A THING IS TAUGHT AT, FROM WHICHEVER OF THE TWO COLUMNS HAS IT. § */
/* Every level, as a list (O1); none in either column, its key stage's (`ksFallback_`). */
/* The funnel asks this of every item for every list, and a cell holds one of a few dozen spellings: each is read once. */
const LEVELS_IN = new Map();
const levelsMemo_ = cell => {
  const k = Array.isArray(cell) ? cell.join(',') : String(cell == null ? '' : cell);
  let v = LEVELS_IN.get(k);
  if (!v) { v = Object.freeze(levelsIn_(k)); LEVELS_IN.set(k, v); }
  return v;
};
function levelsOf_(x) {
  const band = (x && x.bandType === 'stage' && x.bandValue) ? String(x.bandValue) : '';
  const own = levelsMemo_(band || (x && x.level) || (x && x.row && x.row.level) || '');
  return own.length ? own : levelsMemo_(ksFallback_(x));
}
/* THE LEVEL FACET'S ANSWER: one level as itself, several as a list (a value per level, like a key stage list). */
function levelOf_(x) {
  const l = levelsOf_(x);
  return l.length > 1 ? l : (l[0] || '');
}

/* WHO MADE A WORKSHEET IS ITS SOURCE, NOT AN EXAM BOARD (O3): a maker's sheet has no board, a board's paper no Source.
   check/schema.js reads this list; backend/digest.gs keeps a copy that check-funnel compares card by card. */
const LIB_SOURCES = ['1st Class Maths', 'Corbettmaths', 'Access Tuition'];
const sourceOf_ = x => LIB_SOURCES.find(s => spellKey_(s) === spellKey_(x && x.company)) || '';
const boardOf_ = x => (sourceOf_(x) ? '' : (x && x.examBoard) || '');

/* ---------- WHICH KEY STAGE A SATs ROW IS, AND ONLY A SATs ROW § */
function satsStagesOf_(x) {
  const yr = (x && x.bandType === 'year') ? Number(x.bandValue) : NaN;
  if (yr >= 1 && yr <= 6) return [yr <= 2 ? 'KS1' : 'KS2'];
  const named = /\bks\s*([12])\b/i.exec(String((x && x.bandType === 'stage' && x.bandValue)
    || (x && x.level) || (x && x.row && x.row.level) || ''));
  if (named) return ['KS' + named[1]];
  const out = [];
  keyStagesOf_(x).forEach(k => {
    const m = /^ks\s*([12])$/i.exec(k);
    if (m && out.indexOf('KS' + m[1]) < 0) out.push('KS' + m[1]);
  });
  return out.sort();
}
/* THE LEVEL AND, INSIDE SATs, THE KEY STAGE BESIDE IT -- `['SATs', 'KS2']`, `['GCSE']` -- for the places that SAY a level rather than filter by it: § */
function levelSaid_(x) {
  const out = [];
  levelsOf_(x).forEach(l => out.push(...(l === 'SATs' ? [l].concat(satsStagesOf_(x)) : [l])));
  return out;
}

/* ---------- A KEY STAGE, SAID AS THE QUALIFICATION AT THE END OF IT § */
/* Off LEVEL_TABLE: the level on the ladder (a rung) whose stages hold it — KS5 is A-Level, not AS. */
function ksLevel_(k) {
  const l = LEVEL_TABLE.find(e => e.rung && e.stages.some(s => spellKey_(s) === spellKey_(k)));
  return l ? l.level : String(k || '');
}
/* The `key_stage` cell as a list — `KS3, KS4` is two key stages, as the facet has always read it. */
function keyStagesOf_(x) {
  return String((x && x.keystage) || '').split(',').map(s => s.trim()).filter(Boolean);
}
/* ---------- WHERE A ROW HAS NO LEVEL, ITS KEY STAGE SAYS ONE § */
function ksFallback_(x) {
  const yr = (x && x.bandType === 'year') ? Number(x.bandValue) : NaN;
  if (yr >= 1 && yr <= 11) return yr <= 6 ? 'SATs' : yr <= 9 ? 'KS3' : 'GCSE';
  const ks = keyStagesOf_(x).filter(k => /^ks[1-5]$/i.test(k)).sort();
  return ks.length ? ksLevel_(ks[ks.length - 1]) : '';
}

function yearOf(x) {
  const own = String((x && x.year) || '').trim();

  /* ---------- THE COLUMN HOLDS DATES, NOT YEARS § */
  const inOwn = own.match(/\b(19|20)\d{2}\b/);
  if (inOwn) return inOwn[0];

  /* A short label that is not a date and not a year — "Spec", "Sample" — is somebody being
     deliberate, so it is kept. Anything long enough to be a sentence is not a year, and passing it
     through is what produced the mess above. */
  if (own && own.length <= 9 && !/\s/.test(own)) return own;

  const m = String((x && x.examWave) || '').match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '';
}

/* THE NAME OF AN EXAM SERIES, FROM THE MONTH IT SAT IN. § */
function seriesOf_(m) {
  /* `MONTH_NAMES` FROM data.js — this file had TWO private copies of the twelve months and games.js
     had a third until somebody deleted it with a note saying why. One list, one place. */
  const MONTH = MONTH_NAMES;
  const n = Number(m);
  if (!isFinite(n) || n < 1 || n > 12) return '';
  if (n >= 5 && n <= 7) return SERIES_SUMMER;
  if (n >= 10 && n <= 12) return SERIES_AUTUMN;
  return MONTH[n - 1];
}

/* THE TWO SEASON WORDS ARE CONSTANTS BECAUSE TWO OTHER PLACES HAVE TO AGREE WITH THEM, and a word spelled out in three files is the fault this whole file is § */
const SERIES_SUMMER = 'Summer';
const SERIES_AUTUMN = 'Autumn';
const SERIES_AT = { Summer: 6, Autumn: 11 };

/* THE WAVE OF A THING, AS A HUMAN WOULD SAY IT. § */
function waveOf(x) {
  const raw = String((x && x.examWave) || '').trim();
  if (!raw) return waveFromDoc_(x);

  const MONTH = MONTH_NAMES;

  /* ---------- A PHASE WORD IS A THIRD SPELLING OF THE SAME THING § */
  const phase = raw.match(/^(first|second|third)\s+wave$/i);
  if (phase) {
    const mth = Number((x && x.month) || (x && x.row && x.row.month) || 0);
    const yr  = yearOf(x);
    const series = seriesOf_(mth) || (/^first$/i.test(phase[1]) ? SERIES_SUMMER : SERIES_AUTUMN);
    return yr ? series + ' ' + yr : raw;
  }

  /* ALREADY A SITTING. "June 2024", "Nov 2023" — somebody typed what they meant. */
  const said = raw.match(/^([A-Za-z]{3,9})\s+((?:19|20)\d{2})$/);
  if (said) {
    const i = MONTH.findIndex(m => m.toLowerCase().startsWith(said[1].toLowerCase().slice(0, 3)));
    return i < 0 ? raw : seriesOf_(i + 1) + ' ' + said[2];
  }

  /* A DATE THAT CAME THROUGH AS TEXT. § */
  const long = raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b[^]*?\b((?:19|20)\d{2})\b/);
  if (long) {
    const i = MONTH.findIndex(m => m.slice(0, 3) === long[1]);
    return i < 0 ? long[2] : seriesOf_(i + 1) + ' ' + long[2];
  }

  const iso = raw.match(/\b((?:19|20)\d{2})-(\d{2})-\d{2}\b/);
  if (iso) {
    return seriesOf_(parseInt(iso[2], 10)) + ' ' + iso[1];
  }

  /* Nothing recognisable but a year in it somewhere — better than the whole string. */
  const bare = raw.match(/\b(19|20)\d{2}\b/);
  return bare ? bare[0] : raw;
}

/* ---------- A PAST PAPER WITH NO SITTING OF ITS OWN TAKES ITS PAPER'S § */
function waveFromDoc_(x) {
  const r = (x && x.row) || x || {};
  const type = String((x && x.documentType) || r.document_type || '').toLowerCase();
  if (type !== 'past paper') return '';
  const doc = docById_(paperIdOf_(r)) || {};
  /* AND THE NAME, WHICH IS WHAT THE COVER PRINTS. § */
  const named = /\s[\u2014\u2013]\s([A-Za-z]{3,9})\s+((?:19|20)\d{2})\s*$/.exec(String(doc.name || r.name || ''));
  const fromName = named ? MONTH_NAMES.findIndex(m => m.toLowerCase().startsWith(named[1].toLowerCase().slice(0, 3))) + 1 : 0;
  const mth = Number((x && x.month) || r.month || doc.month || 0) || fromName;
  const yr = yearOf(x) || String(doc.year || '').trim() || (named ? named[2] : '');
  /* A YEAR WITH NO MONTH IS NOT A SITTING, and it is refused rather than returned bare: § */
  const series = seriesOf_(mth);
  return series && /^(19|20)\d{2}$/.test(yr) ? series + ' ' + yr : '';
}

/* ---------- THE MONTH OF A SITTING, FOR THE `Month` QUESTION § */
const SITTING_MONTH = new WeakMap();
function sittingMonth_(x) {
  if (!x || typeof x !== 'object') return '';
  if (SITTING_MONTH.has(x)) return SITTING_MONTH.get(x);
  let out = '';
  if (sittingOf_(x).year) {
    const r = x.row || x;
    const doc = docById_(paperIdOf_(r)) || {};
    const ofDate = v => { const m = /\b(?:19|20)\d{2}-(\d{2})-\d{2}\b/.exec(String(v || '')); return m ? Number(m[1]) : 0; };
    const ofWord = v => {
      const i = MONTH_NAMES.findIndex(n => n.slice(0, 3).toLowerCase() === String(v || '').slice(0, 3).toLowerCase());
      return i < 0 ? 0 : i + 1;
    };
    const ofName = v => {
      const m = /\s[\u2014\u2013]\s(?:\d{1,2}\s+)?([A-Za-z]{3,9})\s+(?:19|20)\d{2}\s*$/.exec(String(v || ''));
      return m ? ofWord(m[1]) : 0;
    };
    const ofWave = v => {
      const m = /^([A-Za-z]{3,9})\s+(?:19|20)\d{2}$/.exec(String(v || '').trim());
      return m ? ofWord(m[1]) : ofDate(v);
    };
    const n = ofName(doc.name || r.name || x.sub) || Number(r.month || x.month || 0)
      || ofDate(r.exam_date || x.examDate) || Number(doc.month || 0) || ofDate(doc.exam_date)
      || ofWave(x.examWave);
    out = n >= 1 && n <= 12 ? MONTH_NAMES[n - 1] : '';
  }
  SITTING_MONTH.set(x, out);
  return out;
}

/* ---------- THE SITTING IN ITS TWO HALVES, FOR THE TWO QUESTIONS THAT ASK THEM § */
const SITTING_MEMO = new WeakMap();
function sittingOf_(x) {
  if (!x || typeof x !== 'object') return { series: '', year: '' };
  const had = SITTING_MEMO.get(x);
  if (had) return had;
  const w = String(waveOf(x) || '').trim();
  const m = /^(.*\S)\s+((?:19|20)\d{2})$/.exec(w);
  const out = m ? { series: m[1], year: m[2] }
    : /^(19|20)\d{2}$/.test(w) ? { series: '', year: w }
    : { series: w, year: '' };
  SITTING_MEMO.set(x, out);
  return out;
}

/* Numeric-aware, so Grade 2 comes before Grade 10. Plain alphabetical put Grade 10 first, and that
   reads as the list being unsorted rather than sorted by a rule nobody wanted. */
const cmpText = (a, b) =>
  String(a).localeCompare(String(b), 'en', { sensitivity: 'base', numeric: true });

/* `sortsWorthOffering` was here — which orders were worth putting in the dropdown, given what was
   actually on screen. The dropdown is gone, so the question is gone with it. */

/* NO HEADINGS AT ALL, and no grouping behind them. § */

function stuffFind(items, credits) {
  /* ALREADY IN ORDER — see `stuffSorted_`. Filtering keeps it, so nothing below re-sorts. */
  let out = stuffSorted_(items);

  /* THE TWO RULES, in four lines. Filters are grouped by field, and an item must satisfy at least
     one from EVERY group — `some` within a field, `every` across them, which is exactly what
     "either / both" means written out. */
  /* ---------- A SKIPPED QUESTION IS ASKED AND ANSWERED "ANY" § */
  out = stuffNarrow_(out, STUFF.filters, credits);

  /* ONE KEY, then the name to settle ties. § */
  /* BY NAME, AND ONLY BY NAME. § */
  /* ---------- QUESTIONS SORT WITH THEIR PAPER, AND NUMERICALLY § */
  /* ---------- ONE STRING PER ITEM, BUILT ONCE, COMPARED WITH `<` § */
  return out;
}
/* THE NARROWING ITSELF, split out of `stuffFind` so `stuffFiltered` can run it over the list it already has rather than over the whole library — see the note § */
function stuffNarrow_(out, filters, credits) {
  const byField = {};
  filters.forEach(f => {
    if (f.any) return;
    (byField[f.field] = byField[f.field] || []).push(f);
  });
  Object.keys(byField).forEach(field => {
    const list = byField[field], ix = list.length === 1 ? narrowIndex_(out, field) : null;
    out = ix ? (ix.get(spellKey_(list[0].value)) || []) : out.filter(x => list.some(f => filterHit(x, f, credits)));
  });
  return out;
}

const QREF_PART = /^([a-z]?)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/;
/* A PART'S LETTER AND NUMERAL, "d(ii)" and "dii" alike -- a lone numeral is a numeral, as
   `qPartBits_` already says of the sheet's spelling. */
function qRefBits_(s) {
  if (!s) return { letter: '', roman: '' };
  if (ROMAN_ONLY.test(s)) return { letter: '', roman: s };
  const m = QREF_PART.exec(s);
  return m ? { letter: m[1] || '', roman: m[2] || '' } : null;
}
/* ---------- SORTED ONCE, NOT ONCE PER FILTER § */
const SORTED_ITEMS = new WeakMap();
function stuffSorted_(items) {
  let out = SORTED_ITEMS.get(items);
  if (out) return out;
  /* KEYS MADE FOR THE SORT AND LET GO AFTER IT: kept on 280,000 items they were a fifth of the page's memory. */
  const keys = items.map(sortKey_), at = items.map((x, i) => i);
  at.sort((a, b) => (keys[a] < keys[b] ? -1 : keys[a] > keys[b] ? 1 : 0));
  out = at.map(i => items[i]);
  SORTED_ITEMS.set(items, out);
  return out;
}

/* PADDED SO THE ALPHABET AGREES WITH ARITHMETIC. § */
/* ---------- AND THE PAPER ITSELF STRAIGHT AFTER ITS NAME, THEN THE PART BY `qPartKey` § */
/* ---------- CONTENT CARDS AFTER THE REST, IN THE ORDER THEY TEACH — AND FIRST ONLY WHEN THEY ARE ASKED FOR § */
/* A SETTING THAT IS NOT YOURS (shut, greyed) comes after all of yours. */
const sortKey_ = x => [
  isContent_(x) ? '2' + String((x.row && x.row.bookId) || '') + '\u0000' + padNums_(String((x.row && x.row.n) || 0)) : x.mine === false ? '3' : '1',
  padNums_(String(x.sub || x.name || '').toLowerCase()),
  isQ_(x) ? String(paperIdOf_(x.row) || '').toLowerCase() : '',
  padNums_(String(x.qNumber == null ? '' : x.qNumber)),
  x.qPartKey != null ? x.qPartKey : String(x.qPart || '').toLowerCase(),
  padNums_(String(x.name || '').toLowerCase()),
].join('\u0000');

const padNums_ = s => (/\d/.test(s) ? s.replace(/\d+/g, d => ('00000000' + d).slice(-8)) : s);

/* THE FILTERED LIST, held. § */
let FIND_MEMO = { key: null, from: null, items: null, total: 0 };

function stuffFiltered() {
  /* KEYED ON THE PAYLOAD'S IDENTITY, no role (`itemMemoKey_`). § */
  const key = JSON.stringify([STUFF.filters, USER ? USER.credits : -1]);
  /* ---------- AND WHICH LIST, BECAUSE THERE ARE TWO § */
  const all = stuffItems();
  if (FIND_MEMO.key === key && FIND_MEMO.from === DATA && FIND_MEMO.all === all) return FIND_MEMO.items;
  /* RECENT LISTS (940): opening a question re-walks fresh chips: same arrays, tallies. */
  const back = FIND_MEMO.key !== null && (FIND_MEMO.recent || []).find(m => m.key === key && m.from === DATA && m.all === all);
  if (back) return (FIND_MEMO = Object.assign({}, back, { recent: FIND_MEMO.recent })).items;
  const credits = USER ? (USER.credits || 0) : 0;
  /* ---------- A TAP ONLY EVER NARROWS, SO IT NARROWS WHAT IS ALREADY HERE § */
  const prev = FIND_MEMO;
  let items = null;
  /* FROM THE LONGEST LIST ALREADY NARROWED (1100): the last, a recent one, or one warmed in the quiet (`frontWarm_`), so Back then a new answer never re-walks the library. */
  const from = [prev].concat(prev.recent || [], FRONT_WARM.list).filter(m => m && m.key !== null && m.from === DATA && m.all === all && m.credits === credits
    && m.filters && m.filters.length <= STUFF.filters.length).sort((a, b) => b.filters.length - a.filters.length);
  for (const m of from) {
    const same = m.filters.every((f, i) => JSON.stringify(f) === JSON.stringify(STUFF.filters[i]));
    const had = {};
    m.filters.forEach(f => { if (!f.any) had[f.field] = true; });
    const added = STUFF.filters.slice(m.filters.length);
    if (same && added.every(f => f.any || !had[f.field])) { items = stuffNarrow_(m.items, added, credits); break; }
  }
  if (!items) items = stuffFind(all, credits);
  FIND_MEMO = { key: key, from: DATA, items: items, total: all.length, all: all, credits: credits,
                filters: STUFF.filters.map(f => Object.assign({}, f)) };
  FIND_MEMO.recent = [Object.assign({}, FIND_MEMO)].concat(prev.key !== null && prev.from === DATA && prev.all === all ? (prev.recent || []).filter(m => m.key !== key) : []).slice(0, 6);
  return items;
}

/* ---------- THE PAGES, WHICH ARE NOT THE SAME LIST AS THE RESULTS § */
let STUFF_PAGES = { from: null, pages: [] };
/* CARDS ONLY ONCE THE FUNNEL HAS NOTHING LEFT TO ASK (owner, 9 Nov): the last card, no next question, or a door/tile
   that showed these chips (`STUFF.shown`). One rule for every kind; while asking, no card is built. */
const FIND_DONE = new WeakMap();
function findDone_(F) {
  return inFinder_(F || FINDER, () => {
    /* A LOOKED-UP QUESTION IS STILL ASKING (1100), said before the list is narrowed, which is most of a big tap's wait. */
    if (STUFF.shown !== JSON.stringify(STUFF.filters || []) && finderTagsLook_()) return false;
    const items = stuffFiltered(), fkey = JSON.stringify(STUFF.filters || []);
    if (STUFF.shown === fkey || items.length <= 1) return true;
    const m = FIND_DONE.get(items);
    if (m && m.fkey === fkey && m.data === DATA) return m.v;
    let v = true;
    try { v = !finderTagsAt_() && !(nextFacet(items) || overFacet_(items) || (!(STUFF.filters || []).length ? facetBy('kindLabel') : null)); }
    catch (e) { v = true; }
    FIND_DONE.set(items, { fkey: fkey, data: DATA, v: v });
    return v;
  });
}
/* A DOOR OR THE REVEAL TILE SHOWS THE CARDS UNDER THESE CHIPS, until the next chip change. */
function findShow_() { STUFF.shown = JSON.stringify(STUFF.filters || []); }
function stuffPages_() {
  /* ASKED FIRST (1100): while a question is asked no card is built, so the list need not be narrowed yet. */
  if (!findDone_()) return [];
  const items = stuffFiltered();
  if (STUFF_PAGES.from === items) return STUFF_PAGES.pages;
  /* BACK TO A LIST JUST SEEN (slow taps, 8 Nov): its pages are kept with it, as `stuffFiltered` keeps the list. */
  const fkey = JSON.stringify(STUFF.filters || []);
  const seen = (STUFF_PAGES.recent || []).find(r => r.from === items && r.gen === LIB.gen && r.fkey === fkey);
  if (seen) { STUFF_PAGES = Object.assign({}, seen, { recent: STUFF_PAGES.recent }); return seen.pages; }
  const pages = [];
  /* A SHARED STEM DRAWN ONCE (`pageParts_`); A PART BRINGS ITS WHOLE QUESTION (`wholeQuestions_`). § */
  const seq = wholeQuestions_(items), hit = new Set(items);
  /* A PAGE IS KEPT WHEN ITS OWN TAGS AGREE WITH THE CHIPS (396): a chip on a facet with a page reader (`tagOf`) keeps
     the pages carrying it — `Answers` the answer pages, `Questions` the rest. */
  const byPage = (STUFF.filters || []).filter(f => f && !f.any && (facetBy(f.field) || {}).tagOf);
  const kept = (x, part) => byPage.every(f => {
    let v = [];
    try { v = asList_(facetBy(f.field).tagOf(x, part)); } catch (e) { v = []; }
    return !v.length || v.some(t => spellKey_(t) === spellKey_(f.value));
  });
  seq.forEach((x, i) => {
    /* A CARD WHOSE WORDS ARE STILL IN THE LEDGER (397) IS ONE PAGE, kept whatever the chips say: its shape is decided by its
       words, so it is drawn waiting (`slim`) and the column drawn again when they come (`libLanded_`). */
    if (libSlim_(x)) { pages.push({ x: x, part: null, slim: true }); return; }
    /* A QUESTION IS ONE PAGE (960); a part the chips do not keep folds to its label inside it. */
    if (isQ_(x)) {
      if (!pageParts_(x, seq[i - 1]).length) return;
      const k = qId_(x), parts = [];
      for (let j = i; j < seq.length && isQ_(seq[j]) && (j === i || (k && qId_(seq[j]) === k)); j++) parts.push(seq[j]);
      let open = new Set(parts.filter(s => hit.has(s) && kept(s, null)));
      /* ANSWERS CHOSEN: no part is kept as a question, so the parts kept for their answers open, or none would be drawn. */
      if (!open.size) open = new Set(parts.filter(s => hit.has(s) && kept(s, 'ans')));
      if (!open.size && !parts.some(s => kept(s, 'ans'))) return;
      pages.push({ x: x, part: 'q', parts: parts, open: open, ans: parts.some(s => kept(s, 'ans')) });
      return;
    }
    pageParts_(x, seq[i - 1]).forEach(part => {
      if (kept(x, part)) pages.push({ x: x, part: part });
    });
  });
  const keep = { from: items, pages: pages, gen: LIB.gen, fkey: fkey };
  STUFF_PAGES = Object.assign({ recent: [keep].concat((STUFF_PAGES.recent || []).filter(r => r.gen === LIB.gen)).slice(0, 6) }, keep);
  return pages;
}

/* THE ANSWERS WERE ASKED FOR — a chip on the answer pages' own tag — so they are drawn open (`ansOpen_`). */
function answersAsked_() {
  return chipsOn_(STUFF.filters, 'kindLabel').concat(chipsOn_(STUFF.filters, 'kindOwn')).some(f => !f.any && spellKey_(f.value) === spellKey_(ansKind_()));
}

/* ---------- THE LAST LINE UNDER A CHOSEN PAPER COUNTS WHAT THE STRIP HOLDS § */
/* ---------- YOUR RESULT (463): the owner, "attempted / unattempted, correct / incorrect" ---------- */
/* The latest press per question, the account's and this device's (`progressPresses_`), read once per change: a press (`subRecord_`) or a payload bumps it. */
const MY_RESULT = { gen: 0, key: null, from: null, map: null };
function myResults_() {
  const who = typeof whoIs_ === 'function' ? whoIs_() : '';
  if (!who) return null;
  const key = who + '|' + MY_RESULT.gen;
  if (MY_RESULT.key === key && MY_RESULT.from === (DATA && DATA.submissions)) return MY_RESULT.map;
  const map = new Map();
  try { (typeof progressPresses_ === 'function' ? progressPresses_() : []).forEach(p => map.set(p.key, p.v)); } catch (e) { oops_(e, 'find:myResults_') }
  MY_RESULT.key = key; MY_RESULT.from = DATA && DATA.submissions; MY_RESULT.map = map;
  return map;
}
/* ATTEMPTED IS EVERY PRESS; a marked one also says how it went, as Progress scores it (`progressScore_`). */
function myResultOf_(x) {
  if (!isQ_(x)) return '';
  const map = myResults_();
  if (!map) return '';
  const k = String(x.key || x.name || '');
  if (!map.has(k)) return 'Unattempted';
  const sc = typeof progressScore_ === 'function' ? progressScore_(map.get(k)) : null;
  if (!sc) return 'Attempted';
  return ['Attempted', sc.got >= sc.of ? 'Correct' : sc.got <= 0 ? 'Incorrect' : 'Part marks'];
}
/* A PRESS CHANGES IT AT ONCE: every finder forgets what it found, and the tags on the pressed question's own page are said again. */
function myResultNew_(k) {
  MY_RESULT.gen++;
  try { finderForgetFound_(); } catch (e) { oops_(e, 'find:myResultNew_') }
  try {
    const x = stuffItemsAll_().find(i => isQ_(i) && ansKey_(i) === k);
    if (!x) return;
    const tags = asList_(myResultOf_(x)).map(v => `<span class="qtag"${tagAttr_('myResult')} data-f="myResult">${esc(v)}</span>`).join('');
    /* ONLY THE PRESSED PART'S OWN TAG LINE: a whole question's page holds every part's card (`.qb`), and each says its own result. */
    document.querySelectorAll('[data-k]').forEach(b => {
      if (b.getAttribute('data-k') !== k) return;
      const own = b.closest('.qb'), pg = own || b.closest('.page');
      (pg ? (own ? own.querySelectorAll(':scope > .qcard-tags') : pg.querySelectorAll('.qcard-tags')) : []).forEach(row => {
        row.querySelectorAll('[data-f="myResult"]').forEach(t => t.remove());
        row.insertAdjacentHTML('beforeend', tags);
      });
    });
  } catch (e) { /* the tag is right on the next draw */ }
}
/* A QUESTION'S ONE VERIFIED TAG (388; owner 10 Nov): Verified only when the stored accuracy claim AND the type's protocol (qtypes.js) both hold. */
/* ONCE PER QUESTION while its words and the list stand (a walk asks every item at every step); the list by number, so no old list is kept alive. */
function verifyTags_(x) {
  if (!isQ_(x) || !x.row) return { verified: '', acc: false, fn: false };
  const memo = verifyTags_.memo || (verifyTags_.memo = new WeakMap());
  const seen = (typeof LIB !== 'undefined' && LIB ? LIB.gen : 0) + '|' + libWaits_(x.row) + '|' + (typeof ALL_GEN !== 'undefined' ? ALL_GEN : 0), had = memo.get(x);
  if (had && had.seen === seen) return had.r;
  let fn = false;
  /* WORDS STILL IN THE LEDGER (397): the file's `function_verified`, worked out from the whole row when it was split off. */
  if (libWaits_(x.row)) fn = libTrue(x.row.function_verified);
  else try { fn = !qtIncomplete_(x.row).length && qtMachine_(x.row); } catch (e) { fn = false; }
  const acc = !!libTrue(x.row.verified);
  /* AND NOTHING IT POINTS AT IS UNDRAWN (owner, 11 Nov): predicates.js's `figUndrawn_`, the rule js/check-figures.js holds. */
  let used = null;
  try { used = typeof usesOf_ === 'function' ? usesOf_(x) : null; } catch (e) { used = null; }
  const fig = !figUndrawn_(x.row, (x.stems || []).concat(used ? [used] : []));
  const r = { verified: acc && fn && fig ? 'Verified' : 'Not verified', acc, fn, fig };
  memo.set(x, { seen: seen, r: r });
  return r;
}

/* ---------- A SEARCH HIT ON ONE PART BRINGS THE REST OF ITS QUESTION, IN ORDER § */
const qId_ = x => (isQ_(x) && x.qNumber != null && String(x.qNumber) !== ''
  ? paperIdOf_(x.row) + '|' + x.qNumber : '');
const WHOLE_MEMO = new WeakMap();
/* EVERY PART, NOT THE FUNNEL'S (`stuffItemsAll_`): signed out the funnel is Sign in alone, and a shared question drew one part */
function questionParts_() {
  const all = stuffItemsAll_();
  let by = WHOLE_MEMO.get(all);
  if (by) return by;
  by = {};
  /* THE PARTS ALONE ARE SORTED, not the whole library around them: the same order within each question, a tenth of the work. */
  stuffSorted_(all.filter(x => qId_(x))).forEach(x => { const k = qId_(x); (by[k] = by[k] || []).push(x); });
  WHOLE_MEMO.set(all, by);
  return by;
}
function wholeQuestions_(items) {
  const out = [], done = {};
  let by = null;
  (items || []).forEach(x => {
    const k = qId_(x);
    if (!k) { out.push(x); return; }
    by = by || questionParts_();
    const sib = by[k] || [];
    /* A RESULT THE FUNNEL'S LIST DOES NOT HOLD (a harness's own item) stands as itself. */
    if (sib.indexOf(x) < 0) { out.push(x); return; }
    if (done[k]) return;
    done[k] = true;
    sib.forEach(s => out.push(s));
  });
  return out;
}

/* A QUESTION'S PAGE HOLDS EVERY PART OF IT (960). */
const pageHas_ = (pg, x) => !!(pg && x && (pg.x === x || (pg.parts && pg.parts.indexOf(x) >= 0)));
/* WHICH PART TO SCROLL TO when its question's card is filled -- an old link or place named the part. */
let Q_SCROLL_TO = '';
/* THE PAGE AN ITEM STARTS ON, counted from the first result. § */
function stuffPageOf_(x, part) {
  const pages = stuffPages_();
  let i = pages.findIndex(pg => pg.x === x && (pg.part || null) === (part || null));
  if (i < 0) i = pages.findIndex(pg => pageHas_(pg, x));
  return i < 0 ? 0 : i;
}

/* ---------- AND BACK ONTO THE CARD YOU WERE ON WHEN THE LIST UNDER IT CHANGES § */
const stuffPageId_ = pg => (pg && pg.x ? String(pg.x.key || pg.x.name || '') + '\u0000' + (pg.part || '') : '');
const stuffAsk_ = () => JSON.stringify(STUFF.filters || []);
function stuffHeld_() {
  try {
    const host = $('s-' + FINDER.id);
    const el = host && host.querySelectorAll(':scope > .page')[domIndex_(FINDER.id, PAGE[FINDER.id] || 0)];
    const at = el && el.dataset.filled === '1' && el.FIND_AT;
    return at && at.ask === stuffAsk_() ? at.id : '';
  } catch (e) { return ''; }
}
function stuffBackTo_(id, keep) {
  if (!id) return;
  const pages = stuffPages_();
  /* STILL WHERE IT WAS — the commonest case by far (a star, the same list again), and one comparison
     rather than a walk over a list that can be thousands of pages long. */
  if (stuffPageId_(pages[(PAGE[FINDER.id] || 0) - keep]) === id) return;
  const i = pages.findIndex(pg => stuffPageId_(pg) === id);
  if (i >= 0) PAGE[FINDER.id] = keep + i;
}

/* ---------- THE COLLECTION WENT, AND WHAT IT KNEW IS IN THE FACET LIST § */

/* ONE THING TO A PAGE, ALWAYS. § */
const stuffPerPage = () => 1;

/* HOW MANY PAGES, WITHOUT BUILDING ANY OF THEM. § */
/** HAS ANYBODY ASKED FOR ANYTHING YET? A chip pressed. Until then this screen is a question, not a list. */
function stuffAsked() {
  return !!STUFF.filters.length;
}
const S_ = v => String(v == null ? '' : v);

/* ---------- WHERE THE RESULTS START § */
/* ---------- IS THE FUNNEL ASKING ABOUT BOOKING? § */
/* ONE SESSION, OPENED OUT — and it is the receipt and nothing else now, with every action on its foot. § */
/* ---------- "THE PAPER, AND NOTHING ELSE" WAS TRUE WHILE SOMETHING ELSE ADDED THE TILES § */
/* ---------- AND THE TILES ARE ON THE PAPER NOW, NOT UNDER IT § */
/* ---------- AND THE WAY IN, FOR SOMEBODY NOT ON IT, IS IN THE SAME ROW § */
function jobPage_(j) {
  const stage = typeof jobStage_ === 'function' ? jobStage_(j) : '';
  const yes = typeof jobAccepted_ === 'function' ? jobAccepted_(j) : false;
  const admin = typeof isAdmin === 'function' && isAdmin();
  const own = typeof jobOpts_ === 'function' ? tile_(jobOpts_({ row: j })) : '';
  /* ONE CART TILE (owner, 7 Nov): an admin on their own booking already has Pay and confirm, so no Mark as paid beside it. */
  const pays = own.indexOf('job-pay') !== -1;
  const tiles = (typeof jobMsgTiles_ === 'function' ? jobMsgTiles_({ row: j }) : '')
    + own
    /* ---------- AND SHARE, WHICH THE FORM HAD AND THE BOOKING ITSELF DID NOT § */
    + tile_({ icon: 'share', label: 'Share this booking', act: 'book-share' })
    + (typeof suggestOpts_ === 'function' && j && j.id ? tile_(suggestOpts_('session', String(j.id), 'Booking')) : '')
    + (admin && typeof jobAdminOpts_ === 'function' ? tile_(jobAdminOpts_(j, stage, yes && !pays)) : '');
  /* THE REQUEST'S STANDING, one paragraph under the row (488). */
  const said = typeof requestSaid_ === 'function' ? requestSaid_(j) : '';
  const roomOk = j && j.id && (admin || (USER && norm(j.tutor || '') === norm(USER.name)));
  const forms = roomOk ? jobRoomForm_(j) : '';
  const foot = (tiles.trim() ? tileRow_(tiles, 'rc-tiles') : '') + forms
    + (said ? '<p class="note rc-request" role="status">' + esc(said) + '</p>' : '');
  return typeof jobReceipt === 'function' ? jobReceipt(j, foot) : '';
}

/* A BOOKING CLOSED (owner, 9 Nov): tags say what, who, when, the rate and whether it is paid; one line says who and how much in all. */
const rcpTag_ = (t, cls) => (t ? `<span class="qtag${cls ? ' ' + cls : ''}">${esc(t)}</span>` : '');
function rcpWhen_(j) {
  const days = typeof jobDays_ === 'function' ? jobDays_(j).map(i => (typeof DAY3_ !== 'undefined' ? DAY3_[i] : '')).filter(Boolean) : [];
  const t = String(j.time || j.startTime || '').trim(), e = String(j.endTime || j.end || '').trim();
  const day = days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
  return [day, t ? t + (e ? '–' + e : '') : ''].filter(Boolean).join(' ');
}
function rcpPaid_(j) {
  const slots = j.slots || [];
  if (!slots.length) return '';
  return slots.some(sl => /^booked$/i.test(String(sl.status || ''))) ? 'Paid' : slots.some(sl => /^paying$/i.test(String(sl.status || ''))) ? 'Paying' : 'Unpaid';
}
window.KC_FIELDS_MORE = Object.assign(window.KC_FIELDS_MORE || {}, {
  receiptTags: x => { const j = x.row || {}, paid = rcpPaid_(j);
    const rate = Number(j.rate) || (/hour/i.test(String(j.unit || '')) ? Number(j.price) : 0) || 0;
    return `<div class="qtags">${rcpTag_('Booking')}${rcpTag_(j.subject)}${rcpTag_(j.tutor ? displayName_(j.tutor) : '')}${rcpTag_(rcpWhen_(j))}${
      rcpTag_(rate > 0 ? perHour_(rate) : '')}${rcpTag_(paid, paid === 'Unpaid' ? 'is-new' : '')}</div>`; },
  receiptSum: x => { const j = x.row || {};
    const who = (j.slots || []).map(sl => sl && sl.client).filter(Boolean).map(n => displayName_(n)).join(', ') || (j.client ? displayName_(j.client) : '');
    const weeks = Number(j.weeks || (typeof jobDates_ === 'function' ? jobDates_(j).length : 0)) || 0;
    const total = j.price !== '' && j.price != null && isFinite(Number(j.price)) ? money_(Number(j.price)) + ' in all' : '';
    const said = [who, weeks ? weeks + (weeks === 1 ? ' week' : ' weeks') : '', total].filter(Boolean).join(' · ');
    return said ? `<p class="rc-sum">${esc(said)}</p>` : ''; },
});

/* THE FRONT MENU'S ANSWER, read through `DOOR_FIELD` (find-finder.js) — the one name every writer and reader of it uses (1040 friction). */
const forIs_ = want => (STUFF.filters || [])
  .some(f => f.field === DOOR_FIELD && norm(f.value) === want);

function bookingPages_(o) {
  /* ---------- THE COLUMN ASKS FOR IT DIRECTLY § */
  if (!(o && o.column) && !forIs_('booking')) return [];
  /* ---------- THE FORM IS THE ANSWER TO `Booking`, NOT TO EVERYTHING UNDER IT § */
  /* ---------- AND THE COLUMN IS EXEMPT FROM THIS TOO, WHICH IT WAS NOT § */
  const narrowed = (STUFF.filters || []).some(f => f.field !== DOOR_FIELD);
  if (!(o && o.column) && narrowed) return [];
  /* ---------- NOT BEFORE THE PAYLOAD § */
  if (typeof USER !== 'undefined' && USER && typeof awaiting_ === 'function' && awaiting_()) return [loading_()];
  const form = (typeof bookBlocks === 'function' ? bookBlocks() : []).filter(Boolean);
  if (o && o.column) return form;
  /* FIND › BOOKING (owner, 7 Nov): a Book tile on top opens the form in place; the bookings are the cards under it. */
  const top = tileRow_(tile_({ icon: BOOK_OPEN ? 'close' : 'book', label: BOOK_OPEN ? 'Close the form' : 'Book', act: 'book-open', cls: 'primary' }), 'book-top');
  return [top + (BOOK_OPEN || !USER ? (form[0] || '') : '')].concat(form.slice(1));
}
let BOOK_OPEN = false;
/* THE BOOKING FORM TAG: the form itself once that tag is chosen; under plain Booking the Book tile above opens it, so this card only points there. */
function bookFormCard_() {
  const alone = (STUFF.filters || []).some(f => f.field !== DOOR_FIELD);
  if (!alone) return card_(`<div class="book-form-door"><h3>Booking form</h3>${
    tileRow_(tile_({ icon: 'book', label: 'Book', act: 'book-open', cls: 'primary' }), 'book-top')}</div>`);
  if (typeof awaiting_ === 'function' && awaiting_()) return loading_();
  return (typeof bookBlocks === 'function' ? bookBlocks() : [])[0] || '';
}
/* SET THE ROOM, A FORM ON THE RECEIPT from the start (no sheet, owner 7 Nov). */
const jobRoomForm_ = j => `<div class="rc-form room-form">
    <label class="field"><span>the room in the venue — the family sees it</span>
      <input class="room-name" value="${esc(j.room || '')}" autocomplete="off"></label>
    <div class="btn-row">${tile_({ form: true, label: 'Save the room', act: 'job-room', data: { id: String(j.id) } })}</div>
    <p class="note room-said" aria-live="polite"></p></div>`;
on('job-room', el => {
  const f = el.closest('.room-form');
  const room = ((f && (f.querySelector('.room-name') || {}).value) || '').trim();
  const said = f && f.querySelector('.room-said');
  el.disabled = true;
  api({ action: 'setRoom', jobId: el.dataset.id, room, name: USER.name, personId: USER.personId })
    .then(d => {
      if (!d || d.error) { if (said) said.textContent = (d && d.error) || 'Not saved'; el.disabled = false; return; }
      const j = (DATA.liveJobs || DATA.jobs || []).find(x => String(x.id) === String(el.dataset.id));
      if (j) j.room = room;
      toast('Room saved'); repaint();
    })
    .catch(() => { el.disabled = false; toast('Not saved'); });
});
on('book-open', () => { BOOK_OPEN = !BOOK_OPEN; repaint(); });

/* ---------- THE FEED, BEHIND ITS OWN ANSWER § */
function feedPages_() {
  /* POSTS ARE DOOR ITEMS (find-doors.js); the whole feed only stands in when those are switched off, or each post would show twice. */
  if (!forIs_('posts') || typeof postDoorItems_ === 'function') return [];
  return (typeof postsBlocks === 'function' ? postsBlocks() : []).filter(Boolean);
}

/* ---------- SIGNING IN AND OUT, ON A PAGE OF ITS OWN § */
/* ---------- WHICH ROW IS YOU, ASKED IN ONE PLACE § */
function mineIs_(t) {
  /* ---------- AND A STRANGER HAS NO ROW, WHICH THIS DID NOT HAVE TO KNOW BEFORE § */
  if (typeof USER === 'undefined' || !USER) return false;
  /* ---------- AN ID ON BOTH SIDES DECIDES, AND THE NAME IS ONLY FOR A ROW WITHOUT ONE § */
  if (t && USER.personId && t.personId) return String(t.personId) === String(USER.personId);
  return !!t && (
    (USER.handle && t.handle && norm(t.handle) === norm(USER.handle)) ||
    (USER.name && t.title && norm(t.title) === norm(USER.name)) ||
    (USER.name && t.name && norm(t.name) === norm(USER.name)));
}

/* ---------- YOUR OWN ROW, WHEREVER IT COMES FROM § */
function myCardRow_() {
  return (DATA.tutors || []).filter(mineIs_)[0] || {
    /* ---------- THE HANDLE IS PRINTED UNDER THE NAME, SO IT IS NOT SAID IN IT TOO § */
    title: nameBesideHandle_(USER.name, USER.handle) || 'Signed in',
    role:  roleOf(USER.role || 'student'),
    handle: USER.handle,
    /* YOUR PICTURE AS THE PICKER LAST KEPT IT (`USER.profile.photo`, written by `pfpTake_`), else the sign-in reply's. § */
    image: (USER.profile && typeof USER.profile.photo === 'string') ? USER.profile.photo : (USER.image || USER.photo || ''),
    avatar: USER.avatar || '',
    rate:  USER.rate,
    teaches: [],
    personId: USER.personId,
    /* ---------- `dbs` IS DELIBERATELY ABSENT HERE, AND ABSENT IS NOT `false` § */
  };
}

/* YOUR FAMILY AS `doGet` SENT IT, less you; `famMine` only when it was sent for you. */
function accountFamily_() {
  /* ---------- YOUR FAMILY ---------- */
  /* `sibling` ON *"students should be able to see their parents and siblings likewise"*. § */
  const famLabel_ = { parent: 'Your parent', child: 'Your child', sibling: 'Your brother or sister' };
  const famMine = !!(USER.personId && DATA.familyFor && String(DATA.familyFor) === String(USER.personId));
  const family = (famMine && Array.isArray(DATA.family) ? DATA.family : [])
    .filter(f => f && f.personId && f.title && famLabel_[f.relation]
      && !(USER.personId && String(f.personId) === String(USER.personId)));
  return { famLabel_, famMine, family };
}

/* ONE FAMILY MEMBER'S CARD, their tutor row under it when they teach. */
function accountFamCard_(f, famLabel_, personForm_, tcard_) {
  const asTutor = (DATA.tutors || []).find(t => t && t.personId && String(t.personId) === String(f.personId));
  const row = Object.assign({}, asTutor || {}, {
    title: f.title, handle: f.handle || (asTutor || {}).handle, personId: f.personId,
    image: f.image || (asTutor || {}).image || '',
    /* AND THE FIGURE THAT CAME WITH THE FACE — `doGet` sends `avatar` on a family card only when the face is `pfp:avatar` (`faceFig_`). */
    avatar: f.image ? f.avatar : (asTutor || {}).avatar,
    role: famLabel_[f.relation] + (asTutor ? ' · ' + (asTutor.role || 'Tutor') : ''),
  });
  /* A CHILD'S PHOTOGRAPHED WORKING (501), to the parent they accepted; staff see it on the admin's list below. */
  const more = tile_(f.relation === 'child' ? [typeof workSeeOpts_ === 'function' ? workSeeOpts_(f.personId, true) : null,
      typeof workFileOpts_ === 'function' ? workFileOpts_(f.personId) : null] : null)
    + (typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(row)) : '');
  return personMark_(f.personId, personForm_(row) || tcard_(row) + (more ? tileRow_(more, 'person-tiles') : ''));
}

/* FOR AN ADMIN, EVERYBODY ELSE IN THIS COLUMN, each with Message and New PIN. */
function accountEveryone_(col, famIds, personForm_, tcard_) {
  /* ---------- AND FOR AN ADMIN, EVERYBODY ELSE AS WELL, by their main role (`doGet` sends no tutor or admin here) ---------- */
  return (typeof isAdmin === 'function' && isAdmin() && Array.isArray(DATA.everyone) ? DATA.everyone : [])
    .filter(p => p && p.title && !mineIs_(p) && !(p.personId && famIds.indexOf(String(p.personId)) !== -1))
    .filter(p => (/student/i.test(String(p.role || '')) ? 'students' : 'parents') === col)
    /* A BLANK HANDLE IS SAID, NOT FILLED WITH THE FIRST NAME. § */
    .map(p => Object.assign({}, p, { activity: subsLine_(p.personId),
                                     role: (p.role || 'Client') + (p.handle ? '' : ' · no handle yet') }))
    /* AND "NEW PIN" BESIDE "MESSAGE" — the admin is who a child with no email and no linked parent goes to. § */
    /* THROUGH `tileRow_`, which puts six tiles on even lines rather than leaving one alone (453: Parents is narrower company). */
    /* A PERSON'S ROW STANDS ALONE (498): the list's layout row was joined onto the last person's, so one client "has loads of tile options". */
    .map(p => personMark_(p.personId, personForm_(p) || tcard_(p)
      + (typeof tile_ === 'function' ? tileRow_(tile_({ icon: 'chat',
          label: 'Message', note: 'a note to them', act: 'msg-open',
          data: { to: p.title, id: p.personId || '' } }) + (p.personId ? tile_({ icon: 'key',
          label: 'New PIN', note: 'to sign in with', act: 'kid-pin',
          data: { id: p.personId, name: String(p.title || '').split(' ')[0] } }) : '')
          + tile_(isStudentsCol_(col) ? [typeof workSeeOpts_ === 'function' ? workSeeOpts_(p.personId) : null,
            typeof workFileOpts_ === 'function' ? workFileOpts_(p.personId) : null] : null)
          + (typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(p)) : ''), 'person-tiles') : '')));
}

/* YOUR OWN CARD, IN A LIST OF ONE OR NONE. */
function accountMine_(col, family, myRow, tcard_) {
  /* ---------- YOUR OWN CARD, FIRST IN EVERY COLUMN YOU BELONG TO, ITS EDIT THAT FACE'S (`ownCardSections_(col)`) ---------- */
  const mine = [];
  if (typeof peopleBelong_ === 'function' && peopleBelong_(col, family)) {
    const row = isTutorsCol_(col) ? (cardMine_() || myRow) : myRow;
    /* NEVER AN EDITOR HERE (464): your own card is edited on your role's settings column (`ownCardSetPage_`, me.js). */
    const face = row !== myRow ? tcard_(row) : (typeof meCard === 'function' ? meCard(row) : tcard_(row));
    /* SHARE MY PROFILE (400): their own `?tutor=` link, to send a family — on the tutor face. */
    const share = isTutorsCol_(col) && rankAtLeast_('staff') && USER.handle
      ? tile_({ icon: 'share', label: 'Share my profile', note: 'your link', act: 'tutor-share', data: { handle: USER.handle } }) : '';
    /* SHARE only: Edit is on your settings column (464); Sign out and Send the link again on Student settings (453). */
    /* AND REPORT (486): everything has one, your own card too. */
    const tiles = share + (typeof suggestOpts_ === 'function' ? tile_(suggestOpts_('person', String(USER.personId), row.title || '')) : '');
    mine.push(personMark_(USER.personId, face + (tiles ? tileRow_(tiles, 'own-tiles', true) : '')));
  }
  return mine;
}

/* `col` IS THE PEOPLE COLUMN (453): 'tutors', 'students' or 'parents' — a card per person you may already see, by category. */
function accountPages_(col) {
  if (!col) return ['tutors', 'students', 'parents'].reduce((a, c) => a.concat(accountPages_(c)), []);
  if (!USER) return [];
  const myRow = myCardRow_();

  /* ---------- AN ITEM, NOT A ROW, AND THAT IS WHY THE MESSAGE TILE WAS MISSING § */
  /* `account: true` IS WHERE A CARD CAN BE EDITED, and `col` which column: a people column, and nowhere else the same person is drawn. */
  const asItem_ = (t, kind) => ({
    kind: kind || 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
    cost: priced_(t.rate), off: t.listed === false, row: t, account: true, col: col,
    more: typeof peopleOpts_ === 'function' ? tile_(peopleOpts_(t)) : '',
  });

  /* ---------- A CARD OPEN FOR EDITING IS ITS OWN FORM, IN ITS OWN PLACE § */
  const editing_ = t => typeof cardEditing_ === 'function' && cardEditing_(t, col);
  /* AN ADMIN'S PERSON FORM (373, me.js) TAKES THE CARD'S PLACE the same way, in the column it was opened on. */
  const personForm_ = t => typeof personFormFor_ === 'function' ? personFormFor_(t, col) : '';
  const tcard_ = t => typeof findCard === 'function' ? findCard({ kind: 'tutor', row: t }) : '';
  const withTiles_ = t => personForm_(t) || (editing_(t) ? cardEditHtml_(t)
    : tcard_(t) + (typeof cardRow_ === 'function' ? cardRow_(asItem_(t)) : ''));

  const { famLabel_, famMine, family } = accountFamily_();
  const famCard_ = f => accountFamCard_(f, famLabel_, personForm_, tcard_);
  /* A CHILD OR A BROTHER OR SISTER IS A STUDENT; A PARENT IS A PARENT. A family member who teaches is on Tutors as well. */
  const famIn = c => family.filter(f => (f.relation === 'parent' ? 'parents' : 'students') === c);
  const famIds = family.map(f => String(f.personId));

  const everyone = accountEveryone_(col, famIds, personForm_, tcard_);

  const mine = accountMine_(col, family, myRow, tcard_);

  const coming = typeof awaiting_ === 'function' && awaiting_() ? [loading_()] : [];
  /* "+ ADD A …", the very first card for an admin (373, 440), the new person's role ticked for this column. */
  const add = typeof peopleAddPage_ === 'function' ? [peopleAddPage_(col)].filter(Boolean) : [];
  const fam = famIn(col).map(famCard_);
  /* THE SEARCH CARD (442): Students only; the other columns move into Find (770). */
  const search = typeof peopleSearchPage_ === 'function' ? [peopleSearchPage_(col)].filter(Boolean) : [];
  let out;
  if (isTutorsCol_(col)) {
    /* THE DIRECTORY EVERYBODY SIGNED IN READS, less you (your card is above). */
    const others = (DATA.tutors || []).filter(t => t && t.title && !mineIs_(t)).map(t => personMark_(t.personId, withTiles_(t)));
    /* EACH LIST A CARD OF ITS OWN (465): the admin's layout tiles go on the list, not on each person. */
    out = cardMark_('ppl:tutors:add', add).concat(cardMark_('ppl:tutors:dir', mine.concat(others)));
  } else if (isStudentsCol_(col)) {
    /* FIND BY HANDLE ON TOP (442), then you, your brothers, sisters and children, then MANAGE YOUR CHILD (339) — the owner:
       "each user can edit their student people in student column". */
    const manage = typeof mayAddChild_ === 'function' && mayAddChild_() && typeof childManageCard_ === 'function' ? [childManageCard_()] : [];
    /* NEEDS HELP (455) ABOVE ALL, for Staff — help.js `HELP_COL` names this column. */
    const help = typeof helpListCard_ === 'function' ? [helpListCard_()].filter(Boolean) : [];
    out = cardMark_('ppl:students:help', help).concat(cardMark_('ppl:students:add', add), cardMark_('ppl:students:search', search),
      cardMark_('ppl:students:family', mine.concat(fam)), cardMark_('ppl:students:manage', manage), cardMark_('ppl:students:all', everyone));
  } else {
    /* A PARENT'S CLAIM ("X says they are your parent") is answered here, by the child. */
    const claims = (famMine && Array.isArray(DATA.claims) && typeof claimCard_ === 'function')
      ? DATA.claims.filter(c => c && c.rowIndex && c.from).map(claimCard_) : [];
    out = cardMark_('ppl:parents:add', add).concat(cardMark_('ppl:parents:you', mine), cardMark_('ppl:parents:claims', claims),
      cardMark_('ppl:parents:family', fam), cardMark_('ppl:parents:all', everyone));
  }
  return out.concat(coming);
}

/* ---------- HOW A LEARNER IS GETTING ON, IN ONE LINE UNDER THEIR NAME § */
function subsLine_(pid) {
  try {
    const a = DATA && DATA.submissions;
    if (!pid || !a || !a.people || !USER || String(a.for || '') !== String(USER.personId || '')) return '';
    const p = a.people[String(pid)];
    if (!p || !(Number(p.n) > 0)) return '';
    const last = subDayText_(p.last);
    return Number(p.n) + (Number(p.n) === 1 ? ' question' : ' questions') + (last ? ' · last ' + last : '');
  } catch (e) { return ''; }
}
/* A submission's day, DD/MM/YY like every date (owner, 8 Nov). */
function subDayText_(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso || '')) ? date_(iso) : '';
}

/* THE PEOPLE COLUMNS (453); `peoplePages_` (me.js) adds the signed-out card and the empty one. Student settings is `studentSetPages_`. */
screen('tutors', () => pages('tutors', typeof cardsOf_ === 'function' ? cardsOf_('tutors') : peoplePages_('tutors')));
screen('students', () => pages('students', typeof cardsOf_ === 'function' ? cardsOf_('students') : peoplePages_('students')));
screen('parents', () => pages('parents', typeof cardsOf_ === 'function' ? cardsOf_('parents') : peoplePages_('parents')));

/** Everything spliced between the question and the results, whichever answer is showing. */
/* THE BUNDLE IS THE LAST OF THEM — see `bundlePages_`. § */
/* THE BOUND FINDER'S, since there are two (`FINDERS`): § */
function frontPages_() {
  return FINDER.front();
}

/* A BUNDLE — THE PAPERS ON THE SCREEN, AS ONE THING YOU CAN ORDER. § */
const BUNDLE_MIN = 2;
