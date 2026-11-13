/* ---------- THE FILL-IN STANDARD ON THE REAL LIBRARY (523): every part asking to fill in is answered in its cells ---------- */
check('the fill-in standard: every library part that asks to fill something in shows its cells, in its own table where it has one, and its own answers mark every cell right', async () => {
  const SC = require('../check/library-schema.js');
  const LIB = LIB_FULL.rows('questions');
  const ask = LIB.filter(r => r.kind === 'question' && r.active !== 'False' && SC.fillIn(r.html) && !(SC.CELLS_EXEMPT[r.row_id] && !String(r.cells || '').trim())
    /* A PART WHOSE SCHEME IS STILL OWED (584, questions only) has no answers to make cells from, as check/library-schema.js says. */
    && !(SC.schemeOwed(r) && !String(r.cells || '').trim()));
  /* A PENDING PART WHOSE WORDS HERE ARE OLDER THAN ITS CARD (a fresh clone before `pull`, docs/library.md) is not asked. */
  const asks = ask.filter(r => !LIB_FULL.waits('questions', r)), waiting = ask.length - asks.length;
  if (ask.length < 100 || !asks.length) return ['only ' + asks.length + ' parts ask to fill something in (' + waiting + ' waiting for newer words) — the words did not load, NOT checked'];
  const papers = new Set(asks.map(r => r.paper_id));
  /* AN ADULT, SIGNED IN: a GCSE-and-above psychology or history part is 14+ (505), and a signed-out viewer is never shown it */
  const adult = Object.assign({}, MEMBER_, { profile: { dob_d: '1', dob_m: '1', dob_y: String(new Date().getFullYear() - 30) } });
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? LIB.filter(r => papers.has(r.paper_id)) : undefined), before: signedInAs_(adult) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || typeof w.cellsOf_ !== 'function' || !A['qp-cells-check']) return ['questionCard_, cellsOf_ or qp-cells-check not reachable — NOT checked'];
  w.__t.STUFF().filters = [];
  const all = w.stuffItemsAll_();
  const host = d.createElement('div');
  host.className = 'qcard-host';
  d.body.appendChild(host);
  let inTable = 0, boxes = 0;
  asks.forEach(r => {
    const x = all.find(i => i.row && i.row.row_id === r.row_id);
    if (!x) { bad.push(r.row_id + ' did not reach Find'); return; }
    host.innerHTML = w.questionCard_(x, 0);
    const want = w.cellsOf_(x).map((c, i) => [c, i]).filter(([c]) => c.ways);
    const inputs = [...host.querySelectorAll('.qp-cell')];
    /* NO TABLE TO FILL: EVERY GAP IN ONE BOX (owner, 13 Nov), its answers typed as a child might part them, in order */
    const one = host.querySelector('.qp-cells-box .qp-ans-in');
    if (!host.querySelector('table[data-cells]') && want.length) {
      if (!one || inputs.length || !host.querySelector('.qp-cells-box > .q-hint')) { bad.push(r.row_id + ': its gaps are not one box with its line (' + inputs.length + ' loose cells)'); return; }
      boxes++;
      const own1 = (String(r.html || '').match(/<table[\s\S]*?<\/table>/) || [''])[0];
      if ((own1.match(/<(td|th)([^>]*)>(?:\s|&nbsp;| )*<\/\1>/g) || []).length > (w.cellCorner_ && w.cellCorner_(own1) ? 1 : 0)) bad.push(r.row_id + '\'s own table has blanks and its gaps stand under it, not in it');
      one.value = want.map(([c]) => c.ways.split('|')[0].trim()).join([' ; ', ' / ', '; '][boxes % 3]);
      one.dispatchEvent(new w.Event('input', { bubbles: true }));
      A['qp-cells-check'](host.querySelector('[data-do="qp-cells-check"]'));
      const said = (host.querySelector('.qp-cells-box .qp-verdict') || {}).textContent;
      if (said !== 'Correct — every answer') bad.push(r.row_id + ': its own answers typed in its one box say ' + JSON.stringify(said));
      w.localStorage.removeItem(host.querySelector('.qp-cells-box').getAttribute('data-k'));
      return;
    }
    if (!want.length || inputs.length !== want.length) { bad.push(r.row_id + ' shows ' + inputs.length + ' cell(s) for ' + want.length + ' asked'); return; }
    inTable++;
    /* A TABLE OF ITS OWN WITH BLANKS IS WHERE ITS CELLS GO: one more or one fewer, and they fall out under it as boxes. */
    const own = (String(r.html || '').match(/<table[\s\S]*?<\/table>/) || [''])[0];
    const blanks = (own.match(/<(td|th)([^>]*)>(?:\s|&nbsp;| )*<\/\1>/g) || []).length - (w.cellCorner_ && w.cellCorner_(own) ? 1 : 0);
    if (blanks && !host.querySelector('table[data-cells]')) bad.push(r.row_id + '\'s own table has ' + blanks + ' blank(s) and its cells are ' + w.cellsOf_(x).length + ' — they stand under it, not in it');
    if (host.querySelector('.qpad')) bad.push(r.row_id + ' is answered in cells and still draws a pen surface — the diagram is never the answer box');
    want.forEach(([c, i]) => {
      const el = inputs.find(e => +e.getAttribute('data-n') === i);
      if (!el) return;
      el.value = c.ways.split('|')[0].trim();
      el.dispatchEvent(new w.Event('input', { bubbles: true }));
    });
    A['qp-cells-check'](host.querySelector('[data-do="qp-cells-check"]'));
    const say = (host.querySelector('.qp-cells-box .qp-verdict') || {}).textContent;
    if (say !== 'Correct — every cell') bad.push(r.row_id + ': its own answers typed into its cells say ' + JSON.stringify(say));
    try { w.localStorage.removeItem(w.ansKey_(x)); } catch (e) {}
  });
  host.remove();
  console.log('          ' + asks.length + ' fill-in parts: ' + inTable + ' in their own table, ' + boxes + ' in one box, each marked right by its own answers; ' + waiting + ' waiting for newer words');
  return bad;
});

/* ---------- ONE BOX PER VALUE: AN ANSWER OF SEVERAL VALUES GETS A BOX EACH, AND THE MARKER THE LIST (docs/history/362) ---------- */
check('one box per value: a counted rule, a pair and an open list each get their boxes; typing keeps them, a comma string loads into them, Check marks the list', async () => {
  const base = { active: 'True', subject: 'Maths', document_type: 'Worksheet', key_stage: 'KS2', pages_checked: 'True', kind: 'question', name: 'Lists', paper_id: 'MB', marks: '1', answer_type: 'calculation' };
  const R_ = o => Object.assign({}, base, o);
  const rows = [
    R_({ row_id: 'D-MB', kind: 'document' }),
    R_({ row_id: 'MB-1', question: '1', html: '<p>Write three factors of 36</p>', answer: '1, 2, 3', accept: '4, 12, 18 | rule: count 3, distinct, each factor 36' }),
    R_({ row_id: 'MB-2', question: '2', html: '<p>Write the coordinates of A</p>', answer: '(3, -2)', accept: '(3, -2) | (3,-2)' }),
    R_({ row_id: 'MB-3', question: '3', html: '<p>Which coins make 30p?</p>', answer: '20p, 10p', accept: '20p, 10p | rule: sum 30p, from 20p/10p/10p/5p' }),
  ];
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || !A['qp-check'] || typeof w.multiNext_ !== 'function') return ['questionCard_, qp-check or multiNext_ is not reachable — the boxes were NOT checked'];
  t.STUFF().filters = [];
  const item = id => w.stuffItemsAll_().find(i => i.row && i.row.row_id === id);
  const host = d.createElement('div');
  d.body.appendChild(host);
  const draw = x => { host.innerHTML = '<div class="qcard">' + w.ansBox_(x) + '</div>'; return [...host.querySelectorAll('.qp-multi .kp-in[data-do="qp-multi"]')]; };
  const type = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const say = () => (host.querySelector('.qp-verdict') || {}).textContent;
  const x1 = item('MB-1');
  if (!x1) return ['the fixture rows did not reach Find'];
  w.ansStore_(t.ansKey(x1), '4, 12, 18');
  let ins = draw(x1);
  if (ins.length !== 3) bad.push('count 3 draws ' + ins.length + ' boxes, wanted 3');
  if (host.querySelector('.qp-bar > label.qp-ans')) bad.push('a counted list still has the one box to type commas in');
  if (ins.map(i => i.value).join('|') !== '4|12|18') bad.push('an old comma answer loads into the boxes as ' + JSON.stringify(ins.map(i => i.value)));
  if (ins.length === 3) {
    if (w.multiNext_(ins[0]) !== ins[1] || w.multiNext_(ins[2]) !== null) bad.push('the next box after the first is not the second, or the last has one');
    type(ins[1], '7');
    if (w.ansRead_(t.ansKey(x1)) !== '4, 7, 18') bad.push('typing a box keeps ' + JSON.stringify(w.ansRead_(t.ansKey(x1))) + ', wanted "4, 7, 18"');
    A['qp-check'](host.querySelector('[data-do="qp-check"]'));
    if (say() !== 'Not yet — have another go') bad.push('7 is not a factor of 36 but Check says ' + JSON.stringify(say()));
    type(ins[1], '9');
    A['qp-check'](host.querySelector('[data-do="qp-check"]'));
    if (say() !== 'Correct') bad.push('4, 9, 18 in three boxes says ' + JSON.stringify(say()) + ', wanted Correct');
    ins = draw(x1);
    if (ins.map(i => i.value).join('|') !== '4|9|18') bad.push('drawn again the boxes hold ' + JSON.stringify(ins.map(i => i.value)));
  }
  const x2 = item('MB-2');
  ins = draw(x2);
  if (ins.length !== 2 || !host.querySelector('.qp-multi.is-pair')) bad.push('a coordinate pair draws ' + ins.length + ' boxes' + (host.querySelector('.qp-multi.is-pair') ? '' : ' and no brackets'));
  if (ins.length === 2) {
    type(ins[0], '3'); type(ins[1], '-2');
    A['qp-check'](host.querySelector('[data-do="qp-check"]'));
    if (say() !== 'Correct') bad.push('3 and -2 in the pair\'s boxes says ' + JSON.stringify(say()));
  }
  const x3 = item('MB-3');
  ins = draw(x3);
  if (ins.length !== 1 || !host.querySelector('.qp-multi[data-grow]')) bad.push('an open list starts with ' + ins.length + ' boxes, wanted 1 that grows');
  if (ins.length) {
    type(ins[0], '20p');
    ins = [...host.querySelectorAll('.qp-multi .kp-in[data-do="qp-multi"]')];
    if (ins.length !== 2) bad.push('a filled last box did not grow another (' + ins.length + ' boxes)');
    if (ins[1]) type(ins[1], '10p');
    A['qp-check'](host.querySelector('[data-do="qp-check"]'));
    if (say() !== 'Correct') bad.push('20p and 10p in two boxes says ' + JSON.stringify(say()));
  }
  if (w.markAnswer_(['4', '9', '18'], x1.accept) !== true) bad.push('markAnswer_ given the values as a list does not mark them');
  host.remove();
  return bad;
});

