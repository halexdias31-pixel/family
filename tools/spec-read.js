#!/usr/bin/env node
/* @family. — tools/spec-read.js THE SPEC READER (26 Nov, step 1 of "a country's spec document goes in, the tree comes out MECHANICALLY": no AI,
   deterministic code). A source is a government document stored as its text (data/settings/curriculum/<country>/sources/<subject>-<doc>.tsv,
   one row per run of type: page, top, left, size, bold, text — pdftohtml's own reading of the PDF, made once by `--fetch`; the manifest there
   keeps each PDF's address, sha256 and date). A LAYOUT (sources/layouts.json) is data, not code: which lines are headings at which depth (by
   size, bold, indent, words), where the content begins and ends, what opens and closes a run of statements, what a statement looks like
   (a bullet or a number), and the level markers (a year heading, bold = Higher, the document's own level). read() turns a source into
   { headings, statements } with every heading's ref exactly as printed, every statement under its heading, each with its levels; tree() turns
   a subject's readings into a topic tree by formula (tools/spec-tree.js). Run by tools/build.js before one-curriculum: it writes the country's
   headings.json, the generated tree, docs/curriculum-diff-<country>.md and docs/curriculum-gaps.md (tools/spec-tree.js), and checks
   determinism (same source, same bytes), that every statement is matched to a generator or listed, and `--prove` breaks each. */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');
const { ROOT, main } = require('./lib/gen.js');

const DIR = 'data/settings/curriculum';
const SRC = 'sources';

