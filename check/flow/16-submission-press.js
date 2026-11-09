/* ---------- NO DOOR ROWS (387), AND SINCE 396 NO TAG THAT IS NEVER ASKED: one question at a time, by one rule, all the way down */
check('no tag-door rows anywhere: a chosen paper goes on to ask Question by the same rule, Question and Part wait for a paper, and a sub-part reads ii as its card tag does', async () => {
  const PID = 'RS1786302107764-415';
  const rows = LIB_FULL.rows('questions').filter(r => r.paper_id === PID || r.paper_id === 'P-CBM-5AD-F-0601');
  /* SIGNED IN: signed out, Find holds Settings alone (owner, 7 Nov) */
  const { w } = boot({ member: true, serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  for (let i = 0; i < 60 && !(typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().some(x => x.row && x.row.paper_id === PID)); i++) await wait(50);
  const t = w.__t, d = w.document, bad = [];
  const OWN = ['qNumber', 'qPart', 'qSub', 'qPage', 'qPages', 'marks'];
  if (typeof w.stuffQuestion !== 'function') return ['stuffQuestion not reachable — the doors were NOT checked'];
  if (typeof w.tagDoors_ === 'function') bad.push('tagDoors_ is back — the owner asked for no door rows (387)');
  if (typeof w.paperEnd_ === 'function' || typeof w.funnelEnded_ === 'function') bad.push('a paper ends the funnel again (paperEnd_/funnelEnded_) — since 396 the one rule goes on asking inside it');
  /* ORDINARY FACETS: a field, a label and the readers, nothing that says "never ask me". */
  OWN.forEach(f => { const facet = t.facetBy(f); const extra = facet ? Object.keys(facet).filter(k => ['field', 'label', 'of', 'tagOf', 'showOf', 'at'].indexOf(k) < 0) : ['(missing)']; if (extra.length) bad.push('`' + f + '` carries ' + extra.join(', ') + ' — it must be an ordinary facet'); });
  const S = t.STUFF();
  S.filters = [];   const asked = [], papersAt = [];
  for (let i = 0; i < 30; i++) {
    const list = w.stuffFiltered();
    const f = w.nextFacet(list) || w.overFacet_(list);
    if (!f) break;
    asked.push(f.field);
    papersAt.push([f.field, new Set(list.map(x => x.row && x.row.paper_id).filter(Boolean)).size]);
    /* THE BIGGEST ANSWER, so the walk keeps a list to go on asking: Function is asked before Paper since 529, and its first answer is the two unverified parts */
    const v = w.facetValues(list, f).slice().sort((a, b) => (b.n || 0) - (a.n || 0))[0];
    if (!v) break;
    S.filters.push({ field: f.field, value: v.value });
  }
  /* THE ONE RULE HOLDS A QUESTION'S OWN FACTS BACK UNTIL THE LIST IS ONE PAPER — chosen, or the only one left. */
  const early = papersAt.filter(([f, n]) => OWN.indexOf(f) >= 0 && n !== 1);
  if (early.length) bad.push('the funnel walked from nothing asked ' + early.map(([f, n]) => f + ' over ' + n + ' papers').join(', ') + ' (' + asked.join(' → ') + ')');
  if (!asked.some(f => OWN.indexOf(f) >= 0)) bad.push('the walk never reached a question\'s own facts, so they were NOT shown to be asked inside a paper (' + asked.join(' → ') + ')');
  if (!asked.length) bad.push('the funnel asked nothing, so the walk proves nothing');
  const h = d.createElement('div');
  d.body.appendChild(h);
  const look = (filters, who) => {
    S.filters = filters;
    h.innerHTML = w.stuffQuestion();
    if (h.querySelector('.tag-door, .tag-answers')) bad.push(who + ' draws a door row');
    const fields = [...h.querySelectorAll('[data-do="facet-pick"]')].map(e => e.getAttribute('data-field'));
    if (new Set(fields).size > 1) bad.push(who + ' offers ' + [...new Set(fields)].join(', ') + ' at once — one question at a time');
    return fields;
  };
  if (look([], 'the first screen').indexOf('required') >= 0) bad.push('the first screen asks Required before Practicals is chosen');
  /* WHICH FIRST (660): a kind question is asked inside a paper however lopsided, then Question. */
  let inPaper = look([{ field: 'paperId', value: PID }], 'the chosen paper');
  if (inPaper[0] === 'kindOwn') inPaper = look([{ field: 'paperId', value: PID }, { field: 'kindOwn', value: 'Questions' }], 'the chosen paper, Questions');
  if (inPaper[0] !== 'qNumber') bad.push('with the paper chosen the funnel asks ' + (inPaper[0] || 'nothing') + ', not Question — a paper is not an end since 396: ' + h.textContent.replace(/\s+/g, ' ').trim().slice(0, 80));
  look([{ field: 'fiveDay', value: '1 June' }], 'a 5-a-day chosen by its Day');
  /* THE WORD ON THE CARD: a sub-part's answer is `ii`, never `Ii`. */
  S.filters = [];
  const items = w.stuffItemsAll_().filter(x => x.kind === 'question');
  const subs = w.facetValues(items, t.facetBy('qSub')).map(v => v.value);
  const parts = w.facetValues(items, t.facetBy('qPart')).map(v => v.value);
  subs.concat(parts).forEach(v => { if (v !== String(v).toLowerCase() && !/^\./.test(v)) bad.push('a part/sub-part answer reads "' + v + '" — the card tag says it lower-case'); });
  h.remove();
  return bad;
});

/* ---------- REQUIRED IS AN ORDINARY QUESTION, ASKED ONLY ONCE PRACTICALS IS CHOSEN (387) */
check('Required is never on the first screen, and is the funnel\'s own question once Practicals is chosen', async () => {
  const one = boot({});
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable — Required was NOT checked'];
  const prac = LIB_FULL.rows('practicals');
  const p = payload();
  p.practicals = JSON.parse(JSON.stringify(one.w.libraryExtras_({}, { practicals: prac }))).practicals || [];
  const { w } = boot({ member: true, payload: p });
  for (let i = 0; i < 100 && !(typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().some(x => x.kind === 'practical')); i++) await wait(50);
  const t = w.__t, S = t.STUFF(), bad = [];
  if (!w.stuffItemsAll_().some(x => x.kind === 'practical')) return ['no practicals loaded — Required was NOT checked'];
  const f = t.facetBy('required');
  if (!f || f.tagOnly) bad.push('`required` is missing or tagOnly — it must be an ordinary funnel question');
  S.filters = [];   const first = w.nextFacet(w.stuffFiltered());
  if (first && first.field === 'required') bad.push('the first screen asks Required');
  {
    S.filters = [{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Practicals' }];
    if (!w.stuffFiltered().length) bad.push('the Practicals chip leaves nothing');
    const seen = [];
    for (let i = 0; i < 10; i++) {
      const list = w.stuffFiltered(), n = w.nextFacet(list);
      if (!n) break;
      seen.push(n.field);
      if (n.field === 'required') break;
      /* "Doesn't matter" to each question before it, as a tutor after every practical would answer. */
      S.filters.push({ field: n.field, any: true });
    }
    if (seen.indexOf('required') < 0) bad.push('after Practicals the funnel never asks Required (' + seen.join(' → ') + ')');
  }
  S.filters = [];
  return bad;
});

/* ---------- NO LINE UNDER ANY DRAWING SAYS WHO DREW IT, ON ANY PAGE OF THE LIBRARY (docs/history/355) § */
check('no line under any drawing says who drew it: not on one page of the library, and the code that said it is gone', async () => {
  const rows = LIB_FULL.rows('questions');
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  for (let i = 0; i < 200 && !(typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().filter(x => x.kind === 'question').length > 5000); i++) await wait(50);
  const bad = [];
  const CRED = /redrawn|not the paper.s own|drawn (by|for) @family|your marks from|the marks are yours|marks are yours from/i;
  const need = ['pageParts_', 'stuffPart_', 'stuffCard', 'figsBefore_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — the credits were NOT looked for'];
  const qs = w.stuffItemsAll_().filter(x => x.kind === 'question');
  if (qs.length < 5000) return ['only ' + qs.length + ' questions reached Find — the library was NOT read'];
  const strip = h => String(h || '').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&rsquo;/g, '’').replace(/&[a-z]+;/g, ' ');
  let pages = 0;
  const hits = [];
  qs.forEach(x => {
    let parts = [];
    try { parts = w.pageParts_(x); } catch (e) { hits.push(x.row.row_id + ': pageParts_ threw ' + e.message); return; }
    parts.forEach(p => {
      pages++;
      let html = '';
      try { html = p ? w.stuffPart_(x, p) : w.stuffCard(x, 0); } catch (e) { hits.push(x.row.row_id + ':' + p + ' threw ' + e.message); return; }
      if (CRED.test(strip(html)) || /class="fig-by"/.test(html)) hits.push(x.row.row_id + ':' + (p || 'card') + ' says "' + (strip(html).match(CRED) || ['fig-by'])[0] + '"');
    });
    try { w.figsBefore_(x).forEach(f => { if (CRED.test(strip(f.html)) || CRED.test(f.label || '')) hits.push(x.row.row_id + "'s Figure sheet says it"); }); } catch (e) { /* no sheet */ }
  });
  if (hits.length) bad.push(hits.length + ' page(s) carry a credit or a whose-marks line: ' + hits.slice(0, 5).join('; '));
  const src = require('../tools/find-src.js').findSrc() + fs.readFileSync(path.join(dir, 'library.js'), 'utf8');
  ['FIG_BY', 'figCredit_', 'padCredit_', 'usesSaid_', 'FIG_CARD', 'usesHead_'].forEach(n => {
    if (new RegExp('\\b(const|let|var|function)\\s+' + n + '\\b').test(src)) bad.push(n + ' is still declared — the credit is hidden, not deleted');
  });
  if (/diagramBy\s*:/.test(src)) bad.push('`diagram_by` is still read into an item (`diagramBy:`) — nothing on screen may read it');
  if (!hits.length) console.log('          ' + pages + ' pages of ' + qs.length + ' questions read, none with a credit');
  return bad;
});

/* EVERY ANSWER SENT IS AN EVENT, AND THE CARD SAYS HOW THE LATEST ONE WENT. § */
/* A BACKEND THAT KEEPS SUBMISSIONS, as `submissionsAppend_` does: § */
const subBackend_ = (rows, more) => b => {
  const own = more ? more(b) : undefined;
  if (own !== undefined) return own;
  if (b.action !== 'submitAnswer') return undefined;
  const saved = {};
  (b.items || []).forEach(it => {
    const had = rows.find(r => r.pid === b.personId && r.id === it.id);
    if (had) { saved[it.id] = { key: had.key, verdict: had.verdict, at: had.at }; return; }
    const r = { pid: b.personId, id: it.id, key: it.key, answer: it.answer, verdict: it.verdict, label: it.label, words: it.words,
                at: Date.now() + rows.length };
    rows.push(r);
    saved[it.id] = { key: r.key, verdict: r.verdict, at: r.at };
  });
  return { success: true, saved: saved };
};
/* AND WHAT `doGet` WOULD LAY ON THE NEXT PAYLOAD FOR A PERSON: their latest per question. */
const subMine_ = (rows, pid) => {
  const m = {};
  rows.filter(r => r.pid === pid).forEach(r => { if (!m[r.key] || m[r.key].at <= r.at) m[r.key] = { answer: r.answer, verdict: r.verdict, at: r.at, id: r.id }; });
  return { for: pid, mine: m };
};
const SUB_FEATURES = ['saveAnswers', 'myAnswers', 'submitAnswer'];
const SUB_SUM = { kind: 'question', key: 'q:Q-SUB-1', name: 'Q3', marks: 1, subject: 'Maths', sub: 'Paper 1 (Calculator) — June 2024',
  row: { row_id: 'Q-SUB-1', paper_id: 'P-SUB', subject: 'Maths', name: 'Paper 1 (Calculator) — June 2024' },
  html: '<p>Work out 3 &times; 5.</p>', answer: '<b>15</b>', accept: '15' };
/* THE CARD AND THE TILE ROW UNDER IT, as `stuffCard` puts them -- the verdict is in the row. */
const subDraw_ = (w, x, host) => {
  const h = host || w.document.createElement('div');
  h.innerHTML = w.questionCard_(x, 0) + '<div class="tile-row">' + '' + '</div>';
  if (!host) w.document.body.appendChild(h);
  return h.querySelector('.qcard');
};
/* THE LATEST SUBMISSION, AS THE OLD SLOT BESIDE THE STAR SAID IT -- the slot is gone (368: the box's line says it once), so the store is asked; signed out, nobody's */
/* THE SAVED LINE'S WORDS (368: it is silent while the answer is safe, so its words are asked of `ansSavedWords_`, and a quiet state drawn aloud is a failure) */
const savedWords_ = el => { if (!el) return undefined; const w = el.ownerDocument.defaultView, words = w.ansSavedWords_(el.getAttribute('data-k'));
  if (w.ansQuiet_(words) ? el.textContent !== '' : el.textContent !== words) throw new Error('the saved line says ' + JSON.stringify(el.textContent) + ' for ' + JSON.stringify(words)); return words; };
const latestWord_ = v => { if (v === 'right') return ['Correct', 'is-right']; if (v === 'wrong') return ['Not yet', 'is-near']; if (v === 'sent') return ['Sent', '']; const m = /^(ai|rule):(\d+)\/(\d+)$/.exec(String(v || '')); return m ? [m[2] + '/' + m[3], +m[2] >= +m[3] ? 'is-right' : 'is-near'] : ['', '']; };
const latestOf_ = (w, k) => { if (!(w.whoIs_ && w.whoIs_())) return null; const [t, c] = latestWord_(((w.subLatest_ && w.subLatest_(k)) || {}).v); return { textContent: t, classList: { contains: x => x === c } }; };
const cardKey_ = card => { const e = card && card.querySelector('.qp-ans-in[data-k], .qp-multi-val[data-k], .qp-mark[data-k], .qp-order[data-k], [data-k]'); return e ? e.getAttribute('data-k') : ''; };
const subSlotOf_ = card => latestOf_(card.ownerDocument.defaultView, cardKey_(card));

check('submission: the latest one is the verdict beside the star, never a date, for the person signed in alone', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || typeof w.subRecord_ !== 'function'
      || !A['qp-check'] || !A['qp-choose'] || !A['qp-send']) {
    return ['subRecord_, questionCard_ or the marking handlers are not reachable — renamed? The verdict was NOT checked'];
  }
  const base = { kind: 'question', name: 'Q8', marks: 2, row: { row_id: 'Q-V-8', paper_id: 'P-V', subject: 'Maths', name: 'Verdict' },
    html: '<p>Work out 3 &times; 5</p>', answer: '<b>15</b>', accept: '15' };
  const typed = Object.assign({}, base, { key: 'q-v-typed' });
  const kept = () => Object.keys(w.localStorage).filter(k => /^sub(Last|Q):/.test(k));
  /* TYPED AS A CHILD TYPES (the `input` the box answers to), THEN CHECKED. */
  const markIt = (card, v) => { const i = card.querySelector('.qp-ans-in'); i.value = v; i.dispatchEvent(new w.Event('input', { bubbles: true })); A['qp-check'](card.querySelector('.qp-check')); };
  const say = card => { const s = subSlotOf_(card); return s ? s.textContent + (s.classList.contains('is-right') ? ' [right]' : s.classList.contains('is-near') ? ' [near]' : '') : null; };
  /* SIGNED OUT: Check marks, no slot, and nothing is kept on the device to be anybody's. */
  w.__t.USER(null);
  const out = subDraw_(w, typed);
  markIt(out, '16');
  if (!/Not yet/.test(out.querySelector('.qp-verdict').textContent)) bad.push('signed out, Check did not mark the answer');
  if (kept().length) bad.push('signed out, a submission was kept on the device: ' + kept().join(', '));
  /* SIGNED IN. */
  w.__t.USER({ name: 'Ada Pupil', personId: 'P7', role: 'student', roles: ['student'] });
  const card = subDraw_(w, typed);
  if (card.parentNode.querySelector('.qcard-verdict')) bad.push('a verdict slot is drawn beside the star -- the box\u2019s own line says it (368)');
  if (subSlotOf_(card).textContent) bad.push('a question never sent already says "' + subSlotOf_(card).textContent + '"');
  const s0 = subSlotOf_(card), tags = card.querySelector('.qcard-tags'), t0 = tags && tags.outerHTML;
  markIt(card, '16');
  if (say(card) !== 'Not yet [near]') bad.push('after a wrong Check the slot says ' + JSON.stringify(say(card)) + ' — wanted "Not yet", in the verdict line’s amber');
  if (!tags || card.querySelector('.qcard-tags') !== tags || tags.outerHTML !== t0) bad.push('marking redrew the tag row');
  if (!/Not yet — have another go/.test(card.querySelector('.qp-verdict').textContent)) bad.push('the verdict line under the box lost its words');
  const mine = () => { try { return JSON.parse(w.localStorage.getItem('subLast:u:P7') || '{}'); } catch (e) { return {}; } };
  if (!mine()['q-v-typed'] || mine()['q-v-typed'].a !== '16' || mine()['q-v-typed'].v !== 'wrong') bad.push('the press is not kept per person per question: ' + JSON.stringify(mine()));
  markIt(card, '15');
  if (say(card) !== 'Correct [right]') bad.push('after a right Check the slot says ' + JSON.stringify(say(card)) + ' — the latest press is what it shows');
  /* DRAWN AGAIN: the slot, and the box holding what was sent with its verdict. */
  const again = subDraw_(w, typed);
  if (say(again) !== 'Correct [right]') bad.push('drawn again, the card forgot the latest verdict: ' + JSON.stringify(say(again)));
  if (again.querySelector('.qp-ans-in').value !== '15' || !/^Correct$/.test(again.querySelector('.qp-verdict').textContent) || !again.querySelector('.qp-mark.is-right')) bad.push('drawn again, the box does not hold the answer sent with its verdict: ' + JSON.stringify([again.querySelector('.qp-ans-in').value, again.querySelector('.qp-verdict').textContent]));
  /* A TAP THAT CHOOSES ENOUGH, marked and not. */
  const mc = Object.assign({}, base, { key: 'q-v-mc', accept: '', choices: ['14', '15'], choiceRight: [2] });
  const open = Object.assign({}, base, { key: 'q-v-open', accept: '', choices: ['red', 'blue'], choiceRight: [] });
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [mc, open];
  try {
    const tc = subDraw_(w, mc);
    A['qp-choose'](tc.querySelector('.qp-opt[data-n="1"]'));
    if (say(tc) !== 'Not yet [near]') bad.push('a wrong pick says ' + JSON.stringify(say(tc)) + ' on the card');
    const to = subDraw_(w, open);
    A['qp-choose'](to.querySelector('.qp-opt[data-n="2"]'));
    if (subSlotOf_(to).textContent !== 'Sent' || subSlotOf_(to).classList.contains('is-right') || subSlotOf_(to).classList.contains('is-near')) bad.push('a pick the scheme never settled says ' + JSON.stringify(say(to)) + ' — wanted "Sent", no tick and no arrow');
  } finally { w.stuffItemsAll_ = held; }
  /* A BOX NO RULE CAN MARK (round 3): its Check is the AI's, never a plain Send -- a human never marks -- and typing is not a submission. */
  const free = subDraw_(w, Object.assign({}, base, { key: 'q-v-free', accept: '', answerType: 'explain' }));
  if (free.querySelector('[data-do="qp-send"]')) bad.push('a box with no scheme still draws a plain Send — a human never marks');
  if (!free.querySelector('.qt-row [data-do="qp-ai"]')) bad.push('a box with no scheme has no AI Check in its tool row');
  const fin = free.querySelector('.qp-ans-in');
  fin.value = 'because it is'; fin.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (subSlotOf_(free).textContent) bad.push('typing alone put "' + subSlotOf_(free).textContent + '" on the card — typing is not a submission');
  /* NO CARD SAYS A DAY, anywhere: not the slot, not the old one. */
  if (d.querySelector('.qcard-done')) bad.push('a `.qcard-done` date slot is still drawn');
  [...d.querySelectorAll('.qcard-verdict')].forEach(s => { if (/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|Done/.test(s.textContent)) bad.push('a card says a day: "' + s.textContent + '"'); });
  /* ANOTHER STUDENT, SAME PHONE. */
  w.__t.USER({ name: 'Ben Other', personId: 'P8', role: 'student', roles: ['student'] });
  if (subSlotOf_(subDraw_(w, typed)).textContent) bad.push('another student sees the first one’s verdict: "' + subSlotOf_(subDraw_(w, typed)).textContent + '"');
  /* PRIVATE MODE: storage throws, and the verdict is held for the visit. */
  const fresh = Object.assign({}, base, { key: 'q-v-private' });
  const priv = subDraw_(w, fresh);
  Object.defineProperty(w, 'localStorage', { configurable: true, get() { throw new Error('private mode'); } });
  try {
    markIt(priv, '15');
    if (subSlotOf_(priv).textContent !== 'Correct') bad.push('with storage throwing, the verdict was not shown: "' + subSlotOf_(priv).textContent + '"');
    if (subSlotOf_(subDraw_(w, fresh)).textContent !== 'Correct') bad.push('with storage throwing, the verdict was not held for the visit');
  } catch (e) { bad.push('with storage throwing, marking threw: ' + e.message); }
  finally { delete w.localStorage; }
  w.__t.USER(null);
  return bad;
});

check('submission: right, edited, wrong — two events on the account, a draft stays on the device, and the next device opens on the wrong answer', async () => {
  const rows = [], drafts = {};
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES }), reply: ansBackend_(drafts, subBackend_(rows)) });
  await wait(300);
  const need = ['subRecord_', 'subAdopt_', 'questionCard_', 'ansSavedSay_'].filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — renamed? Nothing was sent'];
  const bad = [];
  const subs = () => sent.filter(b => b.action === 'submitAnswer');
  const said = card => savedWords_(card.parentNode.querySelector('.qp-saved'));
  w.stuffItemsAll_ = () => [SUB_SUM];
  /* SIGNED OUT: nothing goes anywhere. */
  w.__t.USER(null);
  const anon = subDraw_(w, SUB_SUM);
  ansType_(w, anon.querySelector('.qp-ans-in'), '15');
  anon.querySelector('.qp-check').click();
  await wait(40);
  if (subs().length) bad.push('signed out, a Check sent ' + subs().length + ' submission(s)');
  w.__t.USER(Object.assign({}, ANS_ADA));
  const card = subDraw_(w, SUB_SUM);
  const inp = () => card.querySelector('.qp-ans-in');
  const line = () => savedWords_(card.querySelector('.qp-saved'));
  ansType_(w, inp(), '15');
  if (line() !== 'On this device until you send it') bad.push('an answer typed and not sent says ' + JSON.stringify(line()));
  card.querySelector('.qp-check').click();
  await wait(60);
  if (subs().length !== 1) bad.push('a right Check sent ' + subs().length + ' submitAnswer request(s), wanted 1, at once');
  const one = ((subs()[0] || {}).items || [])[0] || {};
  if (one.key !== 'q:Q-SUB-1' || one.answer !== '15' || one.verdict !== 'right' || !/^\d{10,16}-[a-z0-9]{6}$/.test(String(one.id))) bad.push('the press went up as ' + JSON.stringify(one) + ' — wanted the library key (no person in it), 15, right, and an id of its own');
  if (one.label !== 'Maths · Paper 1 (Calculator) — June 2024 · Q3') bad.push('the press went up named ' + JSON.stringify(one.label) + ' — the weekly email reads the name a parent can');
  if (one.words !== 'Work out 3 × 5.') bad.push('the press went up with the words ' + JSON.stringify(one.words) + ' — the weekly email prints the question’s own');
  if ((subs()[0] || {}).token !== 'tok-P7' || (subs()[0] || {}).personId !== 'P7') bad.push('submitAnswer went without the token, or without personId beside it');
  if (subSlotOf_(card).textContent !== 'Correct') bad.push('after the right Check the card says ' + JSON.stringify(subSlotOf_(card).textContent));
  if (line() !== 'Sent to Ada’s account') bad.push('a press on the account says ' + JSON.stringify(line()) + ' under the box');
  /* EDITED, NOT SENT: no verdict, a draft of this device's, and nothing to the account. */
  ansType_(w, inp(), '16');
  if (card.querySelector('.qp-verdict').textContent || card.querySelector('.qp-mark.is-right, .qp-mark.is-near')) bad.push('an edit left the old verdict on a different answer: ' + JSON.stringify(card.querySelector('.qp-verdict').textContent));
  if (subSlotOf_(card).textContent !== 'Correct') bad.push('an edit changed the card to ' + JSON.stringify(subSlotOf_(card).textContent) + ' — the card is the latest SUBMISSION, and nothing new was sent');
  if (line() !== 'On this device until you send it') bad.push('a draft after a press says ' + JSON.stringify(line()));
  await wait(1700);
  if (sent.some(b => b.action === 'saveAnswers' && (b.items || []).some(i => /^ans:/.test(i.key)))) bad.push('a typed draft went up as a saved answer — only what is SENT reaches the account now');
  if (subs().length !== 1) bad.push('typing sent a submission');
  /* TYPED BACK TO WHAT WAS SENT: that answer's verdict again, because it is about that answer. */
  ansType_(w, inp(), '15');
  if (card.querySelector('.qp-verdict').textContent !== 'Correct') bad.push('typed back to the answer sent, the line says ' + JSON.stringify(card.querySelector('.qp-verdict').textContent));
  /* WRONG, SENT: the second event. */
  ansType_(w, inp(), '16');
  card.querySelector('.qp-check').click();
  await wait(60);
  if (subs().length !== 2) bad.push('right then wrong made ' + subs().length + ' submitAnswer request(s) — *"that\'s 2 events"*');
  if (rows.length !== 2 || rows[0].verdict !== 'right' || rows[1].verdict !== 'wrong' || rows[1].answer !== '16') bad.push('the account holds ' + JSON.stringify(rows.map(r => [r.answer, r.verdict])) + ' — wanted [15, right] then [16, wrong]');
  if (subSlotOf_(card).textContent !== 'Not yet' || !subSlotOf_(card).classList.contains('is-near')) bad.push('after the wrong press the card says ' + JSON.stringify(subSlotOf_(card).textContent) + ' — the LATEST event is what it shows');
  /* A DRAFT AFTER THE WRONG ONE, AND THE NEXT PAYLOAD LANDING: the draft stays on this device. */
  ansType_(w, inp(), '17');
  await wait(20);
  w.__t.DATA().submissions = subMine_(rows, 'P7');
  w.adoptMarks_();
  await wait(40);
  if (w.localStorage.getItem('ans:u:P7:q:Q-SUB-1') !== '17' || inp().value !== '17') bad.push('the next payload put the account’s answer over a draft typed after it: the box reads ' + JSON.stringify(inp().value));
  if (subs().length !== 2) bad.push('a payload landing sent the draft');
  /* A FRESH DEVICE — the computer at home, next sign-in — opens on the wrong answer with "Not yet". */
  /* AND THE ACCOUNT STILL HOLDS A DRAFT OF THIS BOX FROM BEFORE 9 OCT, saved LATER than the press — read back,
     it would open the box on something nobody sent. */
  const b2 = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: subMine_(rows, 'P7') }),
    reply: ansBackend_({ 'ans:q:Q-SUB-1': { v: '99', at: Date.now() + 60000 } }, subBackend_(rows)),
    before: win => { win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA)); } });
  await wait(500);
  b2.w.stuffItemsAll_ = () => [SUB_SUM];
  const c2 = subDraw_(b2.w, SUB_SUM);
  const box2 = c2.querySelector('.qp-ans-in');
  if (!box2 || box2.value !== '16') bad.push('a fresh device opens the box on ' + JSON.stringify(box2 && box2.value) + ' — wanted the latest answer sent, 16, and never an old draft off the answers tab');
  if (b2.w.localStorage.getItem('ans:u:P7:q:Q-SUB-1') !== '16') bad.push('the account’s old draft of a typed answer was read back into this device: ' + JSON.stringify(b2.w.localStorage.getItem('ans:u:P7:q:Q-SUB-1')));
  if (c2.querySelector('.qp-verdict').textContent !== 'Not yet — have another go' || !c2.querySelector('.qp-mark.is-near')) bad.push('a fresh device’s verdict line says ' + JSON.stringify(c2.querySelector('.qp-verdict').textContent) + ' — *"they would see incorrect answer there next time they login"*');
  if (subSlotOf_(c2).textContent !== 'Not yet') bad.push('a fresh device’s card says ' + JSON.stringify(subSlotOf_(c2).textContent));
  if (savedWords_(c2.querySelector('.qp-saved')) !== 'Sent to Ada’s account') bad.push('a fresh device says ' + JSON.stringify(savedWords_(c2.querySelector('.qp-saved'))) + ' under the account’s own answer');
  if (b2.sent.some(b => b.action === 'submitAnswer')) bad.push('the fresh device sent the account’s presses straight back');
  /* AND A PAYLOAD BUILT FOR SOMEBODY ELSE IS NOT READ. */
  const b3 = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: subMine_(rows, 'P7') }),
    before: win => { win.localStorage.setItem('familyUser', JSON.stringify(ANS_BEN)); } });
  await wait(500);
  b3.w.stuffItemsAll_ = () => [SUB_SUM];
  const c3 = subDraw_(b3.w, SUB_SUM);
  if (subSlotOf_(c3).textContent || c3.querySelector('.qp-ans-in').value) bad.push('BEN’S CARD SHOWS ADA’S SUBMISSION: ' + JSON.stringify([subSlotOf_(c3).textContent, c3.querySelector('.qp-ans-in').value]));
  /* ANOTHER DEVICE PRESSED SEND BEFORE THIS DRAFT WAS TYPED: its press is the latest on the card, and the
     draft — typed after it — still stays in the box. */
  rows.push({ pid: 'P7', id: '1760000000101-ot0001', key: 'q:Q-SUB-1', answer: '20', verdict: 'wrong', at: rows[1].at + 1 });
  w.__t.DATA().submissions = subMine_(rows, 'P7');
  w.adoptMarks_();
  await wait(40);
  if (inp().value !== '17') bad.push('a press made on another device BEFORE this draft was typed replaced the draft: the box reads ' + JSON.stringify(inp().value));
  /* AND ONE PRESSED AFTER IT: the latest event, on the card and in the box — the draft is older than it. */
  rows.push({ pid: 'P7', id: '1760000000102-ot0002', key: 'q:Q-SUB-1', answer: '21', verdict: 'right', at: Date.now() + 5000 });
  w.__t.DATA().submissions = subMine_(rows, 'P7');
  w.adoptMarks_();
  await wait(40);
  if (inp().value !== '21' || subSlotOf_(card).textContent !== 'Correct' || card.querySelector('.qp-verdict').textContent !== 'Correct') bad.push('a press made on another device AFTER this draft did not take the box and the card: ' + JSON.stringify([inp().value, subSlotOf_(card).textContent, card.querySelector('.qp-verdict').textContent]));
  /* AN ADMIN'S PEOPLE COLUMN, off the summary only an admin is sent — counts and a day, never an answer. */
  w.__t.USER({ name: 'Hal Admin', personId: 'P1', role: 'admin', roles: ['admin'], token: 'tok-P1' });
  w.__t.DATA().submissions = { for: 'P1', mine: {}, people: { P7: { n: 12, last: '2001-10-04' }, P9: { n: 1, last: '2001-10-04' } } };
  if (typeof w.subsLine_ !== 'function') bad.push('subsLine_ is not reachable — the admin’s line was NOT checked');
  else {
    if (w.subsLine_('P7') !== '12 questions · last 4 Oct 2001') bad.push('an admin reads "' + w.subsLine_('P7') + '" under a learner, wanted "12 questions · last 4 Oct 2001"');
    if (w.subsLine_('P9') !== '1 question · last 4 Oct 2001') bad.push('one question reads "' + w.subsLine_('P9') + '"');
    if (w.subsLine_('P5') !== '') bad.push('a person who sent nothing reads "' + w.subsLine_('P5') + '"');
    const host = w.document.createElement('div');
    host.innerHTML = w.findCard({ kind: 'tutor', row: { title: 'Ada Pupil', handle: 'ada', role: 'Student', personId: 'P7', activity: w.subsLine_('P7') } });
    const act = host.querySelector('.prof-who .prof-act');
    if (!act || act.textContent !== '12 questions · last 4 Oct 2001') bad.push('the person card does not draw the line under the name');
    w.__t.USER(Object.assign({}, ANS_BEN));
    if (w.subsLine_('P7') !== '') bad.push('a summary built for the admin is drawn for Ben on the same phone');
  }
  w.__t.USER(null);
  return bad;
});