/* ---------- A DRAWN ANSWER IS SENT: EVERY DRAWING-ONLY QUESTION HAS SEND, AND IT RECORDS A SUBMISSION (docs/history/362) ---------- */
check('a drawn answer is never sent to a person: a made-up surface and a figure each have the pen and the AI\'s Check in their tool row; a drawing alone asks for the answer in the box', async () => {
  const base = { active: 'True', subject: 'Maths', document_type: 'Worksheet', key_stage: 'KS2', pages_checked: 'True', kind: 'question', name: 'Draw', paper_id: 'DS', marks: '1', answer_type: 'drawing' };
  const R_ = o => Object.assign({}, base, o);
  const rows = [
    R_({ row_id: 'D-DS', kind: 'document' }),
    R_({ row_id: 'DS-1', question: '1', html: '<p>Draw a kite</p>', answer: 'a kite', surface: 'blank' }),
    R_({ row_id: 'DS-2', question: '2', html: '<p>Draw a radius on the circle</p>', answer: 'a radius', diagram: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>' }),
  ];
  const { w } = boot({ payload: Object.assign(payload(), { features: ['aiMark'], aiMarking: true }), serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || !A['qp-ai'] || !t.padKey) return ['questionCard_, padKey_ or the qp-ai handler is not reachable — NOT checked'];
  /* ROUND 3 (the owner: "a human never marks"): the pen's own Send is gone */
  if (A['pad-send']) bad.push('pad-send still has a handler — a drawing could be sent for a person to mark');
  t.STUFF().filters = [];
  const host = d.createElement('div');
  d.body.appendChild(host);
  for (const id of ['DS-1', 'DS-2']) {
    const x = w.stuffItemsAll_().find(i => i.row && i.row.row_id === id);
    if (!x) { bad.push(id + ' did not reach Find'); continue; }
    host.innerHTML = w.questionCard_(x, 0);
    if (!host.querySelector('.qpad .qpad-art > svg')) bad.push(id + ': a drawn part with nothing to draw on');
    if (host.querySelector('[data-do="pad-send"]')) bad.push(id + ': still draws a Send for a person');
    const go = host.querySelector('.qt-row .qp-ai-go[data-do="qp-ai"]');
    if (!go) { bad.push(id + ': no AI Check in its tool row — nothing marks it'); continue; }
    try { w.localStorage.setItem(t.padKey(x), JSON.stringify([[30, 30, 120, 90]])); } catch (e) {}
    host.innerHTML = w.questionCard_(x, 0);
    A['qp-ai'](host.querySelector('.qt-row .qp-ai-go'));
    const out = (host.querySelector('.qp-ai .qp-verdict') || {}).textContent || '';
    if (!/Write your answer in the box too/.test(out)) bad.push(id + ': Check on a drawing with an empty box says ' + JSON.stringify(out) + ' — wanted it to ask for the answer in the box');
    const latest = w.subLatest_(t.ansKey(x));
    if (latest && latest.v === 'sent') bad.push(id + ': the drawing was recorded as sent, waiting for a person');
    try { w.localStorage.removeItem(t.padKey(x)); } catch (e) {}
  }
  host.remove();
  return bad;
});

/* ---------- THE TOOL ROW, THE LAYER AND THE LINE (Review A of round 3; round 4: the owner's nine, no Calculator, Grid, Table or Formula sheet) ---------- */
check('a part\'s tool row is the owner\'s one row with one padlock (8 Nov), the pen\'s tiles only where there is something to draw on (owner, 29 Oct); a named grid\'s first Pen tap lays it; the pad opens on the layer of the scheme\'s own answer; and no grey line under Check', async () => {
  const base = { active: 'True', subject: 'Maths', document_type: 'Worksheet', key_stage: 'KS3', pages_checked: 'True', kind: 'question', name: 'Tools', paper_id: 'GR', marks: '1', answer_type: 'calculation' };
  const R_ = o => Object.assign({}, base, o);
  const rows = [
    R_({ row_id: 'D-GR', kind: 'document' }),
    R_({ row_id: 'GR-1', question: '1', html: '<p>Work out 3 + 4</p>', answer: '7', accept: '7' }),
    R_({ row_id: 'GR-3', question: '3', html: '<p>Plot the points.</p>', answer: 'A plotted', accept: 'A plotted', surface: 'grid' }),
    R_({ row_id: 'GR-2', question: '2', subject: 'English', html: '<p>Which prefix could be added to all three words?</p>', answer: 're', accept: 're | re-' }),
  ];
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || !A['qt-pen'] || !A['q-lock']) return ['questionCard_ or the qt-pen / q-lock handlers are not reachable — NOT checked'];
  t.STUFF().filters = [];
  const host = d.createElement('div');
  d.body.appendChild(host);
  const item = id => w.stuffItemsAll_().find(i => i.row && i.row.row_id === id);
  const x1 = item('GR-1');
  if (!x1) { host.remove(); return ['GR-1 did not reach Find']; }
  host.innerHTML = w.questionCard_(x1, 0);
  /* NO GREY LINE UNDER THE ROW (owner, 9 Nov). */
  if (host.querySelector('.qt-how')) bad.push('a grey line under Check is still drawn');
  /* THE OWNER'S ROW, by the tiles' own names (round 4, the Calculator back where allowed on 11 Nov): "get rid of that calculator button … and grid button … table … formula sheet … still two lock buttons" */
  const row = host.querySelector('.qt-row');
  const names = row ? [...row.querySelectorAll('.tile')].filter(b => !b.classList.contains('qt-fold')).map(b => (b.getAttribute('aria-label') || '').split(' · ')[0]) : [];
  /* NOTHING TO DRAW ON, NO PEN (owner, 29 Oct: "a button which opens the working paper … remove that") */
  /* THE SAME ROW ON EVERY PART (owner, 7 Nov, over 1040 r12): magnifier, Read aloud and padlock are each part's. */
  /* RULER AND PROTRACTOR ON EVERY PART, figure or not (owner, 8 Nov); Check, Message, Save and ⋯ first, the tools behind ⋯ (owner, 9 Nov) */
  if (names.join(' | ') !== 'Check | Message | Save | More | Photo of working | Magnifier | Read aloud | Lock | Ruler | Protractor | Calculator | Share | Top | Help') bad.push('a part with no figure: the tool row reads ' + names.join(' | '));
  const x3 = item('GR-3');
  host.innerHTML = x3 ? w.questionCard_(x3, 0) : '';
  const row3 = host.querySelector('.qt-row');
  const names3 = row3 ? [...row3.querySelectorAll('.tile')].filter(b => !b.classList.contains('qt-fold')).map(b => (b.getAttribute('aria-label') || '').split(' · ')[0]) : [];
  /* UNDO AND CLEAR ARE THE PAD'S, IN THIS ONE ROW FROM THE START (1020): a tap never adds or moves a control. */
  if (names3.join(' | ') !== 'Check | Message | Save | More | Photo of working | Magnifier | Read aloud | Lock | Ruler | Protractor | Calculator | Pen | Straight line | Compass | Undo | Clear | Share | Top | Help') bad.push('a part with a named grid: the tool row reads ' + names3.join(' | '));
  if (d.querySelectorAll('[data-do="qt-grid"], [data-do="qt-panel"], .qcalc, .qt-table, .qt-formula').length) bad.push('a Grid, Table, Calculator or Formula sheet is still drawn on the part');
  const whole = d.createElement('div'); whole.innerHTML = x3 ? w.questionWhole_(x3, [x3], null, true) : '';
  const locks = whole.querySelectorAll('[data-do="q-lock"], [data-do="game-lock"]').length;
  if (locks !== 1) bad.push('the whole question has ' + locks + ' padlocks, wanted one');
  A['qt-pen'](host.querySelector('[data-do="qt-pen"]'));
  if (!host.querySelector('.qpad .qsurf, .qpad svg line.grid')) bad.push('the first Pen tap did not lay a grid surface');
  const layer = id => { host.innerHTML = w.questionCard_(item(id), 0); const i = host.querySelector('.qp-ans-in'); return i && i.getAttribute('data-kp'); };
  if (layer('GR-2') !== 'words') bad.push('a prefix answer ("re | re-") opens on ' + layer('GR-2') + ', wanted the letters');
  if (layer('GR-1') !== 'maths') bad.push('a number answer ("7") opens on ' + layer('GR-1') + ', wanted the maths');
  host.remove();
  return bad;
});

/* ---------- AND OVER THE WHOLE LIBRARY: EVERY QUESTION ANSWERED BY DRAWING ALONE CAN BE SENT (docs/history/362) ---------- */
check('every drawn part in the library has its pen and one Check in its tool row, and none is sent to a person', async () => {
  const LIB = LIB_FULL.rows('questions');
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? LIB : undefined) });
  await wait(300);
  const bad = [];
  if (typeof w.questionCard_ !== 'function' || typeof w.qtDrawn_ !== 'function' || typeof w.workRow_ !== 'function') return ['questionCard_, qtDrawn_ or workRow_ not reachable — NOT checked'];
  w.__t.STUFF().filters = [];
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  let n = 0;
  for (const x of w.stuffItemsAll_()) {
    if (!x || x.kind !== 'question') continue;
    if (!w.qtDrawn_(w.workRow_(x))) continue;
    n++;
    host.innerHTML = w.questionCard_(x, 0);
    const go = [...host.querySelectorAll('.qt-row .is-submit')].filter(g => !g.closest('[hidden]'));   // the AI's Check held back is not shown
    /* a passage to ring words in (`surface: text`) is drawn on in its words, not under a pen */
    if (!host.querySelector('.qpad, [data-circ]') || go.length !== 1 || host.querySelector('[data-do="pad-send"]')) bad.push((x.row && x.row.row_id) + ': drawn, with ' + (host.querySelector('.qpad, [data-circ]') ? '' : 'no pen, ') + go.length + ' Checks' + (host.querySelector('[data-do="pad-send"]') ? ' and a Send for a person' : ''));
  }
  host.remove();
  if (n < 100) bad.push('only ' + n + ' drawn parts were found — wanted the library\'s hundreds');
  /* THE WHOLE LIBRARY'S WINDOW LET GO, so the journeys after it in the same part have the heap (each card carries a tool row) */
  try { w.close(); } catch (e) {}
  return bad.slice(0, 20).concat(bad.length > 20 ? ['… and ' + (bad.length - 20) + ' more'] : []);
});

/* ---------- CORBETTMATHS PRIMARY, EVERY PART: SOMETHING TO ANSWER WITH AND SOMETHING THAT SENDS IT (docs/history/362) ---------- */
check('every part of the 71 Corbettmaths primary worksheets has an answer and a tile that marks or sends it', async () => {
  const LIB = LIB_FULL.rows('questions');
  const papers = new Set(LIB.filter(r => r.company === 'Corbettmaths' && /KS[12]/.test(r.key_stage || '')).map(r => r.paper_id));
  const rows = LIB.filter(r => papers.has(r.paper_id));
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  await wait(300);
  const bad = [];
  if (typeof w.questionCard_ !== 'function') return ['questionCard_ not reachable — NOT checked'];
  w.__t.STUFF().filters = [];
  const SEND = '[data-do="qp-check"], [data-do="qp-cells-check"], [data-do="pad-send"], [data-do="pad-check"]';
  /* a typed answer with no scheme is marked by a person or AI: Send or the AI tile, which come with signing in */
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  let n = 0, later = 0;
  for (const x of w.stuffItemsAll_()) {
    if (!x || x.kind !== 'question' || !papers.has(x.row && x.row.paper_id)) continue;
    n++;
    host.innerHTML = w.questionCard_(x, 0);
    if (host.querySelector(SEND)) continue;
    const open = !String(x.accept || x.markWords || x.cells || '').trim() && !(x.choices && x.choices.length) && host.querySelector('.qp-ans-in');
    if (open) { later++; continue; }
    bad.push(x.row.row_id + ': nothing marks or sends it');
  }
  host.remove();
  if (n < 1300) bad.push('only ' + n + ' Corbettmaths primary parts reached Find — wanted 1358');
  if (later > 4) bad.push(later + ' parts are typed with nothing to mark them by machine — 4 were known (362)');
  /* THE WHOLE LIBRARY'S WINDOW LET GO, so the journeys after it in the same part have the heap (each card carries a tool row) */
  try { w.close(); } catch (e) {}
  return bad.slice(0, 25).concat(bad.length > 25 ? ['… and ' + (bad.length - 25) + ' more'] : []);
});

