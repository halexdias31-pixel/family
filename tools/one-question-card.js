#!/usr/bin/env node
/* @family. — tools/one-question-card.js THE ONE-QUESTION-CARD CHECK (rule 1.75, owner 22 Nov: "ONE question card"): the Sunday email draws a
   question as the site's one Question card does — the same parts in the same order (kinds.json `card.question.parts`), the options of a pick
   question with theirs and the right one marked, and the answer as the site's answer card says it (`answerSay_`). Made-up questions only.
   The email: digestRender_ in the backend's vm (tools/lib/backend-vm.js), each card's parts read off its `<!--part:…-->` marks. The site: the
   same pick question drawn by questionWhole_ on an iPhone 13 (tools/lib/site-browser.js), each part found by its `site` selector.
   Fails the build when either card's parts are out of the order, a part is on one card and not the other, the email draws a part the site has
   not (a name line, say), or a pick question's options, marks or answer are not shown. Counted: every card of the sample week.
   `--html <file>` also writes the sample email (its HTML part) to that file. Run by tools/build.js. */
'use strict';
const fs = require('fs');
const { S, main } = require('./lib/gen.js');
const BV = require('./lib/backend-vm.js'), SB = require('./lib/site-browser.js'), SD = require('./lib/site-data.js');

/* ---------- THE SAMPLE: a made-up worksheet of three parts, two of them pick questions (nothing here is a learner's or a real paper's). */
const PICK = { html: '<p>The toy has a mass of 0.15 kg and moves forward with a velocity of 0.08 m/s. How is the momentum of the toy calculated? Tick <b>one</b> box.</p>',
  choices: ['0.15 + 0.08 = 0.230', '0.15 ÷ 0.08 = 1.875', '0.15 × 0.08 = 0.012'], right: [3], answer: 'momentum = mass &times; velocity', typed: 'C' };
const ROWS = [
  { row_id: 'ZZ-SAMPLE', kind: 'document', paper_id: 'ZZ-SAMPLE', name: 'Momentum (sample)', subject: 'Physics', level: 'GCSE', document_type: 'Question set', active: 'TRUE' },
  { row_id: 'ZZ-SAMPLE-1ai', kind: 'question', paper_id: 'ZZ-SAMPLE', question: '1', part: 'ai', marks: '1', active: 'TRUE', html: PICK.html,
    choices: PICK.choices.join(' | '), choice_right: 'C', answer: PICK.answer },
  { row_id: 'ZZ-SAMPLE-1aii', kind: 'question', paper_id: 'ZZ-SAMPLE', question: '1', part: 'aii', marks: '1', active: 'TRUE', html: '<p>What is the unit of momentum? Tick <b>one</b> box.</p>',
    choices: 'kg m/s | m/s² | kg/m/s', choice_right: 'A', answer: 'momentum is mass times velocity, so its unit is a mass unit times a velocity unit' },
  { row_id: 'ZZ-SAMPLE-1b', kind: 'question', paper_id: 'ZZ-SAMPLE', question: '1', part: 'b', marks: '2', active: 'TRUE', html: '<p>Calculate the momentum of a 2 kg ball moving at 3 m/s.</p>',
    accept: '6', answer: '6 kg m/s (2)' },
];
const ITEMS = [
  { key: 'q:ZZ-SAMPLE-1ai', label: 'Physics · Momentum (sample) · Q1ai', verdict: 'right', answer: 'C' },
  { key: 'q:ZZ-SAMPLE-1aii', label: 'Physics · Momentum (sample) · Q1aii', verdict: '', answer: '2' },
  { key: 'q:ZZ-SAMPLE-1b', label: 'Physics · Momentum (sample) · Q1b', verdict: 'wrong', answer: '5' },
];

/* ---------- THE EMAIL'S CARDS, each as the parts its marks name, in order */
function email() {
  const B = BV.load({ at: true, console: { log() {}, warn() {}, error() {} } });
  /* THE LIBRARY FILE'S SHAPE: one row a line, as digestLibraryFind_ reads it. */
  B.__a = ['[\n' + ROWS.map(r => JSON.stringify(r)).join(',\n') + '\n]', ROWS.map(r => r.row_id)];
  const lib = B.$('digestLibraryFind_(__a[0], __a[1])');
  B.__a = [{ first: 'Sam', days: ['2026-11-10'], fresh: ITEMS, again: [] }, { first: 'Alex' }, { start: '2026-11-09', end: '2026-11-15' }, { lib, site: 'https://example.org/', hour: 18 }];
  const m = B.$('digestRender_(__a[0], __a[1], __a[2], __a[3])');
  const html = (m.parts || [m]).map(p => p.html).join('');
  const cards = html.split(/<table role="presentation" class="kc[ "]/).slice(1).map(c => ({ html: c, parts: (c.match(/<!--part:([\w-]+)-->/g) || []).map(x => x.slice(9, -3)) }));
  return { html, cards };
}

