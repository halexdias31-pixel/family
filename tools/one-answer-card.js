#!/usr/bin/env node
/* @family. — tools/one-answer-card.js THE ONE-ANSWER-CARD CHECK (rule 1.75, owner 23 Nov: "uniformalize the way the answers work compared to the
   questions"): an answer is the same card as its question. On the site (an iPhone 13, tools/lib/site-browser.js) a sample of every answer face
   (pick, typed number, table, essay) is drawn by questionWhole_ with its answer shown; its question card and its answer card must have the same parts
   in the same order (kinds.json card.question.parts, the answer part apart), the same tags, the same button row in the same order (a button greyed
   on the answer only where it writes or marks an answer), and the answer in the question's own answer box (`.qp-mark`), read-only: no field
   that can be typed in. In the Sunday email (one-question-card's sample week) the answer is in the same box as their answer.
   Counted: every card pair of the sample, and every email card with an answer. `--prove` breaks each rule in turn and fails unless the check
   catches every break (the mutation proof). Run by tools/build.js after `bundle`. */
'use strict';
const SB = require('./lib/site-browser.js'), SD = require('./lib/site-data.js');
const { main } = require('./lib/gen.js');
const QC = require('./one-question-card.js');

/* THE BREAKS --prove makes, each one way an answer card could drift from its question's. */
const BREAKS = ['', 'tags', 'button', 'order', 'textbox', 'pic', 'email'];

