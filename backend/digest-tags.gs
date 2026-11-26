/* @family. — digest-tags.gs THE LIBRARY, FOR THE SUNDAY EMAIL: EACH QUESTION, ITS TAGS AND ITS PLAIN TEXT */

/* THE LIBRARY, FOR THE EMAIL — EACH QUESTION PRINTED AS IT IS ON THE SITE (18 Oct, docs/history/351) § */
/* THE FILE ITSELF: the site's copy first — the one the phones read — then raw.githubusercontent.com § */
function digestLibrary_(site) {
  const t = Date.now();
  const r = fetchSiteThenRaw_(DIGEST_LIBRARY_PATH, text => (/^\s*\[/.test(text.slice(0, 50)) && text.indexOf('"row_id":"') !== -1 ? text : null), site);
  if (r.got === null) return { error: 'the question library could not be fetched, so each question goes as its words — ' + r.said.join('; ') };
  return { text: r.got, url: r.url, ms: Date.now() - t, size: r.got.length };
}

/* ---------- THE CARD'S TAGS, AS THE SITE DRAWS THEM (20 Oct, docs/history/380): `tagRow_` (js/find.js) for a question, ported § */
/* THE TAG FACETS AND THEIR HUES ARE THE SITE'S (owner rule 1.1, 16 Nov): `DIGEST_TAG_FIELDS`, `TAG_OF` and `DIGEST_TAG_INK` are generated */
/* into cards-gen.gs by tools/cards-gen.js from data/settings/facets.json, js/find-finder.js's FACETS, js/find-bundles.js and style.css. */
/* The ORDER is the facets file's as fetched (`digestFacetOrder_`, 546); the generated list is the fallback when it cannot be. */
/* ONE `verified` TAG (owner 10 Nov): the email reads the ledger's `function_verified` (397), which qtypes.js worked out in the browser, beside `verified`. */
const DIGEST_FACETS_PATH = 'data/settings/facets.json';
/* THE FACETS FILE THE PHONE ORDERS ITS TAGS BY (546): the site's copy first, then raw.githubusercontent.com; null when neither answers. */
function digestFacetOrder_(site) {
  return fetchSiteThenRaw_(DIGEST_FACETS_PATH, text => {
    const rows = JSON.parse(text);
    return Array.isArray(rows) && rows.some(r => r && r.field) ? rows : null;
  }, site).got;
}
/* THE EMAIL'S TAG FACETS IN THE FILE'S ORDER — one order, the card's: a facet the file switches off is not said; one it does not list keeps its place. */
function digestTagFacets_(rows) {
  if (!Array.isArray(rows)) return DIGEST_TAG_FIELDS.slice();
  const at = {}, off = {};
  rows.forEach(r => { if (r && r.field) { if (r.active === false) off[r.field] = 1; else if (isFinite(Number(r.sort_order)) && S(r.sort_order) !== '') at[r.field] = Number(r.sort_order); } });
  return DIGEST_TAG_FIELDS.map((f, i) => ({ f: f, i: i, at: at[f] })).filter(o => !off[o.f])
    .sort((a, b) => (a.at === undefined || b.at === undefined ? a.i - b.i : a.at - b.at || a.i - b.i)).map(o => o.f);
}
/* A FACET'S TAG COLOUR, AS THE CARD'S `tagOf_` (js/find-bundles.js): `h` and its hue. */
const digestTagHue_ = f => 'h' + (TAG_OF[f] || 0);
/* `LIB_SOURCES` (js/find.js): a worksheet maker is a Source and its sheet has no exam board (O3). */
const DIGEST_SOURCES = ['1st Class Maths', 'Corbettmaths', 'Access Tuition', 'GL Assessment', 'Physics & Maths Tutor', '@family'];
const DIGEST_BOARD_SOURCES = ['Physics & Maths Tutor', '@family'];
const digestTagSource_ = q => DIGEST_SOURCES.find(s => digestSpell_(s) === digestSpell_(digestLibS_(q.company))) || '';

/* THE LIBRARY FOR THE TAGS, IN ONE PASS OVER THE FILE: § */
function digestTagIndex_(text, pids, facets) {
  const out = { docs: {}, heads: {}, rows: {}, facets: digestTagFacets_(facets) }, want = {};
  (pids || []).forEach(p => { want[S(p)] = 1; });
  const parse = line => { try { return JSON.parse(line.replace(/,?\s*$/, '')); } catch (err) { return null; } };
  const live = q => q && q.kind !== 'preamble' && q.kind !== 'document' && digestLibOn_(q.active);
  S(text).split('\n').forEach(line => {
    const m = /"paper_id":("(?:[^"\\]|\\.)*")/.exec(line);
    if (!m) return;
    let pid;
    try { pid = JSON.parse(m[1]); } catch (err) { return; }
    const doc = line.indexOf('"kind":"document"') !== -1;
    if (doc && out.docs[pid]) return;
    if (!doc && !want[pid] && (out.heads[pid] || line.indexOf('"kind":"preamble"') !== -1)) return;
    const q = parse(line);
    if (!q || S(q.paper_id) !== pid) return;
    if (doc) out.docs[pid] = q;
    if (want[pid]) (out.rows[pid] = out.rows[pid] || []).push(q);
    if (!doc && !out.heads[pid] && live(q)) out.heads[pid] = q;
  });
  /* EACH ROW WEARS ITS PAPER'S CARD (owner, 17 Nov), joined as the site joins it (libJoinPaper_, LIB_FILES.questions.joined). */
  const J = LIB_FILES.questions.joined;
  Object.keys(out.rows).forEach(p => libJoinPaper_(out.rows[p], J));
  Object.keys(out.heads).forEach(p => { if (out.docs[p]) libJoinPaper_([out.docs[p], out.heads[p]], J); });
  return out;
}

