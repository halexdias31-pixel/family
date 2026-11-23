/* @family. — tools/lib/pick-key.js ONE ANSWER FORMAT (owner, UNIFY AFTER 7, 23 Nov): a pick question (tick one box, multiple choice: two or
   more `choices`, not an ordering) stores its right answer once, as `choice_right` in the options' letters ("C", "A,D"), and any working
   as its note in `answer`, with no letter or "(1)" in front. The site's card, the Sunday email (answerSay_) and the markers read the key
   alone (js/library.js choiceKeys_). An ordering keeps its numbers in order ("3,1,2"). Applied where the words are written
   (lib-full.js writePrivate, so the importer, tools/content.js and a seed from history all come through it); held by tools/one-answer.js. */
'use strict';
const fs = require('fs'), path = require('path');
const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const { S } = require('./gen.js');
const optsOf = w => S(w && w.choices).split('|').map(t => t.trim()).filter(Boolean);
const isOrder = (w, card) => /^order$/i.test(S((w && w.answer_type) || (card && card.answer_type)));
const isPick = (w, card) => optsOf(w).length >= 2 && !isOrder(w, card);
/* A VALID KEY: one or more distinct letters, A-first, each an option the question has. */
function keyBad(w) {
  const k = S(w.choice_right), n = optsOf(w).length;
  if (!k) return 'no key';
  if (!/^[A-Z](,[A-Z])*$/.test(k)) return 'key "' + k + '" is not letters';
  const ls = k.split(',');
  if (new Set(ls).size !== ls.length) return 'key "' + k + '" repeats a letter';
  if (ls.join() !== ls.slice().sort().join()) return 'key "' + k + '" is out of order';
  if (ls.some(l => L.indexOf(l) >= n)) return 'key "' + k + '" names an option past its ' + n;
  return '';
}
/* THE LETTERS OF A KEY STORED AS NUMBERS ("3", "1,4"); null when it is not one, or names no option. */
function lettersOf(k, n) {
  if (!/^\d+(\s*,\s*\d+)*$/.test(k)) return null;
  const ks = [...new Set(k.split(',').map(t => +t))].sort((a, b) => a - b);
  return ks.every(x => x >= 1 && x <= n) ? ks.map(x => L[x - 1]).join(',') : null;
}
/* THE NOTE: the working, with a head that only says the key's letters ("A (1)", "<b>B</b> — …", "A, D and E") taken off.
   A head of other letters is left (it may name a figure's labels, not the options). */
const SEP = '\\s*(?:,|\\band\\b|&amp;|&)\\s*';
function noteOf(answer, letters) {
  const a = String(answer == null ? '' : answer);
  const ls = letters.split(',');
  const re = new RegExp('^(\\s*(?:<p>\\s*)?)(?:<(?:b|strong)>\\s*)?' + ls.join(SEP) + '(?![A-Za-z0-9])\\s*(?:</(?:b|strong)>)?'
    + '(?=\\s*(?:$|\\(|&mdash;|&ndash;|—|–|:|;|\\.(?:\\s|$)|<br|</p>|\\s-\\s))'
    + '\\s*(?:\\(\\d+(?:\\s*marks?)?\\)\\s*)?(?:</(?:b|strong)>\\s*)?(?:&mdash;|&ndash;|—|–|:|;|-|\\.)?\\s*');
  const m = re.exec(a);
  if (!m) return null;
  let rest = m[1] + a.slice(m[0].length);
  rest = rest.replace(/^(\s*<p>)\s*<\/p>\s*/, '').replace(/^\s*<p>\s*<\/p>\s*/, '');
  /* "the brackets go round…" opens a sentence of its own now */
  rest = rest.replace(/^((?:\s*<[a-z][^>]*>)*\s*)([a-z])(?=[a-z])/, (w, t, c) => t + c.toUpperCase());
  return rest.trim();
}
/* THE PUBLIC CARDS' answer_type, by row id (an ordering is told by it). */
let CARDS = null;
function cardsById() {
  if (CARDS) return CARDS;
  CARDS = {};
  try { for (const r of JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'questions.json'), 'utf8'))) CARDS[r.row_id] = r; } catch (e) { /* no cards: words alone */ }
  return CARDS;
}
/* ONE ROW'S WORDS IN THE ONE FORMAT; `tally` counts what was done. */
function normalise(id, w, tally) {
  const t = tally || {};
  if (!w || !isPick(w, cardsById()[id])) return w;
  t.picks = (t.picks || 0) + 1;
  const k = S(w.choice_right), n = optsOf(w).length;
  let letters = keyBad(w) ? lettersOf(k, n) : k;
  if (letters && letters !== k) { w.choice_right = letters; t.keys = (t.keys || 0) + 1; }
  if (!letters) { (t.not = t.not || []).push(id + ' (' + (k ? 'key "' + k + '"' : 'no key') + ')'); return w; }
  const note = Object.prototype.hasOwnProperty.call(w, 'answer') ? noteOf(w.answer, letters) : null;
  if (note !== null && note !== w.answer) {
    if (note) w.answer = note; else delete w.answer;
    t.notes = (t.notes || 0) + 1;
  }
  return w;
}
function normaliseMap(map, tally) {
  for (const id of Object.keys(map || {})) normalise(id, map[id], tally);
  return map;
}
module.exports = { L, optsOf, isOrder, isPick, keyBad, lettersOf, noteOf, normalise, normaliseMap, cardsById };
