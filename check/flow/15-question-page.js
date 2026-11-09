/* ---------- A BACKEND NOT YET PULLED IS SENT NO ESSAY IT WOULD CUT § */
check('a backend without aiMarkWhole is sent no essay over its old 2,000-character cut, and the pupil is told why', async () => {
  const ID = 'Q-R0398-5';
  const LIB = LIB_FULL.rows('questions');
  const row = LIB.find(r => r.row_id === ID);
  if (!row) return [ID + ' is not in data/questions.json — nothing was sent'];
  const paper = LIB.filter(r => r.paper_id === row.paper_id);
  const { w, sent, errs } = boot({ payload: Object.assign(payload(), { features: ['aiMark'], aiMarking: true }),
    reply: b => (b.action === 'aiMark' ? { success: true, awarded: 9, available: 40, feedback: '• Use paragraphs.', left: 19 } : null),
    serve: url => (/data\/questions\.json/.test(url) ? paper : undefined) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['qp-ai'] || typeof w.questionCard_ !== 'function') return ['Mark with AI is not reachable — nothing was sent'];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
  const x = w.stuffItemsAll_().find(it => it.row && it.row.row_id === ID);
  if (!x) return ['the real ' + ID + ' did not come through the loader — nothing was sent'];
  const k = w.__t.ansKey(x);
  const host = d.createElement('div');
  d.body.appendChild(host);
  const mark = async text => {
    try { w.localStorage.setItem(k, text); w.localStorage.removeItem(k.replace(/^ans:/, 'part:')); } catch (e) {}
    host.innerHTML = w.questionCard_(x, 0);
    const go = host.querySelector('.qp-ai-go');
    if (!go) return null;
    const n = sent.filter(b => b.action === 'aiMark').length;
    A['qp-ai'](go);
    await wait(50);
    return { went: sent.filter(b => b.action === 'aiMark').slice(n), said: (host.querySelector('.qp-ai .qp-verdict') || {}).textContent || '' };
  };
  let long = '';
  while (long.length < 6000) long += 'The rain drew long silver threads across the glass, and the town slid by. ';
  const a = await mark(long);
  if (!a) return ['with aiMark and no aiMarkWhole the essay drew no Mark with AI tile — a short essay could still be marked'];
  if (a.went.length) bad.push('a ' + long.length + '-character essay was sent to a backend that cuts at 2,000 — its mark would be shown as the whole essay\'s');
  if (!/reads only the first 2,000 characters until it is updated/.test(a.said) || !/6,0\d\d/.test(a.said)) bad.push('the pupil was told ' + JSON.stringify(a.said) + ' — wanted why it was not sent, with the two numbers');
  const short = await mark('The rain drew long silver threads across the glass.\n\nThe town slid by.');
  if (!short || short.went.length !== 1 || short.went[0].essay !== true) bad.push('an essay under 2,000 characters, which the old backend reads whole, was not sent: ' + JSON.stringify(short && short.went));
  else if (!/9 of 40 marks/.test(short.said)) bad.push('the short essay\'s mark was drawn as ' + JSON.stringify(short.said));
  /* AND WITH IT, THE SAME 6,000 GO WHOLE -- the essay journey above asks the rest. */
  w.__t.DATA().features = ['aiMark', 'aiMarkWhole'];
  const whole = await mark(long);
  if (!whole || whole.went.length !== 1 || whole.went[0].answer !== long) bad.push('with aiMarkWhole the essay was not sent whole: ' + JSON.stringify(whole && whole.went.map(b => String(b.answer).length)));
  try { w.localStorage.removeItem(k); w.localStorage.removeItem(k.replace(/^ans:/, 'part:')); } catch (e) {}
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- THE ANSWER IS ITS OWN PAGE, AND NOBODY READS IT UNTIL THEY ASK § */
check('an answer is its own page after its question, hidden from everybody alike until shown, and kept on Saved', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const gone = ['pageParts_', 'questionCard_', 'questionAnsCard_', 'cardPages_']
    .filter(n => typeof w[n] !== 'function');
  /* `ansKey_` IS A `const`, and only a function declaration reaches the window -- so it comes
     through `__t`. `w.ansKey_` is undefined, and a `try` around it clears nothing and says nothing. */
  const ansKey = w.__t.ansKey;
  if (typeof ansKey !== 'function') gone.push('ansKey_');
  if (gone.length) return [gone.join(', ') + ' not reachable — renamed? The answer page was NOT checked'];
  const A = w.__t.ACTIONS;
  if (!A['qa-show']) return ['qa-show has no handler, so nothing can show an answer page'];
  if (A['qa-go']) bad.push('`qa-go` still has a handler -- the ↓ "To the answer" tile was taken out, and its handler with it');
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const SECRET = 'Seventeen-and-a-half';
  const row = id => ({ row_id: id, paper_id: 'P-ANSP', subject: 'Maths', name: 'Answer page' });
  const base = { kind: 'question', name: 'Q5', marks: 2, key: 'q-ansp', row: row('Q-ANSP-5'),
    html: '<p>Work out 35 &divide; 2</p>', answer: '<b>' + SECRET + '</b> &mdash; 35 &divide; 2 = 17.5' };
  const fig = Object.assign({}, base, { key: 'q-ansp-fig', row: row('Q-ANSP-6'), diagram: '<svg viewBox="0 0 10 10"></svg>' });
  const none = Object.assign({}, base, { key: 'q-ansp-none', row: row('Q-ANSP-7'), answer: '' });
  const figOnly = Object.assign({}, fig, { key: 'q-ansp-figonly', row: row('Q-ANSP-8'), answer: '' });
  const parts = x => JSON.stringify(w.pageParts_(x));
  /* A FIGURE IS IN ITS CARD, NOT A PAGE OF ITS OWN (356) -- and the answer is still the page after the card. */
  [[base, '[null,"ans"]'], [fig, '[null,"ans"]'], [none, '[null]'], [figOnly, '[null]']].forEach(([x, want]) => {
    if (parts(x) !== want) bad.push(x.row.row_id + ' has pages ' + parts(x) + ', wanted ' + want);
  });
  /* THE QUESTION CARD: the box, and no answer. */
  const q = el(w.questionCard_(base));
  if (q.querySelector('.qans, .qans-body') || q.textContent.indexOf(SECRET) >= 0) bad.push('the question card still draws the answer');
  if (!q.querySelector('.qp-ans')) bad.push('the question card lost its answer box');
  /* NO WAY TO IT ON THE QUESTION'S OWN PAGE -- the owner, 8 Oct: *"there doesnt need to be a scroll down
     tile on questions."* Not in the row, not on the card, with or without an answer. */
  [base, none, fig].forEach(x => {
    const h = el('' + w.questionCard_(x));
    if (h.querySelector('[data-do="qa-go"], .qa-to, .tile-i-next')) bad.push(x.row.row_id + '\'s question page still carries a tile to its answer');
  });
  /* HIDDEN, signed out. */
  if (w.__t.isTutorRole()) bad.push('signed out reads as staff, so the hidden page was NOT checked');
  const hid = el(w.questionAnsCard_(base));
  const card = hid.querySelector('.qans-card');
  if (!card || !card.classList.contains('is-hidden')) bad.push('an answer page nobody has asked for is not hidden');
  if (hid.innerHTML.indexOf(SECRET) >= 0 || hid.innerHTML.indexOf('17.5') >= 0) bad.push('a hidden answer page still carries the answer in its markup');
  if (!/Answer hidden/.test(hid.textContent)) bad.push('a hidden answer page does not say "Answer hidden": ' + hid.textContent.trim().slice(0, 80));
  if (!hid.querySelector('[data-do="qa-show"]')) bad.push('a hidden answer page has no "Show the answer"');
  if (card && card.getAttribute('data-of') !== 'Q-ANSP-5') bad.push('the answer page does not name its row');
  /* SWIPED TO: the page after the question card in the strip, with no kind chosen -- AND STILL HIDDEN. § */
  const heldF = w.stuffFiltered;
  let strip = [];
  w.stuffFiltered = (() => { const list = [base, fig]; return () => list; })();
  try { strip = w.stuffPages_(); } finally { w.stuffFiltered = heldF; }
  const at = strip.findIndex(pg => pg.x === base && !pg.part);
  const next = strip[at + 1];
  if (at < 0 || !next || next.x !== base || next.part !== 'ans') bad.push('a swipe from the question card does not land on its answer: the strip reads ' + strip.map(pg => pg.x.row.row_id + ':' + (pg.part || 'card')).join(' '));
  d.body.appendChild(hid);
  const other = el(w.questionAnsCard_(fig));
  d.body.appendChild(other);
  const held = w.stuffItemsAll_;
  const turned = d.querySelector('.qans-card[data-of="Q-ANSP-5"]');
  if (!turned || !turned.classList.contains('is-hidden') || turned.innerHTML.indexOf(SECRET) >= 0)
    bad.push('the answer page, swiped to, is open -- revealing is the answer page\'s own tap');
  /* SHOWN BY THE ANSWER PAGE'S OWN TILE, where it stands. */
  const showT = turned && turned.querySelector('[data-do="qa-show"]');
  if (!showT) bad.push('the answer page has no Show tile to press');
  else { w.stuffItemsAll_ = () => [base, fig]; try { A['qa-show'](showT); } finally { w.stuffItemsAll_ = held; } }
  const now = d.querySelector('.qans-card[data-of="Q-ANSP-5"]');
  if (!now || now.classList.contains('is-hidden') || now.textContent.indexOf(SECRET) < 0) bad.push('"Show the answer" on the answer page did not open it');
  else if (now.querySelector('details, .qans-why')) bad.push('showing the answer drew a Why fold under it');
  if (el(w.questionAnsCard_(base)).textContent.indexOf(SECRET) < 0) bad.push('the answer page shut again when it was drawn again');
  const fig2 = d.querySelector('.qans-card[data-of="Q-ANSP-6"]');
  if (!fig2 || !fig2.classList.contains('is-hidden')) bad.push('showing one question\'s answer opened another\'s');
  /* NOT OPENED BY A RIGHT TAP, settled in storage -- nor by a wrong one. */
  const mc = Object.assign({}, base, { key: 'q-ansp-mc', row: row('Q-ANSP-9'), choices: ['17', '17.5'], choiceRight: [2] });
  const shutNow = x => el(w.questionAnsCard_(x)).querySelector('.qans-card.is-hidden') !== null;
  try {
    w.localStorage.setItem(ansKey(mc), '1');
    if (!shutNow(mc)) bad.push('a tapped question answered wrong opened its answer page');
    w.localStorage.setItem(ansKey(mc), '2');
    if (!shutNow(mc)) bad.push('a tapped question answered right opened its answer page by itself -- the card already says Correct, and the page waits for the tap');
  } finally { try { w.localStorage.removeItem(ansKey(mc)); } catch (e) {} }
  /* AND NOT BY A RIGHT TAP AS IT HAPPENS, through the real handler on a real card. */
  const mcLive = Object.assign({}, mc, { key: 'q-ansp-mc2', row: row('Q-ANSP-11') });
  try { w.localStorage.removeItem(ansKey(mcLive)); } catch (e) {}
  const tapCard = el(w.questionCard_(mcLive));
  d.body.appendChild(tapCard);
  typeChoice_(w, tapCard, mcLive, 'B');
  if (!tapCard.querySelector('.qp-mark.is-right')) bad.push('the right letter was not marked Correct, so the Check was NOT checked');
  if (!shutNow(mcLive)) bad.push('typing the right option opened the answer page');
  try { w.localStorage.removeItem(ansKey(mcLive)); } catch (e) {}
  /* AND NOT BY A TYPED ANSWER MARKED RIGHT. */
  const typedX = Object.assign({}, base, { key: 'q-ansp-typed', row: row('Q-ANSP-12'), accept: '17.5' });
  const typedCard = el(w.questionCard_(typedX));
  d.body.appendChild(typedCard);
  const inp = typedCard.querySelector('.qp-ans-in');
  if (inp) { inp.value = '17.5'; inp.dispatchEvent(new w.Event('input', { bubbles: true })); }
  const heldC = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [typedX];
  try { if (typedCard.querySelector('.qp-check')) A['qp-check'](typedCard.querySelector('.qp-check')); } finally { w.stuffItemsAll_ = heldC; }
  if (!typedCard.querySelector('.qp-mark.is-right')) bad.push('17.5 was not marked right, so a right Check was NOT checked');
  if (!shutNow(typedX)) bad.push('a typed answer marked right opened its answer page by itself');
  try { w.localStorage.removeItem(ansKey(typedX)); } catch (e) {}
  /* SAVED: the kept question with its figure on its card, then its answer -- `pageParts_`'s order. */
  const pages = w.cardPages_(fig, 0);
  if (pages.length !== 2) bad.push('Saved draws a question with a figure and an answer as ' + pages.length + ' pages, wanted 2');
  else {
    if (!/<svg viewBox="0 0 10 10">/.test(pages[0])) bad.push('Saved\'s card of a question with a figure does not hold the figure');
    if (!/qans-card[^"]*" data-of="Q-ANSP-6"/.test(pages[1])) bad.push('Saved\'s second page of a question is not its answer');
  }
  if (w.cardPages_(base, 0).length !== 2) bad.push('Saved does not keep the answer page after a kept question');
  if (w.cardPages_(none, 0).length !== 1) bad.push('Saved draws an answer page for a question with no answer');
  /* A TUTOR AND AN ADMIN ARE ASKED THE SAME: hidden until the tap, behind the same tile. */
  [['Ada Tutor', 'P002', 'tutor'], ['Ann Admin', 'P001', 'admin']].forEach(([name, pid, role]) => {
    w.__t.USER({ name: name, personId: pid, role: role, roles: [role] });
    if (!w.__t.isTutorRole()) { bad.push('could not sign ' + role + ' in, so their answer page was NOT checked'); return; }
    const tx = Object.assign({}, base, { key: 'q-ansp-' + role, row: row('Q-ANSP-' + role) });
    if (!shutNow(tx)) bad.push((role === 'admin' ? 'an ' : 'a ') + role + '\'s answer page is open without "Show the answer" -- the owner asked for no difference');
    if (el('').querySelector('[data-do="qa-go"], .tile-i-next')) bad.push((role === 'admin' ? 'an ' : 'a ') + role + '\'s question still carries a tile to the answer -- it went for everybody');
  });
  w.__t.USER(null);
  return bad;
});

/* ---------- SHOW, HIDE, SHOW: ONE TILE ON THE ANSWER PAGE, THE SAME FOR EVERYBODY § */
check('the answer page shows, hides and shows again from one tile, hidden by default, the same for every visitor', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  const need = ['questionAnsCard_', 'ansShow_', 'ansHide_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? Show and Hide were NOT checked'];
  if (!A['qa-show'] || !A['qa-hide']) return ['qa-show or qa-hide has no handler, so the toggle was NOT checked'];
  const SECRET = 'Forty-two-and-a-quarter';
  const x = { kind: 'question', name: 'Q8', marks: 1, key: 'q-toggle-8',
    row: { row_id: 'Q-TOGGLE-8', paper_id: 'P-TOGGLE', subject: 'Maths', name: 'Toggle' },
    html: '<p>Work out 169 &divide; 4</p>', answer: '<b>' + SECRET + '</b> &mdash; 169 &divide; 4' };
  const held = w.stuffItemsAll_;
  const press = (act, from) => {
    const b = from.querySelector('[data-do="' + act + '"]');
    if (!b) return false;
    w.stuffItemsAll_ = () => [x];
    try { A[act](b); } finally { w.stuffItemsAll_ = held; }
    return true;
  };
  /* WHICH CHILD OF THE CARD THE TILE ROW IS -- "the same place" asked as structure, since jsdom lays
     nothing out. `check/states.js` measures the pixels. */
  const slot = card => [...card.children].indexOf(card.querySelector(':scope > .tile-row'));
  const who = [
    ['signed out', null],
    ['a student', { name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'] }],
    ['a tutor', { name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'] }],
    ['an admin', { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] }],
  ];
  for (const [what, u] of who) {
    w.__t.USER(u);
    const host = d.createElement('div');
    host.innerHTML = w.questionAnsCard_(x);
    d.body.appendChild(host);
    const card = () => host.querySelector('.qans-card');
    const hiddenRight = when => {
      const c = card();
      if (!c || !c.classList.contains('is-hidden')) return bad.push(what + ', ' + when + ': the page is not hidden');
      if (c.innerHTML.indexOf(SECRET) >= 0 || c.querySelector('.qans, .qans-body')) bad.push(what + ', ' + when + ': a hidden page still carries the answer in its markup');
      if (!/Answer hidden/.test(c.textContent)) bad.push(what + ', ' + when + ': a hidden page does not say "Answer hidden"');
      const t = c.querySelector('.tile-row [data-do="qa-show"]');
      if (!t || !t.classList.contains('tile')) bad.push(what + ', ' + when + ': a hidden page has no Show tile');
      else if (!t.querySelector('.tile-i-show')) bad.push(what + ', ' + when + ': the Show tile is not the eye');
      if (c.querySelector('[data-do="qa-hide"]')) bad.push(what + ', ' + when + ': a hidden page offers Hide');
    };
    const shownRight = when => {
      const c = card();
      if (!c || c.classList.contains('is-hidden') || c.textContent.indexOf(SECRET) < 0) return bad.push(what + ', ' + when + ': the answer is not shown');
      const t = c.querySelector('.tile-row [data-do="qa-hide"]');
      if (!t || !t.classList.contains('tile')) bad.push(what + ', ' + when + ': a shown page has no Hide tile');
      else if (!t.querySelector('.tile-i-hide')) bad.push(what + ', ' + when + ': the Hide tile is not the struck-through eye');
      if (c.querySelector('[data-do="qa-show"]')) bad.push(what + ', ' + when + ': a shown page still offers Show');
      if (/Answer hidden/.test(c.textContent)) bad.push(what + ', ' + when + ': a shown page still says "Answer hidden"');
    };
    hiddenRight('as drawn');
    const s0 = slot(card());
    /* THE QUESTION'S OWN PAGE, drawn first: no tile to the answer on it, and drawing it reveals nothing. */
    const qt = d.createElement('div');
    qt.innerHTML = w.questionCard_(x) + '<div class="tile-row">' + '' + '</div>';
    d.body.appendChild(qt);
    if (qt.querySelector('[data-do="qa-go"], .tile-i-next')) bad.push(what + ': the question page still carries a tile to the answer');
    qt.remove();
    hiddenRight('after the question was drawn');
    /* THE FOCUS FOLLOWS THE TOGGLE. § */
    const named = e => !e ? '(nothing)' : e === d.body ? '<body>'
      : '<' + e.tagName.toLowerCase() + (e.getAttribute('data-do') ? ' ' + e.getAttribute('data-do') : '') + '>';
    const showT0 = card().querySelector('[data-do="qa-show"]');
    if (showT0) showT0.focus();
    if (!press('qa-show', card())) bad.push(what + ': nothing to press to show it');
    shownRight('after Show');
    if (d.activeElement !== card().querySelector('[data-do="qa-hide"]')) bad.push(what + ': Show threw the focus away -- it is on ' + named(d.activeElement) + ', not on the Hide tile in its place');
    if (slot(card()) !== s0) bad.push(what + ': the tile row moved from child ' + s0 + ' to ' + slot(card()) + ' when the answer was shown');
    if (w.questionAnsCard_(x).indexOf(SECRET) < 0) bad.push(what + ': the page drawn afresh after Show is shut again');
    const elsewhere = d.createElement('input');
    d.body.appendChild(elsewhere);
    elsewhere.focus();
    if (!press('qa-hide', card())) bad.push(what + ': nothing to press to hide it');
    if (d.activeElement !== elsewhere) bad.push(what + ': a Hide pulled the focus to ' + named(d.activeElement) + ' from a box that held it, outside the card');
    elsewhere.remove();
    hiddenRight('after Hide');
    if (slot(card()) !== s0) bad.push(what + ': the tile row moved when the answer was hidden again');
    if (w.questionAnsCard_(x).indexOf(SECRET) >= 0) bad.push(what + ': the page drawn afresh after Hide is still open -- ANS_SHOWN did not forget it');
    if (!press('qa-show', card())) bad.push(what + ': nothing to press to show it a second time');
    shownRight('after Show, Hide, Show');
    /* AND PUT BACK, so the next visitor starts where everybody starts. */
    press('qa-hide', card());
    host.remove();
  }
  /* THE NEXT PERSON ON THE PHONE starts hidden whatever the last one did: the key carries who it is. */
  w.__t.USER(who[1][1]);
  w.ansShow_(x);
  w.__t.USER(who[2][1]);
  if (w.questionAnsCard_(x).indexOf(SECRET) >= 0) bad.push('a tutor\'s page is open because the student before them showed theirs');
  w.__t.USER(who[1][1]);
  w.ansHide_(x);
  w.__t.USER(null);
  return bad;
});

check('a question answered on a diagram has a surface: a grid under the pen, or its passage to ring words in', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const need = ['pageParts_', 'questionCard_', 'padSource_', 'padSurface_', 'surfaceSvg_', 'circWords_']
    .filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The surfaces were NOT checked'];
  const A = w.__t.ACTIONS;
  if (!A['qw-tap']) return ['qw-tap has no handler, so a word cannot be ringed'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; d.body.appendChild(h); return h; };
  const row = (id, extra) => Object.assign({ row_id: id, paper_id: 'P-SURF', subject: 'Maths', name: 'Surface' }, extra || {});
  const q = (id, extra, rowExtra) => Object.assign({ kind: 'question', name: 'Q8', qNumber: '8', marks: 2, key: 'q:Q-SURF-' + id,
    row: row('Q-SURF-' + id, rowExtra), stems: [], html: '<p>Draw the graph of y = 2x + 1.</p>' }, extra || {});

  /* ---------- THE FALLBACK GRID, ON THE CARD ------------------------------------------------------ */
  const grid = q('grid', { answerType: 'drawing' }, { figure: 'grid-blank' });
  /* ONE CARD PER QUESTION NUMBER (960): its one page is 'q' -- the card, its grid where the box would be, no page of its own. */
  if (JSON.stringify(w.pageParts_(grid)) !== '["q"]') bad.push('a drawing question with no picture has pages ' + JSON.stringify(w.pageParts_(grid)) + ', wanted ["q"] -- the card, its grid where the box would be and no page of its own');
  try { w.localStorage.setItem('pad:' + grid.key, JSON.stringify([[20, 20, 200, 200]])); } catch (e) {}
  /* THE CARD IS THE GRID, with no box and nothing to switch (356). */
  const gp = el(w.questionCard_(grid));
  const pad = gp.querySelector('.qcard .qp-area .qpad');
  if (!pad) bad.push('the card of a drawing question shows no pen on its surface');
  if (!gp.querySelector('.qp-ans-in')) bad.push('a drawing question has no answer box -- every part has one (round 3)');
  else {
    if (!pad.querySelector('.qpad-art > svg.qsurf.is-grid')) bad.push('the pen is not over a squared grid: ' + (pad.querySelector('.qpad-art svg') || {}).outerHTML);
    if (pad.querySelectorAll('svg.qsurf line.grid').length < 30) bad.push('the grid has ' + pad.querySelectorAll('svg.qsurf line.grid').length + ' lines -- that is not squared paper');
    if (pad.getAttribute('data-k') !== 'pad:' + grid.key) bad.push('the surface\'s marks are kept under ' + pad.getAttribute('data-k') + ', not the pen\'s own key');
    if (!pad.querySelector('.qpad-g path')) bad.push('a mark stored under the pen\'s key is not drawn back on the surface');
    if (/not the paper.s own figure/i.test(pad.textContent)) bad.push('the surface still says it is not the paper\'s figure -- every credit went on 18 Oct (355)');
  }
  if (/on the next page/i.test(gp.textContent)) bad.push('the card still points at a page after it');
  try { w.localStorage.removeItem('pad:' + grid.key); } catch (e) {}

  /* ---------- WHICH SURFACE ----------------------------------------------------------------------- */
  const svgDiag = '<svg viewBox="0 0 340 200"><circle cx="20" cy="20" r="9"/></svg>';
  [[q('coord', { answerType: 'drawing' }, { figure: 'coordinate-grid' }), 'coord'],
   [q('none', { answerType: 'annotate' }), 'blank'],
   [q('hist', { answerType: 'drawing' }, { figure: 'histogram-grid' }), 'grid'],
   [q('iso', { answerType: 'drawing' }, { figure: 'isometric-dots' }), 'blank'],
   [q('said', { answerType: 'calculation', surface: 'grid' }), 'grid'],
   [q('word', { answerType: 'calculation' }, { figure: 'grid-blank' }), '']
  ].forEach(([x, want]) => {
    const got = w.padSurface_(x);
    if (got !== want) bad.push(x.row.row_id + ' gets surface "' + got + '", wanted "' + want + '"');
  });
  const coord2 = q('coord2', { answerType: 'drawing' }, { figure: 'coordinate-grid' });
  const coordP = el(w.questionCard_(coord2));
  if (!coordP.querySelector('.qp-area svg.qsurf.is-coord line.axis')) bad.push('a coordinate-grid question is not given axes on a grid, on its card');
  const own = q('own', { answerType: 'drawing', diagram: svgDiag });
  const ownCard = el(w.questionCard_(own));
  if (!w.padSource_(own) || w.padSource_(own).from !== 'part' || ownCard.querySelector('svg.qsurf')) bad.push('a drawing question with its own picture had it replaced by a surface');
  /* AND ITS PEN IS OVER THAT PICTURE, IN THE CARD'S SHEET, AND THE PICTURE IS NOWHERE ELSE (356). */
  const ownFace = ownCard.querySelector('.qsheet .qpad .qpad-art > svg:first-child');
  if (!ownFace || ownFace.classList.contains('qsurf')) bad.push('a drawing question with its own picture does not draw that picture under the pen in its card');
  /* THE PICTURE'S CIRCLES, not a tile's mark: the Compass tile is on every pen since 457 */
  const circ = [...ownCard.querySelectorAll('svg circle')].filter(c => !c.closest('.tile-i')).length;
  if (circ !== 1) bad.push('a drawing question\'s own picture is drawn ' + circ + ' times on its card');
  const stemmed = q('stem', { answerType: 'drawing', stems: [{ id: 'S-SURF', html: '<p>Here is a grid.</p>', diagram: svgDiag }] });
  if (!w.padSource_(stemmed) || w.padSource_(stemmed).from === 'surface') bad.push('a drawing question under a stem\'s picture had it replaced by a surface');
  if (w.padSource_(q('plain', { answerType: 'calculation' }))) bad.push('a calculation with no surface named was given something to draw on');

  /* ---------- THE PASSAGE: RING A WORD BY TAPPING IT ------------------------------------------------ */
  const PASS = '<p>The crumbling castle stood high on the rocky hill. Don&rsquo;t forget the glorious views.</p>';
  const text = q('text', { answerType: 'annotate', surface: 'text', lead: '<p>LEADWORD sets the scene.</p>',
    html: '<p>Circle the three <b>adjectives</b> in the passage below.</p>' + PASS });
  const tk = 'pad:' + text.key + ':words';
  try { w.localStorage.removeItem(tk); } catch (e) {}
  if (JSON.stringify(w.pageParts_(text)) !== '["q"]') bad.push('a passage question has pages ' + JSON.stringify(w.pageParts_(text)) + ', wanted ["q"] -- it needs no picture, the passage is the surface');
  const plain = el(w.questionCard_(Object.assign({}, text, { key: 'q:Q-SURF-text-plain', surface: '', answerType: 'short', row: row('Q-SURF-text-plain') })));
  const card = el(w.questionCard_(text));
  const host = card.querySelector('.qsheet-part.is-text[data-circ]');
  if (!host) bad.push('the passage is not drawn as a surface (.qsheet-part.is-text[data-circ])');
  else {
    if (host.getAttribute('data-circ') !== tk) bad.push('the rings are kept under ' + host.getAttribute('data-circ') + ', not beside the pen\'s marks at ' + tk);
    const words = [...host.querySelectorAll('.qw[data-do="qw-tap"]')].map(s => s.textContent);
    ['crumbling', 'castle', 'rocky', 'hill', 'Don’t', 'glorious', 'adjectives'].forEach(t => {
      if (words.indexOf(t) < 0) bad.push('"' + t + '" is not a word you can tap -- the words are ' + JSON.stringify(words.slice(0, 12)));
    });
    if (words.some(t => /[.,]/.test(t))) bad.push('a full stop or comma was taken into a word: ' + JSON.stringify(words.filter(t => /[.,]/.test(t))));
    if (card.querySelector('.qsheet-lead .qw')) bad.push('the lead\'s words were made tappable -- only the part\'s are the surface');
    const flat = n => n.querySelector('.qsheet-pb').textContent.replace(/\s+/g, ' ').trim();
    if (flat(card) !== flat(plain)) bad.push('the passage reads differently once it is a surface:\n            ' + flat(card) + '\n            ' + flat(plain));
    if (!/Tap a word/.test(card.textContent)) bad.push('the page does not say how to ring a word');
    const word = t => [...card.querySelectorAll('.qw')].find(s => s.textContent === t);
    const crumbling = word('crumbling');
    A['qw-tap'](crumbling);
    let stored = [];
    try { stored = JSON.parse(w.localStorage.getItem(tk) || '[]'); } catch (e) {}
    if (!crumbling.classList.contains('is-circled') || crumbling.getAttribute('aria-pressed') !== 'true') bad.push('a tap did not ring "crumbling"');
    if (stored.length !== 1 || stored[0] !== crumbling.getAttribute('data-w')) bad.push('the ring was not stored: ' + JSON.stringify(stored));
    A['qw-tap'](word('rocky'));
    const again = el(w.questionCard_(text));
    const lit = [...again.querySelectorAll('.qw.is-circled')].map(s => s.textContent).sort().join(',');
    if (lit !== 'crumbling,rocky') bad.push('a redrawn card rings [' + lit + '], wanted crumbling and rocky');
    A['qw-tap'](crumbling);
    if (crumbling.classList.contains('is-circled')) bad.push('a second tap did not take the ring off');
    const twin = [...again.querySelectorAll('.qw')].find(s => s.textContent === 'crumbling');
    if (twin && twin.classList.contains('is-circled')) bad.push('the ring came off one copy of the passage and stayed on the other');
  }
  try { w.localStorage.removeItem(tk); } catch (e) {}
  /* A WORD IS NAMED BY ITS BLOCK, so a pre page and the card agree on what to call it. */
  const named = w.circWords_('<p>One two</p>', 3, []);
  if (!/data-w="3\.0"[^>]*>One</.test(named) || !/data-w="3\.1"[^>]*>two</.test(named)) bad.push('words are not named by their block and place: ' + named);
  if (/qw/.test(w.circWords_('<svg><text>Axis</text></svg>', 0, []))) bad.push('words inside a drawing were made tappable');
  return bad;
});

/* ---------- A DRAWING IS THE PERSON'S WHO MADE IT, AS A TYPED ANSWER IS § */
check('a drawing and a ringed word are kept for whoever is signed in, and the phone\'s old ones move once to the first who opens them', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const t = w.__t;
  const A = t.ACTIONS;
  const bad = [];
  if (typeof w.questionCard_ !== 'function' || !t.padKey || !A['pad-undo'] || !A['qw-tap']) {
    return ['questionCard_, padKey_ or the pen\'s handlers are not reachable — renamed? Whose drawing it is was NOT checked'];
  }
  const LS = w.localStorage;
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; d.body.appendChild(h); return h; };
  const row = id => ({ row_id: id, paper_id: 'P-WHO', subject: 'Maths', name: 'Whose' });
  const x = { kind: 'question', name: 'Q8c', qNumber: '8', qPart: 'c', marks: 2, key: 'q:Q-WHO-8c', row: row('Q-WHO-8c'),
              stems: [], answerType: 'drawing', html: '<p>Draw the graph of y = 2x.</p>' };
  const OLD = 'pad:q:Q-WHO-8c';
  const ALI = { name: 'Ali', personId: 'P21', role: 'student', roles: ['student'] };
  const BEN = { name: 'Ben', personId: 'P22', role: 'student', roles: ['student'] };
  const CY = { name: 'Cy', personId: 'P23', role: 'student', roles: ['student'] };
  const got = k => { try { return JSON.parse(LS.getItem(k) || '[]'); } catch (e) { return ['unreadable']; } };
  /* ON ITS CARD, SWITCHED TO THE DRAWING for whoever is signed in -- a made-up surface is the answer box's
     other face now, not a page (327); the face is remembered by the pad's own per-person key. */
  const pad = () => el(w.questionCard_(x)).querySelector('.qp-area .qpad');
  const lines = p => (p ? p.querySelectorAll('.qpad-g path').length : -1);

  /* SIGNED OUT: THE PHONE'S KEY, AND A LINE LEFT ON IT FROM BEFORE TODAY. */
  t.USER(null);
  if (t.padKey(x) !== OLD) bad.push('signed out, the marks are kept under ' + t.padKey(x) + ', not the phone\'s ' + OLD);
  LS.setItem(OLD, JSON.stringify([[10, 10, 100, 100]]));
  /* ALI OPENS IT FIRST, AND THE LINE BECOMES HERS. */
  t.USER(ALI);
  const kA = t.padKey(x);
  if (kA !== 'pad:u:P21:q:Q-WHO-8c') bad.push('signed in, the marks are kept under ' + kA + ', not under who is signed in');
  const pa = pad();
  if (!pa) return bad.concat(['a drawing question drew no pad']);
  if (pa.getAttribute('data-k') !== kA) bad.push('Ali\'s pad writes to ' + pa.getAttribute('data-k') + ', not to her key ' + kA);
  if (lines(pa) !== 1) bad.push('the phone\'s old line is not on the pad of the first person who opened it (' + lines(pa) + ' lines)');
  if (got(kA).length !== 1) bad.push('the phone\'s old line was not stored under Ali\'s key: ' + JSON.stringify(got(kA)));
  if (LS.getItem(OLD) !== null) bad.push('the phone\'s old line was COPIED to Ali, not moved — the next person would see it too');
  LS.setItem(kA, JSON.stringify([[10, 10, 100, 100], [20, 20, 200, 200]]));
  /* BEN, SAME PHONE: A CLEAN GRID, AND HIS UNDO IS HIS. */
  t.USER(BEN);
  const kB = t.padKey(x);
  const pb = pad();
  if (lines(pb) !== 0) bad.push('Ben, signed in after Ali on the same phone, sees ' + lines(pb) + ' of her lines');
  if (pb.getAttribute('data-k') !== kB || kB === kA) bad.push('Ben\'s pad writes to ' + pb.getAttribute('data-k') + ' — Ali\'s key is ' + kA);
  LS.setItem(kB, JSON.stringify([[5, 5, 50, 50]]));
  const pb2 = pad();
  A['pad-undo'](padTile_(pb2, '.qpad-undo'));
  if (got(kB).length !== 0) bad.push('Undo on Ben\'s pad did not take Ben\'s mark: ' + JSON.stringify(got(kB)));
  if (got(kA).length !== 2) bad.push('Undo on Ben\'s pad touched Ali\'s marks: ' + JSON.stringify(got(kA)));
  /* THE PHONE DRAWS AGAIN SIGNED OUT; ALI ALREADY HAS MARKS, SO THEY WAIT FOR SOMEBODY WITH NONE. */
  t.USER(null);
  LS.setItem(OLD, JSON.stringify([[1, 1, 2, 2]]));
  t.USER(ALI);
  const pa2 = pad();
  if (lines(pa2) !== 2 || got(kA).length !== 2) bad.push('the phone\'s marks were moved over marks Ali already had: ' + JSON.stringify(got(kA)));
  if (LS.getItem(OLD) === null) bad.push('the phone\'s marks vanished when the person who opened them already had some');
  t.USER(CY);
  if (lines(pad()) !== 1 || LS.getItem(OLD) !== null) bad.push('the phone\'s marks did not move to the next person with none');
  /* ALI AGAIN: HERS, AND ONLY HERS. */
  t.USER(ALI);
  if (lines(pad()) !== 2) bad.push('Ali, signed in again, does not get her two lines back (' + lines(pad()) + ')');

  /* ---------- AND A PASSAGE'S RINGS, THE SAME WAY ----------------------------------------------------- */
  const text = { kind: 'question', name: 'Q9', qNumber: '9', marks: 1, key: 'q:Q-WHO-9', row: row('Q-WHO-9'), stems: [],
                 answerType: 'annotate', surface: 'text', html: '<p>Circle the adjective.</p><p>The tall tree swayed.</p>' };
  const OLDW = 'pad:q:Q-WHO-9:words';
  t.USER(null);
  const tall = (() => { const h = el(w.questionCard_(text)).querySelector('[data-circ]'); return [...h.querySelectorAll('.qw')].find(s => s.textContent === 'tall').getAttribute('data-w'); })();
  LS.setItem(OLDW, JSON.stringify([tall]));
  t.USER(ALI);
  const hostA = el(w.questionCard_(text)).querySelector('[data-circ]');
  const kAw = 'pad:u:P21:q:Q-WHO-9:words';
  if (!hostA || hostA.getAttribute('data-circ') !== kAw) bad.push('Ali\'s rings are kept under ' + (hostA && hostA.getAttribute('data-circ')) + ', not ' + kAw);
  else {
    const lit = [...hostA.querySelectorAll('.qw.is-circled')].map(s => s.textContent).join(',');
    if (lit !== 'tall') bad.push('the phone\'s old ring did not come to the first person who opened the passage: [' + lit + ']');
    if (LS.getItem(OLDW) !== null) bad.push('the phone\'s old ring was copied, not moved');
  }
  t.USER(BEN);
  const hostB = el(w.questionCard_(text)).querySelector('[data-circ]');
  if (hostB.querySelectorAll('.qw.is-circled').length) bad.push('Ben sees Ali\'s ringed word');
  A['qw-tap']([...hostB.querySelectorAll('.qw')].find(s => s.textContent === 'tree'));
  if (got('pad:u:P22:q:Q-WHO-9:words').length !== 1) bad.push('Ben\'s ring was not stored under his own key');
  if (JSON.stringify(got(kAw)) !== JSON.stringify([tall])) bad.push('Ben\'s tap changed Ali\'s rings: ' + JSON.stringify(got(kAw)));
  t.USER(null);
  [OLD, kA, kB, 'pad:u:P23:q:Q-WHO-8c', OLDW, kAw, 'pad:u:P22:q:Q-WHO-9:words'].forEach(k => { try { LS.removeItem(k); } catch (e) {} });
  return bad;
});

/* ---------- A DRAWN ANSWER IS DRAWN ON ITS OWN FIGURE, IN ITS OWN CARD (docs/history/356) § */
check('June 2024 1F Q7 is one card with its grid under the pen in its words: no box, no switch, no figure page', async () => {
  const ID = 'Q-1MA1-2406-1F-7';
  const LIB = LIB_FULL.rows('questions');
  const row = LIB.find(r => r.row_id === ID);
  if (!row) return [ID + ' is not in data/questions.json — NOT checked'];
  const paper = LIB.filter(r => r.paper_id === row.paper_id);
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? paper : undefined) });
  await wait(300);
  const d = w.document, t = w.__t, A = t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || !t.padKey) return ['questionCard_ or padKey_ not reachable — NOT checked'];
  const x = w.stuffItemsAll_().find(it => it.row && it.row.row_id === ID);
  if (!x) return ['the real ' + ID + ' did not come through the loader — NOT checked'];
  const parts = JSON.stringify(w.pageParts_(x));
  /* ONE CARD PER QUESTION NUMBER (960): a question is the one page 'q' */
  if (parts !== '["q"]') bad.push(ID + ' has pages ' + parts + ', wanted ["q"] (960)');
  const host = d.createElement('div');
  d.body.appendChild(host);
  host.innerHTML = w.questionCard_(x) + '';
  const pad = host.querySelector('.qcard .qsheet .qpad');
  if (!pad) bad.push('the card does not hold the grid as a pen inside its sheet');
  if (host.querySelectorAll('.qp-ans-in').length !== 1) bad.push('the card draws ' + host.querySelectorAll('.qp-ans-in').length + ' answer boxes, wanted the one every part has');
  if (host.querySelector('[data-do="q-draw"], .q-drawt')) bad.push('the card still carries a Draw tile');
  if (/on the next page/i.test(host.textContent)) bad.push('the card still points at a page');
  if (pad && pad.getAttribute('data-k') !== t.padKey(x)) bad.push('the pad is keyed ' + pad.getAttribute('data-k') + ', not padKey_ ' + t.padKey(x));
  /* A STROKE, SAVED UNDER THE PAD'S KEY -- through the store the pen writes, as the other journeys put one. */
  if (pad) {
    try { w.localStorage.setItem(t.padKey(x), JSON.stringify([[30, 30, 120, 90]])); } catch (e) {}
    host.innerHTML = w.questionCard_(x);
    if (!host.querySelector('.qsheet .qpad .qpad-g path')) bad.push('a stroke kept under padKey_ is not drawn back on the card');
    try { w.localStorage.removeItem(t.padKey(x)); } catch (e) {}
  }
  return bad;
});