/* ---------- A DRAWN ANSWER IS MARKED BY ITS GEOMETRY (docs/history/366): drawn on a real Corbettmaths figure in the real card, and every row's own example ---------- */
check('a drawn answer is marked on Check: strokes on a real Corbettmaths figure get Correct, a near miss Not yet, and every drawn Corbettmaths and GCSE part marks its own right drawing in full', async () => {
  const LIB = LIB_FULL.rows('questions');
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? LIB : undefined) });
  await wait(300);
  const t = w.__t, A = t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || !A['pad-check'] || !t.padKey || typeof w.drawFig_ !== 'function') return ['questionCard_, padKey_, drawFig_ or the pad-check handler is not reachable — NOT checked'];
  const DM = t.drawMark;
  if (!DM) return ['DRAW_MARK is not reachable — NOT checked'];
  t.STUFF().filters = [];
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  const all = w.stuffItemsAll_();
  const draw = (x, strokes) => {
    try { w.localStorage.setItem(t.padKey(x), JSON.stringify(strokes)); } catch (e) {}
    host.innerHTML = w.questionCard_(x, 0);
    const go = host.querySelector('.qpad-send [data-do="pad-check"]');
    if (!go) return null;
    A['pad-check'](go);
    return host.querySelector('.qpad-send .qp-verdict').textContent;
  };
  /* ONE BY HAND: Reflections Q7, triangle A reflected in the x-axis, drawn as a child would -- three strokes, one corner at a time, a little off the grid */
  const x7 = all.find(i => i.row && i.row.row_id === 'Q-CBM-reflections-7');
  if (!x7) bad.push('Reflections Q7 did not reach Find');
  else {
    host.innerHTML = w.questionCard_(x7, 0);
    const svg = host.querySelector('.qpad-art > svg');
    const F = DM.frameOf(JSON.parse(x7.drawAnswer), w.drawFig_(svg ? svg.outerHTML : ''));
    const vb = F.vb, pen = (...pts) => [].concat.apply([], pts.map(p => { const v = F.v(p); return [(v[0] - vb[0]) / vb[2] * 340, (v[1] - vb[1]) / vb[3] * 340]; }));
    const right = [pen([1.05, -4.1], [1, -2.9], [0.95, -2]), pen([1, -2], [2.5, -2.05], [4.1, -2]), pen([4, -2], [2.5, -3], [1, -4])];
    const say = draw(x7, right);
    if (say !== 'Correct') bad.push('Reflections Q7 drawn right says ' + JSON.stringify(say));
    const latest = w.subLatest_(t.ansKey(x7));
    if (!latest || latest.v !== 'right' || !/^drawing · 3 marks/.test(latest.a)) bad.push('the drawing is not recorded as a marked submission: ' + JSON.stringify(latest));
    /* reflected in the y-axis instead: the near miss every class makes */
    const miss = [pen([-1, 4], [-1, 2]), pen([-1, 2], [-4, 2]), pen([-4, 2], [-1, 4])];
    if (draw(x7, miss) !== 'Not yet — have another go') bad.push('Reflections Q7 reflected in the wrong axis says ' + JSON.stringify(host.querySelector('.qpad-send .qp-verdict').textContent));
    host.innerHTML = w.questionCard_(x7, 0);
    if (host.querySelector('.qpad-send .qp-verdict').textContent !== 'Not yet — have another go') bad.push('drawn again, the card does not show the drawing\'s own verdict');
    try { w.localStorage.setItem(t.padKey(x7), '[]'); } catch (e) {}
    host.innerHTML = w.questionCard_(x7, 0);
    A['pad-check'](host.querySelector('.qpad-send [data-do="pad-check"]'));
    if (host.querySelector('.qpad-send .qp-verdict').textContent !== 'Draw your answer first') bad.push('Check with nothing drawn does not ask for a drawing');
  }
  /* AND EVERY ROW: its own right drawing (`example`) is full marks in the real card, and the same drawing a square to the right is not */
  let n = 0;
  const sets = { cbm: 0, gcse: 0 };
  for (const x of all) {
    if (!x || x.kind !== 'question' || !String(x.drawAnswer || '').trim()) continue;
    n++;
    host.innerHTML = w.questionCard_(x, 0);
    const svg = host.querySelector('.qpad-art > svg');
    if (!svg) { bad.push(x.row.row_id + ': has draw_answer and no figure to draw on'); continue; }
    const fig = w.drawFig_(svg.outerHTML), eg = DM.example(x.drawAnswer, fig);
    const say = draw(x, eg);
    const full = DM.mark(eg, x.drawAnswer, fig, x.marks);
    if (!full || full.got !== full.of) bad.push(x.row.row_id + ': its own right drawing scores ' + JSON.stringify(full));
    else if (!/^Correct$|^(\d+) of \1 marks/.test(say || '')) bad.push(x.row.row_id + ': its right drawing, checked in the card, says ' + JSON.stringify(say));
    if (x.company === 'Corbettmaths') sets.cbm++; else sets.gcse++;
    try { w.localStorage.removeItem(t.padKey(x)); } catch (e) {}
  }
  /* NOTHING IN EITHER SET IS LEFT WAITING FOR A PERSON: a drawing-only part has Check, never Send */
  const docs = {};
  LIB.forEach(r => { if (r.kind === 'document') docs[r.paper_id] = r; });
  const inSets = r => (r.company === 'Corbettmaths' && /KS[12]/.test(r.key_stage || '') && r.document_type === 'Worksheet')
    || (d => d.exam_board === 'Edexcel' && d.subject === 'Maths' && d.key_stage === 'KS4' && d.document_type === 'Past paper' && /Higher|Foundation/.test(d.tier || ''))(docs[r.paper_id] || r);
  let waiting = 0;
  for (const x of all) {
    if (!x || x.kind !== 'question' || !x.row || !inSets(x.row)) continue;
    /* A DRAWN PART NO TYPED RULE MARKS (round 3: `qtDrawn_` and the part's marker, not `answerKinds_`) */
    if (!w.qtDrawn_(w.workRow_(x)) || ['draw', 'ai'].indexOf(w.markerOf_(x).kind) < 0) continue;
    /* A PENDING ROW WITHOUT ITS WORDS HERE (a fresh clone, 411) has no drawn answer to Check yet: not this journey's subject. */
    if (/^true$/i.test(String(x.row.lib_pending || '')) && !String(x.row.draw_answers || x.row.drawAnswer || x.drawAnswer || '').trim()) continue;
    host.innerHTML = w.questionCard_(x, 0);
    if (!host.querySelector('.qpad-send [data-do="pad-check"]')) { waiting++; bad.push(x.row.row_id + ': drawn, and still sent to a person'); }
  }
  /* AND THE DRAWINGS MADE BOXES (a Venn diagram's regions, a tree's branches, a choice of brackets): each scheme's own answer, entered, is Correct */
  const TYPED = ['Q-CBM-nets-8', 'Q-1MA1-2306-1H-5a', 'Q-1MA1-2406-3F-27a', 'Q-1MA1-1811-2H-1a', 'Q-1MA1-1911-1H-21', 'Q-1MA1-1905-1H-4', 'Q-1MA1-2406-1F-11c'];
  for (const id of TYPED) {
    const x = all.find(i => i.row && i.row.row_id === id);
    if (!x) { bad.push(id + ' did not reach Find'); continue; }
    host.innerHTML = w.questionCard_(x, 0);
    /* ITS FIGURE MAY BE A PAD WITH THE PEN OFF (1020, owner 7 Nov: the pen is off until chosen); drawn on means a drawing Check. */
    if (host.querySelector('.qpad-send [data-do="pad-check"], .qpad.is-drawing')) bad.push(id + ': made a box, and still drawn on');
    const cells = [...host.querySelectorAll('.qp-cell')], opts = [], one = host.querySelector('.qp-cells-box .qp-ans-in');
    if (one && !cells.length) {
      one.value = w.cellsOf_(x).filter(c => c.ways).map(c => c.ways.split('|')[0].trim()).join(' ; ');
      A['qp-cells-check'](host.querySelector('[data-do="qp-cells-check"]'));
      const say = host.querySelector('.qp-cells-box .qp-verdict').textContent;
      if (!/^Correct/.test(say)) bad.push(id + ': its own answers in its one box say ' + JSON.stringify(say));
    } else if (cells.length) {
      const ways = w.cellsOf_(x);
      cells.forEach(c => { const v = ways[Number(c.getAttribute('data-n'))]; c.value = v ? v.ways.split('|')[0].trim() : ''; });
      A['qp-cells-check'](host.querySelector('[data-do="qp-cells-check"]'));
      const say = host.querySelector('.qp-cells-box .qp-verdict').textContent;
      if (!/^Correct/.test(say)) bad.push(id + ': its own answers in its boxes say ' + JSON.stringify(say));
    } else if (opts.length) {
      if (opts.length !== 5) bad.push(id + ': ' + opts.length + ' places for the brackets, wanted 5');
    } else if (!host.querySelector('[data-do="qp-check"]')) bad.push(id + ': made typed, and nothing marks it');
  }
  host.remove();
  if (sets.cbm < 72) bad.push('only ' + sets.cbm + ' Corbettmaths drawn parts are marked by geometry — wanted 72');
  if (sets.gcse < 74) bad.push('only ' + sets.gcse + ' GCSE Maths drawn parts are marked by geometry — wanted 74');
  /* THE WHOLE LIBRARY'S WINDOW LET GO, so the journeys after it in the same part have the heap (each card carries a tool row) */
  try { w.close(); } catch (e) {}
  return bad.slice(0, 25).concat(bad.length > 25 ? ['… and ' + (bad.length - 25) + ' more'] : []);
});

/* ---------- A DRAWN PART WHOSE FIGURE IS ON ITS STEM DRAWS ON IT IN PLACE (docs/history/381): Metric Units Q1, by hand ---------- */
check('Metric Units Q1: the stem\'s words, its dial under the pen and the part\'s words on one card, one figure, its one box; an arrow at 450 g is Correct on Check; part b is a box under its own words and nothing for the drawing', async () => {
  const LIB = LIB_FULL.rows('questions');
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? LIB : undefined) });
  await wait(300);
  const t = w.__t, A = t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || !A['pad-check'] || !t.padKey || typeof w.pageParts_ !== 'function') return ['questionCard_, pageParts_, padKey_ or pad-check is not reachable — NOT checked'];
  t.STUFF().filters = [];
  const all = w.stuffItemsAll_();
  const a = all.find(i => i.row && i.row.row_id === 'Q-CBM-metric-units-1'), b = all.find(i => i.row && i.row.row_id === 'Q-CBM-metric-units-1b');
  if (!a || !b) return ['Metric Units Q1 (a) or (b) did not reach Find'];
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  /* (a): no stem page in front -- its words are on the card, over the dial */
  const pages = w.pageParts_(a, null);
  if (pages.some(p => /^stem/.test(p || ''))) bad.push('(a) still has the stem on a page of its own: ' + JSON.stringify(pages));
  host.innerHTML = w.questionCard_(a, 0) + '';
  const card = host.querySelector('.qcard');
  const figsIn = el => el.querySelectorAll('.qpad-art > svg:first-child, .qsheet figure > svg, .qseen svg:first-child').length;
  if (figsIn(host) !== 1) bad.push('(a) card holds ' + figsIn(host) + ' figures — wanted the one dial');
  if (!host.querySelector('.qpad .qpad-art > svg[aria-label*="scale dial"]')) bad.push('(a) the dial is not under the pen');
  const text = card.textContent.replace(/\s+/g, ' ');
  const sAt = text.indexOf('A can of beans'), aAt = text.indexOf('Draw an arrow');
  if (sAt < 0 || aAt < 0 || sAt > aAt) bad.push('(a) the card does not read stem, then the part: ' + text.slice(0, 160));
  /* ROUND 3: the one answer box every part has, and still no Figure tile */
  if (host.querySelectorAll('.qp-ans-in').length !== 1 || host.querySelector('[data-do="q-fig"]')) bad.push('(a) has ' + host.querySelectorAll('.qp-ans-in').length + ' answer boxes (wanted the one), or a Figure tile');
  const checks = host.querySelectorAll('[data-do="pad-check"]');
  if (checks.length !== 1) bad.push('(a) has ' + checks.length + ' Check tiles');
  /* Check is at the foot, after the part's words, as every part's is */
  const words = card.querySelector('.qsheet-part'), row = card.querySelector('.qpad-send');
  if (!row || !words || !(words.compareDocumentPosition(row) & w.Node.DOCUMENT_POSITION_FOLLOWING) || row.closest('.qpad')) bad.push('(a) Check is not under the part\'s words at the card\'s foot');
  /* AN ARROW DRAWN BY HAND, centre to 450 g, in the pen's 340 x 340 over the dial's 340 x 168 (its centre at 170, 84 after the translate) */
  const at = (g, r) => { const th = g / 1000 * 2 * Math.PI; return [170 + r * Math.sin(th), (84 - r * Math.cos(th)) * 340 / 168]; };
  const stroke = (g) => [].concat(at(g, 2), at(g, 30), at(g + 3, 46), at(g, 64), at(g - 12, 56), at(g, 64), at(g + 12, 56));
  const draw = strokes => {
    try { w.localStorage.setItem(t.padKey(a), JSON.stringify(strokes)); } catch (e) {}
    host.innerHTML = w.questionCard_(a, 0);
    const go = host.querySelector('.qpad-send [data-do="pad-check"]');
    if (!go) return null;
    A['pad-check'](go);
    return host.querySelector('.qpad-send .qp-verdict').textContent;
  };
  const right = draw([stroke(450)]);
  if (right !== 'Correct') bad.push('an arrow at 450 g says ' + JSON.stringify(right));
  const latest = w.subLatest_(t.ansKey(a));
  if (!latest || latest.v !== 'right') bad.push('the 450 g arrow is not recorded as right: ' + JSON.stringify(latest));
  const wrong = draw([stroke(300)]);
  if (wrong !== 'Not yet — have another go') bad.push('an arrow at 300 g says ' + JSON.stringify(wrong));
  try { w.localStorage.removeItem(t.padKey(a)); } catch (e) {}
  /* (b): its box under its own words, Check beside it, and no pen, no dial, no Figure tile */
  host.innerHTML = w.questionCard_(b, 0) + '';
  if (!host.querySelector('.qp-ans-in, .qp-ans')) bad.push('(b) has no box to type 900 g in');
  if (host.querySelector('.qpad') || figsIn(host)) bad.push('(b) has a pen or a figure on its card');
  if (host.querySelector('[data-do="q-fig"]')) bad.push('(b) offers the dial again behind a Figure tile');
  const bw = host.querySelector('.qsheet-part'), box = host.querySelector('.qp-ans-in, .qp-ans');
  if (bw && box && !(bw.compareDocumentPosition(box) & w.Node.DOCUMENT_POSITION_FOLLOWING)) bad.push('(b) its box is not under its words');
  if (host.querySelectorAll('[data-do="qp-check"]').length !== 1) bad.push('(b) wants one Check');
  host.remove();
  /* THE WHOLE LIBRARY'S WINDOW LET GO, so the journeys after it in the same part have the heap (each card carries a tool row) */
  try { w.close(); } catch (e) {}
  return bad;
});

