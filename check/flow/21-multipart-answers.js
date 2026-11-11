/* ---------- A PLAIN CALENDAR (466): NO TERM, SESSION, EXAM OR HOLIDAY IS LAID ON IT ---------- */
check('466: the calendar is a plain month — the days and today, with no term, half term, session, exam, closure or event on it, and no key', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof w.initCalendar !== 'function') return ['initCalendar is not reachable, so the calendar was NOT checked — not a pass'];
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const on = n => String(n).padStart(2, '0') + '/' + String(m + 1).padStart(2, '0') + '/' + y;
  const D = t.DATA();
  D.liveJobs = D.jobs = [{ id: 'J-CAL', jobId: 'J-CAL', subject: 'Maths', time: '16:00', day: 'Monday', client: 'Pat Parent', tutor: 'GeorgePovey',
    status: 'active', slots: [], dates: [on(3), on(17)].join(', '), location: 'Mitcham library' }];
  D.intervals = [{ term: 'Autumn 2', label: 'Autumn 2', kind: 'term', startDate: on(5), endDate: '19/12/' + (y + 1) },
    { term: 'October Half Term', label: 'October Half Term', kind: 'half-term', startDate: on(20), endDate: on(22) }];
  D.closures = [{ date: on(9), name: 'Early May bank holiday', kind: 'bank' }];
  D.exams = [{ personId: 'P1', who: 'Pat Parent', subject: '', label: 'Small exam', date: on(12), kind: 'mock' }];
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'client', roles: ['client'] });
  const host = await toolBox_(w, 'calendar', '#cal-body');
  if (!host) return ['the calendar did not draw on Tools — NOT checked'];
  w.initCalendar();
  const bad = [];
  const days = new Date(y, m + 1, 0).getDate();
  if (host.querySelectorAll('.cal-d').length !== days) bad.push('the month draws ' + host.querySelectorAll('.cal-d').length + ' days, wanted ' + days);
  if (!host.querySelector('.cal-d.cal-today')) bad.push('today is not marked');
  if (host.querySelector('.dot, .cal-dots, .cal-d.has, [data-do]')) bad.push('a day carries a mark or a control — the calendar is plain (466)');
  if (d.querySelector('.cal-key-box, .cal-key')) bad.push('a key is drawn under the month');
  if (['calendarMarks', 'calKey_'].some(f => typeof w[f] === 'function') || 'cal-day' in t.ACTIONS) bad.push('the calendar\'s marks, key or day sheet are still wired');
  return bad;
});

/* MULTI-PART QUESTIONS — THE FOLLOW-UPS TO THE OWNER'S § */
/* A PAYLOAD ROW, the shape `libraryInto_` hands `questionItems` -- the fields it reads and no more. */
const mpRow_ = (paper, name, q, part, extra) => Object.assign({ id: 'Q-' + paper + '-' + q + part, paper: paper, paper_id: paper,
  q: String(q), part: part, kind: 'question', name: name, subject: 'Maths', marks: 1,
  html: '<p>' + paper + ' Q' + q + part + '</p>' }, extra || {});

/* FINDING 12 AND 13: a question's parts in the order the paper prints them, whatever the spelling and
   however many, and two papers sharing a name never shuffled together. */
check('multipart: parts sort by their value within a question, and two papers with one name do not interleave', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.questionItems !== 'function' || typeof w.stuffSorted_ !== 'function') return ['questionItems or stuffSorted_ not reachable — renamed? The order was NOT checked'];
  const D = w.__t.DATA();
  const held = D.questions;
  const same = 'Paper 1 (Non-calculator) — June 2024';
  const rows = [];
  const add = (paper, name, q, parts) => parts.forEach(p => rows.push(mpRow_(paper, name, q, p)));
  /* SHUFFLED ON PURPOSE, so the order out is the sort's and not the file's. */
  add('P-MP-L', 'Letters', 1, ['j', 'h', 'i']);
  add('P-MP-R', 'Numerals', 2, ['x', 'ii', 'ix', 'v', 'i', 'iv', 'iii', 'vi', 'viii', 'vii', 'xi']);
  add('P-MP-N', 'Numbers', 3, ['10', '2', '1', '11', '9']);
  add('P-MP-A', 'Nested', 4, ['b', 'a(ii)', 'a', 'b(i)', 'a(i)', 'dii', 'di', 'c']);
  add('P-MP-1H', same, 13, ['b', 'a']);
  add('P-MP-1F', same, 13, ['b', 'a']);
  D.questions = rows;
  let order = [];
  try { order = w.stuffSorted_(w.questionItems()).map(x => x.row.paper + ':' + x.qPart); }
  catch (e) { bad.push('sorting threw: ' + e.message); }
  finally { D.questions = held; }
  const of = paper => order.filter(o => o.indexOf(paper + ':') === 0).map(o => o.split(':')[1]).join(' ');
  [['P-MP-L', 'h i j', 'letters h, i, j -- a lone "i" here is the ninth letter, not a numeral'],
   ['P-MP-R', 'i ii iii iv v vi vii viii ix x xi', 'numerals by value -- "ix" used to sort before "v"'],
   ['P-MP-N', '1 2 9 10 11', 'numbered parts past 9 -- they sorted 1, 10, 11, 2'],
   ['P-MP-A', 'a a(i) a(ii) b b(i) c di dii', 'letters, then each letter\'s numerals']].forEach(([p, want, what]) => {
    if (of(p) !== want) bad.push(what + ': got "' + of(p) + '", wanted "' + want + '"');
  });
  /* THE SAME NAME, TWO PAPERS: each paper's parts together. */
  const twin = order.filter(o => /^P-MP-1[FH]:/.test(o)).map(o => o.replace('P-MP-', '')).join(' ');
  if (twin !== '1F:a 1F:b 1H:a 1H:b') bad.push('two papers called "' + same + '" read "' + twin + '" -- their parts interleave');
  return bad;
});

/* A SMALL LIBRARY OF MULTI-PART QUESTIONS, made into the funnel's own items by `questionItems` and handed to Find as its whole list -- `stuffItems` replaced, so § */
function mpLibrary_(w, rows) {
  const D = w.__t.DATA();
  const held = { q: D.questions, si: w.stuffItems, sa: w.stuffItemsAll_ };
  D.questions = rows;
  const items = w.questionItems();
  D.questions = held.q;
  w.stuffItems = () => items;
  w.stuffItemsAll_ = () => items;
  return { items, put: () => { w.stuffItems = held.si; w.stuffItemsAll_ = held.sa; } };
}
const MP_SVG = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>';
const mpBank_ = () => [
  { id: 'S-MP-W-8', paper: 'P-MP-W', paper_id: 'P-MP-W', q: '8', kind: 'preamble', name: 'Whole', html: '<p>OA, OB and OC are three straight lines.</p>', diagram: MP_SVG },
  mpRow_('P-MP-W', 'Whole', 8, 'i', { html: '<p>Work out the size of angle x.</p>', answer: '<b>50°</b>' }),
  mpRow_('P-MP-W', 'Whole', 8, 'ii', { html: '<p>Give a REASONWORD for your answer.</p>', answer: '<b>angles on a line</b>' }),
  mpRow_('P-MP-W', 'Whole', 18, '', { html: '<p>Eighteen.</p>' }),
  { id: 'S-MP-W-1d', paper: 'P-MP-W', paper_id: 'P-MP-W', q: '1', part: 'd', kind: 'preamble', name: 'Whole',
    html: '<p>A car moves from REST.</p>', diagram: '<svg viewBox="0 0 10 10" class="mp-car"><path d="M0 10 10 0"/></svg>' },
  mpRow_('P-MP-W', 'Whole', 1, 'c', { html: '<p>One c.</p>' }),
  mpRow_('P-MP-W', 'Whole', 1, 'd(i)', { html: '<p>One d i.</p>' }),
  mpRow_('P-MP-W', 'Whole', 1, 'd(ii)', { html: '<p>One d ii.</p>' }),
  mpRow_('P-MP-V', 'Other', 8, '', { html: '<p>Another paper\'s eight.</p>' }),
  mpRow_('P-MP-W', 'Whole', 14, 'a', { html: '<p>The graph shows a journey. Work out the speed.</p>', diagram: '<svg viewBox="0 0 10 10" class="mp-graph"><path d="M0 10 10 0"/></svg>' }),
  mpRow_('P-MP-W', 'Whole', 14, 'b', { html: '<p>Work out an estimate for the distance.</p>' }),
  mpRow_('P-MP-W', 'Whole', 20, 'a', { html: '<p>Use the graph to find the gradient.</p>' }),
  mpRow_('P-MP-W', 'Whole', 20, 'b', { html: '<p>From the graph, estimate the value of y when x = 3.</p>' }),
  mpRow_('P-MP-W', 'Whole', 21, '', { html: '<p>On the grid, draw the line y = 2x.</p>', answerType: 'drawing' }),
];

/* FINDING 8: two kept parts of one question on Saved -- and on Spotlight -- draw its opening once. */
check('multipart: Saved and Spotlight draw a question\'s opening and its figure once for several kept parts', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['savedPages_', 'spotPages', 'collItems_', 'questionItems'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — Saved was NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const eight = lib.items.filter(x => x.row.paper === 'P-MP-W' && String(x.qNumber) === '8');
  const other = lib.items.find(x => x.row.paper === 'P-MP-V');
  const heldC = w.collItems_;
  w.__t.USER({ name: 'Kept', personId: 'P-KEPT', role: 'student', roles: ['student'] });
  /* KEPT OUT OF ORDER, with another question between them, the way stars are pressed. */
  w.collItems_ = () => [eight[1], other, eight[0]];
  const read = html => {
    const h = d.createElement('div');
    h.innerHTML = html;
    const c = h.querySelector('.qcard') || h.firstElementChild;
    if (!c) return '?';
    if (c.classList.contains('qstem')) return 'stem';
    if (c.classList.contains('qans-card')) return 'ans';
    return (tagText(c, 'number') || '?').replace(/\s.*$/, '');
  };
  try {
    [['Saved', () => w.savedPages_()], ['Spotlight', () => w.spotPages()]].forEach(([where, f]) => {
      const got = f().map(read).join(' ');
      const want = 'Q8(i) ans Q8(ii) ans Q8';   // the opening on each part's card (500)
      if (got !== want) bad.push(where + ' reads "' + got + '", wanted "' + want + '" -- the opening once, the parts in the paper\'s order');
    });
    /* A PART KEPT ALONE STILL HAS ITS OPENING. */
    w.collItems_ = () => [eight[1]];
    const alone = w.savedPages_().map(read).join(' ');
    if (alone !== 'Q8(ii) ans') bad.push('a part kept alone reads "' + alone + '", wanted its card (its opening on it, 500) and its answer');
    const card = w.questionCard_(eight[1]);
    if (!/qstem-fig/.test(card)) bad.push('Q8(ii)\'s card does not carry its opening\'s figure (500)');
  } finally { w.collItems_ = heldC; lib.put(); }
  return bad;
});

