#!/usr/bin/env node
/* @family. — tools/one-status.js THE ONE-STATUS CHECK (rule 1.75, owner 23 Nov: UNIFY THE LIBRARY AND PRACTICE, items 4 and 5):
   ONE STATUS SET: a question is not tried / right / part right / wrong (and "answer hidden" only where an answer is hidden), STATUS_IDS in
   js/find-marking.js, worded once in words.json `status-<id>`, said by `statusWord_` from any stored verdict (right, wrong, rule:n/m, ai:n/m, sent).
   ONE MARK RESULT: rule marking (`mark_`) and the read-back of a stored or old AI mark (`verdictOf_`) both give { marks, outOf, verdict, why }
   with verdict one of STATUS_IDS and why one line, through the one maker `markResult_`.
   Held, counted site-wide:
   1. the words: words.json has exactly one `status-<id>` per id, and no other word says a status;
   2. what is said: every stored-verdict sample said on the site (statusWord_), and the Sunday email's figures and card verdicts and its key
      (backend digestHowSay_, digestHow_), is one of the set's words;
   3. no old status word (Correct, Incorrect, Attempted, Unattempted, Not marked yet, Not right, Part marks, Answer checked, Answer hidden) is
      written as a literal in site or backend code, and no Find facet asks a status of its own or the library's bookkeeping (verified) of a child;
   4. the shape: `mark_` over a sample of every active question's marker kind, right and wrong and blank answers, and `verdictOf_` over every
      stored form, return the one shape; and no marker code builds a result but through `markResult_`.
   Each break is then made in memory and must fail it (proved by mutation, every run). Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const VQ = require('./validate-questions.js');
const BVM = require('./lib/backend-vm.js');
const { ROOT, S, main } = require('./lib/gen.js');

const OLD = ['Correct', 'Incorrect', 'Attempted', 'Unattempted', 'Not marked yet', 'Not right', 'Part marks', 'Answer checked', 'Answer hidden'];
const OLD_LIT = new RegExp('[\'"`](?:[✓✗] )?(' + OLD.join('|') + ')[\'"`]');
/* generated copies (their sources are scanned) and the games' own words (not a question's status) */
const SKIP = new Set(['js/kinds.js', 'js/finder-tags.js', 'js/core.js', 'js/qtypes.js', 'js/games.js', 'backend/cards-gen.gs']);
const STORED = ['', 'right', 'wrong', 'sent', 'rule:0/3', 'rule:2/3', 'rule:3/3', 'ai:0/4', 'ai:1/4', 'ai:4/4', 'nonsense'];
const SHAPE = ['marks', 'outOf', 'verdict', 'why'];

function code() {
  const out = [];
  ['js', 'backend'].forEach(d => fs.readdirSync(path.join(ROOT, d)).filter(f => /\.(js|gs)$/.test(f)).forEach(f => {
    const rel = d + '/' + f;
    if (!SKIP.has(rel)) out.push({ rel, text: fs.readFileSync(path.join(ROOT, rel), 'utf8') });
  }));
  return out;
}

/* ONE RESULT'S FAULT, or '' */
function shapeFault(r, ids) {
  if (!r || typeof r !== 'object') return 'no result';
  const miss = SHAPE.filter(k => !(k in r));
  if (miss.length) return 'no ' + miss.join(', ');
  if ('max' in r) return 'a second total (max)';
  if (!ids.includes(r.verdict)) return 'verdict ' + JSON.stringify(r.verdict) + ' not in the set';
  if (typeof r.marks !== 'number' || typeof r.outOf !== 'number') return 'marks or outOf not a number';
  if (typeof r.why !== 'string' || /\n/.test(r.why)) return 'why not one line';
  if (!r.state && r.outOf > 0 && r.verdict !== (r.marks >= r.outOf ? 'right' : r.marks > 0 ? 'part' : 'wrong')) return 'verdict ' + r.verdict + ' for ' + r.marks + '/' + r.outOf;
  return '';
}