/* ---------- AND EVERY PART IN THE LIBRARY THAT DRAWS ON ITS STEM'S FIGURE: one figure, its pen; no box unless it is marked by one; Check at the foot (381) ---------- */
check('every part that draws on its stem\'s figure has exactly that one figure on its card, under its pen, one tool row, one Check at the foot, and the other parts\' ink faint under its own', async () => {
  const LIB = LIB_FULL.rows('questions');
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? LIB : undefined) });
  await wait(300);
  const t = w.__t, bad = [];
  if (typeof w.questionCard_ !== 'function' || typeof w.padSource_ !== 'function' || typeof w.stemCarried_ !== 'function') return ['questionCard_, padSource_ or stemCarried_ not reachable — NOT checked'];
  t.STUFF().filters = [];
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  const all = w.stuffItemsAll_();
  let n = 0, carried = 0, under = 0;
  for (const x of all) {
    if (!x || x.kind !== 'question') continue;
    const p = w.padSource_(x);
    if (!p || !p.from || typeof p.from !== 'object') continue;
    n++;
    const id = x.row.row_id;
    host.innerHTML = w.questionCard_(x, 0) + '';
    const svgs = [...host.querySelectorAll('.qpad-art > svg:first-child, .qsheet figure > svg, .qseen svg:first-child')];
    if (svgs.length !== 1) bad.push(id + ': ' + svgs.length + ' figures on its card');
    else if (!svgs[0].closest('.qpad')) bad.push(id + ': its figure is not under its pen');
    /* ROUND 3: one tool row, one Check last in it, whatever marks the part */
    if (host.querySelectorAll('.qt-row').length !== 1) bad.push(id + ': ' + host.querySelectorAll('.qt-row').length + ' tool rows');
    const marks = [...host.querySelectorAll('.qt-row .is-submit')].filter(g => !g.closest('[hidden]'));
    if (marks.length !== 1) bad.push(id + ': ' + marks.length + ' Check tiles');
    else if (marks[0].closest('.qpad')) bad.push(id + ': Check is inside the pen, not at the foot');
    if ([...host.querySelectorAll('[data-do="q-fig"]')].length && (w.figsBefore_(x) || []).some(f => f.html.indexOf(p.svg) >= 0)) bad.push(id + ': the Figure tile offers the figure it draws on');
    if (w.stemCarried_(x)) {
      carried++;
      if (w.pageParts_(x, null).some(q => /^stem/.test(q || '') && (x.stems || [])[+String(q).replace(/^stem(\d+).*$/, '$1')] === p.from)) bad.push(id + ': its stem is carried and still has a page');
      /* ITS OPENING WORDS, letters and digits only up to the figure: an entity (&frasl;) is typeset as a sign, and the figure may sit after its first sentence */
      const flat = h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/[^A-Za-z0-9]+/g, '');
      const words = flat(String(p.from.html || '').split(/<!--\s*fig\s*-->/i)[0]).slice(0, 16);
      /* on the card, or -- a long stem -- on the part's own pages, which since 960 are one card: the part as the whole question draws it (`qPartCard_`) */
      const pre = typeof w.qPartCard_ === 'function' ? w.qPartCard_(x, false) : '';
      const seen = flat(pre + host.innerHTML);
      if (words && seen.indexOf(words) < 0) bad.push(id + ': its stem is carried and its words are not on its pages: ' + JSON.stringify(words));
    }
    /* THE OTHER PARTS ON THIS FIGURE: a stroke each, then this card shows them faint and its own pen empty */
    const sib = (Object.values(w.questionParts_()).find(g => g.indexOf(x) >= 0) || []).filter(y => y !== x && (q => q && q.svg === p.svg)(w.padSource_(y)));
    if (sib.length) {
      sib.forEach(y => { try { w.localStorage.setItem(t.padKey(y), JSON.stringify([[20, 20, 60, 60]])); } catch (e) {} });
      host.innerHTML = w.questionCard_(x, 0);
      const was = host.querySelectorAll('.qpad .qpad-was path').length, own = host.querySelectorAll('.qpad .qpad-g path').length;
      if (was !== sib.length || own) bad.push(id + ': ' + was + ' of ' + sib.length + ' other parts\' strokes under it, ' + own + ' of its own');
      else under++;
      sib.forEach(y => { try { w.localStorage.removeItem(t.padKey(y)); } catch (e) {} });
    }
  }
  host.remove();
  if (n < 80) bad.push('only ' + n + ' parts draw on a stem\'s figure — wanted the library\'s 82');
  if (carried < 35) bad.push('only ' + carried + ' carry their stem onto the card — wanted the 39 that come first');
  if (under < 40) bad.push('only ' + under + ' showed the other parts\' ink under their own');
  /* THE WHOLE LIBRARY'S WINDOW LET GO, so the journeys after it in the same part have the heap (each card carries a tool row) */
  try { w.close(); } catch (e) {}
  return bad.slice(0, 25).concat(bad.length > 25 ? ['… and ' + (bad.length - 25) + ' more'] : []);
});

/* ---------- ROOM TO WRITE: AN EXPAND TILE OPENS THE ANSWER ON A WHOLE-SCREEN SHEET, AND DONE BRINGS IT BACK (docs/history/359) ---------- */
check('marked by rule first: a 2-mark worded answer with mark_words gets Check, marks per point, says "by key words", and no AI button rides on it', async () => {
  const base = { active: 'True', subject: 'Biology', document_type: 'Past paper', key_stage: 'KS4', pages_checked: 'True' };
  const rows = [
    Object.assign({}, base, { row_id: 'D-MW', paper_id: 'MW', kind: 'document', name: 'Cells' }),
    Object.assign({}, base, { row_id: 'MW-1', paper_id: 'MW', kind: 'question', name: 'Cells', question: '1', marks: '2', answer_type: 'short',
                              html: '<p>Name the two elements in a hydrocarbon.</p>', answer: 'Carbon and hydrogen', mark_words: 'carbon ; hydrogen' }),
  ];
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  if (!A['qp-check']) return ['the qp-check handler is not reachable — nothing was checked'];
  const x = w.stuffItemsAll_().find(i => i.row && i.row.row_id === 'MW-1');
  if (!x) return ['the fixture row did not reach Find'];
  const host = d.createElement('div');
  d.body.appendChild(host);
  host.innerHTML = w.questionCard_(x, 0);
  const go = host.querySelector('.qp-mark[data-rule] [data-do="qp-check"]');
  if (!go) return ['a row with mark_words has no Check by its key words'];
  if (host.querySelector('[data-do="qp-ai"]')) bad.push('a part a rule marks still carries an AI button: one mark button per part (owner, 11 Nov)');
  const inp = host.querySelector('.qp-ans-in'), out = host.querySelector('.qp-verdict');
  inp.value = 'just carbon';
  A['qp-check'](go);
  if (!/^1 of 2 marks · by key words/.test(out.textContent)) bad.push('one point of two says ' + JSON.stringify(out.textContent));
  inp.value = 'Hydrogen and carbon';
  A['qp-check'](go);
  if (out.textContent !== '2 of 2 marks · by key words') bad.push('both points say ' + JSON.stringify(out.textContent));
  const latest = typeof w.subLatest_ === 'function' ? w.subLatest_(inp.getAttribute('data-k')) : null;
  if (latest && latest.v !== 'rule:2/2') bad.push('the mark was recorded as ' + JSON.stringify(latest.v) + ', wanted rule:2/2 — which way it was made is lost');
  host.remove();
  return bad;
});

/* ---------- ONE MARK BUTTON PER PART (owner, 11 Nov): the part's protocol picks the marker; the student never picks between two ---------- */
check('one mark button: every sampled library part has exactly one, first in its row, and no AI button rides on a part a rule marks', async () => {
  const LIB = LIB_FULL.rows('questions');
  const adult = Object.assign({}, MEMBER_, { profile: { dob_d: '1', dob_m: '1', dob_y: String(new Date().getFullYear() - 30) } });
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? LIB : undefined), before: signedInAs_(adult),
    payload: Object.assign(payload(), { features: ['aiMark'], aiMarking: true }) });
  await wait(300);
  const bad = [], seen = {};
  if (typeof w.questionCard_ !== 'function' || typeof w.qtMachine_ !== 'function') return ['questionCard_ or qtMachine_ not reachable — NOT checked'];
  w.__t.STUFF().filters = [];
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  const qs = w.stuffItemsAll_().filter(x => x && x.kind === 'question');
  /* EVERY 15TH PART, and each marker kind at least once: the whole library is too heavy for one window */
  qs.forEach((x, i) => {
    const kind = w.markerOf_(x).kind;
    if (i % 15 && seen[kind]) return;
    seen[kind] = (seen[kind] || 0) + 1;
    host.innerHTML = w.questionCard_(x, 0);
    const id = (x.row && x.row.row_id) || x.key;
    host.querySelectorAll('.qt-row').forEach(row => {
      const go = [...row.querySelectorAll('.is-submit')];
      if (go.length !== 1) bad.push(id + ': ' + go.length + ' mark buttons in one row');
      else if (go[0] !== row.querySelector('.kc-four > *')) bad.push(id + ': its mark button is not first in its row');
    });
    if (w.qtMachine_(w.workRow_(x)) && host.querySelector('[data-do="qp-ai"]')) bad.push(id + ': marked by its ' + kind + ' rule and still offers the AI');
  });
  host.remove();
  if (Object.keys(seen).length < 5) bad.push('only marker kinds ' + Object.keys(seen).join(', ') + ' were seen');
  try { w.close(); } catch (e) {}
  return bad.slice(0, 20).concat(bad.length > 20 ? ['… and ' + (bad.length - 20) + ' more'] : []);
});

check('one mark per press: a rule part pressed twice is one submission and never reaches the AI; a part with no rule goes to the AI from the same button, busy until it answers', async () => {
  const base = { active: 'True', subject: 'Chemistry', document_type: 'Past paper', key_stage: 'KS4', pages_checked: 'True' };
  const rows = [
    Object.assign({}, base, { row_id: 'D-OM', paper_id: 'OM', kind: 'document', name: 'Rates' }),
    Object.assign({}, base, { row_id: 'OM-1', paper_id: 'OM', kind: 'question', name: 'Rates', question: '1', marks: '1', answer_type: 'short',
                              html: '<p>Name the gas made.</p>', answer: 'Hydrogen', accept: 'hydrogen|H2' }),
    Object.assign({}, base, { row_id: 'OM-2', paper_id: 'OM', kind: 'question', name: 'Rates', question: '2', marks: '3', answer_type: 'explain',
                              html: '<p>Explain why the rate increases with temperature.</p>', answer: 'Faster particles; more frequent collisions; more over the activation energy' }),
  ];
  let release = null;
  const { w, sent } = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined), before: signedInAs_(ANS_ADA),
    payload: Object.assign(payload(), { features: ['aiMark'], aiMarking: true }),
    reply: b => (b.action === 'aiMark' ? new Promise(r => { release = () => r({ success: true, awarded: 2, available: 3, feedback: 'Two points made' }); }) : undefined) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  const item = id => w.stuffItemsAll_().find(i => i.row && i.row.row_id === id);
  const rule = item('OM-1'), open = item('OM-2');
  if (!rule || !open) return ['the fixture rows did not reach Find — NOT checked'];
  if (!w.qtMachine_(w.workRow_(rule)) || w.qtMachine_(w.workRow_(open))) bad.push('the fixture parts are not one machine-marked and one not');
  const draw = x => { const h = d.createElement('div'); h.innerHTML = w.questionCard_(x, 0); d.body.appendChild(h); return h; };
  const press = go => A[go.getAttribute('data-do')](go);
  /* EVERY SUBMISSION MADE, by its id: a double tap hands back the first */
  const made = new Set(), real = w.subRecord_;
  w.subRecord_ = function () { const e = real.apply(this, arguments); if (e && e.id) made.add(e.id); return e; };
  const h1 = draw(rule);
  const go1 = h1.querySelector('.qt-row .kc-four > .is-submit');
  if (!go1) { w.subRecord_ = real; return ['the rule part has no mark button first in its row']; }
  h1.querySelector('.qp-ans-in').value = 'oxygen';
  press(go1); press(go1);
  await wait(50);
  if (sent.some(b => b.action === 'aiMark')) bad.push('a part its rule marks reached the AI');
  if (made.size !== 1) bad.push('two presses made ' + made.size + ' submissions, wanted one');
  const v1 = h1.querySelectorAll('.qp-verdict');
  if (v1.length !== 1 || !/Not yet/.test(v1[0].textContent)) bad.push('the rule part shows ' + v1.length + ' verdict line(s): ' + [...v1].map(v => v.textContent).join(' | '));
  const h2 = draw(open);
  const go2 = h2.querySelector('.qt-row .kc-four > .is-submit');
  if (!go2 || go2.getAttribute('data-do') !== 'qp-ai') { w.subRecord_ = real; return bad.concat(['the open part\'s first button is ' + (go2 ? go2.getAttribute('data-do') : 'missing') + ', wanted the AI marker']); }
  h2.querySelector('.qp-ans-in').value = 'The particles move faster and collide more often.';
  press(go2); press(go2);
  await wait(30);
  const asks = sent.filter(b => b.action === 'aiMark').length;
  if (asks !== 1) bad.push('two presses on the AI part sent ' + asks + ' requests, wanted one');
  if (!go2.disabled || !go2.classList.contains('is-busy')) bad.push('the button is not busy while the AI marks');
  if (release) release();
  await wait(80);
  if (!/2 of 3 marks/.test(h2.querySelector('.qp-verdict').textContent)) bad.push('the AI verdict reads ' + JSON.stringify(h2.querySelector('.qp-verdict').textContent));
  if (go2.classList.contains('is-busy')) bad.push('the button is still busy after the AI answered');
  if (h2.querySelectorAll('.qp-verdict').length !== 1) bad.push('the AI part shows more than one verdict line');
  w.subRecord_ = real;
  h1.remove(); h2.remove();
  return bad;
});