/* FINDING 9, AFTER THE TILE WENT. § */
check('multipart: the answer is a swipe after the card -- after a figure printed after it, where there is one -- and no page carries a tile to it', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionCard_', 'questionWhole_', 'pageParts_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the way to the answer was NOT checked'];
  if (w.__t.ACTIONS['qa-go']) bad.push('`qa-go` still has a handler, so a tile to the answer could still be drawn and work');
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const row = id => ({ row_id: id, paper_id: 'P-MP-T', subject: 'Maths', name: 'Tiles' });
  const q = (id, extra) => Object.assign({ kind: 'question', name: 'Q' + id, qNumber: id, marks: 2, key: 'q-mp-t' + id,
    row: row('Q-MP-T-' + id), html: '<p>Do it.</p>', answer: '<b>done</b>' }, extra || {});
  const plain = q('1');
  const grid = q('2', { answerType: 'drawing', surface: 'grid', html: '<p>Draw the line y = 2x.</p>' });
  const front = q('3', { diagram: MP_SVG });
  [[plain, '["q"]', 'a card whose answer is the next page'],
   /* THE GRID IS THE CARD'S OTHER FACE NOW, NOT A PAGE BETWEEN IT AND ITS ANSWER (327). */
   [grid, '["q"]', 'a card answered on a grid, the grid on the card itself'],
   /* A FIGURE IS IN ITS CARD (356), so nothing stands between the card and its answer. */
   [front, '["q"]', 'a card with a figure'],
   [q('4', { answerType: 'drawing', diagram: MP_SVG }), '["q"]', 'a card drawn on its own figure, the pen on the card itself']].forEach(([x, want, what]) => {
    /* ONE CARD PER QUESTION NUMBER (960): one page, and the answer is in the part's own card, after its words and its answer row. */
    const got = JSON.stringify(w.pageParts_(x));
    if (got !== want) bad.push(what + ' has pages ' + got + ', wanted ' + want);
    const whole = el(w.questionWhole_(x, [x], null, true)), part = whole.querySelector('.qb-part'), ac = part && part.querySelector('.qans-card');
    if (!ac || part.innerHTML.indexOf('qans-card') < part.innerHTML.indexOf('qsheet')) bad.push(what + ' does not carry its answer in its card, after its words');
    /* AND NOTHING ON ANY OF ITS PAGES TURNS FOR YOU. */
    const all = el(w.questionCard_(x) + '');
    if (all.querySelector('[data-do="qa-go"], .qa-to, .tile-i-next, .qfig-tiles')) bad.push(what + ' still carries a tile to its answer');
  });
  return bad;
});

/* FINDING 2, UNDONE (463): the owner, "remove the 'figure over this page' tile everywhere -- if they want to see the figure, they scroll up". */
check('multipart: no part carries a Figure tile, though a figure stands in front of it, and nothing opens one', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['stuffCard', 'questionItems'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the Figure tile was NOT checked'];
  if (w.__t.ACTIONS['q-fig']) bad.push('q-fig still has a handler');
  const lib = mpLibrary_(w, mpBank_());
  try {
    const parts = lib.items.filter(x => x.row.paper === 'P-MP-W');
    if (!parts.length) bad.push('no P-MP-W parts in the library — nothing was checked');
    parts.forEach(x => {
      const h = d.createElement('div');
      h.innerHTML = w.stuffCard(x, 0) + '';
      if (h.querySelector('[data-do="q-fig"], .q-figt')) bad.push(x.name + ' still carries a Figure tile');
    });
  } finally { lib.put(); }
  return bad;
});

/* FINDING 4: a part whose words name a figure, in a question with none, says so on a page of its own. */
check('multipart: a figure the words name and nobody drew is a "not drawn yet" page, once per run of parts', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionItems', 'pageParts_', 'stuffPart_', 'stuffPages_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the missing figures were NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  const find = name => lib.items.find(x => x.row.paper === 'P-MP-W' && x.name === name);
  try {
    const a = find('Q20a');
    /* ONE LINE IN THE FIRST CARD OF THE RUN, WHERE THE FIGURE WOULD STAND -- no page (356). */
    const gap = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x); return h.querySelectorAll('.qsheet .qfig-missing').length; };
    const b = find('Q20b');
    if (!a || JSON.stringify(w.pageParts_(a)) !== '["q"]') bad.push('Q20a has pages ' + (a && JSON.stringify(w.pageParts_(a))) + ', wanted its card alone, ["q"] -- the gap is a line in it');
    else if (gap(a) !== 1) bad.push('Q20a, "Use the graph" with no graph anywhere, does not say "Figure not drawn yet." once in its card');
    if (b && gap(b)) bad.push('Q20b, the second of the run, says the gap again');
    ['Q14a', 'Q14b', 'Q21'].forEach(n => {
      const x = find(n);
      if (x && gap(x)) bad.push(n + ' says "not drawn yet" though its question has a figure, or it is answered on a surface');
    });
  } finally { lib.put(); S.filters = []; }
  return bad;
});

/* THE OWNER: *"they have their own tag. i could in theory just click answers and only see answers."* -- and then, 6 Oct: § */
check('multipart: "Answers" is a kind at the start of the funnel, and choosing it shows only answer pages, open', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionAnsCard_', 'stuffPages_', 'facetValues', 'facetList', 'stuffPart_', 'stuffFiltered'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the answers view was NOT checked'];
  const A = w.__t.ACTIONS;
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  try {
    /* OFFERED AT THE START, as a kind. */
    S.filters = [];
    /* UNDER PRACTICE (610), a question's own kinds are Which answers. */
    const kind = w.facetList().find(x => x.field === 'kindOwn');
    const said = x => { try { return [].concat(kind.of(x)); } catch (e) { return []; } };
    const withAns = lib.items.find(x => x.name === 'Q8(i)');
    const kinds = kind ? said(withAns) : [];
    if (kinds.indexOf('Answers') === -1) bad.push('a question with an answer tells What kind ' + JSON.stringify(kinds) + ' -- no "Answers" beside its own kind');
    if (kinds.length < 2) bad.push('choosing answers took the question\'s own kind off What kind');
    if (kinds.indexOf('Practice') !== -1) bad.push('Which offers Practice, the kind above it, a second time (680)');
    const noAns = lib.items.find(x => x.kind === 'question' && !w.questionHasAns_(x));
    if (noAns && said(noAns).indexOf('Answers') !== -1) bad.push(noAns.name + ' has no answer and still says "Answers"');
    if (w.facetList().some(x => x.field === 'pageKind')) bad.push('the old hidden Page filter is still a facet');
    /* AND NO TILE ON THE ANSWER PAGE ANY MORE. */
    const a = lib.items.find(x => x.name === 'Q8(i)');
    const h0 = d.createElement('div'); h0.innerHTML = w.questionAnsCard_(a);
    if (h0.querySelector('[data-do="qa-only"], [data-do="qa-all"]')) bad.push('the answer page still draws the "Answers only" switch');
    /* CHOSEN: only answer pages, in order, open. */
    S.filters = [{ field: 'paperId', value: 'P-MP-W' }, { field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Answers' }];
    /* THE FUNNEL STILL ASKS (Question), so the strip is read as the reveal tile shows it (`findDone_`). */
    w.findShow_();
    /* ONE CARD PER QUESTION NUMBER (960): Answers keeps each question's one page with its answers on (`ans`), drawn as Find draws it. */
    const pages = w.stuffPages_();
    const draw = pg => { const h = d.createElement('div'); h.innerHTML = w.questionWhole_(pg.x, pg.parts, pg.open, pg.ans); return h; };
    if (!pages.length || pages.some(pg => pg.part !== 'q' || !pg.ans)) bad.push('the Answers strip holds ' + JSON.stringify(pages.map(pg => (pg.part || 'card') + (pg.ans ? '+ans' : ''))) + ', wanted each question\'s page with its answers on');
    const names = pages.map(pg => (pg.parts || [pg.x]).map(x => x.name).join(' ')).join(' ');
    if (names !== 'Q8(i) Q8(ii)') bad.push('the Answers strip is "' + names + '", wanted Q8(i) Q8(ii) -- the answers there are, in order');
    pages.forEach(pg => (pg.parts || [pg.x]).forEach(x => {
      const c = draw(pg).querySelector('.qb[data-part="' + x.key + '"] .qans-card');
      if (!c || c.classList.contains('is-hidden') || !/50°|angles on a line/.test(c.textContent)) bad.push(x.name + '\'s answer is shut in the Answers view -- "only see answers" is forty Shows in a row otherwise');
    }));
    /* HIDE STILL HIDES ONE. */
    if (A['qa-hide'] && pages[0]) {
      const host = d.createElement('div'); host.className = 'page';
      host.innerHTML = w.questionAnsCard_(pages[0].x);
      d.getElementById('s-stuff').appendChild(host);
      const hide = host.querySelector('[data-do="qa-hide"]');
      if (!hide) bad.push('an open answer in the Answers view has no Hide');
      else {
        A['qa-hide'](hide);
        const again = draw(pages[0]).querySelector('.qb[data-part="' + pages[0].x.key + '"] .qans-card');
        if (!again || !again.classList.contains('is-hidden')) bad.push('Hide did not hide an answer in the Answers view');
      }
      host.remove();
    }
    /* ---------- AND "Questions" MEANS QUESTIONS § */
    S.filters = [{ field: 'paperId', value: 'P-MP-W' }, { field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }];
    /* QUESTIONS: the question pages with no answer drawn on them; NO KIND: each part's answer in its own card, after its words. */
    w.findShow_();
    const qPages = w.stuffPages_();
    if (!qPages.length) bad.push('choosing Questions shows no question pages');
    const leaked = qPages.filter(pg => pg.ans || draw(pg).querySelector('.qans-card'));
    if (leaked.length) bad.push('choosing Questions still draws ' + leaked.length + ' answer(s): ' + leaked.map(pg => pg.x.name).join(', '));
    S.filters = [{ field: 'paperId', value: 'P-MP-W' }];
    w.findShow_();
    const all = w.stuffPages_();
    const answered = [].concat(...all.map(pg => (pg.parts || []).filter(x => w.questionHasAns_(x)).map(x => [pg, x])));
    if (!answered.length) bad.push('the paper with no kind chosen has no question with an answer, so "after its question" was NOT checked');
    answered.forEach(([pg, x]) => {
      const part = draw(pg).querySelector('.qb[data-part="' + x.key + '"] .qb-part');
      if (!part || !part.querySelector('.qans-card') || part.innerHTML.indexOf('qans-card') < part.innerHTML.indexOf('qsheet')) bad.push('with no kind chosen, ' + x.name + '\'s answer is not in its card after its words');
    });
  } finally { lib.put(); S.filters = []; if (w.__t.go) { try { w.__t.go('stuff', false, true); } catch (e) {} } }
  return bad;
});

