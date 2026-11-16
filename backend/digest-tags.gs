/* @family. — digest-tags.gs THE LIBRARY, FOR THE SUNDAY EMAIL: EACH QUESTION, ITS TAGS AND ITS PLAIN TEXT */

/* THE LIBRARY, FOR THE EMAIL — EACH QUESTION PRINTED AS IT IS ON THE SITE (18 Oct, docs/history/351) § */
/* THE FILE ITSELF: the site's copy first — the one the phones read — then raw.githubusercontent.com § */
function digestLibrary_(site) {
  const urls = [S(site || SITE_URL).replace(/\/*$/, '/') + DIGEST_LIBRARY_PATH];
  try { urls.push(RAW + DIGEST_LIBRARY_PATH); } catch (err) { /* sync.gs is not in this scope */ }
  const said = [];
  for (let i = 0; i < urls.length; i++) {
    const t = Date.now();
    try {
      const res = UrlFetchApp.fetch(urls[i] + '?v=' + Date.now(), { muteHttpExceptions: true, followRedirects: true });
      const code = res.getResponseCode();
      const text = code === 200 ? String(res.getContentText('UTF-8')) : '';
      if (code === 200 && /^\s*\[/.test(text.slice(0, 50)) && text.indexOf('"row_id":"') !== -1) {
        return { text: text, url: urls[i], ms: Date.now() - t, size: text.length };
      }
      said.push(urls[i] + ' answered ' + code + (code === 200 ? ' with something that is not the library' : ''));
    } catch (err) {
      said.push(urls[i] + ' could not be reached (' + S(err && err.message || err).slice(0, 120) + ')');
    }
  }
  return { error: 'the question library could not be fetched, so each question goes as its words — ' + said.join('; ') };
}

/* ---------- THE CARD'S TAGS, AS THE SITE DRAWS THEM (20 Oct, docs/history/380): `tagRow_` (js/find.js) for a question, ported § */
/* THE TAG FACETS AND THEIR HUES ARE THE SITE'S (owner rule 1.1, 16 Nov): `DIGEST_TAG_FIELDS`, `TAG_OF` and `DIGEST_TAG_INK` are generated */
/* into cards-gen.gs by tools/cards-gen.js from data/settings/facets.json, js/find-finder.js's FACETS, js/find-bundles.js and style.css. */
/* The ORDER is the facets file's as fetched (`digestFacetOrder_`, 546); the generated list is the fallback when it cannot be. */
/* ONE `verified` TAG (owner 10 Nov): the email reads the ledger's `function_verified` (397), which qtypes.js worked out in the browser, beside `verified`. */
const DIGEST_FACETS_PATH = 'data/settings/facets.json';
/* THE FACETS FILE THE PHONE ORDERS ITS TAGS BY (546): the site's copy first, then raw.githubusercontent.com; null when neither answers. */
function digestFacetOrder_(site) {
  const urls = [S(site || SITE_URL).replace(/\/*$/, '/') + DIGEST_FACETS_PATH];
  try { urls.push(RAW + DIGEST_FACETS_PATH); } catch (err) { /* sync.gs is not in this scope */ }
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = UrlFetchApp.fetch(urls[i] + '?v=' + Date.now(), { muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() !== 200) continue;
      const rows = JSON.parse(String(res.getContentText('UTF-8')));
      if (Array.isArray(rows) && rows.some(r => r && r.field)) return rows;
    } catch (err) { /* the next URL, then the fallback order */ }
  }
  return null;
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
const DIGEST_SOURCES = ['1st Class Maths', 'Corbettmaths', 'Access Tuition', 'GL Assessment'];
const digestTagSource_ = q => DIGEST_SOURCES.find(s => digestSpell_(s) === digestSpell_(digestLibS_(q.company))) || '';
/* THE SITE CARD'S SHAPE, AS THE EMAIL DRAWS IT (57a–62a): js/check-email-card.js holds it to findCard's parts and style.css's tokens. */
const DIGEST_CARD = { order: ['pic', 'head', 'tags', 'lines'], lines: ['theirs', 'verdict', 'right'],
  labels: { theirs: 'Their answer', right: 'Answer' }, radius: 0, round: 999, gap: 14, rule: '#171717',
  size: { small: 12, body: 16, title: 18 }, cut: 2, perLine: 60 };
const DIGEST_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DIGEST_ROMAN = /^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;

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
  return out;
}

/* library.js's readers of a cell: `libS`, `libOn` (blank is on), `libTrue`, `libNum` (absent stays absent), `libN`. */
const digestLibS_ = v => (v === undefined || v === null ? '' : String(v));
const digestLibOn_ = v => /^(|true|yes|1|y|on)$/.test(digestLibS_(v).toLowerCase().trim());
const digestLibTrue_ = v => /^(true|yes|1|y|on)$/.test(digestLibS_(v).toLowerCase().trim());
const digestLibNum_ = v => {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return isFinite(n) ? n : null;
};
/* find.js's `spellKey_` and `asList_`. */
const digestSpell_ = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]/g, '');
const digestList_ = v => (Array.isArray(v) ? v : v == null || v === false ? [] : [v]).map(it => String(it == null ? '' : it).trim()).filter(Boolean);

