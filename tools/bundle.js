#!/usr/bin/env node
/* @family. — tools/bundle.js ONE FILE PER BATCH, SO A RETURN VISIT RE-ASKS 3 URLS, NOT ~56 (owner, 12 Nov, history 1211). */
/* Concatenates js/ in index.html's FILES order into bundle/first.js (EAGER), bundle/later.js (LATER less LAZY) and bundle/lazy.js (LAZY); OFF never. And style.css -> style.min.css. */
/* The js/ files stay the source; edit those. tools/build.js runs this after the generators. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'bundle');

function list_(html, name) {
  const m = new RegExp('window\\.' + name + '\\s*=\\s*\\[([\\s\\S]*?)\\]').exec(html);
  if (!m) throw new Error('index.html has no window.' + name + ' list');
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}

/* THE SAME THREE LISTS index.html AND data.js's batchFiles_ WORK OUT, each in FILES' order (that list is the load order). */
function batches() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const FILES = list_(html, 'FILES'), LATER = list_(html, 'LATER'), LAZY = list_(html, 'LAZY'), OFF = list_(html, 'OFF');
  const on = f => OFF.indexOf(f) === -1;
  return {
    first: FILES.filter(f => LATER.indexOf(f) === -1 && on(f)),
    later: FILES.filter(f => LATER.indexOf(f) !== -1 && LAZY.indexOf(f) === -1 && on(f)),
    lazy: FILES.filter(f => LAZY.indexOf(f) !== -1 && on(f)),
  };
}

/* THE PHONE IS SENT THE CODE, NOT ITS NOTES (17 Nov): js/ is more comment than code, so each file goes out with its comments and indents dropped. */
/* acorn's tokens are kept byte for byte (strings, templates, regexes untouched); only the gaps between them change, a newline kept as a newline so ASI reads as before. */
function lean(src) {
  const acorn = require('acorn'), out = [];
  let at = 0;
  const gap = g => /\n/.test(g) ? '\n' : (g ? ' ' : '');
  for (const t of acorn.tokenizer(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true, allowReturnOutsideFunction: true })) {
    out.push(gap(src.slice(at, t.start)), src.slice(t.start, t.end));
    at = t.end;
  }
  return out.join('').replace(/^\n+/, '');
}

/* ONE GLOBAL SCOPE, as the separate tags were. The newline before `;` survives a file ending in a line that needs one. */
function text(files) {
  return files.map(f => '/* js/' + f + '.js */\n' + lean(fs.readFileSync(path.join(ROOT, 'js', f + '.js'), 'utf8')) + '\n;\n').join('');
}

/* THE SAME FOR style.css -> style.min.css (index.html loads it; ?dev loads style.css): comments and runs of space dropped outside quotes, nothing else. */
/* Beside index.html, not in bundle/, so its url('fonts/…') still points where it did. */
function leanCss(src) {
  let out = '', i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; out += ' '; continue; }
    if (c === '"' || c === "'") { let j = i + 1; while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1; out += src.slice(i, j + 1); i = j + 1; continue; }
    if (/\s/.test(c)) { while (i < src.length && /\s/.test(src[i])) i++; out += ' '; continue; }
    out += c; i++;
  }
  return out.replace(/ ?([{};]) ?/g, '$1').replace(/;}/g, '}').trim() + '\n';
}

function run() {
  const b = batches(), wrote = [];
  fs.mkdirSync(OUT, { recursive: true });
  for (const k of Object.keys(b)) {
    const file = path.join(OUT, k + '.js'), want = text(b[k]);
    let have = null;
    try { have = fs.readFileSync(file, 'utf8'); } catch (e) { /* not written yet */ }
    if (have !== want) { fs.writeFileSync(file, want); wrote.push('bundle/' + k + '.js'); }
  }
  const css = path.join(ROOT, 'style.min.css'), want = leanCss(fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8'));
  let have = null;
  try { have = fs.readFileSync(css, 'utf8'); } catch (e) { /* not written yet */ }
  if (have !== want) { fs.writeFileSync(css, want); wrote.push('style.min.css'); }
  console.log('bundle: ' + (wrote.join(', ') || 'unchanged') + ' (' + Object.keys(b).map(k => k + ' ' + b[k].length).join(', ') + ' files)');
  return { b, wrote };
}

module.exports = { run, batches };
if (require.main === module) run();
