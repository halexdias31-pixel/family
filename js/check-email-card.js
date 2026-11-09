#!/usr/bin/env node
/* @family. — check-email-card.js THE SUNDAY EMAIL'S CARD IS THE SITE'S CARD (57a–62a): the order of its parts and
   lines, its labels, corner, gap, sizes, rule and tag colours, read off `DIGEST_CARD` and held to findCard and style.css. */
'use strict';
const fs = require('fs');
const path = require('path');
const { backend } = require('./check-gas-load.js');
const ROOT = path.join(__dirname, '..');
const bad = [];
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const cards = fs.readFileSync(path.join(ROOT, 'js/cards.js'), 'utf8');
const tok = n => { const m = new RegExp('--' + n + ':\\s*([^;]+);').exec(css); return m ? m[1].trim() : null; };
const px = v => { const s = String(v || ''), m = /max\(\s*([\d.]+)px\s*,\s*([\d.]+)rem\s*\)/.exec(s);
  return m ? Math.max(+m[1], +m[2] * 16) : /rem$/.test(s) ? Math.round(parseFloat(s) * 16) : parseFloat(s); };
const hex = v => { let s = String(v || ''); for (let i = 0; i < 4 && /^var\(/.test(s); i++) s = tok(/var\(--([\w-]+)\)/.exec(s)[1]) || ''; return s.toLowerCase(); };

const b = backend();
let C = null, INK = null;
try { C = b.ev('DIGEST_CARD'); INK = b.ev('DIGEST_TAG_INK'); } catch (e) { bad.push('backend/digest.gs has no DIGEST_CARD or DIGEST_TAG_INK: ' + e.message); }
if (C) {
  /* THE PARTS IN findCard's ORDER: `const parts = { pic: …, head: …, tags: …, lines: … }`. */
  const m = /const parts = \{([^\n]*)\};/.exec(cards.slice(cards.indexOf('function findCard(')));
  const site = m ? (m[1].match(/(\w+):/g) || []).map(x => x.slice(0, -1)) : [];
  if (JSON.stringify(site) !== JSON.stringify(C.order)) bad.push('the email card\'s parts are ' + JSON.stringify(C.order) + ', findCard\'s ' + JSON.stringify(site));
  if (JSON.stringify(C.lines) !== JSON.stringify(['theirs', 'verdict', 'right'])) bad.push('the email card\'s lines are not their answer, the verdict, the answer: ' + JSON.stringify(C.lines));
  if (C.labels.theirs !== 'Their answer' || C.labels.right !== 'Answer') bad.push('the labels are not "Their answer" and "Answer" (60b normal case): ' + JSON.stringify(C.labels));
  [['radius', 'r-ui'], ['round', 'r-round'], ['gap', 'card-gap']].forEach(([k, t]) => {
    if (px(tok(t)) !== C[k]) bad.push('DIGEST_CARD.' + k + ' is ' + C[k] + ', style.css --' + t + ' is ' + tok(t));
  });
  ['small', 'body', 'title'].forEach(k => { if (px(tok('fs-' + k)) !== C.size[k]) bad.push('DIGEST_CARD.size.' + k + ' is ' + C.size[k] + 'px, --fs-' + k + ' is ' + tok('fs-' + k)); });
  if (hex(tok('line-soft')) !== String(C.rule).toLowerCase()) bad.push('the email card\'s rule ' + C.rule + ' is not --line-soft ' + tok('line-soft'));
}
if (INK) Object.keys(INK).forEach(k => { const t = tok('tag-' + k); if (t && hex(t) !== INK[k].toLowerCase()) bad.push('DIGEST_TAG_INK.' + k + ' is ' + INK[k] + ', --tag-' + k + ' is ' + hex(t)); });

/* AND AS DRAWN: a library question with a picture, two marks, their answer and the answer. */
try {
  const Q = [{ key: 'q:Q-T-1', label: 'Maths · Paper T · Q3', words: '', verdict: 'right', answer: '12' }];
  const O = { lib: { rows: { 'Q-T-1': { row_id: 'Q-T-1', kind: 'question', active: 'TRUE', marks: 2, html: '<p>Work out 3 × 4.</p>', answer: '12',
    diagram: '<svg viewBox="0 0 10 10" aria-label="A square"></svg>' } }, pre: [] }, site: 'https://example.org/' };
  const r = b.ev('digestQuestions_(' + JSON.stringify(Q) + ', 5, ' + JSON.stringify(O) + ')');
  const h = String(r.html || ''), said = h.replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, ' [pic:$1] ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const at = ['[pic:', 'Q3 [2]', 'Maths', 'Work out 3', 'Their answer', 'Right', 'Answer 12'].map(x => said.indexOf(x));
  if (at.some((x, i) => x < 0 || (i && x < at[i - 1]))) bad.push('the email card is not picture, heading with [n], tags, words, Their answer, verdict, Answer: ' + said.slice(0, 400));
  if (/THEIR ANSWER|>ANSWER|text-transform|border:10px/.test(h)) bad.push('the email card still has the old shape (capitals, the 10px pane): ' + h.slice(0, 300));
} catch (e) { bad.push('digestQuestions_ would not draw a card: ' + e.message); }

if (bad.length) { console.log('FAILED — the email card is not the site card:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — the email card is the site card: picture, heading, tags, lines; one corner, gap, three sizes, tag colours.');
