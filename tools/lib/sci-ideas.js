/* @family. — tools/lib/sci-ideas.js ONE IDEA PER CARD, SCIENCE (UNIFY THE LIBRARY AND PRACTICE, item 8, 24 Nov), as tools/lib/ideas.js did
   maths. The GCSE science cards (AQA 8461 Biology, 8462 Chemistry, 8463 Physics; 8464 Combined shares their points) are point-by-point:
   one idea is one AQA spec point, taught by the TB-AQA-846x card for it. The same three fields as maths:
     part_of   the data/topics.json science node the card sits in (its first topic: Cell Biology, Forces…)
     specs     its spec points: its own (aqa-846x:<point>) and the 8464 Combined point of the same name (aqa-8464:<point>)
     idea_id   sc.<bio|chem|phys>.<its title>, one per idea
   Cards are the same idea when (a) their titles are the same once the spec code is off (8462 and 8463 both teach "The development of the
   model of the atom", 8464's "common content with physics"), or (b) a card teaches no spec point of its own (a broad chapter of TB-GCSE-BIO,
   -CHEM, -PHYS): it goes to the point card in its nodes its title names best, and tools/lib/ideas.js merge splits its items, each to the
   point card it reads most like. The other science books (KS2, KS3, A-Level, practicals) are outside for now (OUTSIDE).
   Run by `node tools/content.js sciideas` (data/settings/content.json sources.sciideas); checked by tools/one-idea.js. */
'use strict';
const SD = require('./site-data.js');
const fs = require('fs'), path = require('path');
const { ROOT, S } = require('./gen.js');
const ID = require('./ideas.js');

const KEY = 'Science';
const SUBJECTS = { Biology: 'bio', Chemistry: 'chem', Physics: 'phys' };
const ROOTS = { Biology: 'biology', Chemistry: 'chemistry', Physics: 'physics' };
const BOOKS = ['TB-AQA-8461', 'TB-AQA-8462', 'TB-AQA-8463', 'TB-GCSE-BIO', 'TB-GCSE-CHEM', 'TB-GCSE-PHYS'];
/* THE CARD KEPT when two point cards are one idea: the specs in this order. */
const PREFER = ['TB-AQA-8461', 'TB-AQA-8462', 'TB-AQA-8463'];
const OUTSIDE = {
  'TB-KS2-SCI': 'KS2: not point-by-point, and its words are in the Ledger only — the next step of item 8',
  'TB-KS3-SCI': 'KS3: not point-by-point, and its words are in the Ledger only — the next step of item 8',
  'TB-GCSE-PRACTICALS': 'the required practicals: a practical card is a method, not an idea of its own — the next step of item 8',
  'TB-ALEVEL-BIO': 'A-Level: its own spec (AQA 7402), not yet point-by-point — the next step of item 8',
  'TB-ALEVEL-CHEM': 'A-Level: its own spec (AQA 7405), not yet point-by-point — the next step of item 8',
  'TB-ALEVEL-PHYS': 'A-Level: its own spec (AQA 7408), not yet point-by-point — the next step of item 8',
};
/* 8464 COMBINED numbers Biology 4.x, Chemistry 5.x, Physics 6.x; the separate sciences all 4.x. */
const COMBINED = { Biology: '4', Chemistry: '5', Physics: '6' };

const pointName = s => ID.normTitle(S(s).replace(/\([^)]*\)/g, ' '));

/* THE SCIENCE TREE: nodes under the three roots of data/topics.json, by id and by spelling. */
function tree() {
  const t = SD.json('data/topics.json'), by = {};
  t.forEach(x => { by[x.topic_id] = x; });
  const rootOf = x => { let y = x; while (y && S(y.parent_id)) y = by[y.parent_id]; return y; };
  const roots = new Set(Object.values(ROOTS));
  const nodes = t.filter(x => { const r = rootOf(x); return r && roots.has(r.topic_id) && S(x.parent_id); });
  const spell = {};
  nodes.forEach(x => [x.label].concat(S(x.aliases).split(/\s*[,|]\s*/)).filter(Boolean)
    .forEach(l => { const k = l.toLowerCase(), sub = rootOf(x).only_subject; spell[sub + '|' + k] = spell[sub + '|' + k] || x.topic_id; }));
  return { by, nodes, spell, rootOf, ids: new Set(nodes.map(x => x.topic_id)) };
}