/* library.js's readers of a cell: `libS`, `libOn` (blank is on), `libTrue`, `libNum` (absent stays absent), `libN`. */
const digestLibS_ = v => (v === undefined || v === null ? '' : String(v));
const digestLibOn_ = v => /^(|true|yes|1|y|on)$/.test(digestLibS_(v).toLowerCase().trim());
const digestLibTrue_ = v => /^(true|yes|1|y|on)$/.test(digestLibS_(v).toLowerCase().trim());
/* find.js's `spellKey_` and `asList_`. */
const digestSpell_ = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]/g, '');
const digestList_ = v => (Array.isArray(v) ? v : v == null || v === false ? [] : [v]).map(it => String(it == null ? '' : it).trim()).filter(Boolean);

/* A QUESTION ROW AS `questionItems` MAKES IT AN ITEM: the cells the facets read, by the item's names. */
function digestTagItem_(q) {
  return { src: q, subject: digestLibS_(q.subject), documentType: digestLibS_(q.document_type), keystage: digestLibS_(q.key_stage),
           bandType: digestLibS_(q.band_type), bandValue: digestLibS_(q.band_value), tier: digestLibS_(q.tier),
           examBoard: digestTagSource_(q) && DIGEST_BOARD_SOURCES.indexOf(digestTagSource_(q)) === -1 ? '' : digestLibS_(q.exam_board), examWave: digestLibS_(q.exam_wave), year: digestLibS_(q.year), sub: digestLibS_(q.name) };
}
/* THE ITEM AS THE SITE'S `questionItems` HANDS IT TO ITS READERS (unify batch 7): the cells by the item's names, the row as `row`. */
/* The level, key stage and sitting are then the site's own `levelsOf_`, `satsStagesOf_` and `waveOf` (cards-gen.gs), never a port. */
const digestSiteItem_ = it => ({ bandType: it.bandType, bandValue: it.bandValue, keystage: it.keystage, examWave: it.examWave, year: it.year,
  documentType: it.documentType, row: it.src });