check('submission: a pick, an ordering, Mark with AI and a worksheet box are each an event, and a drawing still goes up as it is drawn', async () => {
  const rows = [], drafts = {};
  const ORD = { kind: 'question', key: 'q:Q-SUB-ORD', name: 'Q4', marks: 1, subject: 'Maths', sub: 'Order', answerType: 'order',
    row: { row_id: 'Q-SUB-ORD', paper_id: 'P-SUB', subject: 'Maths', name: 'Order' }, html: '<p>Smallest first.</p>',
    choices: ['3', '1', '2'], choiceRight: [2, 3, 1], choiceWays: [[2, 3, 1]], orderEnds: ['smallest', 'largest'], answer: '<b>1, 2, 3</b>' };
  const AIQ = { kind: 'question', key: 'q:Q-SUB-AI', name: 'Q9', marks: 3, subject: 'Science', sub: 'Explain', answerType: 'explain',
    row: { row_id: 'Q-SUB-AI', paper_id: 'P-SUB', subject: 'Science', name: 'Explain' }, html: '<p>Explain why.</p>', answer: '<b>Because</b> of the heat' };
  const PR = { kind: 'practical', name: 'Rates of reaction', key: 'pr:PR-SUB', subject: 'Chemistry', sub: 'Chemistry · Required practical · 60 min' };
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES.concat(['aiMark']), aiMarking: true }),
    reply: ansBackend_(drafts, subBackend_(rows, b => (b.action === 'aiMark' ? { success: true, awarded: 2, available: 3, feedback: 'Say what the heat does.' } : undefined))) });
  await wait(300);
  const need = ansNeed_(w).concat(['subRecord_', 'orderBox_', 'guideBox_'].filter(n => typeof w[n] !== 'function'));
  if (need.length) return [need.join(', ') + ' not reachable — renamed? Nothing was pressed'];
  const bad = [], A = w.__t.ACTIONS;
  w.__t.USER(Object.assign({}, ANS_ADA));
  const c = ansCards_(w, 'S');
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => held().concat([ORD, AIQ, PR]);
  const items = () => [].concat(...sent.filter(b => b.action === 'submitAnswer').map(b => b.items || []));
  const of = key => items().filter(i => i.key === key);
  /* A PICK: marked at once, one event. */
  A['qp-choose'](c.box().querySelector('[data-n="1"]'));
  await wait(40);
  if (of(c.pick.key).length !== 1 || of(c.pick.key)[0].answer !== '1' || of(c.pick.key)[0].verdict !== 'wrong') bad.push('a wrong pick went up as ' + JSON.stringify(of(c.pick.key)) + ' — wanted one event, answer 1, wrong');
  /* AN ORDERING: placing is not an event, Send is. */
  const host = w.document.createElement('div');
  w.document.body.appendChild(host);
  host.innerHTML = w.questionCard_(ORD, 0);
  const box = () => host.querySelector('.qp-order');
  [2, 3].forEach(n => box().querySelector('.qp-item[data-n="' + n + '"]').click());
  await wait(30);
  if (of('q:Q-SUB-ORD').length) bad.push('placing items in an ordering sent a submission — Send is the press');
  box().querySelector('.qp-order-send').click();
  await wait(30);
  if (of('q:Q-SUB-ORD').length) bad.push('Send on an ordering with a place still empty sent a submission — it is not an answer yet');
  box().querySelector('.qp-item[data-n="1"]').click();
  await wait(360);   // a second Send, not a double tap's second half (534)
  box().querySelector('.qp-order-send').click();
  await wait(40);
  const o = of('q:Q-SUB-ORD');
  if (o.length !== 1 || o[0].answer !== '2,3,1' || o[0].verdict !== 'right') bad.push('Send on the full ordering went up as ' + JSON.stringify(o) + ' — wanted one event, 2,3,1, right');
  if ((box().querySelector('.qp-verdict') || {}).textContent !== 'Correct') bad.push('the ordering’s verdict is ' + JSON.stringify((box().querySelector('.qp-verdict') || {}).textContent));
  /* DRAWN AGAIN AFTER A MOVE AND BACK: the verdict is the latest press's, drawn while the row is that row. */
  await wait(360);
  box().querySelector('.qp-slot.is-full[data-n="1"]').click();
  if ((box().querySelector('.qp-verdict') || {}).textContent) bad.push('moving an item left the verdict on a row that changed');
  box().querySelector('.qp-item[data-n="1"]').click();
  if ((box().querySelector('.qp-verdict') || {}).textContent !== 'Correct') bad.push('put back to the row that was sent, the verdict did not return: ' + JSON.stringify((box().querySelector('.qp-verdict') || {}).textContent));
  /* MARK WITH AI: the marks are the verdict, ai:2/3. */
  const ah = w.document.createElement('div');
  w.document.body.appendChild(ah);
  ah.innerHTML = w.questionCard_(AIQ, 0) + '<div class="tile-row">' + '' + '</div>';
  const ai = ah.querySelector('.qp-ai-go');
  if (!ai) bad.push('the worded card drew no Mark with AI — the AI press was NOT checked');
  else {
    ansType_(w, ah.querySelector('.qp-ans-in'), 'because it is hot');
    A['qp-ai'](ai);
    await wait(60);
    const m = of('q:Q-SUB-AI');
    if (m.length !== 1 || m[0].verdict !== 'ai:2/3' || m[0].answer !== 'because it is hot') bad.push('Mark with AI went up as ' + JSON.stringify(m) + ' — wanted one event, ai:2/3');
    const slot = subSlotOf_(ah.querySelector('.qcard') || ah);
    if (!slot || slot.textContent !== '2/3') bad.push('the card after Mark with AI says ' + JSON.stringify(slot && slot.textContent) + ' — wanted the AI’s 2/3');
    /* AND WHEN AI MARKING GOES AWAY MID-VISIT, THE CHECK WAITS, unpressable -- no plain Send: a human never marks (round 3) */
    w.aiOff_('AI marking is switched off');
    if (ah.querySelector('.qp-ai [data-do="qp-send"]') || !ah.querySelector('.qp-ai-go[disabled]')) bad.push('with AI marking switched off the worded box got a plain Send, or its Check still presses');
  }
  /* A PRACTICAL'S WORKSHEET BOX: its own Send, `sent`, the slot on the key. */
  const sh = w.document.createElement('div');
  w.document.body.appendChild(sh);
  sh.innerHTML = w.guideBox_(PR, 'iv', 'Independent variable — the one thing you will change');
  const gs = sh.querySelector('[data-do="qp-send"]');
  if (!gs) bad.push('a practical’s worksheet box has no Send, signed in — its answer would never leave the iPad');
  else {
    ansType_(w, sh.querySelector('.qp-ans-in'), 'the temperature');
    gs.click();
    await wait(40);
    const p = of('pr:PR-SUB#iv');
    if (p.length !== 1 || p[0].verdict !== 'sent' || p[0].label !== 'Chemistry · Required practical · Rates of reaction · Worksheet' || 'words' in p[0]) bad.push('the worksheet box went up as ' + JSON.stringify(p) + ' — wanted one event, sent, named as the worksheet, no words');
    if ((sh.querySelector('.qp-verdict') || {}).textContent !== 'Sent') bad.push('the worksheet box’s line says ' + JSON.stringify((sh.querySelector('.qp-verdict') || {}).textContent));
  }
  /* A DRAWING STILL GOES UP AS IT IS DRAWN — it has no Send — and no typed answer goes with it. */
  ansType_(w, c.ta(), 'a draft');
  ansStroke_(w, c, [[10, 10], [20, 20], [30, 30], [40, 40]]);
  await wait(1700);
  const saves = [].concat(...sent.filter(b => b.action === 'saveAnswers').map(b => b.items || []));
  if (!saves.some(i => i.key === 'pad:' + c.pen.key)) bad.push('a drawing did not go up to the account: ' + JSON.stringify(saves.map(i => i.key)));
  if (saves.some(i => /^ans:/.test(i.key))) bad.push('a typed or picked answer went up as a draft beside the drawing: ' + JSON.stringify(saves.filter(i => /^ans:/.test(i.key)).map(i => i.key)));
  w.__t.USER(null);
  return bad;
});