/* ---------- QUESTIONS CHOSEN: NOT ONE ANSWER ON ANY PAGE, FOR A PUPIL OR A TUTOR § */
check('multipart: with Questions chosen, no page of a two-part paper is an answer or holds one, for a pupil or a tutor', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['stuffPages_', 'stuffPart_', 'stuffCard'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the Questions view was NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  const SAYS = ['50°', 'angles on a line'];
  try {
    for (const [who, u] of [['a pupil', { name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'] }],
                            ['a tutor', { name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'] }]]) {
      w.__t.USER(u);
      S.filters = [{ field: 'paperId', value: 'P-MP-W' }, { field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }];
      const pages = w.stuffPages_().filter(pg => pg.x.qNumber === '8' || String(pg.x.qNumber) === '8');
      if (pages.filter(pg => !pg.part).length !== 2) { bad.push(who + ': Q8 drew ' + pages.filter(pg => !pg.part).length + ' question cards, wanted its two parts -- nothing was asked'); continue; }
      pages.forEach(pg => {
        const h = d.createElement('div');
        h.innerHTML = pg.part ? w.stuffPart_(pg.x, pg.part) : w.stuffCard(pg.x, 0);
        const at = who + ', ' + pg.x.name + ':' + (pg.part || 'card');
        if (pg.part === 'ans' || h.querySelector('.qans-card, .qans, .qans-body')) bad.push(at + ' is an answer page');
        if (tagText(h, 'kind') === 'Answer') bad.push(at + ' is tagged "Answer"');
        SAYS.forEach(t => { if (h.innerHTML.indexOf(t) >= 0) bad.push(at + ' carries the answer "' + t + '" in its markup'); });
      });
    }
  } finally { w.__t.USER(null); lib.put(); S.filters = []; }
  return bad;
});

/* ---------- WHAT KIND: QUESTIONS FIRST, ANSWERS BESIDE IT § */
check('multipart: What kind offers Questions first and Answers next to it, by the kinds tab\'s order, not the alphabet', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  const kind = w.facetList().find(f => f.field === 'kindLabel');
  if (!kind || typeof w.facetValues !== 'function' || typeof w.answerCmp_ !== 'function') return ['the What kind facet, facetValues or answerCmp_ is not reachable — the order was NOT checked'];
  /* ONE SORT FOR EVERY FACET (396): answers that are all kinds go in the kinds tab's order — data, not a table in What kind. */
  const all = ['Answers', 'Library', 'Projects', 'Practicals', 'Questions'];
  const got = all.slice().sort(w.answerCmp_(all)).join(' ');
  /* PROJECTS ARE UNDER LIBRARY (owner, 7 Nov), so they follow it. */
  if (got !== 'Questions Answers Practicals Library Projects') bad.push('What kind orders its answers "' + got + '"');
  if (Object.keys(kind).some(k => ['orderOf', 'cmp', 'bucketOf'].indexOf(k) >= 0)) bad.push('What kind carries an order of its own again: ' + Object.keys(kind).join(', '));
  const labels = Object.values(w.kindMap_()).map(k => k.label);
  if (labels.indexOf('Films') >= 0 || labels.indexOf('Bundles') >= 0) bad.push('the kinds name ' + labels.filter(l => /Films|Bundles/.test(l)).join(', ') + ' — neither is a kind in Find');
  const lib = mpLibrary_(w, mpBank_());
  try {
    const chips = w.facetValues(lib.items, kind).map(v => String(v.show || v.value));
    const own = w.facetList().find(f => f.field === 'kindOwn');
    const under = own ? w.facetValues(lib.items, own).map(v => String(v.show || v.value)) : [];
    /* PRACTICE ALONE (546, 610 `KIND_UNDER`), and Questions then Answers under it. */
    if (chips.join() !== 'Practice') bad.push('over a paper\'s questions the What kind chips read "' + chips.join(' | ') + '", wanted Practice alone');
    if (under[0] !== 'Questions' || under[1] !== 'Answers') bad.push('under Practice the Which chips read "' + under.join(' | ') + '", wanted Questions, then Answers');
  } finally { lib.put(); }
  return bad;
});

/* ---------- FILMS ARE NOT IN FIND, FOR ANYBODY — AN ADMIN WITH THE FILMS IN HAND INCLUDED § */
check('films are not in Find for an admin with films in the payload — not under What kind — and the videos card still finds one', async () => {
  /* THE PROJECTS AND THE PRACTICALS, REAL, so `What kind` has answers of its own to draw — the fixture has no library, and a Learning holding nothing but films § */
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so Find had nothing to ask — NOT checked'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { practicals: read('practicals'), projects: read('projects') })));
  const data = payload();
  data.practicals = made.practicals || [];
  data.projects = made.projects || [];
  data.films = FILMS_;
  data.filmsSync = { at: new Date(Date.now() - 2 * 3600e3).toISOString(), more: false, folder: 'Notflix',
                     found: { films: 4, series: 1, documentaries: 1, placeholders: 1 } };
  const { w } = boot({ payload: data, serve: u => (/data\/videos\.json/.test(u) ? [] : undefined) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (!t || !t.STUFF || typeof w.stuffFiltered !== 'function') return ['Find\'s state is not exported to the journey — nothing was checked'];
  t.USER(Object.assign({}, vidAdmin_));
  if ((t.DATA().films || []).length !== FILMS_.length) return ['the setup: the admin’s DATA holds ' + (t.DATA().films || []).length + ' of ' + FILMS_.length + ' films, so their absence from Find proves nothing'];
  const isFilm = x => x && (x.kind === 'film' || /^fm:/.test(String(x.key || '')) || FILMS_.some(f => f.title === x.name));
  const strays = w.stuffItemsAll_().filter(isFilm);
  if (strays.length) bad.push('Find holds ' + strays.length + ' item(s) made of the admin’s films: ' + strays.map(x => x.kind + ' "' + x.name + '"').join(', '));

  t.go('stuff', false, true);
  await wait(60);
  t.STUFF().filters.length = 0;

  /* ---- WHAT KIND, AS THE QUESTION PAGE DRAWS IT ---- */
  w.paintStuff();
  await wait(30);
  const picks = () => [...d.querySelectorAll('#s-stuff #stuff-groups [data-do="facet-pick"]')];
  const learning = picks().find(b => b.dataset.field === 'forLabel' && b.dataset.value === 'Learning');
  if (learning) { t.ACTIONS['facet-pick'](learning); await wait(30); }
  const kinds = picks().filter(b => b.dataset.field === 'kindLabel' || b.dataset.field === 'kindOwn').map(b => b.dataset.value);
  if (kinds.indexOf('Projects') === -1 || kinds.indexOf('Practicals') === -1) bad.push('What kind was not drawn with Projects and Practicals (the page offers ' + (picks().map(b => b.dataset.field + ':' + b.dataset.value).join(' | ') || 'nothing') + '), so its chips were NOT checked');
  else if (kinds.indexOf('Films') !== -1) bad.push('What kind offers "Films" to an admin: ' + kinds.join(' | '));
  const kindFacet = w.facetList().find(f => f.field === 'kindLabel');
  const answers = kindFacet ? w.facetValues(w.stuffItems(), kindFacet).map(v => String(v.value)) : [];
  if (!answers.length) bad.push('What kind has no answers over the whole list, so the facet was NOT checked');
  else if (answers.indexOf('Films') !== -1) bad.push('over the whole list What kind answers "Films": ' + answers.join(' | '));
  t.STUFF().filters.length = 0;

  /* ---- AND THE VIDEOS CARD STILL FINDS IT ---- */
  const v = await vidCard_(w, vidAdmin_);
  if (!v.box) return bad.concat(['the videos card did not draw on the Reels column, so where films ARE found was NOT checked']);
  v.type('paper moon');
  await wait(30);
  if (v.titles().indexOf(title) === -1) bad.push('the videos card does not find "' + title + '" for "paper moon" — it lists ' + (v.titles().join(' | ') || 'nothing'));
  return bad;
});

/* THE REVIEW OF THE MERGE WITH THE PEN'S BRANCH, FINDINGS 1 AND 5: § */
check('multipart: a "use your graph" part has no "not drawn yet" page and no blank Figure of the part it uses', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['questionItems', 'pageParts_', 'figsBefore_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — "use your graph" was NOT checked'];
  const GRID = '<svg viewBox="0 0 10 10" class="mp-axes"><path d="M0 5h10M5 0v10"/></svg>';
  const rows = mpBank_().concat([
    mpRow_('P-MP-W', 'Whole', 24, 'a', { html: '<p>Complete the table.</p>' }),
    mpRow_('P-MP-W', 'Whole', 24, 'b', { html: '<p>On the grid, draw the graph of y = 2x.</p>', answerType: 'annotate', figure: 'grid-blank', diagram: GRID }),
    mpRow_('P-MP-W', 'Whole', 24, 'c', { html: '<p>Use your graph to find x when y = 3.</p>', uses: 'b' }),
    mpRow_('P-MP-W', 'Whole', 24, 'd', { html: '<p>Read the value off the graph when x = 1.</p>' }),
    /* AND ONE WHOSE GRAPH IS DRAWN ON A SURFACE, so nothing in the question is a printed figure. */
    mpRow_('P-MP-W', 'Whole', 25, 'a', { html: '<p>Draw the line y = x.</p>', answerType: 'drawing', surface: 'coord' }),
    mpRow_('P-MP-W', 'Whole', 25, 'b', { html: '<p>From the graph, find x when y = 3.</p>', uses: 'a' }),
  ]);
  const lib = mpLibrary_(w, rows);
  const find = n => lib.items.find(x => x.row.paper === 'P-MP-W' && x.name === n);
  try {
    const c = find('Q24c'), dd = find('Q24d');
    if (!c || !dd) return ['Q24c or Q24d did not reach the library'];
    /* THE ITEM MAY NOT CARRY `uses` UNTIL THE PEN'S BRANCH LANDS; the row does, and both are read. */
    const b25 = find('Q25b');
    if (!b25 || w.pageParts_(b25).indexOf('nofig') >= 0) bad.push('Q25b "from the graph", which uses the axes Q25a was drawn on, is given a "The paper prints a figure here -- not drawn yet" page beside the page showing that drawing');
    if (w.pageParts_(c).indexOf('nofig') >= 0) bad.push('Q24c "use your graph" is given a "not drawn yet" page -- the figure it names is the child\'s own graph on Q24b');
    const labels = w.figsBefore_(c).map(f => f.html);
    if (labels.some(h => /mp-axes/.test(h))) bad.push('Q24c\'s Figure opens Q24b\'s blank grid -- the picture it reads is the child\'s drawing, not the paper\'s empty copy');
    const h = d.createElement('div');
    h.innerHTML = w.stuffCard(c, 0);
    if (h.querySelector('[data-do="q-fig"]')) bad.push('Q24c offers a Figure tile with nothing in front of it but the grid it uses');
    /* A PART THAT DOES NOT SAY IT USES (b) STILL SEES (b)'s PICTURE -- the rule is the column, not the grid. */
    if (!w.figsBefore_(dd).some(f => /mp-axes/.test(f.html))) bad.push('Q24d, which uses nothing, lost Q24b\'s figure too -- the skip reached past the part that names it');
  } finally { lib.put(); }
  return bad;
});

/* THE REVIEW, FINDING 6: the line above the strip counts what the strip holds -- questions, not the parts
   that matched. */
check('multipart: inside a chosen paper the funnel goes on by the one rule — Question, then Part — and Answers keeps the answer pages', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.stuffQuestion !== 'function' || typeof w.stuffFiltered !== 'function' || typeof w.stuffPages_ !== 'function') return ['stuffQuestion, stuffFiltered or stuffPages_ not reachable — the paper was NOT checked'];
  const lib = mpLibrary_(w, mpBank_());
  const S = w.__t.STUFF();
  const ask = more => {
    S.filters = [{ field: 'paperId', value: 'P-MP-W' }].concat(more || []);
    const h = w.document.createElement('div');
    h.innerHTML = w.stuffQuestion();
    const btns = [...h.querySelectorAll('[data-do="facet-pick"]')];
    return { field: btns.length ? btns[0].dataset.field : '', vals: btns.map(b => b.textContent.trim()), end: h.textContent.replace(/\s+/g, ' ').trim() };
  };
  try {
    /* THE WHOLE PAPER: its six questions, each once however many parts — asked, not an end (396). */
    /* WHICH FIRST (660): a kind question is asked however lopsided — "why has it not asked me for question or answer?" */
    const which = ask();
    if (which.field !== 'kindOwn' || which.vals.join(' ') !== 'Questions Answers') bad.push('the chosen paper asks ' + (which.field || 'nothing') + ' ' + JSON.stringify(which.vals) + ' first — Which, Questions Answers (660)');
    const all = ask([{ field: 'kindOwn', value: 'Questions' }]);
    if (all.field !== 'qNumber' || all.vals.join(' ') !== 'Q1 Q8 Q14 Q18 Q20 Q21') bad.push('the chosen paper asks ' + (all.field || 'nothing') + ' ' + JSON.stringify(all.vals) + ' — Question, Q1 Q8 Q14 Q18 Q20 Q21');
    /* Q8 PRESSED: its two parts, so the next question splits them. */
    const q8 = ask([{ field: 'kindOwn', value: 'Questions' }, { field: 'qNumber', value: 'Q8' }]);
    if (q8.field === 'qNumber') bad.push('Q8 pressed in the paper still asks Question — it has one answer');
    if (w.stuffFiltered().some(x => String(x.qNumber) !== '8')) bad.push('Q8 pressed keeps a part that is not Q8');
    /* ANSWERS: the answer pages, and only those, through the page's own tag. */
    ask([{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Answers' }]);
    /* STILL ASKING, so read as the reveal tile shows it (`findDone_`). */
    w.findShow_();
    const pages = w.stuffPages_();
    /* ONE CARD PER QUESTION NUMBER (960): each kept page is its question's card with its answers on. */
    if (!pages.length || pages.some(p => p.part !== 'q' || !p.ans)) bad.push('with Answers chosen the strip holds ' + pages.map(p => (p.part || 'card') + (p.ans ? '+ans' : '')).join(', ') + ' — wanted each question\'s page with its answers on');
    ask([{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }]);
    w.findShow_();
    if (w.stuffPages_().some(p => p.part === 'ans' || p.ans)) bad.push('with Questions chosen the strip still holds an answer');
  } finally { lib.put(); S.filters = []; }
  return bad;
});

/* ANSWERS FOLLOW THE CHILD, AND SIGNING IN ON A SHARED iPAD. § */
const ANS_ADA = { name: 'Ada Pupil', personId: 'P7', role: 'kid', roles: ['kid'], token: 'tok-P7', handle: 'ada_kind7' };
const ANS_BEN = { name: 'Ben Pupil', personId: 'P8', role: 'kid', roles: ['kid'], token: 'tok-P8', handle: 'ben_bold8' };
/* A BACKEND THAT KEEPS ANSWERS, as `answersUpsert_` does: the later edit wins and the reply carries the
   winner. `server` is the account's rows, server key -> { v, at }, for P7 unless a journey says. */
const ansBackend_ = (server, more) => b => {
  const own = more ? more(b) : undefined;
  if (own !== undefined) return own;
  if (b.action === 'saveAnswers') {
    const saved = {};
    (b.items || []).forEach(it => {
      const had = server[it.key];
      if (had && had.at > it.at) { saved[it.key] = had; return; }
      server[it.key] = saved[it.key] = { v: String(it.v), at: it.at };
    });
    return { success: true, saved: saved };
  }
  if (b.action === 'myAnswers') return { success: true, for: b.personId, answers: JSON.parse(JSON.stringify(server)) };
  return { success: true, messages: [] };
};
const ANS_FEATURES = ['saveAnswers', 'myAnswers'];
/* THE THREE KINDS OF BOX AND A PAD, built by the app's own builders and put in the document. */
const ansCards_ = (w, tag) => {
  const d = w.document;
  const base = { kind: 'question', name: 'Q1', marks: 1, row: { row_id: 'Q-ANS-' + tag, paper_id: 'P-ANS', subject: 'Maths', name: 'Answers' } };
  const words = Object.assign({}, base, { key: 'q:Q-ANS-W-' + tag, answerType: 'explain', html: '<p>Explain.</p>', accept: '' });
  const maths = Object.assign({}, base, { key: 'q:Q-ANS-M-' + tag, html: '<p>Work out 3 &divide; 4.</p>', accept: '3/4' });
  const pick = Object.assign({}, base, { key: 'q:Q-ANS-C-' + tag, html: '<p>Which?</p>', choices: ['3', '4', '5'], choiceRight: [2] });
  const pen = { kind: 'question', key: 'q:Q-ANS-P-' + tag, answerType: 'drawing', diagram: '<svg viewBox="0 0 340 340"></svg>' };
  const host = d.createElement('div');
  d.body.appendChild(host);
  /* THE LIBRARY HOLDS THESE CARDS, as Find's would — a pick is redrawn from the card it belongs to. */
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => (held() || []).concat([words, maths, pick]);
  const draw = () => {
    host.innerHTML = [words, maths, pick].map(x => '<div class="cardhost">' + w.questionCard_(x, 0) + '</div>').join('')
      + w.__t.padCard(pen, pen.diagram, '')
      /* A PASSAGE TO RING WORDS IN, keyed as `circOf_` keys it. */
      + '<div class="qsheet-part is-text" data-circ="' + w.__t.padKey(pen) + ':words">'
      + w.circWords_('<p>The tall tree swayed.</p>', 0, (() => { try { return JSON.parse(w.localStorage.getItem(w.__t.padKey(pen) + ':words') || '[]'); } catch (e) { return []; } })()) + '</div>';
    const ink = host.querySelector('.qpad-ink');
    if (ink) ink.getBoundingClientRect = () => ({ left: 0, top: 0, width: 340, height: 340, right: 340, bottom: 340, x: 0, y: 0 });
  };
  draw();
  const q = sel => host.querySelector(sel);
  const ta = () => q('[data-k$="' + words.key + '"].qp-ans-in');
  const kp = () => q('[data-k$="' + maths.key + '"].qp-ans-in');
  /* THE PICK IS TYPED (owner, 9 Nov): its one box, keyed as the others */
  const box = () => q('[data-k$="' + pick.key + '"].qp-ans-in');
  const pad = () => q('.qpad');
  const saidFor = x => { const el = q('.qp-saved[data-k$="' + x.key + '"]'); return el ? savedWords_(el) : null; };
  const ringed = () => [...host.querySelectorAll('[data-circ] .qw.is-circled')].map(s2 => s2.getAttribute('data-w'));
  return { host, draw, words, maths, pick, pen, ta, kp, box, pad, saidFor, ringed };
};
const ansType_ = (w, el, text) => { el.value = text; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
const ansStroke_ = (w, c, pts) => {
  /* THE PEN PICKED FIRST (owner, 7 Nov): an unpicked figure never inks; picked already, it stays picked. */
  const pd = c.pad(), k = pd.getAttribute('data-k');
  if (w.__t.padNow() !== k || (w.__t.padTool().get(k) || 'pen') !== 'pen') w.padToolPick_(pd, 'pen');
  const ink = pd.querySelector('.qpad-ink');
  ink.getBoundingClientRect = () => ({ left: 0, top: 0, width: 340, height: 340, right: 340, bottom: 340, x: 0, y: 0 });
  const Ev = w.PointerEvent || w.MouseEvent;
  const fire = (type, x, y) => ink.dispatchEvent(new Ev(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1 }));
  fire('pointerdown', pts[0][0], pts[0][1]);
  pts.slice(1).forEach(p => fire('pointermove', p[0], p[1]));
  fire('pointerup', pts[pts.length - 1][0], pts[pts.length - 1][1]);
};
const ansNeed_ = w => ['questionCard_', 'ansStore_', 'answersPush_', 'answersPull_', 'ansSavedSay_', 'ansRead_']
  .filter(n => typeof w[n] !== 'function').concat(typeof (w.__t || {}).padWrap === 'function' ? [] : ['padWrap_']);

check('answers: typed, picked and drawn go to the account a moment later, and the line under the box says whose', async () => {
  const server = {};
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }), reply: ansBackend_(server) });
  await wait(300);
  const need = ansNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — renamed? Nothing about saving answers was checked'];
  const bad = [];
  const saves = () => sent.filter(b => b.action === 'saveAnswers');
  w.__t.USER(Object.assign({}, ANS_ADA));
  const c = ansCards_(w, 'A');
  if (!c.ta() || !c.kp() || !c.box() || !c.pad()) return ['the cards did not draw a textarea, a keypad box, options and a pad — nothing was checked'];
  if (c.saidFor(c.words) !== '') bad.push('an empty box already says ' + JSON.stringify(c.saidFor(c.words)) + ' — a line about saving nothing');
  /* TYPED, PICKED, DRAWN — with no Check and no leaving the box, so only the debounce sends them. */
  ['b', 'be', 'because', 'because 180'].forEach(v => ansType_(w, c.ta(), v));
  ansType_(w, c.box(), 'B');
  ansStroke_(w, c, [[10, 10], [20, 20], [30, 30], [40, 40], [50, 50], [60, 60], [70, 70], [80, 80]]);
  if (c.saidFor(c.words) !== 'Saving…') bad.push('while it is on its way the line says ' + JSON.stringify(c.saidFor(c.words)) + ', wanted "Saving…"');
  await wait(200);
  if (saves().length) bad.push('the answer was sent at once, ' + saves().length + ' request(s) — every keystroke would be a request');
  await wait(1600);
  if (saves().length !== 1) bad.push('a second and a half after the last edit ' + saves().length + ' saveAnswers request(s) had gone, wanted 1 carrying all three');
  const s = saves()[0] || {};
  const by = {}; (s.items || []).forEach(it => { by[it.key] = it; });
  if (s.token !== 'tok-P7' || s.personId !== 'P7') bad.push('saveAnswers went as ' + JSON.stringify({ token: s.token, personId: s.personId }) + ' — the token is who the server writes for, and personId must ride with it');
  const typed = by['ans:' + c.words.key], picked = by['ans:' + c.pick.key], drawn = by['pad:' + c.pen.key];
  if (!typed || typed.v !== 'because 180') bad.push('the typed answer went up as ' + JSON.stringify(typed) + ' — wanted key ans:' + c.words.key + ' (no person in it) and "because 180"');
  if (!picked || picked.v !== 'B') bad.push('the typed pick went up as ' + JSON.stringify(picked) + ' — wanted "B"');
  if (!drawn) bad.push('the drawing did not go up: ' + JSON.stringify(Object.keys(by)));
  else if (drawn.v !== '[[10,10,80,80]]') bad.push('the drawing went up as ' + drawn.v + ' — a straight stroke of eight points is two after simplifying, and the device keeps all eight');
  if (typed && !(typed.at > 0 && typed.at <= Date.now())) bad.push('the typed answer went up with no edit time: ' + JSON.stringify(typed));
  if (Object.keys(by).some(k => /u:P7/.test(k))) bad.push('a key went up with the person in it: ' + Object.keys(by).join(', '));
  if (JSON.parse(w.localStorage.getItem('pad:u:P7:' + c.pen.key) || '[]')[0].length !== 16) bad.push('the device lost the points of its own drawing when it sent a simpler one');
  if (w.localStorage.getItem('ansDirty:u:P7')) bad.push('after the save the device still has these due: ' + w.localStorage.getItem('ansDirty:u:P7'));
  if (c.saidFor(c.words) !== 'Saved to Ada’s account') bad.push('after the save the line says ' + JSON.stringify(c.saidFor(c.words)) + ', wanted "Saved to Ada’s account"');
  if (c.saidFor(c.pick) !== 'Saved to Ada’s account') bad.push('under the options the line says ' + JSON.stringify(c.saidFor(c.pick)));
  if (c.host.querySelectorAll('.qp-saved[data-k$="' + c.pick.key + '"]').length !== 1) bad.push('a pick redrew the options and left the old saved line beside the new one');

  /* CHECK SENDS AT ONCE — a click on the tile, as a finger makes it. */
  const n0 = saves().length;
  ansType_(w, c.kp(), '(3)/(4)');
  c.kp().closest('.qcard').querySelector('.qp-check').click();
  await wait(60);
  if (saves().length !== n0 + 1) bad.push('Check did not send the answer at once (' + (saves().length - n0) + ' request(s) within 60 ms)');
  /* AND SO DOES LEAVING THE BOX. */
  const n1 = saves().length;
  c.ta().focus();
  ansType_(w, c.ta(), 'because 180 degrees');
  c.ta().blur();
  await wait(60);
  if (saves().length !== n1 + 1) bad.push('leaving the box did not send the answer at once (' + (saves().length - n1) + ' request(s) within 60 ms)');
  /* AND THE APP GOING AWAY — with keepalive, so a closed iPad cover does not take the last answer. */
  const kept = [];
  const was = w.fetch;
  w.fetch = (u, o) => { if (o && o.keepalive) kept.push(JSON.parse(o.body)); return was(u, o); };
  ansType_(w, c.ta(), 'because 180 degrees on a line');
  w.dispatchEvent(new w.Event('pagehide'));
  await wait(60);
  w.fetch = was;
  if (!kept.some(b => b.action === 'saveAnswers')) bad.push('pagehide sent nothing with keepalive — closing the app loses the last answer');

  /* SIGNED OUT: the device only, and it says so. */
  w.__t.USER(null);
  c.draw();
  ansType_(w, c.ta(), 'mine');
  if (c.saidFor(c.words) !== 'On this device only — sign in to keep it') bad.push('signed out the line says ' + JSON.stringify(c.saidFor(c.words)));
  return bad;
});

check('answers: on another device, the account fills the box, the keypad drawing, the pick, the pad and the rings', async () => {
  const at = Date.now() - 3600e3;
  const server = {
    'ans:q:Q-ANS-W-B': { v: 'because the angles make a line', at },
    'ans:q:Q-ANS-M-B': { v: '(3)/(4)', at },
    'ans:q:Q-ANS-C-B': { v: 'B', at },
    'pad:q:Q-ANS-P-B': { v: '[[10,20,30,40]]', at },
    'pad:q:Q-ANS-P-B:words': { v: '["0.1"]', at },
  };
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }), reply: ansBackend_(server) });
  await wait(300);
  const need = ansNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — renamed? Nothing was filled'];
  const bad = [];
  w.__t.USER(Object.assign({}, ANS_ADA));
  const c = ansCards_(w, 'B');
  if (c.ta().value) bad.push('a fresh device already shows ' + JSON.stringify(c.ta().value));
  const ok = await w.answersPull_(true);
  if (!ok) bad.push('the read from the account did not land');
  if (!sent.some(b => b.action === 'myAnswers' && b.personId === 'P7' && b.token === 'tok-P7')) bad.push('myAnswers was not asked with the token: ' + JSON.stringify(sent.filter(b => b.action === 'myAnswers')));
  if (c.ta().value !== 'because the angles make a line') bad.push('the textarea on screen reads ' + JSON.stringify(c.ta().value) + ' — the account’s answer did not reach the box in front of the child');
  if (c.kp().value !== '(3)/(4)') bad.push('the keypad box reads ' + JSON.stringify(c.kp().value));
  const show = c.kp().parentNode.querySelector('.kp-show');
  if (!show || !/frac/.test(show.innerHTML)) bad.push('the keypad’s drawing was not redrawn — the input holds (3)/(4) under a picture of nothing: ' + (show && show.innerHTML.slice(0, 80)));
  if (!c.box() || c.box().value !== 'B') bad.push('the typed pick on screen is ' + JSON.stringify(c.box() && c.box().value) + ', wanted B');
  if (c.pad().querySelectorAll('.qpad-g path').length !== 1) bad.push('the pad shows ' + c.pad().querySelectorAll('.qpad-g path').length + ' strokes, wanted the account’s one');
  if (c.ringed().join() !== '0.1') bad.push('the ringed words on screen are [' + c.ringed().join() + '], wanted the account’s "tall" (0.1)');
  if (c.saidFor(c.words) !== 'Saved to Ada’s account') bad.push('a box filled from the account says ' + JSON.stringify(c.saidFor(c.words)));
  /* DRAWN AGAIN, IT IS THE SAME — the device has it now. */
  c.draw();
  if (c.ta().value !== 'because the angles make a line') bad.push('drawn again the box reads ' + JSON.stringify(c.ta().value));
  /* NOTHING CAME BACK UP: the device has nothing newer. */
  await wait(1700);
  if (sent.some(b => b.action === 'saveAnswers')) bad.push('answers read from the account were sent straight back to it: ' + JSON.stringify(sent.filter(b => b.action === 'saveAnswers').map(b => b.items)));
  /* A REPLY FOR SOMEBODY ELSE — a child who signed out while it was on its way — is dropped. */
  const b2 = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }),
    reply: b => (b.action === 'myAnswers' ? { success: true, for: 'P8', answers: { 'ans:q:Q-ANS-W-C': { v: 'Ben’s', at } } } : { success: true }) });
  await wait(300);
  b2.w.__t.USER(Object.assign({}, ANS_ADA));
  const c2 = ansCards_(b2.w, 'C');
  await b2.w.answersPull_(true);
  if (c2.ta().value) bad.push('A REPLY FOR ANOTHER CHILD FILLED ADA’S BOX: ' + JSON.stringify(c2.ta().value));
  /* AND A VALUE THE PAD CANNOT DRAW IS NOT PUT IN ITS MARKUP. */
  const b3 = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }),
    reply: b => (b.action === 'myAnswers' ? { success: true, for: 'P7', answers: { 'pad:q:Q-ANS-P-D': { v: '[["\\"><img src=x onerror=alert(1)>"]]', at } } } : { success: true }) });
  await wait(300);
  b3.w.__t.USER(Object.assign({}, ANS_ADA));
  const c3 = ansCards_(b3.w, 'D');
  await b3.w.answersPull_(true);
  if (c3.host.querySelector('img') || b3.w.localStorage.getItem('pad:u:P7:q:Q-ANS-P-D')) bad.push('a pad value that is not a list of numbers was stored and drawn');
  return bad;
});

