#!/usr/bin/env node
/* @family. — tools/health.js THE SITE'S ONE HEALTH SCORE (890), measured, never judged by AI. --check: write nothing, exit 1 when stale. */
/* Blends three parts into data/health.json:                                                                                          */
//   code stability (core)  40%  tools/stability.js, re-run here (cheap, reads the repo)
//   Find logic             35%  data/logic-health.json, written by tools/logic-health.js (slow: walks the funnel). Never re-walked here;
//                               it is "stale" when any of its inputs is newer than it.
//   UI simplicity          25%  style.css, read here — 100 less a penalty per signal, each capped:
// important    0.05 per !important, cap 15
// pxlit        0.004 per px literal outside :root, cap 15
// colourlit    0.02 per hex/rgb()/hsl() colour literal outside :root and custom-property definitions, cap 15
// order        0.05 per property a later rule with the very same selector sets again (won by order alone), cap 10
//              (check/cascade.js needs a browser, so this is the cheap static half of it)
// selectors    0.002 per selector over 1500, cap 15
// zindex       0.5 per distinct z-index value over 5, cap 10
// position     0.01 per transform or position:absolute, cap 10
// FIND WORKLIST (920): tag-colour, menu-rule, tag-asked, one-off, each located and taken off the walk's score; --list [n] [--kind k]; --changed is the ratchet.
// TOP OFFENDERS: every signal and Find rule priced in points of the OVERALL score it costs; the five dearest, one plain line each.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'health.json');
const CHECK = process.argv.includes('--check');
const WEIGHTS = { code: 0.40, logic: 0.35, ui: 0.25 };
const r1 = n => Math.round(n * 10) / 10;
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
/* WHEN A FILE LAST CHANGED: its last commit, or now when the working tree has it edited (a checkout's mtimes all say "just now"). */
const { execFileSync } = require('child_process');
const git = a => { try { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd(); } catch (e) { return ''; } };
const dirty = new Set(git(['status', '--porcelain']).split('\n').filter(Boolean).map(l => l.slice(3)));
const mtime = f => dirty.has(f) ? Date.now() : Number(git(['log', '-1', '--format=%ct', '--', f])) * 1000 || 0;

/* WHAT THE FUNNEL WALK READS: a change to any of these makes data/logic-health.json stale. */
const LOGIC_INPUTS = ['js/find.js', 'check/fixture.json', 'data/questions.json', 'data/textbooks.json', 'data/practicals.json',
  'data/projects.json', 'data/topics.json', 'tools/logic-health.js'];
function logic() {
  const j = (() => { try { return JSON.parse(read('data/logic-health.json')); } catch (e) { return null; } })();
  const at = mtime('data/logic-health.json');
  const newer = dirty.has('data/logic-health.json') ? [] : LOGIC_INPUTS.filter(f => mtime(f) > at);
  return { j, stale: !j || newer.length > 0, newer };
}