/* ---------- AND OVER THE WHOLE LIBRARY: NO FIGURE PAGE, NO POINTER, EVERY FIGURE ONCE § */
check('no question in the library has a figure page or points at one, and every figure is drawn once', async () => {
  const LIB = LIB_FULL.rows('questions');
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? LIB : undefined) });
  await wait(300);
  const bad = [];
  let qs = [];
  for (let i = 0; i < 100 && !(qs = w.stuffItemsAll_().filter(x => x.kind === 'question')).length; i++) await wait(100);
  if (qs.length < 5000) return ['only ' + qs.length + ' questions came through the loader — NOT checked'];
  const sorted = w.stuffSorted_(qs);
  const byQ = {};
  sorted.forEach(x => { const k = x.qNumber != null && x.row ? x.row.paper_id + '|' + x.qNumber : x.key; (byQ[k] = byQ[k] || []).push(x); });
  let pages = 0, figs = 0;
  const gone = {}, ptr = [], miss = [], twice = [];
  Object.keys(byQ).forEach(k => {
    const list = byQ[k];
    let html = '';
    list.forEach((x, i) => {
      const pp = w.pageParts_(x, list[i - 1] || null);
      pp.forEach(p => {
        pages++;
        if (/^(fig|sfig\d+|use|nofig)$/.test(p || '')) gone[p.replace(/\d+$/, '')] = (gone[p.replace(/\d+$/, '')] || 0) + 1;
        const h = p ? w.stuffPart_(x, p) : w.questionCard_(x);
        if (/Figure on the next page/.test(h)) ptr.push(x.row.row_id);
        html += h;
      });
    });
    const svgs = new Set();
    list.forEach(x => { if (x.diagram) svgs.add(x.diagram); (x.stems || []).forEach(p => { if (p && p.diagram) svgs.add(p.diagram); }); });
    svgs.forEach(s => {
      figs++;
      /* A THIN PICTURE UNDER A PEN IS DRAWN WITH ROOM ABOVE AND BELOW (`padRoom_`, 385): the same figure, its viewBox taller */
      const roomy = typeof w.padRoom_ === 'function' ? w.padRoom_(s) : s;
      const n = html.split(s).length - 1 + (roomy !== s ? html.split(roomy).length - 1 : 0);
      /* THE ONLY REPEATS: parts whose rows each carry the same picture as their own (each draws it in its card); a stem's figure under each part whose pen is on it § */
      const owners = list.filter(x => x.diagram === s).length;
      const stemPens = list.filter(x => { const p = w.padSource_(x); return p && p.svg === s && p.from !== 'part'; }).length;
      const uses = list.filter(x => { const y = w.usesOf_(x); const p = y && w.padSource_(y); return p && p.svg === s && x.diagram !== s; }).length;
      /* AND A SHORT STEM'S FIGURE ON EACH PART'S CARD (500): "picture missing" on 16(a), whose graph was a page before it */
      const carried = typeof w.stemOnCard_ === 'function' ? list.filter(x => (w.stemOnCard_(x) || {}).diagram === s && x.diagram !== s).length : 0;
      if (!n) miss.push(list[0].row.row_id);
      else if (n > Math.max(1, owners + stemPens + carried) + uses) twice.push(list[0].row.row_id + ' x' + n);
    });
  });
  Object.keys(gone).forEach(p => bad.push(gone[p] + ' `' + p + '` page(s) in the strip -- a figure is never a page of its own'));
  if (ptr.length) bad.push(ptr.length + ' page(s) say "Figure on the next page": ' + ptr.slice(0, 4).join(', '));
  if (miss.length) bad.push(miss.length + ' figure(s) drawn on no page: ' + miss.slice(0, 4).join(', '));
  if (twice.length) bad.push(twice.length + ' figure(s) drawn more than once: ' + twice.slice(0, 4).join(', '));
  console.log('          ' + qs.length + ' questions, ' + pages + ' pages, ' + figs + ' figures each drawn where it belongs');
  return bad;
});