check('submission: kept on the device until the backend can take them, sent again after a refusal with the same id, and never twice', async () => {
  const rows = [];
  let refuse = 0;
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: [] }),
    reply: ansBackend_({}, subBackend_(rows, b => (b.action === 'submitAnswer' && refuse-- > 0 ? { error: 'Busy — it will be sent again.', why: 'busy' } : undefined))) });
  await wait(300);
  if (typeof w.subPush_ !== 'function' || typeof w.adoptMarks_ !== 'function') return ['subPush_ or adoptMarks_ not reachable — nothing was checked'];
  const bad = [];
  w.stuffItemsAll_ = () => [SUB_SUM];
  w.__t.USER(Object.assign({}, ANS_ADA));
  const card = subDraw_(w, SUB_SUM);
  const queue = () => { try { return JSON.parse(w.localStorage.getItem('subQ:u:P7') || '[]'); } catch (e) { return []; } };
  const subs = () => sent.filter(b => b.action === 'submitAnswer');
  /* A BACKEND FROM BEFORE: kept, not sent, and the card shows it all the same. */
  ansType_(w, card.querySelector('.qp-ans-in'), '15');
  card.querySelector('.qp-check').click();
  await wait(360);   // typing 16 takes longer than the dispatcher's 350 ms (534)
  ansType_(w, card.querySelector('.qp-ans-in'), '16');
  card.querySelector('.qp-check').click();
  await wait(40);
  if (subs().length) bad.push('a backend without submitAnswer was sent ' + subs().length + ' request(s)');
  if (queue().length !== 2) bad.push('two presses to a backend that cannot take them left ' + queue().length + ' on the device — wanted both, in order');
  if (subSlotOf_(card).textContent !== 'Not yet') bad.push('a press kept on the device does not show on the card: ' + JSON.stringify(subSlotOf_(card).textContent));
  /* THE BACKEND IS UPDATED; THE FIRST TRY IS BUSY. */
  refuse = 1;
  w.__t.DATA().features = SUB_FEATURES;
  w.adoptMarks_();
  await wait(60);
  if (subs().length !== 1 || queue().length !== 2) bad.push('a refused send changed the queue (' + queue().length + ' left after ' + subs().length + ' request(s)) — both presses must wait for the next try');
  const ids0 = ((subs()[0] || {}).items || []).map(i => i.id).join();
  await w.subPush_(true);
  const ids1 = ((subs()[1] || {}).items || []).map(i => i.id).join();
  if (!ids0 || ids1 !== ids0) bad.push('the retry sent ' + JSON.stringify(ids1) + ' after a refusal of ' + JSON.stringify(ids0) + ' — the same presses, under the same ids');
  if (queue().length) bad.push('after the retry was saved, ' + queue().length + ' press(es) are still waiting');
  if (rows.length !== 2 || rows[0].answer !== '15' || rows[1].answer !== '16') bad.push('the account holds ' + JSON.stringify(rows.map(r => r.answer)) + ' — wanted 15 then 16, each once');
  /* A REPLY NEVER SEEN: the same press sent again is one row on the account. */
  const lost = { id: '1760000000999-zz0001', key: 'q:Q-SUB-1', answer: '17', verdict: 'wrong' };
  w.localStorage.setItem('subQ:u:P7', JSON.stringify([lost]));
  await w.subPush_(true);
  w.localStorage.setItem('subQ:u:P7', JSON.stringify([lost]));
  await w.subPush_(true);
  if (rows.filter(r => r.id === lost.id).length !== 1) bad.push('a press sent twice is ' + rows.filter(r => r.id === lost.id).length + ' rows');
  /* AS THE APP GOES AWAY, WITH keepalive. */
  const kept = [];
  const was = w.fetch;
  w.fetch = (u, o) => { if (o && o.keepalive) kept.push(JSON.parse(o.body)); return was(u, o); };
  w.localStorage.setItem('subQ:u:P7', JSON.stringify([{ id: '1760000001000-zz0002', key: 'q:Q-SUB-1', answer: '18', verdict: 'wrong' }]));
  w.dispatchEvent(new w.Event('pagehide'));
  await wait(60);
  w.fetch = was;
  if (!kept.some(b => b.action === 'submitAnswer')) bad.push('pagehide sent nothing with keepalive — closing the iPad would keep the last press waiting');
  w.__t.USER(null);
  return bad;
});

