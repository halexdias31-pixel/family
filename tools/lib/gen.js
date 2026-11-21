/* @family. — tools/lib/gen.js THE ONE SET OF TOOL HELPERS (unify batch 4): every generator and check takes these, never its own copy
   (tools/one-helper.js fails the build on a copy). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
/* A JSON file under ROOT, or null when it is missing or broken. */
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { return null; } };
/* A value as trimmed text; null and undefined are ''. */
const S = v => String(v == null ? '' : v).trim();
/* A MARKED BLOCK: the line holding `begin` is kept, everything after it up to `end` becomes `body`.
   Absent markers: `absent(src)` when given, else the block is appended after one blank line. */
function blockInto(src, begin, end, body, absent) {
  const i = src.indexOf(begin), j = i === -1 ? -1 : src.indexOf(end, i + begin.length);
  if (i !== -1 && j !== -1) {
    const nl = src.indexOf('\n', i + begin.length - 1), head = nl !== -1 && nl < j ? nl + 1 : i + begin.length;
    return src.slice(0, head) + body + src.slice(j);
  }
  return absent ? absent(src) : src.replace(/\n*$/, '\n\n') + begin + body + end;
}
/* Writes `text` only when it differs from what is there; true when it wrote. */
function writeIfChanged(file, text) {
  let was = null; try { was = fs.readFileSync(file, 'utf8'); } catch (e) { was = null; }
  if (was === text) return false;
  fs.writeFileSync(file, text);
  return true;
}
/* A file under ROOT as text, read once per process while unchanged (keyed by mtime and size, so a generator's write is seen).
   Missing: `fallback` when given, else it throws. */
const TEXT = new Map();
function text(f, fallback) {
  const p = path.join(ROOT, f);
  try {
    const st = fs.statSync(p), key = st.mtimeMs + ':' + st.size, hit = TEXT.get(p);
    if (hit && hit.key === key) return hit.src;
    const src = fs.readFileSync(p, 'utf8'); TEXT.set(p, { key, src }); return src;
  } catch (e) { if (arguments.length > 1) return fallback; throw e; }
}
/* THE SOURCE FILES: each file in `dirs` matching `ext`, as sorted 'dir/name' paths, listed once per process.
   opts.deep walks subfolders (never node_modules, nor a name in opts.skip). */
const LIST = new Map();
function srcFiles(dirs, ext, opts) {
  const o = opts || {}, skip = ['node_modules'].concat(o.skip || []), out = [];
  const walk = d => {
    let st; try { st = fs.statSync(path.join(ROOT, d)); } catch (e) { return; }
    const key = d + '|' + ext + '|' + !!o.deep + '|' + skip, hit = LIST.get(key);
    if (hit && hit.m === st.mtimeMs) { out.push(...hit.list); return; }
    const list = [];
    fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0).forEach(e => {
      const f = d + '/' + e.name;
      if (e.isDirectory()) { if (o.deep && skip.indexOf(e.name) === -1) { const n = out.length; walk(f); list.push(...out.splice(n)); } }
      else if (ext.test(e.name)) list.push(f);
    });
    if (!o.deep) LIST.set(key, { m: st.mtimeMs, list });
    out.push(...list);
  };
  [].concat(dirs).forEach(walk);
  return out.slice();
}
/* THE ONE STRIPPER (unify batch 8): the text a check should look at, with the parts it must not blanked to spaces (every
   newline kept, so line and column numbers hold). comments: true blanks block comments; 'js' also `//` line comments, read by a
   scanner that knows strings and templates. strings: blanks '…' and "…" (one line each). generated: blanks the generated blocks,
   the X:BEGIN … X:END blocks (SHARED among them) and the ---------- NAME (generated) ---------- … END NAME blocks. */
const COMMENT_RE = /\/\*[\s\S]*?\*\//g;
const STRING_RE = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g;
const SHARED_RE = /\/\* SHARED:BEGIN[\s\S]*?\/\* SHARED:END \*\//;
const BLOCK_RE = /\/\*\s*([A-Z-]+):BEGIN[\s\S]*?\/\*\s*\1:END\s*\*\//g;
const GENERATED_RE = /\/\* -{10} (.+?) \(generated\) -{10} \*\/[\s\S]*?\/\* -{10} END \1 -{10} \*\//g;
const blank = m => m.replace(/[^\n]/g, ' ');
function uncommentJs(t) {
  let o = '', i = 0, q = null;
  while (i < t.length) {
    const c = t[i];
    if (q) { o += c; if (c === '\\') { o += t[i + 1] || ''; i += 2; continue; } if (c === q || (c === '\n' && q !== '`')) q = null; i++; continue; }
    if (c === '/' && t[i + 1] === '*') { const e = t.indexOf('*/', i + 2), end = e < 0 ? t.length : e + 2; o += blank(t.slice(i, end)); i = end; continue; }
    if (c === '/' && t[i + 1] === '/') { const e = t.indexOf('\n', i); const end = e < 0 ? t.length : e; o += ' '.repeat(end - i); i = end; continue; }
    if (c === "'" || c === '"' || c === '`') q = c;
    o += c; i++;
  }
  return o;
}
function bare(src, opts) {
  const o = opts || {};
  let t = String(src);
  if (o.generated) t = t.replace(BLOCK_RE, blank).replace(GENERATED_RE, blank);
  if (o.comments === 'js') t = uncommentJs(t);
  if (o.comments === true && o.strings) t = t.replace(new RegExp(COMMENT_RE.source + '|' + STRING_RE.source, 'g'), blank);
  else if (o.comments === true) t = t.replace(COMMENT_RE, blank);
  else if (o.strings) t = t.replace(STRING_RE, blank);
  return t;
}
/* THE ONE REPORT: each problem on its own line, then a throw naming the check and the count (`hint` ends the message). */
function report(name, bad, hint, log) {
  if (!bad.length) return;
  bad.forEach(b => (log || console.log)('  ' + b));
  throw new Error(name + ': ' + bad.length + ' ' + (hint || 'problem(s)'));
}
/* THE ONE TAIL: run when the file is run itself; a failure prints its message and exits 1. A promise is awaited. */
function main(mod, run) {
  if (require.main !== mod) return;
  const fail = e => { console.error(e && e.message || e); process.exit(1); };
  try { const p = run(); if (p && typeof p.then === 'function') p.catch(fail); } catch (e) { fail(e); }
}
module.exports = { ROOT, read, S, blockInto, writeIfChanged, text, srcFiles, report, main, bare, SHARED_RE, BLOCK_RE, GENERATED_RE, COMMENT_RE, STRING_RE };
