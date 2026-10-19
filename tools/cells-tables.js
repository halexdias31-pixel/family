/* tools/cells-tables.js — writes `cells` (a table's blanks, in reading order) on the rows below. Re-run after changing one;
   never hand-edit `cells` on these rows. `node tools/cells-tables.js` (docs/history/359). */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'questions.json');
const rows = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const BLANK = /<(td|th)([^>]*)>\s*(?:&nbsp;| )?\s*<\/\1>/;
const strip = h => String(h).replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').trim();

/* A GRID WITH NUMBER HEADINGS: each blank is f(row heading, column heading). */
function grid(r, f) {
  const t = r.html.match(/<table[\s\S]*?<\/table>/)[0];
  const trs = t.match(/<tr[\s\S]*?<\/tr>/g);
  const head = (trs[0].match(/<t[dh][\s\S]*?<\/t[dh]>/g) || []).map(strip);
  const out = (trs[0].match(/<t[dh][\s\S]*?<\/t[dh]>/g) || []).filter(td => BLANK.test(td)).map(() => '-');
  trs.slice(1).forEach(tr => {
    const tds = tr.match(/<t[dh][\s\S]*?<\/t[dh]>/g) || [];
    tds.forEach((td, j) => { if (BLANK.test(td)) out.push(String(f(Number(strip(tds[0])), Number(head[j])))); });
  });
  return out;
}
const SET = {
  'Q-CBM-5AD-F-0708-4': r => grid(r, (a, b) => a * b),
  'Q-CBM-5AD-F-0828-3': r => grid(r, (a, b) => a * b),
  'Q-CBM-5AD-F-1030-3': r => grid(r, (a, b) => a * b),
  'Q-CBM-5AD-F-1024-5': r => grid(r, (a, b) => Math.abs(a - b)),
  'Q-1MA1-1706-2H-14': () => ['C', 'F', 'A', 'H'],
  'Q-AQA-7408-2306-3A-024': () => ['6.82', '1.77 | 1.76 | 1.78', '17.0 | 17 | 16.9 | 17.1'],
};
let n = 0;
rows.forEach(r => {
  const f = SET[r.row_id];
  if (!f) return;
  const cells = f(r);
  const blanks = (String(r.html).match(new RegExp(BLANK.source, 'g')) || []).length;
  if (cells.length !== blanks) throw new Error(r.row_id + ': ' + cells.length + ' cells for ' + blanks + ' blanks');
  r.cells = cells.join(' ; ');
  n++;
});
if (n !== Object.keys(SET).length) throw new Error('found ' + n + ' of ' + Object.keys(SET).length + ' rows');
fs.writeFileSync(FILE, '[\n' + rows.map(r => JSON.stringify(r)).join(',\n') + '\n]\n');
console.log('cells written on ' + n + ' rows');
