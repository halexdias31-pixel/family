#!/usr/bin/env node
/* @family. — tools/card-fields.js THE CARD-FIELDS CHECK (rule 1.75, unify job J: the master decides card fields). Which fields a card shows,
   in what order and with which labels, is data/settings/kinds.json's (`card.tags`, `card.fields.list`, `card.letter.words`) and nowhere else:
   js/cards-render.js `cardFieldsOf_` and `cardLetterRow_` read it on the site, backend/cards-gen.gs carries the same readers to the email.
   Fails the build when: a js/ or backend/ file writes a list of label/field pairs (`['Symbol', r.symbol], …`); a file builds a letter's row
   by hand (an object naming four or more of a kind's letter fields); a kind's `fields.list` names a field twice or has no label; or the
   browser's or the email's copy of kinds.json lacks what the source says. Prints the count of kinds whose fields come from the source. */
'use strict';
const { text, srcFiles, report, main } = require('./lib/gen.js');
const MADE = new Set(['js/kinds.js', 'backend/cards-gen.gs']);

function run() {
  const bad = [], kinds = JSON.parse(text('data/settings/kinds.json')).kinds;
  let n = 0;
  /* 1. THE SOURCE IS WHOLE: every field once, every one labelled. */
  const letters = [];
  Object.entries(kinds).forEach(([k, v]) => {
    const c = v.card || {}, list = (c.fields || {}).list;
    if (list) {
      n++;
      const seen = new Set();
      list.forEach(x => {
        if (!x.f || !x.label) bad.push(k + ' card.fields.list has an entry without `f` and `label`');
        if (seen.has(x.f)) bad.push(k + ' card.fields.list names "' + x.f + '" twice'); seen.add(x.f);
      });
    }
    if (c.letter && c.letter.words) {
      n++;
      letters.push([k, [...new Set(Object.keys(c.letter.words).filter(p => p !== 'say').flatMap(p => c.letter.words[p].need || []))], c.letter.aliases || {}]);
    }
  });
  /* 2. NO HAND LIST: label/field pairs, or a letter's row built field by field, anywhere a card is drawn from. */
  srcFiles(['js', 'backend'], /\.(js|gs)$/).filter(f => !MADE.has(f)).forEach(f => {
    const s = text(f);
    const pairs = s.match(/\[\s*'[A-Z][^'\n]*'\s*,\s*[a-z]\w*\.\w+\s*\]\s*,\s*\[\s*'[A-Z][^'\n]*'\s*,\s*[a-z]\w*\.\w+\s*\]\s*,\s*\[\s*'[A-Z][^'\n]*'\s*,\s*[a-z]\w*\.\w+\s*\]/g);
    if (pairs) bad.push(f + ' lists a card\'s fields by hand (' + pairs[0].slice(0, 60) + '…): put them in kinds.json `card.fields.list`');
    for (const m of s.matchAll(/\{([^{}]{0,400})\}/g)) {
      const got = [...m[1].matchAll(/(?:^|[,\s])(\w+)\s*:\s*\w+\.(\w+)/g)];
      letters.forEach(([k, need, al]) => {
        /* A KEY TAKEN FROM ITS OWN NAME OR ONE OF ITS ALIASES (`day: j.weekday`) is a letter field written by hand; three make a hand row. */
        const keys = new Set(got.filter(x => x[1] === x[2] || [].concat(al[x[1]] || []).includes(x[2])).map(x => x[1]));
        if (need.filter(x => keys.has(x)).length >= 3) bad.push(f + ' builds a ' + k + ' letter\'s row by hand ({' + [...keys].join(', ') + '}): use cardLetterRow_(\'' + k + '\', src)');
      });
    }
  });
  /* 3. BOTH COPIES CARRY IT: the browser's js/kinds.js and the email's backend/cards-gen.gs. */
  const ctx = src => { const m = src.match(/^const ITEM_KINDS = (.*);$/m); return m ? JSON.parse(m[1]).kinds : {}; };
  const site = ctx(text('js/kinds.js')), mail = ctx(text('backend/cards-gen.gs'));
  Object.entries(kinds).forEach(([k, v]) => {
    const c = v.card || {};
    if (c.fields && JSON.stringify(((site[k] || {}).card || {}).fields) !== JSON.stringify(c.fields)) bad.push('js/kinds.js ' + k + ' card.fields is not kinds.json\'s (run tools/kinds.js)');
    if (c.letter && JSON.stringify(((mail[k] || {}).card || {}).letter) !== JSON.stringify(c.letter)) bad.push('backend/cards-gen.gs ' + k + ' card.letter is not kinds.json\'s (run tools/cards-gen.js)');
  });
  ['cardFieldsOf_', 'cardLetterRow_'].forEach(fn => srcFiles(['js', 'backend'], /\.(js|gs)$/).filter(f => f !== 'js/cards-render.js' && f !== 'backend/cards-gen.gs')
    .forEach(f => { if (new RegExp('^(const|function) ' + fn + '\\b', 'm').test(text(f))) bad.push(f + ' defines ' + fn + ' outside js/cards-render.js'); }));
  console.log('card-fields: ' + n + ' card field lists from kinds.json; ' + bad.length + ' wrong');
  report('card-fields', bad, 'card field list(s) outside the one source');
}
module.exports = { run };
main(module, run);