check('answers: typed before signing in is MOVED to whoever signs in, and the next child on the iPad sees nothing', async () => {
  const server = {};
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }), reply: ansBackend_(server) });
  await wait(300);
  const need = ansNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — the move was NOT checked'];
  const bad = [];
  w.__t.USER(null);
  const c = ansCards_(w, 'E');
  ansType_(w, c.ta(), 'typed before signing in');
  const bare = 'ans:' + c.words.key, mine = 'ans:u:P7:' + c.words.key;
  if (w.localStorage.getItem(bare) !== 'typed before signing in') return bad.concat(['signed out, the answer was not kept on the device at all']);
  w.__t.USER(Object.assign({}, ANS_ADA));
  c.draw();
  if (c.ta().value !== 'typed before signing in') bad.push('signed in as Ada the box reads ' + JSON.stringify(c.ta().value) + ' — the answer typed before signing in was not found (the `ansRead_` regex)');
  if (w.localStorage.getItem(mine) !== 'typed before signing in') bad.push('the answer is not under Ada’s key: ' + JSON.stringify(w.localStorage.getItem(mine)));
  if (w.localStorage.getItem(bare) !== null) bad.push('the answer was COPIED, not moved — the signed-out copy is still there for the next child: ' + JSON.stringify(w.localStorage.getItem(bare)));
  await wait(1700);
  const up = sent.filter(b => b.action === 'saveAnswers').map(b => (b.items || []).map(i => i.key + '=' + i.v).join(',')).join(' | ');
  if (!/ans:q:Q-ANS-W-E=typed before signing in/.test(up)) bad.push('the moved answer did not go up to Ada’s account: ' + JSON.stringify(up));
  w.__t.USER(Object.assign({}, ANS_BEN));
  c.draw();
  if (c.ta().value) bad.push('BEN SEES ADA’S ANSWER on the same iPad: ' + JSON.stringify(c.ta().value));
  /* AND SIGNED OUT AGAIN, THE BOX IS EMPTY AND SAYS NOTHING — the answer moved; the device's open drawer
     must not still claim to hold it (the visit's copy is for a storage that throws, not one that answered). */
  w.__t.USER(null);
  c.draw();
  if (c.ta().value || c.saidFor(c.words)) bad.push('signed out after the move, the box reads ' + JSON.stringify(c.ta().value) + ' under the line ' + JSON.stringify(c.saidFor(c.words)) + ' — the moved answer is still claimed for the device');
  return bad;
});