/* EVERYTHING THE CHECK LOOKS AT, gathered once */
function gather() {
  const words = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'words.json'), 'utf8')).words;
  const facets = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'settings', 'facets.json'), 'utf8'));
  const app = VQ.appCode(), call = app.call, ctx = app.ctx;
  call('qtMarker_(workRow_({row:{}}))'); call('padGrid_', true); call('CARD_BLOCKS', true);
  call('text_'); vm_words(ctx, call);
  const ids = call('STATUS_IDS').slice();
  const siteSaid = STORED.map(v => { ctx.__v = v; return { v, said: call('statusWord_(statusOf_(__v))'), read: call('verdictOf_(__v)') }; });
  /* THE MARKERS: a sample of active questions per marker kind, each with its key, a wrong answer and a blank */
  const rows = VQ.rowsOf().filter(r => r.kind !== 'preamble' && r.kind !== 'set');
  const per = {}, marked = [];
  for (const r of rows) {
    let x, kind;
    try { ctx.__r = r; x = call('__x = libQuestion_(__r)'); kind = call('markerOf_(__x).kind'); } catch (e) { continue; }
    if (kind === 'save' || kind === 'draw' || (per[kind] = (per[kind] || 0) + 1) > 40) continue;
    [S(r.answer), 'zzz 0', ''].forEach(a => { ctx.__a = a; let got; try { got = call('mark_(__x, __a)'); } catch (e) { got = null; } marked.push({ key: S(r.row_id) + ' (' + kind + ')', got }); });
  }
  const be = BVM.load({ at: true, console: { log() {}, warn() {}, error() {} } });
  const mail = { say: be.$('digestHowSay_()'), how: STORED.map(v => be.$('digestHow_(' + JSON.stringify(v) + ')')), legend: be.$("['right','wrong'].map(id => statusWord_(id))") };
  return { words, facets, ids, siteSaid, marked, mail, code: code(), per };
}
/* the page reads its words from WORDS_FILE (core.js), as the page has them */
function vm_words(ctx, call) { call('WORDS_FILE'); }

