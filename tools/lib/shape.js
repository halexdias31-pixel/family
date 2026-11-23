/* @family. — tools/lib/shape.js ONE QUESTION SHAPE (owner, 23 Nov: "unify questions so a bug can't hide in a variant").
   Every question row is: its stem words (`html`, a figure in `diagram`); and one answer — a typed box (`accept`, or options in
   `choices` with their key `choice_right`), a table's blanks (`cells`, one key a cell) or the draw canvas (`draw_answer`) — with its
   key and an optional note (`answer`, `examiner_note`). Anything else is an ODDITY, a second way to say the same thing.
   KINDS lists each oddity once: `fix` (applied where the words are written, lib-full.js writePrivate, beside pick-key.js, so the
   importer, tools/content.js and a seed from history all come through it) or a budget held by tools/one-shape.js that can only fall. */
'use strict';
const { S } = require('./gen.js');
const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const has = (w, f) => S(w && w[f]).trim() !== '';
const opts = w => S(w && w.choices).split('|').map(t => t.trim()).filter(Boolean);
const keyed = w => ['accept', 'choice_right', 'cells', 'draw_answer', 'mark_words'].some(f => has(w, f));

/* OPTIONS LISTED IN THE STEM: a closing <ul> of lettered items A, B, C… that is the question's options (not a matching list). */
const LIST = /<ul>((?:\s*<li>\s*(?:<b>|<strong>)\s*[A-H]\s*(?:<\/b>|<\/strong>)[\s\S]*?<\/li>)+)\s*<\/ul>\s*$/;
const ITEM = /<li>\s*(?:<b>|<strong>)\s*([A-H])\s*(?:<\/b>|<\/strong>)(?:&nbsp;|\s)*([\s\S]*?)\s*<\/li>/g;
function stemOptions(w) {
  if (!w || has(w, 'choices') || has(w, 'cells')) return null;
  const h = S(w.html), m = LIST.exec(h);
  if (!m) return null;
  const before = h.slice(0, m.index);
  if (/<table|____|\bmatch\b|write the letter|draw a line/i.test(before)) return null;
  const items = [...m[1].matchAll(ITEM)];
  if (items.length < 2 || !items.every((x, i) => x[1] === L[i] && x[2].trim())) return null;
  return { html: before.trim(), choices: items.map(x => x[2].trim().replace(/\s*\|\s*/g, ' / ')) };
}
/* OPTIONS THAT CARRY THEIR OWN LETTER ("<b>A</b> watch tutorial videos"): the card letters them, so the letter showed twice. */
const OWN = /^\s*(?:<b>|<strong>)?\s*\(?([A-Z])\)?\s*(?:<\/b>|<\/strong>)?(?:&nbsp;|\s|[.:)])+(?=\S)/;
function ownLetters(w) {
  const o = opts(w);
  if (o.length < 2) return null;
  const m = o.map(c => OWN.exec(c));
  if (!m.every((x, i) => x && x[1] === L[i])) return null;
  const out = o.map((c, i) => c.slice(m[i][0].length).trim());
  return out.every(Boolean) ? out : null;
}
const PART_OK = /^(?:[a-z](?:\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\))?)?$/;
const MS = /\b(?:[BMAP][1-5]|SC[1-5]|oe|cao|isw|ft|dep)\b/;

