/* @family. — tools/lib/site-data.js THE SITE'S DATA, FOR A CHECK (UNIFY NEXT 1, 22 Nov): kinds.json, settings.json, words.json, permissions.json and
   the questions (data/questions.json, the words in git-ignored data-private/questions.json), each read one way. tools/one-helper.js fails a check that reads these by hand. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT } = require('./gen.js');
/* json(rel): the parsed file, fresh each call (a check may change what it is handed), or null when it is not here. */
function json(rel) {
  const f = path.join(ROOT, rel);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}
const kinds = () => json('data/settings/kinds.json').kinds;
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
module.exports = { json, kinds, settings, permissions, words, textOf, questions, hasPrivate, privateQuestions };
