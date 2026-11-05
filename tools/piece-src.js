const fs = require('fs'), path = require('path');
const ROOT_ = path.join(__dirname, '..');
/* A file cut into pieces (js/me.js into me-*.js, js/shell.js into shell-*.js) is read back here by its old name; none found is a throw. */
function pieceFiles(base, root) {
  const html = fs.readFileSync(path.join(root || ROOT_, 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  const re = new RegExp('^' + base + '(-|$)');
  const names = m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]).filter(n => re.test(n)) : [];
  if (!names.length) throw new Error('tools/piece-src.js: no ' + base + ' pieces in index.html window.FILES');
  return names.map(n => 'js/' + n + '.js');
}
/* Joined with nothing between: each piece already ends in a newline, so the text is the old file's. */
function pieceSrc(base, root) { return pieceFiles(base, root).map(f => fs.readFileSync(path.join(root || ROOT_, f), 'utf8')).join(''); }
module.exports = { pieceFiles, pieceSrc };
