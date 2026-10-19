#!/usr/bin/env node
// Comments a line or two: any comment over 240 characters becomes its headline + " §", and its full text is
// appended verbatim to docs/notes/<path>.md. `node tools/comments.js` applies; `--dry` only measures.
'use strict';
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ROOT = path.join(__dirname, '..');
const LIMIT = 240;        // a comment's whole source text, delimiters included
const HEAD = 160;         // the most a headline may run to
const MARK = ' §';
const MIN = 20;          // a first sentence shorter than this ("TRIPS.") takes the next one with it

// Comments that are read by something, so they stay word for word whatever their length.
// Banners are not here: they keep their "---------- " lead when shortened, which is what check-chess
// (cuts to '/* ---------- THERE IS NO OPPONENT') and check-loading (the WAITING block runs to the next
// '/* ----------') read, so a shortened banner still marks the same place.
const KEEP = [
  { re: /^\s*(global|globals|exported)\s/, why: 'a linter reads the names it declares' },
  { re: /^\s*(eslint|jshint|jslint|prettier-ignore|istanbul|c8|@ts-)/, why: 'a tool directive' },
  { re: /^!|@license|@preserve/, why: 'a licence a minifier keeps' },
  { re: /^[#@]\s*source(Mapping)?URL=/, why: 'the browser reads it' },
];
const kept = (body) => KEEP.some(k => k.re.test(body));

/* ---------- WHICH FILES ---------- */
function walk(dir, ext, deep, out) {
  let names = [];
  try { names = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }); } catch (e) { return out; }
  for (const d of names) {
    const rel = dir ? dir + '/' + d.name : d.name;
    if (d.isDirectory()) { if (deep && d.name !== 'node_modules') walk(rel, ext, deep, out); }
    else if (ext.some(x => d.name.endsWith(x))) out.push(rel);
  }
  return out;
}
function files() {
  const out = [];
  walk('js', ['.js'], false, out);
  walk('check', ['.js'], false, out);
  walk('tools', ['.js'], true, out);
  walk('backend', ['.gs'], false, out);
  for (const f of ['sw.js', 'sync.js', 'style.css', 'index.html']) if (fs.existsSync(path.join(ROOT, f))) out.push(f);
  return out.sort();
}

