/* @family. — tools/catches.js THE ONE COUNT OF EMPTY CATCHES (rules 10.5, 11.3). */
/* js/check-catches.js gates it, tools/health.js scores it and tools/stability.js weighs it: one count. A comment inside = deliberate. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const EMPTY = /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g;
/* The app's files: js/ less the checks, and the backend. */
function appFiles() {
  const ls = d => { try { return fs.readdirSync(path.join(ROOT, d)).sort(); } catch (e) { return []; } };
  return ls('js').filter(f => f.endsWith('.js') && !f.startsWith('check')).map(f => 'js/' + f)
    .concat(ls('backend').filter(f => f.endsWith('.gs')).map(f => 'backend/' + f));
}
/* Every empty catch block in the files given (default: all the app's), each with its file and line. */
function emptyCatches(files) {
  const out = [];
  for (const file of files || appFiles()) {
    let s = ''; try { s = fs.readFileSync(path.join(ROOT, file), 'utf8'); } catch (e) { continue; /* a listed file that is gone has none */ }
    for (const m of s.matchAll(EMPTY)) out.push({ file, line: s.slice(0, m.index).split('\n').length, text: s.slice(m.index, m.index + 60).split('\n')[0] });
  }
  return out;
}
module.exports = { emptyCatches, appFiles };
