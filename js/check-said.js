/* A FAILURE IS SAID IN WORDS (561, U13): a toast or a said-line that prints an error prints it through why_(), never its raw .message.
   Flags: -v lists every file read. Exits 1 on any hit, or if no file could be read. */
const fs = require('fs'), path = require('path');
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => /\.js$/.test(f) && !/^check/.test(f));
if (!files.length) { console.log('FAILED — no js/ files found to read'); process.exit(1); }
const RAW = /(toast\(|textContent\s*=|innerHTML\s*=)[^;]*(\b(err|e|error)\.message\b|String\(\s*(err|e|error)\b)/;
const hits = [];
files.forEach(f => {
  fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((l, i) => {
    if (RAW.test(l) && !/why_\(/.test(l)) hits.push(f + ':' + (i + 1) + '  ' + l.trim().slice(0, 140));
  });
});
if (process.argv.includes('-v')) console.log('read ' + files.length + ' files');
if (hits.length) {
  console.log('AN ERROR SHOWN RAW — say it through why_(err), which turns "Failed to fetch" into a sentence  (' + hits.length + ')');
  hits.forEach(h => console.log('  ' + h));
  console.log('FAILED');
  process.exit(1);
}
console.log('OK — every error shown goes through why_() (' + files.length + ' files read).');