async function site(Q, brk) {
  const pg = await SB.open({ as: 'child', show: 'all', user: SB.USERS.child, ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(isQ_) });
  try {
    return await pg.evaluate(([sel, brk]) => {
      const all = stuffItemsAll_().filter(isQ_).filter(x => questionHasAns_(x));
      const kindOf = x => { try { return markerOf_(x).kind; } catch (e) { return '?'; } };
      const faces = { pick: x => kindOf(x) === 'choice', number: x => kindOf(x) === 'accept' && /^\s*-?[\d.]+\s*$/.test(String(x.accept || '').split('|')[0]),
        table: x => kindOf(x) === 'cells', essay: x => ansEssay_(x) || qtFace_(x).sheet };
      const out = [];
      Object.keys(faces).forEach(face => all.filter(faces[face]).slice(0, 6).forEach(x => {
        ANS_SHOWN.add(ansKey_(x));
        const box = document.createElement('div');
        box.innerHTML = questionWhole_(x, [x], null, true, false);
        document.body.appendChild(box);
        const cards = [...box.querySelectorAll('.qwhole > [data-shape="Card"]')];
        const [qc, ac] = cards;
        if (ac && brk === 'tags') { const t = ac.querySelector('.qtag'); if (t) t.remove(); }
        if (ac && brk === 'button') { const t = ac.querySelector('.qt-row .tile'); if (t) t.remove(); }
        if (ac && brk === 'order') { const w = ac.querySelector('.qsheet.qtext'), a = ac.querySelector('.qans-card'); if (w && a) a.after(w); }
        if (ac && brk === 'textbox') { const i = ac.querySelector('.qp-key-in'); if (i) { i.disabled = false; i.setAttribute('data-do', 'qp-ans'); } }
        if (ac && brk === 'pic') { const had = ac.querySelector('.kc-pic > *'); if (had) had.remove(); else { let d = ac.querySelector('.kc-pic'); if (!d) { d = document.createElement('div'); d.className = 'kc-pic'; ac.prepend(d); } d.innerHTML = '<svg></svg>'; } }
        const look = c => {
          if (!c) return null;
          const found = Object.keys(sel).map(k => ({ k, el: c.querySelector(sel[k]) })).filter(p => p.el);
          found.sort((a, b) => (a.el === b.el ? 0 : a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
          return { parts: found.map(p => p.k), tags: [...c.querySelectorAll('.kc-tags .qtag')].map(t => t.textContent.trim()),
            buttons: [...c.querySelectorAll('.qt-row .tile')].map(t => ({ act: (t.getAttribute('data-do') || '').replace(/^qa-hide$/, 'qa-show'), tool: t.getAttribute('data-tool') || '', off: t.classList.contains('kc-off') || t.disabled || t.getAttribute('aria-disabled') === 'true' })),
            box: !!c.querySelector('.qp-mark'), key: !!c.querySelector('.qp-key'),
            typeable: [...c.querySelectorAll('input, textarea')].filter(i => !i.disabled && i.getAttribute('data-do')).length };
        };
        out.push({ face, key: x.key, cards: cards.length, q: look(qc), a: look(ac) });
        box.remove();
      }));
      return out;
    }, [Q.site, brk]);
  } finally { await pg.close(); }
}

/* THE KINDS OF BUTTON AN ANSWER CARD MAY GREY: what writes or marks an answer (find-figures.js QT_KEY_OFF); Show/Hide the answer is live where the answer is. */
const MAY_GREY = /^(qp-check|qp-send|qp-cells-check|qp-noscheme|pad-|qt-pen|qt-inst)/;

async function check(brk) {
  const Q = SD.kinds().question.card.question.parts, bad = [];
  const pairs = await site(Q, brk);
  const faces = {};
  pairs.forEach(p => {
    faces[p.face] = (faces[p.face] || 0) + 1;
    const n = p.face + ' ' + p.key;
    if (p.cards !== 2 || !p.q || !p.a) return bad.push(n + ': ' + p.cards + ' card(s), not a question and its answer');
    const qp = p.q.parts.filter(k => k !== 'answer' && k !== 'theirs' && k !== 'verdict'), ap = p.a.parts.filter(k => k !== 'answer' && k !== 'theirs' && k !== 'verdict');
    if (qp.join() !== ap.join()) bad.push(n + ': question parts ' + qp.join(' › ') + ', answer parts ' + ap.join(' › '));
    if (p.a.parts.indexOf('answer') < 0 || p.q.parts.indexOf('answer') >= 0) bad.push(n + ': the answer is not on the answer card alone (' + p.q.parts.join(' › ') + ' / ' + p.a.parts.join(' › ') + ')');
    if (p.q.tags.join('|') !== p.a.tags.join('|')) bad.push(n + ': tags ' + p.q.tags.join(', ') + ' / ' + p.a.tags.join(', '));
    const qb = p.q.buttons, ab = p.a.buttons;
    if (qb.map(b => b.act + '/' + b.tool).join() !== ab.map(b => b.act + '/' + b.tool).join()) bad.push(n + ': the button rows differ (' + qb.map(b => b.act).join() + ' / ' + ab.map(b => b.act).join() + ')');
    else ab.forEach((b, i) => { if (b.off !== qb[i].off && !(b.off && MAY_GREY.test(b.act)) && b.act !== 'qa-show') bad.push(n + ': button ' + b.act + ' is ' + (b.off ? 'greyed' : 'live') + ' on the answer only'); });
    if (!p.a.box || !p.a.key) bad.push(n + ': the answer is not in the question\'s answer box');
    if (p.a.typeable) bad.push(n + ': the answer card has ' + p.a.typeable + ' field(s) that can be typed in');
  });
  ['pick', 'number', 'table', 'essay'].forEach(f => { if (!faces[f]) bad.push(f + ': no question of this face to draw'); });
  /* THE EMAIL: the answer in the same box as theirs. */
  const E = QC.email();
  let mails = 0;
  E.cards.forEach((c, i) => {
    const at = c.html.indexOf('<!--part:answer-->');
    if (at < 0) return;
    mails++;
    let ans = c.html.slice(at).replace(/^<!--part:answer-->/, '').split('<!--part:')[0];
    if (brk === 'email') ans = ans.replace(/<table[\s\S]*?<td[^>]*>([\s\S]*?)<\/td><\/tr><\/table>/, '<p>$1</p>');
    const look = s => (/<p class="([^"]*)">[^<]*<\/p><table[^>]*><tr><td class="([^"]*)"[^>]*>/.exec(s) || []).slice(1).join('|');
    const t = c.html.indexOf('<!--part:theirs-->');
    const want = look(t >= 0 ? c.html.slice(t) : E.html.slice(E.html.indexOf('<!--part:theirs-->')));
    if (!want || look(ans) !== want) bad.push('email card ' + (i + 1) + ': the answer is not drawn in their answer\'s box');
  });
  return { bad, n: pairs.length, faces, mails };
}

async function run() {
  if (process.argv.indexOf('--prove') > 0) {
    const missed = [];
    const base = new Set((await check('')).bad);
    if (base.size) throw new Error('one-answer-card --prove: the unbroken site already fails (' + [...base][0] + ')');
    for (const b of BREAKS.slice(1)) { const got = (await check(b)).bad.filter(x => !base.has(x)); console.log('  break ' + b + ': ' + (got.length ? 'caught (' + got[0] + ')' : 'MISSED')); if (!got.length) missed.push(b); }
    await SB.done();
    if (missed.length) throw new Error('one-answer-card --prove: missed ' + missed.join(', '));
    console.log('one-answer-card --prove: every break caught (' + (BREAKS.length - 1) + ')');
    return;
  }
  const r = await check('');
  await SB.done();
  console.log('one-answer-card: ' + (r.n - new Set(r.bad.map(b => b.split(':')[0])).size) + '/' + r.n + ' answer cards the same card as their question ('
    + Object.keys(r.faces).map(f => f + ' ' + r.faces[f]).join(', ') + '), read-only; email ' + r.mails + ' answers in their answer\'s box');
  r.bad.slice(0, 30).forEach(b => console.log('  ' + b));
  if (r.bad.length) throw new Error('one-answer-card: ' + r.bad.length + ' difference(s) between a question card and its answer card');
}
module.exports = { run };
main(module, run);
