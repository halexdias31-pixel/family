/* @family. — tools/lib/family-q.js @FAMILY QUESTIONS FROM THE LIBRARY (owner, 20 Nov; steps 3 and 4): ONE question kind. An @family
   question is a row like every other (tools/lib/shape.js: a stem in `html`, one answer, its key, a note), in one question set per idea
   (tools/lib/sets.js, company @family, board AQA, tier Foundation), its `idea_id` the idea's. Its words are written once as a TEMPLATE that
   points at facts (`{<fact id>|<part>}`, tools/lib/facts.js) and its key comes from the facts it names (`tests`). Made mechanically, no AI:
     name     a words line "Term — meaning": "What is the word for: <meaning>?", typed; key the term (and a sibling term the meaning also fits)
     meaning  the same line: "Which is the meaning of <term>?", pick one; the other options the meanings of sibling lines in the idea
     formula  a formulas line "Name — equation": "Which is right for <name>?", pick one; the other options sibling equations
     gap      a points sentence: one word gapped, pick one; the other options words gapped from sentences of the subject's other nodes
              (a word of the same topic could fill it too), never one on this card
     number   a points sentence with a number and its unit: the two gapped, typed with the unit
   For the rest a sibling is in the same idea first, then its node (part_of), then its subject. No true/false (nothing to mark it by).
   VERSIONS: a question's id is `Q-FAM-<8 hex of fact and kind>-v<n>`; a change in its words or key makes v<n+1>, and the old version's
   row stays (active False) with its words, so an answer saved under the old id keeps the question its student saw.
   data/facts.json `questions` keeps each question's version, hash, kind, tests and template; tools/one-fact.js holds them. */
'use strict';
const crypto = require('crypto');
const { S } = require('./gen.js');
const F = require('./facts.js');

const COMPANY = '@family', BOARD = 'AQA', TIER = 'Foundation';
const SET = idea => 'P-FAM-AQA-' + idea.replace(/^sc\./, '').replace(/\./g, '-');
const sha = t => crypto.createHash('sha1').update(t).digest('hex');
const baseId = (fid, kind) => 'Q-FAM-' + sha(fid + '|' + kind).slice(0, 8);
const STOP = new Set(('the a an and or but of to in on at by for with from into onto as is are was were be been being it its this that these those '
  + 'which who whom whose what when where why how than then so such can could may might must will would should do does did has have had not no '
  + 'more most less least many much some any each every all both either neither other another also only very about over under between through '
  + 'during before after above below up down out off again further once there here same own just because while if their them they he she his her '
  + 'we our you your one two three used use uses using make makes made called known like often usually mainly well good part parts way ways '
  + 'example examples different similar important large small larger smaller higher lower high low new').split(' '));
/* A NUMBER WITH ITS UNIT, as a points sentence writes it (0.1 mm, 37 °C, 70%, 3 × 10^8 m/s is left alone: one number, one unit). */
const UNIT = /^(%|°C|K|[µnmck]?m|km|kg|g|mg|s|ms|J|kJ|W|kW|V|A|Ω|N|Pa|kPa|Hz|kHz|m\/s|m\/s²|dm³|cm³|m³|years?|days?|hours?|minutes?)$/;
const NUM = /^\d+(?:\.\d+)?%?$/;

