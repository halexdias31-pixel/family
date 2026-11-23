/* @family. — tools/lib/site-data.js THE SITE'S DATA, FOR A CHECK (UNIFY NEXT 1, 22 Nov): kinds.json, settings.json, words.json, permissions.json and
   the questions (data/questions.json, the words in git-ignored data-private/questions.json), each read one way. tools/one-helper.js fails a check that reads these by hand. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT } = require('./gen.js');
/* raw(rel): the parsed file as written, fresh each call (a check may change what it is handed), or null when it is not here. */
function raw(rel) {
  const f = path.join(ROOT, rel);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}
/* THE FILES WHOSE `label` IS A PHRASEBOOK KEY (UNIFY AFTER 1, 23 Nov): labels.json, kinds.json, facets.json name each label by its words.json key. */
const LABEL_FILES = ['data/settings/labels.json', 'data/settings/kinds.json', 'data/settings/facets.json'];
/* phrasebook(): every key's text, an old key (`aliases`) reading its one key's. */
function phrasebook() {
  const wj = raw('data/settings/words.json') || {}, w = Object.assign({}, wj.words || {});
  for (const [old, to] of Object.entries(wj.aliases || {})) if (old[0] !== '_' && typeof w[to] === 'string') w[old] = w[to];
  return w;
}
/* labelled(o): `o` with every string `label` read through the phrasebook — what a generator writes and the site reads. */
function labelled(o, w) {
  w = w || phrasebook();
  (function walk(x) {
    if (Array.isArray(x)) return x.forEach(walk);
    if (!x || typeof x !== 'object') return;
    for (const [k, v] of Object.entries(x)) if (k === 'label' && typeof v === 'string' && typeof w[v] === 'string') x[k] = w[v]; else walk(v);
  })(o);
  return o;
}
/* json(rel): the parsed file, its labels in words when it is one of LABEL_FILES. */
function json(rel) {
  const o = raw(rel);
  return o && LABEL_FILES.includes(rel) ? labelled(o) : o;
}
const kinds = () => json('data/settings/kinds.json').kinds;
const facets = () => json('data/settings/facets.json');
const labels = () => json('data/settings/labels.json');
const settings = () => json('data/settings/settings.json');
const permissions = () => json('data/settings/permissions.json');
const words = () => (json('data/settings/words.json') || {}).words || {};
/* textOf(): the site's own word lookup (js/core.js text_(key, vars)) on words.json as it is now; a key with no word is itself. */
function textOf() {
  const w = words();
  return (k, v) => { const s = typeof w[k] === 'string' ? w[k] : k; return v ? s.replace(/\{(\w+)\}/g, (a, x) => (v[x] == null ? a : String(v[x]))) : s; };
}
const questions = () => json('data/questions.json') || [];
const hasPrivate = () => fs.existsSync(path.join(ROOT, 'data-private', 'questions.json'));
const privateQuestions = () => json('data-private/questions.json');
module.exports = { raw, json, LABEL_FILES, phrasebook, labelled, kinds, facets, labels, settings, permissions, words, textOf, questions, hasPrivate, privateQuestions };