/* A QUESTION ROW AS `questionItems` MAKES IT AN ITEM: the cells the facets read, by the item's names. */
function digestTagItem_(q) {
  return { src: q, subject: digestLibS_(q.subject), documentType: digestLibS_(q.document_type), keystage: digestLibS_(q.key_stage),
           bandType: digestLibS_(q.band_type), bandValue: digestLibS_(q.band_value), tier: digestLibS_(q.tier),
           examBoard: digestTagSource_(q) ? '' : digestLibS_(q.exam_board), examWave: digestLibS_(q.exam_wave), year: digestLibS_(q.year), sub: digestLibS_(q.name) };
}
/* `levelOf_` and `ksFallback_`. */
function digestTagLevel_(it) {
  const band = it.bandType === 'stage' && it.bandValue ? String(it.bandValue) : '';
  let own = band || String(it.src.level || '').trim();
  if (!own) {
    const yr = it.bandType === 'year' ? Number(it.bandValue) : NaN;
    if (yr >= 1 && yr <= 11) own = yr <= 6 ? 'SATs' : yr <= 9 ? 'KS3' : 'GCSE';
    else {
      const ks = digestTagStages_(it).filter(k => /^ks[1-5]$/i.test(k)).sort();
      const k = ks.length ? ks[ks.length - 1] : '';
      own = k ? ({ ks1: 'SATs', ks2: 'SATs', ks3: 'KS3', ks4: 'GCSE', ks5: 'A-Level' }[digestSpell_(k)] || k) : '';
    }
  }
  const l = digestLevelsIn_(own);
  return l.length > 1 ? l : (l[0] || '');
}
/* find.js's `LEVEL_TABLE` and `levelsIn_` (O1), copied: Apps Script cannot load find.js. check-schema asks both copies every
   level cell in the library and its range fixtures, and fails on any difference. */
