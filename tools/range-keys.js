#!/usr/bin/env node
/* @family. — tools/range-keys.js THE RANGE-KEY CHECK (rule 1.75, owner 20 Nov): a child who reads 432.6 off a graph whose scheme says
   "430 years (420–440)" is right. Every question whose key lists only exact numbers while its mark scheme answer states a numeric tolerance
   around them ("(a–b)", "a to b", "accept/allow a–b", "between a and b", "a ± b") carries a range rule (`rule: count 1, sum a..b`), or is
   listed below as not a tolerance. Counted site-wide over data-private/questions.json; one unlisted row fails the build. Run by tools/build.js. */
'use strict';
const SD = require('./lib/site-data.js');
const { main } = require('./lib/gen.js');
/* NOT A TOLERANCE: the range in the answer is working, a rounding bound, a data span or a list of whole answers, not a read-off allowance. */
const EXCEPT = new Set([
  'Q-9MA031-2206-2b', 'Q-1MA1-2406-2H-9a', 'Q-STA-KS2-2024-P2-6', 'Q-1CM-averages-from-tables-8', 'Q-1CM-reverse-mean-2',
  'Q-1CM-speed-time-graphs-14', 'Q-CBM-bar-charts-3', 'Q-CBM-bar-charts-8', 'Q-CBM-bar-charts-9b', 'Q-CBM-angles-measuring-drawing-2',
  'Q-CBM-multiples-7', 'Q-CBM-multiples-7b', 'Q-CBM-multiples-7c', 'Q-CBM-multiples-8', 'Q-CBM-multiples-15',
  'Q-CBM-multiplying-and-dividing-by-10-100-1000-etc-33b', 'Q-CBM-rounding-1c', 'Q-CBM-rounding-2', 'Q-CBM-rounding-2b', 'Q-CBM-rounding-5d',
  'Q-CBM-rounding-7c', 'Q-CBM-rounding-14c', 'Q-CBM-timetables-5', 'Q-1MA1-1806-3H-18c', 'Q-1MA1-1711-2H-7', 'Q-CBM-5AD-F-0813-1',
  'Q-CBM-5AD-F-0821-4', 'Q-CBM-5AD-F-0911-3c', 'Q-CBM-5AD-F-1014-2', 'Q-EDX-FSL2-PRAC1-B-10a', 'Q-STA-KS2-2022-P3-11',
  'Q-AQA-7357-2011-1-10aiii', 'Q-AQA-8463-2011-2H-061', 'Q-AQA-8464B-2306-2H-064', 'Q-AQA-8464C-2111-1F-017', 'Q-AQA-8464P-2011-1H-032',
  'Q-OCR-J248-1906-02-18d', 'Q-1MA1-2411-1F-4', 'Q-T-AT-B-ecology-2-3', 'Q-AQA-8300-2306-3F-2b',
]);
const plain = s => String(s || '').replace(/<[^>]+>/g, '').replace(/&ndash;|&minus;|–|—|−/g, '-').replace(/&plusmn;/g, '±').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ');
const N = '(-?\\d+(?:\\.\\d+)?)';
const RES = [
  new RegExp('\\(\\s*(?:accept|allow)?\\s*(?:any value )?(?:from )?' + N + '\\s*(?:-|to)\\s*' + N, 'gi'),
  new RegExp('(?:accept|allow)[^.;|]{0,30}?' + N + '\\s*(?:-|to)\\s*' + N, 'gi'),
  new RegExp('\\b' + N + '\\s+to\\s+' + N + '\\b', 'gi'),
  new RegExp('(?:between|from)\\s+' + N + '\\s+(?:and|to)\\s+' + N, 'gi'),
  new RegExp(N + '\\s*±\\s*' + N, 'g'),
];
/* The rows the rule covers: an exact-numbers key whose answer states a range around one of its numbers. */
function rows() {
  const q = SD.privateQuestions();
  const out = [];
  for (const [id, r] of Object.entries(q)) {
    const k = String(r.accept || ''); if (!k) continue;
    const ways = k.split('|').map(s => s.trim()).filter(w => !/^rule:\s*count 1, sum -?[\d.]+\.\.-?[\d.]+$/.test(w));
    if (ways.some(w => /^rule:/.test(w)) || !ways.every(w => /^[£$]?-?[\d.,]+\s*[a-zA-Z%°£/ ²³]{0,14}$/.test(w))) continue;
    const vals = ways.map(w => parseFloat(w.replace(/[£$,]/g, ''))).filter(x => !isNaN(x));
    const a = plain(r.answer); let hit = false;
    RES.forEach((re, i) => { for (const m of a.matchAll(re)) { let lo = +m[1], hi = +m[2]; if (i === 4) [lo, hi] = [lo - hi, lo + hi];
      if (lo < hi && !(lo >= 1900 && hi <= 2100) && vals.some(v => v >= lo && v <= hi)) hit = true; } });
    if (hit) out.push({ id, ranged: /rule:\s*count 1, sum -?[\d.]+\.\./.test(k) });
  }
  return out;
}
function run() {
  const rs = rows(), bad = rs.filter(r => !r.ranged && !EXCEPT.has(r.id));
  console.log('range-keys: ' + rs.length + ' keys state a range; ' + rs.filter(r => r.ranged).length + ' carry a range rule, '
    + rs.filter(r => !r.ranged && EXCEPT.has(r.id)).length + ' listed as not a tolerance, ' + bad.length + ' neither');
  bad.forEach(r => console.log('  ' + r.id + ': its answer states a range; add `rule: count 1, sum a..b` or list it'));
  if (bad.length) throw new Error('range-keys: ' + bad.length + ' key(s) without a range rule');
  return { n: rs.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
