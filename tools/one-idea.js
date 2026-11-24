#!/usr/bin/env node
/* @family. — tools/one-idea.js THE ONE-IDEA CHECK (rule 1.75, owner 22 Nov: queue step 10, one card per idea, maths pilot). A child sees one idea
   taught by several cards that do not know they are the same. Since the merge (queue step 3) it is one card per idea across levels: any two cards
   of one idea (title, node, GCSE point, or idea id) fail it, and so does a card merged away (Maths.ideas.merged) coming back.
   Fails the build when a maths content card (data/textbooks.json, outside the books Maths.ideas.outside names) has no `part_of` that is a maths node
   of data/topics.json, no `idea_id`, or a `specs` reference to no point of data/spec/; when a group of data/settings/taxonomy.json Maths.ideas
   names a card that is not there or its cards wear more than one idea id; or when the report is not what tools/lib/ideas.js measures now.
   A new maths card fails it until `node tools/content.js ideas` has run. Run by tools/build.js. */
'use strict';
const SD = require('./lib/site-data.js');
const ID = require('./lib/ideas.js');
const { main } = require('./lib/gen.js');

function problems(rows, tax) {
  const bad = [], T = ID.tree(), M = (tax && tax.Maths) || {}, R = M.ideas;
  if (!R) return ['data/settings/taxonomy.json has no Maths.ideas report — run node tools/content.js ideas'];
  const cards = ID.cardsOf(rows).filter(ID.inScope), byKey = {};
  const pts = {};
  cards.forEach(c => {
    byKey[c.key] = c.row;
    const r = c.row;
    if (!r.part_of) bad.push(c.key + ' (' + r.title + '): no part_of');
    else if (!T.ids.has(r.part_of)) bad.push(c.key + ': part_of ' + r.part_of + ' is not a maths node of data/topics.json');
    if (!r.idea_id) bad.push(c.key + ' (' + r.title + '): no idea_id');
    if (r.specs == null) bad.push(c.key + ' (' + r.title + '): no specs field');
    String(r.specs || '').split(/\s+/).filter(Boolean).forEach(ref => {
      const [id, p] = ref.split(':');
      if (!pts[id]) { const s = SD.json('data/spec/' + id + '.json'); pts[id] = new Set(s ? s.points.map(x => x.id) : []); }
      if (!pts[id].has(p)) bad.push(c.key + ': spec ' + ref + ' is no point of data/spec/' + id + '.json');
    });
  });
  (R.groups || []).forEach(g => {
    const worn = new Set();
    g.cards.forEach(k => { if (!byKey[k]) bad.push('group ' + g.idea_id + ': ' + k + ' is not a maths card'); else worn.add(byKey[k].idea_id); });
    if (worn.size !== 1 || !worn.has(g.idea_id)) bad.push('group ' + g.idea_id + ': its cards wear ' + [...worn].join(', '));
  });
  /* ONE CARD PER IDEA (queue step 3): no idea is taught by two cards — by the same title, the same node its title names, the one same GCSE
     point, or one idea id worn twice — and every card merged away names a card that is there. */
  const m = ID.measure(rows), dup = m.groups.filter(g => g.cards.length > 1);
  dup.forEach(g => bad.push('idea ' + (g.idea_id || g.label) + ' is taught by ' + g.cards.length + ' cards (' + g.cards.join(', ') + ', by ' + g.by.join('/')
    + ') — one card per idea: run node tools/content.js ideas, which merges them'));
  const worn = {};
  cards.forEach(c => { if (c.row.idea_id) (worn[c.row.idea_id] = worn[c.row.idea_id] || []).push(c.key); });
  Object.keys(worn).forEach(id => { if (worn[id].length > 1) bad.push('idea id ' + id + ' is worn by ' + worn[id].length + ' cards: ' + worn[id].join(', ')); });
  Object.keys(R.merged || {}).forEach(k => {
    if (byKey[k]) bad.push(k + ' was merged into ' + R.merged[k].to + ' and is back');
    if (!byKey[R.merged[k].to]) bad.push(k + ' was merged into ' + R.merged[k].to + ', which is not a maths card');
  });
  const now = ID.report(m);
  if (JSON.stringify(now.groups) !== JSON.stringify(R.groups) || JSON.stringify(now.counts) !== JSON.stringify(R.counts))
    bad.push('Maths.ideas is not what tools/lib/ideas.js measures now — run node tools/content.js ideas');
  return bad;
}