/* ---------- WHAT A QUESTION IS ANSWERED WITH: A DRAWING, A VALUE, OR BOTH (`qtDrawn_` and its marker since round 3; was `answerKinds_`) § */
check('the hexagon shows its surface and its box, a question with options or cells shows them and no pen until its Pen is tapped, and the triangle is a pen with ruler and protractor', async () => {
  const IDS = ['Q-CBM-2d-shapes-2', 'Q-STA-KS2-2025-GPS1-2', 'Q-STA-KS2-2019-P2-13', 'Q-CBM-5AD-F-0708-4'];
  const LIB = LIB_FULL.rows('questions');
  const rows = IDS.map(id => LIB.find(r => r.row_id === id));
  if (rows.some(r => !r)) return ['a row is missing from data/questions.json — NOT checked'];
  const papers = new Set(rows.map(r => r.paper_id));
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? LIB.filter(r => papers.has(r.paper_id)) : undefined) });
  await wait(300);
  const d = w.document, bad = [];
  if (typeof w.markerOf_ !== 'function' || typeof w.qtRow_ !== 'function') return ['markerOf_ or qtRow_ not reachable — NOT checked'];
  const [hex, gps, tri, lab] = IDS.map(id => w.stuffItemsAll_().find(it => it.row && it.row.row_id === id));
  if (!hex || !gps || !tri || !lab) return ['a real row did not come through the loader — NOT checked'];
  const card = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x); return h; };
  const H = card(hex), G = card(gps), T = card(tri);
  if (!H.querySelector('.qp-area .qpad') || !H.querySelector('.qp-ans-in')) bad.push('the hexagon does not show both its surface and its box');
  /* ROUND 3: options and no pen until the Pen is tapped; the triangle a pen over its figure AND the one box every part has */
  if (!G.querySelector('.qp-optlist') || !G.querySelector('.qp-ans-in') || G.querySelector('.qpad')) bad.push('GPS1-2 does not show its options and its one box alone before its Pen is tapped');
  /* A DRAWN TYPE ANSWERED BY CELLS (a times-table grid to annotate): its cells, and its pen only once the Pen is tapped */
  const Lb = card(lab);
  if (!Lb.querySelector('.qp-cell') || Lb.querySelector('.qpad')) bad.push('5AD-F-0708-4 does not show its cells alone before its Pen is tapped');
  w.qtPenSet_(lab, true);
  if (!card(lab).querySelector('.qpad')) bad.push('5AD-F-0708-4 has nothing to draw on after its Pen is tapped');
  w.qtPenSet_(lab, false);
  if (w.markerOf_(gps).kind !== 'choice') bad.push('GPS1-2 is marked as ' + w.markerOf_(gps).kind + ', wanted by its options');
  if (!T.querySelector('.qsheet .qpad') || T.querySelectorAll('.qp-ans-in').length !== 1) bad.push('KS2 2019 P2 Q13 is not a pen over its figure with its one box');
  const tools = [...T.querySelectorAll('.qt-row .qt-t[data-tool]')].map(e => e.getAttribute('data-tool'));
  if (tools.indexOf('ruler') < 0 || tools.indexOf('protractor') < 0) bad.push('the triangle\'s tools are ' + tools.join(', ') + ', wanted a ruler and a protractor');
  return bad;
});

