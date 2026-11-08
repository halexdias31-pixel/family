
/* ---------- AN EXAM INSERT (455): ONE CARD, THE WHOLE SHEET, TAGGED AS A PAPER IS ---------- */
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
  if (typeof USER === 'undefined' || !USER || !USER.token) return '<p class="sub lib-sign">Sign in to read the source — your account is a few screens to the right.</p>';
  const t = 'in:' + r.id;
  if (LIB.gone.has(t)) return '<p class="empty">' + (r.pending ? 'Coming soon.' : 'This source is not in the library yet.') + '</p>';
  if (LIB.failed) return `<p class="empty">Couldn’t load this.<br><span class="faint">${esc(LIB.failed)}</span><br><button type="button" class="text-action" data-do="lib-retry">Try again</button></p>`;
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
const insertRow_ = id => (DATA.inserts || []).find(r => r.id === id) || null;
/* THE SHEET ITSELF, on paper: each line a name and its formula, typeset as a question's maths is (`typeset_`). */
function insertSheet_(r) {
  const mark = l => (l.higher ? '<span class="tb-h" title="Higher tier only">H</span>' : '')
    + (l.only ? `<span class="insh-only">${esc(l.only)} only</span>` : '');
  const body = r.table === 'periodic' ? insertTable_(r) : r.sections.map(s => `<section class="insh-sec">
      <h4>${esc(s.head || '')}</h4>
      <ul>${(s.lines || []).map(l => `<li><span class="insh-fn">${esc(l.name || '')}${mark(l)}</span>
        <span class="insh-fm">${typeset_(String(l.math || ''))}</span>${l.note ? `<span class="insh-note">${esc(l.note)}</span>` : ''}</li>`).join('')}</ul>
    </section>`).join('');
  if (insReading_(r)) {
    return `<div class="insh-sheet insh-reading">
    <p class="insh-kick">${esc(['Insert'].concat(r.boards).join(' · '))}</p>
    <h3>${esc(r.name)}</h3>
    ${r.summary ? `<p class="insh-sum">${esc(r.summary)}</p>` : ''}
    ${r.sourceText ? `<div class="insrc${r.lineNumbers ? ' has-lines' : ''}">${insSource_(r)}</div>`
      : `<div class="insrc insrc-wait${r.lineNumbers ? ' has-lines' : ''}" data-ins="${esc(r.id)}">${insSay_(r)}</div>`}
  </div>`;
  }
  return `<div class="insh-sheet">
    <p class="insh-kick">${esc(['Insert'].concat(r.boards).join(' · '))}</p>
    <h3>${esc(r.name)}</h3>
    ${body}
    <p class="insh-check"><b>${r.verified ? 'Checked' : 'Not yet checked'}</b> ${esc(r.verifiedNote)}</p>
  </div>`;
}
/* THE PERIODIC TABLE: 18 columns, an element where its group and period put it. */
function insertTable_(r) {
  const cells = r.elements.map(e => `<div class="insh-el" style="grid-column:${Number(e[4])};grid-row:${Number(e[5])}">
      <span class="insh-ar">${esc(String(e[3]))}</span><b>${esc(e[1])}</b><span class="insh-nm">${esc(e[2])}</span><span class="insh-z">${Number(e[0])}</span></div>`).join('');
  return `<div class="insh-pt-wrap"><div class="insh-pt" role="table" aria-label="Periodic table">${cells}</div></div>
    <p class="insh-key">In each box: relative atomic mass, symbol, name, atomic number.</p>`;
}
function insertCard_(x) {
  const r = x.row;
  insWant_(r);
  return `<div class="card insh">
    ${tagRow_(x)}
    ${insertSheet_(r)}
  </div>`;
}
/* EXTRAS ON A CARD'S ONE ROW (`CARD_EXTRAS_`): an insert's Print and official copies; a timeline's animation (`tlExtras_`). */
function insertExtras_(x) { return [{ icon: 'print', label: 'Print', note: 'or save as PDF', act: 'ins-print', data: { id: x.row.id } }]
  .concat((x.row.official || []).map(o => ({ icon: 'open', label: 'Official', note: o.label, act: 'ins-official', data: { url: o.url } }))); }