/* FIND-LOGIC WORKLIST (920): four kinds, each located; their penalty comes off the walk's score, each capped. */
const lineOf = (src, i) => src.slice(0, i).split('\n').length;
const blank = src => src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, m => m.replace(/[^\n]/g, ' '));
function findWork(L) {
  const fsrc = read('js/find.js'), work = [];
  const at = {};
  for (const m of fsrc.matchAll(/\{ field: '(\w+)',\s*label: '([^']+)'/g)) if (!at[m[1]]) at[m[1]] = { line: lineOf(fsrc, m.index), label: m[2] };
  /* tag-colour: TAG_OF colours a FIELD, so every answer of one menu wears the same colour. */
  const tagAt = fsrc.indexOf('const TAG_OF = {'), tagEnd = fsrc.indexOf('};', tagAt), TAGS = {};
  for (const m of fsrc.slice(tagAt, tagEnd).matchAll(/(\w+):\s*'(\w+)'/g)) TAGS[m[1]] = { c: m[2], line: lineOf(fsrc, tagAt + m.index) };
  Object.keys(at).forEach(k => work.push({ kind: 'tag-colour', where: 'js/find.js:' + (TAGS[k] ? TAGS[k].line : at[k].line),
    say: `menu "${at[k].label}" (${k}): every answer is coloured "${TAGS[k] ? TAGS[k].c : 'other'}" — the colour is per facet, not per answer` }));
  /* menu-rule: the walk's nodes where another askable question splits better; and the rule itself, if it picks by order. */
  const nf = /function nextFacet\([^)]*\)\s*\{[\s\S]*?\n\}/.exec(fsrc);
  if (nf && /for \(const facet of facetList\(\)\)[\s\S]*return facet/.test(nf[0]))
    work.push({ kind: 'menu-rule', where: 'js/find.js:' + lineOf(fsrc, nf.index), say: 'nextFacet asks the FIRST question in the facets tab\'s sort_order that facetWhy_ lets through, not the best-splitting one' });
  const fl = /\.sort\(\(a, b\) => a\.at - b\.at\)/.exec(fsrc);
  if (fl) work.push({ kind: 'menu-rule', where: 'js/find.js:' + lineOf(fsrc, fl.index), say: 'facetList orders the menus by the tab\'s sort_order — a hardcoded order over the split rule' });
  ((L.j && L.j.menuRule) || []).forEach(m => work.push({ kind: 'menu-rule', where: m.where,
    say: `asks ${m.asks} (${m.bits} bits) but ${m.best} splits the ${m.cards} cards better (${m.bestBits} bits)` }));
  /* tag-asked: a facet some card carries as a tag that no walked node ever asks. */
  ((L.j && L.j.tagAsked) || []).forEach(t => work.push({ kind: 'tag-asked', where: 'js/find.js:' + ((at[t.field] || {}).line || '?'),
    say: `tag "${t.label}" (${t.field}) is on ${t.cards} cards but no menu in the walk asks it` }));
  /* one-off: a literal kind/facet/finder test in the funnel code, bypassing a shared rule. */
  /* A CARD's kind (x, it, item, card or a bare kind), any facet's field, a facet key, or one finder by name; keys and mark parts are not cards. */
  const ONE = /(?<![\w.])(?:(?:x|it|item|card|y)\.)?kind\s*[!=]==?\s*'[^']+'|\b(?:\w+\.)?field\s*[!=]==?\s*'[^']+'|(?<![\w.])(?:facet|key)\s*[!=]==?\s*'[^']+'|\b(?:F|finder)\s*[!=]==?\s*(?:RES|FINDERS\.\w+)\b/g;
  ['js/find.js', 'js/shell.js'].forEach(f => { const src = blank(read(f));
    for (const m of src.matchAll(ONE)) work.push({ kind: 'find-one-off', where: f + ':' + lineOf(src, m.index), say: m[0] }); });
  return work;
}
const FIND_PENALTY = { 'tag-colour': [0.1, 10], 'menu-rule': [0.05, 15], 'tag-asked': [1, 10], 'find-one-off': [0.02, 10] };

