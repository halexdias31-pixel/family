#!/usr/bin/env node
/* @family. — tools/structure.js THE STRUCTURE RATCHET (920): § */
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./health.js');
const ROOT = path.resolve(__dirname, '..');
const BUDGETS = 'data/settings/structure-budgets.json';
const TARGET = { fileLines: 800, fnLines: 80, variety: 1, oneOff: 0, questions: '1 page + 5 checkers' };
const MAKERS = new Set(['js/tiles.js', 'js/shell.js']);
const WAIT = /(?:Loading|Please wait|Working)(?:…|\.\.\.)|class="[^"]*\bspinner\b|setAttribute\('aria-busy', 'true'\)/;

/* THE FILES MEASURED: every loaded js file (checks excluded), every backend .gs, and style.css. */
function allFiles() {
  return H.git(['ls-files', 'js/*.js', 'backend/*.gs', 'style.css']).split('\n').filter(f => f && !/^js\/check/.test(f) && !/^js\/_/.test(f));
}
/* ONE FILE'S NUMBERS: the same function and one-off rules as health.js structure(), so the two never disagree. */
function measure(file, src) {
  if (src == null) src = H.read(file);
  const L = src.split('\n'), out = { lines: L.length, oneOff: 0, emptyCatch: 0, inlineStyle: 0, rawButton: 0, fns: {}, waits: [] };
  if (file.endsWith('.css')) return out;
  const { code: C, depthAt } = H.scan(src);
  let fn = null;
  L.forEach((raw, i) => {
    const code = C[i] || '', before = i ? depthAt[i - 1] : 0;
    if (H.ONE_OFF.test(code)) out.oneOff++;
    if (/catch\s*(?:\(\s*\w*\s*\))?\s*\{\s*\}/.test(code)) out.emptyCatch++;
    const m = before === 0 && /^(?:async\s+)?function\s+([\w$]+)|^(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>\s*\{|[\w$]+\s*=>\s*\{)/.exec(raw);
    if (m) fn = { name: m[1] || m[2], at: i };
    if ((depthAt[i] || 0) === 0 && fn) { const n = i - fn.at + 1; if (n > TARGET.fnLines) { let k = fn.name; while (out.fns[k]) k += '#'; out.fns[k] = n; } fn = null; }
  });
  if (file.startsWith('js/')) H.blank(src).split('\n').forEach((l, i) => {
    if (/style="[^"$]*[a-z-]+\s*:[^"$]*"/.test(l)) out.inlineStyle++;
    if (!MAKERS.has(file) && /<button\b/.test(l) && !/\b(?:key|opt|choice|chip|pad|form|dlg|dialog|sheet|close|field)\b|type="submit"/.test(l)) out.rawButton++;
    if (!MAKERS.has(file) && WAIT.test(l)) out.waits.push({ kind: 'own-wait', where: file + ':' + (i + 1) });
  });
  return out;
}
/* THE VARIETY FAMILIES, counted with the cheap wait scan in place of the 3 s UI walk. */
function varieties(M) {
  let Q = null; try { Q = JSON.parse(H.read('data/qengine-health.json')); } catch (e) { Q = null; }
  H.varietyWork(Q, Object.values(M).flatMap(m => m.waits));
  const V = H.variety() || {};
  return Object.fromEntries(Object.keys(V).map(k => [k, { count: V[k].count, ideal: V[k].ideal, label: V[k].label }]));
}
function measureAll() { const M = {}; allFiles().forEach(f => { M[f] = measure(f); }); return M; }
/* HOW FAR OVER THE TARGETS: four totals, each the distance still to go. */
function excess(files, fns, vars) {
  const fl = Object.values(files);
  return { fileLines: fl.reduce((a, f) => a + Math.max(0, f.lines - TARGET.fileLines), 0),
    fnLines: Object.values(fns).reduce((a, n) => a + Math.max(0, n - TARGET.fnLines), 0),
    variety: Object.values(vars).reduce((a, v) => a + Math.max(0, v.count - (v.ideal || 1)), 0),
    oneOff: fl.reduce((a, f) => a + (f.oneOff || 0), 0) };
}
function toBudget(M, V) {
  const files = {}, fns = {};
  Object.keys(M).sort().forEach(f => { const m = M[f]; files[f] = { lines: m.lines, oneOff: m.oneOff, emptyCatch: m.emptyCatch, inlineStyle: m.inlineStyle, rawButton: m.rawButton };
    Object.keys(m.fns).forEach(n => { fns[f + ' ' + n] = m.fns[n]; }); });
  return { files, functions: fns, variety: V };
}
const readBudgets = () => { try { return JSON.parse(H.read(BUDGETS)); } catch (e) { return null; } };
const writeBudgets = B => fs.writeFileSync(path.join(ROOT, BUDGETS), JSON.stringify(B, null, 1) + '\n');
function progress(B) {
  const now = excess(B.files, B.functions, B.variety), base = B.baseline, parts = {};
  Object.keys(base).forEach(k => { parts[k] = base[k] ? Math.max(0, Math.min(100, Math.round(1000 * (base[k] - now[k]) / base[k]) / 10)) : 100; });
  const pct = Math.round(10 * Object.values(parts).reduce((a, b) => a + b, 0) / Object.keys(parts).length) / 10;
  return { pct, now, parts, line: `structure: ${pct}% of the way from the ${B.baselineDate} baseline to the targets (file lines over 800: ${now.fileLines}/${base.fileLines}, function lines over 80: ${now.fnLines}/${base.fnLines}, extra variants: ${now.variety}/${base.variety}, one-offs: ${now.oneOff}/${base.oneOff})` };
}
/* COUPLING (920 isolation): per js file, the files that use its names plus the names of others it reads; only ever goes down. */
function coupling() { return Object.fromEntries(require('./isolation.js').isolation().map(x => [x.file, x.inbound + x.outbound])); }
/* --init: today's numbers become the budgets AND the baseline progress is measured from. Refuses to overwrite without --reset. */
function init() {
  if (readBudgets() && !process.argv.includes('--reset')) { console.log(BUDGETS + ' exists; --reset to rebase it (and lose the locked-in gains)'); process.exit(1); }
  const M = measureAll(), V = varieties(M), b = toBudget(M, V);
  const B = { why: 'structure ratchet (920): a change may not go over a budget; going under tightens it (node tools/health.js --changed). Never raise one by hand without a docs/history reason.',
    coupling: coupling(), targets: TARGET, baselineDate: new Date().toISOString().slice(0, 10), baseline: excess(b.files, b.functions, b.variety), ...b };
  writeBudgets(B);
  console.log(`wrote ${BUDGETS}: ${Object.keys(b.files).length} files, ${Object.keys(b.functions).length} functions over 80, ${Object.keys(V).length} variety families`);
}
/* --changed: the files this branch touches against their budgets. Returns the failures; tightens and rewrites on a gain. */
function ratchet(changedFiles) {
  const B = readBudgets(); if (!B) return { bad: ['structure\t' + BUDGETS + '\tmissing: node tools/structure.js --init'], gains: [] };
  const bad = [], gains = [], files = changedFiles.filter(f => /^(js\/(?!check|_)[^/]+\.js|backend\/[^/]+\.gs|style\.css)$/.test(f));
  const M = {};
  files.forEach(f => {
    if (!fs.existsSync(path.join(ROOT, f))) { if (B.files[f]) { delete B.files[f]; gains.push(f + ' removed'); } Object.keys(B.functions).filter(k => k.startsWith(f + ' ')).forEach(k => delete B.functions[k]); return; }
    const m = M[f] = measure(f), was = B.files[f];
    if (!was) { if (m.lines > TARGET.fileLines) bad.push(`big-file\t${f}\ta new file of ${m.lines} lines (target ${TARGET.fileLines})`);
      ['oneOff', 'emptyCatch', 'inlineStyle', 'rawButton'].forEach(k => m[k] && bad.push(`${k}\t${f}\t${m[k]} in a new file (allowed 0)`));
      B.files[f] = { lines: m.lines, oneOff: m.oneOff, emptyCatch: m.emptyCatch, inlineStyle: m.inlineStyle, rawButton: m.rawButton };
    } else ['lines', 'oneOff', 'emptyCatch', 'inlineStyle', 'rawButton'].forEach(k => {
      const lim = k === 'lines' ? Math.max(was[k], TARGET.fileLines) : was[k];
      if (m[k] > lim) bad.push(`${k}\t${f}\t${m[k]} over its budget of ${lim}`);
      else if (m[k] < was[k]) { gains.push(`${f} ${k} ${was[k]} → ${Math.max(m[k], 0)}`); was[k] = m[k]; }
    });
  });
  /* FUNCTIONS: a known one may shrink, never grow; a new long one fails unless it moved whole from another file (a split). */
  const old = {}; Object.keys(B.functions).forEach(k => { const n = k.slice(k.indexOf(' ') + 1); old[n] = Math.max(old[n] || 0, B.functions[k]); });
  Object.keys(M).forEach(f => {
    const seen = new Set();
    Object.keys(M[f].fns).forEach(n => { const k = f + ' ' + n, len = M[f].fns[n]; seen.add(k);
      const lim = B.functions[k] != null ? B.functions[k] : old[n];
      if (lim == null) bad.push(`long-fn\t${f}\t${n.replace(/#+$/, '')}(): a new function of ${len} lines (target ${TARGET.fnLines})`);
      else if (len > lim) bad.push(`long-fn\t${f}\t${n.replace(/#+$/, '')}(): ${len} lines, over its budget of ${lim}`);
      else if (B.functions[k] == null || len < B.functions[k]) { if (B.functions[k] != null) gains.push(`${n}() ${B.functions[k]} → ${len}`); B.functions[k] = len; } });
    Object.keys(B.functions).filter(k => k.startsWith(f + ' ') && !seen.has(k)).forEach(k => { gains.push(`${k.slice(f.length + 1)}() now ≤ ${TARGET.fnLines} or gone`); delete B.functions[k]; });
  });
  /* VARIETY: counted across the whole site, but only when a js file or style.css changed (it reads them all, cheaply). */
  if (files.length) {
    const all = {}; allFiles().forEach(f => { all[f] = M[f] || { waits: measure(f).waits }; });
    const V = varieties(all);
    Object.keys(V).forEach(k => { const was = B.variety[k];
      if (!was) { B.variety[k] = V[k]; return; }
      if (V[k].count > was.count) bad.push(`variety-${k}\t${V[k].label}\t${V[k].count} variants, over its budget of ${was.count} (node tools/health.js --list --kind variety-${k})`);
      else if (V[k].count < was.count) { gains.push(`${V[k].label} ${was.count} → ${V[k].count}`); B.variety[k] = V[k]; } });
  }
  if (files.some(f => f.startsWith('js/'))) {
    const C = coupling(); B.coupling = B.coupling || {};
    files.filter(f => C[f] != null).forEach(f => { const was = B.coupling[f];
      if (was == null) B.coupling[f] = C[f];
      else if (C[f] > was) bad.push(`coupling\t${f}\t${C[f]} outside links, over its budget of ${was} (node tools/isolation.js)`);
      else if (C[f] < was) { gains.push(`${f} coupling ${was} → ${C[f]}`); B.coupling[f] = C[f]; } });
  }
  if (!bad.length && gains.length) writeBudgets(B);
  return { bad, gains, B };
}

/* ---------- THE SPLIT PLAN (--plan): each giant cut into files of ≤ 800 lines, grouped by name prefix and call graph, load order kept. */
function prefixOf(name) {
  const s = name.replace(/^[_$]+|[_$#]+$/g, ''), m = /^[a-z]+|^[A-Z]+(?![a-z])|^[A-Z][a-z]+/.exec(s);
  return (m ? m[0] : s).toLowerCase() || 'misc';
}
function planFile(file) {
  const acorn = require('acorn'), { freeVars, eagerFree } = require('../js/_scope.js');
  const src = H.read(file);
  let ast; try { ast = acorn.parse(src, { ecmaVersion: 'latest', locations: true, allowHashBang: true, allowReturnOutsideFunction: true }); }
  catch (e) { return { file, error: 'does not parse: ' + e.message }; }
  const total = src.split('\n').length;
  /* ITEMS: each top-level statement with the comment lines above it; names it declares, names it calls, names it needs NOW. */
  const items = []; let prevEnd = 0;
  ast.body.forEach(n => { const names = n.type === 'FunctionDeclaration' ? [n.id.name] : n.type === 'VariableDeclaration' ? n.declarations.filter(d => d.id.type === 'Identifier').map(d => d.id.name) : n.type === 'ClassDeclaration' ? [n.id.name] : [];
    items.push({ node: n, names, from: prevEnd + 1, to: n.loc.end.line, fn: n.type === 'FunctionDeclaration' }); prevEnd = n.loc.end.line; });
  if (items.length) items[items.length - 1].to = total;
  const owner = {}; items.forEach((it, i) => it.names.forEach(n => { owner[n] = i; }));
  items.forEach(it => { it.lines = it.to - it.from + 1;
    it.uses = new Set([...freeVars([it.node]).free].filter(n => owner[n] != null && !it.names.includes(n))); });
  items.forEach(it => { it.eager = new Set();
    if (!it.fn) { eagerFree([it.node]).forEach(n => owner[n] != null && !it.names.includes(n) && it.eager.add(n));
      [...it.eager].filter(n => items[owner[n]].fn).forEach(n => items[owner[n]].uses.forEach(v => !items[owner[v]].fn && it.eager.add(v))); } });
  /* CLUSTERS: by name prefix; a nameless statement joins the item above it; a small cluster joins the one it calls most. */
  let last = 'top';
  items.forEach(it => { it.c = it.names.length ? prefixOf(it.names[0]) : last; last = it.c; });
  const size = c => items.filter(it => it.c === c).reduce((a, it) => a + it.lines, 0);
  const edges = (a, b) => items.filter(it => it.c === a).reduce((s, it) => s + [...it.uses].filter(n => items[owner[n]].c === b).length, 0)
    + items.filter(it => it.c === b).reduce((s, it) => s + [...it.uses].filter(n => items[owner[n]].c === a).length, 0);
  for (let pass = 0; pass < 3; pass++) {
    const cs = [...new Set(items.map(it => it.c))].sort((a, b) => size(a) - size(b));
    cs.forEach(c => { if (size(c) >= 60) return; let best = null, bw = 0;
      new Set(items.map(it => it.c)).forEach(d => { if (d === c || size(d) + size(c) > TARGET.fileLines) return; const w = edges(c, d); if (w > bw) { bw = w; best = d; } });
      if (best) items.forEach(it => { if (it.c === c) it.c = best; }); });
  }
  /* BINS: clusters in first-appearance order, each into the bin it talks to most that has room; an over-size cluster is cut in order. */
  const order = [...new Set(items.map(it => it.c))];
  const bins = [];
  order.forEach(c => {
    const mine = items.filter(it => it.c === c);
    const chunks = []; let cur = [], n = 0;
    mine.forEach(it => { if (n + it.lines > TARGET.fileLines && cur.length) { chunks.push(cur); cur = []; n = 0; } cur.push(it); n += it.lines; });
    if (cur.length) chunks.push(cur);
    chunks.forEach((ch, k) => { const lines = ch.reduce((a, it) => a + it.lines, 0), names = new Set(ch.flatMap(it => it.names));
      let best = null, bw = -1;
      bins.forEach(b => { if (b.lines + lines > TARGET.fileLines) return;
        const w = b.items.reduce((s, it) => s + [...it.uses].filter(x => names.has(x)).length, 0) + ch.reduce((s, it) => s + [...it.uses].filter(x => b.names.has(x)).length, 0);
        if (w > bw) { bw = w; best = b; } });
      if (!best || bw === 0 && lines > 150) { best = { items: [], names: new Set(), lines: 0, clusters: {} }; bins.push(best); }
      ch.forEach(it => { best.items.push(it); it.names.forEach(x => best.names.add(x)); best.lines += it.lines; best.clusters[c] = (best.clusters[c] || 0) + it.lines; it.bin = best; });
    });
  });
  /* LOAD ORDER: bins load in the order their first line had; a statement run at load that needs a later bin moves to it. */
  bins.sort((a, b) => Math.min(...a.items.map(i => i.from)) - Math.min(...b.items.map(i => i.from)));
  bins.forEach((b, i) => { b.idx = i; });
  let moved = 0;
  for (let changed = true, guard = 0; changed && guard < 50; guard++) { changed = false;
    items.forEach(it => { if (it.fn) return; const need = Math.max(-1, ...[...it.eager].map(n => items[owner[n]].bin.idx));
      if (need > it.bin.idx) { const from = it.bin, to = bins[need]; from.items.splice(from.items.indexOf(it), 1); from.lines -= it.lines; to.items.push(it); to.lines += it.lines; it.bin = to; moved++; changed = true; } }); }
  const base = path.basename(file).replace(/\.(js|gs)$/, ''), ext = path.extname(file);
  bins.forEach(b => { const top = Object.keys(b.clusters).sort((x, y) => b.clusters[y] - b.clusters[x]); b.name = base + '-' + top.slice(0, 2).join('-') + ext; b.top = top;
    b.fns = b.items.filter(i => i.names.length).sort((x, y) => y.lines - x.lines).slice(0, 6).map(i => i.names[0]);
    b.over = b.lines > TARGET.fileLines; b.out = b.items.reduce((s, it) => s + [...it.uses].filter(n => items[owner[n]].bin !== b).length, 0); });
  const seenN = {}; bins.forEach(b => { seenN[b.name] = (seenN[b.name] || 0) + 1; if (seenN[b.name] > 1) b.name = b.name.replace(ext, '-' + seenN[b.name] + ext); });
  return { file, total, bins, moved, items: items.length };
}
function plan() {
  const giants = allFiles().filter(f => /\.(js|gs)$/.test(f)).map(f => ({ f, n: H.read(f).split('\n').length })).filter(x => x.n > TARGET.fileLines).sort((a, b) => b.n - a.n);
  const B = readBudgets(), P = B ? progress(B) : null;
  const md = ['# Split plan (generated, not performed)', '',
    'Written by `node tools/health.js --plan` (tools/structure.js). Every file over 800 lines, cut into files of 800 or fewer, grouped by what the functions are named (their prefix) and who calls whom. The pieces of a `js/` file take its place in `index.html`\'s list, in the order shown: any statement that runs at load and needs a name from a later piece has been moved into that later piece, so load order stays valid (the same rule `node js/check.js` enforces). Run `node js/check.js` after carrying out any part of it.', '',
    P ? P.line : '', '', '| File | Lines | Pieces |', '|---|---|---|'];
  const plans = giants.map(g => planFile(g.f));
  plans.forEach(p => md.push(`| \`${p.file}\` | ${p.total} | ${p.error ? 'not planned: ' + p.error : p.bins.length} |`));
  plans.forEach(p => { if (p.error) return;
    md.push('', `## ${p.file} (${p.total} lines → ${p.bins.length} files)`, '');
    if (p.moved) md.push(`${p.moved} load-time statement(s) moved to a later piece so what they read is already declared.`, '');
    p.bins.forEach((b, i) => md.push(`${i + 1}. **${b.name}** — ${b.lines} lines${b.over ? ' (OVER 800: a single function or load-time knot; split it by hand)' : ''}. What it does: the ${b.top.slice(0, 4).map(c => `\`${c}…\``).join(', ')} functions. Biggest: ${b.fns.map(n => '`' + n + '`').join(', ') || '—'}. Calls out to other pieces ${b.out} time(s).`)); });
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs/split-plan.md'), md.join('\n') + '\n');
  console.log(`wrote docs/split-plan.md: ${plans.length} giant files`);
  plans.slice(0, 6).forEach(p => console.log(p.error ? `  ${p.file}: ${p.error}` : `  ${p.file} ${p.total} lines → ${p.bins.length} files: ${p.bins.slice(0, 4).map(b => b.name + ' ' + b.lines).join(', ')}${p.bins.length > 4 ? ', …' : ''}`));
}

module.exports = { ratchet, progress, readBudgets, plan, init, measure };
if (require.main === module) {
  if (process.argv.includes('--init')) init();
  else if (process.argv.includes('--plan')) plan();
  else { const B = readBudgets(); console.log(B ? progress(B).line : BUDGETS + ' missing: node tools/structure.js --init'); }
}