on('ins-official', el => {
  const u = String(el.getAttribute('data-url') || '');
  if (/^https:\/\//.test(u)) window.open(u, '_blank', 'noopener');
});
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
    const to = histRow_(id) || (typeof worksRowOf_ === 'function' ? worksRowOf_(id) : null);
    if (!to || seen.has(id) || id === r.id) return;
    seen.add(id); out.push({ id: id, label: label, row: to });
  };
  const K = { MS: 'Manuscript', FIG: /^EV-/.test(r.id) ? 'Figure' : 'Author', WR: 'Writing', EV: 'Event' };
  const kindOfId = id => K[String(id).split('-')[0]] || '';
  ['writings', 'manuscripts', 'author_id', 'figures', 'events'].forEach(c => histList_(r[c]).forEach(id => { if (HIST_ID.test(id)) add(id, kindOfId(id)); }));
  histList_(r.relations).forEach(p => {
    const m = /^([^:]+):\s*(.+)$/.exec(p);
    if (m && HIST_ID.test(m[2].trim())) add(m[2].trim(), histCap_(m[1]));
  });
  (DATA.writings || []).forEach(w => {
    if (w.author_id === r.id || histList_(w.manuscripts).indexOf(r.id) >= 0) add(w.id, 'Writing');
  });
  (DATA.manuscripts || []).forEach(m => { if (histList_(m.writings).indexOf(r.id) >= 0) add(m.id, 'Manuscript'); });
  (DATA.figures || []).forEach(f => { if (histList_(f.writings).indexOf(r.id) >= 0) add(f.id, 'Author'); });
  (DATA.timeline || []).forEach(e => { if (histList_(e.figures).concat(histList_(e.writings)).indexOf(r.id) >= 0) add(e.id, 'Event'); });
  (DATA.figures || []).forEach(f => { if (histList_(f.events).indexOf(r.id) >= 0) add(f.id, 'Figure'); });
  return out;
}
const histCap_ = s => { const t = String(s || '').trim(); return t ? t[0].toUpperCase() + t.slice(1) : ''; };

