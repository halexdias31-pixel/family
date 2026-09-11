/* ==================================================================================================
   check-surfaces.js — NOTHING OPENS OVER THE APP

   THE RULE IS IN THE ENGINE SHEET, on the `surfaces` tab, and a rule that lives only in a sheet is a
   rule somebody breaks in six months without ever having read it. This is the half that says so at
   the moment it happens.

   WHAT IT REFUSES, and what to write instead:

     window.open      a new tab. It asks for pop-up permission, so the first press often does nothing
                      at all; the back gesture then leaves the app entirely, and whatever was
                      filtered or half filled in is gone.
                      → openSheet(). It is part of this page, so closing it puts you back exactly
                        where you were, and the browser's own print still takes it.

     confirm()        an OS dialog in the OS's typeface, with the OS's buttons, saying not one word
                      this app chose.
                      → sure_(el, 'Turn it down?'). The button becomes the question: first press
                        changes its words, second press does it, four seconds puts it back.

     prompt()         the same, and it was the only place a value was typed into something the app
                      did not draw.
                      → a sheet with a real field. It can also explain why the answer matters, which
                        a one-line grey box cannot.

     alert()          a dialog to say something already true.
                      → toast(). It reports and blocks nothing.

   COMMENTS AND STRINGS ARE STRIPPED FIRST, or this file could not describe what it forbids — every
   note above names `confirm()` and every one of them would be a failure. That is also why the
   stripping is real rather than a regex over raw text: `check-css` learned the same lesson.

   `target="_blank"` IS ALLOWED ONLY ON AN EXTERNAL ADDRESS. Somebody's bank is not this app and
   should not pretend to be. A `_blank` on anything else is a new tab wearing a link's clothes.

   Run:  node js/check-surfaces.js
================================================================================================== */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname);
const ROOT = path.join(__dirname, '..');

/* ---------- STRIP COMMENTS AND STRING BODIES -------------------------------------------------------
   A one-pass state machine rather than a regex, because a regex cannot tell `// not a comment` inside
   a string from a real one, and this file is full of both. Whitespace is kept so line numbers survive
   — a report that cannot say WHERE is a report nobody acts on. */
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
  /* `INSTALL_PROMPT.prompt()` IS THE BROWSER'S OWN INSTALL BANNER and not a dialogue this app wrote,
     which is why the pattern requires the call to be bare rather than on an object. */
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

  /* `_blank` IS CHECKED ON THE STRIPPED SOURCE, like everything else — this file describes what it
     forbids, so a scan of the raw text finds its own comments and reports them. That is not a
     detail: the first version of this check failed on its own explanation.

     A LINE PASSES IF IT, OR ONE OF THE THREE ABOVE IT, MENTIONS http. An address written out is the
     ordinary case; a `^https?://` test standing in front of a variable is the other one, and a
     checker that cannot read a guard forces the guard to be deleted. */
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
