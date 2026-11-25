/* @family. — tools/lib/qgen.js GENERATED MATHS QUESTIONS (owner queue item 6, first slice: nothing in js/ reads them yet). One format,
   data/settings/qgen.json: a template is a DfE sub-topic, a version, whole-number ranges and conditions, a question pattern and an answer key
   the site's one marker reads (js/find-marking.js markAnswer_). A seed picks the numbers; the numbers make the id
   gen:<dfe>:<template>.v<v>:<n1>,<n2>,... and the id alone makes the question again, the same every time. Checked by tools/one-gen.js. */
'use strict';
const SD = require('./site-data.js');

const TABLE = 'data/settings/qgen.json';
const table = () => SD.json(TABLE);

/* THE HELPERS an expression may call. */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const HELP = {
  gcd, lcm: (a, b) => Math.abs(a * b) / gcd(a, b),
  sgn: n => (n < 0 ? '- ' + -n : '+ ' + n),            /* the sign and size of a term after the first: + 3, - 3 */
  co: n => (n === 1 ? '' : n === -1 ? '-' : String(n)), /* a coefficient: 1x is x */
  fix: n => String(+n.toFixed(10)),
  tight: s => String(s).replace(/ /g, ''),
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
const tplId = t => t.id + '.v' + t.v;

/* ONE QUESTION FROM ITS NUMBERS: { id, dfe, template, text, key, typed, wrong, answer_type, marks, nums }. */
function make(t, nums) {
  const env = {};
  varNames(t).forEach((k, i) => { env[k] = nums[i]; });
  Object.keys(t.let || {}).forEach(k => { env[k] = evaluate(t.let[k], env); });
  return {
    id: 'gen:' + t.dfe + ':' + tplId(t) + ':' + nums.join(','), dfe: t.dfe, template: tplId(t), nums: nums.slice(),
    text: fill(t.text, env), key: fill(t.key, env), typed: (t.typed || []).map(p => fill(p, env)), wrong: t.wrong == null ? null : fill(t.wrong, env),
    answer_type: t.answer_type, marks: t.marks, env,
  };
}
/* ONE QUESTION FROM A SEED: numbers drawn until the conditions hold (a template that cannot meet them in 5000 draws is broken). */
function generate(t, seed) {
  const r = rng(hash(tplId(t)) ^ seed);
  for (let i = 0; i < 5000; i++) {
    const nums = varNames(t).map(k => { const [lo, hi] = t.vars[k]; return lo + Math.floor(r() * (hi - lo + 1)); });
    if (!nums.every((n, j) => inRange(t, varNames(t)[j], n))) continue;
    const env = {}; varNames(t).forEach((k, j) => { env[k] = nums[j]; });
    if (meets(t, env)) return make(t, nums);
  }
  throw new Error('template ' + tplId(t) + ' found no numbers meeting its conditions');
}
/* THE QUESTION AN ID NAMES, or null if no template of that version makes it. */
function fromId(id, T) {
  const m = /^gen:([^:]+):([^:]+)\.v(\d+):(-?\d+(?:,-?\d+)*)$/.exec(String(id));
  if (!m) return null;
  const t = (T || table()).templates.find(x => x.id === m[2] && x.v === +m[3] && x.dfe === m[1]);
  if (!t) return null;
  const nums = m[4].split(',').map(Number);
  if (nums.length !== varNames(t).length || !nums.every((n, j) => inRange(t, varNames(t)[j], n))) return null;
  const env = {}; varNames(t).forEach((k, j) => { env[k] = nums[j]; });
  return meets(t, env) ? make(t, nums) : null;
}

module.exports = { TABLE, table, generate, fromId, make, evaluate, tplId, HELP };