/* ---------- A PHOTO IS NEVER MARKED BY KEY WORDS (owner, 29 Oct): a show-that proof photographed went to the key words, which read only the typed box ---------- */
check('a part with photos of its working: Check sends the photos to the AI marker (markWorking), never key words on the typed box', async () => {
  const base = { active: 'True', subject: 'Maths', document_type: 'Past paper', key_stage: 'KS5', pages_checked: 'True' };
  const rows = [
    Object.assign({}, base, { row_id: 'D-PF', paper_id: 'PF', kind: 'document', name: 'Proof' }),
    Object.assign({}, base, { row_id: 'PF-1', paper_id: 'PF', kind: 'question', name: 'Proof', question: '1', marks: '3', answer_type: 'proof',
                              html: '<p>Show that (n+1)^2 - (n-1)^2 is a multiple of 4.</p>', answer: 'Expands to 4n', mark_words: '4n ; multiple' }),
  ];
  const one = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined), before: signedInAs_(ANS_ADA),
    reply: b => (b.action === 'markWorking' ? { success: true, awarded: 3, available: 3, feedback: 'Read from the photo' } : undefined) });
  await wait(300);
  const w = one.w, t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  const x = w.stuffItemsAll_().find(i => i.row && i.row.row_id === 'PF-1');
  if (!x || !A['qp-check']) return ['the fixture row or the qp-check handler is not reachable — nothing was checked'];
  const host = d.createElement('div');
  d.body.appendChild(host);
  host.innerHTML = w.questionCard_(x, 0);
  const go = host.querySelector('.qp-mark[data-rule] [data-do="qp-check"]');
  if (!go) return ['the proof row has no Check by its key words — the fixture no longer exercises the rule'];
  const inp = host.querySelector('.qp-ans-in'), out = host.querySelector('.qp-verdict');
  const k = inp.getAttribute('data-k');
  inp.value = 'see photo, multiple';
  t.workPics()[k] = [{ url: 'data:image/jpeg;base64,/9j/AAAA' }];
  w.workPaint_(k);
  A['qp-check'](go);
  await wait(120);
  const went = one.sent.filter(b => b.action === 'markWorking');
  if (went.length !== 1) bad.push('Check with a photo sent ' + went.length + ' markWorking requests — the photo was not given to the AI marker');
  else if (!(went[0].photos || []).length || went[0].answer !== 'see photo, multiple') bad.push('markWorking went without the photo or the typed words: ' + JSON.stringify(went[0]).slice(0, 160));
  if (/by key words/.test(out.textContent)) bad.push('a photographed part was marked by key words: ' + JSON.stringify(out.textContent));
  const latest = typeof w.subLatest_ === 'function' ? w.subLatest_(k) : null;
  if (latest && /^rule:/.test(String(latest.v))) bad.push('a key-word mark was recorded for a photographed part: ' + latest.v);
  /* AND WITH NO PHOTO, THE KEY WORDS STILL MARK THE TYPED BOX */
  t.workPics()[k] = [];
  w.workPaint_(k);
  inp.value = 'it is 4n so a multiple of 4';
  A['qp-check'](go);
  if (!/by key words/.test(out.textContent)) bad.push('with no photo the key words did not mark: ' + JSON.stringify(out.textContent));
  host.remove();
  return bad;
});

/* ---------- READ ALOUD ON A PRIMARY QUESTION: THE TILE, WHAT IT SAYS, AND WHEN IT STOPS (docs/history/394) ---------- */
check('read aloud: a KS2 question and a GCSE one have the tile (457), a GCSE content card too (502); it says the question in words, stops on a second tap and on leaving', async () => {
  const LIB = LIB_FULL.rows('questions');
  const PIDS = ['P-STA-KS2-2024-P1', 'P-STA-KS2-2024-P2', 'P-STA-KS2-2024-P3', 'RS1786302107764-416'];
  const rows = LIB.filter(r => PIDS.indexOf(r.paper_id) >= 0);
  const said = [];
  const voiced = w => {
    w.SpeechSynthesisUtterance = function (txt) { this.text = String(txt); this.lang = ''; this.voice = null; this.rate = 1; };
    w.speechSynthesis = { speak: u => said.push(u), cancel: () => said.push({ cancel: true }),
                          getVoices: () => [{ name: 'American', lang: 'en-US' }, { name: 'British', lang: 'en-GB' }] };
  };
  const read = n => (LIB_FULL.isLib(n) ? LIB_FULL.rows(n) : JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', n + '.json'), 'utf8')));
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable — NOT checked'];
  const p = payload();
  p.textbooks = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { textbooks: read('textbooks') }))).textbooks || [];
  const { w } = boot({ payload: p, before: voiced, serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  const ready = () => typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().some(x => x.row && x.row.paper_id === PIDS[0]);
  for (let i = 0; i < 80 && !ready(); i++) await wait(50);
  const t = w.__t, d = w.document, bad = [];
  if (!ready() || typeof w.readAloudLines_ !== 'function') return ['the real rows or readAloudLines_ did not arrive — NOT checked'];
  const all = w.stuffItemsAll_();
  const q = id => all.find(x => x.row && x.row.row_id === id);
  const ks2 = q('Q-STA-KS2-2024-P1-28'), shop = q('Q-STA-KS2-2024-P2-2'), gcse = q('Q-1MA1-2406-1H-1');
  if (!ks2 || !shop || !gcse) return ['a fixture row is missing from data/questions.json — NOT checked'];
  const host = d.createElement('div');
  d.body.appendChild(host);
  const tileOf = x => { host.innerHTML = w.stuffCard(x); return host.querySelector('[data-do="read-aloud"]'); };
  /* EVERY QUESTION HAS IT IN ITS TOOL ROW (round 3, qtools.js); content cards keep the primary rule (394) */
  if (!tileOf(gcse)) bad.push('a GCSE question has no Read aloud tile — every question has it (457)');
  const ct = all.filter(x => x.kind === 'content');
  const ctKs2 = ct.find(x => /KS2/.test(x.level || '') || /KS2/.test(x.keystage || '')), ctGcse = ct.find(x => x.level === 'GCSE');
  if (!ctKs2 || !ctGcse) bad.push('no KS2 and GCSE content cards to hold the tile against');
  else {
    if (!tileOf(ctKs2)) bad.push('the KS2 content card "' + ctKs2.name + '" has no Read aloud tile');
    if (!tileOf(ctGcse)) bad.push('the GCSE content card "' + ctGcse.name + '" has no Read aloud tile (502: every content card)');
    /* HEAR IT (427): a French card says its worked lines' French halves, each in fr-FR; a maths card has no Hear it. */
    const ctFr = ct.find(x => x.subject === 'French' && x.row && (x.row.points || []).length);
    const ctMaths = ct.find(x => x.subject === 'Maths');
    if (!ctFr || !ctMaths) bad.push('no French or no Maths content card with worked lines — Hear it was NOT checked');
    else {
      host.innerHTML = w.stuffCard(ctFr);
      const ht = host.querySelector('[data-do="hear-it"]');
      if (!ht) bad.push('the French content card "' + ctFr.name + '" has no Hear it tile');
      else {
        said.length = 0;
        t.ACTIONS['hear-it'](ht);
        const fr = said.filter(u => u.text), want = ctFr.row.points.map(p => p.text.split(' — ')[0].trim());
        if (fr.map(u => u.text).join(' | ') !== want.join(' | ')) bad.push('Hear it on "' + ctFr.name + '" said ' + JSON.stringify(fr.map(u => u.text)) + ', wanted ' + JSON.stringify(want));
        if (!fr.length || fr.some(u => u.lang !== 'fr-FR')) bad.push('Hear it spoke in ' + JSON.stringify(fr.map(u => u.lang)) + ', wanted fr-FR');
      }
      host.innerHTML = w.stuffCard(ctMaths);
      if (host.querySelector('[data-do="hear-it"]')) bad.push('the Maths content card "' + ctMaths.name + '" carries Hear it');
      said.length = 0;
    }
  }
  let tile = tileOf(ks2);
  if (!tile) return bad.concat(['the KS2 question Q-STA-KS2-2024-P1-28 has no Read aloud tile']);
  if (!tile.querySelector('.tile-i-speak')) bad.push('the Read aloud tile does not carry the speaker mark');
  /* WHAT IT SAYS: the fraction sum in words, said in the British voice, a little slow. */
  t.ACTIONS['read-aloud'](tile);
  const spoken = said.filter(u => u.text).map(u => u.text);
  const WANT = '2 and three eighths minus five eighths equals what?';
  if (spoken.join(' | ') !== WANT) bad.push('Q-STA-KS2-2024-P1-28 is read as ' + JSON.stringify(spoken) + ', wanted ' + JSON.stringify(WANT));
  const u0 = said.find(u => u.text);
  if (u0 && (u0.lang !== 'en-GB' || !u0.voice || u0.voice.lang !== 'en-GB' || !(u0.rate < 1))) bad.push('the voice is ' + u0.lang + '/' + (u0.voice && u0.voice.lang) + ' at rate ' + u0.rate + ', wanted the British voice a little slow');
  tile = host.querySelector('[data-do="read-aloud"]');
  if (tile.getAttribute('aria-pressed') !== 'true' || !tile.classList.contains('on') || !/Stop/.test(tile.getAttribute('aria-label'))) bad.push('the tile does not show it is reading: ' + tile.getAttribute('aria-label'));
  /* A SECOND TAP STOPS IT, and says nothing more. */
  said.length = 0;
  t.ACTIONS['read-aloud'](tile);
  if (!said.some(u => u.cancel) || said.some(u => u.text)) bad.push('a second tap did not just stop: ' + JSON.stringify(said));
  if (tile.getAttribute('aria-pressed') !== 'false' || tile.classList.contains('on')) bad.push('after the second tap the tile still shows it is reading');
  /* THE SHOP QUESTION: the table, the money, the options as A to D, and never the answer. */
  tile = tileOf(shop);
  said.length = 0;
  if (tile) t.ACTIONS['read-aloud'](tile);
  const lines = said.filter(u => u.text).map(u => u.text);
  ['Banana, 12p.', 'He pays with a 2 pounds coin. He gets 1 pound 50 change.', 'Choose 2.', 'A: Banana.', 'D: Pear.'].forEach(l => {
    if (lines.indexOf(l) < 0 && !lines.some(s => s.indexOf(l) >= 0)) bad.push('Q-STA-KS2-2024-P2-2 is not read with "' + l + '": ' + JSON.stringify(lines));
  });
  if (lines.some(l => /mark/i.test(l))) bad.push('the marks are read out: ' + JSON.stringify(lines));
  /* LEAVING THE COLUMN STOPS IT. */
  said.length = 0;
  /* ANOTHER COLUMN THAN THE ONE IT BEGAN ON: since the freeze (1090) the app may open on Find itself */
  t.go(t.TABS.map(c => c.id).find(id => id !== t.AT()) || 'stuff', false, true);
  for (let i = 0; i < 20 && !said.some(u => u.cancel); i++) await wait(20);
  if (!said.some(u => u.cancel)) bad.push('going to another column did not stop the reading');
  tile = host.querySelector('[data-do="read-aloud"]');
  if (tile && tile.getAttribute('aria-pressed') === 'true') bad.push('after leaving the column the tile still shows it is reading');
  /* THE MATHS IN WORDS, on real KS2 rows: what each one's first line is said as. */
  const CASES = [
    ['Q-STA-KS2-2024-P1-1', '689 plus 38 equals what?'],
    ['Q-STA-KS2-2024-P1-2', '72 divided by 3 equals what?'],
    ['Q-STA-KS2-2024-P1-3', '23 times 6 equals what?'],
    ['Q-STA-KS2-2024-P1-31', '99 percent of 600 equals what?'],
    ['Q-STA-KS2-2024-P1-34', '2 and one sixth minus two thirds equals what?'],
    ['Q-STA-KS2-2024-P2-20', 'Each day, a school has break from 10 15 a.m. to 10 30 a.m. and lunchtime from 12 40 p.m. to 1 30 p.m.'],
    ['Q-STA-KS2-2024-P3-2', 'The temperature in a freezer is minus 40 degrees Celsius. The temperature increases by 10 degrees Celsius.'],
  ];
  CASES.forEach(([id, want]) => {
    const x = q(id);
    if (!x) { bad.push(id + ' is not in data/questions.json — NOT checked'); return; }
    const got = w.readAloudLines_(x)[0];
    if (got !== want) bad.push(id + ' is said as ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(want));
  });
  const box = q('Q-STA-KS2-2024-P3-16');
  if (box && w.readAloudLines_(box).indexOf('Three fifths is less than how many hundredths is less than 0 point 7.') < 0) bad.push('the box in a fraction is not "how many hundredths": ' + JSON.stringify(w.readAloudLines_(box)));
  /* NO VOICE, NO TILE. */
  const quiet = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) }).w;
  for (let i = 0; i < 80 && !(typeof quiet.stuffItemsAll_ === 'function' && quiet.stuffItemsAll_().some(x => x.row && x.row.row_id === 'Q-STA-KS2-2024-P1-28')); i++) await wait(50);
  const qx = quiet.stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q-STA-KS2-2024-P1-28');
  if (!qx) bad.push('the second boot did not load the row — the no-voice case was NOT checked');
  else if (quiet.tile_(quiet.readAloudOpts_(qx))) bad.push('with no speechSynthesis the Read aloud tile is still drawn');
  host.remove();
  return bad;
});