/* ---------- THE QUESTION'S OWN WORDS, WITH EVERY PRESS § */
const WD_SVG = '<svg viewBox="0 0 10 10"><text x="1" y="5">LABELWORD</text></svg>';
const wdBank_ = () => [
  /* THE PAPER'S COVER — paper scope. Every question in the paper sits under it, and it is not one. */
  { id: 'S-WD-P', paper: 'P-WD', paper_id: 'P-WD', kind: 'preamble', name: 'Words', html: '<p>Answer ALL questions. COVERWORD.</p>' },
  /* THE SCENE Q5's PARTS SHARE — question scope. */
  { id: 'S-WD-5', paper: 'P-WD', paper_id: 'P-WD', q: '5', kind: 'preamble', name: 'Words', html: '<p>A bag holds 3 red and 5 blue counters.</p>' },
  mpRow_('P-WD', 'Words', 5, 'a', { html: '<p>Work out the probability of red.</p>', accept: '3/8' }),
  mpRow_('P-WD', 'Words', 5, 'b', { html: '<p>Two are taken. Work out the probability both are blue.</p>' }),
  mpRow_('P-WD', 'Words', 6, '', { html: '<p>Work out <sup>3</sup>&frasl;<sub>4</sub> of 20.</p>' }),
  mpRow_('P-WD', 'Words', 7, '', { html: '<p>Expand x<sup>2</sup>(x + y<sup>5</sup>).</p>' }),
  mpRow_('P-WD', 'Words', 8, '', { html: '<p>Find the angle marked <i>x</i>.</p>', diagram: WD_SVG }),
  mpRow_('P-WD', 'Words', 9, '', { html: '<p>Work out <span class="frac"><span class="frac-n">1</span><span class="frac-d">3</span></span> &times; <span class="frac"><span class="frac-n">5</span><span class="frac-d">8</span></span>.</p>' }),
  mpRow_('P-WD', 'Words', 10, '', { html: '<p>Solve 2<sup><i>x</i></sup> = 8. Simplify <sup>72</sup>&frasl;<sub><i>n</i></sub>, <sup><i>t</i></sup>&frasl;<sub>2</sub> and <sup>7.902 &minus; 8</sup>&frasl;<sub><i>x</i></sub>.</p>' }),
  mpRow_('P-WD', 'Words', 11, '', { html: '<p>Is <i>x</i> &lt; 7 when ' + WD_SVG + '<i>x</i> = 3?</p>' }),
  /* DRAWN ON THE PAPER'S OWN FIGURE, AND ON A STEM'S -- the pen is on the card now (337) and neither has a
     page of its own pen, but the figure is still the paper's picture, which the email cannot draw. */
  mpRow_('P-WD', 'Words', 12, '', { html: '<p>Complete the bar chart.</p>', answerType: 'drawing', diagram: WD_SVG }),
  { id: 'S-WD-13', paper: 'P-WD', paper_id: 'P-WD', q: '13', kind: 'preamble', name: 'Words', html: '<p>Here is a map.</p>', diagram: WD_SVG },
  mpRow_('P-WD', 'Words', 13, 'a', { html: '<p>Mark the point due North of A.</p>', answerType: 'annotate' }),
];
const WD_ADA = { name: 'Ada Pupil', personId: 'P7', role: 'student', roles: ['student'], token: 'tok-P7' };
check('submission: a press carries the question’s own words — its stem above the part, a fraction as 3/4, a power as x², a picture said — and the name a parent reads', async () => {
  const rows = [];
  const p = Object.assign(payload(), { features: ['submitAnswer'] });
  const { w, sent } = boot({ payload: p, reply: ansBackend_({}, subBackend_(rows)) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, ansKey = w.__t.ansKey;
  const need = ['questionItems', 'subRecord_', 'questionCard_'].filter(n => typeof w[n] !== 'function')
    .concat(A['qp-check'] ? [] : ['qp-check']).concat(typeof ansKey === 'function' ? [] : ['ansKey_']);
  if (need.length) return [need.join(', ') + ' not reachable — renamed? The words a press sends were NOT checked'];
  const bad = [];
  const lib = mpLibrary_(w, wdBank_());
  const item = n => lib.items.find(x => x.row.paper === 'P-WD' && x.name === n);
  const items = () => [].concat(...sent.filter(b => b.action === 'submitAnswer').map(b => b.items || []));
  const sentFor = key => items().filter(i => i.key === key).pop() || null;
  try {
    w.__t.USER(WD_ADA);
    /* THE FIRST THROUGH A REAL CARD AND A REAL CHECK, as a child marks it. */
    const q5a = item('Q5a');
    if (!q5a) return ['Q5a did not reach the library — the words were NOT checked'];
    const h = d.createElement('div');
    h.innerHTML = w.questionCard_(q5a, 0) + '<div class="tile-row">' + '' + '</div>';
    d.body.appendChild(h);
    const card = h.querySelector('.qcard');
    const box = card && card.querySelector('.qp-ans-in'), btn = card && card.querySelector('.qp-check');
    if (!box || !btn) bad.push('Q5a was drawn with no answer box or no Check — the Check was NOT pressed');
    else { box.value = '3/8'; A['qp-check'](btn); }
    /* THE REST AS EVERY PRESS GOES — `subRecord_` is what every handler calls. */
    ['Q5b', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13a'].forEach(n => { const x = item(n); if (x) w.subRecord_(ansKey(x), 'an answer', 'sent'); else bad.push(n + ' did not reach the library'); });
    await wait(150);
    const want = {
      Q5a: 'A bag holds 3 red and 5 blue counters.\n---\nWork out the probability of red.',
      Q5b: 'A bag holds 3 red and 5 blue counters.\n---\nTwo are taken. Work out the probability both are blue.',
      Q6: 'Work out 3/4 of 20.',
      Q7: 'Expand x²(x + y^5).',
      Q8: 'Find the angle marked x. (picture on the site)',
      Q9: 'Work out 1/3 × 5/8.',
      Q10: 'Solve 2^x = 8. Simplify 72/n, t/2 and (7.902 − 8)/x.',
      Q11: 'Is x < 7 when x = 3?',
      Q12: 'Complete the bar chart. (picture on the site)',
      Q13a: 'Here is a map.\n---\nMark the point due North of A. (picture on the site)',
    };
    const why = {
      Q5a: 'a part under a stem, through a real Check: the scene, a `---` line, then the ask',
      Q5b: 'the second part of the same question: the same stem, so the email can print it once',
      Q6: 'a stored fraction: 3/4, not the 34 that stripping the tags leaves',
      Q7: 'a square and an index: x² and y^5, not x2 and y5',
      Q8: 'a question with a diagram: its words, then "(picture on the site)", and none of the drawing’s labels',
      Q9: 'the stacked `.frac` span the library also stores: 1/3 × 5/8, not 13 × 58',
      Q10: 'an italic index and fractions with an italic half: 2^x, not 2x; 72/n, not ^72⁄n; t/2, not ^t/2; a two-term numerator bracketed',
      Q11: 'a less-than kept, and a drawing inside the sentence dropped',
      Q12: 'drawn on its own figure, the pen on the card since 337: still "(picture on the site)", the figure is the paper\'s',
      Q13a: 'drawn on its stem\'s map, which is the stem\'s page and no page of the part\'s own since 337: still "(picture on the site)"',
    };
    Object.keys(want).forEach(n => {
      const x = item(n), got = x && sentFor(x.key);
      if (!got) bad.push(n + ' — ' + why[n] + ' — sent no submission at all');
      else if (got.words !== want[n]) bad.push(n + ' — ' + why[n] + ' — sent words ' + JSON.stringify(got.words) + ', wanted ' + JSON.stringify(want[n]));
    });
    const all = JSON.stringify(items());
    if (/COVERWORD/.test(all)) bad.push('the paper’s cover went up as part of a question’s words — it is the paper’s, not the question’s');
    if (/LABELWORD/.test(all)) bad.push('a drawing’s labels went up as a question’s words');
    const named = sentFor(q5a.key);
    if (named && !/Q5a/.test(String(named.label || ''))) bad.push('the words went up without the name: ' + JSON.stringify(named));
    /* THE NAME A PARENT READS: the subject not twice, and the tier when the paper's name does not say it. */
    const named_ = (k, subject, sub, more) => Object.assign({}, SUB_SUM, { key: k, subject: subject, sub: sub }, more || {});
    const cards = [
      named_('q-named', 'Maths', 'Paper 1 (Calculator) — June 2024'),
      named_('q-named-2', 'Biology', 'Biology Paper 2 — June 2023'),
      named_('q-tier-h', 'Maths', 'Paper 1 (Non-calculator) — June 2024', { tier: 'Higher' }),
      named_('q-tier-f', 'Maths', 'Paper 1 (Non-calculator) — June 2024', { tier: 'Foundation' }),
      named_('q-tier-a', 'Physics', 'Paper 1 — June 2024', { tier: '', bandValue: 'A-Level', row: { level: 'Alevel' } }),
      named_('q-tier-s', 'Maths', 'Higher Paper 3 — June 2023', { tier: 'Higher' }),
    ];
    const pr = { kind: 'practical', name: 'Specific heat capacity', key: 'pr:PR-T1', subject: 'Physics', sub: 'Physics · Required practical · 60 min',
                 html: '<p>PRACTICALWORD: heat the block for ten minutes.</p>', lead: '<p>PRACTICALWORD</p>' };
    w.stuffItemsAll_ = () => lib.items.concat(cards, [pr]);
    cards.forEach(x => w.subRecord_(ansKey(x), '15', 'right'));
    w.subRecord_('ans:' + w.whoIs_() + ':pr:PR-T1#iv', 'the temperature', 'sent');
    await wait(60);
    const labels = cards.map(x => (sentFor(x.key) || {}).label);
    const wantLabels = ['Maths · Paper 1 (Calculator) — June 2024 · Q3', 'Biology Paper 2 — June 2023 · Q3',
      'Maths · Paper 1 (Non-calculator) — June 2024 (Higher) · Q3', 'Maths · Paper 1 (Non-calculator) — June 2024 (Foundation) · Q3',
      'Physics · Paper 1 — June 2024 (A-level) · Q3', 'Maths · Higher Paper 3 — June 2023 · Q3'];
    if (JSON.stringify(labels) !== JSON.stringify(wantLabels)) bad.push('presses on library cards went up named ' + JSON.stringify(labels) + ' — wanted ' + JSON.stringify(wantLabels) + ': a paper’s tier said once, and only when its name does not');
    /* A PRACTICAL'S WORKSHEET BOX: the name says which sheet, no card duration, and no words. */
    const box4 = sentFor('pr:PR-T1#iv');
    if (!box4) bad.push('a practical’s worksheet box sent no submission at all');
    else {
      if (box4.label !== 'Physics · Required practical · Specific heat capacity · Worksheet') bad.push('a practical’s worksheet box went up named ' + JSON.stringify(box4.label) + ' — wanted the worksheet, and no "60 min", which a parent reads as time spent');
      if ('words' in box4) bad.push('a practical’s worksheet box sent words: ' + JSON.stringify(box4.words) + ' — its name already says which worksheet');
    }
  } finally { lib.put(); w.__t.USER(null); }
  return bad;
});

/* ---------- THE KEYPAD'S GOLD SEND IS THE BOX'S OWN SEND (review of 9 Oct, the blocker) § */
check('submission: the keypad’s gold Send and a laptop’s Enter send the box’s own Send — no scheme, a worksheet box, a Check — and an essay’s “done” sends nothing', async () => {
  const rows = [];
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES }), reply: ansBackend_({}, subBackend_(rows)) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['kp-key'] || !A['qp-send'] || !A['qp-check'] || typeof w.guideBox_ !== 'function') return ['the keypad, Send, Check or the worksheet box is not reachable — the gold key was NOT pressed'];
  w.__t.USER(Object.assign({}, ANS_ADA));
  const base = { kind: 'question', marks: 2, subject: 'Maths', sub: 'Paper 1 (Non-calculator) — November 2018',
    row: { row_id: 'Q-KP-1', paper_id: 'P-KP', subject: 'Maths', name: 'Paper 1 (Non-calculator) — November 2018' } };
  const FREE = Object.assign({}, base, { key: 'q:Q-KP-FREE', name: 'Q15', answerType: 'calculation', accept: '', html: '<p>Work out the area.</p>', answer: '<b>42</b>' });
  const CHK = Object.assign({}, base, { key: 'q:Q-KP-CHK', name: 'Q3', accept: '15', html: '<p>Work out 3 &times; 5.</p>', answer: '<b>15</b>' });
  const ESS = { kind: 'question', key: 'q:Q-KP-ESS', name: 'Q5', marks: 40, subject: 'English Language', sub: 'Paper 1 — June 2017', answerType: 'written', accept: '',
    row: { row_id: 'Q-KP-ESS', paper_id: 'P-KP-E', subject: 'English Language', name: 'Paper 1 — June 2017' }, html: '<p>Write a story.</p>', answer: '<b>Level 4</b> compelling' };
  const PR = { kind: 'practical', name: 'Rates of reaction', key: 'pr:PR-KP', subject: 'Chemistry', sub: 'Chemistry · Required practical · 60 min' };
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => held().concat([FREE, CHK, ESS, PR]);
  const items = key => [].concat(...sent.filter(b => b.action === 'submitAnswer').map(b => b.items || [])).filter(i => i.key === key);
  const pad = () => d.getElementById('kp');
  const press = v => { const b = pad() && pad().querySelector('.kp-key[data-v="' + v + '"]'); if (b) A['kp-key'](b); else bad.push('no key ' + JSON.stringify(v) + ' on the pad'); };
  const kd = (el, k, o) => el.dispatchEvent(new w.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, o || {})));
  /* A MATHS BOX WITH NO SCHEME (round 3): its Check is the AI's, never a plain Send; with AI marking off the gold key sends nothing for a person to mark */
  const fc = subDraw_(w, FREE);
  const fi = fc.querySelector('.kp-in');
  if (!fi || fc.querySelector('[data-do="qp-send"]') || !fc.querySelector('.qt-row [data-do="qp-ai"]')) return bad.concat(['the maths box with no scheme drew no pad box, a plain Send, or no AI Check']);
  fi.focus();
  press('4'); press('2');
  press('!done');
  await wait(60);
  if (items('q:Q-KP-FREE').some(i => i.verdict === 'sent')) bad.push('the gold key on a maths box with no scheme sent it to be marked by a person');
  if (pad() && !pad().hidden) bad.push('the gold key left the pad up');
  /* TWO WORKSHEET BOXES SIDE BY SIDE: the key sends the box it is typing in, and only that one. */
  const sh = d.createElement('div');
  d.body.appendChild(sh);
  sh.innerHTML = w.guideBox_(PR, 'iv', 'Independent variable — the one thing you will change') + w.guideBox_(PR, 'dv', 'Dependent variable — what you will measure');
  const dv = sh.querySelectorAll('.kp-in')[1];
  if (!dv || sh.querySelectorAll('.qp-send').length !== 2) bad.push('two worksheet boxes did not draw two boxes with a Send each');
  else {
    dv.focus();
    ['t', 'i', 'm', 'e'].forEach(press);
    press('!done');
    await wait(60);
    const p = items('pr:PR-KP#dv');
    if (p.length !== 1 || p[0].answer !== 'Time' || p[0].verdict !== 'sent') bad.push('the gold key on a worksheet box sent ' + JSON.stringify(p) + ' — wanted one submission of its own box, Time, sent');
    if (items('pr:PR-KP#iv').length) bad.push('the gold key in one worksheet box sent the box beside it');
    if ((dv.closest('.qp-mark').querySelector('.qp-verdict') || {}).textContent !== 'Sent') bad.push('the worksheet box’s own line does not say Sent');
  }
  /* A BOX WITH A SCHEME: Check, as before. */
  const cc = subDraw_(w, CHK);
  const ci = cc.querySelector('.kp-in');
  ci.focus();
  press('1'); press('5'); press('!done');
  await wait(60);
  const c1 = items('q:Q-KP-CHK');
  if (c1.length !== 1 || c1[0].verdict !== 'right' || (cc.querySelector('.qp-verdict') || {}).textContent !== 'Correct') bad.push('the gold key on a box with a scheme did not Check it: ' + JSON.stringify(c1));
  /* AN ESSAY: its key says "done", and neither it nor Ctrl+Enter sends anything — its Send is a tile. */
  const eh = d.createElement('div');
  d.body.appendChild(eh);
  eh.innerHTML = w.questionCard_(ESS, 0);
  const ei = eh.querySelector('.kp-in[data-kp-essay]');
  if (!ei) bad.push('the forty-mark English question drew no essay sheet — its "done" was NOT pressed');
  else {
    if (eh.querySelector('[data-do="qp-send"]') || !eh.querySelector('.qt-row .qp-ai-go')) bad.push('with AI marking off the essay sheet drew a plain Send, or no AI Check — a human never marks (round 3)');
    ei.focus();
    ['O', 'n', 'c', 'e'].forEach(c => kd(ei, c));
    press('!done');
    kd(ei, 'Enter', { ctrlKey: true });
    await wait(60);
    if (items('q:Q-KP-ESS').length) bad.push('the essay’s "done" (or Ctrl+Enter) sent it — on an essay the key only puts the pad away (note 312)');
  }
  w.stuffItemsAll_ = held;
  w.__t.USER(null);
  return bad;
});