check('answers: an edit not yet sent beats the account’s copy, even a later one, and a box being typed in is never written over', async () => {
  /* THE ACCOUNT'S COPY IS STAMPED AFTER THE EDIT HERE — the computer's clock, or an edit there in the
     second before this one went up. Due wins all the same: it is about to go up, and the server decides. */
  const server = {
    'ans:q:Q-ANS-W-F': { v: 'the account’s answer', at: Date.now() + 60000 },
    'ans:q:Q-ANS-M-F': { v: '(1)/(2)', at: Date.now() - 1000 },
  };
  /* THE SAVE IS HELD — it never answers — so the edit stays due while the account is read. */
  const hold = new Promise(() => {});
  const { w } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }),
    reply: ansBackend_(server, b => (b.action === 'saveAnswers' ? hold : undefined)) });
  await wait(300);
  const need = ansNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — the merge was NOT checked'];
  const bad = [];
  w.__t.USER(Object.assign({}, ANS_ADA));
  const c = ansCards_(w, 'F');
  ansType_(w, c.ta(), 'my new answer');
  /* THE KEYPAD BOX HAS AN OLDER ANSWER, SAVED, AND THE CHILD IS IN IT. */
  w.localStorage.setItem('ans:u:P7:' + c.maths.key, '(3)/(4)');
  w.localStorage.setItem('ansAt:ans:u:P7:' + c.maths.key, String(Date.now() - 5000));
  c.draw();
  ansType_(w, c.ta(), 'my new answer');
  c.kp().focus();
  await w.answersPull_(true);
  if (c.ta().value !== 'my new answer' || w.localStorage.getItem('ans:u:P7:' + c.words.key) !== 'my new answer') bad.push('an edit not yet sent was replaced by the account’s copy: the box reads ' + JSON.stringify(c.ta().value) + ' and the device ' + JSON.stringify(w.localStorage.getItem('ans:u:P7:' + c.words.key)));
  if (c.kp().value !== '(3)/(4)' || w.localStorage.getItem('ans:u:P7:' + c.maths.key) !== '(3)/(4)') bad.push('the box under the child’s finger was written over by the account: the box reads ' + JSON.stringify(c.kp().value) + ' and the device ' + JSON.stringify(w.localStorage.getItem('ans:u:P7:' + c.maths.key)));
  c.kp().blur();
  /* AND A BOX NOBODY IS IN, NOT DUE, TAKES THE ACCOUNT'S NEWER ANSWER — the control for the two above. */
  const b2 = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }), reply: ansBackend_({ 'ans:q:Q-ANS-W-G': { v: 'from the computer', at: Date.now() - 1000 } }) });
  await wait(300);
  b2.w.__t.USER(Object.assign({}, ANS_ADA));
  b2.w.localStorage.setItem('ans:u:P7:q:Q-ANS-W-G', 'from this iPad, earlier');
  b2.w.localStorage.setItem('ansAt:ans:u:P7:q:Q-ANS-W-G', String(Date.now() - 864e5));
  const c2 = ansCards_(b2.w, 'G');
  await b2.w.answersPull_(true);
  if (c2.ta().value !== 'from the computer') bad.push('a box nobody was in kept its older answer over the account’s newer one: ' + JSON.stringify(c2.ta().value));
  return bad;
});

