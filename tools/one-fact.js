#!/usr/bin/env node
/* @family. — tools/one-fact.js THE ONE-FACT CHECK (rule 1.75, owner 20 Nov: @FAMILY SCIENCE QUESTIONS FROM THE LIBRARY, steps 2–4):
   (a) every fact on an AQA 8461/8462/8463 Foundation card has an id in data/facts.json, and a re-run gives every fact the id it has
       (ids for life: an edit keeps its id, a new line takes a new one, nothing renumbers);
   (b) every fact has at least one live @family question;
   (c) every @family question is one question of the one shape in its idea's one set (company @family, board AQA, tier Foundation, its
       idea_id), names its facts (`tests`), and its key comes from them: each typed key and the ticked option are in its facts' words, and
       its words are its template resolved against the facts now;
   (d) versions: words that changed carry a new version (row id -v<n>), and every older version's row is still there, not live, with its
       words, so an answer keeps the question its student saw.
   Each break is made in memory and must fail it (proved by mutation, every run). Without data-private (a CI checkout) the words parts are
   skipped. Made by `node tools/content.js family --apply` (tools/lib/facts.js, tools/lib/family-q.js). Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT, read, S, main } = require('./lib/gen.js');
const F = require('./lib/facts.js'), Q = require('./lib/family-q.js');

const mine = r => S(r.paper_id).startsWith('P-FAM-AQA-');
const flat = t => S(t).toLowerCase().replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 0x2080)).replace(/[^a-z0-9%°µ²³]+/g, '');
const clone = o => JSON.parse(JSON.stringify(o));

function state() {
  const priv = fs.existsSync(path.join(ROOT, 'data-private', 'textbooks.json')) && fs.existsSync(path.join(ROOT, 'data-private', 'questions.json'));
  return {
    reg: read(F.FILE) || {},
    cards: priv ? F.cardsOf(read('data/textbooks.json') || [], read('data-private/textbooks.json') || {}) : null,
    rows: read('data/questions.json') || [],
    words: priv ? read('data-private/questions.json') || {} : null,
  };
}

function find(s) {
  const bad = [], reg = s.reg, R = reg.questions || {}, facts = reg.facts || {};
  const rows = s.rows.filter(mine), sets = {}, qs = rows.filter(r => r.kind === 'question');
  rows.filter(r => r.kind === 'document').forEach(r => { if (sets[r.paper_id]) bad.push('set ' + r.paper_id + ' twice'); sets[r.paper_id] = r; });
  let text = null;
  /* (a) IDS FOR LIFE */
  if (s.cards) {
    const again = clone(reg), a = F.assign(again, s.cards);
    if (a.made.length) bad.push(a.made.length + ' fact(s) with no id yet: ' + a.made.slice(0, 3).join(', ') + ' — run node tools/content.js family --apply');
    if (a.moved.length) bad.push(a.moved.length + ' fact id(s) not where data/facts.json has them: ' + a.moved.slice(0, 3).join(', '));
    if (a.retired.length) bad.push(a.retired.length + ' fact id(s) for no fact now: ' + a.retired.slice(0, 3).join(', '));
    text = {}; a.facts.forEach(f => { text[f.id] = f.text; });
  }
  (reg.retired || []).forEach(id => { if (facts[id]) bad.push('retired id ' + id + ' given again'); });
  /* (b) EVERY FACT ASKED */
  const live = qs.filter(r => r.active === 'True'), asked = new Set();
  live.forEach(r => S(r.tests).split(/\s+/).forEach(id => asked.add(id)));
  const un = Object.keys(facts).filter(id => !asked.has(id));
  if (un.length) bad.push(un.length + ' fact(s) with no @family question: ' + un.slice(0, 3).join(', '));
  /* (c) ONE QUESTION, ITS KEY FROM ITS FACTS; (d) VERSIONS */
  const ids = new Set(qs.map(r => r.row_id));
  let backed = 0;
  qs.forEach(r => {
    const m = /^(Q-FAM-[0-9a-f]{8})-v(\d+)$/.exec(r.row_id);
    if (!m) { bad.push(r.row_id + ': not an @family id (Q-FAM-<8 hex>-v<n>)'); return; }
    const q = R[m[1]], v = Number(m[2]);
    if (!q) { bad.push(r.row_id + ': not in data/facts.json questions'); return; }
    if (r.active !== 'True') { if (!(q.was || []).includes(v)) bad.push(r.row_id + ': an old version data/facts.json does not list'); return; }
    if (q.v !== v || q.gone) { bad.push(r.row_id + ': live, but data/facts.json has v' + q.v + (q.gone ? ' (gone)' : '')); return; }
    (q.was || []).forEach(o => { if (!ids.has(m[1] + '-v' + o)) bad.push(r.row_id + ': its version ' + o + ' row is gone (an answer saved under it would lose its question)'); });
    const set = sets[r.paper_id];
    if (!set) bad.push(r.row_id + ': in no @family set');
    else if (set.company !== Q.COMPANY || set.exam_board !== Q.BOARD || set.tier !== Q.TIER) bad.push(r.row_id + ': its set is not @family, AQA, Foundation');
    if (Q.SET(q.idea) !== r.paper_id || r.idea_id !== q.idea) bad.push(r.row_id + ': not in its idea\'s set, or idea_id not ' + q.idea);
    const tests = S(r.tests).split(/\s+/).filter(Boolean);
    if (!tests.length || tests.join(' ') !== (q.tests || []).join(' ')) bad.push(r.row_id + ': tests "' + S(r.tests) + '" are not its facts ' + (q.tests || []).join(' '));
    const gone = tests.concat(...Object.values(q.t || {}).map(F.pointsAt)).filter(id => !facts[id]);
    if (gone.length) { bad.push(r.row_id + ': names no fact ' + gone[0]); return; }
    if (!text) return;
    let w;
    try { w = Q.wordsOf(q, id => text[id]); } catch (e) { bad.push(r.row_id + ': ' + e.message); return; }
    if (Q.versionHash(w) !== q.h) bad.push(r.row_id + ': its words changed without a new version');
    const have = s.words[r.row_id] || {};
    const diff = ['html', 'choices', 'choice_right', 'accept', 'answer'].filter(k => S(have[k]) !== S(w[k]));
    if (diff.length) bad.push(r.row_id + ': ' + diff.join(', ') + ' not its template resolved against its facts');
    /* THE KEY BACKED BY ITS FACTS: every typed way, or the ticked option, is in the words of a fact it tests */
    const src = tests.map(id => flat(text[id])).join('|');
    const opts = S(have.choices).split('|').map(x => x.trim()), L = S(have.choice_right).charCodeAt(0) - 65;
    const keys = S(have.choice_right) ? [opts[L]] : S(have.accept).split('|').map(x => x.trim()).filter(Boolean);
    const unbacked = keys.filter(k => !k || !src.includes(flat(k.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'))));
    if (!keys.length || unbacked.length) bad.push(r.row_id + ': key "' + (unbacked[0] || '') + '" not backed by its facts ' + tests.join(' '));
    else backed++;
  });
  return { bad, n: { facts: Object.keys(facts).length, live: live.length, old: qs.length - live.length, sets: Object.keys(sets).length, backed } };
}

function run() {
  const s = state(), { bad, n } = find(s);
  console.log('one-fact: ' + n.facts + ' facts with ids, ' + n.live + ' live @family questions (' + n.old + ' older versions kept) in ' + n.sets + ' sets'
    + (s.words ? ', ' + n.backed + ' keys backed by their facts' : ' (no data-private here: words not checked)'));
  bad.slice(0, 12).forEach(b => console.log('  ' + b));
  prove(s);
  if (bad.length) throw new Error('one-fact: ' + bad.length + ' fault(s); remake with node tools/content.js family --apply');
}

/* PROVED BY MUTATION: each break, made in memory, must fail the check. */
function prove(s) {
  const first = s.rows.find(r => mine(r) && r.kind === 'question' && r.active === 'True');
  if (!first) throw new Error('one-fact proved: no @family question to break');
  const q1 = () => first;
  const withRows = f => Object.assign({}, s, { rows: s.rows.map(r => (r === first ? f(Object.assign({}, r)) : r)).filter(Boolean) });
  const breaks = {
    'a fact with no question': () => { const f = S(first.tests).split(/\s+/)[0]; return Object.assign({}, s, { rows: s.rows.filter(r => !(mine(r) && S(r.tests).split(/\s+/).includes(f))) }); },
    'tests naming no fact': () => withRows(r => Object.assign(r, { tests: 'sc.bio.no-such-idea.f1' })),
    'a question in another board\'s set': () => Object.assign({}, s, { rows: s.rows.map(r => (mine(r) && r.kind === 'document' && r.paper_id === q1().paper_id ? Object.assign({}, r, { exam_board: 'OCR' }) : r)) }),
    'an old version\'s row gone': () => { const reg = clone(s.reg), b = q1().row_id.replace(/-v\d+$/, ''); reg.questions[b].was = [0]; return Object.assign({}, s, { reg }); },
    'a retired id given again': () => { const reg = clone(s.reg); reg.retired = (reg.retired || []).concat([Object.keys(reg.facts)[0]]); return Object.assign({}, s, { reg }); },
  };
  if (s.cards) {
    const id = q1().row_id;
    breaks['a key not backed by its facts'] = () => { const words = clone(s.words); words[id] = Object.assign({}, words[id], words[id].accept ? { accept: 'zzqx' } : { choice_right: String.fromCharCode(66 + ((words[id].choice_right.charCodeAt(0) - 64) % 2)) }); return Object.assign({}, s, { words }); };
    breaks['words changed without a new version'] = () => { const reg = clone(s.reg), b = id.replace(/-v\d+$/, ''); reg.questions[b].t.html += '<p>Now.</p>'; return Object.assign({}, s, { reg }); };
    breaks['a fact renumbered'] = () => { const reg = clone(s.reg), k = Object.keys(reg.facts), x = reg.facts[k[0]]; reg.facts[k[0]] = reg.facts[k[1]]; reg.facts[k[1]] = x; return Object.assign({}, s, { reg }); };
    breaks['a new line with no id'] = () => { const cards = s.cards.slice(); cards[0] = Object.assign({}, cards[0], { w: Object.assign({}, cards[0].w, { points: 'A new line. ' + Date.now() + '|' + S(cards[0].w.points) }) }); return Object.assign({}, s, { cards }); };
  }
  const missed = Object.keys(breaks).filter(k => !find(breaks[k]()).bad.length);
  /* AND IDS FOR LIFE, BY MUTATION: a line put first on a card renumbers nothing, an edited line keeps its id */
  if (s.cards) {
    const c = s.cards[0], pts = S(c.w.points).split('|'), before = F.assign(clone(s.reg), s.cards).facts.map(f => f.id);
    const withPts = p => { const cards = s.cards.slice(); cards[0] = Object.assign({}, c, { w: Object.assign({}, c.w, { points: p.join('|') }) }); return F.assign(clone(s.reg), cards); };
    const ins = withPts(['A new first line.'].concat(pts));
    if (ins.made.length !== 1 || ins.facts.filter(f => !ins.made.includes(f.id)).map(f => f.id).join(' ') !== before.join(' ')) missed.push('ids for life (a new first line renumbered)');
    const ed = withPts(pts.slice(0, -1).concat([pts[pts.length - 1] + ' (edited)']));
    if (ed.made.length || ed.facts.map(f => f.id).join(' ') !== before.join(' ')) missed.push('ids for life (an edited line lost its id)');
  }
  console.log('one-fact proved: ' + (Object.keys(breaks).length + (s.cards ? 2 : 0) - missed.length) + '/' + (Object.keys(breaks).length + (s.cards ? 2 : 0)) + ' breaks caught');
  if (missed.length) throw new Error('one-fact proved: not caught: ' + missed.join(', '));
}
module.exports = { run, find };
main(module, run);