/* ---------- WHAT WAS DONE BEFORE THE SWITCH BECOMES A SUBMISSION, ONCE, FOR ITS OWN PERSON (decided 10 Oct) § */
check('submission: what a child had done before the switch becomes one submission each, marked as its press would be — once, on any device, and never another person’s', async () => {
  const LIB = LIB_FULL.rows('questions');
  const IDS = ['Q-1MA1-2406-1F-4', 'Q-1MA1-2406-2F-1', 'Q-STA-KS2-2024-P2-2', 'Q-STA-KS2-2024-P2-10', 'Q-9MA031-2206-1a', 'Q-9MA031-2206-1aii', 'Q0109', 'Q0110'];
  const lib = LIB.filter(r => IDS.indexOf(r.row_id) !== -1);
  if (lib.length !== IDS.length) return ['data/questions.json no longer has ' + IDS.filter(id => !lib.some(r => r.row_id === id)).join(', ') + ' — nothing was migrated'];
  const serve = u => (/data\/questions\.json/.test(u) ? lib : /data\/videos\.json/.test(u) ? [] : undefined);
  const K = id => 'q:' + id;
  /* THE LAST EDIT ON ITS DONE DAY, BY THIS DEVICE'S CLOCK — as the old code left every answer it dated: § */
  const AT = new Date(2026, 9, 6, 15, 0, 0).getTime();
  /* THE DEVICE AS THE OLD CODE LEFT IT: § */
  const DEVICE = {
    'familyUser': JSON.stringify(ANS_ADA),
    ['done:u:P7:' + K('Q-1MA1-2406-1F-4')]: '2026-10-06', ['ans:u:P7:' + K('Q-1MA1-2406-1F-4')]: '3,4,5,2,1', ['ansAt:ans:u:P7:' + K('Q-1MA1-2406-1F-4')]: String(AT),
    ['done:u:P7:' + K('Q-STA-KS2-2024-P2-2')]: '2026-10-06', ['ans:u:P7:' + K('Q-STA-KS2-2024-P2-2')]: '4,1',
    ['done:u:P7:' + K('Q-9MA031-2206-1a')]: '2026-10-06', ['ans:u:P7:' + K('Q-9MA031-2206-1a')]: '5',
    ['done:u:P7:' + K('Q0109')]: '2026-10-07', ['ans:u:P7:' + K('Q0109')]: '42',
    ['done:u:P7:' + K('Q0110')]: '2026-10-07', ['ans:u:P7:' + K('Q0110')]: '  ',
    ['done:u:P7:q:Q-GONE-FROM-LIBRARY']: '2026-10-07', ['ans:u:P7:q:Q-GONE-FROM-LIBRARY']: 'x',
    ['done:u:P7:' + K('Q-STA-KS2-2024-P2-10')]: '2026-10-07', ['ans:u:P7:' + K('Q-STA-KS2-2024-P2-10')]: '2,3',
    ['ans:u:P7:' + K('Q-9MA031-2206-1aii')]: '0.92',
    ['done:u:P8:' + K('Q0109')]: '2026-10-07', ['ans:u:P8:' + K('Q0109')]: '99',
    ['ans:' + K('Q0110')]: '77',
  };
  const seed = (extra, drop) => win => { Object.keys(DEVICE).concat(Object.keys(extra || {})).forEach(k => { if (!(drop || []).includes(k)) win.localStorage.setItem(k, k in (extra || {}) ? extra[k] : DEVICE[k]); }); };
  const rows = [];
  rows.push({ pid: 'P7', id: '1760000000201-ac0001', key: K('Q-STA-KS2-2024-P2-10'), answer: '2,3', verdict: 'right', at: Date.now() - 5000 });
  const sub = (b, feat) => Object.assign(payload(), { features: feat || SUB_FEATURES, submissions: subMine_(rows, 'P7') });
  const { w, sent } = boot({ payload: sub(), reply: ansBackend_({}, subBackend_(rows)), serve: serve, before: seed() });
  await wait(700);
  if (typeof w.subMigrate_ !== 'function' || typeof w.subMigrateId_ !== 'function') return ['subMigrate_ / subMigrateId_ not reachable — renamed? Nothing was migrated'];
  const bad = [];
  const items = s => [].concat(...s.filter(b => b.action === 'submitAnswer').map(b => b.items || []));
  const of = (s, id) => items(s).filter(i => i.key === K(id));
  const want = [['Q-1MA1-2406-1F-4', '3,4,5,2,1', 'right'], ['Q-STA-KS2-2024-P2-2', '4,1', 'right'], ['Q-9MA031-2206-1a', '5', 'wrong'], ['Q0109', '42', 'sent']];
  want.forEach(([id, a, v]) => {
    const got = of(sent, id);
    if (got.length !== 1 || got[0].answer !== a || got[0].verdict !== v) bad.push(id + ' done before the switch went up as ' + JSON.stringify(got) + ' — wanted one submission, ' + a + ', ' + v + ' by the site’s own marker');
    else if (got[0].id !== w.subMigrateId_('P7', K(id)) || !/^\d{10,16}-[a-z0-9]{3,16}$/.test(got[0].id)) bad.push(id + ' went up with id ' + got[0].id + ' — wanted the one made from the person and the key, in the server’s shape');
  });
  const f4 = of(sent, 'Q-1MA1-2406-1F-4')[0];
  if (f4 && f4.at !== AT) bad.push('the migrated press is dated ' + f4.at + ' — wanted its answer’s own last edit (' + AT + '), so a press made since is later');
  if (f4 && !f4.label) bad.push('the migrated press carries no name — the weekly email prints the name a parent reads');
  [['Q-9MA031-2206-1aii', 'a draft never done'], ['Q0110', 'an empty answer'], ['Q-STA-KS2-2024-P2-10', 'a question the account already has a submission for']].forEach(([id, what]) => {
    if (of(sent, id).length) bad.push(what + ' (' + id + ') was sent: ' + JSON.stringify(of(sent, id)));
  });
  if (items(sent).some(i => i.key === 'q:Q-GONE-FROM-LIBRARY')) bad.push('a key the library has not got was sent — nothing can name or mark it');
  if (items(sent).some(i => i.answer === '99' || i.answer === '77')) bad.push('ANOTHER PERSON’S ANSWER, OR A SIGNED-OUT ONE, WAS SENT AS ADA’S: ' + JSON.stringify(items(sent).filter(i => i.answer === '99' || i.answer === '77')));
  if (w.localStorage.getItem('ans:u:P8:' + K('Q0109')) !== '99' || w.localStorage.getItem('done:u:P8:' + K('Q0109')) !== '2026-10-07' || w.localStorage.getItem('subLast:u:P8') || w.localStorage.getItem('subMigrated:u:P8')) bad.push('Ben’s keys on the same device were touched by Ada’s migration');
  if (!w.localStorage.getItem('subMigrated:u:P7')) bad.push('the migration did not mark itself done for Ada on this device');
  /* ON THE CARD: the migrated verdict, like any press. */
  const ord = w.stuffItemsAll_().find(it => it.key === K('Q-1MA1-2406-1F-4'));
  if (!ord) bad.push('the ordering did not come through the loader');
  else if (subSlotOf_(subDraw_(w, ord)).textContent !== 'Correct') bad.push('the migrated ordering’s card says ' + JSON.stringify(subSlotOf_(subDraw_(w, ord)).textContent) + ' — wanted Correct');
  const n1 = rows.length;
  /* A SECOND LOAD ON THE SAME DEVICE, AND THE PASS RUN AGAIN IN THE SAME VISIT: nothing more. */
  const sent1 = items(sent).length;
  w.__t.DATA().submissions = subMine_(rows, 'P7');
  w.adoptMarks_();
  w.localStorage.removeItem('subMigrated:u:P7');
  w.subMigrate_();
  await wait(60);
  if (items(sent).length !== sent1) bad.push('the migration sent again on the same device — ' + (items(sent).length - sent1) + ' more');
  const store = {};
  for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); store[k] = w.localStorage.getItem(k); }
  const again = boot({ payload: sub(), reply: ansBackend_({}, subBackend_(rows)), serve: serve, before: win => { Object.keys(store).forEach(k => win.localStorage.setItem(k, store[k])); } });
  await wait(700);
  if (items(again.sent).length) bad.push('a reload of the same device migrated again: ' + JSON.stringify(items(again.sent).map(i => i.key)));
  /* THE COMPUTER — the same answers, no flag — after the iPad's presses reached the account: none sent. */
  const pc = boot({ payload: sub(), reply: ansBackend_({}, subBackend_(rows)), serve: serve, before: seed() });
  await wait(700);
  if (items(pc.sent).length) bad.push('a second device migrated questions the account already had from the first: ' + JSON.stringify(items(pc.sent).map(i => i.key)));
  /* AND ONE THAT LOADED BEFORE THE ACCOUNT HAD THEM — its payload the account as it was before the iPad's
     presses arrived, the one real press on it: the same ids, so the account writes each once. */
  const early = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: subMine_(rows.slice(0, 1), 'P7') }), reply: ansBackend_({}, subBackend_(rows)), serve: serve, before: seed() });
  await wait(700);
  const ids1 = want.map(([id]) => (of(sent, id)[0] || {}).id).sort().join();
  const ids2 = want.map(([id]) => (of(early.sent, id)[0] || {}).id).sort().join();
  if (ids1 !== ids2) bad.push('two devices migrated the same questions under different ids — ' + ids1 + ' / ' + ids2 + ' — the account would hold each twice');
  if (rows.length !== n1) bad.push('the same questions migrated from a second device made ' + (rows.length - n1) + ' more row(s) on the account');
  /* AN OLD BACKEND STILL LIVE: its `attempts` row is a question done, the press is queued (not sent: it cannot
     take it), and it goes up the first time the backend can. */
  const oldRows = [];
  const old = boot({ payload: Object.assign(payload(), { features: ANS_FEATURES, attempts: { for: 'P7', mine: { [K('Q-1MA1-2406-2F-1')]: { first: '2026-10-01', last: '2026-10-02', times: 1 } } } }),
    reply: ansBackend_({}, subBackend_(oldRows)), serve: serve,
    before: seed({ ['ans:u:P7:' + K('Q-1MA1-2406-2F-1')]: '2,5,4,1,3' }) });
  await wait(700);
  if (items(old.sent).length) bad.push('a backend without submitAnswer was sent the migrated presses');
  let q = [];
  try { q = JSON.parse(old.w.localStorage.getItem('subQ:u:P7') || '[]'); } catch (e) {}
  const q2 = q.find(i => i.key === K('Q-1MA1-2406-2F-1'));
  if (!q2 || q2.verdict !== 'right' || q2.answer !== '2,5,4,1,3') bad.push('a question in an old backend’s `attempts` was not queued as a submission: ' + JSON.stringify(q.map(i => [i.key, i.verdict])));
  else if (q2.at !== new Date(2026, 9, 2, 12).getTime()) bad.push('the attempts row’s press is dated ' + q2.at + ' — wanted noon on its last day');
  old.w.__t.DATA().features = SUB_FEATURES;
  old.w.__t.DATA().submissions = { for: 'P7', mine: {} };
  old.w.adoptMarks_();
  await wait(80);
  if (!of(old.sent, 'Q-1MA1-2406-2F-1').length) bad.push('the queued migration did not go up once the backend could take it');
  return bad;
});