/* THE ODDITIES. test(w, card, id) → truthy when the row has it; fix(w) mends it in place (only the safe, mechanical ones). */
const KINDS = [
  { id: 'answer-type-in-words', say: 'answer_type kept in the words as well as the card (its card holds it)',
    test: (w, c) => w && Object.prototype.hasOwnProperty.call(w, 'answer_type') && c && S(w.answer_type) === S(c.answer_type),
    fix: w => { delete w.answer_type; } },
  { id: 'empty-field', say: 'a field stored as "" (said once by being absent)',
    test: w => w && Object.keys(w).some(k => w[k] === ''),
    fix: w => { Object.keys(w).forEach(k => { if (w[k] === '') delete w[k]; }); } },
  { id: 'options-in-stem', say: 'options written as a lettered list in `html`, not `choices`',
    test: w => !!stemOptions(w),
    fix: w => { const s = stemOptions(w); w.html = s.html; w.choices = s.choices.join(' | '); } },
  { id: 'options-own-letter', say: 'each option carries its own letter ("<b>A</b> …"), so the card letters it twice',
    test: w => !!ownLetters(w),
    fix: w => { w.choices = ownLetters(w).join(' | '); } },
  /* budgets: counted, not rewritten by a rule (each needs its source re-read) */
  { id: 'lettered-list-in-stem', say: 'a lettered A, B, C list left in `html` (a matching list or options not yet moved)',
    test: w => !has(w, 'choices') && (S(w && w.html).match(/<li>\s*(?:<b>|<strong>)\s*[A-H]\s*(?:<\/b>|<\/strong>)/g) || []).length >= 2 },
  { id: 'table-in-stem-unkeyed', say: 'a table with blanks in `html` and no `cells` (a table part written as HTML)',
    test: w => !has(w, 'cells') && /<table[\s\S]*?(?:<td>\s*<\/td>|<td>[^<]*(?:____|\.\.\.|…|\?)\s*<\/td>)/i.test(S(w && w.html)) },
  { id: 'table-in-note', say: 'a table written in the note `answer` (a table answer as HTML)',
    test: w => /<table/i.test(S(w && w.answer)) },
  { id: 'mark-scheme-in-note', say: 'mark-scheme codes (B1, M1, oe, cao…) in the note `answer`',
    test: w => MS.test(S(w && w.answer).replace(/<[^>]*>/g, ' ')) },
  { id: 'no-key-note-only', say: 'no key: the note `answer` alone stands for it',
    test: w => w && !keyed(w) && has(w, 'answer') },
  { id: 'no-key', say: 'no key and no note',
    test: w => w && !keyed(w) && !has(w, 'answer') },
  { id: 'two-keys', say: 'two keys on one part (`accept` with `choice_right` or `cells`)',
    test: w => has(w, 'accept') && (has(w, 'choice_right') || has(w, 'cells')) },
  { id: 'key-as-mark-words', say: 'key in `mark_words`, a second key field',
    test: w => has(w, 'mark_words') },
  { id: 'key-as-rule', say: 'key written as a mark-scheme rule ("rule: points max 2; …") in `accept`',
    test: w => /^\s*rule:/i.test(S(w && w.accept)) },
  { id: 'second-stem', say: 'stem words split into `lead` as well as `html`',
    test: w => has(w, 'lead') },
  { id: 'part-label-form', say: 'part label not a letter with an optional roman numeral, "b(ii)" (each source splits its own way)',
    test: (w, c) => !!c && !PART_OK.test(S(c.part).trim()) },
  { id: 'words-without-card', say: 'words with no card in data/questions.json',
    test: (w, c) => !c },
];
const FIXES = KINDS.filter(k => k.fix);

/* ONE ROW'S WORDS IN THE ONE SHAPE; `tally` counts each fix. */
function normalise(id, w, card, tally) {
  if (!w || typeof w !== 'object') return w;
  for (const k of FIXES) if (k.test(w, card, id)) { k.fix(w); if (tally) tally[k.id] = (tally[k.id] || 0) + 1; }
  return w;
}
function normaliseMap(map, cards, tally) {
  for (const id of Object.keys(map || {})) normalise(id, map[id], cards[id], tally);
  return map;
}
/* EVERY ODDITY'S ROWS: { kind: [ids] } over the words, each joined to its card. */
function audit(words, cards) {
  const out = {};
  KINDS.forEach(k => { out[k.id] = []; });
  for (const id of Object.keys(words)) for (const k of KINDS) if (k.test(words[id], cards[id], id)) out[k.id].push(id);
  return out;
}
module.exports = { KINDS, FIXES, normalise, normaliseMap, audit, stemOptions, ownLetters };