/* ---------- A PLACE KEPT ON A FIGURE PAGE REOPENS ON ITS ITEM'S CARD § */
check('a place kept on a figure page that no longer exists reopens on that question\'s card', async () => {
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.finderOpen_ !== 'function') return ['finderOpen_ not reachable — NOT checked'];
  const row = id => ({ row_id: id, paper_id: 'P-KEPT', subject: 'Maths', name: 'Kept' });
  const mk = (p, extra) => Object.assign({ kind: 'question', name: 'Q2(' + p + ')', qNumber: '2', qPart: p, marks: 1, key: 'q-kept-' + p,
    row: row('Q-KEPT-' + p), stems: [], html: '<p>Part ' + p + '</p>', answer: '<b>1</b>' }, extra || {});
  const list = [mk('a'), mk('b', { diagram: '<svg viewBox="0 0 10 10"></svg>' }), mk('c')];
  const heldF = w.stuffFiltered, heldA = w.stuffItemsAll_;
  w.stuffFiltered = () => list;
  w.stuffItemsAll_ = () => list;
  try {
    w.finderOpen_(list[1], 'fig');
    const pages = w.stuffPages_();
    const P = typeof w.__t.PAGE === 'function' ? w.__t.PAGE() : w.__t.PAGE;
    const at = ((P || {}).stuff || 0) - w.stuffFirstResult_();
    const pg = pages[at];
    /* ONE CARD PER QUESTION NUMBER (960): (b)'s card is its question's one page, (b) among its parts. */
    if (!pg || pg.part !== 'q' || (pg.parts || [pg.x]).indexOf(list[1]) < 0) bad.push('a place on (b)\'s old figure page opened on ' + (pg ? pg.x.qPart + ':' + (pg.part || 'card') + ' holding ' + (pg.parts || [pg.x]).map(x => x.qPart).join('') : 'page ' + at) + ', wanted (b)\'s card, its question\'s page');
  } catch (e) { bad.push('finderOpen_ threw: ' + e.message); }
  finally { w.stuffFiltered = heldF; w.stuffItemsAll_ = heldA; }
  return bad;
});