/* ---------- A TYPED ANSWER IS ON THE ACCOUNT ONLY AS IT WAS SENT (found at the merge with 317) § */
check('submission: a typed draft the store refuses is not on the account until it is sent — the line says so, and leaving asks first', async () => {
  const rows = [];
  const { w } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES }), reply: ansBackend_({}, subBackend_(rows)), before: signedInAs_(ANS_ADA) });
  await wait(300);
  const need = ansNeed_(w).concat(['keepAtRisk_', 'ansOnAccount_'].filter(n => typeof w[n] !== 'function'));
  if (need.length) return [need.join(', ') + ' not reachable — nothing was refused'];
  const bad = [];
  const c = ansCards_(w, 'R');
  /* THE MATHS BOX (round 3): a box with no scheme is the AI's to mark, so the box with a scheme is the one sent here */
  const k = 'ans:u:P7:' + c.maths.key;
  const real = w.Storage.prototype.setItem;
  w.Storage.prototype.setItem = function (key, v) {
    if (/^(ans|pad|draft):/.test(String(key))) throw new w.DOMException('The quota has been exceeded.', 'QuotaExceededError');
    return real.call(this, key, v);
  };
  try {
    ansType_(w, c.kp(), '0.7');
    if (c.saidFor(c.maths) !== 'Not saved — this browser is not keeping it') bad.push('a typed draft the store refused says ' + JSON.stringify(c.saidFor(c.maths)) + ' — it is on no device and on no account');
    if (w.keepAtRisk_().indexOf(k) === -1) bad.push('a typed draft the store refused is not counted as at risk: ' + JSON.stringify(w.keepAtRisk_()));
    const ev = new w.Event('beforeunload', { cancelable: true });
    w.dispatchEvent(ev);
    if (!ev.defaultPrevented) bad.push('leaving with a refused, unsent draft did not ask first');
    /* SENT: the account holds exactly this, so nothing is at risk and the line says where it went. */
    const send = c.kp().closest('.qp-mark') && c.kp().closest('.qp-mark').querySelector('.qt-row [data-do="qp-check"]');
    if (!send) bad.push('the maths box has no Check — nothing to send it with');
    else {
      send.click();
      await wait(60);
      if (rows.length !== 1) bad.push('Send went up ' + rows.length + ' time(s)');
      if (w.keepAtRisk_().indexOf(k) !== -1) bad.push('an answer the account holds, exactly as sent, is still counted as at risk');
      if (c.saidFor(c.maths) !== 'Sent to Ada’s account') bad.push('after Send the line says ' + JSON.stringify(c.saidFor(c.maths)));
      ansType_(w, c.kp(), '0.75');
      if (w.keepAtRisk_().indexOf(k) === -1) bad.push('typed on after Send, the refused draft is counted as on the account again');
    }
  } finally { w.Storage.prototype.setItem = real; }
  w.__t.USER(null);
  return bad;
});