/* `levelOf_` (find-levels.js; booking.gs has its own `levelOf_`, of roles): one level as itself, several as a list. */
const digestTagLevel_ = it => { const l = levelsOf_(digestSiteItem_(it)); return l.length > 1 ? l : (l[0] || ''); };
/* `waveFromDoc_` asks `docById_` for the paper's row: here, the library the tags were indexed from (`digestTagWave_` sets it). */
let DIGEST_DOCS_ = {};
const docById_ = id => DIGEST_DOCS_[S(id)] || null;
function digestTagWave_(it, T) {
  DIGEST_DOCS_ = (T && T.docs) || {};
  return waveOf(digestSiteItem_(it));
}
function digestTagYear_(it, T) {
  const w = String(digestTagWave_(it, T) || '').trim();
  const m = /^(.*\S)\s+((?:19|20)\d{2})$/.exec(w);
  return m ? m[2] : /^(19|20)\d{2}$/.test(w) ? w : '';
}
/* `sittingMonth_`. */
function digestTagMonth_(it, T) {
  if (!digestTagYear_(it, T)) return '';
  const q = it.src, doc = T.docs[S(q.paper_id)] || {};
  const ofDate = v => { const m = /\b(?:19|20)\d{2}-(\d{2})-\d{2}\b/.exec(String(v || '')); return m ? Number(m[1]) : 0; };
  const ofWord = v => {
    const i = MONTH_NAMES.findIndex(n => n.slice(0, 3).toLowerCase() === String(v || '').slice(0, 3).toLowerCase());
    return i < 0 ? 0 : i + 1;
  };
  const ofName = v => { const m = /\s[—–]\s(?:\d{1,2}\s+)?([A-Za-z]{3,9})\s+(?:19|20)\d{2}\s*$/.exec(String(v || '')); return m ? ofWord(m[1]) : 0; };
  const ofWave = v => { const m = /^([A-Za-z]{3,9})\s+(?:19|20)\d{2}$/.exec(String(v || '').trim()); return m ? ofWord(m[1]) : ofDate(v); };
  const own = ofName(doc.name || q.name || it.sub) || Number(q.month || 0) || ofDate(q.exam_date) || Number(doc.month || 0)
    || ofDate(doc.exam_date) || ofWave(it.examWave);
  /* ONE SITTING, ONE MONTH (16 Nov): `sittingLastMonth_` — the last month any paper of the same subject, board, level, year and series names. */
  if (!T.sittingLast) {
    T.sittingLast = {};
    Object.keys(T.docs).forEach(pid => {
      const d = T.docs[pid] || {};
      if (!S(d.exam_board)) return;
      const mm = ofName(d.name) || Number(d.month || 0) || ofDate(d.exam_date);
      const nm = /((?:19|20)\d{2})\s*$/.exec(S(d.name));
      const k = digestSittingKey_(d, S(d.year) || (nm ? nm[1] : ''), mm);
      if (k && mm > (T.sittingLast[k] || 0)) T.sittingLast[k] = mm;
    });
  }
  const k = digestSittingKey_(Object.assign({}, doc, q), digestTagYear_(it, T), own);
  const n = Math.max(own, (k && T.sittingLast[k]) || 0);
  return n >= 1 && n <= 12 ? MONTH_NAMES[n - 1] : '';
}
function digestSittingKey_(r, year, m) {
  const ser = seriesOf_(m), lc = v => S(v).toLowerCase();
  return ser && year ? [lc(r.subject), lc(r.exam_board || r.company), lc(r.level || r.band_value), S(year), lc(ser)].join('|') : '';
}
/* `facetSay_`'s one way of saying a value: its first letter capitalised, unless it is a single lower-case letter or a roman numeral. */
const digestSay_ = v => { const t = String(v == null ? '' : v).trim(); return /^(?:[a-z]|[ivx]+)$/.test(t) ? t : t.charAt(0).toUpperCase() + t.slice(1); };
const digestTagKeystage_ = it => { const x = digestSiteItem_(it), s = satsStagesOf_(x); return s.length ? s : keyStagesOf_(x); };
/* `paperSectionOf_` (js/find-finder.js, 770): a paper sat in sections is its real number — Paper 3, Section A, never Paper 31 — read from its id or its title. */
function digestPaperSection_(doc) {
  const id = S((doc && (doc.paper_id || doc.paperId)) || '');
  const t = /^Paper (\d)(\d)\b(?::\s*([^—]+?))?\s*(?:—|$)/.exec(S((doc && doc.name) || ''));
  const m = /-(\d)(\d)$/.exec(id) || t;
  if (!m || S(doc.paper) !== m[1] || Number(m[2]) < 1 || Number(m[2]) > 6) return null;
  return { paper: m[1], section: 'Section ' + 'ABCDEF'[Number(m[2]) - 1], topic: S(doc.section || (t && t[3]) || '').trim() };
}
/* `paperTag_` (js/find-finder.js): "Paper 1/2/3" first, else the lead of its name, else the code on its cover. */
function digestTagPaper_(pid, T) {
  const d = T.docs[S(pid)] || null, sec = digestPaperSection_(d), n = S((d && d.paper) || '').trim();
  if (sec) return 'Paper ' + sec.paper;
  if (n) return 'Paper ' + n;
  const lead = /^(?:Practice paper|Paper|Component|Unit) \w+/i.exec(S((d && d.name) || '').trim());
  return lead ? lead[0] : S((d && d.paper_code) || '').trim();
}
/* The `paperSection` facet, as the card asks it of the question's own row (its `section` is the topic): else a section its paper's title names (`paperNameSection_`). */
function digestTagSection_(q, T) {
  const pid = S(q.paper_id), d = T.docs[pid], sec = digestPaperSection_(S(q.name) ? q : d);
  if (sec) return sec.section + (sec.topic ? ': ' + sec.topic : '');
  return (/, (Section [A-F])\b/.exec(S((d || {}).name)) || [])[1] || '';
}
/* `showFit_` (js/find-facets.js): an over-long answer takes its first form (`showForms_`, cards-gen.gs) that no short answer */
/* of its menu already says. The menu is the library's: every paper's section, read off its document rows. */
function digestTagFit_(f, text, T) {
  const key = v => digestSpell_(v);
  if (!T.shortSaid) {
    T.shortSaid = {};
    Object.keys(T.docs).forEach(pid => { const v = digestTagSection_(T.docs[pid], T); if (v && v.length <= SHOW_MAX) T.shortSaid[key(v)] = 1; });
  }
  const taken = f === 'paperSection' ? T.shortSaid : {}, forms = showForms_(text);
  return forms.find(t => !taken[key(t)]) || forms[forms.length - 1] || text.slice(0, SHOW_MAX);
}
/* `itemDate_` (js/find-levels.js): a dated item's month and day — a 5-a-day's "5 October". */
function digestTagDate_(q) {
  const iso = /^\s*(?:19|20)\d{2}-(\d{2})-(\d{2})\b/.exec(S(q.date || q.exam_date || ''));
  const named = /\s[\u2014\u2013]\s(\d{1,2})\s+([A-Za-z]{3,9})\s*$/.exec(S(q.name || ''));
  const mi = iso ? Number(iso[1]) : named ? MONTH_NAMES.findIndex(n => n.slice(0, 3).toLowerCase() === named[2].slice(0, 3).toLowerCase()) + 1 : 0;
  const day = iso ? Number(iso[2]) : named ? Number(named[1]) : 0;
  return mi >= 1 && mi <= 12 && day >= 1 && day <= 31 ? { month: MONTH_NAMES[mi - 1], day: String(day) } : {};
}
/* `verifyTags_` (js/find-levels.js): checked against the scheme, machine-marked, and nothing it names undrawn (`figUndrawn_`, cards-gen.gs) */
/* — beside its stems and the part it `uses`. */
function digestTagVerified_(q, T) {
  if (!(digestLibTrue_(q.verified) && digestLibTrue_(q.function_verified))) return 'Not verified';
  /* THE FILE'S FLAG STANDS ONLY FOR A CARD WHOSE WORDS ARE ON THEIR WAY (`libWaits_`): a row with no `lib_has` is read whole, */
  /* and with no words it is incomplete (`qtIncomplete_`), whatever an old flag says. */
  if (!S(q.lib_has).trim() && !S(q.html).trim()) return 'Not verified';
  const rows = T.rows[S(q.paper_id)] || [];
  const around = digestStemRows_(q, rows.filter(o => o.kind === 'preamble' && digestLibOn_(o.active)));
  const uses = String(q.uses == null ? '' : q.uses).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (uses) {
    const bare = p => String(p == null ? '' : p).toLowerCase().replace(/[^a-z0-9]/g, '');
    const y = rows.find(o => o !== q && o.kind !== 'preamble' && o.kind !== 'document' && S(o.question) === S(q.question) && bare(o.part) === uses);
    if (y) around.push(y);
  }
  return figUndrawn_(q, around) ? 'Not verified' : 'Verified';
}
/* `partSplit_`, with the question's own numeral decision (`partNumerals_`): `ai` is [a] [i], AQA's `1` is [.1], a lone `ii` a numeral when every part of the question is one. */
function digestTagSplit_(q, T) {
  const sib = (T.rows[S(q.paper_id)] || [q]).filter(o => o.kind !== 'preamble' && o.kind !== 'document' && digestLibOn_(o.active)
    && digestLibS_(o.question) === digestLibS_(q.question));
  const numerals = sib.every(o => { const s = partBare_(o.part); return !s || ROMAN_ONLY.test(s); });
  return partSplit_(q.part, numerals) || partSplit_(q.part, true) || { part: '', sub: '' };
}
/* `needsIndex_`/`needsOf_`: the paper's kit, then the question's, then the printed sheet — the calculator in `NEED_WORDS`' words. */
function digestTagNeeds_(q, T) {
  const out = [], add = v => { v = ({ 'no calculator': 'Non-calculator', calculator: 'Calculator allowed' })[String(v || '').trim().toLowerCase()] || v; if (v && out.indexOf(v) === -1) out.push(v); };
  digestList_(String((T.docs[S(q.paper_id)] || {}).needs || '').split(',')).forEach(add);
  digestList_(digestLibS_(q.needs).split(',')).forEach(add);
  if (digestLibTrue_(q.needs_print) || digestLibTrue_(q.print_required)) add('Printed sheet');
  return out;
}

