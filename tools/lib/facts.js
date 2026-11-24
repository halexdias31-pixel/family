/* @family. — tools/lib/facts.js FACT IDS (owner, 20 Nov: @FAMILY SCIENCE QUESTIONS FROM THE LIBRARY, step 2): every item on a GCSE science
   card (a `words` line "Term — meaning", a `points` sentence, a `formulas` line "Name — equation") is one FACT with an id for life,
   `<idea_id>.f<n>`. The ids live in data/facts.json (ids, where each sits and a short hash of its words; never the words, which stay in
   data-private/textbooks.json). Re-run, a fact keeps its id: matched by its words first (anywhere in its subject), then, edited, by its
   place (same card, field and line); only a new line takes a new number, and a gone fact's id is retired, never given again.
   Scope, first: AQA 8461/8462/8463 Foundation cards (not Higher, `[H]` lines skipped). A question points at facts by `{<fact id>|<part>}`
   (resolve below); tools/lib/family-q.js makes them, tools/one-fact.js holds both. */
'use strict';
const crypto = require('crypto');
const { S } = require('./gen.js');

const FILE = 'data/facts.json';
const BOOKS = ['TB-AQA-8461', 'TB-AQA-8462', 'TB-AQA-8463'];
const FIELDS = ['words', 'points', 'formulas'];
const SUB = { 'TB-AQA-8461': 'Biology', 'TB-AQA-8462': 'Chemistry', 'TB-AQA-8463': 'Physics' };
const hash = t => crypto.createHash('sha1').update(S(t).replace(/\s+/g, ' ')).digest('hex').slice(0, 12);
const HIGHER = /^\s*\[H\]/;

/* THE CARDS IN SCOPE: a Foundation point card of the three books, with its idea and its words. */
function cardsOf(rows, words) {
  return rows.filter(r => BOOKS.includes(r.book_id) && Number(r.chapter) > 0 && !S(r.anim) && S(r.tier) !== 'Higher' && S(r.idea_id))
    .map(r => ({ key: r.book_id + '#' + r.chapter, idea: r.idea_id, node: S(r.part_of), subject: SUB[r.book_id], title: S(r.title), w: words[r.book_id + '#' + r.chapter] || {} }));
}
/* ITS ITEMS, in order: field, line number, words. */
function itemsOf(card) {
  const out = [];
  FIELDS.forEach(f => S(card.w[f]).split('|').forEach((t, n) => { t = t.trim(); if (t && !HIGHER.test(t)) out.push({ field: f, n, text: t }); }));
  return out;
}

/* ASSIGN: the registry `reg` ({facts: {id: [card, field, n, h]}, next: {idea: n}, retired: [id]}) brought up to the cards, in place.
   Returns {facts: [{id, idea, card, field, n, text, …}], made: [ids], moved: [ids], retired: [ids]}. */
function assign(reg, cards) {
  reg.facts = reg.facts || {}; reg.next = reg.next || {}; reg.retired = reg.retired || [];
  const byHash = {}, byPlace = {}, claimed = new Set();
  Object.keys(reg.facts).forEach(id => {
    const [card, field, n, h] = reg.facts[id];
    const sub = SUB[card.split('#')[0]];
    (byHash[sub + '|' + h] = byHash[sub + '|' + h] || []).push(id);
    byPlace[card + '|' + field + '|' + n] = id;
  });
  const out = [], made = [], moved = [], pending = [];
  /* 1. THE SAME WORDS: the same card first, then anywhere in the subject */
  cards.forEach(c => itemsOf(c).forEach(it => {
    const h = hash(it.text), cand = (byHash[c.subject + '|' + h] || []).filter(id => !claimed.has(id));
    const id = cand.find(x => reg.facts[x][0] === c.key && reg.facts[x][1] === it.field) || cand.find(x => reg.facts[x][0] === c.key) || cand[0];
    const f = Object.assign({ idea: c.idea, card: c.key, node: c.node, subject: c.subject, h }, it);
    if (id) { claimed.add(id); f.id = id; } else pending.push(f);
    out.push(f);
  }));
  /* 2. EDITED IN PLACE: an unclaimed id at the same card, field and line; 3. else a new number in its idea */
  pending.forEach(f => {
    const old = byPlace[f.card + '|' + f.field + '|' + f.n];
    if (old && !claimed.has(old)) { claimed.add(old); f.id = old; return; }
    const n = (reg.next[f.idea] || 0) + 1;
    reg.next[f.idea] = n;
    f.id = f.idea + '.f' + n;
    made.push(f.id);
  });
  out.forEach(f => {
    const was = reg.facts[f.id], now = [f.card, f.field, f.n, f.h];
    if (was && JSON.stringify(was) !== JSON.stringify(now)) moved.push(f.id);
    reg.facts[f.id] = now;
    const m = /^(.*)\.f(\d+)$/.exec(f.id);
    if (m && (reg.next[m[1]] || 0) < Number(m[2])) reg.next[m[1]] = Number(m[2]);
  });
  const live = new Set(out.map(f => f.id)), retired = Object.keys(reg.facts).filter(id => !live.has(id));
  retired.forEach(id => { delete reg.facts[id]; if (!reg.retired.includes(id)) reg.retired.push(id); });
  reg.retired.sort();
  return { facts: out, made, moved, retired };
}