/* THE GAPS A SENTENCE OFFERS: a number and unit (kind number), else its best word (kind gap): an idea's term word first, then the longest. */
function numberGap(text) {
  const tk = F.toks(text);
  for (let i = 0; i < tk.length; i++) {
    const b = F.bare(tk[i]);
    if (/^\d+(?:\.\d+)?%$/.test(b)) return { i, j: i };
    if (NUM.test(b) && tk[i] === F.bare(tk[i]) && i + 1 < tk.length && UNIT.test(F.bare(tk[i + 1])) && !/^[(]/.test(tk[i + 1])) return { i, j: i + 1 };
  }
  return null;
}
function wordGap(text, vocab) {
  const tk = F.toks(text), seen = {};
  tk.forEach(t => { const b = F.bare(t).toLowerCase(); seen[b] = (seen[b] || 0) + 1; });
  const ok = (t, i) => { const b = F.bare(t); return /^[A-Za-z][a-z-]*[a-z]$/.test(b) && b.length >= 4 && !STOP.has(b.toLowerCase()) && seen[b.toLowerCase()] === 1 && (i > 0 || b === b.toLowerCase()); };
  const c = tk.map((t, i) => ({ i, b: F.bare(t) })).filter(x => ok(tk[x.i], x.i));
  if (!c.length) return null;
  c.sort((x, y) => (vocab.has(y.b.toLowerCase()) - vocab.has(x.b.toLowerCase())) || (y.b.length - x.b.length) || (x.i - y.i));
  return { i: c[0].i, j: c[0].i, word: c[0].b };
}
/* NO WORD TO GAP (a worked line: "Mr of CO₂ = 12 + 16 + 16 = 44."): its last plain number, typed; else its last chemical formula, typed */
function lastGap(text) {
  const tk = F.toks(text);
  for (let i = tk.length - 1; i >= 0; i--) if (/^\d+(?:\.\d+)?$/.test(F.bare(tk[i]))) return { i, j: i, number: true, bare: true };
  for (let i = tk.length - 1; i >= 0; i--) if (/[A-Z][a-z]?[₀-₉0-9]|[A-Z][a-z]?\(/.test(F.bare(tk[i])) && F.bare(tk[i]).length >= 2) return { i, j: i, chem: true };
  return null;
}
const order = (seed, xs) => xs.slice().sort((a, b) => sha(seed + '|' + a).localeCompare(sha(seed + '|' + b)));
const norm = t => S(t).toLowerCase().replace(/[^a-z0-9²³^]+/g, ' ').trim();
const L = 'ABCDEFGHIJ';

/* MAKE: the facts (tools/lib/facts.js assign) → each question as {base, kind, idea, tests, t: {html, choices?, choice_right?, accept?, answer}}. */
function make(facts) {
  const byIdea = {}, byNode = {}, bySub = {};
  facts.forEach(f => { (byIdea[f.idea] = byIdea[f.idea] || []).push(f); (byNode[f.node] = byNode[f.node] || []).push(f); (bySub[f.subject] = bySub[f.subject] || []).push(f); });
  const ring = f => [byIdea[f.idea], byNode[f.node] || [], bySub[f.subject]];
  const termOf = f => F.part(f.text, 'term'), defOf = f => F.part(f.text, 'def');
  const vocab = {};
  Object.keys(byIdea).forEach(k => { vocab[k] = new Set(); byIdea[k].filter(f => f.field === 'words').forEach(f => F.toks(termOf(f)).forEach(w => vocab[k].add(F.bare(w).toLowerCase()))); });
  /* each sentence's gap, once: its own question and its siblings' distractors read the same */
  const gap = {};
  facts.filter(f => f.field === 'points').forEach(f => { gap[f.id] = numberGap(f.text) ? Object.assign({ number: true }, numberGap(f.text)) : wordGap(f.text, vocab[f.idea]) || lastGap(f.text); });
  /* a card's own words: a gap's other options are never one of them (on the card, an option could be true too) */
  const cardWords = {};
  facts.forEach(f => { const s = cardWords[f.card] = cardWords[f.card] || new Set(); F.toks(f.text).forEach(w => s.add(F.bare(w).toLowerCase())); });
  const has = (text, word) => new RegExp('(^|[^a-z])' + norm(word).replace(/[^a-z0-9 ]/g, '') + '([^a-z]|$)').test(norm(text));
  const first = t => norm(t).split(' ')[0];
  /* UP TO `want` OTHER OPTIONS: sibling facts' parts, idea → node → subject, none equal to the answer or to each other */
  const others = (f, want, ofF, okF, pools) => {
    const out = [], seen = new Set([norm(ofF(f))]);
    for (const pool of pools || ring(f)) {
      for (const g of order(f.id, pool.map(x => x.id)).map(id => pool.find(x => x.id === id))) {
        if (out.length >= want) return out;
        if (g.id === f.id || !okF(g)) continue;
        const v = ofF(g), k = norm(v);
        if (!k || seen.has(k)) continue;
        seen.add(k); out.push(g);
      }
    }
    return out;
  };
  const pick = (f, kind, stem, part, okF, pools) => {
    const rest = others(f, 3, g => F.part(g.text, part(g)), okF, pools);
    if (rest.length < 2) return null;
    const opts = order(f.id + kind, [f].concat(rest).map(g => g.id)).map(id => (id === f.id ? f : rest.find(x => x.id === id)));
    const tok = g => '{' + g.id + '|' + part(g) + '}';
    return { base: baseId(f.id, kind), kind, idea: f.idea, tests: [f.id], t: { html: stem, choices: opts.map(tok).join(' | '), choice_right: L[opts.indexOf(f)], answer: '<b>' + tok(f) + '</b>' } };
  };
  const out = [];
  facts.forEach(f => {
    if (f.field === 'words' && termOf(f) && defOf(f)) {
      /* NAME IT: the term, and a sibling term in the idea the same meaning fits (one contains the other: "Cell", "Chemical cell") */
      const t = norm(termOf(f));
      const also = byIdea[f.idea].filter(g => g.id !== f.id && g.field === 'words' && norm(termOf(g)) !== t && (norm(termOf(g)).includes(t) || t.includes(norm(termOf(g)))) && norm(defOf(g)) === norm(defOf(f)));
      const keys = ['{' + f.id + '|term}'].concat(also.map(g => '{' + g.id + '|term}'));
      out.push({ base: baseId(f.id, 'name'), kind: 'name', idea: f.idea, tests: [f.id].concat(also.map(g => g.id)),
        t: { html: '<p>What is the word for this?</p><p><i>{' + f.id + '|def}</i></p>', accept: keys.join(' | '), answer: '<b>{' + f.id + '|term}</b>' } });
      const q = pick(f, 'meaning', '<p>Which is the meaning of <b>{' + f.id + '|term}</b>?</p><p>Tick <b>one</b> box.</p>', () => 'def',
        g => g.field === 'words' && !!defOf(g) && norm(termOf(g)) !== t && !has(defOf(g), termOf(f)));
      if (q) out.push(q);
    } else if (f.field === 'formulas' && termOf(f) && defOf(f)) {
      const n = norm(termOf(f));
      const q = pick(f, 'formula', '<p>Which is right for <b>{' + f.id + '|term}</b>?</p><p>Tick <b>one</b> box.</p>', () => 'def',
        g => g.field === 'formulas' && !!defOf(g) && norm(termOf(g)) !== n && first(termOf(g)) !== first(termOf(f)));
      if (q) out.push(q);
    } else if (f.field === 'points' && gap[f.id]) {
      const g = gap[f.id], r = g.i + (g.j > g.i ? '-' + g.j : '');
      if (g.chem) {
        const w = '{' + f.id + '|word:' + r;
        out.push({ base: baseId(f.id, 'formula-gap'), kind: 'number', idea: f.idea, tests: [f.id],
          t: { html: '<p>Fill the gap with the formula.</p><p><i>{' + f.id + '|gap:' + r + '}</i></p>',
            accept: [w + '}', w + '|plain}', w + '|plain|nostate}'].join(' | '), answer: '<b>' + w + '}</b>' } });
      } else if (g.number) {
        out.push({ base: baseId(f.id, 'number'), kind: 'number', idea: f.idea, tests: [f.id],
          t: { html: '<p>Fill the gap. Give the number' + (g.bare ? '' : ' and its unit') + '.</p><p><i>{' + f.id + '|gap:' + r + '}</i></p>',
            accept: '{' + f.id + '|span:' + r + '}' + (g.j > g.i ? ' | {' + f.id + '|span:' + r + '|tight}' : ''), answer: '<b>{' + f.id + '|span:' + r + '}</b>' } });
      } else {
        const mine = new Set(F.toks(f.text).map(w => F.bare(w).toLowerCase()));
        const q = pick(f, 'gap', '<p>Which word fills the gap?</p><p><i>{' + f.id + '|gap:' + r + '}</i></p><p>Tick <b>one</b> box.</p>',
          x => 'word:' + gap[x.id].i, x => x.field === 'points' && gap[x.id] && !gap[x.id].number && !!gap[x.id].word && !mine.has(gap[x.id].word.toLowerCase()) && !cardWords[f.card].has(gap[x.id].word.toLowerCase()),
          /* from the subject's other nodes: a word of the same topic could fill the gap too ("defend against infection") */
          [bySub[f.subject].filter(x => x.node !== f.node)]);
        if (q) out.push(q);
      }
    }
  });
  return out;
}

/* WORDS: a question's template resolved against the facts — what the site shows (data-private/questions.json). */
function wordsOf(q, textOf) {
  const w = {};
  ['html', 'choices', 'accept', 'answer'].forEach(k => { if (q.t[k]) w[k] = F.resolve(q.t[k], textOf, k !== 'accept'); });
  if (q.t.choice_right) w.choice_right = q.t.choice_right;
  return w;
}
const versionHash = w => sha(JSON.stringify(['html', 'choices', 'choice_right', 'accept', 'answer'].map(k => S(w[k])))).slice(0, 12);

/* VERSIONS: each question's version brought up to its words; a changed hash makes the next version. reg.questions: {base: {v, h, kind, idea, tests, t, was: [v…]}} */
function version(reg, qs, textOf) {
  reg.questions = reg.questions || {};
  const t = { made: 0, bumped: 0, gone: 0 };
  const live = new Set();
  qs.forEach(q => {
    const w = wordsOf(q, textOf), h = versionHash(w), r = reg.questions[q.base];
    live.add(q.base);
    q.words = w;
    if (!r) { reg.questions[q.base] = { v: 1, h, kind: q.kind, idea: q.idea, tests: q.tests, t: q.t }; t.made++; }
    else if (r.h !== h) { r.was = (r.was || []).concat([r.v]); r.v++; r.h = h; r.kind = q.kind; r.idea = q.idea; r.tests = q.tests; r.t = q.t; t.bumped++; }
    else { r.kind = q.kind; r.idea = q.idea; r.tests = q.tests; r.t = q.t; }
    delete reg.questions[q.base].gone;
    q.v = reg.questions[q.base].v;
    q.id = q.base + '-v' + q.v;
  });
  Object.keys(reg.questions).forEach(b => { if (!live.has(b) && !reg.questions[b].gone) { reg.questions[b].gone = true; t.gone++; } });
  return t;
}

/* THE SETS AND ROWS: one set per idea (its name the idea's), the questions in fact order, an old version kept inactive beside its new one.
   `old` is the file's present @family rows by id (so a retired version keeps its row). */
function rowsOf(qs, ideaName, ideaSubject, reg, old) {
  const rows = [], bySet = {};
  qs.forEach(q => { (bySet[q.idea] = bySet[q.idea] || []).push(q); });
  Object.keys(bySet).forEach(idea => {
    const pid = SET(idea);
    rows.push({ row_id: 'D-' + pid, paper_id: pid, kind: 'document', name: ideaName[idea] || idea, subject: ideaSubject[idea], key_stage: 'KS4', band_type: 'stage',
      band_value: 'GCSE', level: 'GCSE', tier: TIER, company: COMPANY, exam_board: BOARD, document_type: 'Question set', trackable: 'True', printable: 'False', active: 'True' });
    bySet[idea].forEach((q, n) => {
      const r = reg.questions[q.base];
      (r.was || []).forEach(v => {
        const id = q.base + '-v' + v, o = old[id];
        if (o) rows.push(Object.assign({}, o, { active: 'False' }));
      });
      rows.push({ row_id: q.id, paper_id: pid, question: String(n + 1), kind: 'question', marks: '1', answer_type: 'short', active: 'True',
        lib_has: ['html', 'answer', 'accept', 'choices', 'choice_right'].filter(k => q.words[k]).join(' '), function_verified: 'True', lib_pending: 'True',
        idea_id: idea, tests: q.tests.join(' ') });
    });
  });
  return rows;
}

module.exports = { COMPANY, BOARD, TIER, SET, baseId, make, wordsOf, versionHash, version, rowsOf, numberGap, wordGap };