check('answers: a backend without saveAnswers is sent nothing, and the box keeps its answer on the device as it always did', async () => {
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: [] }) });
  await wait(300);
  const need = ansNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  w.__t.USER(Object.assign({}, ANS_ADA));
  const c = ansCards_(w, 'H');
  ansType_(w, c.ta(), 'kept here');
  w.adoptMarks_();
  await wait(1700);
  const asked = sent.filter(b => b.action === 'saveAnswers' || b.action === 'myAnswers');
  if (asked.length) bad.push('a backend that does not list them was sent ' + asked.map(b => b.action).join(', '));
  if (w.localStorage.getItem('ans:u:P7:' + c.words.key) !== 'kept here') bad.push('the answer was not kept on the device');
  c.draw();
  if (c.ta().value !== 'kept here') bad.push('drawn again the box reads ' + JSON.stringify(c.ta().value));
  if (c.saidFor(c.words) !== 'On this device only') bad.push('signed in to a backend that cannot keep it, the line says ' + JSON.stringify(c.saidFor(c.words)) + ' — it must not claim a save');
  return bad;
});

check('answers: a refused save keeps the answer due and it goes on the next try; one typed over while sending stays due', async () => {
  const server = {};
  let refuse = 1, release = null;
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }),
    reply: ansBackend_(server, b => {
      if (b.action !== 'saveAnswers') return undefined;
      if (refuse-- > 0) return { error: 'Busy — it will be sent again.', why: 'busy' };
      if (release === 'hold') return new Promise(r => { release = () => r(ansBackend_(server)(b)); });
      return undefined;
    }) });
  await wait(300);
  const need = ansNeed_(w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  w.__t.USER(Object.assign({}, ANS_ADA));
  const c = ansCards_(w, 'I');
  const due = () => JSON.parse(w.localStorage.getItem('ansDirty:u:P7') || '[]');
  ansType_(w, c.ta(), 'first try');
  await w.answersPush_(true);
  if (!due().includes('ans:u:P7:' + c.words.key)) bad.push('a refused save took the answer off the list of what is due — it would never be sent again');
  if (c.saidFor(c.words) !== 'Saving…') bad.push('after a refusal the line says ' + JSON.stringify(c.saidFor(c.words)) + ' — it was not saved');
  await w.answersPush_(true);
  if (due().length) bad.push('the next try did not clear what was due: ' + JSON.stringify(due()));
  if (!server['ans:q:Q-ANS-W-I'] || server['ans:q:Q-ANS-W-I'].v !== 'first try') bad.push('the next try did not reach the account: ' + JSON.stringify(server));
  /* TYPED OVER WHILE THE SAVE WAS ON THE WIRE: the reply is about "second", so the key stays due and
     the newer answer follows it up — the account must end on what the box says. */
  release = 'hold';
  ansType_(w, c.ta(), 'second');
  const n0 = sent.filter(b => b.action === 'saveAnswers').length;
  const p = w.answersPush_(true);
  ansType_(w, c.ta(), 'second, longer');
  await wait(20);
  if (typeof release === 'function') release();
  await p;
  /* THE NEWER ANSWER FOLLOWS ON THE ORDINARY SECOND AND A HALF — one request per pause, not per round trip. */
  await wait(1700);
  const after = sent.filter(b => b.action === 'saveAnswers').slice(n0).map(b => (b.items || []).map(i => i.v).join());
  if ((server['ans:q:Q-ANS-W-I'] || {}).v !== 'second, longer') bad.push('an answer typed over while the last one was being sent was taken as saved — the account has ' + JSON.stringify((server['ans:q:Q-ANS-W-I'] || {}).v) + ' and the box says "second, longer" (sent: ' + JSON.stringify(after) + ')');
  if (due().length) bad.push('after the follow-up save something is still due: ' + JSON.stringify(due()));
  /* AND AN ANSWER TOO LONG FOR THE ACCOUNT (ANSWER_TEXT_MAX): § */
  const CEIL = +((fs.readFileSync(path.join(dir, 'answers.js'), 'utf8').match(/\bANS_TEXT_MAX = (\d+)/) || [])[1] || 0);
  if (!(CEIL >= 2000)) return bad.concat(['ANS_TEXT_MAX was not found in js/answers.js — the ceiling was NOT checked']);
  const n2 = sent.filter(b => b.action === 'saveAnswers').length;
  ansType_(w, c.ta(), 'x'.repeat(CEIL + 1));
  await w.answersPush_(true);
  if (sent.filter(b => b.action === 'saveAnswers').slice(n2).some(b => (b.items || []).some(i => String(i.v).length > CEIL))) bad.push('an answer over the account’s ceiling was sent — the server refuses it every time');
  if (due().length) bad.push('an answer over the ceiling is still due: ' + JSON.stringify(due()));
  if (c.saidFor(c.words) !== 'On this device only \u2014 too long for the account') bad.push('under an answer too long for the account the line says ' + JSON.stringify(c.saidFor(c.words)));
  return bad;
});