/* THE SCIENCE CARDS: chapter rows (not the cover, not an animation) of the GCSE science books. */
function cardsOf(rows) {
  const cover = {};
  rows.forEach(r => { if (Number(r.chapter) === 0) cover[r.book_id] = r; });
  const pick = (r, k) => S(r[k]) || S((cover[r.book_id] || {})[k]);
  return rows.filter(r => Number(r.chapter) > 0 && !S(r.anim) && BOOKS.includes(r.book_id) && SUBJECTS[pick(r, 'subject')])
    .map(r => ({ row: r, key: 'ct:' + r.book_id + '-' + r.chapter, book: r.book_id, subject: pick(r, 'subject'), level: pick(r, 'level'),
      board: pick(r, 'board'), spec: pick(r, 'spec') }));
}

function specFiles() {
  const out = {};
  ['8461', '8462', '8463', '8464'].forEach(c => { out[c] = SD.json('data/spec/aqa-' + c + '.json'); });
  return out;
}

/* A CARD'S SPEC POINTS: its own (spec_ref, a point that links it) and 8464's point of the same name. `own`: it teaches one point. */
function specsOf(c, F) {
  const out = new Set(), own = F[c.spec];
  if (own) {
    const pts = new Set(own.points.map(p => p.id));
    S(c.row.spec_ref).split(/\s+/).filter(Boolean).forEach(p => { if (pts.has(p)) out.add(own.id + ':' + p); });
  }
  ['8461', '8462', '8463'].forEach(k => F[k].points.forEach(p => { if ((p.links || []).includes(c.key)) out.add(F[k].id + ':' + p.id); }));
  const mine = [...out];
  mine.forEach(ref => {
    const [f, p] = ref.split(':'), sub = Object.keys(COMBINED).find(s => F[f.slice(4)] && F[f.slice(4)].subject === s);
    const pt = F[f.slice(4)].points.find(x => x.id === p), name = pointName(pt && pt.text);
    const twin = sub && F['8464'].points.find(x => x.id.split('.')[0] === COMBINED[sub] && x.id.split('.').length >= 3 && pointName(x.text) === name);
    if (twin) out.add(F['8464'].id + ':' + twin.id);
  });
  return { specs: [...out].sort(), own: mine.length > 0 };
}

function nodeOf(c, T) {
  const t = S(c.row.topics).split(/\s*,\s*/).filter(Boolean).map(x => T.spell[c.subject + '|' + x.toLowerCase()]).filter(Boolean);
  return { node: t[0] || null, nodes: t };
}