/* THE ITEM: Library, on the History shelf, as boxers are on Boxing's. */
function histItem_(kind, r) {
  const fig = kind === 'figure';
  if (fig) return { kind: 'people', hdb: true, name: histName_(r), key: 'hdb:' + r.id, pixId: r.id, image: '', sub: '', histKind: 'People',
    born: personYear_(r.born_year), died: personYear_(r.died_year), from: r.born_place || '', roles: histList_(r.roles),
    shelf: 'History', subject: 'History', text: plainText_(Object.keys(r).map(k => r[k]).join(' ')), row: r };
  const life = fig ? [histYear_(r.born_year), histYear_(r.died_year)] : [];
  const span = fig ? (life[0] || life[1] ? (life[0] || '?') + '–' + (life[1] || '?') : '') : r.date_text;
  const ev = kind === 'event';
  return {
    kind: kind, hdb: true, name: histName_(r), key: 'hdb:' + r.id, image: '',
    sub: (ev ? [span, r.theatre] : [fig ? span : kind === 'writing' ? r.title_original : r.repository, fig ? histList_(r.roles)[0] : span]).filter(Boolean).join(' · '),
    histKind: kind === 'manuscript' ? 'Manuscripts' : ev ? 'Events' : 'Writings',
    /* A WRITING IS ON THE WRITINGS SHELF WHEREVER IT CAME FROM (600): History › Shelf no longer splits the written works in two. */
    shelf: kind === 'writing' ? WRITINGS_SHELF : 'History', subject: 'History',
    text: plainText_(Object.keys(r).map(k => r[k]).join(' ')),
    row: r,
  };
}
/* A DRAWN MANUSCRIPT IS ONE CARD A SIDE (507), tagged Front (recto) or Back (verso); the first drawn keeps the bare key, so a saved key still opens. */
const MS_SIDE_SAY = { front: 'Front (recto)', back: 'Back (verso)' };
function histItems_(kind, r) {
  const one = histItem_(kind, r), L = kind === 'manuscript' && MS_LOOK[r.id];
  if (!L || !L.sides) return [one];
  return L.sides.map((sd, i) => Object.assign({}, one, { key: i ? one.key + ':' + (sd.side || i) : one.key,
    msSide: MS_SIDE_SAY[sd.side] || '', msSideIx: i, sub: [MS_SIDE_SAY[sd.side], one.sub].filter(Boolean).join(' · ') }));
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
      <figcaption>${esc(s.name + ' · ' + s.what)}</figcaption>
    </figure>`;
  };
  return `<figure class="hdb-ms hdb-ms-${L.stuff}">
    <div class="hdb-ms-sides">${leaf(side, ix | 0)}</div>
    <figcaption>A drawing after the original, traced from a public-domain photograph (${esc(L.ref)}); the letters are the ones that survive.</figcaption>
  </figure>`;
}
/* THE LINES A MANUSCRIPT'S TAGS ALREADY SAY (owner, 7 Nov: facts as tags), left out of the pages after its card. */
const MS_SAID = ['Repository', 'Date'];
/* ITS FACTS AS TAGS: when and where it was found, when it is dated to (`Held at` is the repository's own tag). */
const msFound_ = x => (isManuscript_(x) && histCol_(x, 'provenance')[0]) || '';
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
    .filter(l => !(isManuscript_(x) && MS_SAID.indexOf(l[0]) >= 0));
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
  return rows.length ? `<div class="card fc hdb hdb-more"><div class="fc-head"><h3>${esc(x.name)}</h3></div>${histDl_(rows)}</div>` : '';
}
/* THE ESSENTIALS (498): "don't need so many" -- three links and one source, on the card's one row (`CARD_EXTRAS_`). */
function histExtras_(x) {
  const r = x.row || {}, read = isWriting_(x) && typeof worksFirstKey_ === 'function' ? worksFirstKey_(r.id) : '';
  const icon = l => (l.id.indexOf('MS-') === 0 ? 'doc' : l.id.indexOf('WR-') === 0 ? 'book' : 'flag');
  return [read ? { icon: 'book', label: 'Read it', note: 'a page a chapter', act: 'find-open', data: { key: read } } : null]
    .concat(histLinks_(r).slice(0, HIST_TILE_LINKS).map(l => ({ icon: icon(l), label: l.label, note: histName_(l.row), act: 'find-open', data: { key: l.row.key || 'hdb:' + l.id } })),
      histList_(r.sources).filter(u => /^https:\/\//.test(u)).slice(0, 1).map(u => ({ icon: 'ext', label: 'Source', note: u.replace(/^https:\/\/(www\.)?/, '').split('/')[0], href: u }))); }
function histCard_(x) {
  const r = x.row || {};
  /* A MANUSCRIPT IS MINIMAL (owner, 7 Nov): its picture first where drawn, then its facts as tags; no title, no grey line. */
  if (isManuscript_(x)) return `<div class="card fc hdb hdb-msc lib-c" aria-label="${esc(x.name)}">${msFragSvg_(r, x.msSideIx) || libPic_('manuscript', x.name)}${tagRow_(x)}</div>`;
  /* EVERY LIBRARY CARD LOOKS ONE WAY (owner's look rule): its picture, its facts as tags, its name; the long lines are its pages. */
  return `<div class="card fc hdb lib-c">
    ${libPic_(x.kind, x.name)}
    ${tagRow_(x)}
    <div class="fc-head"><h3>${esc(x.name)}</h3></div>
    ${writingRefs_(r.id)}
  </div>`;
}

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
                item: null, verses: null, rank: null, hays: null };

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
    ['the Talmud', typeof TALMUD !== 'undefined' ? TALMUD : null, typeof talmudFor_ === 'function' && talmudFor_()],
    ['the Hadith', typeof HADITH !== 'undefined' ? HADITH : null, typeof hadithFor_ === 'function' && hadithFor_()],
    ['the other writings', typeof WORKS !== 'undefined' ? WORKS : null, true]]
    .filter(b => b[1] && b[2]);
  if (books.some(b => b[1].asking)) return loading_();
  const gone = books.filter(b => b[1].failed).map(b => b[0]);
  return gone.length ? '<p class="find-end">The list of ' + esc(gone.join(' and ')) + ' did not arrive. <b>Pull down to try again.</b></p>' : '';
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
      if (ok) { BIBLE.index = d; BIBLE.rank = bibleRankOf_(d); BIBLE.hays = d.books.map(bibleHay_); WRITING_CAME.bible = true; }
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
/* WHAT EVERY VERSE OF ONE BOOK IS FOUND BY, BAR ITS OWN NUMBERS: § */
const bibleHay_ = b => stuffHay_({ name: bibleCite_(b, ''), sub: b.book, text: bibleBookWords_(b) });

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
  const st = typeof RES_ST !== 'undefined' ? RES_ST : STUFF;
  const f = (st.filters || []).find(x => x.field === 'wBook' && x.value != null);
  if (!f || !BIBLE.rank || !BIBLE.rank.b) return 0;
  return BIBLE.rank.b[spellKey_(f.value)] || 0;
}
/* THE CHOSEN TRANSLATION'S FOLDER: '' for the KJV, or when none is chosen yet. */
function bibleChosenDir_() {
  const st = typeof RES_ST !== 'undefined' ? RES_ST : STUFF;
  /* BY THE LANGUAGE AND THE TRANSLATION CHOSEN (546), either or both: an original text (the Septuagint) is its language alone. */
  const f = (st.filters || []).find(x => x.field === 'wText' && x.value != null), l = (st.filters || []).find(x => x.field === 'wLanguage' && x.value != null);
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
  const n = TABS.some(t => t.id === 'res') ? bibleChosen_() : 0, k = bibleSlot_(n, bibleChosenDir_());
  if (!n || !bibleFor_() || BIBLE.books[k] || BIBLE.loading[k] || BIBLE.missed[k]) return [];
  return [{ key: 'bible:' + n, kind: 'bible', d: aheadDist_('res', null), run: bibleAhead_ }];
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
  if (!items.length || !items.every(x => x && isBible_(x))) return '';
  const first = items[0], last = items[items.length - 1];
  if (!first.bb) {
    if (BIBLE.index) return '';
    return BIBLE.failed
      ? '<p class="find-end">The list of the Bible&rsquo;s books did not arrive. <b>Try again is under the cover.</b></p>'
      : loading_();
  }
  if (items.length === 1) return `<p class="find-end">${esc(first.name)}. <b>${SWIPE_UP} for it.</b></p>`;
  const to = first.bb === last.bb ? last.ch + ':' + last.v : last.name;
  return `<p class="find-end">${esc(first.name)} to ${esc(to)}.
      <b>${SWIPE_UP} for the ${items.length.toLocaleString('en-GB')} verses.</b></p>`;
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