/* ---------- A FACT'S PARTS, as a question's words point at them: {<id>} the whole line; {<id>|term} and {<id>|def} either side of its
   " — "; {<id>|word:i} its i-th word bare; {<id>|span:i-j} words i..j bare; {<id>|gap:i-j} the line with those words as a gap; `|tight`
   drops the spaces (0.1mm). Words are the line split on spaces; a word's bare form loses its punctuation either side. */
const DASH = /\s+—\s+/;
const toks = t => S(t).split(/\s+/).filter(Boolean);
const bare = w => S(w).replace(/^[("'“‘[]+|[)"'”’\].,;:!?]+$/g, '');
const GAP = '____';
function part(text, spec) {
  const p = S(spec).split('|'), head = p[0], tight = p.includes('tight');
  const [k, range] = head.split(':');
  const [i, j] = S(range).split('-').map(Number);
  const tk = toks(text), to = isNaN(j) ? i : j;
  let out;
  if (k === '' || k === undefined) out = S(text);
  else if (k === 'term') out = S(text).split(DASH)[0].trim();
  else if (k === 'def') out = S(text).split(DASH).slice(1).join(' — ').trim();
  else if (k === 'word') out = bare(tk[i]);
  else if (k === 'span') { const s = tk.slice(i, to + 1); s[0] = s[0].replace(/^[("'“‘[]+/, ''); s[s.length - 1] = bare(s[s.length - 1]) === '' ? s[s.length - 1] : s[s.length - 1].replace(/[)"'”’\].,;:!?]+$/, ''); out = s.join(' '); }
  else if (k === 'gap') {
    const lead = (tk[i].match(/^[("'“‘[]+/) || [''])[0], tail = (tk[to].match(/[)"'”’\].,;:!?]+$/) || [''])[0];
    out = tk.slice(0, i).concat([lead + GAP + tail], tk.slice(to + 1)).join(' ');
  } else throw new Error('facts: no part "' + k + '"');
  if (p.includes('nostate')) out = out.replace(/\((?:s|l|g|aq)\)/g, '');
  if (p.includes('plain')) out = out.replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 0x2080)).replace(/[⁰¹²³⁴-⁹]/g, d => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d)));
  return tight ? out.replace(/\s+/g, '') : out;
}
const esc = t => S(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* RESOLVE a question's words: every {<fact id>…} replaced by that fact's part (HTML-escaped when `html`). Unknown id: throws. */
const TOKEN = /\{((?:sc\.[a-z]+\.[a-z0-9-]+)\.f\d+)((?:\|[a-z]+(?::[0-9-]+)?)*)\}/g;
function resolve(tmpl, textOf, html) {
  return S(tmpl).replace(TOKEN, (m, id, spec) => {
    const t = textOf(id);
    if (t == null) throw new Error('no fact ' + id);
    const v = part(t, spec.replace(/^\|/, ''));
    return html ? esc(v) : v;
  });
}
const pointsAt = tmpl => [...S(tmpl).matchAll(TOKEN)].map(m => m[1]);

module.exports = { FILE, BOOKS, FIELDS, SUB, hash, cardsOf, itemsOf, assign, part, resolve, pointsAt, toks, bare, esc, GAP, DASH };