/* ---- EXTRACTION (only with --fetch: needs the network and pdftohtml; the build reads the stored text) ---- */
const ent = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
function extract(pdf) {
  const xml = cp.execFileSync('pdftohtml', ['-xml', '-i', '-stdout', '-q', '-nodrm', pdf], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const sizes = {}, out = [];
  let page = 0;
  xml.split('\n').forEach(line => {
    let m;
    if ((m = /<page number="(\d+)"/.exec(line))) page = +m[1];
    else if ((m = /<fontspec id="(\d+)" size="(-?\d+)"/.exec(line))) sizes[m[1]] = +m[2];
    else if ((m = /<text top="(-?\d+)" left="(-?\d+)" width="\d+" height="\d+" font="(\d+)">(.*)<\/text>/.exec(line))) {
      const t = ent(m[4]).replace(/[\t\r\n]/g, ' ');
      if (!t.trim()) return;
      out.push([page, +m[1], +m[2], sizes[m[3]], /<b>/.test(m[4]) ? 1 : 0, t].join('\t'));
    }
  });
  return out.join('\n') + '\n';
}
const sha = b => crypto.createHash('sha256').update(b).digest('hex');

/* ---- THE COUNTRY'S SOURCES ---- */
function manifest(country) { return JSON.parse(fs.readFileSync(path.join(ROOT, DIR, country, SRC, 'manifest.json'), 'utf8')); }
function layouts(country) { return JSON.parse(fs.readFileSync(path.join(ROOT, DIR, country, SRC, 'layouts.json'), 'utf8')); }
function countries() {
  const abs = path.join(ROOT, DIR);
  return fs.readdirSync(abs).sort().filter(c => fs.existsSync(path.join(abs, c, SRC, 'manifest.json')));
}
const sourceText = (country, file) => fs.readFileSync(path.join(ROOT, DIR, country, SRC, file), 'utf8');

/* ---- THE READER ---- */
const norm = s => String(s).replace(/\s+/g, ' ').trim();
/* Rows -> lines: runs on one page within `tol` of each other's top are one line (their spans kept, in order). */
function lines(text, L) {
  const minSize = L.minSize || 0, tol = L.lineTol == null ? 3 : L.lineTol, out = [];
  text.split('\n').forEach(row => {
    if (!row) return;
    const f = row.split('\t'), r = { p: +f[0], top: +f[1], left: +f[2], size: +f[3], b: f[4] === '1', t: f.slice(5).join('\t') };
    if (r.size < minSize) return;
    const l = out[out.length - 1];
    if (l && l.p === r.p && Math.abs(l.top - r.top) <= tol) { l.spans.push(r); return; }
    out.push({ p: r.p, top: r.top, left: r.left, size: r.size, spans: [r] });
  });
  out.forEach(l => {
    l.text = norm(l.spans.map(s => s.t).join(''));
    const solid = l.spans.filter(s => s.t.trim());
    l.bold = solid.length > 0 && solid.every(s => s.b);
    l.someBold = solid.some(s => s.b && /[A-Za-z]/.test(s.t));
    const words = solid.filter(s => /[A-Za-z]/.test(s.t));
    l.wordsBold = words.length > 0 && words.every(s => s.b);
    l.size = Math.max(...solid.map(s => s.size));
  });
  return out.filter(l => l.text);
}
/* Does a line meet a rule's `if`: size (a number or [min, max]), bold, left [min, max], text (a pattern). */
function meets(l, c) {
  const inR = (v, x) => Array.isArray(x) ? v >= x[0] && v <= x[1] : v === x;
  if (c.size != null && !inR(l.size, c.size)) return false;
  if (c.bold != null && l.bold !== c.bold) return false;
  if (c.left != null && !inR(l.left, c.left)) return false;
  if (c.text != null && !new RegExp(c.text).test(l.text)) return false;
  if (c.notText != null && new RegExp(c.notText).test(l.text)) return false;
  return true;
}
const ruleOf = (l, L) => (L.lines || []).find(r => meets(l, r.if || {})) || null;
const fmt = (f, m) => f.replace(/\$(\d)/g, (x, i) => m[+i] || '');

/* read(text, layout) -> { headings: [{ ref, text, depth, kind, parent, levels }], statements: [{ ref, code, text, levels }] }.
   A heading's ref is its ancestors' prefixes then its own text, joined by the layout's `join` (" – "); a year heading's prefix is its
   `prefix` format ("Y$1 "); kind is `skill` (under a `skills` heading), `cite` (statements directly under it) or `group`. */
function read(text, L, levelOrder) {
  const ls = lines(text, L), H = [], ST = [], join = L.join == null ? ' – ' : L.join;
  const begin = L.begin ? new RegExp(L.begin) : null, end = L.end ? new RegExp(L.end) : null, bullet = new RegExp(L.statement.start);
  let on = !begin, stack = [], open = !L.opens, cur = null, last = null, ctx = { levels: L.levels.all || null };
  const close = () => { cur = null; };
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    if (!on) { if (begin.test(l.text) && (L.beginBold == null || l.bold === L.beginBold)) on = true; else continue; }
    if (end && end.test(l.text) && l.bold === (L.endBold == null ? l.bold : L.endBold)) break;
    const r = ruleOf(l, L);
    if (r && r.role === 'skip') continue;
    if (r && r.role === 'open') { open = true; close(); continue; }
    if (r && (r.role === 'close' || r.role === 'aside')) { open = r.role === 'aside' ? open : false; close(); if (r.role === 'aside') stack = stack.filter(h => h.depth < r.depth).concat([{ depth: r.depth, aside: true }]); continue; }
    if (r && (r.role === 'heading' || r.role === 'skills' || r.role === 'context')) {
      /* A heading printed over two lines: the next line by the same rule, just below, is its tail. */
      if (last && last.rule === r && last.line.p === l.p && l.top - last.line.top <= (L.wrapGap || 30) && last.h && !last.h.stmts) {
        last.h.text = norm(/[A-Za-z]-$/.test(last.h.text) ? last.h.text + l.text : last.h.text + ' ' + l.text); last.h.ref = norm(last.h.pre + last.h.text); if (r.prefix) last.h.pfx = fmt(r.prefix, [last.h.text]); last.line = l; continue;
      }
      stack = stack.filter(h => h.depth < r.depth);
      const up = stack.filter(h => !h.aside), listed = up.filter(h => h.list), m = new RegExp((r.if && r.if.text) || '^.*$').exec(l.text) || [l.text];
      const pre = up.map(h => h.pfx).join('');
      const h = { depth: r.depth, text: l.text, pre, ref: norm(pre + l.text), pfx: r.prefix ? fmt(r.prefix, [l.text].concat(m.slice(1))) : '',
        skill: r.role === 'skills' || up.some(x => x.skill), group: r.kind === 'group', list: r.role !== 'context' && r.list !== false,
        parent: listed.length ? listed[listed.length - 1].ref : '', stmts: 0 };
      if (r.role === 'context' && L.levels.year) ctx.levels = m[1] && L.levels.year[m[1]] ? [L.levels.year[m[1]]] : null;
      stack.push(h); if (h.list) H.push(h);
      last = { rule: r, line: l, h }; close(); open = !L.opens; continue;
    }
    last = null;
    const top = stack.filter(h => !h.aside && h.list), head = top.length ? top[top.length - 1] : null;
    if (!head || head.skill || head.group || stack.length && stack[stack.length - 1].aside || !open) continue;
    const bm = bullet.exec(l.text);
    if (bm) {
      const lv = (L.levels.bold && l.wordsBold) ? L.levels.bold : ctx.levels;
      cur = { ref: head.ref, num: bm[1] || '', text: norm(l.text.slice(bm[0].length)), left: l.left, levels: lv, allBold: l.wordsBold, anyBold: l.someBold };
      cur.h = head; head.stmts++; ST.push(cur); continue;
    }
    if (cur && l.left > cur.left + 3) {
      cur.text = norm(cur.text + ' ' + l.text);
      if (L.levels.bold) { cur.anyBold = cur.anyBold || l.someBold; cur.allBold = cur.allBold && (l.wordsBold || !/[A-Za-z]/.test(l.text)); cur.levels = cur.allBold ? L.levels.bold : ctx.levels; }
    }
  }
  /* Statement codes: the layout's strand letter of the statement's top heading, then its number (GCSE maths N1). */
  ST.forEach(s => {
    if (L.statement.code && s.num) { const strand = s.ref.split(join)[0]; const c = (L.statement.code[strand] || ''); s.code = c ? c + s.num : ''; }
    s.levels = order(s.levels || [], levelOrder);
  });
  H.forEach(h => {
    h.kind = h.skill ? 'skill' : (h.stmts && !h.group ? 'cite' : 'group');
    h.levels = order([].concat(...ST.filter(s => s.ref === h.ref).map(s => s.levels)), levelOrder);
  });
  const heads = H.map(h => ({ ref: h.ref, text: h.text, depth: h.depth, kind: h.kind, parent: h.parent || '', levels: h.levels }));
  const stmts = ST.map(s => { const o = { ref: s.ref, text: s.text, levels: s.levels }; if (s.code) o.code = s.code; if (L.levels.bold && s.anyBold && !s.allBold) o.part = L.levels.bold[0]; return o; });
  return { headings: heads, statements: stmts };
}
const order = (a, lv) => { const u = [...new Set(a)]; return lv ? lv.filter(x => u.includes(x)).concat(u.filter(x => !lv.includes(x)).sort()) : u.sort(); };