/* SCIENCE (UNIFY THE LIBRARY AND PRACTICE, item 8, 24 Nov; tools/lib/sci-ideas.js): every GCSE science card (TB-AQA-8461/2/3) has a science
   node, an idea id worn once, specs that are points; no two cards are one idea (title, or a broad chapter with no point of its own); a card
   merged away (Science.ideas.merged) or an empty book (books_gone) does not come back; the report is what is measured now. */
function sciProblems(rows, tax) {
  const X = require('./lib/sci-ideas.js'), bad = [], R = ((tax || {})[X.KEY] || {}).ideas;
  if (!R) return ['data/settings/taxonomy.json has no ' + X.KEY + '.ideas report — run node tools/content.js sciideas'];
  const T = X.tree(), m = X.measure(rows), byKey = {}, worn = {}, pts = {};
  m.cards.forEach(c => {
    const r = c.row; byKey[c.key] = r;
    if (!T.ids.has(r.part_of)) bad.push(c.key + ' (' + r.title + '): part_of "' + (r.part_of || '') + '" is no science node of data/topics.json');
    if (!r.idea_id) bad.push(c.key + ' (' + r.title + '): no idea_id'); else (worn[r.idea_id] = worn[r.idea_id] || []).push(c.key);
    if (r.idea_id && r.idea_id !== c.idea) bad.push(c.key + ': idea_id ' + r.idea_id + ', but it measures ' + c.idea + ' — run node tools/content.js sciideas');
    if (!String(r.specs || '').trim()) bad.push(c.key + ' (' + r.title + '): no spec point');
    String(r.specs || '').split(/\s+/).filter(Boolean).forEach(ref => {
      const [id, p] = ref.split(':');
      if (!pts[id]) { const f = SD.json('data/spec/' + id + '.json'); pts[id] = new Set(f ? f.points.map(x => x.id) : []); }
      if (!pts[id].has(p)) bad.push(c.key + ': spec ' + ref + ' is no point of data/spec/' + id + '.json');
    });
  });
  m.groups.filter(g => g.cards.length > 1).forEach(g => bad.push('science idea ' + g.idea_id + ' is taught by ' + g.cards.length + ' cards (' + g.cards.join(', ')
    + ', by ' + g.by.join('/') + ') — one card per idea: run node tools/content.js sciideas'));
  Object.keys(worn).forEach(id => { if (worn[id].length > 1) bad.push('idea id ' + id + ' is worn by ' + worn[id].length + ' cards: ' + worn[id].join(', ')); });
  Object.keys(R.merged || {}).forEach(k => {
    if (byKey[k]) bad.push(k + ' was merged into ' + R.merged[k].to + ' and is back');
    if (!byKey[R.merged[k].to]) bad.push(k + ' was merged into ' + R.merged[k].to + ', which is not a science card');
  });
  (R.books_gone || []).forEach(b => { if (rows.some(r => r.book_id === b)) bad.push(b + ' went (its chapters are point cards now) and is back'); });
  const now = X.report(m);
  if (JSON.stringify(now.groups) !== JSON.stringify(R.groups) || JSON.stringify(now.counts) !== JSON.stringify(R.counts))
    bad.push(X.KEY + '.ideas is not what tools/lib/sci-ideas.js measures now — run node tools/content.js sciideas');
  return bad;
}

