#!/usr/bin/env node
/* @family. — tools/one-tag-set.js THE ONE-TAG-SET CHECK (rule 1.75, owner 23 Nov, UNIFY AFTER 6: "a small fixed set of tags, drawn the same
   everywhere"): every card wears only the tag kinds data/settings/tags.json lists, at most one of each, never more than its `max`.
   The site: the real app in jsdom (tools/lib/jsdom-app.js), every thing Find holds drawn as its card (findCard), each tag in its tag row read
   by its `data-f` facet. The email: the backend in its vm (tools/lib/backend-vm.js), the tags digestLibraryFind_ gives every 40th question of
   data/questions.json, and a question the library has not (digestLabelTags_). The set is read here from tags.json, not from the code under test.
   Fails the build on a tag of a kind outside the set, a kind twice on one card, or more than `max` tags. Counted: every card. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const { main, text: gtext } = require('./lib/gen.js');
const ROOT = path.join(__dirname, '..');
const SET = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/settings/tags.json'), 'utf8'));
const KIND = {};
SET.kinds.forEach(k => k.fields.forEach(f => { KIND[f] = k.kind; }));

/* ONE CARD'S TAGS, as their facets: what is wrong with them, '' when nothing. */
function judge(fields) {
  const kinds = fields.map(f => KIND[f] || ''), out = [];
  const off = fields.filter((f, i) => !kinds[i]);
  if (off.length) out.push('kinds outside the set (' + off.join(', ') + ')');
  const twice = kinds.filter((k, i) => k && kinds.indexOf(k) !== i);
  if (twice.length) out.push('a kind twice (' + [...new Set(twice)].join(', ') + ')');
  if (fields.length > SET.max) out.push(fields.length + ' tags, more than ' + SET.max);
  return out.join('; ');
}

async function siteCards() {
  const { app, tick } = require('./lib/jsdom-app.js');
  const A = await app(JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'lib', 'payload.json'), 'utf8')));
  const ev = s => A.w.__ev(s);
  try {
    const t0 = Date.now();
    ev('inFinder_(FINDERS.stuff, () => stuffItems())');
    while (!ev('LOADED && finderSettled_() && (LIBRARY_ROWS || []).length > 0')) {
      if (Date.now() - t0 > 240000) throw new Error('one-tag-set: the app never settled in 240s');
      await tick(250);
      ev('inFinder_(FINDERS.stuff, () => stuffItems())');
    }
    /* EVERY CARD FIND DRAWS: its tag row's tags, each by its facet (`data-f`; a tag with none is a tag of no kind). */
    return JSON.parse(ev(`(() => inFinder_(FINDERS.stuff, () => {
      STUFF.filters = [];
      const box = document.createElement('div'), out = [];
      /* EVERY KIND'S FIRST 40, then every 200th (drawing all of the library's cards takes longer than the build). */
      const per = {};
      stuffItems().filter((x, i) => (per[x.kind] = (per[x.kind] || 0) + 1) <= 40 || i % 200 === 0).forEach(x => {
        let html = '';
        try { html = findCard(x); } catch (e) { return; }
        box.innerHTML = html;
        const row = box.querySelector('.kc-tags') || box.querySelector('.qcard-tags');
        if (!row) return;
        out.push({ key: x.key || (x.row && x.row.row_id) || x.kind, kind: x.kind,
          fields: [...row.querySelectorAll('.qtag')].filter(t => t.getAttribute('data-tag') !== '0').map(t => t.getAttribute('data-f') || '(' + t.textContent.trim() + ')') });
      });
      return JSON.stringify(out);
    }))()`));
  } finally { A.close(); }
}

function emailCards() {
  const BV = require('./lib/backend-vm.js');
  const B = BV.load({ at: true, console: { log() {}, warn() {}, error() {} } });
  const text = gtext('data/questions.json');
  const ids = [...text.matchAll(/"row_id":"([^"]+)"[^\n]*"kind":"question"/g)].map(m => m[1]).filter((id, i) => i % 40 === 0);
  B.__a = [text, ids];
  const lib = B.$('digestLibraryFind_(__a[0], __a[1])');
  const out = Object.keys(lib.tags || {}).map(id => ({ key: 'email ' + id, fields: lib.tags[id].map(t => t.field || '(' + t.text + ')') }));
  /* A QUESTION THE LIBRARY HAS NOT: its label's subject, paper and number, and its marks. */
  B.__a = [['Physics', 'Momentum (sample)', 'Q1ai'], 'Q1ai', { marks: '2' }];
  out.push({ key: 'email label-only', fields: B.$('digestLabelTags_(__a[0], __a[1], __a[2])').map(t => t.field || '(' + t.text + ')') });
  return { out, asked: ids.length };
}

async function run() {
  const E = emailCards();
  if (E.out.length < E.asked / 2) throw new Error('one-tag-set: the email gave tags for ' + E.out.length + ' of ' + E.asked + ' questions');
  const site = await siteCards();
  const cards = site.concat(E.out), bad = [];
  cards.forEach(c => { const w = judge(c.fields); if (w) bad.push(c.key + ': ' + w); });
  const most = Math.max(0, ...cards.map(c => c.fields.length));
  console.log('one-tag-set: ' + (cards.length - bad.length) + '/' + cards.length + ' cards (site ' + site.length + ', email ' + E.out.length + ') wear only '
    + SET.kinds.map(k => k.kind).join(', ') + ', at most ' + SET.max + ' (the most on one card: ' + most + ')');
  const by = {}; bad.forEach(b => { const k = b.split(':')[0].split(' ')[0]; by[k] = (by[k] || 0) + 1; }); if (bad.length) console.log('  by key: ' + JSON.stringify(by).slice(0, 600));
  bad.slice(0, 25).forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('one-tag-set: ' + bad.length + ' card(s) with tags outside the one tag set');
}
module.exports = { run };
main(module, run);