/* ---------- THE DEVICE'S VOICE ONLY (463 withdrawn): signed in, Read aloud asks the server nothing and the calmest British device voice says it. */
check('device voice only (463): signed in, Read aloud sends nothing to the backend and the best en-GB device voice says it, calm rate and pitch', async () => {
  const rows = LIB_FULL.rows('questions').filter(r => r.paper_id === 'P-STA-KS2-2024-P1');
  const WANT = '2 and three eighths minus five eighths equals what?';
  const said = [];
  const before = w => {
    w.SpeechSynthesisUtterance = function (txt) { this.text = String(txt); };
    w.speechSynthesis = { speak: u => said.push(u), cancel() {}, getVoices: () => [{ name: 'eSpeak English', lang: 'en-GB' },
      { name: 'Samantha', lang: 'en-US' }, { name: 'Daniel', lang: 'en-GB' }] };
  };
  const { w, sent } = boot({ before, serve: url => (/data\/questions\.json/.test(url) ? rows : undefined), reply: () => ({ success: true }) });
  const ready = () => typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().some(x => x.row && x.row.row_id === 'Q-STA-KS2-2024-P1-28');
  for (let i = 0; i < 80 && !ready(); i++) await wait(50);
  if (!ready()) return ['the KS2 row did not arrive — NOT checked'];
  w.__t.USER({ name: 'Test Student', personId: 'P001', role: 'student', roles: ['student'], token: 'tk1' });
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  host.innerHTML = w.stuffCard(w.stuffItemsAll_().find(x => x.row && x.row.row_id === 'Q-STA-KS2-2024-P1-28'));
  const tile = host.querySelector('[data-do="read-aloud"]');
  if (!tile) { host.remove(); return ['no Read aloud tile']; }
  const n0 = sent.length;
  w.__t.ACTIONS['read-aloud'](tile);
  await wait(120);
  host.remove();
  const bad = [];
  if (sent.slice(n0).some(b => b && b.action === 'speak')) bad.push('Read aloud still asks the backend to speak');
  if (said.map(u => u.text).join(' | ') !== WANT) bad.push('the device voice said ' + JSON.stringify(said.map(u => u.text)) + ', wanted ' + JSON.stringify(WANT));
  const u = said[0] || {};
  if (!u.voice || u.voice.name !== 'Daniel') bad.push('the voice was ' + JSON.stringify(u.voice && u.voice.name) + ', wanted Daniel (en-GB, not eSpeak)');
  if (u.rate !== 0.9 || u.pitch !== 0.95) bad.push('rate/pitch ' + u.rate + '/' + u.pitch + ', wanted 0.9/0.95');
  return bad;
});

/* ---------- SUGGEST A CHANGE (494): the one tile on a question and a content card, the box in place, the send — and the admin's Suggestions card. */
check('Suggest a change is one tile on a question and a content card for a student and an admin, none signed out; one text box in place; an admin’s goes to Notes for Claude; the admin confirms or dismisses a child’s', async () => {
  const reply = b => b.action === 'suggest' ? { success: true, serious: b.token === 'tok-P1' }
    : b.action === 'listSuggestions' ? { success: true, open: 2, suggestions: [
        { id: 'N-2-2', at: Date.now(), kind: 'widget', itemId: 'calc', rank: 'student', handle: 'bn2026', label: 'Calculator', note: 'bigger keys' },
        { id: 'N-1-1', at: Date.now(), kind: 'question', itemId: 'q:Q-REP-1', rank: 'student', handle: 'aa2026', label: 'Q1 · Paper 1', note: 'it is 15' }] }
    : b.action === 'decideSuggestion' ? { success: true, id: b.id, decision: b.decision, reportedItems: [], notes: [] }
    : { success: true, messages: [] };
  const { w, sent } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  const ct = { kind: 'content', key: 'ct:TB-REP#1', name: 'Bayes', sub: 'Statistics', subject: 'Statistics', row: { bookId: 'TB-REP', n: 1, title: 'Bayes', animations: [] } };
  const lib = mpLibrary_(w, [mpRow_('P-REP', 'Paper 1', 1, 'a')]);
  const x = lib.items.find(i => i && i.kind === 'question' && i.key);
  if (!x || !ct) { lib.put(); return ['no question or no content card was made, so the Suggest tile was NOT checked']; }
  t.USER(null);
  if (/data-do="rep-box"/.test(w.cardRow_(x) + w.cardRow_(ct))) bad.push('signed out, a card row offers Suggest a change');
  const KID = { name: 'Ada Pupil', personId: 'P7', role: 'student', roles: ['student'], token: 'tok-P7', handle: 'aa2026' };
  const HAL = { name: 'Hal Admin', personId: 'P1', role: 'admin', roles: ['admin'], token: 'tok-P1', handle: 'hl2026' };
  for (const who of [KID, HAL]) {
    t.USER(who);
    [x, ct].forEach(c => {
      const n = (w.cardRow_(c).match(/data-do="rep-box"/g) || []).length;
      if (n !== 1) bad.push(who.role + ': the ' + c.kind + ' row has ' + n + ' Suggest tiles — wanted one');
      if (/data-do="ncl-open"|aria-label="Report/.test(w.cardRow_(c))) bad.push(who.role + ': the ' + c.kind + ' row still has a Report or Note tile');
    });
  }
  t.USER(KID);
  const host = d.createElement('div');
  host.className = 'card';
  host.innerHTML = w.cardRow_(ct);
  d.body.appendChild(host);
  const tile = host.querySelector('.tile-row [data-do="rep-box"]');
  if (!tile.classList.contains('tile') || !tile.querySelector('.tile-i-suggest')) bad.push('Suggest a change is not a tile with the suggest mark');
  if (tile.getAttribute('aria-label') !== 'Suggest a change') bad.push('the tile is called ' + tile.getAttribute('aria-label'));
  t.ACTIONS['rep-box'](tile);
  await wait(20);
  if (sheetOpen_(d)) bad.push('pressing Suggest opened a sheet — the box belongs in place');
  const form = host.querySelector('.rep-box');
  if (!form) { host.remove(); lib.put(); return bad.concat(['pressing Suggest drew no box']); }
  if (form.querySelector('select')) bad.push('the box still asks for a reason — one text area is the whole of it');
  const note = form.querySelector('textarea.rep-note-in');
  if (!note || note.getAttribute('autocomplete') !== 'off') bad.push('the text box is missing or suggests');
  const sendT = form.querySelector('[data-do="rep-send"]');
  t.ACTIONS['rep-send'](sendT);
  await wait(20);
  if (sent.some(b => b.action === 'suggest')) bad.push('Send with no words still sent');
  note.value = 'the tree is wrong';
  t.ACTIONS['rep-send'](sendT);
  await wait(300);
  const went = sent.filter(b => b.action === 'suggest');
  if (went.length !== 1 || went[0].kind !== 'content' || went[0].itemId !== ct.key || went[0].note !== 'the tree is wrong' || went[0].token !== 'tok-P7') bad.push('the request carried ' + JSON.stringify(went));
  if (toastOf_(d) !== 'Thanks — sent to the admin') bad.push('a child’s toast says ' + JSON.stringify(toastOf_(d)));
  if (/to change/.test(w.cardRow_(ct))) bad.push('a child’s suggestion marked the card');
  if (host.querySelector('.rep-box')) bad.push('the box stayed after it went');
  t.USER(HAL);
  host.innerHTML = w.cardRow_(x);
  t.ACTIONS['rep-box'](host.querySelector('[data-do="rep-box"]'));
  await wait(20);
  const f2 = host.querySelector('.rep-box');
  if (!/Notes for Claude/.test(f2.textContent)) bad.push('the admin’s box does not say theirs goes to Notes for Claude');
  f2.querySelector('textarea').value = 'answer is 15';
  t.ACTIONS['rep-send'](f2.querySelector('[data-do="rep-send"]'));
  await wait(300);
  if (!/to change/.test(w.cardRow_(x))) bad.push('a marked question’s tile does not say "to change"');
  host.remove();
  t.USER(KID);
  if (/data-reports/.test((w.bizPages_() || []).join(''))) bad.push('a child’s Business column draws the Suggestions card');
  if (sent.some(b => b.action === 'listSuggestions')) bad.push('a child’s phone asked for listSuggestions');
  t.USER(HAL);
  const biz = d.createElement('div');
  biz.innerHTML = w.siteBizPages_().join('');
  d.body.appendChild(biz);
  w.reportsStart_();
  await wait(300);
  const card = biz.querySelector('[data-reports]');
  if (!card) bad.push('an admin’s Site column has no Suggestions card');
  else {
    if (!/^\s*Suggestions/.test(card.querySelector('h3').textContent) || /Report/.test(card.textContent)) bad.push('the card is not called Suggestions, or still says Report: ' + JSON.stringify(card.textContent.replace(/\s+/g, ' ').slice(0, 120)));
    const conf = card.querySelector('.rep-item[data-id="N-1-1"] [data-do="rep-status"][data-decision="confirm"]');
    if (!conf || !card.querySelector('.rep-item[data-id="N-1-1"] [data-do="rep-status"][data-decision="dismiss"]')) bad.push('a suggestion has no Confirm or Dismiss');
    if (conf) {
      t.ACTIONS['rep-status'](conf);
      await wait(300);
      if (!sent.some(b => b.action === 'decideSuggestion' && b.id === 'N-1-1' && b.decision === 'confirm')) bad.push('Confirm sent nothing');
      if (card.querySelector('.rep-item[data-id="N-1-1"]')) bad.push('Confirm left the suggestion waiting on the card');
      t.ACTIONS['rep-status'](card.querySelector('.rep-item[data-id="N-2-2"] [data-do="rep-status"][data-decision="dismiss"]'));
      await wait(300);
      if (card.querySelector('.rep-item[data-id="N-2-2"]')) bad.push('Dismiss left the suggestion on the card');
    }
  }
  biz.remove();
  lib.put();
  return bad;
});

/* ---------- ROUND THREE OF THE OWNER'S NOTES (498) ---------- */
check('Suggest a change takes the place of its thing on every kind -- a widget, a Find card, a column card, a history card -- and gives it back on Cancel; the padlock is in each one row; a Find note carries its path; no notes or Done tile are listed', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER({ name: 'Hal Admin', personId: 'P1', role: 'admin', roles: ['admin'], token: 'tok-P1', handle: 'hl2026' });
  const wgt = (w.allWidgets ? w.allWidgets() : []).find(x => x && x.id === 'verse') || (w.allWidgets ? w.allWidgets() : []).find(x => x && x.kind === 'tool');
  const ct = { kind: 'figure', hdb: true, key: 'hdb:FIG-N4', name: 'A figure', sub: '1874–1965', histKind: 'Historical figures', subject: 'History',
    row: { id: 'FIG-N4', name: 'A figure', born_year: 1874, died_year: 1965, sources: 'https://a.example.org | https://b.example.org' } };
  const kinds = [
    ['a widget', wgt ? w.widgetOnColumn_(wgt, true) : ''],
    ['a Find card', w.stuffCard(ct)],
    ['a column card', '<div class="card"><h3>Every parent</h3><p>Ann</p></div>' + w.cardReportRow_('ppl:parents:all', '<div class="card"><h3>Every parent</h3></div>')],
  ];
  const stuff = d.getElementById('s-stuff');
  for (const [say, html] of kinds) {
    if (!html) { bad.push(say + ' could not be drawn, so it was NOT checked'); continue; }
    const host = d.createElement('div');
    host.className = 'pane';
    host.innerHTML = html;
    (say === 'a Find card' && stuff ? stuff : d.body).appendChild(host);
    const tile = host.querySelector('[data-do="rep-box"]');
    if (!tile) { bad.push(say + ' has no Suggest tile'); host.remove(); continue; }
    if (!tile.closest('.tile-row').querySelector('.game-lock')) bad.push(say + ': the padlock is not in its one tile row');
    if (say === 'a Find card' && (host.querySelectorAll('.tile-row').length !== 1 || host.querySelectorAll('[aria-label^="Source"]').length > 1)) bad.push('a history card’s tiles are not one row with one Source');
    t.ACTIONS['rep-box'](tile);
    await wait(10);
    const box = host.querySelector('.rep-box');
    if (!box) { bad.push(say + ': no box'); host.remove(); continue; }
    const inPlace = (box.parentElement.classList.contains('is-writing')) || (box.classList.contains('is-beside') && tile.closest('.tile-row').hidden);
    if (!inPlace) bad.push(say + ': the box went under the thing, not in its place');
    if (box.querySelector('.ncl-list, [data-do="ncl-done"]')) bad.push(say + ': the box still lists notes or a Done tile');
    if (!box.querySelector('[data-do="rep-pic"]') || !box.querySelector('input[type=file].rep-pic-in[accept^="image/*"]')) bad.push(say + ': no Add a picture tile');
    if (say === 'a Find card' && !/^Find/.test(box.dataset.path || '')) bad.push('a Find card’s box carries no funnel path: ' + JSON.stringify(box.dataset.path));
    t.ACTIONS['rep-cancel'](box.querySelector('[data-do="rep-cancel"]'));
    await wait(10);
    if (host.querySelector('.rep-box') || host.querySelector('[hidden].tile-row') || host.querySelector('.is-writing')) bad.push(say + ': Cancel did not give the thing back');
    host.remove();
  }
  if (typeof w.noteListHtml_ === 'function') bad.push('noteListHtml_ is still drawn: no notes listed on the site (498)');
  return bad;
});