/* ---------- THE HEADLINE ---------- */
const ABBR = /(?:\be\.g|\bi\.e|\betc|\bvs|\bcf|\bMr|\bMrs|\bDr|\bNo|\bSt|\bapprox)\.$/i;
function headline(body, kind) {
  // kind: 'block' | 'line' | 'html'. Returns { lead, text } — lead is a banner's own opening, kept as written.
  let lead = '';
  let s = body;
  const firstLine = s.split(/\r?\n/)[0];
  const ban = /^(\s*-{6,}\s+)(.*?)(?:\s+-{3,}.*)?$/.exec(firstLine);
  if (ban && /[A-Za-z0-9]/.test(ban[2])) {
    lead = ban[1].replace(/^\s+/, '');
    return { lead, text: cap(ban[2].replace(/\s+/g, ' ').trim()) };
  }
  s = s.split(/\r?\n/)
    .map(l => l.replace(/^\s*\*+(?!\/)\s?/, ''))          // JSDoc's leading stars
    .filter(l => !/^\s*[-=*_~#]{3,}\s*$/.test(l))           // rule lines of = or -
    .join('\n')
    .replace(/^\s*[-=*_~]{3,}\s*/, '');                     // a rule run opening the first line
  // a paragraph is as far as a headline goes (a file's title block ends at its blank line)
  const para = s.trim().split(/\n[ \t]*\n/);
  if (para.length > 1 && para[0].replace(/\s+/g, ' ').trim().length >= 40) s = para[0];   // not a bare '@family. — x.js'
  s = s.replace(/\s+/g, ' ').trim();
  return { lead: '', text: firstSentence(s) };
}
function firstSentence(s) {
  let quotes = 0, ticks = 0, paren = 0;
  for (let i = 0; i < s.length && i < HEAD; i++) {
    const c = s[i];
    if (c === '"' || c === '\u201c' || c === '\u201d') quotes++;
    else if (c === '`') ticks++;
    else if (c === '(') paren++;
    else if (c === ')') paren = Math.max(0, paren - 1);
    if (!/[.!?:]/.test(c)) continue;
    const next = s[i + 1];
    if (next !== undefined && next !== ' ') {
      // a sentence that ends in a closing quote or italic: take the closer with it
      if (/["\u201d*)]/.test(next) && (s[i + 2] === undefined || s[i + 2] === ' ')) {
        const cand = s.slice(0, i + 2);
        if (cand.length >= MIN && balanced(cand)) return cand;
      }
      continue;
    }
    const cand = s.slice(0, i + 1);
    if (cand.length < MIN) continue;
    if (c === '.' && ABBR.test(cand)) continue;
    if (quotes % 2 || ticks % 2 || paren) continue;
    return cand;
  }
  return cap(s);
}
function balanced(t) {
  const n = (re) => (t.match(re) || []).length;
  return n(/["\u201c\u201d]/g) % 2 === 0 && n(/`/g) % 2 === 0 && n(/\(/g) <= n(/\)/g);
}
function cap(s) {
  if (s.length <= HEAD) return s;
  let cut = s.slice(0, HEAD);
  const sp = cut.lastIndexOf(' ');
  if (sp > 40) cut = cut.slice(0, sp);
  // never stop inside a quote or an aside that the cut opened: stop before its opener instead
  for (let guard = 0; guard < 4 && !balanced(cut); guard++) {
    const open = Math.max(lastOdd(cut, /["\u201c\u201d]/g), lastOdd(cut, /`/g), lastOpen(cut));
    if (open < 40) break;
    cut = cut.slice(0, open);
  }
  return cut.replace(/[\s,;:(*\u2014-]+$/, '');
}
function lastOdd(t, re) { const at = [...t.matchAll(re)].map(m => m.index); return at.length % 2 ? at[at.length - 1] : -1; }
function lastOpen(t) {
  let depth = 0;
  for (let i = t.length - 1; i >= 0; i--) { if (t[i] === ')') depth++; else if (t[i] === '(') { if (depth) depth--; else return i; } }
  return -1;
}
function safe(text, kind) {
  let t = text;
  if (kind === 'block') t = t.replace(/\*\//g, '* /');
  if (kind === 'html') t = t.replace(/--!?>/g, '- ->');
  return t.replace(/<\/(script)/gi, '< /$1');
}
function shortText(c) {
  // c: { kind, body, text }. The one-line replacement for the comment.
  const { lead, text } = headline(c.body, c.kind);
  const t = safe(text, c.kind);
  if (c.kind === 'line') return '// ' + lead + t + MARK;
  if (c.kind === 'html') return '<!-- ' + lead + t + MARK + ' -->';
  return '/* ' + lead + t + MARK + ' */';
}

/* ---------- WHAT A COMMENT SITS IN ---------- */
// JS: the innermost named function / declarator / property / method / assigned member around it,
// or else the named thing that follows it.
function jsNames(ast) {
  const named = [];
  const nameOf = (n) => {
    if (!n) return null;
    if (n.type === 'Identifier') return n.name;
    if (n.type === 'Literal') return String(n.value);
    if (n.type === 'MemberExpression') { const o = nameOf(n.object), p = nameOf(n.property); return o && p ? o + '.' + p : p; }
    if (n.type === 'ThisExpression') return 'this';
    return null;
  };
  (function visit(n) {
    if (!n || typeof n.type !== 'string') return;
    let name = null;
    switch (n.type) {
      case 'FunctionDeclaration': case 'ClassDeclaration': name = nameOf(n.id); break;
      case 'VariableDeclarator': name = nameOf(n.id); break;
      case 'Property': case 'MethodDefinition': case 'PropertyDefinition': name = nameOf(n.key); break;
      case 'AssignmentExpression': name = nameOf(n.left); break;
    }
    if (name) named.push({ name, start: n.start, end: n.end });
    for (const k in n) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v.type === 'string') visit(v);
    }
  })(ast);
  return named;
}
function jsWhere(named, pos) {
  let inner = null, next = null;
  for (const n of named) {
    if (n.start <= pos && pos < n.end && (!inner || n.end - n.start < inner.end - inner.start)) inner = n;
    if (n.start >= pos && (!next || n.start < next.start)) next = n;
  }
  if (inner) return 'in `' + inner.name + '`';
  return next ? 'top level, before `' + next.name + '`' : 'top level';
}
// CSS: the rule it sits in, or the selector that follows it.
function cssWhere(blank, pos) {
  const stack = [];
  let from = 0;
  for (let i = 0; i < pos; i++) {
    const c = blank[i];
    if (c === '{') { stack.push(blank.slice(from, i).trim().replace(/\s+/g, ' ')); from = i + 1; }
    else if (c === '}') { stack.pop(); from = i + 1; }
    else if (c === ';') from = i + 1;
  }
  const clip = (s) => s.length > 100 ? s.slice(0, 100) + ' …' : s;
  if (stack.length) return 'in `' + clip(stack[stack.length - 1]) + '`';
  const open = blank.indexOf('{', pos);
  if (open < 0) return 'end of file';
  const sel = blank.slice(pos, open).replace(/[\s\S]*[;}]/, '').trim().replace(/\s+/g, ' ');
  return sel ? 'before `' + clip(sel) + '`' : 'top level';
}

/* ---------- FINDING COMMENTS ---------- */
// Each comment: { start, end, kind, body, where } with start/end in the file's own offsets.
function parseJs(src) {
  const comments = [];
  let ast;
  for (const sourceType of ['script', 'module']) {
    try {
      comments.length = 0;
      ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType, allowHashBang: true, locations: false,
        onComment: (block, text, start, end) => comments.push({ start, end, kind: block ? 'block' : 'line', body: text }) });
      return { ast, comments, sourceType };
    } catch (e) { if (sourceType === 'module') throw e; }
  }
}
function tokens(src, sourceType) {
  // Every token's text, and whether a line break stands before it (ASI and `return` read that).
  const out = [];
  let prev = 0;
  for (const t of acorn.tokenizer(src, { ecmaVersion: 'latest', sourceType, allowHashBang: true })) {
    out.push((/[\n\r\u2028\u2029]/.test(src.slice(prev, t.start)) ? '\n' : '') + src.slice(t.start, t.end));
    prev = t.end;
  }
  return out;
}
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

function jsComments(src, base) {
  const { ast, comments, sourceType } = parseJs(src);
  const named = jsNames(ast);
  for (const c of comments) { c.start += base; c.end += base; c.where = jsWhere(named, c.start - base); }
  return { comments, sourceType };
}
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g;
function cssComments(src) {
  const out = [];
  const blank = src.replace(CSS_COMMENT, m => ' '.repeat(m.length));
  for (const m of src.matchAll(CSS_COMMENT)) {
    out.push({ start: m.index, end: m.index + m[0].length, kind: 'block', body: m[0].slice(2, -2), where: cssWhere(blank, m.index) });
  }
  return out;
}
const SCRIPT = /(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi;
function htmlParts(src) {
  const scripts = [];
  for (const m of src.matchAll(SCRIPT)) {
    const start = m.index + m[1].length;
    scripts.push({ start, end: start + m[2].length, open: m[1] });
  }
  return scripts;
}
function htmlComments(src) {
  const scripts = htmlParts(src);
  const out = [];
  const inScript = (i) => scripts.some(s => i >= s.start && i < s.end);
  for (const m of src.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (inScript(m.index)) continue;
    const tag = (src.slice(Math.max(0, m.index - 2000), m.index).match(/<\w[^<>]*>/g) || []).pop() || '';
    out.push({ start: m.index, end: m.index + m[0].length, kind: 'html', body: m[1], where: 'html' + (tag ? ', after `' + tag.slice(0, 80) + '`' : '') });
  }
  for (const s of scripts) {
    if (!/\S/.test(src.slice(s.start, s.end))) continue;
    const type = (/\btype\s*=\s*["']?([\w\/+-]+)/i.exec(s.open) || [])[1];
    if (type && !/^(text\/javascript|module|application\/javascript)$/i.test(type)) continue;
    const id = (/id\s*=\s*["']?([\w-]+)/.exec(s.open) || [])[1];
    const { comments } = jsComments(src.slice(s.start, s.end), s.start);
    for (const c of comments) { c.where = '<script' + (id ? ' id=' + id : '') + '>, ' + c.where; out.push(c); }
  }
  return out.sort((a, b) => a.start - b.start);
}
function commentsOf(rel, src) {
  if (rel.endsWith('.css')) return cssComments(src);
  if (rel.endsWith('.html')) return htmlComments(src);
  return jsComments(src, 0).comments;
}
const fullText = (src, c) => src.slice(c.start, c.end);
const tooLong = (src, c) => c.end - c.start > LIMIT && !kept(c.body);

/* ---------- REWRITING ---------- */
function rewrite(src, long) {
  let out = '', at = 0;
  for (const c of long) {
    let rep = shortText(c);
    const lineStart = src.lastIndexOf('\n', c.start - 1) + 1;
    let lineEnd = src.indexOf('\n', c.end); if (lineEnd < 0) lineEnd = src.length;
    const codeBefore = /\S/.test(src.slice(lineStart, c.start));
    const codeAfter = /\S/.test(src.slice(c.end, lineEnd));
    // A comment with a line break inside it IS a line break to ASI and to `return`. Squeezed between
    // code on both sides, the one-line copy keeps a break after it, at the next line's indent.
    if (c.kind !== 'line' && codeBefore && codeAfter && /[\n\r\u2028\u2029]/.test(fullText(src, c))) {
      const lastStart = src.lastIndexOf('\n', c.end - 1) + 1;
      rep += '\n' + (/^[ \t]*/.exec(src.slice(lastStart))[0]);
    }
    out += src.slice(at, c.start) + rep;
    at = c.end;
  }
  return out + src.slice(at);
}
const norm = (s) => s.replace(/\s+/g, ' ').trim();
function proof(rel, before, after) {
  // Null when the rewrite changed nothing but comments, else what differs.
  if (rel.endsWith('.css')) return norm(before.replace(CSS_COMMENT, ' ')) === norm(after.replace(CSS_COMMENT, ' ')) ? null : 'the CSS without comments differs';
  if (rel.endsWith('.html')) {
    const a = htmlParts(before), b = htmlParts(after);
    if (a.length !== b.length) return 'the number of <script> blocks differs';
    const outside = (src, parts) => { let s = '', at = 0; for (const p of parts) { s += src.slice(at, p.start) + ' <SCRIPT> '; at = p.end; } return norm((s + src.slice(at)).replace(/<!--[\s\S]*?-->/g, ' ')); };
    if (outside(before, a) !== outside(after, b)) return 'the markup without comments differs';
    for (let i = 0; i < a.length; i++) {
      const x = before.slice(a[i].start, a[i].end), y = after.slice(b[i].start, b[i].end);
      if (x === y) continue;
      let tx, ty;
      try { tx = tokens(x, 'script'); ty = tokens(y, 'script'); } catch (e) { return 'inline script ' + (i + 1) + ' no longer tokenizes: ' + e.message; }
      if (!same(tx, ty)) return 'inline script ' + (i + 1) + "'s tokens differ";
    }
    return null;
  }
  const st = parseJs(before).sourceType;
  let ta, tb;
  try { ta = tokens(before, st); tb = tokens(after, st); acorn.parse(after, { ecmaVersion: 'latest', sourceType: st, allowHashBang: true }); }
  catch (e) { return 'no longer parses: ' + e.message; }
  return same(ta, tb) ? null : 'its tokens differ';
}

/* ---------- THE ARCHIVE ---------- */
function fence(text) {
  const runs = text.match(/`+/g) || [];
  return '`'.repeat(Math.max(3, ...runs.map(r => r.length + 1)));
}
function notes(rel, src, long) {
  let s = '';
  for (const c of long) {
    const { lead, text } = headline(c.body, c.kind);
    const f = fence(fullText(src, c));
    s += '### ' + (lead + text).replace(/\s+/g, ' ') + '\n\n' + c.where + '\n\n' + f + '\n' + fullText(src, c) + '\n' + f + '\n\n';
  }
  return s;
}
function noteHeader(rel) {
  return '# ' + rel + '\n\nThe full text of comments in `' + rel + '` that `tools/comments.js` shortened to a headline ending in " §".\n'
    + 'Append-only, in the order they were shortened; each entry names what the comment sat in.\n\n';
}

/* ---------- RUN ---------- */
function plan(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const all = commentsOf(rel, src);
  const long = all.filter(c => tooLong(src, c));
  return { rel, src, all, long };
}

module.exports = { files, plan, commentsOf, kept, LIMIT, KEEP, shortText, headline };

if (require.main === module) {
  const dry = process.argv.includes('--dry');
  const show = process.argv.includes('--show');
  let before = 0, after = 0, bad = 0, changed = 0, cut = 0;
  const rows = [];
  for (const rel of files()) {
    let p;
    try { p = plan(rel); } catch (e) { console.error('FAIL ' + rel + ': cannot parse: ' + e.message); bad++; continue; }
    const size = Buffer.byteLength(p.src);
    before += size;
    if (!p.long.length) { after += size; continue; }
    const out = rewrite(p.src, p.long);
    const why = proof(rel, p.src, out);
    if (why) { console.error('FAIL ' + rel + ': ' + why + ' — not written'); bad++; after += size; continue; }
    // the rewrite must itself be finished: nothing over the limit left in it
    const left = commentsOf(rel, out).filter(c => tooLong(out, c));
    if (left.length) { console.error('FAIL ' + rel + ': ' + left.length + ' comment(s) still over ' + LIMIT + ' after rewriting — not written'); bad++; after += size; continue; }
    after += Buffer.byteLength(out);
    rows.push([rel, Buffer.byteLength(p.src), Buffer.byteLength(out), p.long.length]);
    changed++; cut += p.long.length;
    if (show) for (const c of p.long) console.log(rel + '  ' + shortText(c));
    if (dry) continue;
    fs.writeFileSync(path.join(ROOT, rel), out);
    const np = path.join(ROOT, 'docs/notes', rel + '.md');
    fs.mkdirSync(path.dirname(np), { recursive: true });
    const head = fs.existsSync(np) ? '' : noteHeader(rel);
    fs.appendFileSync(np, head + notes(rel, p.src, p.long));
  }
  if (dry && !show) for (const [rel, a, b, n] of rows) console.log(rel.padEnd(36) + String(a).padStart(9) + ' -> ' + String(b).padStart(9) + '  (' + n + ' cut)');
  console.log((bad ? 'FAILED — ' + bad + ' file(s) not written; ' : (dry ? 'DRY — ' : 'OK — ')) + cut + ' comment(s) in ' + changed + ' file(s) ' + (dry ? 'would be ' : '') + 'shortened; '
    + 'in-scope bytes ' + before + ' -> ' + after + (dry ? ' (nothing written)' : '') + '.');
  process.exit(bad ? 1 : 0);
}
