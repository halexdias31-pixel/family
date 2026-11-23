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

function run() {
  const rows = SD.json('data/textbooks.json'), tax = SD.json('data/settings/taxonomy.json');
  const bad = problems(rows, tax);
  if (bad.length) { console.error('one-idea: ' + bad.length + ' problem(s):\n  ' + bad.slice(0, 40).join('\n  ')); throw new Error('one-idea check failed'); }
  const c = tax.Maths.ideas.counts;
  console.log('one-idea: ' + c.cards + ' maths cards, each in a topics.json node with an idea id; ' + c.ideas + ' ideas, one card each (' + c.groups + ' duplicate groups, ' + Object.keys(tax.Maths.ideas.merged || {}).length + ' cards merged away)');
}
module.exports = { run, problems };
main(module, run);