const ideaId = c => 'sc.' + SUBJECTS[c.subject] + '.' + ID.slug(S(c.row.title).replace(/['’]/g, ''));

/* MEASURE: every science card's node, specs and idea; the groups (title, and a broad card with the point card its title names best). */
function measure(rows) {
  const T = tree(), F = specFiles(), cards = cardsOf(rows);
  cards.forEach(c => { const n = nodeOf(c, T); c.node = n.node; c.nodes = n.nodes; const s = specsOf(c, F); c.specs = s.specs; c.own = s.own; });
  const up = cards.map((c, i) => i), find = i => (up[i] === i ? i : (up[i] = find(up[i])));
  const why = cards.map(() => new Set());
  const link = (i, j, tag) => { if (find(i) !== find(j)) up[find(i)] = find(j); why[i].add(tag); why[j].add(tag); };
  const seen = {};
  cards.forEach((c, i) => { const k = ID.normTitle(c.row.title); if (seen[k] == null) seen[k] = i; else link(i, seen[k], 'title'); });
  /* A BROAD CARD (no point of its own) IS THE IDEA its title names best among the point cards of its nodes; a tie, the first in spec order. */
  cards.forEach((c, i) => {
    if (c.own) return;
    /* ITS NODES' POINT CARDS; none there (Electromagnetic Waves, which AQA teaches under Waves), its subject's. */
    const tw = new Set(ID.wordsOf(c.row.title)), mine = j => cards[j].own && cards[j].subject === c.subject;
    let pool = cards.map((x, j) => j).filter(j => mine(j) && c.nodes.includes(cards[j].node));
    if (!pool.length) pool = cards.map((x, j) => j).filter(mine);
    const sc = j => ID.wordsOf(cards[j].row.title).filter(w => tw.has(w)).length;
    const best = pool.slice().sort((a, b) => sc(b) - sc(a) || a - b)[0];
    c.pool = pool.map(j => cards[j]);
    link(i, best, 'broad');
  });
  const groups = {};
  cards.forEach((c, i) => { (groups[find(i)] = groups[find(i)] || []).push(i); });
  const out = [];
  Object.values(groups).forEach(ix => {
    const cs = ix.map(i => cards[i]);
    const lead = cs.slice().sort((a, b) => (b.own - a.own) || (PREFER.indexOf(a.book) + 1 || 9) - (PREFER.indexOf(b.book) + 1 || 9))[0];
    const id = lead.own ? ideaId(lead) : null;
    cs.forEach(c => { c.idea = id; });
    out.push({ idea_id: id, part_of: lead.node, label: S(lead.row.title), cards: cs.map(c => c.key), titles: cs.map(c => c.row.title),
      levels: [...new Set(cs.map(c => c.level))], specs: [...new Set([].concat(...cs.map(c => c.specs)))].sort(),
      by: [...new Set([].concat(...ix.map(i => [...why[i]])))].sort() });
  });
  out.sort((a, b) => b.cards.length - a.cards.length || S(a.idea_id).localeCompare(S(b.idea_id)));
  return { cards, groups: out, tree: T };
}

function report(m) {
  const dup = m.groups.filter(g => g.cards.length > 1), books = {};
  m.cards.forEach(c => { books[c.book] = (books[c.book] || 0) + 1; });
  return {
    about: 'ONE IDEA PER CARD, science (UNIFY THE LIBRARY AND PRACTICE, item 8, 24 Nov): written by `node tools/content.js sciideas` (tools/lib/sci-ideas.js), '
      + 'checked by tools/one-idea.js. An idea is one AQA spec point (8461, 8462, 8463; 8464 Combined shares them), taught by one card. A group is the cards '
      + 'that teach one idea: the same title once the spec code is off, or a broad chapter with no point of its own. merged: what went, and where.',
    fields: { part_of: 'a data/topics.json science node id', specs: '<data/spec id>:<point>, space-separated', idea_id: 'sc.<bio|chem|phys>.<title>, one per idea' },
    books, outside: OUTSIDE,
    counts: { cards: m.cards.length, ideas: m.groups.length, groups: dup.length, cards_in_groups: [].concat(...dup.map(g => g.cards)).length },
    groups: dup.map(g => ({ idea_id: g.idea_id, part_of: g.part_of, cards: g.cards, titles: g.titles, levels: g.levels, specs: g.specs, by: g.by })),
  };
}

function tag(rows, m) {
  const of = {};
  m.cards.forEach(c => { of[c.key] = c; });
  let n = 0;
  rows.forEach(r => {
    const c = of['ct:' + r.book_id + '-' + r.chapter];
    if (!c || S(r.anim) || Number(r.chapter) === 0) return;
    const want = { part_of: c.node || '', specs: c.specs.join(' '), idea_id: c.idea || '' };
    Object.keys(want).forEach(k => { if (r[k] !== want[k]) { r[k] = want[k]; n++; } });
  });
  return n;
}

/* MERGE: tools/lib/ideas.js merge, told the science way: the point card is kept and keeps its title; a broad card's items may go to any
   point card of its nodes (its own idea first); an animation follows the first of its key words that names one. */
function merge(rows, words, m, log) {
  const byKey = {};
  m.cards.forEach(c => { byKey[c.key] = c; });
  return ID.merge(rows, words, m, {
    prefer: PREFER, min: 0.5, log,
    /* A POINT CARD READS AS its formulas' names too ("Hooke's law", "Pressure in a liquid"). */
    extra: w => ID.items(w.formulas).map(x => S(x).split(/\s+—\s+/)[0]),
    label: () => '',
    cands: c => [...new Set([c.idea].concat((c.pool || []).map(x => x.idea)).filter(Boolean))],
    about: r => S(r.about).split('|').map(x => x.trim().toLowerCase()).filter(Boolean),
  });
}

/* A BOOK LEFT WITH NO CHAPTER (TB-GCSE-BIO, -CHEM, -PHYS once their broad chapters are merged) goes: a child would open an empty book.
   Only a cover with no words of its own; returns the books that went. */
function dropEmpty(rows, words) {
  const gone = BOOKS.filter(b => !rows.some(r => r.book_id === b && Number(r.chapter) > 0)
    && !['words', 'points', 'formulas', 'idea', 'diagram'].some(f => S((words[b + '#0'] || {})[f])));
  for (let i = rows.length - 1; i >= 0; i--) if (gone.includes(rows[i].book_id)) rows.splice(i, 1);
  gone.forEach(b => { delete words[b + '#0']; });
  return gone;
}

module.exports = { dropEmpty, KEY, SUBJECTS, BOOKS, OUTSIDE, cardsOf, measure, report, tag, tree, merge, specFiles };
