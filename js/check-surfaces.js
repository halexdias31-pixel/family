require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* check-surfaces.js — NOTHING OPENS OVER THE APP § */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname);
const ROOT = path.join(__dirname, '..');

/* ---------- STRIP COMMENTS AND STRING BODIES § */
function strip(src) {
  let out = '', i = 0, n = src.length;
  const keep = c => (c === '\n' ? '\n' : ' ');
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') out += keep(src[i++]); continue; }
    if (c === '/' && d === '*') {
      out += '  '; i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) out += keep(src[i++]);
      out += '  '; i += 2; continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; out += q; i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') { out += '  '; i += 2; continue; }
        out += keep(src[i++]);
      }
      out += q; i++; continue;
    }
    out += c; i++;
  }
  return out;
}

const BANNED = [
  { re: /\bwindow\s*\.\s*open\s*\(/g,            name: 'window.open', use: 'openSheet()' },
  { re: /(^|[^.\w$])alert\s*\(/g,                name: 'alert()',     use: 'toast()' },
  { re: /(^|[^.\w$])confirm\s*\(/g,              name: 'confirm()',   use: "sure_(el, 'Are you sure?')" },
  /* A `.prompt()` ON AN OBJECT IS SOMEBODY ELSE'S API, not `window.prompt` — it was the browser's own install dialog, `INSTALL_PROMPT.prompt()`, until me.js § */
  { re: /(^|[^.\w$])prompt\s*\(/g,               name: 'prompt()',    use: 'a sheet with a field' },
];

const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.js') && !f.startsWith('check'))
  .map(f => path.join(DIR, f))
  .concat([path.join(ROOT, 'index.html')].filter(fs.existsSync));

const bad = [], blanks = [];

files.forEach(file => {
  const raw = fs.readFileSync(file, 'utf8');
  const src = strip(raw);
  const short = path.relative(ROOT, file);

  BANNED.forEach(({ re, name, use }) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      const line = src.slice(0, m.index).split('\n').length;
      bad.push({ short, line, name, use });
    }
  });

  /* `_blank` IS CHECKED ON THE STRIPPED SOURCE, like everything else — this file describes what it forbids, so a scan of the raw text finds its own comments and § */
  const lines = src.split('\n');
  lines.forEach((l, i) => {
    if (!l.includes('_blank')) return;
    const near = lines.slice(Math.max(0, i - 3), i + 1).join(' ');
    if (/https?/.test(near)) return;
    blanks.push({ short, line: i + 1, text: l.trim().slice(0, 90) });
  });
});

const say = (title, rows, draw) => {
  console.log('\n' + title + '  (' + rows.length + ')');
  if (!rows.length) { console.log('  none'); return; }
  rows.forEach(r => console.log('  ' + draw(r)));
};

say('A POP-UP, A NEW TAB OR A BROWSER DIALOG — see the surfaces tab', bad,
    r => `${r.short}:${r.line}  ${r.name}  ->  use ${r.use}`);

say('target="_blank" ON SOMETHING THAT IS NOT AN EXTERNAL ADDRESS', blanks,
    r => `${r.short}:${r.line}  ${r.text}`);

console.log('\nfiles read: ' + files.length);
if (bad.length || blanks.length) {
  console.log('FAILED — nothing in this app opens over the app. See Engine > surfaces.');
  process.exit(1);
}
console.log('OK — nothing opens over the app.');