/* ---------- "USE YOUR GRAPH" SHOWS YOUR GRAPH § */
check('a part that uses an earlier part\'s drawing shows it, read only, in its own card: in front of its words or under its own pen', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const t = w.__t;
  const A = t.ACTIONS;
  const bad = [];
  const need = ['pageParts_', 'stuffPart_', 'questionCard_', 'cardPages_', 'usesOf_', 'figsBefore_', 'figMissing_'].filter(n => typeof w[n] !== 'function');
  if (need.length || !t.padKey || !A['pad-undo']) return [(need.join(', ') || 'padKey_ / pad-undo') + ' not reachable — renamed? "Use your graph" was NOT checked'];
  const LS = w.localStorage;
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; d.body.appendChild(h); return h; };
  const row = id => ({ row_id: id, paper_id: 'P-USE', subject: 'Maths', name: 'Uses' });
  const GRID = '<svg viewBox="0 0 340 340"><line class="grid" x1="10" y1="10" x2="330" y2="10"/></svg>';
  const SCALE = '<svg viewBox="0 0 340 80"><line class="axis" x1="10" y1="40" x2="330" y2="40"/></svg>';
  const part = (q, p, extra) => Object.assign({ kind: 'question', name: 'Q' + q + p, qNumber: String(q), qPart: p, marks: 2,
    key: 'q:Q-USE-' + q + p, row: row('Q-USE-' + q + p), stems: [], html: '<p>Part ' + p + '.</p>' }, extra || {});
  const stem = { id: 'S-USE-24', html: '<p>Here is a table of values.</p>' };
  const b = part(24, 'b', { answerType: 'annotate', diagram: GRID, html: '<p>On the grid, draw the graph of y = x&sup2; &minus; x.</p>', answer: '<b>a curve</b>', stems: [stem] });
  const c = part(24, 'c', { uses: 'b', html: '<p>Use your graph to find estimates for the solutions of x&sup2; &minus; x = 4.</p>', answer: '<b>&minus;1.6, 2.6</b>', stems: [stem] });
  const cAlone = part(24, 'z', { uses: 'q', html: '<p>Names a part that is not there.</p>' });
  const i6 = part(6, '(i)', { answerType: 'annotate', diagram: SCALE, answer: '<b>&frac12;</b>' });
  /* `diagram_by: family`, as every one of the 470 real ones is: nothing under the pen may say so (355). */
  const ii6 = part(6, '(ii)', { answerType: 'annotate', diagram: SCALE, uses: 'i', answer: '<b>0</b>', diagramBy: 'family' });
  const f3 = part(1, '3', { answerType: 'drawing', diagram: GRID, html: '<p>Complete Figure 2.</p>' });
  const f4 = part(1, '4', { answerType: 'explain', diagram: GRID, uses: '3', html: '<p>How does Figure 2 show it?</p>' });
  const sa = part(3, 'a', { answerType: 'drawing', diagram: SCALE });
  const sb = part(3, 'b', { answerType: 'drawing', diagram: SCALE, uses: 'a' });
  const sc = part(3, 'c', { answerType: 'drawing', diagram: SCALE, uses: 'b' });
  const sd = part(3, 'd', { uses: 'c', answer: '<b>8 &deg;C</b>' });
  const l1 = part(4, 'a', { answerType: 'drawing', diagram: GRID, uses: 'b' });
  const l2 = part(4, 'b', { answerType: 'drawing', diagram: GRID, uses: 'a' });
  const ax = part(25, 'a', { answerType: 'drawing', surface: 'coord', html: '<p>On the axes, draw the graph of y = 2x.</p>' });
  const axUse = part(25, 'b', { uses: 'a', html: '<p>Use the graph to find x when y = 6.</p>', answer: '<b>3</b>' });
  /* TWO PARTS DRAWN ON ONE STEM'S GRID, the second using the first (June 2017 2H Q20: "use your graph", then
     a tangent on the same curve) -- neither has a figure page of its own any more (337). */
  const gStem = { id: 'S-USE-20', html: '<p>Here is the graph of y = x&sup2; &minus; 2x.</p>', diagram: GRID };
  const g20a = part(20, 'a', { answerType: 'drawing', stems: [gStem], html: '<p>Draw a suitable straight line.</p>' });
  const g20b = part(20, 'b', { answerType: 'drawing', stems: [gStem], uses: 'a', html: '<p>Draw a tangent at P.</p>' });
  const LIB = [b, c, cAlone, i6, ii6, f3, f4, sa, sb, sc, sd, l1, l2, ax, axUse, g20a, g20b];
  const held = w.stuffItemsAll_, heldItems = w.stuffItems;
  w.stuffItemsAll_ = () => LIB;
  /* AND `stuffItems`, which `questionParts_` reads -- the Figure tile and "not drawn yet" ask it for a
     part's question. */
  w.stuffItems = () => LIB;
  const put = (x, marks) => LS.setItem(t.padKey(x), JSON.stringify(marks));
  const ALI = { name: 'Ali', personId: 'P31', role: 'student', roles: ['student'] };
  const BEN = { name: 'Ben', personId: 'P32', role: 'student', roles: ['student'] };
  const paths = (root, sel) => (root ? root.querySelectorAll(sel + ' path').length : -1);
  try {
    t.USER(ALI);
    put(b, [[20, 300, 100, 120, 170, 60], [200, 60, 320, 300]]);
    const CRED = /redrawn|not the paper.s own|drawn (by|for) @family|your marks from|marks are yours|yours from|nothing drawn on|your drawing/i;
    const card = x => el(w.questionCard_(x)).querySelector('.qcard');
    /* THE MARKED PICTURE IN FRONT OF (c)'s WORDS, IN (c)'s CARD (it was the `use` page; 356). */
    const seenIn = x => { const c0 = card(x); return c0 ? c0.querySelector('.qsheet .qseen') : null; };
    const penOf = x => { const c0 = card(x); return c0 ? c0.querySelector('.qsheet .qpad, .qp-area .qpad') : null; };
    /* ---------- IN (c)'s CARD, IN FRONT OF ITS WORDS ---------------------------------------------------- */
    const pc = w.pageParts_(c);
    /* ONE CARD PER QUESTION NUMBER (960): its opening, its words and its answer are all on the one page 'q' -- no page for the graph. */
    if (JSON.stringify(pc) !== '["q"]') bad.push('(c) alone has pages ' + JSON.stringify(pc) + ', wanted ["q"]: its opening, its card, its answer on one page -- no page for the graph');
    const cc = card(c), seen = seenIn(c);
    if (!seen) bad.push('(c)\'s card does not show (b)\'s graph');
    else {
      if (cc.innerHTML.indexOf('qseen') > cc.innerHTML.indexOf('Use your graph')) bad.push('(b)\'s graph is not in front of (c)\'s words');
      if (paths(seen, '.qpad-was') !== 2) bad.push('(c)\'s card shows ' + paths(seen, '.qpad-was') + ' of the two marks Ali made on (b)');
      if (!seen.querySelector('.qpad-art > svg line.grid')) bad.push('(c)\'s card does not draw (b)\'s picture under the marks');
      if (seen.querySelector('.qpad, [data-do], .tile, .qp-ans, .qpad-g')) bad.push('(b)\'s graph on (c)\'s card can be drawn on, pressed or typed into — it is (b)\'s answer, read only');
    }
    if (CRED.test(cc.textContent)) bad.push('(c)\'s card still says whose marks these are');
    const saved = w.cardPages_(c, 0);
    if (saved.length !== 1 || !/qseen/.test(saved[0] || '')) bad.push('on Saved, (c) is ' + saved.length + ' pages and its card does not carry the graph');
    /* ITS ANSWER IS IN ITS OWN PART, AFTER ITS WORDS (960) -- not a page after it. */
    const sv = el(saved[0] || ''), cPart = sv.querySelector('.qb-part[data-of="Q-USE-24c"]');
    if (!cPart || !cPart.querySelector('.qans-card') || cPart.innerHTML.indexOf('qans-card') < cPart.innerHTML.indexOf('Use your graph')) bad.push('(c)\'s answer is not in (c)\'s own part, after its words');
    /* ---------- THE FIGURE TILE ON (c) OPENS (b)'s PICTURE WITH THE GRAPH ON IT ---------------------- */
    const sheet = el((w.figsBefore_(c)[0] || {}).html || '');
    if (paths(sheet.querySelector('.qseen'), '.qpad-was') !== 2) bad.push('the Figure tile on (c) opens (b)\'s grid with ' + paths(sheet.querySelector('.qseen'), '.qpad-was') + ' of Ali\'s two marks');
    if (CRED.test((w.figsBefore_(c)[0] || {}).label || '') || CRED.test(sheet.textContent)) bad.push('the Figure tile on (c) still captions the marks as the child\'s');
    if (sheet.querySelector('.qpad')) bad.push('the Figure tile on (c) gives a pen to (b)\'s answer');
    /* ---------- "USE THE GRAPH" AFTER A SURFACE IS NEVER "NOT DRAWN YET" ------------------------------- */
    if (w.figMissing_(Object.assign({}, axUse, { uses: '' })) !== true) bad.push('control: without its `uses`, Q25b "Use the graph" is not "not drawn yet" — the case below proves nothing');
    if (w.figMissing_(axUse)) bad.push('Q25b, which uses (a)\'s graph, is also "not drawn yet"');
    const axCard = card(axUse);
    if (/not drawn yet/i.test(axCard.textContent) || !axCard.querySelector('.qseen')) bad.push('Q25b\'s card is not (a)\'s graph with no "not drawn yet"');
    t.USER(BEN);
    if (el((w.figsBefore_(c)[0] || {}).html || '').querySelector('.qseen .qpad-was path')) bad.push('Ben\'s Figure tile on (c) shows Ali\'s graph');
    if (paths(seenIn(c), '.qpad-was') !== 0) bad.push('Ben\'s (c) shows Ali\'s graph');
    t.USER(ALI);
    /* ---------- ONE PICTURE, DRAWN ON TWICE: UNDER THE PEN, IN THE CARD ------------------------------------ */
    put(i6, [[170, 40, 170, 40]]);
    put(ii6, [[10, 40, 10, 40]]);
    const cII = card(ii6);
    if (cII.querySelectorAll('.qseen').length) bad.push('(ii), whose own figure is (i)\'s picture, also shows a read-only copy');
    const padII = penOf(ii6);
    if (paths(padII, '.qpad-was') !== 1) bad.push('(ii)\'s scale does not carry (i)\'s cross (' + paths(padII, '.qpad-was') + ')');
    if (paths(padII, '.qpad-g') !== 1) bad.push('(ii)\'s own marks are ' + paths(padII, '.qpad-g') + ', wanted its one cross');
    if (padII && CRED.test(padII.textContent)) bad.push('(ii)\'s pad still carries a line about whose marks are fainter');
    if (padII) A['pad-undo'](padTile_(padII, '.qpad-undo'));
    if (paths(padII, '.qpad-was') !== 1 || paths(padII, '.qpad-g') !== 0) bad.push('Undo on (ii) did not take (ii)\'s cross alone');
    if (JSON.parse(LS.getItem(t.padKey(i6)) || '[]').length !== 1) bad.push('Undo on (ii) changed what (i) stored');
    /* EVERY OTHER PART'S INK ON THE ONE PICTURE, a later part's too (381): (ii)'s cross is under (i)'s pen */
    if (paths(penOf(i6), '.qpad-was') !== 0) bad.push('(i) shows marks (ii) no longer has');
    put(ii6, [[10, 40, 10, 40]]);
    if (paths(penOf(i6), '.qpad-was') !== 1 || paths(penOf(i6), '.qpad-g') !== 1) bad.push('(i) does not show (ii)\'s cross faint under its own');
    LS.removeItem(t.padKey(ii6));
    LS.removeItem(t.padKey(i6));
    /* ---------- ONE PICTURE, LOOKED AT: ITS COPY IN THE CARD, NO PEN ------------------------------------ */
    put(f3, [[20, 20, 300, 300]]);
    const c4 = card(f4);
    /* ITS OWN FIGURE IS ITS PAD FROM THE START (1020): (3)'s line lies faint under (4)'s pen, and no read-only copy is drawn as well. */
    const pen4 = c4.querySelector('.qsheet .qpad');
    if (paths(pen4, '.qpad-was') !== 1 || c4.querySelector('.qseen')) bad.push('(4), whose own figure is Figure 2, does not show (3)\'s line faint under its pen, once, in its card');
    LS.removeItem(t.padKey(f3));
    const c4b = card(f4);
    if (c4b.querySelector('.qseen') || paths(c4b.querySelector('.qsheet .qpad'), '.qpad-was') !== 0 || !c4b.querySelector('.qsheet .qpad .qpad-art svg')) bad.push('with nothing drawn on (3), (4)\'s card is not its plain figure under its pen');
    /* ---------- A CHAIN ON ONE PICTURE ------------------------------------------------------------------ */
    put(sa, [[10, 10, 10, 10], [20, 20, 20, 20]]);
    put(sb, [[5, 70, 330, 10]]);
    put(sc, [[40, 40, 40, 40]]);
    if (paths(penOf(sb), '.qpad-was') !== 3) bad.push('(b)\'s scatter does not carry (a)\'s points and (c)\'s mark under its pen (381)');
    if (paths(penOf(sc), '.qpad-was') !== 3) bad.push('(c)\'s scatter does not carry (a)\'s points and (b)\'s line under its pen');
    if (paths(seenIn(sd), '.qpad-was') !== 4) bad.push('(d)\'s card does not carry (a)\'s, (b)\'s and (c)\'s marks together');
    /* ---------- A STEM'S PEN THAT USES THE PART BEFORE IT: THE PICTURE IN FRONT, AND THE MARKS UNDER ITS PEN -- */
    put(g20a, [[20, 20, 300, 300]]);
    /* ONE CARD PER QUESTION NUMBER (960): (b) after (a) of the same number has no page of its own -- it is in Q20's card. */
    if (JSON.stringify(w.pageParts_(g20b, g20a)) !== '[]') bad.push('Q20(b) has pages ' + JSON.stringify(w.pageParts_(g20b, g20a)) + ', wanted none -- it is a part of Q20\'s one card');
    /* ONE FIGURE ON THE CARD (381): (a)'s line is under (b)'s pen, and no marked copy in front of its words as well */
    if (seenIn(g20b)) bad.push('Q20(b)\'s card shows (a)\'s line twice: a copy in front of its words and under its pen');
    const pen20 = penOf(g20b);
    if (paths(pen20, '.qpad-was') !== 1 || (pen20 && pen20.getAttribute('data-k')) !== t.padKey(g20b)) bad.push('Q20(b)\'s pen does not show (a)\'s line fainter under it, on its own key');
    /* ---------- A LOOP, AND A PART THAT IS NOT THERE ---------------------------------------------------- */
    put(l1, [[1, 1, 2, 2]]); put(l2, [[3, 3, 4, 4]]);
    if (paths(penOf(l1), '.qpad-was') !== 1) bad.push('two parts naming each other drew ' + paths(penOf(l1), '.qpad-was') + ' earlier marks, wanted the other one\'s and no more');
    if (JSON.stringify(w.pageParts_(cAlone)) !== '["q"]') bad.push('a part naming a part that is not there has pages ' + JSON.stringify(w.pageParts_(cAlone)) + ', wanted its one card ["q"]');
  } catch (e) {
    bad.push('threw: ' + e.message);
  } finally {
    w.stuffItemsAll_ = held;
    w.stuffItems = heldItems;
    [ALI, BEN].forEach(u => { t.USER(u); LIB.forEach(x => { try { LS.removeItem(t.padKey(x)); } catch (e) {} }); });
    t.USER(null);
  }
  return bad;
});