/* ---------- FILES FOR CLAUDE (515): "allow me to add folders and PDFs to Suggest a change" ---------- */
check('Suggest a change takes files and a folder from an admin and not a student; the files go one at a time in parts with progress, a failed part is retried, a folder keeps its paths, and the note names them', async () => {
  const ups = [];
  let failOnce = true;
  const reply = b => {
    if (b.action === 'suggestUpload') {
      ups.push(b);
      if (failOnce && /b\.py$/.test(b.rel)) { failOnce = false; return { error: 'Drive refused that part (500).' }; }
      const end = b.start + Math.floor(b.data.length * 3 / 4) - (b.data.match(/=*$/)[0].length);
      return end >= b.size ? { success: true, done: true, id: 'F' + ups.length } : { success: true, next: end };
    }
    return b.action === 'suggest' ? { success: true, serious: true, notes: [] } : { success: true, messages: [] };
  };
  const { w, sent } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  const open = () => {
    const host = d.createElement('div');
    host.className = 'pane';
    host.innerHTML = '<div class="card"><h3>Past papers</h3></div>' + w.cardReportRow_('ppl:parents:all', '<div class="card"><h3>Past papers</h3></div>');
    d.body.appendChild(host);
    const tile = host.querySelector('[data-do="rep-box"]');
    if (tile) t.ACTIONS['rep-box'](tile);
    return { host, box: host.querySelector('.rep-box') };
  };
  t.USER({ name: 'Ada Pupil', personId: 'P7', role: 'student', roles: ['student'], token: 'tok-P7', handle: 'aa2026' });
  let o = open();
  if (!o.box) bad.push('a student has no box, so the student side was NOT checked');
  else if (o.box.querySelector('[data-do="rep-files"], [data-do="rep-dir"], .rep-files-in')) bad.push('a student is offered Add files or Add a folder');
  else if (!o.box.querySelector('[data-do="rep-pic"]')) bad.push('a student lost Add a picture');
  o.host.remove();
  t.USER({ name: 'Hal Admin', personId: 'P1', role: 'admin', roles: ['admin'], token: 'tok-P1', handle: 'hl2026' });
  /* JSDOM, LIKE IPHONE SAFARI, CANNOT PICK A FOLDER: the box says so and offers files; then the property is given, as Chrome has it. */
  o = open();
  if (!o.box || o.box.querySelector('[data-do="rep-dir"]') || !/iPhone/.test((o.box.querySelector('.rep-no-dir') || {}).textContent || '') || !o.box.querySelector('[data-do="rep-files"]')) bad.push('where a folder cannot be picked, the box does not say so and offer files');
  o.host.remove();
  Object.defineProperty(w.HTMLInputElement.prototype, 'webkitdirectory', { value: false, writable: true, configurable: true });
  o = open();
  const box = o.box;
  if (!box) return bad.concat('an admin has no box');
  const inF = box.querySelector('input.rep-files-in[type=file][multiple]'), inD = box.querySelector('input.rep-dir-in[type=file]');
  /* ANY KIND OF FILE (547): no `accept` list on either picker, so a .py goes as a PDF does. */
  if (!box.querySelector('[data-do="rep-files"]') || !inF) bad.push('an admin has no Add files');
  else if (inF.getAttribute('accept') || inD && inD.getAttribute('accept')) bad.push('Add files only takes some kinds of file: accept="' + (inF.getAttribute('accept') || inD.getAttribute('accept')) + '"');
  if (!box.querySelector('[data-do="rep-dir"]') || !inD || !inD.hasAttribute('webkitdirectory')) bad.push('an admin has no Add a folder');
  const BIG = 9 * 1048576;
  const mk = (name, size, rel, type) => { const f = new w.File([new Uint8Array(size)], name, { type: type || 'application/pdf' }); Object.defineProperty(f, 'webkitRelativePath', { value: rel }); return f; };
  const files = [mk('a.pdf', 1000, 'Edexcel 2023/June/a.pdf'), mk('b.py', 2000, 'Edexcel 2023/June/b.py', 'text/x-python'), mk('big.pdf', BIG, 'Edexcel 2023/Nov/big.pdf')];
  Object.defineProperty(inD, 'files', { value: files, configurable: true });
  inD.dispatchEvent(new w.Event('change', { bubbles: true }));
  if (box.querySelectorAll('.rep-file').length !== 3) bad.push('the chosen folder lists ' + box.querySelectorAll('.rep-file').length + ' files, wanted 3');
  if (!/0 of 3 files sent/.test((box.querySelector('.rep-file-total') || {}).textContent || '')) bad.push('no total before sending: ' + JSON.stringify((box.querySelector('.rep-file-total') || {}).textContent));
  t.ACTIONS['rep-send'](box.querySelector('[data-do="rep-send"]'));
  for (let i = 0; i < 100 && !sent.some(b => b.action === 'suggest'); i++) await wait(100);
  const order = ups.map(u => u.rel + '@' + u.start);
  const want = ['June/a.pdf@0', 'June/b.py@0', 'June/b.py@0', 'Nov/big.pdf@0', 'Nov/big.pdf@' + 8 * 1048576];
  if (!ups.some(u => u.rel === 'June/b.py' && u.mime === 'text/x-python')) bad.push('the .py file did not go with its own type');
  if (order.join() !== want.join()) bad.push('the parts went ' + JSON.stringify(order) + ', wanted ' + JSON.stringify(want));
  if (ups.some(u => u.batch !== 'Edexcel 2023' || u.action !== 'suggestUpload')) bad.push('a part was not in the batch named after the folder');
  if (ups.some(u => u.data.length > 11300000)) bad.push('a part is larger than the backend takes');
  const note = sent.find(b => b.action === 'suggest');
  if (!note) bad.push('no note was sent after the files');
  else if (!note.files || note.files.batch !== 'Edexcel 2023' || note.files.count !== 3 || note.files.names.join() !== 'June/a.pdf,June/b.py,Nov/big.pdf') bad.push('the note does not name the files: ' + JSON.stringify(note.files));
  o.host.remove();
  return bad;
});

/* ---------- A VIDEO GOES WITH ITS FRAMES (640): "so Claude can see problems that happen over time" ---------- */
check('Suggest a change takes a video from the camera roll: it is sent in parts, and the phone makes timestamped frame sheets and a small copy that go beside it; when frames cannot be made the video still goes and the box says so', async () => {
  const ups = [];
  const reply = b => {
    if (b.action === 'suggestUpload') {
      ups.push(b);
      const end = b.start + Math.floor(b.data.length * 3 / 4) - (b.data.match(/=*$/)[0].length);
      return end >= b.size ? { success: true, done: true, id: 'F' + ups.length } : { success: true, next: end };
    }
    return b.action === 'suggest' ? { success: true, serious: true, notes: [] } : { success: true, messages: [] };
  };
  const { w, sent } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  /* JSDOM PLAYS NO VIDEO AND DRAWS NO CANVAS: a stubbed <video> (3 s, 640x360, seeks answer) and a canvas that counts what is drawn. */
  let drawn = 0;
  const stamps = [];
  w.URL.createObjectURL = f => 'blob:' + f.name; w.URL.revokeObjectURL = () => {};
  const P = w.HTMLMediaElement.prototype, V = w.HTMLVideoElement.prototype;
  Object.defineProperty(P, 'duration', { get() { return 3; }, configurable: true });
  Object.defineProperty(V, 'videoWidth', { get() { return 640; }, configurable: true });
  Object.defineProperty(V, 'videoHeight', { get() { return 360; }, configurable: true });
  Object.defineProperty(P, 'src', { set(v) { this._src = v; setTimeout(() => this.dispatchEvent(new w.Event(/broken/.test(v) ? 'error' : 'loadeddata')), 1); }, get() { return this._src || ''; }, configurable: true });
  Object.defineProperty(P, 'currentTime', { set(v) { this._t = v; setTimeout(() => this.dispatchEvent(new w.Event('seeked')), 1); }, get() { return this._t || 0; }, configurable: true });
  P.load = () => {};
  w.HTMLCanvasElement.prototype.getContext = () => ({ fillRect() {}, fillText(s) { stamps.push(s); }, measureText: s => ({ width: s.length * 8 }),
    drawImage(src) { if (src instanceof w.HTMLVideoElement) drawn++; } });
  w.HTMLCanvasElement.prototype.toDataURL = function () { return 'data:image/jpeg;base64,' + 'A'.repeat(Math.min(100000, this.width * 10)); };
  t.USER({ name: 'Hal Admin', personId: 'P1', role: 'admin', roles: ['admin'], token: 'tok-P1', handle: 'hl2026' });
  const host = d.createElement('div');
  host.className = 'pane';
  host.innerHTML = '<div class="card"><h3>Past papers</h3></div>' + w.cardReportRow_('ppl:parents:all', '<div class="card"><h3>Past papers</h3></div>');
  d.body.appendChild(host);
  t.ACTIONS['rep-box'](host.querySelector('[data-do="rep-box"]'));
  const box = host.querySelector('.rep-box');
  if (!box) return ['an admin has no box'];
  const said = () => (box.querySelector('.rep-vid-said') || {}).textContent || '';
  const pic = box.querySelector('input.rep-pic-in');
  if (!pic || pic.getAttribute('accept') !== 'image/*,video/*') bad.push('the camera roll picker does not offer videos: accept=' + JSON.stringify(pic && pic.getAttribute('accept')));
  const vid = new w.File([new Uint8Array(9 * 1048576)], 'IMG_0001.MOV', { type: 'video/quicktime' });
  Object.defineProperty(pic, 'files', { value: [vid], configurable: true });
  pic.dispatchEvent(new w.Event('change', { bubbles: true }));
  const row = box.querySelector('.rep-vid');
  if (!row || !row.querySelector('.loading') || !/making its frames/.test(said())) bad.push('no tile says the video is attached, with the dots, while its frames are made');
  for (let i = 0; i < 100 && /making/.test(said()); i++) await wait(20);
  if (!/6 frames on 1 sheet/.test(said())) bad.push('the frames were not made: ' + JSON.stringify(said()));
  if (box.querySelector('.rep-vid .loading')) bad.push('the dots stayed after the frames were made');
  if (drawn < 6 || !stamps.includes('0:00.0') || !stamps.includes('0:02.5')) bad.push('the frames were not drawn and stamped every half second: ' + drawn + ' ' + JSON.stringify(stamps));
  /* AND ONE THE BROWSER CANNOT PLAY. */
  const broken = new w.File([new Uint8Array(500)], 'broken.mp4', { type: 'video/mp4' });
  Object.defineProperty(pic, 'files', { value: [broken], configurable: true });
  pic.dispatchEvent(new w.Event('change', { bubbles: true }));
  await wait(100);
  if (!/broken\.mp4 · video attached · no frames: this browser cannot play that video\. The video still goes\./.test(box.querySelector('.rep-vids').textContent)) bad.push('a video without frames is not said plainly before sending');
  t.ACTIONS['rep-send'](box.querySelector('[data-do="rep-send"]'));
  for (let i = 0; i < 100 && !sent.some(b => b.action === 'suggest'); i++) await wait(50);
  const rels = ups.map(u => u.rel + '@' + u.start);
  const want = ['IMG_0001.MOV@0', 'IMG_0001.MOV@' + 8 * 1048576, 'IMG_0001.frames-1.jpg@0', 'IMG_0001.small.jpg@0', 'broken.mp4@0'];
  if (rels.join() !== want.join()) bad.push('the uploads went ' + JSON.stringify(rels) + ', wanted ' + JSON.stringify(want));
  if (ups.some(u => /\.jpg$/.test(u.rel) && (u.mime !== 'image/jpeg' || u.size > 150 * 1024))) bad.push('a frame sheet is not a JPEG under 150 KB');
  if (!ups.some(u => u.rel === 'IMG_0001.MOV' && u.mime === 'video/quicktime')) bad.push('the video did not go with its own type');
  const note = sent.find(b => b.action === 'suggest');
  if (!note || !note.files || note.files.names.join() !== 'IMG_0001.MOV,broken.mp4') bad.push('the note does not name the videos: ' + JSON.stringify(note && note.files));
  host.remove();
  return bad;
});