const DIGEST_LEVELS = [
  { level: 'SATs', rung: 1, says: ['KS1', 'KS2', 'KS1 SATs', 'KS2 SATs'] }, { level: '11+', rung: 0, says: [] },
  { level: 'KS3', rung: 2, says: [] }, { level: 'GCSE', rung: 3, says: ['KS4'] }, { level: 'Functional Skills L2', rung: 0, says: [] },
  { level: 'Level 2 Certificate', rung: 0, says: ['L2 Certificate'] },
  { level: 'A-Level', rung: 4, says: ['Alevel', 'A level', 'KS5'] }, { level: 'AS', rung: 0, says: ['AS level', 'AS-level'] },
  { level: 'Theory test', rung: 0, says: [] },
];
function digestLevelsIn_(cell) {
  const key = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9+]/g, '');
  const find = v => DIGEST_LEVELS.find(l => key(l.level) === key(v) || l.says.some(s => key(s) === key(v)));
  const out = [];
  const add = v => { if (v && out.indexOf(v) === -1) out.push(v); };
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
    const a = p[0], b = p[1];
    if (p[2] || !a.rung || !b.rung) { add(a.level); add(b.level); return; }
    const lo = Math.min(a.rung, b.rung), hi = Math.max(a.rung, b.rung);
    DIGEST_LEVELS.filter(e => e.rung >= lo && e.rung <= hi).forEach(e => add(e.level));
  });
  return out;
}
const digestTagStages_ = it => String(it.keystage || '').split(',').map(s => s.trim()).filter(Boolean);
/* `satsStagesOf_`, asked only of a SATs row. */
function digestTagSats_(it) {
  if (digestList_(digestTagLevel_(it)).indexOf('SATs') === -1) return [];
  const yr = it.bandType === 'year' ? Number(it.bandValue) : NaN;
  if (yr >= 1 && yr <= 6) return [yr <= 2 ? 'KS1' : 'KS2'];
  const named = /\bks\s*([12])\b/i.exec(String((it.bandType === 'stage' && it.bandValue) || it.src.level || ''));
  if (named) return ['KS' + named[1]];
  const out = [];
  digestTagStages_(it).forEach(k => { const m = /^ks\s*([12])$/i.exec(k); if (m && out.indexOf('KS' + m[1]) < 0) out.push('KS' + m[1]); });
  return out.sort();
}
/* `yearOf`, `seriesOf_`, `waveOf` and `waveFromDoc_`: the sitting as "Summer 2024", read as `sittingOf_` splits it. */
function digestTagYearOf_(it) {
  const own = String(it.year || '').trim(), inOwn = own.match(/\b(19|20)\d{2}\b/);
  if (inOwn) return inOwn[0];
  if (own && own.length <= 9 && !/\s/.test(own)) return own;
  const m = String(it.examWave || '').match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '';
}
function digestTagSeries_(m) {
  const n = Number(m);
  if (!isFinite(n) || n < 1 || n > 12) return '';
  return n >= 5 && n <= 7 ? 'Summer' : n >= 10 && n <= 12 ? 'Autumn' : DIGEST_MONTHS[n - 1];
}
const digestTagMonthAt_ = w => DIGEST_MONTHS.findIndex(m => m.toLowerCase().startsWith(String(w).toLowerCase().slice(0, 3)));
function digestTagWave_(it, T) {
  const raw = String(it.examWave || '').trim(), q = it.src;
  if (!raw) {
    if (String(it.documentType || q.document_type || '').toLowerCase() !== 'past paper') return '';
    const doc = T.docs[S(q.paper_id)] || {};
    const named = /\s[—–]\s([A-Za-z]{3,9})\s+((?:19|20)\d{2})\s*$/.exec(String(doc.name || q.name || ''));
    const mth = Number(q.month || doc.month || 0) || (named ? digestTagMonthAt_(named[1]) + 1 : 0);
    const yr = digestTagYearOf_(it) || String(doc.year || '').trim() || (named ? named[2] : '');
    const series = digestTagSeries_(mth);
    return series && /^(19|20)\d{2}$/.test(yr) ? series + ' ' + yr : '';
  }
  const phase = raw.match(/^(first|second|third)\s+wave$/i);
  if (phase) {
    const yr = digestTagYearOf_(it);
    const series = digestTagSeries_(Number(q.month || 0)) || (/^first$/i.test(phase[1]) ? 'Summer' : 'Autumn');
    return yr ? series + ' ' + yr : raw;
  }
  const said = raw.match(/^([A-Za-z]{3,9})\s+((?:19|20)\d{2})$/);
  if (said) { const i = digestTagMonthAt_(said[1]); return i < 0 ? raw : digestTagSeries_(i + 1) + ' ' + said[2]; }
  const long = raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b[^]*?\b((?:19|20)\d{2})\b/);
  if (long) { const i = DIGEST_MONTHS.findIndex(m => m.slice(0, 3) === long[1]); return i < 0 ? long[2] : digestTagSeries_(i + 1) + ' ' + long[2]; }
  const iso = raw.match(/\b((?:19|20)\d{2})-(\d{2})-\d{2}\b/);
  if (iso) return digestTagSeries_(parseInt(iso[2], 10)) + ' ' + iso[1];
  const bare = raw.match(/\b(19|20)\d{2}\b/);
  return bare ? bare[0] : raw;
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
    const i = DIGEST_MONTHS.findIndex(n => n.slice(0, 3).toLowerCase() === String(v || '').slice(0, 3).toLowerCase());
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
      if (S(d.document_type).toLowerCase() !== 'past paper') return;
      const mm = ofName(d.name) || Number(d.month || 0) || ofDate(d.exam_date);
      const nm = /((?:19|20)\d{2})\s*$/.exec(S(d.name));
      const k = digestSittingKey_(d, S(d.year) || (nm ? nm[1] : ''), mm);
      if (k && mm > (T.sittingLast[k] || 0)) T.sittingLast[k] = mm;
    });
  }
  const k = digestSittingKey_(Object.assign({}, doc, q), digestTagYear_(it, T), own);
  const n = Math.max(own, (k && T.sittingLast[k]) || 0);
  return n >= 1 && n <= 12 ? DIGEST_MONTHS[n - 1] : '';
}
function digestSittingKey_(r, year, m) {
  const ser = digestTagSeries_(m), lc = v => S(v).toLowerCase();
  return ser && year ? [lc(r.subject), lc(r.exam_board || r.company), lc(r.level || r.band_value), S(year), lc(ser)].join('|') : '';
}
/* `facetSay_`'s one way of saying a value: its first letter capitalised, unless it is a single lower-case letter or a roman numeral. */
const digestSay_ = v => { const t = String(v == null ? '' : v).trim(); return /^(?:[a-z]|[ivx]+)$/.test(t) ? t : t.charAt(0).toUpperCase() + t.slice(1); };
const digestTagKeystage_ = it => { const s = digestTagSats_(it); return s.length ? s : digestTagStages_(it); };
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
  const mi = iso ? Number(iso[1]) : named ? DIGEST_MONTHS.findIndex(n => n.slice(0, 3).toLowerCase() === named[2].slice(0, 3).toLowerCase()) + 1 : 0;
  const day = iso ? Number(iso[2]) : named ? Number(named[1]) : 0;
  return mi >= 1 && mi <= 12 && day >= 1 && day <= 31 ? { month: DIGEST_MONTHS[mi - 1], day: String(day) } : {};
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
  const bare = p => String(p == null ? '' : p).trim().toLowerCase().replace(/[()\s]/g, '');
  const sib = (T.rows[S(q.paper_id)] || [q]).filter(o => o.kind !== 'preamble' && o.kind !== 'document' && digestLibOn_(o.active)
    && digestLibS_(o.question) === digestLibS_(q.question));
  const numerals = sib.every(o => { const s = bare(o.part); return !s || DIGEST_ROMAN.test(s); });
  const split = (part, num) => {
    const s = bare(part);
    if (!s) return { part: '', sub: '' };
    if (/^\d+$/.test(s)) return { part: '.' + Number(s), sub: '' };
    if (num && DIGEST_ROMAN.test(s)) return { part: '', sub: s };
    const n = /^(\d+)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i.exec(s);
    if (n) return { part: '.' + Number(n[1]), sub: n[2] };
    const m = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
    return m ? { part: m[1], sub: m[2] || '' } : null;
  };
  return split(q.part, numerals) || split(q.part, true) || { part: '', sub: '' };
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
    /* `KIND_UNDER` (find.js, 546): a question is Practice as well as Questions. */
    forLabel: () => 'Learning', kindLabel: () => 'Practice', kindOwn: () => 'Questions',
    subject: () => it.subject, documentType: () => it.documentType,
    level: () => lv, keystage: () => digestTagKeystage_(it),
    yearGroup: () => (it.bandValue && it.bandType === 'year' ? 'Year ' + it.bandValue : ''),
    bandValue: () => (it.bandValue && it.bandType === 'grade' ? 'Grade ' + it.bandValue : ''),
    examBoard: () => it.examBoard, tier: () => it.tier,
    examYear: () => digestTagYear_(it, T), examMonth: () => digestTagMonth_(it, T) || digestTagDate_(q).month, examDay: () => digestTagDate_(q).day,
    paperId: () => pid, paperSection: () => digestTagSection_(q, T), qNumber: () => (digestLibS_(q.question) ? 'Q' + digestLibS_(q.question) : ''), qPart: () => split.part, qSub: () => split.sub,
    marks: () => (marks > 0 ? marks + ' mark' + (marks === 1 ? '' : 's') : ''), needs: () => digestTagNeeds_(q, T),
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
      out.push({ kind: digestTagHue_(f), text: text });
    });
  });
  return out;
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