check('answers: a payload landing reads the account once a visit, and coming back to the app after a minute reads it again', async () => {
  const server = { 'ans:q:Q-ANS-W-K': { v: 'from the computer', at: Date.now() - 5000 } };
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES }), reply: ansBackend_(server),
    before: win => { win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA)); } });
  await wait(500);
  const bad = [];
  if (typeof w.adoptMarks_ !== 'function') return ['adoptMarks_ not reachable — nothing was checked'];
  const reads = () => sent.filter(b => b.action === 'myAnswers').length;
  if (reads() !== 1) bad.push('opening the app signed in read the account ' + reads() + ' time(s), wanted once — the boxes would be empty on this device until the next sign-in');
  if (w.localStorage.getItem('ans:u:P7:q:Q-ANS-W-K') !== 'from the computer') bad.push('the answer typed on the computer did not reach this device when the app opened');
  w.adoptMarks_(); w.adoptMarks_();
  await wait(50);
  if (reads() !== 1) bad.push('two more payloads in the same visit read the account ' + (reads() - 1) + ' more time(s) — once a visit');
  /* BACK IN FRONT: not within the minute, and again after it. */
  const d = w.document;
  try { Object.defineProperty(d, 'visibilityState', { configurable: true, get: () => 'visible' }); } catch (e) {}
  d.dispatchEvent(new w.Event('visibilitychange'));
  await wait(50);
  if (reads() !== 1) bad.push('coming back to the app within the minute read the account again');
  const real = w.Date.now;
  w.Date.now = () => real.call(w.Date) + 61000;
  try {
    d.dispatchEvent(new w.Event('visibilitychange'));
    await wait(50);
  } finally { w.Date.now = real; }
  if (reads() !== 2) bad.push('coming back to the app after a minute away did not read the account again (' + reads() + ' reads) — the iPad would not see what was typed on the computer');
  return bad;
});

/* EVERY BOX SURVIVES A RELOAD (docs/history/317). § */
const keptStore_ = w => {
  const o = {};
  for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); o[k] = w.localStorage.getItem(k); }
  return o;
};
const fromStore_ = (kept, more) => win => {
  Object.keys(kept).forEach(k => win.localStorage.setItem(k, kept[k]));
  if (more) more(win);
};
/* ABOUT THE ESSAY'S LENGTH — 3,000 characters, over the account's 2,000 as well. */
const RELOAD_ESSAY = 'The wind came off the sea like a held breath let go, and the town leaned into it. '.repeat(37);
const RELOAD_ESSAY_X = { kind: 'question', name: 'Q5', marks: 40, key: 'q:Q-ANS-E-R', answerType: 'written', accept: '',
  html: '<p>Write a description suggested by this picture.</p>',
  row: { row_id: 'Q-ANS-E-R', paper_id: 'P-ANS', subject: 'English Language', name: 'Answers' } };
const reloadEssayBox_ = w => {
  const h = w.document.createElement('div');
  w.document.body.appendChild(h);
  h.innerHTML = w.questionCard_(RELOAD_ESSAY_X, 0);
  /* BY `data-do="qp-ans"`, the one thing every box that saves as an answer carries — not by how the essay's
     box is drawn, which is being rebuilt as a writing sheet. */
  return h.querySelector('[data-do="qp-ans"][data-k$="' + RELOAD_ESSAY_X.key + '"]');
};

check('a reload keeps every answer — words, maths, a 3,000-character essay, a pick and a drawing — signed in on the live backend and signed out', async () => {
  const one = boot({ before: signedInAs_(ANS_ADA) });
  await wait(300);
  const need = ansNeed_(one.w);
  if (need.length) return [need.join(', ') + ' not reachable — nothing was reloaded'];
  const bad = [];
  let c = ansCards_(one.w, 'R');
  ansType_(one.w, c.ta(), 'because 180');
  ansType_(one.w, c.kp(), '(3)/(4)');
  const e1 = reloadEssayBox_(one.w);
  if (!e1) return ['the essay card drew no answer box — nothing was reloaded'];
  ansType_(one.w, e1, RELOAD_ESSAY);
  ansType_(one.w, c.box(), 'B');
  ansStroke_(one.w, c, [[10, 10], [60, 60], [90, 20]]);
  one.w.dispatchEvent(new one.w.Event('pagehide'));
  const two = boot({ before: fromStore_(keptStore_(one.w)) });
  await wait(300);
  const w = two.w;
  if (!w.__t.whoami() || w.__t.whoami().personId !== 'P7') bad.push('the reload did not come back signed in as Ada — every key below is somebody else\'s');
  c = ansCards_(w, 'R');
  if (c.ta().value !== 'because 180') bad.push('after the reload the words box holds ' + JSON.stringify(c.ta().value));
  if (c.kp().value !== '(3)/(4)') bad.push('after the reload the maths box holds ' + JSON.stringify(c.kp().value));
  const e2 = reloadEssayBox_(w);
  if (!e2 || e2.value !== RELOAD_ESSAY) bad.push('after the reload the essay is ' + (e2 ? e2.value.length : 'no box,') + ' characters, wanted ' + RELOAD_ESSAY.length);
  if (!c.box() || c.box().value !== 'B') bad.push('after the reload the typed pick is ' + JSON.stringify(c.box() && c.box().value) + ', wanted B');
  if (c.pad().querySelectorAll('.qpad-g path').length !== 1) bad.push('after the reload the pad shows ' + c.pad().querySelectorAll('.qpad-g path').length + ' strokes, wanted 1');
  /* SIGNED OUT: the device's key, and the same again. */
  w.__t.USER(null);
  try { w.localStorage.removeItem('familyUser'); } catch (e) {}
  c.draw();
  ansType_(w, c.ta(), 'mine, on this computer');
  w.dispatchEvent(new w.Event('pagehide'));
  const three = boot({ before: fromStore_(keptStore_(w)) });
  await wait(300);
  if (three.w.__t.whoami()) bad.push('the signed-out reload came back signed in');
  const c3 = ansCards_(three.w, 'R');
  if (c3.ta().value !== 'mine, on this computer') bad.push('signed out, after the reload the box holds ' + JSON.stringify(c3.ta().value));
  return bad;
});

