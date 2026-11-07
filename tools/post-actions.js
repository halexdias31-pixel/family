// doPost's actions since 1130: dopost.gs's gate plus the handlers in backend/post-*.gs, named in postActions_().
// Checks read actions and their handler bodies through here, so they do not depend on which file a handler is in.
const fs = require('fs');
const path = require('path');

/* dopost.gs then every post-*.gs, as one text. */
function postSrc(root) {
  const d = path.join(root || path.join(__dirname, '..'), 'backend');
  const files = ['dopost.gs'].concat(fs.readdirSync(d).filter(f => /^post-.*\.gs$/.test(f)).sort());
  return files.map(f => fs.readFileSync(path.join(d, f), 'utf8')).join('\n');
}

/* [{ action, fn }] from the table, in its order. */
function postTable(src) {
  const m = /function postActions_\(\) \{\s*return \{([\s\S]*?)\};/.exec(src);
  return m ? [...m[1].matchAll(/^\s*(\w+): (\w+),?\s*$/gm)].map(x => ({ action: x[1], fn: x[2] })) : [];
}

/* every action name: the table's and any `action === '…'` still tested in the gate. */
function postActionNames(src) {
  return [...new Set(postTable(src).map(x => x.action).concat([...src.matchAll(/action === '(\w+)'/g)].map(m => m[1])))];
}

/* the handler function an action runs, as text ('' if none). */
function postHandler(src, action) {
  const t = postTable(src).find(x => x.action === action);
  if (!t) return '';
  const m = new RegExp('\\nfunction ' + t.fn + '\\(body, action, began\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src);
  return m ? m[0] : '';
}

module.exports = { postSrc, postTable, postActionNames, postHandler };
