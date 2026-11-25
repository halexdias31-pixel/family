/* @family. — tools/lib/qgen.js GENERATED MATHS QUESTIONS (owner queue item 6; owner 25 Nov: first-class @family questions). One format,
   data/settings/qgen.json: a template is a DfE sub-topic, whole-number ranges and conditions, a question pattern and an answer key the site's
   one marker reads (js/find-marking.js markAnswer_). THE VERSION IS A FINGERPRINT, never written by hand: 8 hex of the template's canonical
   JSON with its DfE node's record (data/settings/dfe-maths.json), so the questions are a pure function of the two — edit either and they
   change, revert and they come back exactly. A seed picks the numbers; the numbers make the id gen:<dfe>:<template>.<version>:<n1>,<n2>,...
   and the id alone makes the question again. emit() is the fixed set (seeds 1.. until SET_SIZE different questions per template) written as
   ordinary rows of data/questions.json by tools/gen-questions.js, one @family question set per DfE sub-topic. Checked by tools/one-gen.js. */
'use strict';
const crypto = require('crypto');
const SD = require('./site-data.js');

const TABLE = 'data/settings/qgen.json', DFE = 'data/settings/dfe-maths.json';
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
const nodeOf = (t, D) => ((D || SD.json(DFE)).nodes || []).find(n => n.id === t.dfe) || null;
function version(t, D) {
  if (t._v && t._D === (D || null)) return t._v;
  const own = {}; Object.keys(t).filter(k => k[0] !== '_').forEach(k => { own[k] = t[k]; });
  const v = crypto.createHash('sha1').update(canon(own) + '\n' + canon(nodeOf(t, D))).digest('hex').slice(0, 8);
  Object.defineProperty(t, '_v', { value: v, configurable: true, writable: true });
  Object.defineProperty(t, '_D', { value: D || null, configurable: true, writable: true });
  return v;
}
const tplId = (t, D) => t.id + '.' + version(t, D);

/* ONE QUESTION FROM ITS NUMBERS: { id, dfe, template, text, key, typed, wrong, answer_type, marks, nums }. */
function make(t, nums, D) {
  const env = {};
  varNames(t).forEach((k, i) => { env[k] = nums[i]; });
  Object.keys(t.let || {}).forEach(k => { env[k] = evaluate(t.let[k], env); });
  return {
    id: 'gen:' + t.dfe + ':' + tplId(t, D) + ':' + nums.join(','), dfe: t.dfe, template: tplId(t, D), version: version(t, D), nums: nums.slice(),
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
/* THE QUESTION AN ID NAMES, or null if no template of that version makes it. */
function fromId(id, T, D) {
  const m = /^gen:([^:]+):([^:]+)\.([0-9a-f]{8}):(-?\d+(?:,-?\d+)*)$/.exec(String(id));
  if (!m) return null;
  const t = (T || table()).templates.find(x => x.id === m[2] && x.dfe === m[1] && version(x, D) === m[3]);
  if (!t) return null;
  const nums = m[4].split(',').map(Number);
  if (nums.length !== varNames(t).length || !nums.every((n, j) => inRange(t, varNames(t)[j], n))) return null;
  const env = {}; varNames(t).forEach((k, j) => { env[k] = nums[j]; });
  return meets(t, env) ? make(t, nums, D) : null;
}

/* ---------- THE ROWS (owner, 25 Nov): one @family question set per DfE sub-topic, never mixed into a past paper ---------- */
const SET_PREFIX = 'P-FAM-GEN-';
const setOf = node => SET_PREFIX + String(node).replace(/^dfe\.ma\./, '').replace(/\./g, '-');
/* THE NODE A GENERATED SET IS FOR, read back from its id against the table (null: not a generated set). */
function nodeOfSet(pid, D) {
  if (!String(pid || '').startsWith(SET_PREFIX)) return null;
  const n = (D || SD.json(DFE)).nodes.find(x => setOf(x.id) === pid);
  return n ? n.id : null;
}
const rowId = q => 'Q-GEN-' + q.template.replace('.', '-') + '-' + q.nums.map(n => (n < 0 ? 'm' + -n : String(n))).join('-');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = s => esc(s).replace(/\^(-?\d+)/g, '<sup>$1</sup>');

/* THE FIXED SET OF ONE TEMPLATE: seeds 1, 2, ... until SET_SIZE different questions (two seeds may draw the same numbers). */
function fixed(t, D) {
  const out = [], seen = new Set();
  for (let s = 1; out.length < SET_SIZE && s <= SET_SIZE * 20; s++) { const q = generate(t, s, D); if (!seen.has(q.id)) { seen.add(q.id); out.push(q); } }
  return out;
}
/* EVERY GENERATED QUESTION AS DATA: { sets: [{pid, node, name}], rows (set rows, then its questions in template order), words: {row_id: words} }.
   ideaOf(node): the maths idea data/settings/dfe-maths.json `ideas` maps to that node, or '' (tools/lib/qideas.js reads the same). */
function emit(T, D) {
  T = T || table(); D = D || SD.json(DFE);
  const byNode = {}, rows = [], words = {};
  T.templates.forEach(t => { (byNode[t.dfe] = byNode[t.dfe] || []).push(t); });
  const idea = ideaOfNode(D);
  Object.keys(byNode).sort().forEach(node => {
    const pid = setOf(node), n = nodeOf({ dfe: node }, D);
    rows.push({ row_id: 'D-' + pid, paper_id: pid, kind: 'document', name: n ? n.name : node, subject: 'Maths', key_stage: 'KS4', band_type: 'stage',
      band_value: 'GCSE', level: 'GCSE', tier: 'Foundation', company: COMPANY, document_type: 'Question set', trackable: 'True', printable: 'False', active: 'True' });
    let k = 0;
    byNode[node].forEach(t => fixed(t, D).forEach(q => {
      const id = rowId(q), r = { row_id: id, paper_id: pid, question: String(++k), kind: 'question', marks: String(t.marks), answer_type: t.answer_type,
        active: 'True', lib_has: 'html answer accept', function_verified: 'True', lib_pending: 'True' };
      if (idea[node]) r.idea_id = idea[node];
      r.dfe = node;
      rows.push(r);
      words[id] = { html: '<p>' + html(q.text) + '</p>', answer: '<b>' + html(q.key.split('|')[0].trim()) + '</b>', accept: q.key };
    }));
  });
  return { rows, words };
}
/* A DfE NODE'S MATHS IDEA: the first (A–Z) idea the table's `ideas` maps to exactly that node; else the idea its `gen_ideas` names for a
   sub-topic no idea maps to (the card that teaches it); none if neither does. */
function ideaOfNode(D) {
  const out = {}; D = D || SD.json(DFE);
  Object.keys(D.ideas || {}).sort().forEach(i => { const n = D.ideas[i]; if (!out[n]) out[n] = i; });
  Object.keys(D.gen_ideas || {}).forEach(n => { if (!out[n]) out[n] = D.gen_ideas[n]; });
  return out;
}

module.exports = { TABLE, DFE, table, generate, fromId, make, evaluate, tplId, version, canon, HELP, SET_SIZE, SET_PREFIX, setOf, nodeOfSet, rowId, fixed, emit, ideaOfNode };