/* EVERY TAG THE SITE'S CARD WEARS FOR THIS QUESTION ROW, in its order, each `{ kind, text }` — `tagRow_`'s walk and its one dedupe: § */
function digestCardTags_(q, T) {
  if (!q || !T) return [];
  const it = digestTagItem_(q), pid = S(q.paper_id);
  const lv = digestTagLevel_(it), split = digestTagSplit_(q, T);
  const marks = Number(digestLibS_(q.marks).replace(/[^0-9.-]/g, '')) || 0;
  /* EACH FACET'S ANSWERS (`facetOwn_`, `tagOf` for the card's own page), in the words the value is. */
  const of = {
    /* ONE OPENING QUESTION (queue item 9, 24 Nov): a question is What kind › Questions; What for and Which are not asked. */
    forLabel: () => 'Learning', kindLabel: () => 'Learn', kindOwn: () => 'Questions',
    subject: () => it.subject, documentType: () => it.documentType,
    level: () => lv, keystage: () => digestTagKeystage_(it),
    yearGroup: () => (it.bandValue && it.bandType === 'year' ? 'Year ' + it.bandValue : ''),
    bandValue: () => (it.bandValue && it.bandType === 'grade' ? 'Grade ' + it.bandValue : ''),
    examBoard: () => it.examBoard, tier: () => it.tier,
    examYear: () => digestTagYear_(it, T), examMonth: () => digestTagMonth_(it, T) || digestTagDate_(q).month, examDay: () => digestTagDate_(q).day,
    paperId: () => pid, paperSection: () => digestTagSection_(q, T), qNumber: () => (digestLibS_(q.question) ? 'Q' + digestLibS_(q.question) : ''), qPart: () => split.part, qSub: () => split.sub,
    marks: () => (marks > 0 ? marks + ' ' + plural_(marks, 'mark') : ''), needs: () => digestTagNeeds_(q, T),
    verified: () => digestTagVerified_(q, T), source: () => digestTagSource_(q),
  };
  /* SAID AS THE CARD SAYS THEM: the paper by `paperTag_`, the marks as the paper prints them, "[1]". */
  const say = { paperId: () => digestTagPaper_(pid, T), marks: v => { const m = /^(\d+) marks?$/.exec(v); return m ? '[' + m[1] + ']' : v; } };
  /* `tagRow_`'s dedupe: a word already said, an id already said, or a tag that is only earlier tags side by side (`tagMadeOf_`, the site's own, cards-gen.gs). */
  const out = [], words = Object.create(null), ids = Object.create(null), said = [];
  (T.facets || DIGEST_TAG_FIELDS).forEach(f => {
    if (!of[f]) return;
    let vals;
    try { vals = digestList_(of[f]()); } catch (err) { vals = []; }
    vals.forEach(raw => {
      let text = raw;
      try { text = String(say[f] ? say[f](raw) : digestSay_(raw) || raw).trim(); } catch (err) { text = raw; }
      if (text.length > SHOW_MAX) text = digestTagFit_(f, text, T);
      /* A TAG SAID AS NOTHING IS NOT DRAWN (`tagList_`): a paper with no number, name lead or cover code has no Paper tag. */
      if (!text) return;
      const w = text.toLowerCase();
      if ((/[A-Za-z]/.test(text) && (words[w] || tagMadeOf_(text, said))) || (/[A-Za-z]/.test(raw) && ids[raw])) return;
      words[w] = 1; ids[raw] = 1; said.push(text);
      out.push({ field: f, kind: digestTagHue_(f), text: text });
    });
  });
  /* THE ONE TAG SET (owner, 23 Nov): the site's one picker, tagsKept_ (cards-gen.gs), over data/settings/tags.json. */
  return tagsKept_(out);
}