/* ---------- THE SITE'S CARD for the same pick question, its parts in document order */
async function site(Q) {
  /* READY WHEN THE LIBRARY'S QUESTIONS ARE IN (words or not: the sample brings its own). */
  const pg = await SB.open({ as: 'child', show: 'all', user: SB.USERS.child, ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(isQ_) });
  try {
    return await pg.evaluate(([P, sel]) => {
      const base = stuffItemsAll_().find(isQ_);
      const x = Object.assign({}, base, { key: 'q:ZZ-SAMPLE-1ai', html: P.html, lead: '', diagram: '', stems: [], images: '', surface: '', uses: '', cells: '', accept: '', markWords: '',
        drawAnswer: '', orderEnds: [], choices: P.choices, choiceRight: P.right, choiceWays: [P.right], answer: P.answer });
      x.row = Object.assign({}, base.row, { row_id: 'ZZ-SAMPLE-1ai', question: '1', part: 'ai', html: P.html, choices: P.choices.join(' | '), choice_right: 'C', answer: P.answer, diagram: '', lead: '' });
      ANS_SHOWN.add(ansKey_(x));
      ansStore_(ansKey_(x), P.typed);
      const box = document.createElement('div');
      box.innerHTML = questionWhole_(x, [x], null, true, false);
      document.body.appendChild(box);
      const found = Object.keys(sel).map(k => ({ k, el: box.querySelector(sel[k]) })).filter(p => p.el);
      found.sort((a, b) => (a.el === b.el ? 0 : a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      const ans = box.querySelector('.qans-card');
      return { parts: found.map(p => p.k), head: (box.querySelector('.kc-head') || {}).textContent || '', answer: ans ? ans.textContent.replace(/\s+/g, ' ').trim() : '',
        options: [...box.querySelectorAll('.qp-optline')].map(e => e.textContent.replace(/\s+/g, ' ').trim()) };
    }, [PICK, Q.site]);
  } finally { await pg.close(); await SB.done(); }
}

async function run() {
  const Q = SD.kinds().question.card.question.parts, order = Q.order, bad = [];
  const inOrder = list => list.every((k, i) => !i || order.indexOf(list[i - 1]) < order.indexOf(k));
  const E = email();
  const at = process.argv.indexOf('--html');
  if (at > 0 && process.argv[at + 1]) fs.writeFileSync(process.argv[at + 1], E.html);
  if (E.cards.length !== ITEMS.length) bad.push('the email drew ' + E.cards.length + ' question cards for ' + ITEMS.length + ' questions');
  E.cards.forEach((c, i) => {
    const name = ITEMS[i] ? ITEMS[i].label.split(' · ').pop() : 'card ' + (i + 1);
    const own = c.parts.filter(k => order.indexOf(k) < 0);
    if (own.length) bad.push('email ' + name + ': parts the site card has not (' + own.join(', ') + ')');
    if (!inOrder(c.parts)) bad.push('email ' + name + ': parts out of the site\'s order (' + c.parts.join(', ') + '; the order is ' + order.join(', ') + ')');
  });
  /* THE PICK QUESTION ITSELF: every option, the right one and theirs marked, the answer by its letter. */
  const pick = E.cards[0] || { html: '', parts: [] };
  PICK.choices.forEach((o, i) => { if (pick.html.indexOf('<b>' + 'ABC'[i] + '</b> ' + o) < 0) bad.push('email Q1ai: option ' + 'ABC'[i] + ' (' + o + ') not shown'); });
  if (!/0\.012 <span[^>]*>✓ Answer<\/span> <span[^>]*>← Their answer/.test(pick.html)) bad.push('email Q1ai: the right option and theirs are not marked on C');
  if (!/Answer<\/p><table[^>]*><tr><td[^>]*><b>C<\/b> 0\.15 × 0\.08 = 0\.012/.test(pick.html.replace(/<\/?b>(?=0)/g, ''))) bad.push('email Q1ai: the answer is not "C 0.15 × 0.08 = 0.012", as the site says it');
  if (!/<b>A<\/b> kg m\/s/.test(E.cards[1] ? E.cards[1].html : '')) bad.push('email Q1aii: the answer is not its key, "A kg m/s"');
  if (/momentum is mass/.test(E.cards[1] ? E.cards[1].html : '')) bad.push('email Q1aii: the answer says the working note, not the key');
  const S1 = await site(Q);
  if (!inOrder(S1.parts)) bad.push('site Q1ai: parts out of the order (' + S1.parts.join(', ') + ')');
  if (S(S1.head).trim()) bad.push('site Q1ai: a name line ("' + S1.head + '") the order does not list');
  if (S1.parts.join() !== pick.parts.join()) bad.push('Q1ai: the site card is ' + S1.parts.join(', ') + ' and the email card ' + pick.parts.join(', '));
  if (S1.answer.indexOf('C 0.15 × 0.08 = 0.012') < 0) bad.push('site Q1ai: its answer card says "' + S1.answer + '", not the right letter and its words');
  console.log('one-question-card: ' + (E.cards.length + 1 - new Set(bad.map(b => b.split(':')[0])).size) + '/' + (E.cards.length + 1) + ' question cards (email ' + E.cards.length + ', site 1) in the one card\'s parts and order'
    + ' — site ' + S1.parts.join(' › ') + '; email ' + pick.parts.join(' › '));
  bad.forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('one-question-card: ' + bad.length + ' difference(s) between the email\'s question card and the site\'s');
}
module.exports = { run, email, ITEMS };
main(module, run);