/* ---------- FIND DRAWS THE SAME THING FOR A TUTOR, AN ADMIN, A STUDENT AND SOMEBODY SIGNED OUT § */
check('Find and Find 2 draw the same question family, practical, project and content card for a tutor, an admin, a student and nobody', async () => {
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the real kinds were NOT checked — not a pass'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { practicals: read('practicals'), projects: read('projects'), textbooks: read('textbooks') })));
  const p = payload();
  Object.assign(p, { practicals: made.practicals || [], projects: made.projects || [], textbooks: made.textbooks || [],
                     features: (p.features || []).concat(['aiMark']), aiMarking: true });
  /* THE BIBLE'S INDEX, SERVED (499): an admin's verses are built from it, so without it there is no Bible to offer. */
  const { w } = boot({ payload: p, serve: u => (/data\/bible\/index\.json/.test(u) ? JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'bible', 'index.json'), 'utf8')) : undefined) });
  await wait(300);
  const t = w.__t;
  const bad = [];
  const need = ['pageParts_', 'stuffPart_', 'stuffCard', 'questionAnsCard_', 'ansShow_', 'stuffItems'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The sameness was NOT checked'];
  const svg = '<svg viewBox="0 0 340 200"><circle cx="20" cy="20" r="9"/></svg>';
  const row = id => ({ row_id: id, paper_id: 'P-SAME', subject: 'Maths', name: 'Paper 1: Foundation — June 2024' });
  const stem = { id: 'S-SAME', html: '<p>The diagram shows a triangle.</p><!--fig--><p>AB = 7 cm.</p>', diagram: svg };
  const fam = [
    { kind: 'question', name: 'Q9(a)', qNumber: '9', qPart: 'a', marks: 2, key: 'q:Q-SAME-9a', row: row('Q-SAME-9a'), stems: [stem],
      lead: '<p>Here is a second triangle.</p>', diagram: svg, html: '<p>Work out PR.</p>', answer: '<b>5 cm</b> &mdash; by Pythagoras', accept: '5' },
    { kind: 'question', name: 'Q9(b)', qNumber: '9', qPart: 'b', marks: 1, key: 'q:Q-SAME-9b', row: row('Q-SAME-9b'), stems: [stem],
      html: '<p>Which is right?</p>', choices: ['3', '4'], choiceRight: [2], answer: '<b>4</b>' },
    { kind: 'question', name: 'Q10', qNumber: '10', marks: 3, key: 'q:Q-SAME-10', row: row('Q-SAME-10'), stems: [],
      answerType: 'explain', html: '<p>Explain why the angles add to 180°.</p>', answer: '<b>Angles on a line</b> &mdash; they make a half turn' },
    { kind: 'question', name: 'Q11', qNumber: '11', marks: 2, key: 'q:Q-SAME-11', row: Object.assign(row('Q-SAME-11'), { figure: 'grid-blank' }),
      stems: [], answerType: 'drawing', html: '<p>Draw the graph of y = 2x + 1.</p>', answer: '<b>A straight line</b>' },
    { kind: 'question', name: 'Q12', qNumber: '12', marks: 1, key: 'q:Q-SAME-12', row: row('Q-SAME-12'), stems: [],
      answerType: 'annotate', surface: 'text', html: '<p>Circle the adjective.</p><p>The tall tree swayed.</p>', answer: '<b>tall</b>' },
  ];
  /* THE PRACTICAL AND THE PROJECT FROM FIND, THE CONTENT CARD FROM FIND 2 — either finder carries all
     three (docs/history/347); taking one from each keeps both lists asked. A card WITH an animation, so
     its page is compared too. */
  const R = findView_(w);
  const real = [['practical', w], ['project', w], ['content', R]].map(([k, V]) => V.stuffItems()
    .find(x => x.kind === k && (k !== 'content' || ((x.row && x.row.animations) || []).length)));
  real.forEach((x, i) => { if (!x) bad.push('no ' + ['practical', 'project', 'content card with an animation'][i] + ' reached ' + (i === 2 ? 'Find 2' : 'Find') + ', so it was NOT compared'); });
  const items = fam.concat(real.filter(Boolean));
  /* A PERSON'S, NOT A ROLE'S -- see the note above. */
  const norm = html => {
    const h = w.document.createElement('div');
    h.innerHTML = html;
    /* `q-report` IS THE PERSON'S TOO, like the star: drawn for anybody signed in (395). */
    h.querySelectorAll('[data-do="fav"], [data-do="rep-box"], .tile-row .qcard-verdict, [data-do="qp-send"]').forEach(n => n.remove());
    /* YOUR RESULT IS THE PERSON'S TOO (463): a tag only somebody signed in has. */
    h.querySelectorAll('.qtag[data-f="myResult"]').forEach(n => n.remove());
    /* A WORKSHEET BOX WITH ITS SEND IS THE BOX, wrapped (`guideBox_`): the wrapper goes, the box stays. */
    h.querySelectorAll('.qp-mark.gd-mark').forEach(m => { const l = m.querySelector('.gd-box'); if (l) m.replaceWith(l); else m.remove(); });
    /* AND A BOX NOTHING MARKS IS A `.qp-mark` WITH A VERDICT LINE ONLY WHEN IT HAS THAT SEND: put back to the
       plain compose box it is for somebody signed out. Whitespace between tags is not a difference. */
    h.querySelectorAll('.qp-mark.qp-compose:not([data-accept]):not(.qp-ai)').forEach(m => {
      m.className = 'qp-compose';
      [...m.children].forEach(c => { if (c.classList.contains('qp-verdict')) c.remove(); });
    });
    /* A ROW THAT HELD ONLY THE STAR (and the date beside it) is the person's, and goes with them. */
    h.querySelectorAll('.tile-row').forEach(n => { if (!n.children.length) n.remove(); });
    h.querySelectorAll('.qp-saved').forEach(n => { n.textContent = ''; });
    return h.innerHTML.replace(/>\s+</g, '><').replace(/u:[A-Za-z0-9_-]+:/g, '').replace(/>[^<>]*(?:’|&rsquo;)s answer/g, '>WHO answer')
      .replace(/>Your answer/g, '>WHO answer')
      .replace(/Kept on this device only[^<]*|Saved to [^<]*account\./g, 'KEPT WHERE');
  };
  const draw = () => {
    const out = [];
    items.forEach((x, i) => w.pageParts_(x, i ? items[i - 1] : null).forEach(part => {
      out.push({ at: (x.row && x.row.row_id || x.key) + '#' + (part || 'card'),
                 html: norm(part ? w.stuffPart_(x, part) : w.stuffCard(x, 0)) });
    }));
    /* AND EVERY ANSWER, SHOWN -- by this visitor's own tap, which is the one way any of them opens. */
    fam.forEach(x => { w.ansShow_(x); out.push({ at: x.row.row_id + '#ans-shown', html: norm(w.questionAnsCard_(x)) }); });
    return out;
  };
  const who = [
    ['signed out', null],
    ['a student', { name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'] }],
    ['a tutor', { name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'] }],
    ['an admin', { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'] }],
  ];
  const seen = who.map(([what, u]) => { t.USER(u); return { what, pages: draw() }; });
  t.USER(null);
  if (!(seen[2].pages.length && t.isTutorRole)) bad.push('could not draw for a tutor, so the sameness was NOT checked');
  const base = seen[0];
  if (base.pages.length < 15) bad.push('only ' + base.pages.length + ' pages were drawn -- the family did not come out whole');
  seen.slice(1).forEach(s => {
    if (s.pages.length !== base.pages.length) { bad.push(s.what + ' is drawn ' + s.pages.length + ' pages, signed out ' + base.pages.length); return; }
    const diffs = s.pages.filter((pg, i) => pg.html !== base.pages[i].html);
    if (diffs.length) {
      const pg = diffs[0], other = base.pages[s.pages.indexOf(pg)].html;
      let k = 0; while (k < pg.html.length && pg.html[k] === other[k]) k++;
      bad.push(s.what + ' sees ' + diffs.length + ' page(s) differently from somebody signed out, first ' + pg.at + ':\n'
        + '            ' + s.what + ': …' + pg.html.slice(Math.max(0, k - 60), k + 100).replace(/\s+/g, ' ') + '\n'
        + '            signed out: …' + other.slice(Math.max(0, k - 60), k + 100).replace(/\s+/g, ' '));
    }
  });
  /* AND THE SAME ITEMS: nothing on the learning surface is offered to one role and not another — BUT ONE, BY NAME. § */
  /* EVERY VERSE IS AN ITEM NOW (499): the Bible is the keys `bible:…`, an admin's alone. */
  const BIBLE_KEY = 'bible:kjv:1:1:1';
  const notBible = k => !/^bible:/.test(k);
  /* OVER BOTH FINDERS, AND THE SAME ON EACH: for every visitor Find 2 offers exactly Find's learning items
     (347) — the one finder twice — and the rule below is about what either offers. */
  const learn = l => l.filter(x => w.kindOf_(x).group === 'Learning').map(x => x.key).sort();
  const offered = u => {
    t.USER(u);
    const f = learn(w.stuffItems()), r = learn(R.stuffItems());
    t.USER(null);
    if (f.join('|') !== r.join('|')) bad.push((u ? u.role : 'signed out') + ': Find offers ' + f.length + ' learning items and Find 2 ' + r.length + ' — not the same list');
    return f;
  };
  /* THE INDEX ASKED FOR AS AN ADMIN, ONCE, before the lists are compared — it arrives on its own time (499). */
  const adminU = (who.find(([, u]) => u && u.role === 'admin') || [])[1];
  if (adminU) { t.USER(adminU); w.bibleIndex_(); for (let i = 0; i < 80 && !(t.BIBLE() && t.BIBLE().index); i++) await wait(25); t.USER(null); }
  const out0 = offered(null);
  if (out0.indexOf(BIBLE_KEY) >= 0) bad.push('somebody signed out is offered the Bible — it is for admins only');
  who.slice(1).forEach(([what, u]) => {
    const got = offered(u);
    const admin = u && u.role === 'admin';
    if (admin && got.indexOf(BIBLE_KEY) < 0) bad.push(what + ' is not offered the Bible, which the owner asked an admin to have');
    if (!admin && !got.every(notBible)) bad.push(what + ' is offered the Bible — it is for admins only');
    const same = k => notBible(k);
    const rest = got.filter(same).join('|');
    if (rest !== out0.filter(same).join('|')) bad.push(what + ' is offered a different set of learning items from somebody signed out');
  });
  /* AND THE SPOTLIGHT WINDOW, WHICH IS NOT FIND, KEEPS THE ADMIN'S TILE on a learning item already in
     it -- or a question put there before this change could never be taken out (`SPOT_TILES`). */
  const prac = real[0];
  if (prac && typeof w.spotSet_ === 'function' && typeof w.spotPages === 'function') {
    t.USER(who[3][1]);
    w.spotSet_(prac.key, true);
    const win = (w.spotPages() || []).join('');
    if (!/data-do="spot"/.test(win)) bad.push('an admin looking at the Spotlight window has no tile to take a spotlit practical out of it');
    if (/data-do="spot"/.test(w.stuffCard(prac, 0))) bad.push('the same practical on Find carries the admin\'s Spotlight tile again');
    w.spotSet_(prac.key, false);
    t.USER(null);
  } else bad.push('spotSet_ or spotPages is not reachable, so the window\'s own tile was NOT checked');
  return bad;
});

/* ---------- EVERY CONTROL ON A QUESTION'S PAGES IS A TILE § */
check('every control on a question\'s pages is a tile, bar the options, the keys, the words and the box', async () => {
  const p = Object.assign(payload(), { aiMarking: true });
  p.features = (p.features || []).concat(['aiMark']);
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t, bad = [];
  const need = ['questionWhole_', 'stuffCard', 'questionAnsCard_', 'ansShow_', 'ansHide_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The tiles were NOT checked'];
  t.USER({ name: 'Sam Student', personId: 'P003', role: 'student', roles: ['student'], token: 'tok' });
  const svg = '<svg viewBox="0 0 340 200"><circle cx="20" cy="20" r="9"/></svg>';
  const row = id => ({ row_id: id, paper_id: 'P-TILES', subject: 'Maths', name: 'Paper 1: Foundation — June 2024' });
  const stem = { id: 'S-TILES', html: '<p>The diagram shows a triangle.</p>', diagram: svg };
  const fam = [
    { kind: 'question', name: 'Q4(a)', qNumber: '4', qPart: 'a', marks: 2, key: 'q:Q-TILES-4a', row: row('Q-TILES-4a'), stems: [stem],
      diagram: svg, html: '<p>Work out PR.</p>', answer: '<b>5 cm</b>', accept: 'five' },
    { kind: 'question', name: 'Q4(b)', qNumber: '4', qPart: 'b', marks: 1, key: 'q:Q-TILES-4b', row: row('Q-TILES-4b'), stems: [stem],
      html: '<p>Which is right?</p>', choices: ['3', '4'], choiceRight: [2], answer: '<b>4</b>' },
    { kind: 'question', name: 'Q5', qNumber: '5', marks: 3, key: 'q:Q-TILES-5', row: row('Q-TILES-5'), stems: [],
      answerType: 'explain', html: '<p>Explain why the angles add to 180°.</p>', answer: '<b>Angles on a line</b> &mdash; a half turn' },
    { kind: 'question', name: 'Q6', qNumber: '6', marks: 1, key: 'q:Q-TILES-6', row: row('Q-TILES-6'), stems: [],
      answerType: 'calculation', html: '<p>Work out 3/4 of 12.</p>', answer: '<b>9</b>', accept: '9' },
    { kind: 'question', name: 'Q7', qNumber: '7', marks: 2, key: 'q:Q-TILES-7', row: Object.assign(row('Q-TILES-7'), { figure: 'grid-blank' }),
      stems: [], answerType: 'drawing', html: '<p>Draw the graph of y = 2x + 1.</p>', answer: '<b>A straight line</b>' },
    { kind: 'question', name: 'Q8', qNumber: '8', marks: 2, key: 'q:Q-TILES-8', row: row('Q-TILES-8'), stems: [], needs: ['Ruler', 'Compass'],
      answerType: 'drawing', diagram: svg, html: '<p>Use a ruler and compasses to construct the perpendicular bisector of AB.</p>', answer: '<b>Arcs from A and B</b>' },
    { kind: 'question', name: 'Q9', qNumber: '9', marks: 1, key: 'q:Q-TILES-9', row: row('Q-TILES-9'), stems: [],
      answerType: 'annotate', surface: 'text', html: '<p>Circle the adjective.</p><p>The tall tree swayed.</p>', answer: '<b>tall</b>' },
  ];
  const pages = [];
  /* ONE CARD PER QUESTION NUMBER (960): a number's page is its whole card, every part inside it. */
  const nums = [...new Set(fam.map(x => x.qNumber))];
  const drawAll = when => nums.forEach(q => {
    const parts = fam.filter(x => x.qNumber === q);
    pages.push({ at: parts[0].row.row_id + '#q' + when, html: w.questionWhole_(parts[0], parts, null, true) });
  });
  drawAll('');
  /* THE ARMED PEN, which `padWrap_` draws from `PAD_ON` by a different branch. Q7's grid and Q8's own figure
     are drawn on their cards (356) -- Q8's Ruler and Compass are in its bar -- each drawn off and then on. */
  const q7 = fam.find(f => f.key === 'q:Q-TILES-7');
  const q8 = fam.find(f => f.key === 'q:Q-TILES-8');
  [q7, q8].forEach(x => {
    t.padOn(w.__t.padKey(x));
    pages.push({ at: x.row.row_id + '#card, pen on', html: w.stuffCard(x, 0) });
  });
  t.padOn('');
  /* AND NO PAGE OF THE FAMILY IS A FIGURE PAGE (356). */
  pages.filter(pg => /#(fig|sfig\d+|use|nofig)$/.test(pg.at)).forEach(pg => bad.push(pg.at + ' is a figure page -- a figure is in its card'));
  /* AND EVERY ANSWER PAGE, SHOWN, then put back. */
  fam.forEach(x => { w.ansShow_(x); pages.push({ at: x.row.row_id + '#ans-shown', html: w.questionAnsCard_(x) }); w.ansHide_(x); });
  const EXEMPT = [
    ['button.kp-key[data-do="kp-key"]', 'a key on the maths keypad'],
    ['span.qw[data-do="qw-tap"]', 'a word in a passage to ring'],
    ['textarea.qp-ans-in[data-do="qp-ans"], input.qp-ans-in[data-do="qp-ans"]', 'the answer box'],
  ];
  const seen = {};
  const exempted = {};
  pages.forEach(pg => {
    const h = w.document.createElement('div');
    h.innerHTML = pg.html;
    h.querySelectorAll('button, [data-do], [role="button"], a[href]').forEach(el => {
      if (el.classList.contains('tile')) {
        const k = el.getAttribute('data-do') + (el.getAttribute('data-tool') ? ':' + el.getAttribute('data-tool') : '');
        seen[k] = (seen[k] || 0) + 1;
        return;
      }
      const ok = EXEMPT.find(([sel]) => el.matches(sel));
      if (ok) { exempted[ok[1]] = (exempted[ok[1]] || 0) + 1; return; }
      bad.push(pg.at + ' draws a control that is not a tile: <' + el.tagName.toLowerCase()
        + ' class="' + (el.getAttribute('class') || '') + '" data-do="' + (el.getAttribute('data-do') || '') + '">');
    });
  });
  /* THE ONES THE OWNER NAMED, which must be there for the rule above to mean anything. */
  [['qp-check', 'Check'], ['qp-ai', 'Mark with AI'], ['pad-undo', 'Undo'],
   ['pad-clear', 'Clear'], ['qa-show', 'Show the answer'], ['qa-hide', 'Hide the answer'],
   ['qt-pen:pen', 'the Pen'], ['qt-inst:ruler', 'the Ruler'], ['qt-inst:compass', 'the Compass'],
   ['fav', 'the star']].forEach(([act, what]) => {
    if (!seen[act]) bad.push('no ' + what + ' tile (' + act + ') was drawn anywhere in the family, so the rule was NOT asked of it');
  });
  /* AND THE ONE 368 TOOK AWAY: the pen's lock -- the first touch on the figure draws. */
  if (seen['pad-draw']) bad.push('the family still draws ' + seen['pad-draw'] + ' lock tile(s) (pad-draw)');
  ['a word in a passage to ring', 'the answer box'].forEach(what => {
    if (!exempted[what]) bad.push('the family drew no ' + what + ', so its exception was NOT exercised');
  });
  /* AND THE ONE THE OWNER TOOK AWAY: *"there doesnt need to be a scroll down tile on questions"* (8 Oct). */
  if (seen['qa-go']) bad.push('the family still draws ' + seen['qa-go'] + ' "To the answer" tile(s) (qa-go)');
  /* AND THE SWITCH THE OWNER TOOK AWAY, 18 Oct: *"why would there be an option for text answer"* (356). */
  if (seen['q-draw']) bad.push('the family still draws ' + seen['q-draw'] + ' Draw / Type tile(s) (q-draw)');
  t.USER(null);
  if (!bad.length) console.log('          ' + pages.length + ' pages; tiles: ' + Object.keys(seen).sort().map(k => k + ' ' + seen[k]).join(', '));
  return bad;
});

/* ---------- EVERY FACT ABOUT A PAGE OF A QUESTION IS A TAG, IN ONE ROW AT THE TOP § */
check('every fact about a page of a question is a tag in one row at the top: what it is, its number, its marks, SATs and KS2, the calculator once', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  const bad = [];
  const t = w.__t;
  const need = ['questionCard_', 'questionAnsCard_', 'questionWhole_', 'tagRow_', 'chipShow_']
    .filter(n => typeof w[n] !== 'function');
  if (need.length || typeof t.facetBy !== 'function') return [need.concat(['facetBy']).join(', ') + ' not reachable — renamed? The tag row was NOT checked'];
  const el = html => { const h = d.createElement('div'); h.innerHTML = html; return h; };
  const row = html => {
    /* EVERY PART ITS OWN CARD (owner, 8 Nov): a whole question's tag row heads each part's .qb; a lone part's its .qcard. */
    const card = el(html).querySelector('.qwhole .qb, .qcard');
    const r = card && card.querySelector('.qcard-tags');
    return { card, first: card && card.firstElementChild,
             tags: r ? [...r.querySelectorAll('.qtag')].map(s => ({ tag: s.getAttribute('data-tag') || '', f: s.getAttribute('data-f') || '', text: s.textContent.trim() })) : [] };
  };
  /* A TAG IS NAMED BY ITS FACET (data-f); ITS COLOUR IS ITS MENU'S (1030), h<N> from TAG_OF — the same for every answer of one facet. */
  const hues = (/^const TAG_OF = (\{.*\});$/m.exec(require('../tools/find-src.js').findSrc()) || [])[1] || '';
  const hueOf = f => { const m = new RegExp('\\b' + f + ': (\\d+)').exec(hues); return 'h' + (m ? m[1] : 0); };
  const say = tags => tags.map(x => (x.f || '-') + ':' + x.text).join(' | ');
  const svg = '<svg viewBox="0 0 10 10"><text>FIG</text></svg>';
  const gcse = { kind: 'question', name: 'Q4a', qNumber: '4', qPart: 'a', marks: 2, key: 'q-tags-4a',
    sub: 'Paper 1 (Non-Calculator) — November 2018', subject: 'Maths', level: 'GCSE', keystage: 'KS4',
    /* THE CELL AS THE LIBRARY HOLDS IT, through the app's own reader (`needsOf_`), which says the calculator in words (396). */
    tier: 'Higher', examBoard: 'Edexcel', documentType: 'Past paper', needs: w.needsOf_({ needs: 'No calculator, Protractor' }),
    row: { row_id: 'Q-TAGS-4a', paper_id: 'P-TAGS-1H', name: 'Paper 1 (Non-Calculator) — November 2018' },
    stems: [{ id: 'S-TAGS-4', html: '<p>A shape is drawn on a grid.</p>', diagram: svg }],
    html: '<p>Work out the size of angle x.</p>', diagram: svg, answer: '<b>40</b>', accept: '40' };
  const pages = {
    question: w.questionCard_(gcse), answer: w.questionAnsCard_(gcse), whole: w.questionWhole_(gcse, [gcse], null, true),
  };
  const kind = { question: 'Questions', answer: 'Answers', whole: 'Questions' };
  let itemFacts = null;
  Object.keys(pages).forEach(k => {
    const r = row(pages[k]);
    if (!r.card) return bad.push('the ' + k + ' page drew no card');
    if (!r.first || !r.first.classList.contains('qcard-tags')) bad.push('the ' + k + ' page\'s first block is ' + (r.first ? '.' + r.first.className : 'nothing') + ', not the tag row');
    ['.qcard-top', '.qcard-sub', '.qcard-needs', '.qcard-sat'].forEach(c => { if (r.card.querySelector(c)) bad.push('the ' + k + ' page still draws ' + c); });
    /* EVERY FACET A TAG (396): What for, then What kind — this page's own kind. */
    /* PRACTICE ABOVE IT (546, 610 `KIND_UNDER`): What kind says Practice, then Which says the page's own kind. */
    const kts = r.tags.filter(x => x.f === 'kindLabel'), kt = r.tags.find(x => x.f === 'kindOwn');
    if (kts.length !== 1 || kts[0].text !== 'Practice') bad.push('the ' + k + ' page\'s What kind tags are ' + say(kts) + ', wanted Practice alone');
    if (!r.tags.length || r.tags[0].f !== 'forLabel' || !kt || kt.text !== kind[k]) bad.push('the ' + k + ' page\'s row starts ' + say(r.tags.slice(0, 3)) + ', wanted What for, Practice, then the Which answer ' + kind[k]);
    /* ONE ITEM, ONE ROW: everything but What kind and the page's own number reads the same on every page. */
    const facts = say(r.tags.filter(x => ['kindLabel', 'kindOwn', 'qPage', 'qPages'].indexOf(x.f) < 0));
    if (itemFacts === null) itemFacts = facts;
    else if (facts !== itemFacts) bad.push('the ' + k + ' page says the item as ' + facts + ', the question page as ' + itemFacts);
    const calc = r.tags.filter(x => /calculator/i.test(x.text));
    if (calc.length !== 1 || calc[0].f !== 'needs' || calc[0].text !== 'Non-calculator') bad.push('the ' + k + ' page says the calculator as ' + JSON.stringify(calc) + ' -- wanted ONE needs tag, Non-calculator');
    r.tags.forEach(x => { if (x.tag !== hueOf(x.f)) bad.push('the ' + k + ' page\'s ' + x.f + ' tag "' + x.text + '" wears ' + x.tag + ', not its menu\'s ' + hueOf(x.f)); });
    const seen = {};
    r.tags.forEach(x => { if (seen[x.text.toLowerCase()]) bad.push('the ' + k + ' page says "' + x.text + '" twice'); seen[x.text.toLowerCase()] = 1; });
  });
  if (itemFacts !== null) {
    /* A PAPER'S TAG IS ITS OWN NUMBER (1040 r12, `paperTag_`), never its whole title; with no number or first words it has none. */
    const chipPaper = (w.facetList().find(f => f.field === 'paperId') || { tagSay: () => '' }).tagSay('P-TAGS-1H');
    ['level:GCSE', 'keystage:KS4', 'examBoard:Edexcel', 'subject:Maths', 'tier:Higher', 'examYear:2018', 'examMonth:November', 'qNumber:Q4', 'qPart:a', 'marks:[2]' /* said as the paper prints it (28b) */, 'needs:Protractor', 'forLabel:Learning']
      .forEach(f => { if (itemFacts.split(' | ').indexOf(f) < 0) bad.push('the item\'s tags lack ' + f + ': ' + itemFacts); });
    const paperTags = itemFacts.split(' | ').filter(f => /^paperId:/.test(f));
    if (paperTags.join() !== (chipPaper ? 'paperId:' + chipPaper : '')) bad.push('the paper tag is not its own number (' + (chipPaper || 'none') + '): ' + itemFacts);
    if (/Non-Calculator\) —/.test(itemFacts)) bad.push('a tag still carries the paper\'s whole title: ' + itemFacts);
  }
  /* A CALCULATOR PAPER, AND A ROW WITH NO MARKS. */
  const calcQ = Object.assign({}, gcse, { key: 'q-tags-c', name: 'Q3', qNumber: '3', qPart: '', marks: '', sub: 'Paper 2 (Calculator) — June 2017', needs: w.needsOf_({ needs: 'Calculator' }),
    row: Object.assign({}, gcse.row, { row_id: 'Q-TAGS-C', name: 'Paper 2 (Calculator) — June 2017' }), stems: [], diagram: '' });
  const c = row(w.questionCard_(calcQ));
  if (c.tags.filter(x => /calculator/i.test(x.text)).map(x => x.f + ':' + x.text).join() !== 'needs:Calculator allowed') bad.push('a calculator paper says ' + say(c.tags.filter(x => /calculator/i.test(x.text))) + ', wanted one needs tag, Calculator allowed');
  if (c.tags.some(x => x.f === 'marks' || /\b0 marks?\b/.test(x.text))) bad.push('a row with no marks has a marks tag: ' + say(c.tags));
  /* THE FUNNEL SAYS THE SAME WORD, BECAUSE THE WORD IS THE VALUE (396): no `showOf` on What you need, and its chip reads its value. */
  const nf = t.facetBy('needs');
  const chip = w.chipShow_({ field: 'needs', value: 'Non-calculator' });
  if (!nf || nf.showOf || chip !== 'Non-calculator') bad.push('the funnel says the calculator through ' + (nf && nf.showOf ? 'a showOf of its own' : 'its value') + ', chip "' + chip + '", the card as Non-calculator');
  /* SATs, AND THE KEY STAGE BESIDE IT: a primary worksheet (a school year, a key-stage cell, no level)
     and an STA paper (`band_value: KS2 SATs`). */
  const sheet = { kind: 'question', name: 'Q1', qNumber: '1', key: 'q-tags-ws', sub: 'Adding Fractions', subject: 'Maths',
    bandType: 'year', bandValue: '5', keystage: 'KS2', documentType: 'Worksheet', company: '1stclassmaths',
    row: { row_id: 'Q-TAGS-WS', paper_id: 'P-TAGS-WS', name: 'Adding Fractions' }, stems: [], html: '<p>1/4 + 2/4</p>' };
  /* THE STA'S OWN PAPER, as the library spells its publisher: a maker's name here would make it a worksheet, which has no board (O3). */
  const sta = Object.assign({}, sheet, { key: 'q-tags-sta', bandType: 'stage', bandValue: 'KS2 SATs', documentType: 'Past paper',
    sub: 'Paper 1: Arithmetic — May 2024', examBoard: 'STA', marks: 1, company: 'Standards & Testing Agency',
    row: { row_id: 'Q-TAGS-STA', paper_id: 'P-TAGS-STA', name: 'Paper 1: Arithmetic — May 2024' } });
  [['a SATs worksheet', sheet, false], ['an STA paper', sta, true]].forEach(([what, x, board]) => {
    const r = row(w.questionCard_(x));
    const lv = r.tags.filter(y => y.f === 'level' || y.f === 'keystage').map(y => y.f + ':' + y.text);
    if (lv.indexOf('level:SATs') < 0 || lv.indexOf('keystage:KS2') !== lv.indexOf('level:SATs') + 1) bad.push(what + ' does not say SATs and then KS2 as two tags, its level and its key stage: ' + say(r.tags));
    if (r.tags.some(y => /KS\s*\d\s*SATs/i.test(y.text))) bad.push(what + ' still says the key stage inside the level: ' + say(r.tags));
    /* THE BOARD IS SAID LIKE ANY PAPER'S: "SATs hides the board" was a rule of its own (355). */
    if (board && !r.tags.some(y => y.f === 'examBoard' && y.text === 'STA')) bad.push(what + ' hides its board, STA: ' + say(r.tags));
    if (!r.tags.some(y => y.f === 'qNumber' && y.text === 'Q1')) bad.push(what + ' has no [Q1] tag: ' + say(r.tags));
  });
  /* A MAKER'S SHEET (O3): its maker is its Source tag, and it says no exam board even where the row names one. */
  const ws = row(w.questionCard_(Object.assign({}, sheet, { key: 'q-tags-ws2', examBoard: 'Edexcel' })));
  if (!ws.tags.some(y => y.f === 'source' && y.text === '1st Class Maths') || ws.tags.some(y => y.f === 'examBoard')) bad.push('a 1st Class Maths sheet should say its Source and no exam board: ' + say(ws.tags));
  return bad;
});

/* ---------- EVERY TAG ON EVERY KIND OF CARD IS A FINDER ANSWER (docs/history/355) § */
check('every tag on every kind of card is a finder answer: its facet, its word, its colour, and a pick that keeps the card', async () => {
  const PIDS = ['RS1786302107764-415', 'P-AQA-8461-2406-1F', 'P-CBM-5AD-F-0601', 'P-STA-KS2-2024-P1', 'P-1CM-LINEQ1'];
  const rows = LIB_FULL.rows('questions').filter(r => PIDS.indexOf(r.paper_id) >= 0);
  /* THE OTHER KINDS FROM THEIR OWN FILES, through the loader's own mapper, as the shared-parts journey does. */
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so the other kinds were NOT checked'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { textbooks: read('textbooks'), boxers: read('boxers'), fights: read('fights'), projects: read('projects'), practicals: read('practicals') })));
  const p = payload();
  ['textbooks', 'boxers', 'fights', 'projects', 'practicals'].forEach(k => { p[k] = made[k] || []; });
  const { w } = boot({ payload: p, serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  for (let i = 0; i < 60 && !(typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().some(x => x.row && x.row.paper_id === PIDS[0])); i++) await wait(50);
  const t = w.__t, d = w.document, bad = [];
  if (!t || typeof t.facetList !== 'function' || typeof w.tagRow_ !== 'function') return ['tagRow_ or the facet exports are not reachable — the tags were NOT checked'];
  t.USER({ name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk' });
  const all = w.stuffItemsAll_();
  const q = id => all.find(x => x.row && x.row.row_id === id);
  const find = f => all.find(f);
  const ix = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'bible', 'index.json'), 'utf8'));
  const verse = typeof w.bibleVerseList_ === 'function' ? w.bibleVerseList_(ix).list[2] : null;
  const stemmed = find(x => x.kind === 'question' && x.row.paper_id === 'P-AQA-8461-2406-1F' && (x.stems || []).length);
  const CASES = [
    ['a question', q('Q-1MA1-2406-1F-7'), null], ['its answer page', q('Q-1MA1-2406-1F-7'), 'ans'],
    ['its lead-in page', q('Q-1MA1-2406-1F-7'), 'pre0'],
    ['an opening (stem)', stemmed, 'stem0'], ['an AQA part', find(x => x.kind === 'question' && x.row.paper_id === 'P-AQA-8461-2406-1F' && /\d/.test(x.qPart)), null],
    ['a 5-a-day', find(x => x.kind === 'question' && x.row.paper_id === 'P-CBM-5AD-F-0601'), null],
    ['a SATs paper', find(x => x.kind === 'question' && x.row.paper_id === 'P-STA-KS2-2024-P1'), null],
    ['a worksheet', find(x => x.kind === 'question' && x.row.paper_id === 'P-1CM-LINEQ1'), null],
    ['a content card', find(x => x.kind === 'content'), null], ['a practical', find(x => x.kind === 'practical'), null],
    ['a project', find(x => x.kind === 'project'), null], ['a boxer', find(x => x.kind === 'people' && x.boxKind === 'Fighters'), null],
    ['a fight', find(x => x.kind === 'fight'), null],
    ['a Bible verse', verse, null], ['a bundle', { kind: 'bundle', kindLabel: 'Bundles' }, null],
  ];
  let tags = 0;
  CASES.forEach(([what, x, page]) => {
    if (!x) { bad.push(what + ': no such item reached Find, so its tags were NOT checked'); return; }
    const h = d.createElement('div');
    h.innerHTML = w.tagRow_(x, page);
    const row = [...h.querySelectorAll('.qtag')];
    if (!row.length) { bad.push(what + ' (' + (x.name || x.kind) + ') draws no tags'); return; }
    row.forEach(el => {
      tags++;
      const field = el.getAttribute('data-f') || '', text = el.textContent.trim();
      const facet = t.facetList().find(f => f.field === field);
      const at = what + ' (' + (x.name || x.kind) + ') [' + text + ']';
      if (!facet) { bad.push(at + ' is no live facet\'s tag (data-f="' + field + '")'); return; }
      if ((el.getAttribute('data-tag') || '') !== t.tagOf(field)) bad.push(at + ' wears "' + (el.getAttribute('data-tag') || 'the outline') + '", its chip "' + (t.tagOf(field) || 'the outline') + '"');
      const vals = t.asList(facet.tagOf ? facet.tagOf(x, page) : w.facetOwn_(facet, x)).map(String);
      /* THE CHIP A PRESS MAKES once every question before this one was answered as the card answers it (`cardList_`, 396). */
      const chipOf = v => {
        const S = t.STUFF(), held = S.filters, live = t.facetList(), stop = live.findIndex(f => f.field === field);
        try {
          S.filters = [].concat(...live.slice(0, stop).map(f => t.asList(w.facetOwn_(f, x)).map(one => ({ field: f.field, value: one }))))
            .concat([{ field: field, value: v }]);
          return String(w.chipShow_(S.filters[S.filters.length - 1], S.filters.length - 1)).trim();
        } finally { S.filters = held; }
      };
      const v = vals.find(one => chipOf(one) === text);
      if (v === undefined) { bad.push(at + ' is not one of its ' + field + ' answers as a chip says them: ' + JSON.stringify(vals.map(chipOf))); return; }
      if (x.kind !== 'bundle' && !w.filterHit(x, { field: field, value: v })) bad.push(at + ': picking ' + field + ' = ' + v + ' does not keep it');
    });
  });
  console.log('          ' + tags + ' tags over ' + CASES.length + ' kinds of card, every one a finder answer');
  t.USER(null);
  return bad;
});

