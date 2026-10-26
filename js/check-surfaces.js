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

/* ---------- NO POP-UP MENUS (420): "I DONT LIKE POP UP MENUS" ----------
   Read with comments gone but strings kept, because a pop-up is markup in a string. */
const POPUPS = [
  { re: /tile-more|tile-sheet/g,                      name: 'a "More"/"Admin" overflow tile and its sheet', use: 'every tile in the row (`tileRow_` balances the lines)' },
  { re: /sheet-back/g,                                name: 'a backdrop behind the sheet',  use: 'nothing — the sheet is a page in the flow' },
  { re: /setSheetOrigin_|SHEET_FROM/g,                name: 'a sheet that grows out of a card', use: 'openSheet(), which is a page' },
  { re: /\.showModal\s*\(|<dialog\b|\bpopover\s*=|['"]popover['"]|\.showPopover\s*\(/g, name: 'a dialog or a popover', use: 'an inline section, a page, or sure_() on the tile' },
  /* 453: the sheet as a page that pushed the grid aside was still a pop-up to the owner; it opens IN the card now. */
  { re: /sheet-open|\.inert\s*=\s*true|aria-haspopup|aria-modal|role=["']dialog/g, name: 'a page or dialog that takes the screen over', use: 'openSheet() (moved into the card pressed), or sheetHere_(el, swap) first' },
  { re: /\bcontextmenu\b[^\n]*\bpreventDefault\b[^\n]*\bshow|\bcustom-?menu\b|\baction-?sheet\b|\bdropdown-?menu\b/gi, name: 'a menu of our own', use: 'tiles in the row, or a native <select>' },
];
/* THE ONE TOP LAYER THAT IS NOT A MENU: the video player's own full screen, the picture over the glass (`vidFullOn_`). */
const POPUP_OK = [{ file: 'js/games.js', near: /vidFull/, why: 'the video full screen is the picture, not a menu' }];

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
            .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, (m, a) => a + ' '.repeat(m.length - a.length));
}

/* AND IN THE STYLESHEET: only these may be position: fixed, and none of them is a menu. */
const FIXED_OK = ['#banner', '#toast', '#reconnect', '#boot-slow', '#kp', '.kp-loupe', '.pad-sizes', '.pad-loupe', '.biz-dot',
  '.vid-watch.on.is-fs',
  /* EDIT LAYOUT (462): a whole-screen mode with its own Done bar, not a menu; the ghost is the widget under the finger. */
  '.layout-board', '.lay-ghost'];

const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.js') && !f.startsWith('check'))
  .map(f => path.join(DIR, f))
  .concat([path.join(ROOT, 'index.html')].filter(fs.existsSync));

const bad = [], blanks = [], popups = [];

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

  const code = stripComments(raw);
  POPUPS.forEach(({ re, name, use }) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code))) {
      const line = code.slice(0, m.index).split('\n').length;
      const around = code.split('\n').slice(Math.max(0, line - 15), line + 2).join('\n');
      if (POPUP_OK.some(o => short.replace(/\\/g, '/') === o.file && o.near.test(around))) continue;
      popups.push({ short, line, name, use });
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

const css = stripComments(fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8'));
let rules = 0;
css.replace(/([^{}]+)\{([^{}]*)\}/g, (all, sel, body) => {
  rules++;
  const selector = sel.trim().replace(/\s+/g, ' ');
  if (/\.tile-sheet|#sheet-back/.test(selector)) {
    popups.push({ short: 'style.css', line: css.slice(0, css.indexOf(all)).split('\n').length, name: selector, use: 'nothing — removed in 420' });
  }
  if (!/position\s*:\s*fixed/.test(body)) return all;
  const ok = selector.split(',').every(one => FIXED_OK.some(k => one.trim() === k || one.trim().startsWith(k + ' ') || one.trim().startsWith(k + ':') || one.trim().startsWith(k + '.')));
  if (!ok) popups.push({ short: 'style.css', line: css.slice(0, css.indexOf(all)).split('\n').length,
    name: selector + ' { position: fixed }', use: 'something in the flow of the page — or FIXED_OK, with the reason it is not a menu' });
  if (/(^|,)\s*#sheet\b/.test(selector) && /\b(height|min-height)\s*:[^;]*(dvh|vh)/.test(body)) popups.push({ short: 'style.css', line: css.slice(0, css.indexOf(all)).split('\n').length, name: selector + ' is screen-tall', use: 'the sheet sits in its card, as tall as its content (453)' });
  if (/(^|,)\s*#sheet\b/.test(selector)) popups.push({ short: 'style.css', line: 0, name: '#sheet floats', use: 'position: static' });
  return all;
});

/* 453: `openSheet` must place the sheet inside the card that was pressed, never over or instead of the grid. */
{
  const sh = stripComments(fs.readFileSync(path.join(DIR, 'shell.js'), 'utf8'));
  const body = (sh.match(/function openSheet\([^)]*\)\s*\{([\s\S]*?)\n\}/) || [])[1];
  if (!body) { console.log('FAILED — openSheet could not be found in js/shell.js, so where it opens was not checked.'); process.exit(1); }
  if (!/sheetPlace_\(\)/.test(body)) popups.push({ short: 'js/shell.js', line: 0, name: 'openSheet does not move the sheet into the card pressed', use: 'sheetPlace_() (453)' });
  const posts = stripComments(fs.readFileSync(path.join(DIR, 'posts.js'), 'utf8'));
  [['who-reacted', /sheetHere_\(el\)/], ['post-edit', /sheetHere_\(el,\s*true\)/]].forEach(([act, re]) => {
    const h = (posts.match(new RegExp("on\\('" + act + "'[\\s\\S]*?\\n\\}\\);")) || [''])[0];
    if (!re.test(h)) popups.push({ short: 'js/posts.js', line: 0, name: act + ' does not open in its post card', use: re.source + ' before openSheet (453)' });
  });
}

say('A POP-UP MENU, DIALOG, POPOVER OR FLOATING BOX (420)', popups,
    r => `${r.short}:${r.line}  ${r.name}  ->  use ${r.use}`);

console.log('\nfiles read: ' + files.length + ', style rules read: ' + rules);
if (!rules) { console.log('FAILED — the stylesheet could not be read, so nothing about it was checked.'); process.exit(1); }
if (bad.length || blanks.length || popups.length) {
  console.log('FAILED — nothing in this app opens over the app. See Engine > surfaces.');
  process.exit(1);
}
console.log('OK — nothing opens over the app.');
