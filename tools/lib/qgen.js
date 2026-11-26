/* @family. — tools/lib/qgen.js GENERATED MATHS QUESTIONS (owner queue item 6; owner 25 Nov: first-class @family questions). One format,
   data/settings/qgen.json: a template is a country-neutral skill (its `id`), whole-number ranges and conditions, a question pattern and an
   answer key the site's one marker reads (js/find-marking.js markAnswer_). Each country file (data/settings/curriculum/<country>/<subject>.json,
   tools/lib/curriculum.js) maps its sub-topics to skills (`templates`); a template bound to a node is what makes questions. THE VERSION IS A
   FINGERPRINT, never written by hand: 8 hex of the bound template's canonical JSON with its node's record, so the questions are a pure function
   of the two — edit either and they change, revert and they come back exactly. A seed picks the numbers; the numbers make the id
   gen:<node>:<template>.<version>:<n1>,<n2>,... and the id alone makes the question again. emit() is the fixed set (seeds 1.. until SET_SIZE
   different questions per template) written as ordinary rows of data/questions.json by tools/gen-questions.js, one @family question set per
   country sub-topic (`gen` in the country file: set and row id prefixes; the UK's are the first ones, so its ids never changed). Checked by
   tools/one-gen.js and tools/one-curriculum.js. */
'use strict';
const crypto = require('crypto');
const SD = require('./site-data.js');

const TABLE = 'data/settings/qgen.json';
const table = () => SD.json(TABLE);
const SET_SIZE = 10, COMPANY = '@family';

/* THE HELPERS an expression may call. */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const HELP = {
  gcd, lcm: (a, b) => Math.abs(a * b) / gcd(a, b),
  sgn: n => (n < 0 ? '- ' + -n : '+ ' + n),            /* the sign and size of a term after the first: + 3, - 3 */
  co: n => (n === 1 ? '' : n === -1 ? '-' : String(n)), /* a coefficient: 1x is x */
  fix: n => String(+n.toFixed(10)),
  tight: s => String(s).replace(/ /g, ''),
  /* right-angled trigonometry in degrees, as a GCSE question gives them; rd(n, d) is n to d decimal places as written (2 to 1 d.p. is 2.0) */
  sin: d => Math.sin(d * Math.PI / 180), cos: d => Math.cos(d * Math.PI / 180), tan: d => Math.tan(d * Math.PI / 180),
  asin: r => Math.asin(r) * 180 / Math.PI, acos: r => Math.acos(r) * 180 / Math.PI, atan: r => Math.atan(r) * 180 / Math.PI,
  rd: (n, d) => { const k = 10 ** d; return (Math.round((n + Number.EPSILON * Math.abs(n)) * k) / k).toFixed(d); },
  plain(m, e) { /* the integer m times 10^e written out in full, no float error */
    const neg = m < 0, d = String(Math.abs(m));
    let s;
    if (e >= 0) s = d + '0'.repeat(e);
    else { const p = d.length + e; s = p > 0 ? d.slice(0, p) + '.' + d.slice(p) : '0.' + '0'.repeat(-p) + d; s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); }
    return (neg ? '-' : '') + s;
  },
};

