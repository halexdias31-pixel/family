
/* ---------- AN EXAM INSERT (455): EACH FORMULA, CONSTANT AND TABLE ITS OWN PART; THE SHEET IS ONLY A TAG (owner, 13 Nov) ---------- */
function insertItem_(r) {
  return {
    kind: 'insert', name: r.name, key: 'in:' + r.id, sub: r.summary, image: '',
    subject: r.subject, level: r.levels.length > 1 ? r.levels : r.levels[0] || '', keystage: r.keystage,
    examBoard: r.boards, tier: r.tiers,
    text: plainText_([r.name, r.summary, 'insert formula formulae equation sheet booklet data']
      .concat(...r.sections.map(s => [s.head].concat((s.lines || []).map(l => l.name)))).join(' ')),
    row: r,
  };
}
/* EACH LINE OF A SHEET IS A PART, as a paper's parts are (4.12): one row per id, its boards and sheets the union of every sheet it is on. */
function insertParts_() {
  const by = {};
  (DATA.inserts || []).forEach(r => (r.sections || []).forEach(s => (s.lines || []).forEach(l => {
    if (!l || !l.id) return;
    const p = by[l.id] || (by[l.id] = { id: l.id, name: l.name || s.head || '', summary: '', subject: r.subject, levels: [], keystage: r.keystage,
      boards: [], tiers: [], forSubjects: [], forLevels: [], forTiers: [], verified: r.verified, verifiedNote: r.verifiedNote, official: [],
      sections: [{ head: l.topic || s.head || '', lines: [l] }], table: '', elements: [], forPapers: [], sources: [], parents: [] });
    const add = (k, v) => (v || []).forEach(t => { if (p[k].indexOf(t) === -1) p[k].push(t); });
    add('levels', r.levels); add('boards', r.boards); add('tiers', r.tiers); add('forSubjects', r.forSubjects); add('forLevels', r.forLevels);
    p.parents.push(r.id);
  })));
  /* A SHEET'S TABLE (the periodic table) IS ONE TABLE PART, as a question's table is; the same table on two sheets is one part. */
  const tables = {};
  (DATA.inserts || []).filter(r => r.table && (r.elements || []).length).forEach(r => {
    const sig = r.table + JSON.stringify(r.elements), p = tables[sig] || (by[r.id + '-table'] = tables[sig] = { id: r.id + '-table', name: r.table === 'periodic' ? 'Periodic table' : String(r.table),
      summary: '', subject: r.subject, levels: [], keystage: r.keystage, boards: [], tiers: [], forSubjects: [], forLevels: [], forTiers: [], verified: r.verified, verifiedNote: r.verifiedNote,
      official: [], sections: [], table: r.table, elements: r.elements, forPapers: [], sources: [], parents: [] });
    (r.levels || []).concat().forEach(t => { if (p.levels.indexOf(t) === -1) p.levels.push(t); });
    (r.boards || []).forEach(t => { if (p.boards.indexOf(t) === -1) p.boards.push(t); });
    (r.tiers || []).forEach(t => { if (p.tiers.indexOf(t) === -1) p.tiers.push(t); });
    p.parents.push(r.id);
  });
  return Object.keys(by).map(k => by[k]).map(p => Object.assign(p, { sheets: p.parents.map(id => (insertSheetRow_(id) || {}).name || id),
    summary: 'On the ' + p.parents.map(id => (insertSheetRow_(id) || {}).name || id).join(', the ') + '.' }));
}
const insertSheetRow_ = id => (DATA.inserts || []).find(r => r.id === id) || null;
/* A PART'S SHEETS ARE ITS TAGS (`sheets`), as a paper's name groups its questions: Find narrows by sheet, and no sheet card is drawn. */
const insertPartItem_ = p => { const head = (p.sections[0] || {}).head || '', line = ((p.sections[0] || {}).lines || [])[0] || {};
  return Object.assign(insertItem_(p), { name: head ? p.name + ' (' + head + ')' : p.name, sheets: p.sheets || [],
    text: plainText_([p.name, head, p.summary, 'insert formula equation'].concat(p.sheets || [], String(line.math || '').replace(/<[^>]*>/g, '')).join(' ')) }); };
