#!/usr/bin/env node
/* @family. — tools/one-idea.js THE ONE-IDEA CHECK (rule 1.75, owner 22 Nov: queue step 10, one card per idea, maths pilot). A child sees one idea
   taught by several cards that do not know they are the same; the merge comes later, and it needs every maths card to say where it sits first.
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
  const now = ID.report(ID.measure(rows));
  if (JSON.stringify(now.groups) !== JSON.stringify(R.groups) || JSON.stringify(now.counts) !== JSON.stringify(R.counts))
    bad.push('Maths.ideas is not what tools/lib/ideas.js measures now — run node tools/content.js ideas');
  return bad;
}

function run() {
  const rows = SD.json('data/textbooks.json'), tax = SD.json('data/settings/taxonomy.json');
  const bad = problems(rows, tax);
  if (bad.length) { console.error('one-idea: ' + bad.length + ' problem(s):\n  ' + bad.slice(0, 40).join('\n  ')); throw new Error('one-idea check failed'); }
  const c = tax.Maths.ideas.counts;
  console.log('one-idea: ' + c.cards + ' maths cards, each in a topics.json node with an idea id; ' + c.ideas + ' ideas, ' + c.groups + ' groups of the same idea (' + c.cards_in_groups + ' cards), one id each');
}
module.exports = { run, problems };
main(module, run);
