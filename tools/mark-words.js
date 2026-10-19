/* tools/mark-words.js — writes `mark_words` (key words that mark a 1–2 mark worded answer without AI) where the mark
   scheme's headline is clearly a short naming answer. Re-run it; a hand-written rule goes in HAND. docs/history/359. */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'questions.json');
const rows = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const DRY = process.argv.includes('--dry');
const HAND = {};
const STOP = new Set(('the a an of to is it and or in on be as so by at for its it\'s their they them this that these those with from into ' +
  'are was were has have will would can could should one any each both more less than then there which what who').split(' '));
const text = h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&rsquo;|&lsquo;/g, "'")
  .replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
/* THE HEADLINE: the scheme before its explanation (` — `, `:` or the first full stop). */
const headOf = a => text(String(a || '').split(/&mdash;|\u2014/)[0]).split(/:\s|\.\s|\.$/)[0].replace(/\(.*?\)/g, ' ').trim();
const ASKS = /^(what|which|name|give|state|write down|identify|suggest|choose|complete)\b/i;
const VAGUE = /\b(other|any|named|example|etc|correct|suitable|valid|sensible|yes|no|not|never|true|false)\b/i;
/* A QUESTION THAT ALSO WANTS A REASON is not marked by its headline alone. */
const WHY = /\b(reason|explain|justify|justifying|show|because|why|how)\b/i;
/* A WAY: 1-3 plain words, no digits, no symbols, no one-letter names -- a word that can only be right or wrong. */
function way(s) {
  const raw = s.trim().replace(/^(a|an|the)\s+/i, '');
  if (!raw || /[^a-z' -]/i.test(raw) || VAGUE.test(raw)) return '';
  const words = raw.toLowerCase().split(/[\s-]+/).filter(w => w && !STOP.has(w));
  if (!words.length || words.length > 3 || words.some(w => w.length < 3)) return '';
  return words.join('+');
}
let n = 0, by = {};
rows.forEach(r => {
  if (HAND[r.row_id]) { r.mark_words = HAND[r.row_id]; n++; return; }
  const type = String(r.answer_type || '').toLowerCase(), m = Number(r.marks);
  if (!['short', 'explain', 'written'].includes(type) || !(m === 1 || m === 2)) return;
  if (String(r.accept || '').trim() || (String(r.choices || '').trim() && String(r.choice_right || '').trim())) return;
  if (!ASKS.test(text(r.html).replace(/^.*?\b(?=(What|Which|Name|Give|State|Write down|Identify|Suggest|Choose|Complete)\b)/, ''))) return;
  if (WHY.test(text(r.html))) return;
  const head = headOf(r.answer);
  if (!head) return;
  /* ONE POINT A MARK: two marks want two parts (`;` or ` and `), one mark one part; ` or ` gives ways of one part. */
  const parts = m === 2 ? head.split(/;\s*|\s+and\s+/) : [head];
  if (parts.length !== m) return;
  const points = parts.map(p => p.split(/\s*,?\s+or\s+|\s*\/\s*/).map(way));
  if (points.some(ws => !ws.length || ws.some(w => !w))) return;
  const rule = points.map(ws => ws.join(' | ')).join(' ; ');
  if (r.mark_words !== rule) { r.mark_words = rule; }
  n++;
  by[r.subject] = (by[r.subject] || 0) + 1;
});
if (DRY) rows.filter(r => r.mark_words).forEach(r => console.log(r.row_id, '|', r.mark_words, '|', headOf(r.answer)));
else fs.writeFileSync(FILE, '[\n' + rows.map(r => JSON.stringify(r)).join(',\n') + '\n]\n');
console.log('mark_words on ' + n + ' rows', JSON.stringify(by));
