/* @family. — file-lists.js: THE ONE LIST OF BACKEND FILES is backend/files.json (sync.js pushes by it, check-manifest keeps it whole); checks read it here, never a copy. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
/* The .gs files, in files.json's order (the order Apps Script loads them), as full paths; `root` lets a check point at another checkout. */
function gsFiles(root) {
  const dir = path.join(root || ROOT, 'backend');
  return JSON.parse(fs.readFileSync(path.join(dir, 'files.json'), 'utf8')).filter(f => f.endsWith('.gs')).map(f => path.join(dir, f));
}
/* Every backend file's code joined in load order, as one script for a vm sandbox. */
const gsSource = root => gsFiles(root).map(p => fs.readFileSync(p, 'utf8')).join('\n;\n');

/* The app's files, index.html's FILES in load order, as names ('core', 'shell-boot'); `root` lets a check point at another checkout. */
function appFiles(root) {
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(fs.readFileSync(path.join(root || ROOT, 'index.html'), 'utf8'));
  if (!m) throw new Error("cannot read window.FILES out of index.html");
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}
/* OLD COLUMNS, READ ONLY AS AN OLD ROW'S FALLBACK (owner, 12 Nov): out of the schema, never written, still in old sheets. check-columns and check-rows both read this. */
const OLD_READS = { receipts: ['person_name'] };

module.exports = { gsFiles, gsSource, appFiles, OLD_READS };
