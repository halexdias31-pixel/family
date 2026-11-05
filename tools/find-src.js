/* @family. — tools/find-src.js FIND IS SEVERAL FILES (1040): the checks read them as one text, in index.html's order, so a cut never loses a check its subject. */
const fs = require('fs'), path = require('path');
const ROOT_ = path.join(__dirname, '..');
/* The pieces are FILES entries named find-…; none found is a throw, never an empty pass. */
function findFiles(root) {
  const html = fs.readFileSync(path.join(root || ROOT_, 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  const names = m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]).filter(n => /^find(-|$)/.test(n)) : [];
  if (!names.length) throw new Error('tools/find-src.js: no find pieces in index.html window.FILES');
  return names.map(n => 'js/' + n + '.js');
}
/* Joined with nothing between: each piece already ends in a newline. */
function findSrc(root) { return findFiles(root).map(f => fs.readFileSync(path.join(root || ROOT_, f), 'utf8')).join(''); }
module.exports = { findFiles, findSrc };
