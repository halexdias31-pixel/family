#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-style-sources.js FEWER PLACES A STYLE CAN LIVE. A colour is a token on :root, so a
   colour bug is fixed once; !important and inline colours in js/ are where styles hide from the cascade. */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..');
const basePath = path.join(dir, 'check', 'style-sources-baseline.json');
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');

/* NAMED COLOURS worth catching; transparent/currentColor/inherit are not a palette. */
const NAMED = 'white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|gold|navy|teal|maroon|olive|lime|aqua|fuchsia|crimson|tomato|orchid|salmon|khaki|beige|ivory|wheat|tan|brown|cyan|magenta|indigo|violet';
const LIT = new RegExp('#[0-9a-fA-F]{3,8}\\b|\\b(?:rgba?|hsla?)\\(|(?<![-\\w$.\'"])(?:' + NAMED + ')(?![-\\w])', 'g');
const COLOURY = /^(?:color|background(?:-color)?|border(?:-[a-z]+)*-color|border(?:-[a-z]+)?|outline(?:-color)?|fill|stroke|box-shadow|text-shadow|caret-color|accent-color|text-decoration(?:-color)?|column-rule(?:-color)?|filter|background-image|mask(?:-image)?|-webkit-text-stroke|-webkit-tap-highlight-color|stop-color)$/;

/* ---------- STYLE.CSS: walk rules, keep the selector stack, read every declaration ---------- */
function cssFindings_() {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const colours = [], important = [];
  const stack = [];
  let buf = '', line = 1, bufLine = 1;
  const decl = (text, at) => {
    const m = text.match(/^\s*(-{0,2}[a-zA-Z][\w-]*)\s*:([\s\S]*)$/);
    if (!m) return;
    const prop = m[1], val = m[2];
    const where = 'style.css:' + at;
    if (/!\s*important/.test(val)) important.push(where + '  ' + (stack[stack.length - 1] || '') + ' { ' + prop + ' }');
    const inRoot = stack.some(s => /^:root\b/.test(s));
    if (prop.startsWith('--') && inRoot) return;     // a token definition: where colours live
    if (!prop.startsWith('--') && !COLOURY.test(prop)) return;
    const hits = (val.replace(/url\([^)]*\)/g, '').match(LIT) || []);
    for (const h of hits) colours.push(where + '  ' + prop + ': ' + h.replace(/\($/, ''));
  };
  for (const ch of bare) {
    if (ch === '{') { stack.push(buf.trim().replace(/\s+/g, ' ')); buf = ''; bufLine = line; }
    else if (ch === '}') { decl(buf, bufLine); buf = ''; stack.pop(); bufLine = line; }
    else if (ch === ';') { decl(buf, bufLine); buf = ''; bufLine = line; }
    else { if (!buf.trim() && ch !== '\n') bufLine = line; buf += ch; }
    if (ch === '\n') line++;
  }
  return { colours, important };
}

/* ---------- JS: every colour literal in a served script. A style string should say var(--token); what is
   left is art drawn as data (avatars, the pH chart) or a canvas, and each file's count may only go down. */
function jsFindings_() {
  const out = [];
  for (const f of fs.readdirSync(path.join(dir, 'js')).sort()) {
    if (!f.endsWith('.js') || f.startsWith('check')) continue;
    fs.readFileSync(path.join(dir, 'js', f), 'utf8').split('\n').forEach((ln, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(ln)) return;
      const hits = ln.replace(/&#\w+;?|\|#\d+\b/g, '').match(/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b|\b(?:rgba?|hsla?)\(/g) || [];
      hits.forEach(h => out.push({ file: f, at: 'js/' + f + ':' + (i + 1) + '  ' + h }));
    });
  }
  return out;
}

const { colours, important } = cssFindings_();
const inline = jsFindings_();
const perFile = {};
inline.forEach(h => { perFile[h.file] = (perFile[h.file] || 0) + 1; });
const now = { cssColours: colours.length, important: important.length };
let base = {};
try { base = JSON.parse(fs.readFileSync(basePath, 'utf8')); } catch (e) { base = {}; }
const allow = base.allow || {};

if (process.argv.includes('--list')) {
  console.log([...colours, ...important.map(x => '!important ' + x), ...inline.map(h => h.at)].join('\n'));
}
const bad = [];
for (const k of Object.keys(now)) {
  const max = allow[k] == null ? 0 : allow[k];
  if (now[k] > max) bad.push(k + ': ' + now[k] + ' > allowed ' + max);
}
/* EACH !important IS NAMED: print isolation, the hide utilities, press-is-frame-one, the padlock, paused animations, zoom over an inline zoom. */
const named = new Set(base.important || []);
important.forEach(x => { const k = x.replace(/^style\.css:\d+\s+/, ''); if (!named.has(k)) bad.push('!important not on the allow-list: ' + x); });
const allowJs = base.jsColours || {};
for (const f of Object.keys(perFile)) {
  const max = allowJs[f] || 0;
  if (perFile[f] > max) bad.push('js/' + f + ': ' + perFile[f] + ' colour literals > allowed ' + max + ' (use var(--token))');
}
if (process.argv.includes('--write')) {
  fs.writeFileSync(basePath, JSON.stringify({ why: 'counts may only go down; lower them when you fix one', allow: now, jsColours: perFile,
    important: important.map(s => s.replace(/^style\.css:\d+\s+/, '')) }, null, 2) + '\n');
}
if (bad.length && !process.argv.includes('--write')) {
  console.log('✗ style sources grew (colour literals outside :root tokens, !important, inline colours in js/):');
  bad.forEach(b => console.log('  ' + b));
  const show = [...colours, ...important.map(x => '!important ' + x), ...inline.map(h => h.at)];
  show.slice(0, 30).forEach(x => console.log('    ' + x));
  process.exit(1);
}
const lower = Object.keys(now).filter(k => (allow[k] || 0) > now[k])
  .concat(Object.keys(allowJs).filter(f => allowJs[f] > (perFile[f] || 0)).map(f => 'js/' + f));
console.log('✓ style sources: ' + now.cssColours + ' css colour literals, ' + now.important + ' !important, ' + inline.length + ' js colour literals'
  + (lower.length ? '  (lower the baseline: ' + lower.join(', ') + ')' : ''));