/* AN EXPRESSION, only names, numbers, quoted words and arithmetic: anything else is refused, never run. */
const SAFE = /^(?:\s|\d+(?:\.\d+)?|[A-Za-z_]\w*|'[^'\\]*'|[-+*/%()?:<>=!&|,])*$/;
function evaluate(src, env) {
  if (!SAFE.test(src)) throw new Error('expression "' + src + '" has a character outside the allowed set');
  (src.replace(/'[^']*'/g, '').match(/[A-Za-z_]\w*/g) || []).forEach(n => { if (!(n in env) && !(n in HELP)) throw new Error('expression "' + src + '": no value "' + n + '"'); });
  const names = Object.keys(HELP).concat(Object.keys(env).filter(k => !(k in HELP)));
  return Function(...names, '"use strict"; return (' + src + ');')(...names.map(n => (n in HELP ? HELP[n] : env[n])));
}
const fill = (pat, env) => String(pat).replace(/\{([^{}]+)\}/g, (m, e) => String(evaluate(e, env)));

/* THE SEEDED DRAW: the same template and seed always give the same numbers. */
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

const varNames = t => Object.keys(t.vars || {});
const inRange = (t, k, n) => { const [lo, hi, ...not] = t.vars[k]; return Number.isInteger(n) && n >= lo && n <= hi && !not.includes(n); };
const meets = (t, env) => (t.where || []).every(w => evaluate(w, env));
/* THE FINGERPRINT: keys sorted at every depth, so the same content is the same text whatever order it was written in. */
const canon = x => Array.isArray(x) ? '[' + x.map(canon).join(',') + ']'
  : x && typeof x === 'object' ? '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}' : JSON.stringify(x);
/* A TEMPLATE BOUND TO ONE COUNTRY'S NODE: the template, its node under the country's key (`gen.key`: the UK's is `dfe`, so its fingerprints and
   ids are the ones it always had), and `_node`, `_key`, `_cc`, `_sub` (outside the fingerprint, kept through a JSON copy). */
const CU = () => require('./curriculum.js');
function cfg(e) {
  const g = (e && e.T && e.T.gen) || {}, CC = String(e.country).toUpperCase();
  return { set_prefix: g.set_prefix || SET_PREFIX + CC + '-', row_prefix: g.row_prefix || 'Q-GEN-' + CC + '-', strip: g.strip != null ? g.strip : stem(e.T),
    key: g.key || 'node', level: g.level || '', subject: g.subject || '',
    row: Object.assign({ key_stage: 'KS4', band_type: 'stage', band_value: 'GCSE', level: 'GCSE', tier: 'Foundation' }, g.row || {}) };
}
/* THE DOTTED STEM every node id of a tree shares ("xx.ma." for xx.ma, xx.ma.num, ...), cut from its set ids. */
function stem(T) {
  const ids = ((T && T.nodes) || []).map(n => n.id.split('.'));
  if (!ids.length) return '';
  let k = 0; while (ids.every(p => p.length > k && p[k] === ids[0][k])) k++;
  return k ? ids[0].slice(0, k).join('.') + '.' : '';
}
function bind(t, node, e) {
  const c = cfg(e), b = Object.assign({}, t);
  b[c.key] = node; b._node = node; b._key = c.key; b._cc = e.country; b._sub = e.subject;
  return b;
}
const liveTable = t => { const e = CU().entries().find(x => x.country === t._cc && x.subject === (t._sub || 'maths')); return e ? e.T : { nodes: [] }; };
const nodeOf = (t, D) => ((D || liveTable(t)).nodes || []).find(n => n.id === t._node) || null;
function version(t, D) {
  if (t._v && t._D === (D || null)) return t._v;
  const own = {}; Object.keys(t).filter(k => k[0] !== '_').forEach(k => { own[k] = t[k]; });
  const v = crypto.createHash('sha1').update(canon(own) + '\n' + canon(nodeOf(t, D))).digest('hex').slice(0, 8);
  Object.defineProperty(t, '_v', { value: v, configurable: true, writable: true });
  Object.defineProperty(t, '_D', { value: D || null, configurable: true, writable: true });
  return v;
}
const tplId = (t, D) => t.id + '.' + version(t, D);

/* ONE QUESTION FROM ITS NUMBERS (a bound template): { id, node, template, text, key, typed, wrong, answer_type, marks, nums }. */
function make(t, nums, D) {
  const env = {};
  varNames(t).forEach((k, i) => { env[k] = nums[i]; });
  Object.keys(t.let || {}).forEach(k => { env[k] = evaluate(t.let[k], env); });
  return {
    id: 'gen:' + t._node + ':' + tplId(t, D) + ':' + nums.join(','), node: t._node, template: tplId(t, D), version: version(t, D), nums: nums.slice(),
    text: fill(t.text, env), key: fill(t.key, env), typed: (t.typed || []).map(p => fill(p, env)), wrong: t.wrong == null ? null : fill(t.wrong, env),
    answer_type: t.answer_type, marks: t.marks, env,
  };
}
/* ONE QUESTION FROM A SEED: numbers drawn until the conditions hold (a template that cannot meet them in 5000 draws is broken). */
function generate(t, seed, D) {
  const r = rng(hash(tplId(t, D)) ^ seed);
  for (let i = 0; i < 5000; i++) {
    const nums = varNames(t).map(k => { const [lo, hi] = t.vars[k]; return lo + Math.floor(r() * (hi - lo + 1)); });
    if (!nums.every((n, j) => inRange(t, varNames(t)[j], n))) continue;
    const env = {}; varNames(t).forEach((k, j) => { env[k] = nums[j]; });
    if (meets(t, env)) return make(t, nums, D);
  }
  throw new Error('template ' + tplId(t, D) + ' found no numbers meeting its conditions');
}

/* EVERY TEMPLATE EVERY COUNTRY MAPS, BOUND: [{ b, e, t, node }], countries in order, nodes A–Z, a node's skills in its list's order. A skill id
   no template has is `t: null` (tools/one-curriculum.js reports it). `E`: curriculum entries (default every live country file). */
function bindings(T, E) {
  T = T || table(); E = E || CU().entries();
  const out = [];
  E.forEach(e => Object.keys((e.T && e.T.templates) || {}).sort().forEach(node => [].concat(e.T.templates[node]).forEach(id => {
    const t = T.templates.find(x => x.id === id) || null;
    out.push({ e, node, t, b: t ? bind(t, node, e) : null });
  })));
  return out;
}
/* THE QUESTION AN ID NAMES, or null if no template of that version makes it. */
function fromId(id, T, E) {
  const m = /^gen:([^:]+):([^:]+)\.([0-9a-f]{8}):(-?\d+(?:,-?\d+)*)$/.exec(String(id));
  if (!m) return null;
  const x = bindings(T, E).find(y => y.b && y.node === m[1] && y.t.id === m[2] && version(y.b, y.e.T) === m[3]);
  if (!x) return null;
  const t = x.b, nums = m[4].split(',').map(Number);
  if (nums.length !== varNames(t).length || !nums.every((n, j) => inRange(t, varNames(t)[j], n))) return null;
  const env = {}; varNames(t).forEach((k, j) => { env[k] = nums[j]; });
  return meets(t, env) ? make(t, nums, x.e.T) : null;
}

/* ---------- THE ROWS (owner, 25 Nov): one @family question set per country sub-topic, never mixed into a past paper ---------- */
const SET_PREFIX = 'P-FAM-GEN-';
const setOf = (node, e) => { const c = cfg(e), s = String(node); return c.set_prefix + (s.startsWith(c.strip) ? s.slice(c.strip.length) : s).replace(/\./g, '-'); };
/* THE NODE A GENERATED SET IS FOR in one country's tree, read back from its id (null: not that country's generated set). */
function nodeOfSet(pid, e) {
  if (!String(pid || '').startsWith(SET_PREFIX) || !e || !e.T) return null;
  const n = e.T.nodes.find(x => setOf(x.id, e) === pid);
  return n ? n.id : null;
}
/* THE COUNTRY AND NODE A GENERATED SET IS FOR, in every country file: { e, node } or null. */
function setNode(pid, E) {
  if (!String(pid || '').startsWith(SET_PREFIX)) return null;
  for (const e of E || CU().entries()) { const node = nodeOfSet(pid, e); if (node) return { e, node }; }
  return null;
}
const rowId = (q, e) => cfg(e).row_prefix + q.template.replace('.', '-') + '-' + q.nums.map(n => (n < 0 ? 'm' + -n : String(n))).join('-');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = s => esc(s).replace(/\^(-?\d+)/g, '<sup>$1</sup>');

/* THE FIXED SET OF ONE BOUND TEMPLATE: seeds 1, 2, ... until SET_SIZE different questions (two seeds may draw the same numbers). */
function fixed(t, D) {
  const out = [], seen = new Set();
  for (let s = 1; out.length < SET_SIZE && s <= SET_SIZE * 20; s++) { const q = generate(t, s, D); if (!seen.has(q.id)) { seen.add(q.id); out.push(q); } }
  return out;
}
/* EVERY GENERATED QUESTION AS DATA: { rows (per country, per node: its set row, then its questions in skill order), words: {row_id: words} }.
   A set's idea: the one its country file's `ideas` (or `gen_ideas`) gives its node (ideaOfNode), or none. */
function emit(T, E) {
  T = T || table(); E = E || CU().entries();
  const rows = [], words = {}, groups = [], at = new Map();
  bindings(T, E).filter(x => x.b).forEach(x => {
    const k = x.e.file + '|' + x.node;
    if (!at.has(k)) { at.set(k, { e: x.e, node: x.node, list: [] }); groups.push(at.get(k)); }
    at.get(k).list.push(x.b);
  });
  const ideas = new Map();
  groups.forEach(({ e, node, list }) => {
    const c = cfg(e), D = e.T, pid = setOf(node, e), n = nodeOf({ _node: node }, D);
    if (!ideas.has(e)) ideas.set(e, ideaOfNode(D));
    const idea = ideas.get(e);
    rows.push({ row_id: 'D-' + pid, paper_id: pid, kind: 'document', name: n ? n.name : node, subject: subjectOf(node, e, c), key_stage: c.row.key_stage,
      band_type: c.row.band_type, band_value: c.row.band_value, level: c.row.level, tier: c.row.tier, company: COMPANY, document_type: 'Question set',
      trackable: 'True', printable: 'False', active: 'True' });
    let k = 0;
    list.forEach(t => fixed(t, D).forEach(q => {
      const id = rowId(q, e), r = { row_id: id, paper_id: pid, question: String(++k), kind: 'question', marks: String(t.marks), answer_type: t.answer_type,
        active: 'True', lib_has: 'html answer accept', function_verified: 'True', lib_pending: 'True' };
      if (idea[node]) r.idea_id = idea[node];
      r[CU().FIELD] = node;
      rows.push(r);
      words[id] = { html: '<p>' + html(q.text) + '</p>', answer: '<b>' + html(q.key.split('|')[0].trim()) + '</b>', accept: q.key };
    }));
  });
  return { rows, words };
}
/* A SET'S SUBJECT: the country file's subject (Maths), or with `gen.subject` "root" the name of the node's top topic (science sets are
   Biology, Chemistry or Physics, as every other science set is). */
function subjectOf(node, e, c) {
  if (c.subject !== 'root') return CU().SUBJECTS[e.subject].tax;
  let n = nodeOf({ _node: node }, e.T);
  while (n && n.parent) n = nodeOf({ _node: n.parent }, e.T);
  return n ? n.name : CU().SUBJECTS[e.subject].tax;
}
/* A NODE'S IDEA IN ONE COUNTRY FILE: the first (A–Z) idea its `ideas` maps to exactly that node; else the idea its `gen_ideas` names for a
   sub-topic no idea maps to (the card that teaches it); none if neither does. */
function ideaOfNode(D) {
  const out = {};
  Object.keys(D.ideas || {}).sort().forEach(i => { const n = D.ideas[i]; if (!out[n]) out[n] = i; });
  Object.keys(D.gen_ideas || {}).forEach(n => { if (!out[n]) out[n] = D.gen_ideas[n]; });
  return out;
}
/* A GENERATED SET'S IDEA ('' when none, null when the set is no country's generated set). */
function ideaOfSet(pid, E) { const s = setNode(pid, E); return s ? ideaOfNode(s.e.T)[s.node] || '' : null; }

module.exports = { TABLE, table, cfg, bind, bindings, generate, fromId, make, evaluate, tplId, version, canon, HELP, SET_SIZE, SET_PREFIX, setOf, nodeOfSet,
  setNode, ideaOfSet, rowId, fixed, emit, ideaOfNode, stem };
