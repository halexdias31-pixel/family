/* A LEVEL CELL AS REAL LEVELS (O1): a comma is a list and `KS3–GCSE` is every rung from one to the other, so the item is
   under each. An unknown word passes through as itself. Self-contained: check/library-schema.js runs it. */
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
   check/library-schema.js reads this list; backend/digest.gs keeps a copy that check-funnel compares card by card. */
const LIB_SOURCES = ['1st Class Maths', 'Corbettmaths', 'Access Tuition', 'GL Assessment', 'Physics & Maths Tutor', '@family'];
const sourceOf_ = x => LIB_SOURCES.find(s => spellKey_(s) === spellKey_(x && x.company)) || '';
/* A SOURCE WHOSE SETS ARE ONE BOARD'S OWN QUESTIONS BY TOPIC keeps that board (owner, 24 Nov: Physics & Maths Tutor's AQA topic sets are AQA). */
const LIB_BOARD_SOURCES = ['Physics & Maths Tutor', '@family'];
const boardOf_ = x => (sourceOf_(x) && LIB_BOARD_SOURCES.indexOf(sourceOf_(x)) === -1 ? '' : (x && x.examBoard) || '');

/* ---------- WHICH KEY STAGE A SATs ROW IS, AND ONLY A SATs ROW § */
function satsStagesOf_(x) {
  /* ONLY A SATs ROW (owner, as its note says): a KS3 sheet taught across `KS2, KS3` keeps both (unify batch 7, the email's rule). */
  if (levelsOf_(x).indexOf('SATs') === -1) return [];
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
/* A KEY STAGE FOLLOWS FROM ITS LEVEL (owner, 17 Nov, N-20261117-alevelks4): once a level is chosen, a row's key stages are the
   chosen levels' (settings.json `levels`) — a row taught KS3 to A-Level is KS5 under A-Level — so a facet with one sensible answer is skipped. */
function keyStagesAt_(x) {
  const chosen = ((typeof STUFF !== 'undefined' && STUFF && STUFF.filters) || []).filter(f => f && f.field === 'level' && !f.any).map(f => spellKey_(f.value));
  const own = keyStagesOf_(x);
  if (!chosen.length) return own;
  const st = [].concat(...LEVEL_TABLE.filter(l => chosen.indexOf(spellKey_(l.level)) !== -1).map(l => l.stages));
  if (!st.length) return own;
  /* a row with its own key stages keeps those the level holds; one with none takes its level's, where the level has just one */
  return own.length ? own.filter(k => st.indexOf(k) !== -1) : st.length === 1 ? st : [];
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
  /* ONE QUESTION SET (UNIFY item 3): a board's set has a sitting, read off its board tag, not a kind of its own. */
  if (!String((x && x.examBoard) || r.exam_board || '').trim()) return '';
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

/* ANY ITEM'S OWN DATE, as { month, day } (owner, 15 Nov): an ISO date (date, exam_date), else a name ending "— 5 October" (a 5-a-day). */
/* The `Month` and `Day` questions read it, so no kind needs its own date facet. */
const ITEM_DATE = new WeakMap();
function itemDate_(x) {
  if (!x || typeof x !== 'object') return {};
  if (ITEM_DATE.has(x)) return ITEM_DATE.get(x);
  const r = x.row || x;
  const iso = /^\s*(?:19|20)\d{2}-(\d{2})-(\d{2})\b/.exec(String(r.date || x.date || r.exam_date || x.examDate || ''));
  const named = /\s[\u2014\u2013]\s(\d{1,2})\s+([A-Za-z]{3,9})\s*$/.exec(String(r.name || x.name || ''));
  const mi = iso ? Number(iso[1]) : named ? MONTH_NAMES.findIndex(n => n.slice(0, 3).toLowerCase() === named[2].slice(0, 3).toLowerCase()) + 1 : 0;
  const day = iso ? Number(iso[2]) : named ? Number(named[1]) : 0;
  const out = mi >= 1 && mi <= 12 && day >= 1 && day <= 31 ? { month: MONTH_NAMES[mi - 1], day: String(day) } : {};
  ITEM_DATE.set(x, out);
  return out;
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
    const own = ofName(doc.name || r.name || x.sub) || Number(r.month || x.month || 0)
      || ofDate(r.exam_date || x.examDate) || Number(doc.month || 0) || ofDate(doc.exam_date)
      || ofWave(x.examWave);
    /* ONE SITTING, ONE MONTH (owner, 16 Nov): AQA's June 2024 sat Paper 1 on 23 May, so it was filed under May and
       Paper 2 under June; Month = June then hid Paper 1, and only Paper-before-Month reached it. The month a series
       is named by is its last: every paper of the same subject, board, level, year and series answers that. */
    const n = Math.max(own, sittingLastMonth_(Object.assign({}, doc, r), sittingOf_(x).year, own) || 0);
    out = n >= 1 && n <= 12 ? MONTH_NAMES[n - 1] : '';
  }
  SITTING_MONTH.set(x, out);
  return out;
}

/* THE LAST MONTH OF EACH SITTING, from the document rows: subject|board|level|year|series → the latest month any of its papers names. */
const SITTING_LAST = new WeakMap();
function sittingKey_(r, year, m) {
  const ser = seriesOf_(m);
  const lc = v => String(v || '').trim().toLowerCase();
  return ser && year ? [lc(r.subject), lc(r.exam_board || r.company), lc(r.level || r.band_value), String(year).trim(), lc(ser)].join('|') : '';
}
function sittingLastMonth_(r, year, m) {
  const rows = typeof libDocRows_ === 'function' ? libDocRows_() : [];
  let map = SITTING_LAST.get(rows);
  if (!map) {
    map = {};
    rows.forEach(d => {
      if (!libIsDoc_(d) || !String(d.exam_board || '').trim()) return;
      const nm = /\s[\u2014\u2013]\s(?:\d{1,2}\s+)?([A-Za-z]{3,9})\s+((?:19|20)\d{2})\s*$/.exec(String(d.name || ''));
      const byName = nm ? MONTH_NAMES.findIndex(w => w.slice(0, 3).toLowerCase() === nm[1].slice(0, 3).toLowerCase()) + 1 : 0;
      const iso = /\b(?:19|20)\d{2}-(\d{2})-\d{2}\b/.exec(String(d.exam_date || ''));
      const mm = byName || Number(d.month || 0) || (iso ? Number(iso[1]) : 0);
      const k = sittingKey_(d, String(d.year || '').trim() || (nm ? nm[2] : ''), mm);
      if (k && mm > (map[k] || 0)) map[k] = mm;
    });
    SITTING_LAST.set(rows, map);
  }
  const k = sittingKey_(r, year, m);
  return k ? map[k] || 0 : 0;
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
/* ONE YEAR QUESTION (step 9, 22 Nov): a paper's sitting year, else a bout's year — one `Year`, as `Month` and `Day` already read any item's date. */
function itemYear_(x) { return sittingOf_(x).year || boutDate_(x).year || ''; }

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
/* A SETTING THAT IS NOT YOURS (shut, greyed) comes after all of yours; one marked `first` (the admin's lens) before them all. */
/* AN ITEM IN A PLANNED ORDER (`seq`: the docket's Now, Next, dkPlan_) keeps that order under its list, before its name is asked. */
const sortKey_ = x => [
  x.first ? '0' : isContent_(x) ? '2' + String((x.row && x.row.bookId) || '') + '\u0000' + padNums_(String((x.row && x.row.n) || 0)) : x.mine === false ? '3' : '1',
  padNums_(String(x.sub || x.name || '').toLowerCase()) + (x.seq != null ? '\u0001' + padNums_(String(x.seq)) : ''),
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
    const G = facetBy(f.field);
    try { v = asList_(G.tagOf(x, part)); } catch (e) { v = []; }
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
      /* AND THEN ONLY THEIR ANSWERS ARE DRAWN (owner, 18 Nov: "it should only show answers"): no question words, no answer box (`only`). */
      let only = false;
      if (!open.size) { open = new Set(parts.filter(s => hit.has(s) && kept(s, 'ans'))); only = open.size > 0; }
      if (!open.size && !parts.some(s => kept(s, 'ans'))) return;
      pages.push({ x: x, part: 'q', parts: parts, open: open, ans: parts.some(s => kept(s, 'ans')), only: only });
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
/* ONE STATUS SET, ONE MENU (owner, 23 Nov, UNIFY item 4; was Attempted / Unattempted and Correct / Incorrect / Part marks):
   the signed-in person's latest answer, Not tried / Right / Part right / Wrong, by `statusOf_` and its words. */
/* TWO MENUS (owner, 25 Nov): whether the signed-in person has attempted the part, and, attempted and marked, its result */
function myStatus_(x) {
  if (!isQ_(x)) return '';
  const map = myResults_(), k = String(x.key || x.name || '');
  if (!map) return '';
  return map.has(k) ? statusOf_(map.get(k)) : 'untried';
}
function myTriedOf_(x) { const s = myStatus_(x); return s ? statusWord_(s === 'untried' ? 'untried' : 'attempted') : ''; }
function myResultOf_(x) { const s = myStatus_(x); return s === 'right' || s === 'part' || s === 'wrong' ? statusWord_(s) : ''; }
/* A PRESS CHANGES IT AT ONCE: every finder forgets what it found, and the tags on the pressed question's own page are said again. */
function myResultNew_(k) {
  MY_RESULT.gen++;
  try { finderForgetFound_(); } catch (e) { oops_(e, 'find:myResultNew_') }
  try {
    const x = stuffItemsAll_().find(i => isQ_(i) && ansKey_(i) === k);
    if (!x) return;
    const tags = [['myTried', myTriedOf_(x)], ['myResult', myResultOf_(x)]].flatMap(([f, v]) => asList_(v).map(t => qtag_(esc(t), tagAttr_(f) + ' data-f="' + f + '"'))).join('');
    /* ONLY THE PRESSED PART'S OWN TAG LINE: a whole question's page holds every part's card (`.qb`), and each says its own result. */
    document.querySelectorAll('[data-k]').forEach(b => {
      if (b.getAttribute('data-k') !== k) return;
      const own = b.closest('.qb'), pg = own || b.closest('.page');
      /* THE ANSWER CARD UNDER A PART is the scheme's, not your result's. */
      (pg ? (own ? own.querySelectorAll(':scope > .kc-tags > .qcard-tags') : pg.querySelectorAll('.qcard-tags')) : []).forEach(row => {
        if (row.closest('.qans-card')) return;
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
  const admin = typeof may_ === 'function' && may_('admin');
  const own = typeof jobOpts_ === 'function' ? tile_(jobOpts_({ row: j })) : '';
  /* ONE CART TILE (owner, 7 Nov): an admin on their own booking already has Pay and confirm, so no Mark as paid beside it. */
  const pays = own.indexOf('job-pay') !== -1;
  const tiles = (typeof jobMsgTiles_ === 'function' ? jobMsgTiles_({ row: j }) : '')
    + own
    /* ---------- AND SHARE, WHICH THE FORM HAD AND THE BOOKING ITSELF DID NOT § */
    + tile_({ icon: 'share', label: text_('share-this-booking'), act: 'book-share' })
    + (typeof suggestOpts_ === 'function' && j && j.id ? tile_(suggestOpts_('session', String(j.id), 'Booking')) : '')
    + (admin && typeof jobAdminOpts_ === 'function' ? tile_(jobAdminOpts_(j, stage, yes && !pays)) : '');
  /* THE REQUEST'S STANDING, one paragraph under the row (488). */
  const said = typeof requestSaid_ === 'function' ? requestSaid_(j) : '';
  const roomOk = j && j.id && (admin || (USER && norm(j.tutor || '') === norm(USER.name)));
  const forms = roomOk ? jobRoomForm_(j) : '';
  const foot = (tiles.trim() ? tileRow_(tiles, 'rc-tiles') : '') + forms
    + (said ? cardBlock_({ type: 'group', tag: 'p', look: 'note rc-request', attrs: { role: 'status' }, text: said }) : '');
  return typeof jobReceipt === 'function' ? jobReceipt(j, foot) : '';
}

/* A BOOKING CLOSED (owner, 9 Nov): its card is its item map (ITEM_MAPS.booking, cards-parts.js); these say when it runs and whether it is paid. */
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
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso || '')) ? fmtDate_(iso) : '';
}

/* THE PEOPLE COLUMNS (453); `peoplePages_` (me.js) adds the signed-out card and the empty one. Student settings is `studentSetPages_`. */

/** Everything spliced between the question and the results, whichever answer is showing. */
/* THE BUNDLE IS THE LAST OF THEM — see `bundlePages_`. § */
/* THE BOUND FINDER'S, since there are two (`FINDERS`): § */
function frontPages_() {
  return FINDER.front();
}

/* A BUNDLE — THE PAPERS ON THE SCREEN, AS ONE THING YOU CAN ORDER. § */
const BUNDLE_MIN = 2;