/* THE BREAKS --prove makes (each must be caught). */
const BREAKS = [
  { name: 'a broad science chapter back', d: (rows) => { rows.push({ book_id: 'TB-AQA-8461', chapter: 900, title: 'Cells and microscopy', topics: 'Cell Biology', part_of: 'bio-cell', specs: '', idea_id: 'sc.bio.cells' }); } },
  { name: 'two science cards of one title', d: (rows) => { const r = rows.find(x => x.book_id === 'TB-AQA-8462' && Number(x.chapter) === 3); rows.push(Object.assign({}, r, { book_id: 'TB-AQA-8463', chapter: 900 })); } },
  { name: 'a science idea id worn twice', d: (rows) => { const a = rows.filter(x => x.book_id === 'TB-AQA-8463' && Number(x.chapter) > 0 && !x.anim); a[1].idea_id = a[0].idea_id; } },
  { name: 'a science card with no node', d: (rows) => { rows.find(x => x.book_id === 'TB-AQA-8461' && Number(x.chapter) === 5 && !x.anim).part_of = ''; } },
  { name: 'a science spec that is no point', d: (rows) => { rows.find(x => x.book_id === 'TB-AQA-8461' && Number(x.chapter) === 5 && !x.anim).specs += ' aqa-8461:9.9.9'; } },
  { name: 'a merged science card back', d: (rows, tax) => { const k = Object.keys(tax.Science.ideas.merged)[0], m = /^ct:(.*)-(\d+)$/.exec(k);
    rows.push({ book_id: m[1], chapter: +m[2], title: tax.Science.ideas.merged[k].title, topics: '' }); } },
  { name: 'an empty science book back', d: (rows, tax) => { rows.push({ book_id: tax.Science.ideas.books_gone[0], chapter: 0, title: 'x' }); } },
  { name: 'a maths idea id worn twice', d: (rows) => { const a = rows.filter(x => x.book_id === 'TB-AQA-8300' && Number(x.chapter) > 0 && !x.anim && x.idea_id); const b = a.find(x => x.idea_id !== a[0].idea_id); b.idea_id = a[0].idea_id; } },
];

function all(rows, tax) { return problems(rows, tax).concat(sciProblems(rows, tax)); }

function run() {
  const rows = SD.json('data/textbooks.json'), tax = SD.json('data/settings/taxonomy.json');
  if (process.argv.includes('--prove')) {
    const first = all(rows, tax);
    if (first.length) throw new Error('one-idea --prove: the unbroken site already fails (' + first[0] + ')');
    const missed = BREAKS.filter(b => { const r = JSON.parse(JSON.stringify(rows)), t = JSON.parse(JSON.stringify(tax)); b.d(r, t); return !all(r, t).length; }).map(b => b.name);
    if (missed.length) throw new Error('one-idea --prove: missed ' + missed.join(', '));
    console.log('one-idea --prove: every break caught (' + BREAKS.length + ')');
    return;
  }
  const bad = all(rows, tax);
  if (bad.length) { console.error('one-idea: ' + bad.length + ' problem(s):\n  ' + bad.slice(0, 40).join('\n  ')); throw new Error('one-idea check failed'); }
  const c = tax.Maths.ideas.counts;
  const sc = tax.Science.ideas;
  console.log('one-idea: science ' + sc.counts.cards + ' GCSE cards, ' + sc.counts.ideas + ' ideas (one AQA spec point each), ' + sc.counts.groups + ' duplicate groups, ' + Object.keys(sc.merged || {}).length + ' cards merged away');
  console.log('one-idea: ' + c.cards + ' maths cards, each in a topics.json node with an idea id; ' + c.ideas + ' ideas, one card each (' + c.groups + ' duplicate groups, ' + Object.keys(tax.Maths.ideas.merged || {}).length + ' cards merged away)');
}
module.exports = { run, problems, sciProblems };
main(module, run);