/* THE ROWS ASKED FOR, AND THE PREAMBLES OF THEIR PAPERS — one line each, found by its text and parsed alone. § */
function digestLibraryFind_(text, ids) {
  const bounds = at => {
    const a = text.lastIndexOf('\n', at) + 1;
    let b = text.indexOf('\n', at);
    if (b === -1) b = text.length;
    return [a, b];
  };
  const parse = line => { try { return JSON.parse(line.replace(/,?\s*$/, '')); } catch (err) { return null; } };
  const rows = {}, papers = [];
  (ids || []).forEach(id => {
    const at = text.indexOf('"row_id":' + JSON.stringify(id));
    if (at === -1) return;
    const ab = bounds(at), q = parse(text.slice(ab[0], ab[1]));
    if (!q || S(q.row_id) !== id) return;
    rows[id] = q;
    const pid = S(q.paper_id || q.paper);
    if (pid && papers.indexOf(pid) === -1) papers.push(pid);
  });
  const pre = [];
  const tags = papers.map(pid => '"paper_id":' + JSON.stringify(pid));
  const mark = '"kind":"preamble"';
  for (let at = text.indexOf(mark); tags.length && at !== -1; ) {
    const ab = bounds(at), line = text.slice(ab[0], ab[1]);
    if (tags.some(t => line.indexOf(t) !== -1)) {
      const p = parse(line);
      if (p && p.kind === 'preamble' && ON_(p.active)) pre.push(p);
    }
    at = text.indexOf(mark, ab[1]);
  }
  /* EACH ROW WEARS ITS PAPER'S CARD (owner, 17 Nov): the paper's own row (`D-` and its id), joined as the site joins it. */
  const docs = [];
  papers.forEach(pid => {
    const at = text.indexOf('"row_id":' + JSON.stringify('D-' + pid));
    if (at === -1) return;
    const ab = bounds(at), d = parse(text.slice(ab[0], ab[1]));
    if (d && d.kind === 'document') docs.push(d);
  });
  libJoinPaper_(docs.concat(Object.keys(rows).map(id => rows[id]), pre), LIB_FILES.questions.joined);
  /* AND EACH ROW'S TAGS, AS ITS CARD WEARS THEM (`digestCardTags_`); a failure costs the tags, never the email. */
  const worn = {};
  try {
    const T = digestTagIndex_(text, papers, digestFacetOrder_());
    Object.keys(rows).forEach(id => { worn[id] = digestCardTags_(rows[id], T); });
  } catch (err) { /* the cards fall back to what their labels say */ }
  return { rows: rows, pre: pre, tags: worn };
}