check('a reload keeps what was typed and not yet sent: the composer, a comment, the booking note, a settings box, the new-post sheet and the make-an-account names — and never a PIN', async () => {
  /* A GROWN-UP, because a child is offered no new-post sheet at all (413). */
  const one = boot({ before: signedInAs_({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'], token: 'tok-P1', handle: 'pat_par1' }) });
  await wait(300);
  const W = one.w;
  const fns = ['msgForm_', 'commentsHtml_', 'fieldHtml', 'registerCard_', 'draftRead_', 'draftKeep_'].filter(n => typeof W[n] !== 'function');
  if (fns.length) return [fns.join(', ') + ' not reachable — nothing was reloaded'];
  const bad = [];
  const draw = (w, html) => { const h = w.document.createElement('div'); w.document.body.appendChild(h); h.innerHTML = html; return h; };
  const type = (w, el, v) => { el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const surfaces = w => {
    const msg = draw(w, w.msgForm_('Tom Tutor', 'P-TOM')).querySelector('.msg-text');
    const cmt = draw(w, w.commentsHtml_({ id: 'POST-R', comments: { list: [], total: 0 } })).querySelector('.cmt-text');
    const set = draw(w, '<div class="me-form">' + w.fieldHtml('headline', 'Maths, mostly', {}) + '</div>').querySelector('[data-me="headline"]');
    const note = draw(w, w.noteRow_().sel).querySelector('[data-do="book-note"]');
    return { msg, cmt, set, note };
  };
  let s = surfaces(W);
  if (!s.msg || !s.cmt || !s.set || !s.note) return ['a surface did not draw: ' + JSON.stringify(Object.keys(s).filter(k => !s[k]))];
  type(W, s.msg, 'See you Tuesday — can we do');
  type(W, s.cmt, 'Lovely photo of the');
  type(W, s.set, 'Maths and Physics');
  type(W, s.note, 'Two of them are twins and');
  W.__t.ACTIONS['new-post']();
  const pc = W.document.getElementById('post-cap'), pb = W.document.getElementById('post-body');
  if (!pc || !pb) bad.push('the new-post sheet did not open, so it was NOT checked');
  else { type(W, pc, 'Thursday at the library'); type(W, pb, 'Twelve of them, and'); }
  /* A PIN IS NEVER WRITTEN DOWN — not a sheet's, and not one a box carrying a draft would have kept. */
  W.closeSheet && W.closeSheet();
  /* `0000`, the one PIN this public repository writes down — so a leak is looked for as a VALUE: the PIN
     itself, or quoted inside a stored JSON (a draft's `"v":"0000"`), never as digits in a timestamp. */
  const PIN = '0000';
  const holds = v => String(v) === PIN || String(v).indexOf('"' + PIN + '"') !== -1;
  const trap = draw(W, '<input type="text" data-draft="set:lib1_pin"><input type="password" data-draft="reg:pin">');
  trap.querySelectorAll('input').forEach(el => type(W, el, PIN));
  W.dispatchEvent(new W.Event('pagehide'));
  const kept = keptStore_(W);
  const leak = Object.keys(kept).filter(k => holds(kept[k]));
  if (leak.length) bad.push('a PIN was written to the device under ' + leak.join(', '));
  const two = boot({ before: fromStore_(kept) });
  await wait(300);
  const w = two.w;
  s = surfaces(w);
  if (s.msg.value !== 'See you Tuesday — can we do') bad.push('after the reload the composer holds ' + JSON.stringify(s.msg.value));
  if (s.cmt.value !== 'Lovely photo of the') bad.push('after the reload the comment box holds ' + JSON.stringify(s.cmt.value));
  if (s.set.value !== 'Maths and Physics') bad.push('after the reload the settings box holds ' + JSON.stringify(s.set.value) + ' — wanted the unsaved edit over the saved "Maths, mostly"');
  if (s.note.value !== 'Two of them are twins and' || w.__t.BOOKING.note !== 'Two of them are twins and') bad.push('after the reload the booking note is ' + JSON.stringify(s.note.value) + ' and BOOKING.note ' + JSON.stringify(w.__t.BOOKING.note));
  w.__t.ACTIONS['new-post']();
  const pc2 = w.document.getElementById('post-cap'), pb2 = w.document.getElementById('post-body');
  if (!pc2 || pc2.value !== 'Thursday at the library' || !pb2 || pb2.value !== 'Twelve of them, and') bad.push('after the reload the new-post sheet opened holding ' + JSON.stringify([pc2 && pc2.value, pb2 && pb2.value]));
  w.closeSheet && w.closeSheet();
  /* TYPED BACK TO WHAT IS SAVED IS NO DRAFT. */
  type(w, s.set, 'Maths, mostly');
  if (w.draftRead_('set', 'headline') !== null) bad.push('a settings box typed back to its saved value still keeps a draft');
  /* SENT, AND THE DRAFT GOES — the comment, through the real handler and a server that takes it. */
  const tile = s.cmt.closest('.cmt-form').querySelector('[data-do="cmt-add"]');
  if (!tile) bad.push('no Post tile beside the comment box');
  else {
    w.__t.ACTIONS['cmt-add'](tile);
    await wait(100);
    if (w.draftRead_('cmt', 'POST-R') !== null) bad.push('the comment was posted and its draft is still kept — the next reload would put it back in the box');
  }
  /* ANOTHER CHILD ON THE SAME iPAD IS NOT HANDED ADA'S DRAFT. */
  w.__t.USER(Object.assign({}, ANS_BEN));
  const ben = draw(w, w.msgForm_('Tom Tutor', 'P-TOM')).querySelector('.msg-text');
  if (ben.value) bad.push('Ben opened the same conversation and the composer held Ada\'s draft: ' + JSON.stringify(ben.value));
  /* SIGNED OUT: the make-an-account form is the device's draft, and comes back across a reload. */
  w.__t.USER(null);
  try { w.localStorage.removeItem('familyUser'); } catch (e) {}
  draw(w, w.registerCard_());
  const rf = w.document.getElementById('reg-first'), rp = w.document.getElementById('reg-pin');
  if (!rf || !rp) bad.push('the make-an-account form did not draw, so it was NOT checked');
  else {
    type(w, rf, 'Ivy');
    type(w, rp, PIN);
    w.dispatchEvent(new w.Event('pagehide'));
    const kept3 = keptStore_(w);
    if (Object.keys(kept3).some(k => holds(kept3[k]))) bad.push('the PIN typed into the make-an-account form was written to the device');
    const three = boot({ before: fromStore_(kept3) });
    await wait(300);
    draw(three.w, three.w.registerCard_());
    const rf3 = three.w.document.getElementById('reg-first');
    if (!rf3 || rf3.value !== 'Ivy') bad.push('after the reload the make-an-account form drew with the first name ' + JSON.stringify(rf3 && rf3.value));
  }
  return bad;
});

check('the booking form is the person\'s on a shared iPad: a sign-out takes it off the screen, signing in again brings it back, and the next child is not handed it', async () => {
  const { w } = boot({ before: signedInAs_(ANS_ADA) });
  await wait(300);
  const fns = ['bookFollow_', 'signedOut_', 'signedIn_', 'noteRow_', 'draftRead_'].filter(n => typeof w[n] !== 'function');
  if (fns.length) return [fns.join(', ') + ' not reachable — nothing was checked'];
  const bad = [];
  const B = w.__t.BOOKING;
  /* THROUGH THE REAL LISTENER, as a parent types the note. */
  const note = v => {
    const h = w.document.createElement('div');
    w.document.body.appendChild(h);
    h.innerHTML = w.noteRow_().sel;
    const el = h.querySelector('[data-do="book-note"]');
    el.value = v;
    el.dispatchEvent(new w.Event('input', { bubbles: true }));
  };
  note('Ada on Tuesdays, please');
  w.signedOut_();
  if (B.note) bad.push('signed out, the booking form still holds Ada\'s note ' + JSON.stringify(B.note) + ' for whoever picks the iPad up');
  if (w.draftRead_('book', 'form') !== null) bad.push('signed out, the device was handed Ada\'s booking as its own draft');
  /* BEN SIGNS IN: nothing of Ada's. */
  w.signedIn_(Object.assign({}, ANS_BEN));
  if (B.note) bad.push('Ben signed in and the booking form held ' + JSON.stringify(B.note));
  /* ADA AGAIN: hers is back (from Ben, through the sign-out on the way). */
  w.signedIn_(Object.assign({}, ANS_ADA));
  if (B.note !== 'Ada on Tuesdays, please') bad.push('Ada signed in again and the booking note is ' + JSON.stringify(B.note) + ' — wanted the one she left');
  /* FILLED IN SIGNED OUT AND SIGNED IN TO SEND: it is the person's now, and the device's copy goes. */
  w.signedOut_();
  note('Two children, Saturdays');
  w.signedIn_(Object.assign({}, ANS_BEN));
  if (B.note !== 'Two children, Saturdays') bad.push('filled in signed out, then signed in to send, and the note is ' + JSON.stringify(B.note));
  if (!/Two children/.test(String(w.draftRead_('book', 'form') || ''))) bad.push('the form filled in signed out is not Ben\'s draft after he signed in');
  if (w.localStorage.getItem('draft:device:book:form') !== null) bad.push('the device\'s copy of a form Ben carried into his account is still on the device, for the next visitor');
  return bad;
});


/* ONE PART ANSWERED IS ONE PART DONE (owner, 11 Nov): a right press on part a once tagged every part of its question Correct. */
check('multipart: a right press on part a alone leaves parts b and c Unattempted -- facet, their own tag lines, their paint -- and the parts done number one', async () => {
  const { w } = boot({ member: true, before: signedInAs_(ANS_ADA) });
  await wait(300); await woken_();
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.subRecord_ !== 'function' || typeof t.ansKey !== 'function' || typeof w.questionWhole_ !== 'function' || typeof w.progressStats_ !== 'function') return ['subRecord_, ansKey_, questionWhole_ or progressStats_ not reachable — NOT checked'];
  const lib = mpLibrary_(w, ['a', 'b', 'c'].map(p => mpRow_('P-MP-P', 'Parts', 5, p, { html: '<p>Part ' + p + '.</p>', answer: '<b>4' + p.charCodeAt(0) + '</b>' })));
  try {
    const parts = lib.items.filter(x => x.kind === 'question');
    if (parts.length !== 3) return ['the fixture made ' + parts.length + ' parts, not 3 — NOT checked'];
    const say = x => [].concat(w.myResultOf_(x) || []).join(',');
    const host = d.createElement('section');
    host.className = 'page';
    host.innerHTML = w.questionWhole_(parts[0], parts);
    d.body.appendChild(host);
    const cards = [...host.querySelectorAll('.qb')];
    if (cards.length !== 3) bad.push('the question drew ' + cards.length + ' part cards, not 3');
    const tagOf = b => [...b.querySelectorAll(':scope > .qcard-tags .qtag[data-f="myResult"]')].map(e => e.textContent).join(',');
    if (cards.some(b => tagOf(b) !== 'Unattempted')) bad.push('before a press the tags say ' + cards.map(tagOf).join(' | '));
    if (!host.querySelector('[data-k="' + t.ansKey(parts[0]) + '"]')) bad.push('part a drew no answer box keyed to it — the live tag was NOT checked');
    w.subRecord_(t.ansKey(parts[0]), '497', 'right', 'none');
    await wait(50);
    parts.forEach((x, i) => {
      const want = i ? 'Unattempted' : 'Attempted,Correct';
      if (say(x) !== want) bad.push('part ' + x.qPart + ' says ' + JSON.stringify(say(x)) + ', not ' + want);
      const b = cards[i];
      if (b && tagOf(b) !== want) bad.push('part ' + x.qPart + '\'s own tag line says ' + JSON.stringify(tagOf(b)) + ', not ' + want);
      if (i && b && b.querySelector('.is-right, .is-wrong, .is-near')) bad.push('part ' + x.qPart + ' is painted marked');
    });
    const st = w.progressStats_();
    if (st.n !== 1) bad.push('Progress counts ' + st.n + ' presses, not 1');
    const pp = st.papers && st.papers['P-MP-P'];
    if (!pp || Object.keys(pp.done).length !== 1) bad.push('Progress counts ' + (pp ? Object.keys(pp.done).length : 0) + ' parts of the paper done, not 1');
  } finally { lib.put(); }
  return bad;
});