function find(g) {
  const bad = [];
  const set = g.ids.map(id => g.words['status-' + id]);
  /* 1. the words */
  if (g.ids.join() !== 'untried,right,part,wrong,hidden') bad.push('the set is ' + g.ids.join(' / ') + ', not not tried / right / part right / wrong / hidden');
  g.ids.forEach((id, i) => { if (!set[i]) bad.push('no word status-' + id); });
  const extra = Object.keys(g.words).filter(k => /^status-/.test(k) && !g.ids.includes(k.slice(7)));
  if (extra.length) bad.push('status words outside the set: ' + extra.join(', '));
  const oldWords = Object.entries(g.words).filter(([k, v]) => OLD.includes(v) && k !== 'status-hidden' && k !== 'answer-checked');
  if (oldWords.length) bad.push(oldWords.length + ' word(s) saying an old status: ' + oldWords.map(([k, v]) => k + '=' + v).join(', '));
  const inSet = w => set.some(s => s && s.toLowerCase() === String(w).replace(/^[✓✗] /, '').toLowerCase());
  /* 2. what is said */
  g.siteSaid.forEach(s => { if (!inSet(s.said)) bad.push('site says ' + JSON.stringify(s.said) + ' for ' + JSON.stringify(s.v)); });
  (g.mail.say || []).forEach(w => {
    if (!g.ids.includes(w.id)) bad.push('email status ' + w.id + ' not in the set');
    if (!inSet(w.many)) bad.push('email figure says ' + JSON.stringify(w.many));
    if (w.one && !inSet(w.one)) bad.push('email card says ' + JSON.stringify(w.one));
  });
  g.mail.how.forEach((h, i) => { if (!g.ids.includes(h)) bad.push('email reads ' + JSON.stringify(STORED[i]) + ' as ' + h); });
  g.mail.legend.forEach(w => { if (!inSet(w)) bad.push('email key says ' + JSON.stringify(w)); });
  /* 3. no old word in code, no facet of its own */
  const lits = [];
  g.code.forEach(c => c.text.split('\n').forEach((l, i) => { if (OLD_LIT.test(l) && !/^\s*(\/\*|\*|\/\/)/.test(l)) lits.push(c.rel + ':' + (i + 1)); }));
  if (lits.length) bad.push(lits.length + ' old status word(s) in code: ' + lits.slice(0, 6).join(', '));
  const live = g.facets.filter(f => f.active !== false);
  const own = live.filter(f => f.read && /^(myAttemptOf_|verifyTags_)/.test(S(f.read.col)));
  if (own.length) bad.push('facets a child sees asking a status of their own or the library\'s bookkeeping: ' + own.map(f => f.field).join(', '));
  if (!live.some(f => f.read && f.read.col === 'myResultOf_')) bad.push('no status facet (myResultOf_)');
  /* 4. the shape */
  const shapes = [];
  g.marked.forEach(m => { const f = shapeFault(m.got, g.ids); if (f) shapes.push(m.key + ': ' + f); });
  g.siteSaid.forEach(s => { if (s.read) { const f = shapeFault(s.read, g.ids); if (f) shapes.push('verdictOf_(' + JSON.stringify(s.v) + '): ' + f); } });
  if (shapes.length) bad.push(shapes.length + ' result(s) not the one shape: ' + shapes.slice(0, 5).join('; '));
  if (g.marked.length < 30) bad.push('only ' + g.marked.length + ' marker runs sampled');
  const builds = [];
  g.code.forEach(c => c.text.split('\n').forEach((l, i) => { if (/\{\s*verdict\s*[:,].*\b(max|marks)\s*:/.test(l)) builds.push(c.rel + ':' + (i + 1)); }));
  if (builds.length) bad.push(builds.length + ' result(s) built but through markResult_: ' + builds.slice(0, 5).join(', '));
  return bad;
}

function run() {
  const g = gather();
  const bad = find(g);
  console.log('one-status: ' + g.ids.length + ' statuses (' + g.ids.map(id => g.words['status-' + id]).join(' / ') + '), ' + g.siteSaid.length
    + ' stored forms, ' + g.marked.length + ' marker runs over ' + Object.keys(g.per).length + ' marker kinds, ' + g.code.length + ' code files');
  bad.forEach(b => console.log('  ' + b));
  prove(g);
  if (bad.length) throw new Error('one-status: ' + bad.length + ' fault(s)');
}

/* PROVED BY MUTATION: each break, made in memory, must fail the check. */
function prove(g) {
  const w = o => Object.assign({}, g, o);
  const breaks = {
    'an old word on a card': () => w({ code: g.code.concat([{ rel: 'js/zz.js', text: "const t = ok ? 'Correct' : 'Incorrect';" }]) }),
    'a status word reworded': () => w({ words: Object.assign({}, g.words, { 'status-wrong': 'Not right' }) }),
    'a sixth status': () => w({ ids: g.ids.concat(['sent']) }),
    'the site saying another word': () => w({ siteSaid: g.siteSaid.concat([{ v: 'rule:1/2', said: 'Part marks', read: null }]) }),
    'the email saying another word': () => w({ mail: Object.assign({}, g.mail, { say: g.mail.say.concat([{ id: 'open', many: 'not marked yet', one: 'Not marked yet' }]) }) }),
    'an attempted menu again': () => w({ facets: g.facets.concat([{ field: 'myAttempt', read: { by: 'fn', col: 'myAttemptOf_' } }]) }),
    'answer checked shown to a child': () => w({ facets: g.facets.map(f => (f.field === 'verified' ? Object.assign({}, f, { active: true }) : f)) }),
    'a marker returning max': () => w({ marked: g.marked.concat([{ key: 'zz', got: { verdict: 'right', marks: 1, max: 1, why: '' } }]) }),
    'a marker verdict outside the set': () => w({ marked: g.marked.concat([{ key: 'zz', got: { verdict: 'empty', marks: 0, outOf: 1, why: '' } }]) }),
    'a two-line why': () => w({ marked: g.marked.concat([{ key: 'zz', got: { verdict: 'wrong', marks: 0, outOf: 1, why: 'a\nb' } }]) }),
    'a result built by hand': () => w({ code: g.code.concat([{ rel: 'js/zz.js', text: "return { verdict: 'right', marks: 1, max: 1 };" }]) }),
  };
  const missed = Object.keys(breaks).filter(k => !find(breaks[k]()).length);
  console.log('one-status proved: ' + (Object.keys(breaks).length - missed.length) + '/' + Object.keys(breaks).length + ' breaks caught');
  if (missed.length) throw new Error('one-status proved: not caught: ' + missed.join(', '));
}
module.exports = { run, find };
main(module, run);