function ui() {
  const css = read('style.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  // flat rules (and those inside @media): selector { body } with no nested braces in the body
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) rules.push({ sel: m[1].trim(), body: m[2] });
  const plain = rules.filter(r => !/^:root\b/.test(r.sel) && !r.sel.startsWith('@'));
  const strip = b => b.replace(/--[\w-]+\s*:[^;]*;?/g, '');
  const count = (re, src) => (src.match(re) || []).length;
  const body = plain.map(r => strip(r.body)).join('\n');
  const important = count(/!important/g, css);
  const pxlit = count(/\b\d*\.?\d+px\b/g, body);
  const colourlit = count(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g, body);
  const seen = new Map(); let order = 0;
  plain.forEach(r => {
    const props = new Set([...strip(r.body).matchAll(/([\w-]+)\s*:/g)].map(m => m[1]));
    const had = seen.get(r.sel);
    if (had) props.forEach(p => { if (had.has(p)) order++; had.add(p); }); else seen.set(r.sel, props);
  });
  const selectors = plain.reduce((n, r) => n + r.sel.split(',').length, 0);
  const zindex = new Set([...css.matchAll(/z-index\s*:\s*(-?\d+)/g)].map(m => m[1])).size;
  const position = count(/position\s*:\s*absolute/g, css) + count(/(?:^|[;{\s])transform\s*:/g, css);
  const S = [
    ['important', '!important declarations in style.css', important, 0.05, 15, 0],
    ['pxlit', 'Hard-coded px literals outside the tokens', pxlit, 0.004, 15, 0],
    ['colourlit', 'Hard-coded colours outside the tokens', colourlit, 0.02, 15, 0],
    ['order', 'Properties a repeated selector overrides only by order', order, 0.05, 10, 0],
    ['selectors', 'style.css selectors (over 1500)', selectors, 0.002, 15, 1500],
    ['zindex', 'Distinct z-index values (over 5)', zindex, 0.5, 10, 5],
    ['position', 'transform and position:absolute uses', position, 0.01, 10, 0],
  ].map(([id, label, n, w, cap, free]) => ({ id, label, count: n, weight: w, cap, off: r1(Math.min(cap, Math.max(0, n - free) * w)) }));
  return { score: r1(Math.max(0, 100 - S.reduce((a, s) => a + s.off, 0))), signals: S.sort((a, b) => b.off - a.off) };
}

/* CODE STRUCTURE (920): where the one-off cases live, line by line, on CORE app files (tiers.json). Capped per signal.
   It replaces stability's special/longfiles/longfns/duplicates, so nothing counts twice. */
// one-off   0.05 per if/case/ternary testing a kind, facet, field, col, screen, tab, id, type, which, mode or key against a string literal, cap 20
// long-fn   0.01 per line a top-level function runs over 80, cap 10
// big-file  0.001 per line a file runs over 1500, cap 10
// dup       0.02 per line of a 6+-line chunk already seen (normalised: trimmed, comments out), cap 10
// nest      0.05 per run of lines nested over 4 blocks deep inside a function, cap 10
// catch     an empty catch, listed for the fixer; priced by stability's `catches` (0.02 each), never again here
const STRUCT = { 'one-off': [0.05, 20], 'long-fn': [0.01, 10], 'big-file': [0.001, 10], dup: [0.02, 10], nest: [0.05, 10], catch: [0.02, 0] };
const REPLACED = new Set(['special', 'longfiles', 'longfns', 'duplicates']);
const W_ = '(?:kind|facet|field|col|screen|tab|id|type|which|mode|key)';
const ONE_OFF = new RegExp(`(?:\\b(?:[\\w$]+\\.)*${W_}\\s*[!=]==?\\s*'[^']+'|'[^']+'\\s*[!=]==?\\s*(?:[\\w$]+\\.)*${W_}\\b|^\\s*case\\s+'[^']+'\\s*:)`);
function coreFiles() {
  const T = (() => { try { return JSON.parse(read('data/settings/tiers.json')).files || {}; } catch (e) { return {}; } })();
  const ls = d => { try { return fs.readdirSync(path.join(ROOT, d)).sort(); } catch (e) { return []; } };
  return ls('js').filter(f => f.endsWith('.js') && !f.startsWith('check') && (T[f.slice(0, -3)] || 'core') === 'core').map(f => 'js/' + f)
    .concat(ls('backend').filter(f => f.endsWith('.gs')).map(f => 'backend/' + f));
}
/* A FILE SCANNED ONCE: per line, the code with comments removed (strings kept, for the literal tests), and the brace depth at its end —
   strings, templates (with their ${…}), regexes and comments never count as blocks. */
function scan(src) {
  const code = [], depthAt = [];
  let line = '', depth = 0, i = 0, prev = '';
  const stack = []; // 'T' = inside a template's text, '{' = an ordinary block, '$' = a ${ } inside a template
  const nl = () => { code.push(line); depthAt.push(depth); line = ''; };
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (stack[stack.length - 1] === 'T') {
      if (c === '\\') { line += c + (d || ''); i += 2; continue; }
      if (c === '`') { stack.pop(); line += c; i++; prev = '`'; continue; }
      if (c === '$' && d === '{') { stack.push('$'); line += '${'; i += 2; prev = '{'; continue; }
      if (c === '\n') { nl(); i++; continue; }
      line += c; i++; continue;
    }
    if (c === '\n') { nl(); i++; continue; }
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const body = src.slice(i, e < 0 ? src.length : e + 2); body.split('\n').slice(1).forEach(() => nl()); i = e < 0 ? src.length : e + 2; continue; }
    if (c === "'" || c === '"') { let j = i + 1; while (j < src.length && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1; line += src.slice(i, j + 1); i = j + 1; prev = c; continue; }
    if (c === '`') { stack.push('T'); line += c; i++; continue; }
    if (c === '/' && (/[(,=:[!&|?{};+\-*%<>~^]/.test(prev) || prev === '' || /\b(?:return|typeof|case|in|of)$/.test(line.trimEnd()))) {
      let j = i + 1, cls = false;
      while (j < src.length && src[j] !== '\n' && (cls || src[j] !== '/')) { if (src[j] === '\\') j++; else if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; j++; }
      line += '/re/'; i = j + 1; while (/[a-z]/.test(src[i] || '')) i++; prev = '/'; continue;
    }
    if (c === '{') { stack.push('{'); depth++; } else if (c === '}') { const t = stack.pop(); if (t === '$') { line += c; i++; prev = '`'; continue; } depth = Math.max(0, depth - 1); }
    line += c; i++; if (!/\s/.test(c)) prev = c;
  }
  nl();
  return { code, depthAt };
}
function structure() {
  const F = [], push = (file, line, kind, text, units) => F.push({ file, line, kind, text: String(text).trim().slice(0, 160), units });
  const seen = new Map();
  coreFiles().forEach(file => {
    const L = read(file).split('\n');
    if (L.length > 1500) push(file, 1501, 'big-file', `${L.length} lines, ${L.length - 1500} over the 1500 budget`, L.length - 1500);
    const { code: C, depthAt } = scan(L.join('\n'));
    let deepFrom = -1, fn = null;
    const N = [];
    L.forEach((raw, i) => {
      const code = C[i] || '', depth = depthAt[i] || 0, before = i ? depthAt[i - 1] : 0;
      if (code.trim().length >= 8) N.push({ t: code.trim(), i });
      if (ONE_OFF.test(code)) push(file, i + 1, 'one-off', raw, 1);
      if (/catch\s*(?:\(\s*\w*\s*\))?\s*\{\s*\}/.test(code)) push(file, i + 1, 'catch', raw, 1);
      const m = before === 0 && /^(?:async\s+)?function\s+([\w$]+)|^(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>\s*\{|[\w$]+\s*=>\s*\{)/.exec(raw);
      if (m) fn = { name: m[1] || m[2], at: i };
      if (depth === 0 && fn) {
        const n = i - fn.at + 1; if (n > 80) push(file, fn.at + 1, 'long-fn', `${fn.name}(): ${n} lines`, n - 80);
        fn = null;
      }
      if (depth > 5 && deepFrom < 0) deepFrom = i; // the function's own body is level 1, so depth 6 = over 4 levels of blocks within it
      if (depth <= 5 && deepFrom >= 0) { push(file, deepFrom + 1, 'nest', L[deepFrom], 1); deepFrom = -1; }
    });
    /* DUPLICATES: windows of 6 normalised lines; consecutive repeating windows are one finding priced by their length. */
    let run = null;
    const close = () => { if (run) push(file, run.at + 1, 'dup', `${run.n} lines also at ${run.prev.file}:${run.prev.line + 1} — ${run.first}`, run.n); run = null; };
    for (let k = 0; k + 6 <= N.length; k++) {
      const key = N.slice(k, k + 6).map(x => x.t).join('\n'), prev = seen.get(key);
      if (prev && !(prev.file === file && N[k].i - prev.line < 6)) {
        if (run && k === run.k + run.n - 5) run.n++; else { close(); run = { k, n: 6, at: N[k].i, prev, first: N[k].t }; }
      } else { close(); if (!prev) seen.set(key, { file, line: N[k].i }); }
    }
    close();
  });
  F.forEach(f => { f.cost = Math.round(f.units * STRUCT[f.kind][0] * WEIGHTS.code * 1000) / 1000; });
  const totals = {};
  Object.keys(STRUCT).forEach(k => {
    const [w, cap] = STRUCT[k], mine = F.filter(f => f.kind === k), units = mine.reduce((a, f) => a + f.units, 0);
    totals[k] = { count: mine.length, units, weight: w, cap, off: r1(Math.min(cap, units * w)) };
  });
  F.sort((a, b) => b.cost - a.cost || a.file.localeCompare(b.file) || a.line - b.line);
  return { findings: F.map(({ units, ...f }) => f), totals };
}

const SAY_KIND = { 'one-off': 'One-off branches on a literal', 'long-fn': 'Functions over 80 lines', 'big-file': 'Files over 1500 lines',
  dup: 'Duplicated 6+-line chunks', nest: 'Code nested over 4 levels' };
const SAY = {
  'one-off': n => `${n} branches test one kind, facet, field, screen or id by name; each is a special case to keep in mind.`,
  'long-fn': n => `${n} functions are over 80 lines.`,
  'big-file': n => `${n} files are over 1500 lines.`,
  dup: n => `${n} chunks of 6+ lines are copies of another.`,
  nest: n => `${n} places nest blocks more than 4 deep.`,
  catches: n => `${n} empty catches are allowed by check-catches; each one hides an error.`,
  special: n => `${n} per-facet or per-kind special cases in the app code, mostly js/find.js.`,
  exceptions: n => `${n} written exceptions let checks pass despite a known problem.`,
  dead: n => `${n} functions nothing calls.`,
  ceilings: n => `Ratchet ceilings in the checks have been raised by ${n} units in all.`,
  longfiles: n => `${n} files are over 3000 lines.`,
  duplicates: n => `${n} long lines are copied three or more times.`,
  longfns: n => `${n} functions are over 150 lines.`,
  markers: n => `${n} TODO/FIXME/HACK markers.`,
  important: n => `style.css uses !important ${n} times, so rules fight instead of cascading.`,
  pxlit: n => `${n} pixel sizes are written by hand instead of as tokens.`,
  colourlit: n => `${n} colours are written by hand instead of as :root tokens.`,
  order: n => `${n} properties are set twice for the same selector; the later one wins by order alone.`,
  selectors: n => `style.css has ${n} selectors; every one is something to keep in mind.`,
  zindex: n => `${n} different z-index values stack the screen.`,
  position: n => `${n} transforms and absolute positions place boxes by hand.`,
};

function health() {
  const st = require('./stability.js').stability();
  const L = logic(), U = ui(), S = structure();
  /* THE CODE PART: stability's signals less the four the structure signals replace, plus the structure signals. */
  const kept = (st.signals || []).filter(s => !REPLACED.has(s.id));
  const sig = kept.concat(Object.keys(STRUCT).filter(k => k !== 'catch').map(k => ({ id: k, label: SAY_KIND[k], count: S.totals[k].count, off: S.totals[k].off })));
  const code = r1(Math.max(0, 100 - sig.reduce((a, s) => a + s.off, 0)));
  const work = findWork(L), kinds = {};
  work.forEach(w => { kinds[w.kind] = (kinds[w.kind] || 0) + 1; });
  const fpen = Object.keys(FIND_PENALTY).map(k => ({ id: k, count: kinds[k] || 0, off: r1(Math.min(FIND_PENALTY[k][1], (kinds[k] || 0) * FIND_PENALTY[k][0])) }));
  const walk = L.j && typeof L.j.score === 'number' ? L.j.score : 0;
  const lscore = r1(Math.max(0, walk - fpen.reduce((a, p) => a + p.off, 0)));
  const overall = r1(WEIGHTS.code * code + WEIGHTS.logic * lscore + WEIGHTS.ui * U.score);
  const off = [];
  sig.forEach(s => s.off > 0 && off.push({ part: 'code', id: s.id, cost: r1(s.off * WEIGHTS.code),
    say: (SAY[s.id] ? SAY[s.id](s.count) : s.label + ': ' + s.count) }));
  U.signals.forEach(s => s.off > 0 && off.push({ part: 'ui', id: s.id, cost: r1(s.off * WEIGHTS.ui), say: SAY[s.id](s.count) }));
  const q = (L.j && L.j.questions) || 0;
  ((L.j && L.j.rules) || []).forEach(r => r.count > 0 && q && off.push({ part: 'logic', id: r.id,
    cost: r1(r.count / q * 100 * WEIGHTS.logic), say: `Find: ${r.count} of ${q} questions break a rule — ${r.label}.` }));
  fpen.forEach(p => p.off > 0 && off.push({ part: 'logic', id: p.id, cost: r1(p.off * WEIGHTS.logic), say: `Find: ${p.count} ${p.id} findings (node tools/health.js --list --kind ${p.id}).` }));
  off.sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id));
  const counts = {}; Object.keys(S.totals).forEach(k => { counts[k] = S.totals[k].count; });
  return {
    v: 2, score: overall, weights: WEIGHTS,
    parts: { code, logic: lscore, ui: U.score },
    logicStale: L.stale, logicWalk: walk, find: fpen, ui: U.signals, structure: S.totals, counts,
    top: off.slice(0, 5), all: off,
    worklist: S.findings, work,
  };
}
module.exports = { health };
/* --changed (920): a ratchet over the files this branch touches — no NEW finding against the committed baseline. */
function changed() {
  const t0 = Date.now();
  const files = new Set(git(['diff', '--name-only', 'origin/main']).split('\n').concat([...dirty]).filter(Boolean));
  const bad = [];
  const sig = w => w.kind + '|' + w.where.replace(/:\d+$/, '') + '|' + w.say;
  if (['js/find.js', 'js/shell.js', 'data/logic-health.json'].some(f => files.has(f))) {
    let base = []; try { base = JSON.parse(git(['show', 'HEAD:data/health.json'])).work || []; } catch (e) { base = []; }
    const had = {}; base.forEach(w => { had[sig(w)] = (had[sig(w)] || 0) + 1; });
    findWork(logic()).forEach(w => { const k = sig(w); if (had[k]) had[k]--; else bad.push(w.kind + '\t' + w.where + '\t' + w.say); });
  }
  const EMPTY = /catch\s*\(\w*\)\s*\{\s*\}|catch\s*\{\s*\}/g;
  [...files].filter(f => /\.(js|gs)$/.test(f)).forEach(f => {
    const now = read(f), was = git(['show', 'HEAD:' + f]);
    const n = (now.match(EMPTY) || []).length, m = (was.match(EMPTY) || []).length;
    if (n > m) now.split('\n').forEach((l, i) => { if (EMPTY.test(l)) bad.push('empty-catch\t' + f + ':' + (i + 1) + '\t' + (n - m) + ' new empty catch(es) in this file'); EMPTY.lastIndex = 0; });
  });
  const s = ((Date.now() - t0) / 1000).toFixed(1) + 's';
  if (!bad.length) { console.log(`health --changed: no new findings in ${files.size} changed file(s) (${s})`); process.exit(0); }
  bad.forEach(b => console.log(b));
  console.log(`health --changed: ${bad.length} new finding(s) (${s})`); process.exit(1);
}
/* --where WORD (920): every definition, then every use, of a name across the app, backend, settings and style — a start line, not a search. */
function where(word) {
  const t0 = Date.now(), esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const DEF = new RegExp(`(?:function\\s+${esc}\\b|(?:const|let|var)\\s+${esc}\\b|\\b(?:field|id|kind|screen|key|act|name)\\s*:\\s*['"]${esc}['"]|screen\\(\\s*['"]${esc}['"]|^\\s*['"]?${esc}['"]?\\s*:|--${esc}\\s*:|\\.${esc}\\s*\\{)`);
  const USE = new RegExp(`(?<![\\w-])${esc}(?![\\w-])`);
  const files = git(['ls-files', 'js/*.js', 'backend/*.gs', 'data/settings/*.json', 'style.css', 'index.html', 'check/*.js'])
    .split('\n').filter(f => f && !/^js\/check|^check\//.test(f));
  const defs = [], uses = [];
  files.forEach(f => read(f).split('\n').forEach((l, i) => { if (!USE.test(l)) return;
    (DEF.test(l) ? defs : uses).push(`${f}:${i + 1}  ${l.trim().slice(0, 140)}`); }));
  console.log(`defined (${defs.length}):`); defs.forEach(d => console.log('  ' + d));
  console.log(`used (${uses.length}):`); uses.slice(0, 200).forEach(u => console.log('  ' + u));
  if (uses.length > 200) console.log(`  … ${uses.length - 200} more`);
  console.log(`(${files.length} files, ${Date.now() - t0} ms)`);
}
/* --fix (920): purely mechanical, behaviour-identical edits only, then js/check.js. A colour literal in a rule that equals a token
   defined ONCE (never re-themed) becomes var(--token); check-catches' ceiling drops to the count. Empty catches are listed, not
   rewritten: oops_ reports to the backend, which would change what the site does. */
function fix() {
  const t0 = Date.now(), done = [];
  let css = read('style.css');
  const defs = {};
  /* Only a token every scope can see (on :root) and that nothing anywhere redefines. */
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) (defs[m[1]] = defs[m[1]] || []).push(m[2].trim().toLowerCase());
  const root = new Set(); for (const r of css.matchAll(/(^|\})\s*:root\s*\{([^{}]*)\}/g)) for (const d of r[2].matchAll(/(--[\w-]+)\s*:/g)) root.add(d[1]);
  Object.keys(defs).forEach(k => { if (!root.has(k) || !/^#[0-9a-f]{3,8}$/.test(defs[k][0])) delete defs[k]; });
  const tok = {};
  Object.keys(defs).forEach(k => { if (defs[k].length === 1) { const v = defs[k][0]; tok[v] = tok[v] ? null : k; } });
  let n = 0;
  css = css.replace(/([^{}]+)\{([^{}]*)\}/g, (all, sel, body) => /^\s*:root\b|^\s*@/.test(sel.split('\n').pop()) || /:root/.test(sel) ? all
    : sel + '{' + body.replace(/(^|;)(\s*)(?!--)([\w-]+\s*:[^;]*)/g, (d, a, w, decl) => a + w + /var\(/.test(decl) ? decl : decl.replace(/#[0-9a-fA-F]{3,8}\b/g, h => tok[h.toLowerCase()] ? (n++, `var(${tok[h.toLowerCase()]})`) : h)) + '}');
  if (n) { fs.writeFileSync(path.join(ROOT, 'style.css'), css); done.push(`style.css: ${n} colour literal(s) → their single-definition token`); }
  const cc = read('js/check-catches.js'), m = /const CEILING = (\d+);/.exec(cc);
  if (m) { const now = Number((/(\d+) empty catch blocks/.exec(execFileSync(process.execPath, ['js/check-catches.js'], { cwd: ROOT, encoding: 'utf8' })) || [])[1]);
    if (now && now < Number(m[1])) { fs.writeFileSync(path.join(ROOT, 'js/check-catches.js'), cc.replace(m[0], `const CEILING = ${now};`)); done.push(`check-catches ceiling ${m[1]} → ${now}`); } }
  const empty = structure().findings.filter(f => f.kind === 'catch').length;
  done.forEach(d => console.log('fixed: ' + d));
  console.log(`not fixed (would change behaviour): ${empty} empty catches — node tools/health.js --list 400 --kind catch`);
  try { execFileSync(process.execPath, ['js/check.js'], { cwd: ROOT, stdio: 'inherit' }); } catch (e) { console.log('js/check.js FAILED after --fix'); process.exit(1); }
  console.log(`health --fix: ${done.length} change(s) (${Date.now() - t0} ms)`);
}
if (require.main === module && process.argv.includes('--where')) where(process.argv[process.argv.indexOf('--where') + 1] || '');
else if (require.main === module && process.argv.includes('--fix')) fix();
else if (require.main === module && process.argv.includes('--changed')) changed();
else if (require.main === module) {
  const at = process.argv.indexOf('--list');
  if (at >= 0) {
    const n = Number(process.argv[at + 1]) || 20, ki = process.argv.indexOf('--kind'), kind = ki >= 0 ? process.argv[ki + 1] : '';
    const W = structure().findings.concat(findWork(logic()).map(w => ({ file: w.where.replace(/:\d+$/, ''), line: (/:(\d+)$/.exec(w.where) || [])[1] || '-', kind: w.kind, text: w.say })))
      .filter(f => !kind || f.kind === kind);
    W.slice(0, n).forEach(f => console.log(`${f.file}:${f.line}  ${f.kind}  ${f.text}`));
    console.log(`(${Math.min(n, W.length)} of ${W.length}${kind ? ' ' + kind : ''} findings, dearest first)`);
    process.exit(0);
  }
  const t0 = Date.now(), h = health(), want = JSON.stringify(h) + '\n';
  const L = logic();
  if (CHECK) {
    if (L.stale) { console.log('STALE — data/logic-health.json is older than ' + (L.newer.join(', ') || 'missing') + ': run node tools/logic-health.js'); process.exit(1); }
    const now = read('data/health.json');
    if (now === want) { console.log('OK — data/health.json is current (' + h.score + '%).'); process.exit(0); }
    console.log('FAILED — data/health.json is stale: run node tools/health.js'); process.exit(1);
  }
  fs.writeFileSync(OUT, want);
  console.log(`wrote data/health.json: ${h.score}% (code ${h.parts.code}, Find logic ${h.parts.logic}${L.stale ? ' STALE' : ''}, UI ${h.parts.ui}) in ${Date.now() - t0} ms`);
  console.log('  findings: ' + Object.keys(h.counts).map(k => k + ' ' + h.counts[k]).join(', '));
  h.top.forEach((t, i) => console.log(`  ${i + 1}. −${t.cost} ${t.say}`));
}