/* EVERY SOURCE OF A COUNTRY, read: { <subject>: { <doc>: reading } }, in the manifest's order. */
function readAll(country, opt) {
  opt = opt || {};
  const M = opt.manifest || manifest(country), LY = opt.layouts || layouts(country), out = {};
  Object.keys(M.docs).forEach(k => {
    const d = M.docs[k], L = LY.layouts[d.layout];
    if (!L) throw new Error('spec-read: ' + k + ' names layout ' + d.layout + ', which layouts.json does not have');
    const text = opt.text && opt.text[k] != null ? opt.text[k] : sourceText(country, d.file);
    (out[d.subject] = out[d.subject] || {})[d.doc] = read(text, L, LY.levels && LY.levels[d.subject]);
  });
  return out;
}

/* THE HEADINGS FILE (<country>/headings.json), from the readings: per subject, per document, cite / groups / skills as printed. A year
   document's group is a section's heading itself, every year it appears (the layout's `groupText`). */
function headingsFile(country, R, about) {
  const LY = layouts(country), M = manifest(country), out = { about };
  Object.keys(R).forEach(sub => {
    out[sub] = {};
    Object.keys(R[sub]).forEach(doc => {
      const r = R[sub][doc], key = Object.keys(M.docs).find(k => M.docs[k].subject === sub && M.docs[k].doc === doc), L = LY.layouts[M.docs[key].layout];
      const cite = [], groups = [], skills = [], add = (a, x) => { if (!a.includes(x)) a.push(x); };
      r.headings.forEach(h => {
        if (h.kind === 'skill') add(skills, h.ref);
        else if (h.kind === 'cite') { add(cite, h.ref); if (L.groupText) add(groups, h.text); }
        else add(groups, h.ref);
      });
      out[sub][doc] = { cite, groups, skills };
    });
  });
  return out;
}

/* ---- FETCH: download each PDF of the manifest, store its text, record its sha256 (`node tools/spec-read.js --fetch <country>`). ---- */
function fetchAll(country, tmp) {
  const M = manifest(country);
  Object.keys(M.docs).forEach(k => {
    const d = M.docs[k], pdf = path.join(tmp, k + '.pdf');
    cp.execFileSync('curl', ['-sSL', '-o', pdf, d.pdf]);
    const buf = fs.readFileSync(pdf), text = extract(pdf);
    fs.writeFileSync(path.join(ROOT, DIR, country, SRC, d.file), text);
    Object.assign(d, { sha256: sha(buf), bytes: buf.length, text_sha256: sha(text), fetched: new Date().toISOString().slice(0, 10) });
    console.log('spec-read: ' + k + ' ' + buf.length + ' bytes -> ' + d.file);
  });
  fs.writeFileSync(path.join(ROOT, DIR, country, SRC, 'manifest.json'), JSON.stringify(M, null, 2) + '\n');
}

function run() { return require('./spec-tree.js').run(); }
module.exports = { run, read, readAll, lines, headingsFile, countries, manifest, layouts, sourceText, sha, extract, DIR, SRC };
main(module, () => {
  const a = process.argv.slice(2);
  if (a[0] === '--fetch') return fetchAll(a[1] || 'uk', a[2] || fs.mkdtempSync(path.join(require('os').tmpdir(), 'spec-')));
  if (a[0] === '--dump') { const R = readAll(a[1] || 'uk'); console.log(JSON.stringify(a[2] ? R[a[2]][a[3]] : R, null, 1)); return; }
  return run();
});