/* ---------- AN EMPTY SUBMISSION NEVER EMPTIES A BOX (decided 10 Oct) ---------------------------------------- */
check('submission: an empty answer on the account is nobody’s latest and never written over what a box holds', async () => {
  const { w } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES }), reply: ansBackend_({}, subBackend_([])) });
  await wait(300);
  if (typeof w.subAdopt_ !== 'function') return ['subAdopt_ not reachable — nothing was adopted'];
  const bad = [];
  w.__t.USER(Object.assign({}, ANS_ADA));
  w.stuffItemsAll_ = () => [SUB_SUM];
  const card = subDraw_(w, SUB_SUM);
  ansType_(w, card.querySelector('.qp-ans-in'), '15');
  card.querySelector('.qp-check').click();
  await wait(40);
  w.__t.DATA().submissions = { for: 'P7', mine: { 'q:Q-SUB-1': { answer: '', verdict: 'wrong', at: Date.now() + 60000, id: '1760000000301-em0001' } } };
  w.adoptMarks_();
  await wait(40);
  if (card.querySelector('.qp-ans-in').value !== '15' || w.localStorage.getItem('ans:u:P7:q:Q-SUB-1') !== '15') bad.push('an empty submission emptied the box: ' + JSON.stringify(card.querySelector('.qp-ans-in').value));
  if (subSlotOf_(card).textContent !== 'Correct') bad.push('an empty submission became the latest: the card says ' + JSON.stringify(subSlotOf_(card).textContent));
  w.__t.USER(null);
  return bad;
});

/* ---------- THE CARRY-OVER READS WHAT THE OLD CODE LEFT, NOT A DRAFT WRITTEN INTO THE KEY SINCE (review of 10 Oct) § */
const SUB_PRE_ = (() => {
  const K = 'q:Q-9MA031-2206-1a';
  const OCT5 = new Date(2026, 9, 5, 15, 0, 0).getTime();
  const row = () => LIB_FULL.rows('questions').filter(r => r.row_id === 'Q-9MA031-2206-1a');
  const seed = (outToo, me) => win => {
    if (me) win.localStorage.setItem('familyUser', JSON.stringify(me));
    win.localStorage.setItem('done:u:P7:' + K, '2026-10-05');
    win.localStorage.setItem('ans:u:P7:' + K, '0.0197');
    win.localStorage.setItem('ansAt:ans:u:P7:' + K, String(OCT5));
    if (outToo) { win.localStorage.setItem('ans:' + K, '5'); win.localStorage.setItem('ansAt:ans:' + K, String(Date.now() - 60000)); }
  };
  /* EVERY PRESS FOR THE QUESTION, SENT OR STILL QUEUED (an old backend cannot take them yet). */
  const presses = (w, sent) => {
    let q = [];
    try { q = JSON.parse(w.localStorage.getItem('subQ:u:P7') || '[]'); } catch (e) {}
    const its = [].concat(...sent.filter(b => b.action === 'submitAnswer').map(b => b.items || []));
    const seen = new Set();
    return its.concat(q).filter(i => i.key === K && !seen.has(i.id + '|' + i.answer) && seen.add(i.id + '|' + i.answer));
  };
  return { K, OCT5, row, seed, presses };
})();
check('submission: the carry-over sends what the old code left, never a draft written into the key since — claimed at a sign-in from nobody, now or once the payload lands, or typed before the pass could run', async () => {
  const { K, OCT5, row, seed, presses } = SUB_PRE_;
  if (row().length !== 1) return ['data/questions.json no longer has Q-9MA031-2206-1a — nothing was carried'];
  const bad = [];
  const say = list => JSON.stringify(list.map(i => [i.answer, i.verdict, i.at === OCT5 ? '5 Oct' : new Date(i.at).toISOString()]));
  /* 1 AND 2. THE CLAIM AND THE PASS IN ONE SIGN-IN FROM NOBODY — the live backend (no submitAnswer: queued),
     and the new one (the sign-in reply carries her submissions: sent at once). */
  for (const NEW of [false, true]) {
    const tag = NEW ? 'the new backend' : 'the live backend';
    const rows = [];
    const { w, sent } = boot({ payload: Object.assign(payload(), { features: NEW ? SUB_FEATURES : [] }), reply: ansBackend_({}, subBackend_(rows)),
      serve: u => (/data\/questions\.json/.test(u) ? row() : /data\/videos\.json/.test(u) ? [] : undefined), before: seed(true) });
    await wait(600);
    if (w.__t.whoami()) { bad.push(tag + ': the setup booted signed in — nothing was claimed'); continue; }
    w.signedIn_(Object.assign({ success: true }, ANS_ADA, NEW ? { submissions: { for: 'P7', mine: {} } } : {}), 'ada_kind7');
    await wait(300);
    const got = presses(w, sent);
    if (got.some(i => i.answer === '5')) bad.push(tag + ': THE CLAIMED SIGNED-OUT DRAFT "5" WENT UP AS ADA’S SUBMISSION — nobody pressed it: ' + say(got));
    const hers = got.filter(i => i.answer === '0.0197');
    if (hers.length !== 1 || hers[0].verdict !== 'right' || hers[0].at !== OCT5) bad.push(tag + ': her 5 Oct "0.0197" was not carried as one right press dated 5 Oct: ' + say(got));
    if (w.localStorage.getItem('ans:u:P7:' + K) !== '5') bad.push(tag + ': the box no longer holds the claimed draft "5" (318: the later edit is hers, as a draft) — it holds ' + JSON.stringify(w.localStorage.getItem('ans:u:P7:' + K)));
    if (w.localStorage.getItem('ans:' + K) !== null) bad.push(tag + ': the signed-out copy was left for the next child');
    if (w.localStorage.getItem('subBefore:u:P7') !== null) bad.push(tag + ': what the claim wrote over was kept after the pass had run');
    if (NEW && rows.filter(r => r.key === K).length !== 1) bad.push(tag + ': the account holds ' + rows.filter(r => r.key === K).length + ' row(s) for the question — wanted her one carried press');
    w.__t.USER(null);
  }
  /* 3. THE PAYLOAD — AND THE LIBRARY IN IT — STILL OUT AT THE SIGN-IN, as on any reload signed in within the
     fifteen seconds it takes: the claim runs at once and the pass waits for the library, then reads the key. */
  {
    let release = null;
    const late = new Promise(r => { release = () => r(row()); });
    const rows = [];
    const { w, sent } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: {} } }), reply: ansBackend_({}, subBackend_(rows)),
      serve: u => (/data\/questions\.json/.test(u) ? late : /data\/videos\.json/.test(u) ? [] : undefined), before: seed(true) });
    await wait(300);
    w.signedIn_(Object.assign({ success: true, submissions: { for: 'P7', mine: {} } }, ANS_ADA), 'ada_kind7');
    await wait(200);
    if (presses(w, sent).length) bad.push('the payload still out: something was carried before the library could mark it: ' + say(presses(w, sent)));
    release();
    await wait(1200);
    const got = presses(w, sent);
    if (got.some(i => i.answer === '5')) bad.push('the payload landing after the sign-in: THE CLAIMED DRAFT "5" WENT UP AS ADA’S SUBMISSION: ' + say(got));
    if (got.filter(i => i.answer === '0.0197' && i.verdict === 'right' && i.at === OCT5).length !== 1) bad.push('the payload landing after the sign-in: her 5 Oct "0.0197" was not carried (what the claim wrote over was lost): ' + say(got));
    if (!w.localStorage.getItem('subMigrated:u:P7')) bad.push('the payload landing after the sign-in: the pass never marked itself done');
    w.__t.USER(null);
  }
  /* 4. TYPED BEFORE THE PASS COULD RUN — signed in at boot, the payload out, and the box written by its own writer (`ansStore_`, what the `input` listener calls) § */
  {
    let release = null;
    const late = new Promise(r => { release = () => r(row()); });
    const rows = [];
    const { w, sent } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: {} } }), reply: ansBackend_({}, subBackend_(rows)),
      serve: u => (/data\/questions\.json/.test(u) ? late : /data\/videos\.json/.test(u) ? [] : undefined), before: seed(false, ANS_ADA) });
    await wait(300);
    if (!w.__t.whoami()) bad.push('the setup did not boot signed in');
    w.ansStore_('ans:u:P7:' + K, '5');
    release();
    await wait(1200);
    const got = presses(w, sent);
    if (got.some(i => i.answer === '5')) bad.push('typed before the payload landed: THE DRAFT "5" WENT UP AS A SUBMISSION NOBODY PRESSED: ' + say(got));
    if (w.localStorage.getItem('ans:u:P7:' + K) !== '5') bad.push('typed before the payload landed: the draft is gone from the box');
    w.__t.USER(null);
  }
  return bad;
});