/* ---------- THE LIBRARY'S WORDS COME FROM THE LEDGER (397) ----------------------------------------------- */
/* A PAPER AS THE REPOSITORY HOLDS IT NOW: each row's private fields taken off and named in `lib_has` (tools/lib-private.js's split). */
const LIB_PID = 'RS1786302107764-503';
function libSlimRows_(rows) {
  const def = LIB_FULL.defs().files.questions;
  return rows.map(r => {
    const c = LIB_FULL.privateOf(def, r);
    if (!c) return r;
    const out = {};
    Object.keys(r).forEach(k => { if (!(k in c)) out[k] = r[k]; });
    out.lib_has = def.private.filter(f => String(c[f] == null ? '' : c[f]).trim() !== '').join(' ');
    return out;
  });
}
/* `libItems` ANSWERED FROM THE WHOLE ROWS, as the backend answers from the Ledger. */
function libReply_(full, ids) {
  const def = LIB_FULL.defs().files.questions, items = {}, missing = [];
  (ids || []).forEach(t => {
    const r = full.find(x => 'q:' + x.row_id === t);
    const c = r && LIB_FULL.privateOf(def, r);
    if (c) items[t] = c; else missing.push(t);
  });
  return { success: true, items: items, missing: missing, refused: [], left: 390, cap: 400 };
}
async function libFindAt_(W, rowId) {
  for (let i = 0; i < 100 && !(typeof W.stuffItemsAll_ === 'function' && W.stuffItemsAll_().some(x => x.row && x.row.row_id === rowId)); i++) await wait(50);
  const x = W.stuffItemsAll_().find(it => it.row && it.row.row_id === rowId);
  if (!x) return null;
  const S = W.__t.STUFF();
  S.filters = [{ field: 'paperId', value: LIB_PID }];
  /* THE PAPER'S CHIP STILL ASKS, so its cards are shown as the reveal tile shows them (`findDone_`). */
  W.findShow_();
  W.__t.go('stuff');
  W.paintStuff();
  const i = W.stuffPages_().findIndex(pg => pg.x === x);
  W.__t.goPage('stuff', W.stuffFirstResult_() + i, true);
  await wait(250);
  return x;
}
/* WAIT FOR THE ASK, not a fixed sleep: the pump waits on the device's copy first, which a loaded machine makes slower than 250 ms. */
async function libAskWent_(one, ok) {
  const went = () => one.sent.some(b => b.action === 'libItems' && ok(b));
  for (let i = 0; i < 80 && !went(); i++) await wait(50);
  return went();
}
const libFront_ = W => {
  const host = W.document.getElementById('s-stuff');
  return host && host.querySelectorAll(':scope > .page')[W.__t.domIndex('stuff', pg_(W.__t).stuff || 0)];
};

check('a question whose words are in the Ledger: drawn waiting, asked for with its stems and parts, then whole on its first page — and the next few asked for ahead', async () => {
  const full = LIB_FULL.rows('questions').filter(r => r.paper_id === LIB_PID);
  if (full.length < 10) return ['the paper ' + LIB_PID + ' is not in the library — nothing was checked'];
  const slim = libSlimRows_(full);
  let release = null;
  const held = [];
  const one = boot({ serve: url => (/data\/questions\.json/.test(url) ? slim : undefined), before: signedInAs_(ANS_ADA),
    reply: b => (b.action === 'libItems' ? new Promise(ok => { held.push(() => ok(libReply_(full, b.ids))); if (release) release(); }) : undefined) });
  const W = one.w, bad = [];
  const x = await libFindAt_(W, 'Q-9MA031-2206-1a');
  if (!x) return ['Q-9MA031-2206-1a did not come through the loader into Find — nothing was checked'];
  const front = libFront_(W);
  if (!front || !front.querySelector('.lib-wait .loading')) bad.push('the card in front is not drawn waiting with the one loader: ' + (front ? front.textContent.replace(/\s+/g, ' ').slice(0, 120) : 'no page'));
  if (front && /George throws a ball/.test(front.textContent)) bad.push('the stem\'s words are on the page before they were sent');
  await libAskWent_(one, () => true);
  const asks = one.sent.filter(b => b.action === 'libItems');
  if (!asks.length) bad.push('no libItems request went for the card in front');
  else {
    const ids = asks[0].ids || [];
    ['q:Q-9MA031-2206-1a', 'q:Q-9MA031-2206-1', 'q:Q-9MA031-2206-1b'].forEach(id => { if (ids.indexOf(id) === -1) bad.push('the first ask did not carry ' + id + ' (it carried ' + ids.join(', ') + ')'); });
    if (ids.length > 60) bad.push('one ask carried ' + ids.length + ' ids — the backend refuses more than 60');
    if (asks[0].token !== 'tok-P7') bad.push('the ask went without the token');
  }
  held.splice(0).forEach(f => f());
  await wait(400);
  held.splice(0).forEach(f => f());
  await wait(400);
  const pages = W.stuffPages_().filter(pg => pg.x === x).map(pg => pg.part || 'card');
  /* ONE CARD PER QUESTION NUMBER (960): Q1 is the one page 'q', its stem drawn once at the top */
  if (pages.join() !== 'q') bad.push('Q1(a)\'s pages once its words came are ' + pages.join() + ' — wanted q (960)');
  const now = libFront_(W);
  const at = W.stuffPages_()[(pg_(W.__t).stuff || 0) - W.stuffFirstResult_()];
  if (!at || at.x !== x || at.part !== 'q') bad.push('the column did not land on Q1\'s card (on ' + (at ? (at.x.name + ' ' + at.part) : 'nothing') + ')');
  if (!now || !/George throws a ball/.test(now.textContent) || now.querySelector('.lib-wait')) bad.push('the page in front does not show the stem\'s words: ' + (now ? now.textContent.replace(/\s+/g, ' ').slice(0, 120) : 'no page'));
  const row = full.find(r => r.row_id === 'Q-9MA031-2206-1a');
  if (x.accept !== row.accept || x.answer !== row.answer || x.html !== row.html) bad.push('the item was not given its words, answer and marking rules in place');
  const later = one.sent.filter(b => b.action === 'libItems').some(b => (b.ids || []).some(id => /^q:Q-9MA031-2206-[2-9]/.test(id)));
  if (!later) bad.push('nothing past Q1 was asked for ahead');
  if (one.errs.length) bad.push('errors: ' + one.errs.join(' | '));
  /* SIGNED OUT, THE WORDS GO WITH THE PERSON. */
  W.signedOut_();
  /* `x.row` IS THE FILE'S OWN ROW, which the words were put back on — and taken off again. */
  const raw = x.row;
  if (!raw || raw.html || !raw.lib_has) bad.push('after sign-out the row still holds its words: ' + JSON.stringify(raw).slice(0, 160));
  return bad;
});

check('signed out, a question whose words are in the Ledger is not on Find at all, and nothing is asked for', async () => {
  /* SIGNED OUT, FIND OFFERS ONLY SETTINGS (owner, 7 Nov, docs/rules.md 5.1; `findSignedOut_`): no question card, waiting or whole */
  const full = LIB_FULL.rows('questions').filter(r => r.paper_id === LIB_PID);
  const one = boot({ serve: url => (/data\/questions\.json/.test(url) ? libSlimRows_(full) : undefined) });
  const W = one.w, bad = [];
  for (let i = 0; i < 100 && !(typeof W.stuffItemsAll_ === 'function' && W.stuffItemsAll_().some(x => x.row && x.row.paper_id === LIB_PID)); i++) await wait(50);
  if (!W.stuffItemsAll_().some(x => x.row && x.row.paper_id === LIB_PID)) return ['the paper ' + LIB_PID + ' did not load — nothing was checked'];
  if (W.__t.whoami()) return ['the app opened signed in — signed OUT was NOT checked'];
  W.__t.STUFF().filters = [{ field: 'paperId', value: LIB_PID }];
  W.paintStuff();
  await wait(300);
  const shown = W.stuffPages_().filter(pg => pg.x && pg.x.kind === 'question');
  if (shown.length) bad.push('signed out, Find still draws ' + shown.length + ' question page(s)');
  const host = W.document.getElementById('s-stuff');
  if (host && host.querySelector('.lib-wait, .qwhole')) bad.push('signed out, a question card is on Find');
  if (one.sent.some(b => b.action === 'libItems')) bad.push('a signed-out phone asked for libItems');
  return bad;
});

check('the Ledger not answering keeps the card\'s words — "Couldn’t load this" and Try again — and Try again draws it whole', async () => {
  const full = LIB_FULL.rows('questions').filter(r => r.paper_id === LIB_PID);
  let fail = true;
  const one = boot({ serve: url => (/data\/questions\.json/.test(url) ? libSlimRows_(full) : undefined), before: signedInAs_(ANS_ADA),
    reply: b => (b.action === 'libItems' ? (fail ? { error: 'The library is still being copied into the Ledger — try again in a few minutes.', why: 'lib-not-ready' } : libReply_(full, b.ids)) : undefined) });
  const W = one.w, bad = [];
  const x = await libFindAt_(W, 'Q-9MA031-2206-2a');
  if (!x) return ['Q-9MA031-2206-2a did not come into Find — nothing was checked'];
  await wait(300);
  let front = libFront_(W);
  const said = front && front.querySelector('.lib-wait .lib-say');
  if (!said || !/Couldn’t load this/.test(said.textContent) || !/still being copied/.test(said.textContent)) bad.push('the waiting card does not say why: ' + (said ? said.textContent.replace(/\s+/g, ' ') : 'none'));
  const n = one.sent.filter(b => b.action === 'libItems').length;
  await wait(300);
  if (one.sent.filter(b => b.action === 'libItems').length !== n) bad.push('a failed ask was asked again by itself, without Try again');
  fail = false;
  const again = front && front.querySelector('[data-do="lib-retry"]');
  if (!again) bad.push('there is no Try again on the card');
  else again.click();
  await wait(600);
  front = libFront_(W);
  if (!front || front.querySelector('.lib-wait') || !/manufacturer/i.test(front.textContent)) bad.push('Try again did not draw the question whole: ' + (front ? front.textContent.replace(/\s+/g, ' ').slice(0, 120) : 'no page'));
  return bad;
});


/* ---------- A WORD BANK'S BLANKS MARK BY RULE (owner, 12 Nov: "Chemical, kinetic" went to the AI) ---------- */
check('a word bank with blanks marks by rule, never the AI: the cyclist part is cells, and "Chemical, kinetic" in one box marks both', async () => {
  const row = LIB_FULL.rows('questions').find(r => r.row_id === 'Q-W-AT-P-energy-2a');
  if (!row) return ['Q-W-AT-P-energy-2a is not in the library — NOT checked'];
  const { w } = boot();
  await wait(300);
  const bad = [];
  if (typeof w.qtMarker_ !== 'function' || typeof w.markCells_ !== 'function') return ['qtMarker_ or markCells_ not reachable — NOT checked'];
  if (w.qtMarker_(row) !== 'cells') bad.push('the cyclist part is marked by ' + w.qtMarker_(row) + ', not its cells');
  const cs = w.cellsOf_(row);
  const m = (v) => w.markCells_(v, cs);
  [[['Chemical, kinetic'], 2], [['chemical and Kinetic', ''], 2], [['CHEMICAL', 'kinetic'], 2], [['kinetic, chemical'], 0], [['chemical'], 1]]
    .forEach(([v, want]) => { const got = m(v).right; if (got !== want) bad.push(JSON.stringify(v) + ' marked ' + got + ' right, wanted ' + want); });
  return bad;
});