/* WHICH INSERTS A QUESTION'S PAPER COMES WITH: its subject, level, tier and board, read as the facets read them; a blank list is any. */
function insertsFor_(x) {
  if (!isQ_(x) || !/paper/i.test(String(x.documentType || ''))) return [];
  const has = (list, v) => !list.length || asList_(v).some(a => list.indexOf(String(a)) !== -1);
  /* A READING INSERT IS ONE PAPER'S (458): its paper ids, and nothing else, say which */
  const paper = String((x.row && x.row.paper_id) || '');
  return (DATA.inserts || []).filter(r => (r.forPapers || []).length ? r.forPapers.indexOf(paper) !== -1
    : has(r.forSubjects, x.subject) && has(r.forLevels, levelOf_(x)) && has(r.forTiers, x.tier) && has(r.boards, x.examBoard));
}
/* ---------- A READING INSERT'S EXTRACT (458): private, so asked for when it is opened and drawn when it lands ---------- */
const insReading_ = r => !!r && (!!(r.forPapers || []).length || !!r.sourceText || !!r.libHas);
/* THE TEXT IS PARAGRAPHS (a blank line between), `# ` a heading, `> ` the paper's note above it, `[n]` where the paper prints line n */
function insSource_(r) {
  const lines = !!r.lineNumbers;
  return String(r.sourceText || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => {
    if (/^# /.test(p)) return `<h4 class="insrc-h">${esc(p.slice(2))}</h4>`;
    if (/^> /.test(p)) return `<p class="insrc-note">${esc(p.replace(/^> /gm, ''))}</p>`;
    const body = esc(p).replace(/\[(\d{1,3})\]\s*/g, (m, n) => lines ? `<span class="insrc-ln" aria-label="line ${n}">${n}</span>` : '');
    return `<p class="insrc-p">${body}</p>`;
  }).join('');
}
/* WHAT A READING INSERT SAYS UNTIL ITS WORDS COME: sign in, the dots, coming soon, or why not */
function insSay_(r) {
  if (typeof USER === 'undefined' || !USER || !USER.token) return '<p class="note lib-sign">Sign in to read the source — your account is a few screens to the right.</p>';
  const t = 'in:' + r.id;
  if (LIB.gone.has(t)) return empty_(r.pending ? 'Coming soon.' : 'Not in the library yet.');
  if (LIB.failed) return `${empty_('Couldn’t load this.')}${tileRow_(tile_({ icon: 'again', label: 'Try again', act: 'lib-retry' }))}`;
  return loading_();
}
/* ASKED FOR, if it has words in the Ledger and they are not here yet */
function insWant_(r) {
  if (r && !r.sourceText && (r.libHas || r.pending)) libAsk_(['in:' + r.id]);
}
/* AND WHEN AN ANSWER LANDS, every open wait for an insert says where things stand, or becomes the source */
function insLanded_() {
  document.querySelectorAll('.insrc-wait[data-ins]').forEach(el => {
    const r = insertRow_(el.getAttribute('data-ins'));
    if (!r) return;
    if (r.sourceText) { el.classList.remove('insrc-wait'); el.innerHTML = insSource_(r); }
    else el.innerHTML = insSay_(r);
  });
}
/* NO INSERT TILE ON A QUESTION (463): the owner, "they can open it in their 2nd finder" -- an insert is Library, found like any card. */
const insertRow_ = id => insertSheetRow_(id) || insertParts_().find(r => r.id === id) || null;
/* THE SHEET ITSELF, on paper: each line a name and its formula, typeset as a question's maths is (`typeset_`). */
/* AN INSERT AS BLOCKS: its kicker, a reading's source (filled when its words come) or the sheet's sections, and whether it was checked. */
function insertBody_(r) {
  const kick = { type: 'text', look: 'insh-kick', text: ['Insert'].concat(r.boards || []).join(' · ') };
  if (insReading_(r)) return [kick, { type: 'text', look: 'insh-sum', text: r.summary || '' },
    { type: 'embed', tool: 'ins-source', look: 'insrc' + (r.sourceText ? '' : ' insrc-wait') + (r.lineNumbers ? ' has-lines' : ''), data: r.sourceText ? null : { ins: r.id }, args: { id: r.id } }];
  const mark = l => [l.higher ? { badge: 'H', hint: 'Higher tier only' } : '', l.only ? { badge: l.only + ' only' } : ''];
  return [kick].concat(r.table === 'periodic' ? [{ type: 'grid', caption: 'Periodic table',
    cells: (r.elements || []).map(e => ({ col: e[4], row: e[5], parts: [e[3], e[1], e[2], e[0]] })) },
    { type: 'text', look: 'insh-key', text: 'In each box: relative atomic mass, symbol, name, atomic number.' }] : [])
    .concat((r.sections || []).map(s => ({ type: 'section', look: 'insh-sec', head: s.head || '', blocks: [{ type: 'tree',
      nodes: (s.lines || []).map(l => ({ label: [l.name || ''].concat(mark(l)), text: [{ typeset: String(l.math || '') }].concat(l.note ? [' ', { i: l.note }] : []) })) }] })),
    { type: 'text', look: 'insh-check', text: [{ b: r.verified ? 'Checked' : 'Not yet checked' }, ' ', r.verifiedNote || ''] });
}
/* A READING INSERT'S SOURCE, drawn when its words are here; until then what it waits on (`insSay_`). */
CARD_EMBEDS['ins-source'] = a => { const r = insertRow_(a.id); return !r ? '' : r.sourceText ? insSource_(r) : insSay_(r); };
cardKind_('insert', x => { const r = x.row || {}; insWant_(r);
  return { look: 'insh', name: x.name, tags: kcFacetTags_(x).concat((x.sheets || []).map(t => ({ text: t, colour: 2 }))), body: insertBody_(r) }; });
const insertSheet_ = r => renderCard({ kind: 'insert', look: 'insh', name: r.name, tags: [{ text: r.name, colour: 0 }], body: insertBody_(r) });
/* EXTRAS ON A CARD'S ONE ROW (`CARD_EXTRAS_`): an insert's Print and official copies. */
function insertExtras_(x) { return [{ icon: 'print', label: 'Print', note: 'or save as PDF', act: 'ins-print', data: { id: x.row.id } }]
  .concat((x.row.official || []).map(o => ({ icon: 'open', label: 'Official', note: o.label, act: 'file-view', data: { url: o.url, title: o.label } }))); }
/* ---------- A SPECIFICATION (owner, 12 Nov): one card per board's spec, data/spec/<id>.json via data/specs.json (tools/coverage.js). ---------- */
function specItem_(r) {
  return {
    kind: 'spec', name: r.code, key: 'spec:' + r.id, sub: '', image: '',
    /* A SPEC THAT SPANS ITS LEVEL'S TIERS NAMES THEM (`tiers`, ESL's A1 to C2), so the tier question is asked over its cards too. */
    subject: r.subject, level: r.level, examBoard: r.board, tier: r.tiers || '',
    text: plainText_([r.board, r.qualification, r.subject, r.code, 'specification spec syllabus']
      .concat((r.sections || []).map(s => s.title), (r.points || []).map(p => p.id + ' ' + p.text)).join(' ')),
    row: r,
  };
}
/* A POINT'S LESSONS AND QUESTIONS (tools/coverage.js wrote their Find keys) as tree nodes; a key Find lacks is left out. */
function specNodes_(r, parent, named) {
  return (r.points || []).filter(p => p.parent === parent).map(p => {
    const shown = (p.links || []).filter(k => /^q:/.test(k)).length, more = (p.asked || 0) - shown;
    return { label: p.id, text: p.text, kids: specNodes_(r, p.id, named),
      tiles: (p.links || []).filter(k => named[k]).map(k => ({ icon: /^q:/.test(k) ? 'edit' : 'book', label: /^q:/.test(k) ? 'Question' : 'Lesson', note: named[k], act: 'find-open', data: { key: String(k) } })),
      more: more > 0 ? 'and ' + more + ' more question' + (more === 1 ? '' : 's') + ' on this point' : '' };
  });
}
/* WHAT EACH LINKED KEY IS CALLED in Find now, looked up once per card. */
function specNamed_(r) {
  const want = new Set([].concat(...(r.points || []).map(p => p.links || []))), out = {};
  if (!want.size) return out;
  try { (stuffItemsAll_() || []).forEach(i => { if (i && want.has(i.key)) out[i.key] = /^q:/.test(i.key) && i.sub ? i.sub + ' · ' + i.name : i.name || i.key; }); } catch (e) { /* Find not ready: the card shows its tree alone */ }
  return out;
}
/* THE SECTION TREE, each section folded; the official PDF holds the full wording. */
cardKind_('spec', x => { const r = x.row || {}, named = specNamed_(r);
  return { look: 'insh spec-sheet', name: x.name, tags: kcFacetTags_(x), body: [{ type: 'text', look: 'insh-kick', text: [r.board, r.qualification, r.subject, r.code].join(' · ') },
    { type: 'tree', nodes: (r.sections || []).map(s => ({ label: s.title, kids: specNodes_(r, s.id, named) })) },
    { type: 'text', look: 'insh-check', text: 'Short headings; the official specification has the full wording.' }] }; });
const specExtras_ = x => [{ icon: 'open', label: 'Official', note: /\.pdf$/i.test(x.row.url) ? 'specification PDF' : 'the framework page', act: 'file-view', data: { url: x.row.url, title: x.row.board + ' ' + x.row.code } }];
/* PRINTED ALONE, as a statement is (`stmt-print`): a paper copy of the sheet and nothing else of the app. */
on('ins-print', el => {
  const r = insertRow_(el.getAttribute('data-id'));
  if (!r) return;
  const paper = document.createElement('div');
  paper.className = 'insh-paper insh';
  paper.innerHTML = insertSheet_(r);
  document.body.appendChild(paper);
  document.body.classList.add('printing-insh');
  const done = () => {
    document.body.classList.remove('printing-insh');
    paper.remove();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  setTimeout(done, 4000);
  window.print();
});

/* ---------- THE HISTORY DATABASE (459): MANUSCRIPTS, FIGURES, WRITINGS — ONE CARD A ROW, LINKED BY ID. docs/history-db.md ---------- */
/* A list cell is split on " | "; an id is MS-, FIG- or WR- and digits, and any cell may name one. */
const HIST_ID = /^(MS|FIG|WR|EV)-\d+$/;
const histList_ = v => String(v == null ? '' : v).split('|').map(t => t.trim()).filter(Boolean);
/* THE ROW AN ID NAMES, in whichever table its prefix says. */
function histRow_(id) {
  const t = (typeof HIST_DB === 'undefined' ? [] : HIST_DB).find(s => String(id).indexOf(s.prefix) === 0);
  return t ? (DATA[t.file] || []).find(r => r.id === id) || null : null;
}
const histName_ = r => (r && (r.name || r.title_english || r.title_original || r.id)) || '';
/* A YEAR AS SAID: negative is BC. */
const histYear_ = n => (n == null || !isFinite(n) ? '' : n < 0 ? -n + ' BC' : n < 1000 ? 'AD ' + n : String(n));
/* THE ERAS, in order; a row is in every one its years touch (`histErasOf_`) and the funnel sorts them in this order (`answerCmp_`). */
const HIST_ERAS = [
  { name: 'Ancient', to: 500 },
  { name: 'Medieval', to: 1500 },
  { name: 'Early modern', to: 1800 },
  { name: 'Modern', to: Infinity },
];
/* THE SHARED HELPER: from and to (either may be missing) → the eras they overlap; a range ending on a boundary stays on its side. */
function histEras_(from, to) {
  const a = from != null ? from : to, b = to != null ? to : from;
  if (a == null || !isFinite(a)) return [];
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return HIST_ERAS.filter((e, i) => {
    const s = i ? HIST_ERAS[i - 1].to : -Infinity;
    return lo === hi ? lo >= s && lo < e.to : lo < e.to && hi > s;
  }).map(e => e.name);
}
function histErasOf_(x) {
  /* A WRITING'S UNIT CARRIES ITS WORK'S DATE (520), so Era asks a page of First Clement as it asked the row it replaced. */
  if (x && x.wDate) return histEras_(x.wDate[0], x.wDate[1]);
  if (isPerson_(x)) return x.born || x.died ? histEras_(x.born || x.died, x.died || x.born) : [];
  const r = x && x.hdb ? x.row : null;
  if (!r) return [];
  return histEras_(r.date_from, r.date_to);
}
/* ONE READER FOR EVERY HISTORY FACET: a column of the row, split as a list; nothing on any other kind. */
const histCol_ = (x, col) => (x && x.hdb && x.row ? histList_(x.row[col]) : []);

/* THE LINKS, BOTH WAYS: what a row names, and what names it — a link typed on one side only still shows on both. */
function histLinks_(r) {
  const out = [], seen = new Set();
  const add = (id, label) => {
    /* A WRITING IS ITS PAGES (520): a WR- link lands on the work's first unit card, never a profile row. */
    const to = histRow_(id) || (typeof window.worksRowOf_ === 'function' ? window.worksRowOf_(id) : null);
    if (!to || seen.has(id) || id === r.id) return;
    seen.add(id); out.push({ id: id, label: label, row: to });
  };
  const K = { MS: 'Manuscript', FIG: /^EV-/.test(r.id) ? 'Figure' : 'Author', WR: 'Writing', EV: 'Event' };
  const kindOfId = id => { const p = String(id).split('-')[0]; return labelOf_('hist-link', p === 'FIG' && /^EV-/.test(r.id) ? 'FIG-EV' : p, K[p] || ''); };
  ['writings', 'manuscripts', 'author_id', 'figures', 'events'].forEach(c => histList_(r[c]).forEach(id => { if (HIST_ID.test(id)) add(id, kindOfId(id)); }));
  histList_(r.relations).forEach(p => {
    const m = /^([^:]+):\s*(.+)$/.exec(p);
    if (m && HIST_ID.test(m[2].trim())) add(m[2].trim(), histCap_(m[1]));
  });
  (DATA.writings || []).forEach(w => {
    if (w.author_id === r.id || histList_(w.manuscripts).indexOf(r.id) >= 0) add(w.id, labelOf_('hist-link', 'WR', 'Writing'));
  });
  (DATA.manuscripts || []).forEach(m => { if (histList_(m.writings).indexOf(r.id) >= 0) add(m.id, labelOf_('hist-link', 'MS', 'Manuscript')); });
  (DATA.figures || []).forEach(f => { if (histList_(f.writings).indexOf(r.id) >= 0) add(f.id, labelOf_('hist-link', 'FIG', 'Author')); });
  (DATA.timeline || []).forEach(e => { if (histList_(e.figures).concat(histList_(e.writings)).indexOf(r.id) >= 0) add(e.id, labelOf_('hist-link', 'EV', 'Event')); });
  (DATA.figures || []).forEach(f => { if (histList_(f.events).indexOf(r.id) >= 0) add(f.id, labelOf_('hist-link', 'FIG-EV', 'Figure')); });
  return out;
}
const histCap_ = s => { const t = String(s || '').trim(); return t ? t[0].toUpperCase() + t.slice(1) : ''; };

/* THE ITEM: Library, on the History shelf, as boxers are on Boxing's. */
/* EACH HISTORY KIND'S CHIP, LINE AND SHELF; a kind not named reads as a writing kept in a repository.
   A writing is on the Writings shelf wherever it came from (600). */
const HIST_KIND_ROW = {
  event: { chip: 'event', say: 'Events', sub: r => [r.date_text, r.theatre] },
  manuscript: { chip: 'manuscript', say: 'Manuscripts', sub: r => [r.repository, r.date_text] },
  writing: { chip: 'writing', say: 'Writings', sub: r => [r.title_original, r.date_text], shelf: () => WRITINGS_SHELF },
};
const HIST_KIND_ELSE = { chip: 'writing', say: 'Writings', sub: r => [r.repository, r.date_text] };
function histItem_(kind, r) {
  if (kind === 'figure') return { kind: 'people', hdb: true, name: histName_(r), key: 'hdb:' + r.id, pixId: r.id, image: '', sub: '', histKind: labelOf_('hist-kind', 'figure', 'People'),
    born: personYear_(r.born_year), died: personYear_(r.died_year), from: r.born_place || '', roles: histList_(r.roles),
    shelf: 'History', subject: 'History', text: plainText_(Object.keys(r).map(k => r[k]).join(' ')), row: r };
  const K = Object.prototype.hasOwnProperty.call(HIST_KIND_ROW, kind) ? HIST_KIND_ROW[kind] : HIST_KIND_ELSE;
  return {
    kind: kind, hdb: true, name: histName_(r), key: 'hdb:' + r.id, image: '',
    sub: K.sub(r).filter(Boolean).join(' · '),
    histKind: labelOf_('hist-kind', K.chip, K.say),
    shelf: K.shelf ? K.shelf() : 'History', subject: 'History',
    text: plainText_(Object.keys(r).filter(k => k !== 'px').map(k => r[k]).join(' ')),
    row: r,
  };
}
/* A DRAWN MANUSCRIPT IS ONE CARD A SIDE (507), tagged Front (recto) or Back (verso); the first drawn keeps the bare key, so a saved key still opens. */
const MS_SIDE_SAY = { front: 'Front (recto)', back: 'Back (verso)' };
function histItems_(kind, r) {
  const one = histItem_(kind, r), L = kind === 'manuscript' && MS_LOOK[r.id];
  if (!L || !L.sides) return [one];
  return L.sides.map((sd, i) => Object.assign({}, one, { key: i ? one.key + ':' + (sd.side || i) : one.key,
    msSide: labelOf_('hist-side', sd.side, MS_SIDE_SAY[sd.side] || ''), msSideIx: i, sub: [labelOf_('hist-side', sd.side, MS_SIDE_SAY[sd.side] || ''), one.sub].filter(Boolean).join(' · ') }));
}

/* THE LINES OF A CARD, one thing each (421): a label and the row's column, said as written. */
const HIST_LINES = {
  manuscript: [['Also known as', 'catalog_ids'], ['Repository', 'repository'], ['City', 'city'], ['Shelfmark', 'shelfmark'],
    ['Date', 'date_text'], ['Dated by', 'date_basis'], ['Material', 'material'], ['Format', 'format'], ['Language', 'language'],
    ['Script', 'script'], ['Contents', 'contents'], ['Size', 'size'], ['Provenance', 'provenance'], ['Condition', 'condition'], ['Notes', 'notes']],
  figure: [['Also known as', 'aliases'], ['Born', r => [r.born_text, r.born_place].filter(Boolean).join(', ')],
    ['Died', r => [r.died_text, r.died_place].filter(Boolean).join(', ')], ['Places', 'places'], ['Eras', 'eras'], ['Roles', 'roles'],
    ['Achievements', 'achievements'], ['Relations', r => histList_(r.relations).map(p => {
      const m = /^([^:]+):\s*(.+)$/.exec(p);
      return m ? histCap_(m[1]) + ': ' + (HIST_ID.test(m[2].trim()) ? histName_(histRow_(m[2].trim())) || m[2] : m[2]) : p;
    }).join(' | ')], ['Notes', 'notes']],
  writing: [['Original title', 'title_original'], ['Author', r => r.author_text || histName_(histRow_(r.author_id))],
    ['Date', 'date_text'], ['Dated by', 'date_basis'], ['Language', 'language'], ['Genre', 'genre'], ['Context', 'context'],
    ['Themes', 'themes'], ['Manuscripts', r => histList_(r.manuscripts).map(v => HIST_ID.test(v) ? histName_(histRow_(v)) || v : v).join(' | ')],
    ['Public-domain translations', 'pd_translation']],
  event: [['Date', 'date_text'], ['Places', 'places'], ['Theatre', 'theatre'], ['Part of', 'era'], ['What happened', 'summary']],
};
/* ---------- A MANUSCRIPT AS IT LOOKS (490, 495): a drawing traced over a public-domain photograph (`ref`) -- its true outline, line count and § */
const MS_LOOK = {
  'MS-0001': { stuff: 'papyrus', box: [30, 80, 630, 940],
    ref: 'Commons: File:P52 recto.jpg (PD-Art, PD-old-100) and File:P52 verso.jpg (PD-scan, PD-old-70)',
    edge: [[48, 92], [90, 88], [150, 95], [210, 92], [260, 100], [310, 98], [360, 108], [400, 112], [430, 125], [435, 150], [410, 175],
      [415, 240], [420, 300], [440, 330], [455, 340], [462, 300], [465, 230], [475, 215], [520, 210], [580, 215], [640, 222], [645, 300],
      [638, 350], [645, 400], [635, 460], [620, 500], [605, 545], [595, 560], [590, 620], [590, 690], [560, 695], [530, 680], [500, 700],
      [470, 690], [420, 700], [420, 760], [410, 830], [415, 880], [400, 890], [360, 900], [330, 920], [320, 975], [300, 1000], [250, 1005],
      [205, 995], [200, 940], [205, 900], [140, 890], [130, 860], [120, 820], [115, 760], [110, 700], [115, 640], [105, 600], [110, 550],
      [100, 490], [110, 430], [105, 375], [85, 360], [65, 320], [50, 250], [45, 180], [42, 120]],
    sides: [
      { name: 'Recto', side: 'front', what: 'John 18:31–33', lines: [[135, 640, 365, 'ΟΙΙΟΥΔΑΙ·····ΗΜΕ'], [135, 635, 462, 'ΟΥΔΕΝΑΙΝΑΟΛ'],
        [130, 600, 552, 'ΠΕΝΣΗΜΑΙΝΩ'], [150, 560, 648, 'ΘΝΗΣΚΕΙΝΙΣ'], [150, 415, 748, 'ΡΙΟΝΟΠ'], [135, 400, 838, 'ΚΑΙΕΙΠ'],
        [205, 320, 958, 'ΑΙΩ', 'trace']] },
      /* THE SAME LEAF TURNED OVER: its outline mirrored, the lines' surviving ends on the other side. */
      { name: 'Verso', side: 'back', what: 'John 18:37–38', mirror: true, lines: [[93, 560, 378, 'ΤΟΓ··ΕΝΝΗΜΑΙΚΑ'], [57, 560, 465, 'ΣΜΟΝΙΝΑΜΑΡΤΥ'],
        [180, 557, 568, 'ΤΗΣΑΛΗΘΕ'], [170, 547, 660, 'ΛΕΓΕΙΑΥΤΩ'], [280, 480, 760, 'ΙΤΟΥΤ'], [280, 453, 857, 'ΟΥΣΚ'],
        [365, 440, 948, 'ΑΙ', 'trace']] },
    ] },
  /* ONE WHOLE PAGE (fol. 41v): Luke 24:32-53 in two columns, paragraphs hanging into the margin, then the tailpiece and the title. */
  'MS-0002': { stuff: 'parchment', box: [0, 0, 700, 902],
    ref: 'Commons: File:Codex Alexandrinus f41v - Luke.jpg (PD-old-100-1923), British Library Royal MS 1 D VIII, fol. 41v',
    edge: [[22, 14], [600, 10], [640, 30], [688, 70], [692, 880], [22, 884]],
    sides: [{ name: 'Folio 41v', side: 'back', what: 'Luke 24:32–53, the end of the Gospel',
      cols: [{ x0: 100, x1: 365, y0: 84, lh: 12.95, rows: 51, paras: [
        '+ΗΝΟΙΓΕΝΗΜΙΝΤΑΣΓΡΑΦΑΣ',
        'ΚΑΙΑΝΑΣΤΑΝΤΕΣΑΥΤΗΤΗΩΡΑΥΠΕΣΤΡΕΨΑΝΕΙΣΙΕΡΟΥΣΑΛΗΜΚΑΙΕΥΡΟΝΣΥΝΗΘΡΟΙΣΜΕΝΟΥΣΤΟΥΣΕΝΔΕΚΑΚΑΙΤΟΥΣΣΥΝΑΥΤΟΙΣΛΕΓΟΝΤΑΣΟΤΙΗΓΕΡΘΗΟΚΣΟΝΤΩΣΚΑΙΩΦΘΗΣΙΜΩΝΙΚΑΙΑΥΤΟΙΕΞΗΓΟΥΝΤΟΤΑΕΝΤΗΟΔΩΚΑΙΩΣΕΓΝΩΣΘΗΑΥΤΟΙΣΕΝΤΗΚΛΑΣΕΙΤΟΥΑΡΤΟΥ',
        'ΤΑΥΤΑΔΕΑΥΤΩΝΛΑΛΟΥΝΤΩΝΑΥΤΟΣΟΙΣΕΣΤΗΕΝΜΕΣΩΑΥΤΩΝΚΑΙΛΕΓΕΙΑΥΤΟΙΣΕΙΡΗΝΗΥΜΙΝΠΤΟΗΘΕΝΤΕΣΔΕΚΑΙΕΜΦΟΒΟΙΓΕΝΟΜΕΝΟΙΕΔΟΚΟΥΝΠΝΑΘΕΩΡΕΙΝΚΑΙΕΙΠΕΝΑΥΤΟΙΣΤΙΤΕΤΑΡΑΓΜΕΝΟΙΕΣΤΕΚΑΙΔΙΑΤΙΔΙΑΛΟΓΙΣΜΟΙΑΝΑΒΑΙΝΟΥΣΙΝΕΝΤΑΙΣΚΑΡΔΙΑΙΣΥΜΩΝΙΔΕΤΕΤΑΣΧΕΙΡΑΣΜΟΥΚΑΙΤΟΥΣΠΟΔΑΣΜΟΥΟΤΙΑΥΤΟΣΕΓΩΕΙΜΙΨΗΛΑΦΗΣΑΤΕΜΕΚΑΙΙΔΕΤΕΟΤΙΠΝΑΣΑΡΚΑΚΑΙΟΣΤΕΑΟΥΚΕΧΕΙΚΑΘΩΣΕΜΕΘΕΩΡΕΙΤΕΕΧΟΝΤΑΚΑΙΤΟΥΤΟΕΙΠΩΝΕΔΕΙΞΕΝΑΥΤΟΙΣΤΑΣΧΕΙΡΑΣΚΑΙΤΟΥΣΠΟΔΑΣ',
        'ΕΤΙΔΕΑΠΙΣΤΟΥΝΤΩΝΑΥΤΩΝΑΠΟΤΗΣΧΑΡΑΣΚΑΙΘΑΥΜΑΖΟΝΤΩΝΕΙΠΕΝΑΥΤΟΙΣΕΧΕΤΕΤΙΒΡΩΣΙΜΟΝΕΝΘΑΔΕΟΙΔΕΕΠΕΔΩΚΑΝΑΥΤΩΙΧΘΥΟΣΟΠΤΟΥΜΕΡΟΣΚΑΙΑΠΟΜΕΛΙΣΣΙΟΥΚΗΡΙΟΥΚΑΙΛΑΒΩΝΕΝΩΠΙΟΝΑΥΤΩΝΕΦΑΓΕΝ',
        'ΕΙΠΕΝΔΕΑΥΤΟΙΣΟΥΤΟΙΟΙΛΟΓΟΙΟΥΣΕΛΑΛΗΣΑΠΡΟΣΥΜΑΣΕΤΙΩΝΣΥΝΥΜΙΝΟΤΙΔΕΙΠΛΗΡΩΘΗΝΑΙΠΑΝΤΑΤΑΓΕΓΡΑΜΜΕΝΑΕΝΤΩΝΟΜΩΜΩΣΕΩΣΚΑΙΠΡΟΦΗΤΑΙΣΚΑΙΨΑΛΜΟΙΣΠΕΡΙΕΜΟΥ',
        'ΤΟΤΕΔΙΗΝΟΙΞΕΝΑΥΤΩΝΤΟΝΝΟΥΝΤΟΥΣΥΝΙΕΝΑΙΤΑΣΓΡΑΦΑΣΚΑΙΕΙΠΕΝΑΥΤΟΙΣΟΤΙΟΥΤΩΣΓΕΓΡΑΠΤΑΙΚΑΙΟΥΤΩΣΕΔΕΙΠΑΘΕΙΝΤΟΝΧΝΚΑΙΑΝΑΣΤΗΝΑΙΕΚΝΕΚΡΩΝΤΗΤΡΙΤΗΗΜΕΡΑΚΑΙΚΗΡΥΧΘΗΝΑΙΕΠΙΤΩΟΝΟΜΑΤΙΑΥΤΟΥΜΕΤΑΝΟΙΑΝΚΑΙΑΦΕΣΙΝΑΜΑΡΤΙΩΝΕΙΣΠΑΝΤΑ'] },
      { x0: 410, x1: 665, y0: 84, lh: 12.95, rows: 20, paras: [
        '+ΤΑΕΘΝΗΑΡΞΑΜΕΝΟΝΑΠΟΙΕΡΟΥΣΑΛΗΜΥΜΕΙΣΔΕΕΣΤΕΜΑΡΤΥΡΕΣΤΟΥΤΩΝΚΑΙΙΔΟΥΕΓΩΑΠΟΣΤΕΛΛΩΤΗΝΕΠΑΓΓΕΛΙΑΝΤΟΥΠΡΣΜΟΥΕΦΥΜΑΣΥΜΕΙΣΔΕΚΑΘΙΣΑΤΕΕΝΤΗΠΟΛΕΙΙΕΡΟΥΣΑΛΗΜΕΩΣΟΥΕΝΔΥΣΗΣΘΕΔΥΝΑΜΙΝΕΞΥΨΟΥΣΕΞΗΓΑΓΕΝΔΕΑΥΤΟΥΣΕΞΩΕΩΣΕΙΣΒΗΘΑΝΙΑΝΚΑΙΕΠΑΡΑΣΤΑΣΧΕΙΡΑΣΑΥΤΟΥΕΥΛΟΓΗΣΕΝΑΥΤΟΥΣ',
        'ΚΑΙΕΓΕΝΕΤΟΕΝΤΩΕΥΛΟΓΕΙΝΑΥΤΟΝΑΥΤΟΥΣΔΙΕΣΤΗΑΠΑΥΤΩΝΚΑΙΑΝΕΦΕΡΕΤΟΕΙΣΤΟΝΟΥΡΑΝΟΝΚΑΙΑΥΤΟΙΠΡΟΣΚΥΝΗΣΑΝΤΕΣΑΥΤΟΝΥΠΕΣΤΡΕΨΑΝΕΙΣΙΕΡΟΥΣΑΛΗΜΜΕΤΑΧΑΡΑΣΜΕΓΑΛΗΣΚΑΙΗΣΑΝΔΙΑΠΑΝΤΟΣΕΝΤΩΙΕΡΩΑΙΝΟΥΝΤΕΣΚΑΙΕΥΛΟΓΟΥΝΤΕΣΤΟΝΘΝΑΜΗΝ'] }],
      /* THE TAILPIECE as the page draws it: three bands across, one down, three sprays, then the book's title. */
      orn: '<path class="mfr-band" d="M425 340H665M425 366H665M425 388H665M440 400V635"/>'
        + '<path class="mfr-spray" d="M510 490c-2-14 4-24 12-30M510 490c-8-8-14-12-14-20M565 505c0-26 0-40-2-55M565 505c-8-14-20-22-26-34M565 505c8-14 18-22 26-34M635 490c0-12 4-22 10-28M635 490c-6-6-12-10-12-18"/>',
      lines: [[495, 655, 552, 'ΕΥΑΓΓΕΛΙΟΝΚΑΤΑΛΟΥΚΑΝ', 'title']] }] },
};
/* THE HAND'S OWN LETTER SHAPES: a round epsilon, a lunate sigma, a rounded omega and alpha, as the uncial scribes wrote them. */
const msHand_ = s => String(s).replace(/Ε/g, 'ϵ').replace(/Σ/g, 'Ϲ').replace(/Ω/g, 'ω').replace(/Α/g, 'α');
/* A COLUMN'S PARAGRAPHS, broken into its real number of lines: the narrowest measure that fits; a paragraph's first letter hangs in the margin; `+` carries one on from the page before. */
function msColLines_(c) {
  for (let w = 10; w < 40; w++) {
    const out = [];
    c.paras.forEach(q => { const p = q.replace(/^\+/, ''); for (let i = 0; i < p.length; i += w) out.push([p.slice(i, i + w), i === 0 && p === q]); });
    if (out.length <= c.rows) {
      const step = (c.x1 - c.x0) / w;
      return out.map(([t, first], i) => [c.x0, c.x0 + t.length * step, c.y0 + i * c.lh, t, first ? 'big' : '']);
    }
  }
  return [];
}
/* THE DRAWING: one side, the card's own (507); each line's surviving letters spread over the room they take in the photograph. */
function msFragSvg_(r, ix) {
  const L = MS_LOOK[r.id];
  if (!L) return '';
  const side = L.sides[ix | 0] || L.sides[0];
  const [bx, by, bw, bh] = L.box;
  const tag = 'mfrclip-' + String(r.id).replace(/[^A-Za-z0-9]/g, '');
  const leaf = (s, k) => {
    const flip = p => s.mirror ? [2 * bx + bw - p[0], p[1]] : p;
    const d = 'M' + L.edge.map(flip).map(p => p[0] + ' ' + p[1]).join('L') + 'Z';
    const lines = (s.cols || []).flatMap(msColLines_).concat(s.lines || []);
    const text = lines.map(([x0, x1, y, t, cls]) => {
      const step = (x1 - x0) / t.length;
      /* A PARAGRAPH'S BIG LETTER is its first only, standing out in the margin (ekthesis). */
      return t.split('').map((ch, i) => {
        if (ch === '·') return '';
        const big = cls === 'big', c = big ? (i ? '' : 'big') : cls, x = x0 + step * (i + .5) - (big && !i ? step * 1.4 : 0);
        return `<text${c ? ` class="mfr-${c}"` : ''} x="${x.toFixed(1)}" y="${y}">${esc(msHand_(ch))}</text>`;
      }).join('');
    }).join('');
    const fibres = L.stuff === 'papyrus'
      ? Array.from({ length: Math.ceil(bh / 9) }, (_, i) => `<line x1="${bx}" x2="${bx + bw}" y1="${by + i * 9}" y2="${by + i * 9 + (i % 3) - 1}"/>`).join('')
        + Array.from({ length: Math.ceil(bw / 14) }, (_, i) => `<line class="mfr-up" x1="${bx + i * 14}" x2="${bx + i * 14 + (i % 2)}" y1="${by}" y2="${by + bh}"/>`).join('')
      : '';
    const id = tag + '-' + k;
    return `<figure class="hdb-ms-side">
      <svg viewBox="${bx} ${by} ${bw} ${bh}" role="img" aria-label="${esc('A drawing of ' + (r.name || 'the manuscript') + ', ' + s.name.toLowerCase() + ': ' + s.what)}">
        <defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
        <g clip-path="url(#${id})"><rect class="mfr-leaf" x="${bx}" y="${by}" width="${bw}" height="${bh}"/><g class="mfr-fibre">${fibres}</g>${s.orn || ''}<g class="mfr-ink">${text}</g></g>
        <path class="mfr-edge" d="${d}"/>
      </svg>
    </figure>`;
  };
  return `<figure class="hdb-ms hdb-ms-${L.stuff}">
    <div class="hdb-ms-sides">${leaf(side, ix | 0)}</div>
  </figure>`;
}
/* THE LINES A MANUSCRIPT'S TAGS ALREADY SAY (owner, 7 Nov: facts as tags), left out of the pages after its card. */
const MS_SAID = ['Repository', 'Date'];
/* ITS FACTS AS TAGS: when and where it was found, when it is dated to (`Held at` is the repository's own tag). */
const msFound_ = x => (isManuscript_(x) && histCol_(x, 'provenance')[0]) || '';
/* A DRAWING'S CAPTIONS ARE ITS PAGES' FIRST LINES (owner, 8 Nov: manuscript cards minimal, picture then tags only). */
function msDrawnRows_(x) {
  const L = x && x.row && MS_LOOK[x.row.id];
  if (!L) return [];
  const s = L.sides[x.msSideIx | 0] || L.sides[0];
  return [['Shown', s.name + ' · ' + s.what], ['Drawn from', 'A tracing of a public-domain photograph (' + L.ref + '); the letters are the ones that survive']];
}
const msDated_ = x => (isManuscript_(x) && x.row && String(x.row.date_text || '').trim()) || '';

/* REFERENCES (504): the owner's bibliography, word for word and without page numbers, shown only on the cards each one is about. */
const WRITING_REFS = [
  'Karen H. Jobes and Moisés Silva, Invitation to the Septuagint, 2nd edn (Grand Rapids, MI: Baker Academic, 2015).',
  '\'The Letter of Aristeas\', trans. by H. T. Andrews, in The Apocrypha and Pseudepigrapha of the Old Testament in English, ed. by R. H. Charles, 2 vols (Oxford: Clarendon Press, 1913), II, 83–122.',
  'Philo, On the Life of Moses, trans. by C. D. Yonge (1854–55).',
  'Jennifer M. Dines, The Septuagint, ed. by Michael A. Knibb (London: T&T Clark, 2004).',
  'Emanuel Tov, Textual Criticism of the Hebrew Bible, 3rd edn (Minneapolis: Fortress Press, 2012).',
  'Timothy Michael Law, When God Spoke Greek: The Septuagint and the Making of the Christian Bible (Oxford: Oxford University Press, 2013).',
];
/* WHICH CARDS: the Septuagint (Greek and Brenton's English), the Masoretic (Tov), the Letter of Aristeas, Ptolemy II. Numbers into WRITING_REFS. */
const WRITING_REFS_ON = { 'bible:lxx': [0, 1, 2, 3, 5], 'bible:brenton': [0, 1, 2, 3, 5], 'bible:hbo': [4],
  'WR-0002': [1, 0, 3, 5], 'FIG-0010': [1, 2, 3] };
const writingRefs_ = on => {
  const at = WRITING_REFS_ON[on];
  return at ? '<section class="fc-sec wt-refs"><p class="wt-refs-h">Sources</p><ol>' + at.map(i => '<li>' + esc(WRITING_REFS[i]) + '</li>').join('') + '</ol></section>' : '';
};

const HIST_TILE_LINKS = 3;
/* NO CARD TALLER THAN A PHONE (562, owner note 122): a history card's lines are all pages of HIST_PAGE_ROWS after it (owner's look rule: facts as tags on the card). */
const HIST_PAGE_ROWS = 8;
function histRows_(x) {
  const r = x.row || {};
  return (HIST_LINES[x.kind] || []).map(([label, col]) => [label, typeof col === 'function' ? col(r) : r[col]])
    .filter(l => String(l[1] == null ? '' : l[1]).trim())
    .filter(l => !(isManuscript_(x) && MS_SAID.indexOf(l[0]) >= 0))
    .concat(isManuscript_(x) ? msDrawnRows_(x) : []);
}
function histPages_(x) {
  const rest = histRows_(x), out = [];
  for (let i = 0; i * HIST_PAGE_ROWS < rest.length; i++) out.push('facts' + i);
  return out;
}
const histDl_ = rows => `<section class="fc-sec hdb-lines"><dl>${rows.map(l => `<div><dt>${esc(l[0])}</dt><dd>${
  histList_(l[1]).map(esc).join('<br>')}</dd></div>`).join('')}</dl></section>`;
function histFactsPart_(x, part) {
  const i = Number(part.slice(5)) || 0, at = i * HIST_PAGE_ROWS;
  const rows = histRows_(x).slice(at, at + HIST_PAGE_ROWS);
  return rows.length ? `<div class="fc hdb hdb-more"><div class="fc-head"><h3>${esc(x.name)}</h3></div>${histDl_(rows)}</div>` : '';
}
/* THE ESSENTIALS (498): "don't need so many" -- three links and one source, on the card's one row (`CARD_EXTRAS_`). */
function histExtras_(x) {
  const r = x.row || {}, read = isWriting_(x) && typeof window.worksFirstKey_ === 'function' ? window.worksFirstKey_(r.id) : '';
  const icon = l => (l.id.indexOf('MS-') === 0 ? 'doc' : l.id.indexOf('WR-') === 0 ? 'book' : 'flag');
  return [read ? { icon: 'book', label: 'Read it', note: 'a page a chapter', act: 'find-open', data: { key: read } } : null]
    .concat(histLinks_(r).slice(0, HIST_TILE_LINKS).map(l => ({ icon: icon(l), label: l.label, note: histName_(l.row), act: 'find-open', data: { key: l.row.key || 'hdb:' + l.id } })),
      histList_(r.sources).filter(u => /^https:\/\//.test(u)).slice(0, 1).map(u => ({ icon: 'ext', label: 'Source', note: u.replace(/^https:\/\/(www\.)?/, '').split('/')[0], act: 'file-view', data: { url: u, title: 'Source' } }))); }

/* THE BIBLE (KING JAMES VERSION) — ASKED LIKE EVERYTHING ELSE ON FIND, AND SHOWN ONLY TO AN ADMIN. § */
const BIBLE_NAME = 'The Bible';
/* `Books`, A SHELF OF ITS OWN, BESIDE `@family. textbooks` AND `Boxing`. § */
/* `Writings` (504), not `Books`: the owner, "remove the word Books and replace with Writings as it encompasses more". */
const WRITINGS_SHELF = 'Writings', BIBLE_SHELF = WRITINGS_SHELF;
/* THE WORDS A SEARCH FINDS IT BY, on the cover and on every verse: what somebody types for the
   Bible that its name does not already say. */
const BIBLE_WORDS = 'scripture';
/* EACH TRANSLATION'S OWN WORDS (504), on its cards only, so "KJV" finds no WEB verse. */
const BIBLE_TR_WORDS = { KJV: 'KJV King James Authorized Version', WEB: 'WEB World English Bible',
  HBO: 'Masoretic Hebrew Tanakh original', LXX: 'Septuagint LXX Greek original', BRENTON: 'Brenton English Septuagint',
  GNT: 'Greek New Testament original Byzantine Robinson Pierpont' };

/* EVERYTHING IT KNOWS, IN ONE PLACE. § */
const BIBLE = { index: null, asking: null, failed: false, books: {}, loading: {}, missed: {}, also: {},
                item: null, verses: null, rank: null };

/* ---------- WHO IS SHOWN IT § */
/* A RULE (496, 504): `kjv-admin` — Universal by default, everyone like the Talmud and the Quran; Exception, an admin only. check-bible reads this line. */
const bibleFor_ = () => (typeof isAdmin === 'function' && isAdmin()) || (typeof ruleOn_ === 'function' && !ruleOn_('kjv-admin'));
/* SCRIPTURE IS RELIGIOUS STUDIES, ON THE BOOKS SHELF (494): "quran and talmud should be in religious studies and in books"; `libBook` says which book. */
const SCRIPTURE_SUBJECT = () => brand('scripture_subject', 'Religious Studies');

/* THE DOTS UNDER A SCRIPTURE QUESTION (504) wait for its indexes, never the payload, which adds no answer there; a failed index is said.
   null: not scripture's question. */
const SCRIPTURE_KINDS = { bible: 1, quran: 1, talmud: 1, hadith: 1, worktext: 1 };
function scriptureWait_(items) {
  if (!items || !items.length || !items.every(x => x && SCRIPTURE_KINDS[x.kind])) return null;
  const books = [['the Bible', BIBLE, bibleFor_()],
    ['the Quran', typeof QURAN !== 'undefined' ? QURAN : null, typeof quranFor_ === 'function' && quranFor_()],
    ['the Talmud', typeof window.TALMUD !== 'undefined' ? window.TALMUD : null, typeof window.talmudFor_ === 'function' && window.talmudFor_()],
    ['the Hadith', typeof window.HADITH !== 'undefined' ? window.HADITH : null, typeof window.hadithFor_ === 'function' && window.hadithFor_()],
    ['the other writings', typeof window.WORKS !== 'undefined' ? window.WORKS : null, true]]
    .filter(b => b[1] && b[2]);
  if (books.some(b => b[1].asking)) return { type: 'wait', on: true };
  const gone = books.filter(b => b[1].failed).map(b => b[0]);
  return gone.length ? { type: 'text', look: 'find-end', text: ['The list of ' + gone.join(' and ') + ' did not arrive. ', { b: 'Pull down to try again.' }] } : '';
}

/* ONE FETCH FOR EVERY FILE OF IT, stamped with the deploy so the service worker's exact-URL cache hands back a fresh copy after one — `videosAsk_`'s reasoning § */
function bibleGet_(file) {
  if (!bibleFor_()) return Promise.resolve(null);
  return scriptureFetch_(o => fetch('data/bible/' + file + deployStamp_(), o));
}
/* SCRIPTURE'S FETCHES END (504): a request that hangs is given up after this long and said as a miss, so no wait lasts for ever. */
const SCRIPTURE_WAIT_MS = 20000;
function scriptureFetch_(ask) {
  return new Promise(done => {
    let over = false, ab = null;
    try { if (typeof AbortController === 'function') ab = new AbortController(); } catch (e) { oops_(e, 'find:scriptureFetch_') }
    const t = setTimeout(() => { over = true; try { if (ab) ab.abort(); } catch (e) { /* already stopped is fine */ } done(null); }, SCRIPTURE_WAIT_MS);
    Promise.resolve().then(() => ask(ab ? { cache: 'default', signal: ab.signal } : { cache: 'default' }))
      .then(res => (res && res.ok) ? res.json() : null)
      .catch(() => null)
      .then(d => { clearTimeout(t); if (!over) done(d); });
  });
}

/* THE LIST OF BOOKS — asked for once, the first time an admin's Find is built, which is long before a finger reaches the shelf. § */
function bibleIndex_() {
  if (BIBLE.index) return BIBLE.index;
  if (!BIBLE.asking && !BIBLE.failed && bibleFor_()) {
    BIBLE.asking = bibleGet_('index.json').then(d => {
      const ok = !!d && typeof d.translation === 'string' && /^[A-Za-z0-9]+$/.test(d.translation)
        && Array.isArray(d.books) && d.books.length > 0
        && d.books.every((b, i) => b && b.n === i + 1 && b.book && /^\d\d-[a-z0-9-]+\.json$/.test(b.file)
                                   && b.chapters > 0 && (b.testament === 'OT' || b.testament === 'NT')
                                   && typeof b.group === 'string' && b.group.trim() !== ''
                                   && Array.isArray(b.chapterVerses) && b.chapterVerses.length === b.chapters
                                   && b.chapterVerses.every(c => Number.isInteger(c) && c > 0)
                                   && b.chapterVerses.reduce((s, c) => s + c, 0) === b.verses);
      BIBLE.asking = null;
      if (ok) { BIBLE.index = d; BIBLE.rank = bibleRankOf_(d); WRITING_CAME.bible = true; }
      else BIBLE.failed = true;
      /* THE VERSES ARRIVE: every finder's list is built again with them (499). */
      bibleRedraw_();
      finderEach_(F => {
        if (ok) {
          FIND_MEMO.key = null;
          STUFF_PAGES = { from: null, pages: [] };
        }
        if ($(F.id + '-controls')) paintStuff(true);
      });
      /* A STARRED VERSE IS NAMED FROM THE INDEX, so Saved could not draw one until now. */
      if (AT === 'saved') repaint(true); else markStale_('saved');
      return BIBLE.index;
    });
  }
  return null;
}
/* ONE CARD, ONE TRANSLATION (504): the owner, "1 widget is one verse ... the translation is a tag". The KJV keeps its own slot `n`, a second
   translation `dir:n`, so a KJV star's key and every KJV caller stay as they were. */
/* EACH TEXT (504): its code, the Text tag it answers (`say`), its language, and its own books when its numbering is its own. */
function bibleTrs_(ix) {
  return [{ tr: String(ix.translation), dir: '', say: String(ix.translation), lang: 'en', books: ix.books }].concat((ix.also || [])
    .filter(t => t && /^[a-z]+$/.test(String(t.dir || '')) && /^[A-Za-z0-9]+$/.test(String(t.translation || '')))
    .map(t => ({ tr: String(t.translation), dir: String(t.dir), say: String(t.say || t.translation), lang: String(t.lang || 'en'),
                 books: Array.isArray(t.books) ? t.books : ix.books })));
}
/* ONE BOOK OF ONE TEXT, by its number: its own record (chapters, verse counts, file). */
function bibleBookIn_(n, dir) {
  const t = BIBLE.index && bibleTrs_(BIBLE.index).find(t => t.dir === (dir || ''));
  return (t && t.books.find(b => b.n === Number(n))) || null;
}
const bibleSlot_ = (n, dir) => dir ? dir + ':' + n : n;
/* THE WORDS OF ONE VERSE in its card's own translation, or '' until its book has come. */
function bibleText_(x) {
  const d = x && x.bb && BIBLE.books[x.bb.slot];
  const c = d && d.chapters[Number(x.ch) - 1];
  return c && c[Number(x.v) - 1] != null ? c[Number(x.v) - 1] : '';
}
const bibleTestament_ = t => (t === 'NT' ? 'New Testament' : 'Old Testament');
/* `Psalm 23`, NOT `Psalms 23` — the book is the Psalms and a chapter of it is a psalm. The one book
   whose chapters are cited by a different word from its title. */
const bibleCite_ = (b, ch) => (b.book === 'Psalms' ? 'Psalm' : b.book) + ' ' + ch;
/* THE WORDS EVERY VERSE OF ONE BOOK CARRIES — its Bible, its testament, its group and its book — so a search that names any of them finds it. § */
const bibleBookWords_ = b => [BIBLE_NAME, BIBLE_WORDS, bibleTestament_(b.testament), b.group, b.book].join(' ');

/* ---------- THE ORDER THE ANSWERS ARE DRAWN IN, WHICH IS THE BIBLE'S § */
function bibleRankOf_(ix) {
  const r = { t: { oldtestament: 0, newtestament: 1 }, g: {}, b: {} };
  [].concat(...bibleTrs_(ix).map(t => t.books)).forEach(b => {
    const g = spellKey_(b.group);
    if (!(g in r.g)) r.g[g] = b.n;
    r.b[spellKey_(b.book)] = b.n;
  });
  return r;
}

/* ONE BOOK OF ONE TRANSLATION, ONCE A VISIT. Held to the index's own count of every chapter's verses, so a file that came
   back half-written is a failure said on the card rather than a verse drawn from the wrong place. */
function bibleLoad_(n, dir) {
  const k = bibleSlot_(n, dir || '');
  if (BIBLE.books[k]) return Promise.resolve(BIBLE.books[k]);
  if (BIBLE.loading[k]) return BIBLE.loading[k];
  const b = bibleBookIn_(n, dir);
  if (!b || !bibleFor_()) return Promise.resolve(null);
  BIBLE.loading[k] = bibleGet_((dir ? dir + '/' : '') + b.file).then(d => {
    delete BIBLE.loading[k];
    const ok = !!d && Array.isArray(d.chapters) && d.chapters.length === b.chapters
      && d.chapters.every((c, i) => Array.isArray(c) && c.length === b.chapterVerses[i]
                                    && c.every(v => typeof v === 'string'));
    BIBLE.missed[k] = !ok;
    if (!ok) return null;
    BIBLE.books[k] = d;
    return d;
  });
  return BIBLE.loading[k];
}

/* ---------- THE CHOSEN BOOK, ASKED FOR BEFORE ITS VERSES ARE DRAWN (docs/history/341) § */
function bibleChosen_() {
  const st = FINDERS.stuff === FINDER ? STUFF : FINDERS.stuff.st;
  const f = chipsOn_(st.filters, 'wBook').find(x => x.value != null);
  if (!f || !BIBLE.rank || !BIBLE.rank.b) return 0;
  return BIBLE.rank.b[spellKey_(f.value)] || 0;
}
/* THE CHOSEN TRANSLATION'S FOLDER: '' for the KJV, or when none is chosen yet. */
function bibleChosenDir_() {
  const st = FINDERS.stuff === FINDER ? STUFF : FINDERS.stuff.st;
  /* BY THE LANGUAGE AND THE TRANSLATION CHOSEN (546), either or both: an original text (the Septuagint) is its language alone. */
  const f = chipsOn_(st.filters, 'wText').find(x => x.value != null), l = chipsOn_(st.filters, 'wLanguage').find(x => x.value != null);
  const t = (f || l) && BIBLE.index ? bibleTrs_(BIBLE.index).find(t => {
    const said = writingText_(writingTextOf_(t.tr));
    return (!f || writingVersionOf_(said) === f.value) && (!l || writingLanguageOf_(said) === l.value);
  }) : null;
  return t ? t.dir : '';
}
function bibleAhead_() {
  const n = bibleChosen_(), dir = bibleChosenDir_(), k = bibleSlot_(n, dir);
  if (!n || !bibleFor_() || BIBLE.books[k] || BIBLE.loading[k] || BIBLE.missed[k]) return;
  bibleLoad_(n, dir).then(() => bibleRedraw_(k));
}
function bibleJobs_() {
  const n = bibleChosen_(), k = bibleSlot_(n, bibleChosenDir_());
  if (!n || !bibleFor_() || BIBLE.books[k] || BIBLE.loading[k] || BIBLE.missed[k]) return [];
  return [{ key: 'bible:' + n, kind: 'bible', d: aheadDist_('stuff', null), run: bibleAhead_ }];
}
AHEAD_KINDS.push(bibleJobs_);

/* ---------- A VERSE, DRAWN § */
const bibleVerse_ = t => esc(String(t == null ? '' : t).replace(/^#\s*/, ''))
  .replace(/\[([^\[\]]*)\]/g, '<i>$1</i>');

/* ---------- THE VERSE AS THE CARD READS IT § */
const bibleV_ = t => '<p class="bb-v">'
  + (/^#/.test(String(t == null ? '' : t)) ? '<span class="bb-para" aria-hidden="true">¶</span> ' : '')
  + bibleVerse_(t) + '</p>';

/* ---------- EVERY VERSE, AS AN ITEM § */
function bibleVerseList_(ix) {
  const num = [], N = i => num[i] || (num[i] = String(i));
  const list = [], starts = {}, rs = SCRIPTURE_SUBJECT(), reg = writingWork_('bible');
  bibleTrs_(ix).forEach(t => {
    const text = writingText_(writingTextOf_(t.tr));
    const head = 'bible:' + t.tr.toLowerCase() + ':', st = starts[t.tr.toLowerCase()] = [];
    t.books.forEach(b => {
      const bb = { n: b.n, book: b.book, testament: bibleTestament_(b.testament), group: b.group, translation: t.say, text: text,
                   dir: t.dir, lang: t.lang, slot: bibleSlot_(b.n, t.dir), words: bibleBookWords_(b) + ' ' + (BIBLE_TR_WORDS[t.tr] || t.say) };
      const at = st[b.n - 1] = [];
      b.chapterVerses.forEach((count, ci) => {
        const c = ci + 1, cite = bibleCite_(b, c) + ':';
        at.push(list.length);
        for (let v = 1; v <= count; v++) {
          list.push({ kind: 'bible', key: head + b.n + ':' + c + ':' + v, name: cite + v, sub: b.book,
                      shelf: WRITINGS_SHELF, wSrc: 'bible', topic: reg.topic, subject: rs, image: '', row: null, text: bb.words, bb: bb, ch: N(c), v: N(v) });
        }
      });
    });
  });
  return { list: list, starts: starts };
}

/* THE VERSE LIST, BUILT ONCE A VISIT — the first time the Bible is opened, never for anybody else. § */
function bibleVerses_() {
  if (!bibleFor_()) return [];
  const ix = BIBLE.index;
  if (!ix) return [];
  if (!BIBLE.verses || BIBLE.verses.from !== ix) {
    const made = bibleVerseList_(ix);
    SORTED_ITEMS.set(made.list, made.list);
    BIBLE.verses = { from: ix, list: made.list, starts: made.starts };
  }
  return BIBLE.verses.list;
}

/* ONE VERSE BY ITS KEY, by arithmetic: § */
function bibleByKey_(k) {
  const m = /^bible:([a-z0-9]+):(\d+):(\d+):(\d+)$/.exec(String(k || ''));
  const ix = BIBLE.index;
  if (!m || !ix) return null;
  const list = bibleVerses_();
  const st = BIBLE.verses && BIBLE.verses.starts[m[1]];
  const at = st && st[Number(m[2]) - 1];
  const i = at ? at[Number(m[3]) - 1] : undefined;
  if (i == null) return null;
  const x = list[i + Number(m[4]) - 1];
  return x && x.key === k ? x : null;
}

/* ---------- THE LAST LINE UNDER THE QUESTION, ONCE NOTHING IS LEFT TO ASK § */
function bibleEnd_(items) {
  if (!items.length || !items.every(x => x && isBible_(x))) return null;
  const first = items[0], last = items[items.length - 1];
  const end = text => ({ type: 'text', look: 'find-end', text });
  if (!first.bb) {
    if (BIBLE.index) return null;
    return BIBLE.failed ? end(['The list of the Bible\u2019s books did not arrive. ', { b: 'Try again is under the cover.' }]) : { type: 'wait', on: true };
  }
  if (items.length === 1) return end([first.name + '. ', { b: SWIPE_UP + ' for it.' }]);
  const to = first.bb === last.bb ? last.ch + ':' + last.v : last.name;
  return end([first.name + ' to ' + to + '. ', { b: `${SWIPE_UP} for the ${items.length.toLocaleString('en-GB')} verses.` }]);
}

/* EVERY VERSE A CARD ON THE EVERYDAY LIST (499), as the Quran's: § */
function bibleItems_() {
  if (!bibleFor_()) return [];
  if (USER || !ruleOn_('finder-members')) bibleIndex_();
  if (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null) return [];
  const list = bibleVerses_();
  BIBLE.item = list[0] || null;
  return list;
}

/* ---------- A VERSE (the cover went in 499). */
function bibleCard_(x) {
  return x && x.bb ? bibleVerseCard_(x) : '';
}
/* ---------- THE ONE VIEWER (owner, 9 Nov): a library card's book, paper, video or PDF opens inside its own card, never a new tab; a video plays there, not full screen. */
function fileViewKind_(u) {
  const s = String(u || '');
  if (/youtube\.com\/watch|youtu\.be\//i.test(s)) return 'youtube';
  if (/\.(mp4|webm|m4v|mov)(\?|#|$)/i.test(s)) return 'video';
  if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(s)) return 'image';
  return 'page';
}
/* ---------- A POLICY (docs/policies/*.md) OPENS AS A PAGE, its placeholders filled from `DATA.policy`; a missing value reads "[to follow]". */
const POLICY_FILL = { '[DSL name]': 'dsl', '[deputy DSL name]': 'deputy', '[email]': 'email', '[phone]': 'phone',
  '[address]': 'address', '[ICO registration number]': 'ico', '[insurer]': 'insurer' };
function policyName_(u) { const m = /docs\/policies\/([\w-]+)\.md(\?|#|$)/.exec(String(u || '')); return m ? m[1] : ''; }
function policyFill_(md) {
  const p = (typeof DATA !== 'undefined' && DATA && DATA.policy) || {};
  return String(md || '').replace(/\[(DSL name|deputy DSL name|email|phone|address|ICO registration number|insurer)\](?!\()/g,
    (all) => String(p[POLICY_FILL[all]] || '').trim() || '[to follow]');
}
/* Escape first, then mark up: headings, lists, tables, bold, italic and links (a sibling policy opens in place too). */
function policyInline_(t) {
  return esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, txt, href) => {
      const h = href.replace(/&amp;/g, '&');
      if (/^https:/i.test(h)) return `<a href="${esc(h)}" data-do="file-view">${txt}</a>`;
      if (/^(mailto:|tel:)/i.test(h)) return `<a href="${esc(h)}">${txt}</a>`;
      if (/^[\w-]+\.md$/.test(h)) return `<a href="${esc(policyHref_(h))}" data-do="file-view">${txt}</a>`;
      return txt;
    });
}
function policyMd_(md) {
  const lines = String(md || '').split(/\r?\n/), out = [];
  let list = '', para = [];
  const flush = () => { if (para.length) out.push('<p>' + policyInline_(para.join(' ')) + '</p>'); para = []; if (list) { out.push('</' + list + '>'); list = ''; } };
  const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], h = /^(#{1,4})\s+(.*)$/.exec(l), li = /^\s*(?:[-*]|(\d+)\.)\s+(.*)$/.exec(l);
    if (!l.trim()) { flush(); continue; }
    if (h) { flush(); const n = Math.min(h[1].length + 1, 5); out.push(`<h${n}>${policyInline_(h[2])}</h${n}>`); continue; }
    if (/^\s*\|/.test(l) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
      flush();
      const rows = [];
      for (i += 2; i < lines.length && /^\s*\|/.test(lines[i]); i++) rows.push(cells(lines[i]));
      i--;
      out.push('<div class="policy-table"><table><thead><tr>' + cells(l).map(c => `<th>${policyInline_(c)}</th>`).join('') + '</tr></thead><tbody>'
        + rows.map(r => '<tr>' + r.map(c => `<td>${policyInline_(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (li) {
      const kind = li[1] ? 'ol' : 'ul';
      if (para.length) { out.push('<p>' + policyInline_(para.join(' ')) + '</p>'); para = []; }
      if (list !== kind) { if (list) out.push('</' + list + '>'); out.push('<' + kind + '>'); list = kind; }
      out.push('<li>' + policyInline_(li[2]) + '</li>');
      continue;
    }
    if (list) { out.push('</' + list + '>'); list = ''; }
    para.push(l.trim());
  }
  flush();
  return out.join('');
}
function policyView_(u, host, name) {
  const box = document.createElement('div');
  box.className = 'file-view file-view-policy';
  box.setAttribute('data-url', u);
  box.innerHTML = `<div class="policy-page">${loading_()}</div><div class="tile-row">${tile_({ icon: 'close', label: 'Close', act: 'file-view-close' })}</div>`;
  host.appendChild(box);
  const page = box.querySelector('.policy-page'), show = md => { page.innerHTML = policyMd_(policyFill_(md)); };
  const get = url => fetch(url, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
  /* The served copy beside the site first, the brand's address second. */
  get('docs/policies/' + name + '.md').catch(() => get(u)).then(show)
    .catch(() => { page.innerHTML = `<p class="note">This policy could not be loaded. <a href="${esc(u)}">Open it</a>.</p>`; });
  return true;
}
/* HOW EACH KIND OF FILE IS SHOWN in place; anything else is framed. A YouTube link is framed by its no-cookie embed. */
const fileFrame_ = (u, name) => `<iframe class="file-view-f" src="${esc(u)}" title="${name}" loading="lazy" allow="encrypted-media; picture-in-picture"></iframe>`;
const FILE_VIEW_BODY = {
  video: u => `<video class="file-view-v" src="${esc(u)}" controls playsinline preload="metadata"></video>`,
  image: (u, name) => `<img class="file-view-i" src="${esc(u)}" alt="${name}">`,
  youtube: (u, name) => {
    const yt = (/[?&]v=([\w-]{6,})/.exec(u) || /youtu\.be\/([\w-]{6,})/.exec(u) || [])[1];
    return fileFrame_(yt ? 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yt) + '?playsinline=1' : u, name);
  },
};
function fileView_(u, host, title) {
  if (!host || !/^(https:\/\/|data\/|docs\/policies\/)/.test(String(u || ''))) return false;
  const had = host.querySelector(':scope > .file-view');
  if (had) { const same = had.getAttribute('data-url') === u; had.remove(); if (same) return true; }
  if (policyName_(u)) return policyView_(u, host, policyName_(u));
  const kind = fileViewKind_(u), name = esc(title || 'File');
  const body = (Object.prototype.hasOwnProperty.call(FILE_VIEW_BODY, kind) ? FILE_VIEW_BODY[kind] : fileFrame_)(u, name);
  const box = document.createElement('div');
  box.className = 'file-view file-view-' + kind;
  box.setAttribute('data-url', u);
  box.innerHTML = body + `<div class="tile-row">${tile_({ icon: 'close', label: 'Close', act: 'file-view-close' })}</div>`;
  host.appendChild(box);
  return true;
}
on('file-view', (el, e) => {
  const host = el.closest('.card, .qcard, .msg, .pane') || el.parentElement;
  const u = String(el.getAttribute('data-url') || el.getAttribute('href') || '');
  /* A LINK KEEPS ITS href AS THE FALLBACK: opened in place, the browser's own leaving is stopped (68a). */
  if (fileView_(u, host, el.getAttribute('data-title') || el.getAttribute('aria-label')) && e && e.preventDefault) e.preventDefault();
});
on('file-view-close', el => { const v = el.closest('.file-view'); if (v) v.remove(); });