/* ---------- A QUEUE THE STORE REFUSES IS STILL SENT, AND A PRESS LEFT MARKED TO GO IS QUEUED AGAIN (review of 10 Oct) § */
check('submission: a queue the store refuses is held for the visit and sent, the carry-over is not marked done over it, and a press left marked to go is queued again without hiding a later one', async () => {
  const { K, OCT5, row } = SUB_PRE_;
  if (row().length !== 1) return ['data/questions.json no longer has Q-9MA031-2206-1a — nothing was refused'];
  const bad = [];
  const serve = u => (/data\/questions\.json/.test(u) ? row() : /data\/videos\.json/.test(u) ? [] : undefined);
  const refuse = (win, re) => {
    const real = win.Storage.prototype.setItem;
    win.Storage.prototype.setItem = function (key, v) {
      if (re.test(String(key))) throw new win.DOMException('The quota has been exceeded.', 'QuotaExceededError');
      return real.call(this, key, v);
    };
    return () => { win.Storage.prototype.setItem = real; };
  };
  const dump = w => { const o = {}; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); o[k] = w.localStorage.getItem(k); } return o; };
  /* 1. CHECK WITH THE QUEUE'S WRITE REFUSED: held for the visit, sent, and the line says where it went. */
  {
    const rows = [];
    const { w } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: {} } }), reply: ansBackend_({}, subBackend_(rows)), before: signedInAs_(ANS_ADA) });
    await wait(400);
    const undo = refuse(w, /^subQ:/);
    try {
      const card = subDraw_(w, SUB_SUM);
      ansType_(w, card.querySelector('.qp-ans-in'), '15');
      w.__t.ACTIONS['qp-check'](card.querySelector('.qp-check'));
      await wait(200);
      const line = savedWords_(card.parentNode.querySelector('.qp-saved'));
      if (rows.length !== 1) bad.push('Check with the queue’s write refused put ' + rows.length + ' row(s) on the account — the press lived only in a copy nothing read');
      if (line !== 'Sent to Ada’s account') bad.push('Check with the queue’s write refused: the line under the box says ' + JSON.stringify(line));
    } finally { undo(); }
    w.__t.USER(null);
  }
  /* 2. THE CARRY-OVER ON THE LIVE BACKEND WITH THE STORE REFUSING THE QUEUE — and then the queue and the latest both — and the next load, with room again and the § */
  for (const re of [/^subQ:/, /^sub(Q|Last):/]) {
    const tag = re.source.indexOf('Last') !== -1 ? 'the queue and the latest refused' : 'the queue refused';
    const rows = [];
    let undo = null;
    const one = boot({ payload: Object.assign(payload(), { features: [] }), reply: ansBackend_({}, subBackend_(rows)), serve,
      before: win => { win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA)); win.localStorage.setItem('done:u:P7:' + K, '2026-10-05'); win.localStorage.setItem('ans:u:P7:' + K, '0.0197'); win.localStorage.setItem('ansAt:ans:u:P7:' + K, String(OCT5)); undo = refuse(win, re); } });
    await wait(700);
    const store = dump(one.w);
    if (undo) undo();
    const two = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: {} } }), reply: ansBackend_({}, subBackend_(rows)), serve,
      before: win => { Object.keys(store).forEach(k => win.localStorage.setItem(k, store[k])); } });
    await wait(900);
    const hers = rows.filter(r => r.key === K && r.answer === '0.0197');
    if (hers.length !== 1) bad.push(tag + ': the next load, with room again, put ' + hers.length + ' row(s) of her 5 Oct answer on the account — wanted one (the carry-over was ' + (store['subMigrated:u:P7'] ? 'flagged done' : 'not flagged') + ')');
    two.w.__t.USER(null);
  }
  /* 3. A PRESS LEFT MARKED TO GO BY SUCH A VISIT, AND A LATER ONE FROM THE COMPUTER ON THE ACCOUNT. */
  {
    const rows = [];
    const later = { answer: '0.5', verdict: 'wrong', at: Date.now() - 1000, id: (Date.now() - 1000) + '-pc0001' };
    const { w } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: { [K]: later } } }), reply: ansBackend_({}, subBackend_(rows)), serve,
      before: win => {
        win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA));
        win.localStorage.setItem('ans:u:P7:' + K, '0.0197');
        win.localStorage.setItem('subMigrated:u:P7', '1');
        win.localStorage.setItem('subLast:u:P7', JSON.stringify({ [K]: { a: '0.0197', v: 'right', at: OCT5, id: '1791504000000-m03m2vvv0q4ubt5', q: 1 } }));
      } });
    await wait(900);
    const it = w.stuffItemsAll_().find(x => x.key === K);
    if (!it) bad.push('the question did not come through the loader');
    else {
      const card = subDraw_(w, it);
      const slot = subSlotOf_(card).textContent, box = card.querySelector('.qp-ans-in').value;
      if (slot !== 'Not yet' || box !== '0.5') bad.push('the computer’s later "0.5" (Not yet) is not the latest here: the card says ' + JSON.stringify(slot) + ' and the box holds ' + JSON.stringify(box) + ' — kept behind a press the queue never had');
    }
    if (rows.filter(r => r.id === '1791504000000-m03m2vvv0q4ubt5').length !== 1) bad.push('the press left marked to go never reached the account (' + rows.length + ' rows) — it is an event too');
    w.__t.USER(null);
  }
  return bad;
});

/* ---------- SIGN OUT SENDS THE PRESSES BEFORE IT ENDS THE SESSION (review of 10 Oct) § */
check('submission: Sign out sends what is still queued — the press in flight and the one behind it — on the token it is ending, and ends the session only after', async () => {
  const rows = [], ended = new Set(), held = [];
  const reply = b => {
    if (b.action === 'signOut') { ended.add(b.token); return { success: true }; }
    if (b.action === 'submitAnswer') return new Promise(res => held.push(() => res(ended.has(b.token) ? { error: 'Please sign in again.', why: 'signed-out' } : subBackend_(rows)(b))));
    return ansBackend_({}, subBackend_(rows))(b);
  };
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: {} } }), reply, before: signedInAs_(ANS_ADA) });
  await wait(400);
  const bad = [], A = w.__t.ACTIONS;
  const two = Object.assign({}, SUB_SUM, { key: 'q:Q-SUB-2', row: Object.assign({}, SUB_SUM.row, { row_id: 'Q-SUB-2' }) });
  const c1 = subDraw_(w, SUB_SUM), c2 = subDraw_(w, two);
  ansType_(w, c1.querySelector('.qp-ans-in'), '15');
  A['qp-check'](c1.querySelector('.qp-check'));
  await wait(20);
  ansType_(w, c2.querySelector('.qp-ans-in'), '14');
  A['qp-check'](c2.querySelector('.qp-check'));
  await wait(20);
  A['signout'](w.document.createElement('button'));
  await wait(60);
  if (w.__t.whoami()) bad.push('Sign out left somebody signed in');
  if (sent.some(b => b.action === 'signOut')) bad.push('the session was ended while a press was still on the wire — the server may refuse it on the ended token');
  /* THE REPLIES, AS THE SERVER GETS TO THEM — each released, then whatever that let go. */
  for (let n = 0; n < 40 && (held.length || !sent.some(b => b.action === 'signOut')); n++) { held.splice(0).forEach(f => f()); await wait(50); }
  const acts = sent.filter(b => b.action === 'submitAnswer' || b.action === 'signOut');
  const lastSub = acts.map(b => b.action).lastIndexOf('submitAnswer'), out = acts.findIndex(b => b.action === 'signOut');
  if (out === -1) bad.push('the session was never ended on the server');
  else if (lastSub > out) bad.push('a press was sent after the session was ended: ' + acts.map(b => b.action).join(' → '));
  const got = rows.filter(r => r.pid === 'P7').map(r => r.key + '=' + r.answer).sort();
  if (got.join() !== 'q:Q-SUB-1=15,q:Q-SUB-2=14') bad.push('Ada’s account holds ' + JSON.stringify(got) + ' — wanted both presses made before Sign out');
  let q = [];
  try { q = JSON.parse(w.localStorage.getItem('subQ:u:P7') || '[]'); } catch (e) {}
  if (q.length) bad.push('still queued under Ada on this device after Sign out: ' + JSON.stringify(q.map(e => [e.key, e.answer])));
  if (sent.filter(b => b.action === 'submitAnswer').some(b => b.token !== 'tok-P7')) bad.push('a press of Ada’s went up on a token not hers: ' + JSON.stringify(sent.filter(b => b.action === 'submitAnswer').map(b => b.token)));
  /* AND THE NEXT CHILD: nothing of Ada's on Ben's token. */
  w.signedIn_(Object.assign({ success: true, submissions: { for: 'P8', mine: {} } }, ANS_BEN), 'ben_bold8');
  await wait(200);
  held.splice(0).forEach(f => f());
  await wait(100);
  if (sent.some(b => b.action === 'submitAnswer' && b.token === 'tok-P8' && (b.items || []).some(i => /^1[45]$/.test(i.answer)))) bad.push('ADA’S PRESS WENT UP ON BEN’S TOKEN');
  w.__t.USER(null);
  return bad;
});

/* ---------- WHILE THE PAYLOAD IS OUT, A BOX THE ACCOUNT HOLDS SAYS SO, AND NOTHING IS SAID THAT IS NOT KNOWN (review of 10 Oct) § */
check('submission: before the payload lands, a box holding a press the server took says Sent, and a draft or a press on its way says nothing until the payload says which backend it is', async () => {
  const at = Date.now() - 60000;
  const two = Object.assign({}, SUB_SUM, { key: 'q:Q-SUB-2', row: Object.assign({}, SUB_SUM.row, { row_id: 'Q-SUB-2' }) });
  const three = Object.assign({}, SUB_SUM, { key: 'q:Q-SUB-3', row: Object.assign({}, SUB_SUM.row, { row_id: 'Q-SUB-3' }) });
  let release = null;
  const rows = [];
  const mine = { 'q:Q-SUB-1': { answer: '16', verdict: 'wrong', at: at, id: at + '-ack001' } };
  const { w } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: mine } }), reply: ansBackend_({}, subBackend_(rows)),
    serve: u => (u.indexOf('script.google.com') === -1 ? undefined : new Promise(r => { release = () => r(Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: mine } })); })),
    before: win => {
      win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA));
      win.localStorage.setItem('subMigrated:u:P7', '1');
      /* SENT AND ACKNOWLEDGED (no `q`), A DRAFT NEVER SENT, AND A PRESS STILL QUEUED. */
      win.localStorage.setItem('ans:u:P7:q:Q-SUB-1', '16');
      win.localStorage.setItem('ans:u:P7:q:Q-SUB-2', '14');
      win.localStorage.setItem('ans:u:P7:q:Q-SUB-3', '15');
      win.localStorage.setItem('subLast:u:P7', JSON.stringify({ 'q:Q-SUB-1': { a: '16', v: 'wrong', at: at, id: at + '-ack001' },
        'q:Q-SUB-3': { a: '15', v: 'right', at: at + 1000, id: (at + 1000) + '-que001', q: 1 } }));
      win.localStorage.setItem('subQ:u:P7', JSON.stringify([{ id: (at + 1000) + '-que001', key: 'q:Q-SUB-3', answer: '15', verdict: 'right', at: at + 1000 }]));
    } });
  await wait(300);
  if (!release) return ['the payload was never asked for — nothing was held, and the line was NOT checked'];
  if (typeof w.awaiting_ !== 'function' || !w.awaiting_()) return ['the app is not waiting on the payload — the setup did not hold it, and the line was NOT checked'];
  const bad = [];
  const cards = [SUB_SUM, two, three].map(x => subDraw_(w, x));
  const line = c => savedWords_(c.parentNode.querySelector('.qp-saved'));
  const held = cards.map(line);
  if (held[0] !== 'Sent to Ada’s account') bad.push('the payload out: a box holding the press the server took says ' + JSON.stringify(held[0]) + ' — the account has it');
  [[1, 'a draft never sent'], [2, 'a press still on its way']].forEach(([i, what]) => {
    if (held[i] !== '') bad.push('the payload out: ' + what + ' says ' + JSON.stringify(held[i]) + ' — whether the account keeps presses is not known yet');
  });
  release();
  for (let n = 0; n < 50 && w.awaiting_(); n++) await wait(100);
  await wait(200);
  const landed = cards.map(line);
  if (landed[0] !== 'Sent to Ada’s account') bad.push('the payload landed: the acknowledged box says ' + JSON.stringify(landed[0]));
  if (landed[1] !== 'On this device until you send it') bad.push('the payload landed: the draft says ' + JSON.stringify(landed[1]));
  if (!/^(Sending…|Sent to Ada’s account)$/.test(landed[2])) bad.push('the payload landed: the queued press says ' + JSON.stringify(landed[2]));
  w.__t.USER(null);
  return bad;
});