/* THE PREAMBLES IN FRONT OF A QUESTION, OUTERMOST FIRST — `stemIndex_` and `preamble_` (js/find.js) for one question: § */
function digestStemRows_(q, pre) {
  const bare = v => S(v).toLowerCase().replace(/[()\s]/g, '');
  const pidOf = one => S(one && (one.paper_id || one.paper));
  const scopeOf = one => {
    const num = S(one.question), part = bare(one.part);
    if (num && /^[a-z]$/.test(part)) return 'l|' + num + '|' + part;
    if (num) return 'q|' + num;
    if (S(one.section)) return 's|' + S(one.section);
    return 'p';
  };
  /* A PART'S LETTER, READ AS `qRefBits_` READS IT: "d(ii)" and "dii" are (d); "ii" alone is a numeral. */
  const letterOf = part => {
    const s = bare(part);
    if (!s || /^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/.test(s)) return '';
    const m = /^([a-z]?)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
    return m ? m[1] : '';
  };
  const pid = pidOf(q), num = S(q.question), letter = letterOf(q.part);
  const want = ['p'];
  if (S(q.section)) want.push('s|' + S(q.section));
  if (num) { want.push('q|' + num); if (letter) want.push('l|' + num + '|' + letter); }
  const out = [];
  want.forEach(w => (pre || []).filter(one => pidOf(one) === pid && scopeOf(one) === w)
    .sort((a, b) => (N(a.sort_order) || 0) - (N(b.sort_order) || 0))
    .forEach(one => { if (S(one.html) || S(one.diagram)) out.push(one); }));
  return out;
}
/* THE LIBRARY'S MARKUP AS TEXT — `aiPlain_` (js/keypad.js) without a DOMParser, which Apps Script has not got: § */
function digestPlain_(html) {
  return S(html)
    .replace(/<sup>([^<]*)<\/sup>\s*(?:&frasl;|\u2044)\s*<sub>([^<]*)<\/sub>/g, '($1)/($2)')
    .replace(/<sup>([^<]*)<\/sup>/g, '^($1)')
    .replace(/<(br|\/p|\/li|\/div|\/tr)\b[^>]*>/gi, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?[a-z][^<>]*>/gi, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
      if (e.charAt(0) === '#') {
        const n = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
      }
      return Object.prototype.hasOwnProperty.call(DIGEST_ENTITIES, e) ? DIGEST_ENTITIES[e] : m;
    })
    .replace(/[ \t\u00a0]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}
