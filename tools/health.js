#!/usr/bin/env node
/* @family. — tools/health.js THE SITE'S ONE HEALTH SCORE (890), measured, never judged by AI. --check: write nothing, exit 1 when stale. */
/* Every measure is a RULE over a countable population: followed ÷ applies to (owner, 12 Nov; docs/history/1210). The score is the plain average of the rules. */
/* Rules come from: tools/stability.js (code), tools/ai-cost.js (AI cost), data/logic-health.json (Find logic; stale when an input is newer), style.css, the walks' files, one-place.json, tools/one-truth.js. */
/* Pass/fail checks with no population count 1/1 or 0/1. Dropped, no population: selectors, z-index and position counts (none is wrong in itself), px literals (the scale rules hold sizes). */
/* --list orders every finding by the points of the total its fix gains. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'health.json');
const CHECK = process.argv.includes('--check');
const r1 = n => Math.round(n * 10) / 10;
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
/* WHEN A FILE LAST CHANGED: its last commit, or now when the working tree has it edited (a checkout's mtimes all say "just now"). */
const { execFileSync } = require('child_process');
const git = a => { try { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd(); } catch (e) { return ''; } };
const dirty = new Set(git(['status', '--porcelain']).split('\n').filter(Boolean).map(l => l.slice(3).split(' -> ').pop()));   /* a rename's new path (940) */
const mtime = f => dirty.has(f) ? Date.now() : Number(git(['log', '-1', '--format=%ct', '--', f])) * 1000 || 0;

/* WHAT THE FUNNEL WALK READS: a change to any of these makes data/logic-health.json stale. */
const FIND_FILES = require('./find-src.js').findFiles();
const PS_ = require('./piece-src.js'), ME_FILES = PS_.pieceFiles('me'), SHELL_FILES = PS_.pieceFiles('shell'), KP_FILES = PS_.pieceFiles('keypad'), BOOK_FILES = PS_.pieceFiles('book');
const SPLIT_GROUPS = [{ old: 'js/find.js', files: FIND_FILES }, { old: 'js/me.js', files: ME_FILES }, { old: 'js/shell.js', files: SHELL_FILES }, { old: 'js/keypad.js', files: KP_FILES }, { old: 'js/book.js', files: BOOK_FILES },
  { old: 'backend/content.gs', files: ['content', 'race', 'films', 'library', 'library-drive', 'media'].map(n => 'backend/' + n + '.gs') },
  { old: 'backend/digest.gs', files: ['digest', 'digest-tags'].map(n => 'backend/' + n + '.gs') },
  { old: 'backend/constants.gs', files: ['constants', 'access'].map(n => 'backend/' + n + '.gs') }];
const LOGIC_INPUTS = [...FIND_FILES, 'check/fixture.json', 'data/questions.json', 'data/textbooks.json', 'data/practicals.json',
  'data/projects.json', 'data/topics.json', 'tools/logic-health.js'];
function logic() {
  const j = (() => { try { return JSON.parse(read('data/logic-health.json')); } catch (e) { return null; } })();
  const at = mtime('data/logic-health.json');
  const newer = dirty.has('data/logic-health.json') ? [] : LOGIC_INPUTS.filter(f => mtime(f) > at);
  return { j, stale: !j || newer.length > 0, newer };
}

/* FIND-LOGIC WORKLIST (920): its kinds, each located; each kind is a rule over Find's menus, walked nodes or lines. */
const lineOf = (src, i) => src.slice(0, i).split('\n').length;
const blank = src => src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, m => m.replace(/[^\n]/g, ' '));
let FIND_POP = null;
function findWork(L) {
  const fsrc = require('./find-src.js').findSrc(), work = [];
  const at = {};
  for (const m of fsrc.matchAll(/\{ field: '(\w+)',\s*label: '([^']+)'/g)) if (!at[m[1]]) at[m[1]] = { line: lineOf(fsrc, m.index), label: m[2] };
  FIND_POP = { menus: Object.keys(at).length };
  /* tag-colour (1030): ONE colour per menu — (a) every answer of a menu, (b) its chip and card words take the facet's colour alone, */
  /* (c) two facets asked on one path (data/facet-graph.json, tools/facet-hues.js) never share one, (d) each hue reads 3:1 on --bg. */
  const tagLine = /^const TAG_OF = (\{.*\});$/m.exec(fsrc);
  let tab = null; try { tab = tagLine ? Function('return ' + tagLine[1])() : null; } catch (e) { tab = null; }
  const tagLn = tagLine ? lineOf(fsrc, tagLine.index) : 1;
  if (!tab) work.push({ kind: 'tag-colour', where: 'js/find.js:1', say: 'no readable `const TAG_OF = {…};` line — the menu colours were NOT checked' });
  else {
    /* A READER BUILT FOR ONE TITLE (`const SITTING_READER_ = { field: …`) is not a menu. */
    Object.keys(at).forEach(k => { if (!(k in tab) && !new RegExp('const \\w+ = \\{ field: \'' + k + '\'').test(fsrc)) work.push({ kind: 'tag-colour', where: 'js/find.js:' + at[k].line, say: `menu "${at[k].label}" (${k}) has no colour in TAG_OF — run node tools/facet-hues.js` }); });
    let G = null; try { G = JSON.parse(read('data/facet-graph.json')); } catch (e) { G = null; }
    if (!G) work.push({ kind: 'tag-colour', where: 'data/facet-graph.json', say: 'no facet graph — run node tools/facet-hues.js; neighbouring menus were NOT checked' });
    else (G.edges || []).forEach(([x, y]) => { if (x in tab && y in tab && tab[x] === tab[y])
      work.push({ kind: 'tag-colour', where: 'js/find.js:' + tagLn, say: `menus ${x} and ${y} are asked on one path and both wear --hue-${tab[x]} — run node tools/facet-hues.js` }); });
  }
  if (!/^const tagAttr_ = field => /m.test(fsrc)) work.push({ kind: 'tag-colour', where: 'js/find.js:' + tagLn, say: 'tagAttr_ takes more than the facet — one menu\'s answers could wear different colours' });
  for (const m of fsrc.matchAll(/tagAttr_\(([^()]*(?:\([^()]*\))?[^()]*)\)/g)) if (/,/.test(m[1]))
    work.push({ kind: 'tag-colour', where: 'js/find.js:' + lineOf(fsrc, m.index), say: `tagAttr_(${m[1].slice(0, 40)}) colours by more than the facet — an answer, chip or card word would leave its menu's colour` });
  const chipFn = (/function filterChips\(\)[\s\S]*?\n\}/.exec(fsrc) || [''])[0];
  if (!/tagAttr_\(f\.field\)/.test(chipFn)) work.push({ kind: 'tag-colour', where: 'js/find.js:' + lineOf(fsrc, Math.max(0, fsrc.indexOf('function filterChips'))), say: 'a picked chip does not take its menu\'s colour (tagAttr_(f.field))' });
  const css = read('style.css'), lum = h => { const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const bg = (/--bg:\s*#([0-9a-f]{6})/i.exec(css) || [])[1] || '000000', hues = [...css.matchAll(/--hue-(\d+):\s*#([0-9a-f]{6})/gi)];
  /* THE CHIP'S RADIUS IS READ OFF ITS OWN RULE (.chip.sm), never named here, so a tag and check-look's one corner cannot disagree. */
  const chipR = ((/\n\.chip\.sm\s*\{[^}]*?border-radius\s*:\s*([^;}]+)/.exec(css) || [])[1] || 'var(--r-round)').trim();
  /* EACH TAG A PILL LIKE ITS MENU CHIP (owner, 5 Nov): every .qtag rule keeps the chip's outline, radius token and padding; a rule that strips one fails. */
  [...css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).matchAll(/([^{}]*\.qtag\b(?![-\w\[])[^{}]*)\{([^}]*)\}/g)].filter(m => !/\.qtags?\s*\.\w|::?\w/.test(m[1].trim().split(/\s+/).pop())).forEach(m => {
    const b = m[2], why = [];
    if (/border(-color)?\s*:\s*[^;]*transparent|border\s*:\s*(0|none)/.test(b)) why.push('no outline');
    if (/border-radius\s*:/.test(b) && (/border-radius\s*:\s*([^;]+)/.exec(b) || [])[1].trim() !== chipR) why.push('a radius other than the chip\'s ' + chipR);
    if (/padding\s*:\s*0\s*[;}]?/.test(b + ';') && !/padding\s*:\s*0\s*[\d.]/.test(b)) why.push('no padding');
    if (/background\s*:\s*none/.test(b)) why.push('no chip tint');
    if (why.length) work.push({ kind: 'tag-colour', where: 'style.css:' + lineOf(css, m.index + m[0].length - m[2].length), say: `${m[1].trim()} draws a tag that is not a pill like its menu chip: ${why.join(', ')}` }); });
  if (!hues.length) work.push({ kind: 'tag-colour', where: 'style.css:1', say: 'no --hue-N palette on :root — the menu colours were NOT checked' });
  hues.forEach(m => { const a = lum(m[2]), b = lum(bg), r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    if (r < 3) work.push({ kind: 'tag-colour', where: 'style.css:' + lineOf(css, m.index), say: `--hue-${m[1]} #${m[2]} is ${r.toFixed(2)}:1 on --bg, under 3:1` }); });
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
  /* MENU-THIN (920): no menu asked with < 2 real answers, no answer drawn with 0 (the walk), and no rule in facetWhy_ that lets one through. */
  ((L.j && L.j.menuSense) || []).filter(m => ['thin', 'zero-count', 'answer-words', 'mangled-text', 'merged-value'].includes(m.kind)).forEach(m => work.push({ kind: /^(?:answer-words|mangled-text|merged-value)$/.test(m.kind) ? m.kind : 'menu-thin', where: m.where, say: m.kind + ': ' + m.say }));
  const fw = /function facetWhy_\([^)]*\)\s*\{[\s\S]*?\n\}/.exec(fsrc);
  if (!fw) work.push({ kind: 'menu-thin', where: 'js/find.js', say: 'facetWhy_ not found — the < 2 answers guard cannot be proved' });
  else { const body = blank(fw[0]), g = body.search(/if \(\s*vals\s*<\s*2\s*\)/);
    if (g < 0) work.push({ kind: 'menu-thin', where: 'js/find.js:' + lineOf(fsrc, fw.index), say: 'facetWhy_ has no "vals < 2" guard: a one-answer menu can be asked' });
    body.slice(0, g < 0 ? body.length : g).split('\n').forEach((l, i) => { if (/return\s*''/.test(l) && !/vals\s*(?:>\s*1|>=\s*2)/.test(l))
      work.push({ kind: 'menu-thin', where: 'js/find.js:' + (lineOf(fsrc, fw.index) + i), say: 'facetWhy_ lets a menu through before the < 2 answers guard: ' + l.trim().slice(0, 100) }); }); }
  const oneUnits = new Set(); FIND_POP.fns = 0;
  [...FIND_FILES, ...SHELL_FILES].forEach(f => { const src = blank(read(f)), U = fnUnits(f, read(f)); FIND_POP.fns += new Set(U.filter((u, i) => src.split('\n')[i].trim())).size;
    for (const m of src.matchAll(ONE)) { const ln = lineOf(src, m.index); oneUnits.add(U[ln - 1]); work.push({ kind: 'find-one-off', where: f + ':' + ln, say: m[0] }); } });
  FIND_POP.oneOff = oneUnits.size;
  /* EVERY FACET VALUE (940): tools/facet-data.js reads all answers of every menu, not the walk's few; its findings are read here, never re-run. */
  ((jread('data/facet-health.json') || {}).findings || []).forEach(x => work.push({ kind: x.kind, where: 'menu ' + x.menu, say: '"' + x.value + '" ' + x.say }));
  return work;
}
const FIND_KINDS = ['menu-thin', 'answer-words', 'mangled-text', 'merged-value', 'tag-colour', 'menu-rule', 'tag-asked', 'find-one-off', 'merged-all', 'near-dup', 'words-all'];

/* UNIFORM (920): controls not built by the shared makers, each located. App files only; the makers' own files are exempt. */
let UNIFORM_POP = null;
function uniformWork() {
  const P = { tags: 0, tiles: 0, classes: 0, lookGroups: 0, looks: 0 }, W = [], MAKERS = new Set(['js/tiles.js', ...SHELL_FILES]);
  const app = git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/check/.test(f) && !MAKERS.has(f));
  const css = read('style.css'), cssLines = css.split('\n');
  const jsAll = {};
  app.forEach(f => { const src = blank(read(f)); jsAll[f] = src;
    P.tags += (src.match(/<[a-z][\w-]*[\s>]/g) || []).length; P.tiles += (src.match(/\btile_\(/g) || []).length;
    src.split('\n').forEach((l, i) => {
      const at = f + ':' + (i + 1);
      /* A FORM's or a keypad's button is a button; anything else wearing <button> is a hand-rolled tile. */
      if (/<button\b/.test(l) && !/\b(?:key|opt|choice|chip|pad|form|dlg|dialog|sheet|close|field)\b|type="submit"/.test(l)) W.push({ kind: 'raw-button', where: at, say: l.trim().slice(0, 120) });
      if (/class="tile(?:\s|")/.test(l)) W.push({ kind: 'hand-tile', where: at, say: 'a tile written by hand, not tile_(): ' + l.trim().slice(0, 100) });
      if (/style="[^"$]*[a-z-]+\s*:[^"$]*"/.test(l)) W.push({ kind: 'inline-style', where: at, say: (/style="[^"]*"/.exec(l) || [''])[0].slice(0, 100) });
    }); });
  /* OWN WAITS: js/check-loading.js's own findings, so the score and the check never disagree. */
  let waits = [];
  try { waits = JSON.parse(execFileSync(process.execPath, ['js/check-loading.js', '--json'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })); }
  catch (e) { waits = ['js/check-loading.js: would not run — ' + e.message.slice(0, 80)]; }
  waits.forEach(b => { const m = /^([\w./-]+\.(?:js|css|html):\d+): ([\s\S]*)$/.exec(b);
    W.push({ kind: 'own-wait', where: m ? (/^(?:js|check|tools)\//.test(m[1]) || /^(?:style|index)\./.test(m[1]) ? m[1] : 'js/' + m[1]) : 'js/check-loading.js', say: (m ? m[2] : b).slice(0, 140) }); });
  /* A CLASS style.css styles that one app line uses and no other rule shares: one component's whole class, kept in mind for one place. */
  const used = {}; const blob = Object.values(jsAll).join('\n') + read('index.html') + read('js/tiles.js') + SHELL_FILES.map(read).join('');
  for (const m of blob.matchAll(/class="([^"$]+)"/g)) m[1].split(/\s+/).forEach(c => { used[c] = (used[c] || 0) + 1; });
  const ruled = {};
  cssLines.forEach((l, i) => { if (/\{/.test(l) && !/^\s*(?:@|--)/.test(l)) for (const m of l.split('{')[0].matchAll(/\.([a-zA-Z][\w-]*)/g)) (ruled[m[1]] = ruled[m[1]] || []).push(i + 1); });
  P.classes = Object.keys(ruled).length;
  Object.keys(ruled).forEach(c => { if (ruled[c].length === 1 && used[c] === 1 && !new RegExp('[\'"`\\s.]' + c + '[\'"`\\s]').test(blob.replace(/class="[^"]*"/g, '')))
    W.push({ kind: 'once-class', where: 'style.css:' + ruled[c][0], say: `.${c} styles one place only` }); });
  /* THE SAME CONTROL, DIFFERENT LOOKS: border-radius and font-size of .tile, .chip and button rules. */
  ['tile', 'chip', 'button'].forEach(ctl => { const seen = {};
    const re = ctl === 'button' ? /(?:^|[\s,>])button(?=[\s,:{.[]|$)/ : new RegExp('\\.' + ctl + '(?![\\w-])');
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) { const sel = m[1].trim().split('\n').pop(); if (!re.test(sel.split(',').map(x => x.trim().split(/\s+/).pop()).join(','))) continue;
      for (const d of m[2].matchAll(/(border-radius|font-size|font-family)\s*:\s*([^;]+)/g)) { const k = d[1], v = d[2].trim();
        (seen[k] = seen[k] || {}); if (!seen[k][v]) seen[k][v] = lineOf(css, m.index + m[0].indexOf(d[0])); } }
    Object.keys(seen).forEach(k => { const vs = Object.keys(seen[k]); P.lookGroups++; P.looks += vs.length; if (vs.length > 1) vs.slice(1).forEach(v => W.push({ kind: 'control-look', where: 'style.css:' + seen[k][v],
      say: `${ctl} ${k} ${v} (the first ${ctl} rule says ${vs[0]}; ${vs.length} different)` })); }); });
  UNIFORM_POP = P;
  return W;
}
const UNIFORM_KINDS = ['raw-button', 'hand-tile', 'inline-style', 'once-class', 'control-look', 'own-wait'];
/* UX AND QUESTIONS (920): read from data/ux-health.json, written by tools/ux-health.js (a browser walk); never walked here. */
function uxWork() {
  let j = null; try { j = JSON.parse(read('data/ux-health.json')); } catch (e) { return { j: null, work: [] }; }
  const W = [];
  (j.slow || []).forEach(c => W.push({ kind: 'ux', where: 'click: ' + c.what, say: `${c.ms} ms, shift ${c.shift}, ${c.longs} long task(s)` + (c.ms > j.thresholds.clickMs ? ' — slower than ' + j.thresholds.clickMs + ' ms' : '') + (c.shift > j.thresholds.shift ? ' — shifts over ' + j.thresholds.shift : '') }));
  (j.missing || []).forEach(m => W.push({ kind: 'ux', where: 'click: ' + m, say: 'its control was not on the screen to press' }));
  /* THE BIG WAITS, on a 4x-slow phone: three seconds to Find or to sign in, and 300 MB of heap, are where a phone gives up. */
  if (j.findUsableMs > 3000 || j.findUsableMs < 0) W.push({ kind: 'ux', where: 'Find usable', say: `${j.findUsableMs} ms from signed in to Find's first menu (budget 3000)` });
  if (j.signinMs > 3000) W.push({ kind: 'ux', where: 'sign-in', say: `${j.signinMs} ms from the press to signed in (budget 3000)` });
  if (j.heapMB > 300) W.push({ kind: 'ux', where: 'JS heap after Practice (raw)', say: `${j.heapMB} MB before a collection (budget 300)` });
  /* LIVE AND GARBAGE (940): scored apart, so a leak (live) and churn (garbage) each have their own line and fix. */
  if (j.heapLiveMB > 200) W.push({ kind: 'ux', where: 'JS heap after Practice (live)', say: `${j.heapLiveMB} MB after a forced GC (budget 200)` });
  if (j.garbageMB > 150) W.push({ kind: 'ux', where: 'JS heap garbage', say: `${j.garbageMB} MB uncollected garbage after the walk (budget 150)` });
  (j.clicks || []).filter(c => c.churnMB > 20).forEach(c => W.push({ kind: 'ux', where: 'click: ' + c.what, say: `${c.churnMB} MB of heap churned by one click (budget 20)` }));
  (j.a11y || []).forEach(a => W.push({ kind: 'a11y', where: a.screen + ' ' + a.what, say: a.say }));
  (j.consoleErrors || []).concat(j.errors || []).forEach(e => W.push({ kind: 'console', where: 'the UX walk', say: e }));
  /* THE REAL SITE (1000): data/live-health.json, tools/live-load.js against the live URL and API; the walk above uses a fixture. */
  let L = null; try { L = JSON.parse(read('data/live-health.json')); } catch (e) { L = null; }
  if (L) {
    const over = (v, b) => v == null || v > b;
    if (over(L.returnMenuMs, 3000)) W.push({ kind: 'ux', where: 'live: Find, return visit', say: `${L.returnMenuMs == null ? 'never' : L.returnMenuMs + ' ms'} to Find's first screen on the live site (budget 3000)` });
    if (over(L.coldMenuMs, 6000)) W.push({ kind: 'ux', where: 'live: Find, first visit', say: `${L.coldMenuMs == null ? 'never' : L.coldMenuMs + ' ms'} to Find's first screen on the live site (budget 6000)` });
    if (L.payloadGzipKB > 100) W.push({ kind: 'ux', where: 'live: doGet', say: `${L.payloadGzipKB} KB gzip payload (budget 100)` });
  }
  /* A SIGNED-IN PHONE, doGet HELD 10 s (1070): data/load-health.json, `tools/live-load.js --local`. Return visit to usable Find 1 s, cold 3 s, each of three menu taps 1 s. */
  let LH = null; try { LH = JSON.parse(read('data/load-health.json')); } catch (e) { LH = null; }
  if (LH) {
    const over = (v, b) => v == null || v > b, ms = v => (v == null ? 'never' : v + ' ms');
    if (over(LH.returnUsableMs, 1000)) W.push({ kind: 'ux', where: 'signed-in return visit: usable Find', say: `${ms(LH.returnUsableMs)} with doGet held 10 s (budget 1000)` });
    if (over(LH.coldUsableMs, 3000)) W.push({ kind: 'ux', where: 'cold first visit: usable Find', say: `${ms(LH.coldUsableMs)} with doGet held 10 s (budget 3000)` });
    if (over(LH.returnTapMs, 1000)) W.push({ kind: 'ux', where: 'return visit: menu taps', say: `${ms(LH.returnTapMs)} for the slowest of three early menu taps (budget 1000)` });
    if (over(LH.coldTapMs, 1000)) W.push({ kind: 'ux', where: 'first visit: menu taps', say: `${ms(LH.coldTapMs)} for the slowest of three early menu taps (budget 1000)` });
  }
  /* CARD TAGS (920): per kind, cards with no tag line and facet values missing from it, at the kind's drawing function; and a kind whose drawer had tagRow_ at 389d843 and has it no more. */
  const fnAt = name => { if (!name) return ''; for (const f of git(['ls-files', 'js/*.js']).split('\n')) { const i = read(f).search(new RegExp('function ' + name + '\\b')); if (i >= 0) return f + ':' + lineOf(read(f), i); } return ''; };
  const bodyHas = (src, name) => { const i = src.search(new RegExp('function ' + name + '\\b')); if (i < 0) return null; const e = src.indexOf('\n}', i); return /tagRow_\(/.test(src.slice(i, e)); };
  const fsrc = require('./find-src.js').findSrc(), drawer = {};
  for (const m of fsrc.matchAll(/^\s*(\w+): \{[^\n]*?card: x => \(?(?:typeof \w+ === 'function' \? )?(\w+)\(/gm)) drawer[m[1]] = { fn: m[2], at: 'js/find.js:' + lineOf(fsrc, m.index) };
  Object.keys(j.cardTags || {}).forEach(k => { const d = drawer[k] || {}, c = Object.assign({}, j.cardTags[k], { fn: d.fn || '' }), at = fnAt(c.fn) || d.at || ('kind ' + k);
    if (c.noTags) W.push({ kind: 'card-tags', where: at, say: `${k}: ${c.noTags} of ${c.sampled} sampled cards draw no tag line (${c.fn || 'no drawer'})` });
    if (c.notPill) W.push({ kind: 'card-tags', where: at, say: `${k}: ${c.notPill} of ${c.sampled} cards draw a tag that is not a pill like its menu chip (outline, chip radius, padding)` });
    if (c.tagsBelow) W.push({ kind: 'card-tags', where: at, say: `${k}: ${c.tagsBelow} of ${c.sampled} cards draw their title or text above the tag line` });
    Object.keys(c.missing || {}).forEach(f => W.push({ kind: 'card-tags', where: at, say: `${k}: ${c.missing[f]} of ${c.sampled} cards have a ${f} value that is not a tag` }));
    if (c.outside) W.push({ kind: 'attr-outside-tags', where: at, say: `${k}: ${c.outside} of ${c.sampled} cards show an attribute outside the top tag line (a marks label, a data-f) — it belongs in the tag line` });
    const file = at.split(':')[0];
    if (c.fn && /^js\//.test(file)) { const was = bodyHas(git(['show', '389d843:' + file]), c.fn), now = bodyHas(read(file), c.fn);
      if (was === true && now === false) W.push({ kind: 'card-tags', where: at, say: `${k}: ${c.fn} drew tagRow_ at 389d843 and no longer does` }); } });
  if (j.signinMs < 0) W.push({ kind: 'ux', where: 'sign-in', say: 'the sign-in with the fixture PIN did not finish' });
  ((j.questions || {}).broken || []).forEach(q => W.push({ kind: 'question', where: q.id + ' (' + q.type + ')', say: q.why.join('; ') }));
  ((j.inSync || {}).off || []).forEach(o => W.push({ kind: 'in-sync', where: 'walk (tools/ux-health.js)', say: o }));
  /* ONE CARD PER QUESTION, TAPS, SPILLED WORDS (960): check/qcard.js's walk, each count over its budget a finding; ideal 0. */
  let qc = null; try { qc = JSON.parse(read('data/qcard-health.json')); } catch (e) { qc = null; }
  const qb = ((jread('data/settings/structure-budgets.json') || {}).qcard) || {};
  if (qc) Object.keys(qc.checks || {}).forEach(k => { if (qc.checks[k] > (qb[k] || 0)) W.push({ kind: OWNER_KINDS[k] ? k : 'ux', where: 'qcard ' + k, say: `${qc.checks[k]} (budget ${qb[k] || 0}): ` + ((qc.where || {})[k] || []).slice(0, 3).join('; ') }); });
  /* TEXT BOXES (980): every visible box on Find, a question and Settings drawn alike; each differing measure a finding. */
  ((j.boxLooks || {}).off || []).forEach(o => W.push({ kind: 'ux', where: 'text boxes', say: o }));
  if (j.boxLooks && (j.boxLooks.faces || []).length < 3) W.push({ kind: 'ux', where: 'text boxes', say: 'the walk measured ' + (j.boxLooks.faces || []).length + ' of 3 boxes (Find, a question, Settings)' });
  /* WAITS AND JUMPS (owner, 11 Nov): data/wait-health.json from tools/wait.js under a slow backend; a warm visit never waits, nothing jumps. */
  const wt = jread('data/wait-health.json');
  ((wt && wt.rows) || []).forEach(r => {
    if (r.shift > 0.05) W.push({ kind: 'wait', where: r.who + ' ' + r.screen, say: `layout shift ${r.shift} under a ${wt.latency} ms backend (budget 0.05)` });
    if (r.warm && r.dots > 0) W.push({ kind: 'wait', where: r.who + ' ' + r.screen, say: `a return visit still showed a loader under a ${wt.latency} ms backend — no kept copy` });
  });
  return { j, work: W };
}
const UX_KINDS = ['wait', 'update-continuity', 'ux', 'question', 'a11y', 'console', 'card-tags', 'tag-colour', 'element-box', 'attr-outside-tags', 'text-boxes', 'in-sync', 'odd-tags', 'dup-controls', 'chip-size', 'settings-work', 'returned-features', 'clutter', 'front-door', 'picture-first', 'car-tags-split', 'people-one-kind', 'manuscripts-reach', 'no-age-gates', 'timeline-anim', 'friction', 'menu-order'];
/* THE OWNER'S FOUR (1030), each its own named check, ideal 0, budget `owner` in structure-budgets.json; the drawn halves come from check/qcard.js. */
const OWNER_KINDS = { 'tag-colour': 1, 'element-box': 1, 'card-tags': 1, 'attr-outside-tags': 1, 'text-boxes': 1, 'in-sync': 1, 'odd-tags': 1, 'dup-controls': 1, 'chip-size': 1, 'settings-work': 1, 'returned-features': 1, clutter: 1, 'front-door': 1, 'picture-first': 1, 'car-tags-split': 1, 'people-one-kind': 1, 'manuscripts-reach': 1, 'no-age-gates': 1, 'timeline-anim': 1, friction: 1, 'menu-order': 1 };
/* ONE CARD, ONE OF EACH (1040 r12): odd-tags and dup-controls from tools/card-health.js (the library in jsdom), chip-size and settings-work */
/* from check/chips-settings.js (a 390x844 browser walk); read here, never re-run, each finding located. */
function cardWork() {
  const W = [], c = jread('data/card-health.json'), b = jread('data/chips-settings-health.json');
  if (!c) W.push({ kind: 'odd-tags', where: 'data/card-health.json', say: 'missing — run node tools/card-health.js; tags and controls were NOT checked' });
  else (c.work || []).forEach(w => W.push(w));
  if (!b) W.push({ kind: 'chip-size', where: 'data/chips-settings-health.json', say: 'missing — run node check/chips-settings.js; chip sizes and settings were NOT checked' });
  else (b.work || []).forEach(w => W.push(w));
  /* RETURNED FEATURES (1040 batch B): check/returned.js opens each feature the owner brought back; read here, never re-run. */
  const rf = jread('data/returned-health.json');
  if (!rf) W.push({ kind: 'returned-features', where: 'data/returned-health.json', say: 'missing — run node check/returned.js; the returned features were NOT checked' });
  else (rf.work || []).forEach(w => W.push(w));
  /* THE TIMELINES (batch F): check/timelines.js walks each one; read here, never re-run. */
  const tl = jread('data/timeline-health.json');
  if (!tl) W.push({ kind: 'timeline-anim', where: 'data/timeline-health.json', say: 'missing — run node check/timelines.js; the timelines were NOT checked' });
  else (tl.work || []).forEach(w => W.push(w));
  /* FRICTION (batch G): check/friction.js walks booking, messaging, paying and homework as each role; read here, never re-run. */
  const fr = jread('data/friction-health.json');
  if (!fr) W.push({ kind: 'friction', where: 'data/friction-health.json', say: 'missing — run node check/friction.js; the journeys were NOT walked' });
  else (fr.work || []).forEach(w => W.push(w));
  /* NO GREY CLUTTER (A+): the walk's grey text outside a card's tag row (check/returned.js), and the markup that makes it. */
  ((rf && rf.clutter) || []).forEach(w => W.push(w));
  git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/check/.test(f)).forEach(f => { const src = read(f);
    for (const m of src.matchAll(/class="(?:sub|faint|muted)[ "]/g)) W.push({ kind: 'clutter', where: f + ':' + lineOf(src, m.index), say: 'a small grey line in markup — say it as a tag, or drop it' }); });
  return W;
}
/* IN SYNC (1040 r10): anything shown in two places reads one source — a person's face and name their profile, the business's picture brandLogo_. */
function inSyncWork() {
  const W = [], app = git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/check/.test(f)), add = (where, say) => W.push({ kind: 'in-sync', where, say });
  /* A STORED COPY: a tab other than people holding a person's handle, figure or name (the logs and receipts are counted, for the owner). */
  const con = read('backend/constants.gs'), sch = con.slice(con.indexOf('SCHEMA'));
  let tab = '';
  sch.split('\n').forEach((l, i) => { const t = /^  (\w+): \[/.exec(l); if (t) tab = t[1]; if (!tab || tab === 'people') return;
    for (const m of l.replace(/\/\*.*?\*\//g, '').matchAll(/"((?:\w+_)?(?:handle|avatar|figure|person_name|author_pic|author_photo))"/g))
      add('backend/constants.gs:' + (lineOf(con, con.indexOf('SCHEMA')) + i), `${tab}.${m[1]} stores a copy of a person's name or face — read it from their people row by id`); });
  /* THE BUSINESS'S PICTURE: one reader, brandLogo_; the icons, the Web profile and a business post all through it. */
  app.forEach(f => { const src = read(f);
    for (const m of src.matchAll(/brand\(\s*'logo_(?:square|circle)'|\.logo_(?:square|circle)\b/g))
      if (!/^function brandLogo_\(/.test(src.slice(src.lastIndexOf('\nfunction ', m.index) + 1))) add(f + ':' + lineOf(src, m.index), `${m[0]} read outside brandLogo_ — a second source for the business's picture`); });
  const fsrc = app.map(read).join('\n'), fnOf = n => (new RegExp('function ' + n + '\\([\\s\\S]*?\\n\\}').exec(fsrc) || [''])[0];
  if (!/brandLogo_\(/.test(fnOf('webProfilePages_'))) add('js/me-roles.js', 'the Web profile picture does not read brandLogo_');
  const fw = fnOf('postFaceWho_');
  if (!/brandLogo_\(/.test(fw)) add('js/posts.js', "a business post's face does not read brandLogo_");
  if (!/profileOf_\(/.test(fw)) add('js/posts.js', "a post's face is the copy sent with the post, not the author's profile (profileOf_)");
  if (!/profileOf_\(/.test(fnOf('postCard_'))) add('js/posts.js', "a post's name is the copy sent with the post, not the author's profile (profileOf_)");
  const html = read('index.html');
  ['icon', 'apple-touch-icon'].forEach(r => { if (!new RegExp('<link rel="' + r + '" id="favicon').test(html)) add('index.html', `no <link rel="${r}" id="favicon…"> for applyBrandIcon_ to follow`); });
  /* THE TOP BAR IS @family., THE NAME AND SIGN OUT (owner, 6 Nov): no badge; what the dot counted is Find › Settings › Notifications. */
  if (/biz-dot|createElement\(/.test(fnOf('bizNeedsPaint_') + fnOf('topbarPaint_'))) add('js/records.js', 'a badge is drawn in the top bar — notifications live in Find › Settings');
  if (!/(?:name: |add\()'Notifications'/.test(fnOf('settingDoorItems_'))) add('js/find-doors.js', 'no Notifications item in Find › Settings');
  /* THE ICON FILES ARE THE SOURCE (6 Nov): the manifest names icon.png, and applyBrandIcon_ never swaps the tab for a sheet link. */
  if (/brandLogo_\(|brand\(\s*'logo/.test(fnOf('applyBrandIcon_'))) add('js/shell-pages.js', "the tab icon follows the sheet's logo, not favicon.png / icon.png");
  try { const man = JSON.parse(read('manifest.webmanifest'));
    (man.icons || []).filter(i => i.src !== 'icon.png').forEach(i => add('manifest.webmanifest', `icon ${i.src} is not icon.png`));
    if (man.name !== '@family.' && !html.includes('<title>' + man.name + '</title>')) add('manifest.webmanifest', `the manifest's name "${man.name}" is not the page's title`); } catch (e) { add('manifest.webmanifest', 'cannot read the manifest or brand.json: ' + e.message); }
  /* THE BRAND'S NAME: the top bar paints it from brand('name'), not only the HTML's literal. */
  if (!/brand\(\s*'name'/.test(fnOf('topbarPaint_'))) add('js/shell-pages.js', "the top bar's brand name is index.html's literal, not brand('name')");
  return W;
}
function textboxRules(css) {
  /* TEXT BOXES (980, 1030): the question's cream answer pill (`.qp-bar > .qp-ans`) is the one look; any text-box rule with another radius, background, border or font differs. */
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' ')), look = b => { const o = {};
    for (const d of b.matchAll(/(?:^|;)\s*(border-radius|background-color|background|border|font)\s*:\s*([^;]+)/g)) o[d[1] === 'background-color' ? 'background' : d[1]] = d[2].trim().replace(/\s+/g, ' ').replace(/^400 /, '').replace(/^2px$/, 'var(--r-sm)');
    return o; };
  const base = look((/\n\.qp-bar > \.qp-ans \{([^}]*)\}/.exec(flat) || [])[1] || ''), tv = [{ where: 'style.css (.qp-bar > .qp-ans)', say: 'the cream answer pill' }];
  if (!base.background) tv.push({ where: 'style.css', say: 'no `.qp-bar > .qp-ans` rule: the cream pill the text boxes are held to is missing' });
  for (const m of flat.matchAll(/(?<=^|\})\s*([^{}@]+)\{([^{}]*)\}/g)) { const sel = m[1].trim().replace(/\s+/g, ' ');
    if (!/(^|[\s,>+~(])(input|textarea)\b(?!\[type="?(range|color|checkbox|radio|file|hidden))|\.(search|qp-ans|kp-field|kp-show)\b(?![-\w])/.test(sel)) continue;
    if (/::|:(disabled|focus|hover|empty|checked)|\[aria-invalid|\.kp-in\b|^\.qp-bar > \.qp-ans$/.test(sel)) continue;
    /* THE ESSAY SHEET (980) is ruled paper, not a box: its writing keeps the ruling's line height. */
    if (/\.kp-essay\b/.test(sel)) continue;
    /* A TICKBOX DRAWN ON A BARE INPUT (`appearance: none`) is a tickbox, not a text box. */
    if (/appearance:\s*none/.test(m[2]) && !/textarea/.test(sel)) continue;
    const o = look(m[2]), off = Object.keys(o).filter(k => o[k] !== base[k] && !/^(inherit|none|0)$|transparent/.test(o[k]));
    if (off.length) tv.push({ where: 'style.css:' + lineOf(flat, m.index + m[0].indexOf(m[1])), say: sel.slice(0, 70) + ' sets its own ' + off.join(', ') }); }
  return tv;
}
function ownerWork() {
  const W = [], css = read('style.css'), flat = css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' ')), fsrc = require('./find-src.js').findSrc();
  const rule = sel => { const m = new RegExp('(?:^|\\})\\s*' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}').exec(flat); return m ? { body: m[1], line: lineOf(flat, m.index + 1) } : null; };
  /* NO AGE GATES (1040): "cancel all that" — no learning row carries an age limit, and nothing in the app filters learning by the viewer's age. */
  git(['ls-files', 'data/*.json', 'data/**/index.json']).split('\n').filter(Boolean).forEach(f => { let src = ''; try { src = read(f); } catch (e) { return; }
    for (const m of src.matchAll(/"(?:min_age|adult_only|adults_only)"\s*:\s*(?!""|null|0\b)/g)) if (!/^data\/(people|chips-settings)/.test(f)) W.push({ kind: 'no-age-gates', where: f + ':' + lineOf(src, m.index), say: 'a learning row carries an age limit' }); });
  git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/check/.test(f)).forEach(f => { const src = read(f);
    for (const m of src.matchAll(/\b(?:min_age|viewerOfAge_|itemAgeOk_|itemMinAge_|scriptureMinAge_|gcseAgeOf_|SCRIPTURE_MIN_AGE|FIGHT_VIDEO_AGE)\b/g)) W.push({ kind: 'no-age-gates', where: f + ':' + lineOf(src, m.index), say: m[0] + ' — an age gate on learning content' }); });
  for (const m of fsrc.matchAll(/viewerAgeCap_\(|profileAge_\(/g)) W.push({ kind: 'no-age-gates', where: 'Find (find-*.js)', say: m[0] + ' in Find — Find filters by the viewer\'s age' });
  /* MENU ORDER (owner A, 6 Nov): Islam asks Quran or Hadith (the collection) before the six books (the work) — wCollection above wWork in Find's facets. */
  { const c = fsrc.indexOf("field: 'wCollection'"), w = fsrc.indexOf("field: 'wWork'");
    if (c < 0 || w < 0 || c > w) W.push({ kind: 'menu-order', where: 'js/find-finder.js', say: 'Collection is not asked before Work — Islam would ask the six books before Quran or Hadith' }); }
  /* element-box: an element's own container draws no box — no background, border (but the hairline under a card) or radius. */
  ['.card', '.qwhole'].forEach(sel => { const r = rule(sel); if (!r) { W.push({ kind: 'element-box', where: 'style.css', say: `no ${sel} rule — the element box was NOT checked` }); return; }
    const off = [];
    for (const d of r.body.matchAll(/(?:^|;)\s*(background(?:-color)?|border(?:-top|-left|-right)?|border-radius|box-shadow|outline)\s*:\s*([^;]+)/g))
      if (!/^(none|0|transparent|0 none)$/.test(d[2].trim())) off.push(d[1] + ': ' + d[2].trim());
    if (off.length) W.push({ kind: 'element-box', where: 'style.css:' + r.line, say: `${sel} draws a box other elements do not have (${off.join(', ')})` }); });
  /* card-tags: every card goes through stuffCard, which puts a tag line at its top (tagsOnTop_). */
  const sc = (/function stuffCard\([\s\S]*?\n\}/.exec(fsrc) || [''])[0];
  if (!/tagsOnTop_\(/.test(sc)) W.push({ kind: 'card-tags', where: 'js/find.js:' + lineOf(fsrc, Math.max(0, fsrc.indexOf('function stuffCard'))), say: 'stuffCard no longer puts a tag line on a card that draws none (tagsOnTop_)' });
  /* card-tags, order (1040 r10): tagsOnTop_ run on a card that draws its tags under its title must put them above it. */
  try { const ft = (/function tagsOnTop_\([\s\S]*?\n\}/.exec(fsrc) || [''])[0], row = '<div class="qtags qcard-tags"><span class="qtag">a</span></div>';
    const out = new Function('tagRow_', ft + '; return tagsOnTop_;')(() => row)({ k: 1 }, '<div class="card"><h3>T</h3>' + row + '<p>x</p></div>');
    if (!(out.indexOf('qtags') >= 0 && out.indexOf('qtags') < out.indexOf('<h3'))) W.push({ kind: 'card-tags', where: 'js/find-figures.js:' + lineOf(fsrc, Math.max(0, fsrc.indexOf('function tagsOnTop_'))), say: 'a card that draws its tag line under its title keeps it there (tagsOnTop_ must move it to the top)' }); }
  catch (e) { W.push({ kind: 'card-tags', where: 'js/find-figures.js', say: 'tagsOnTop_ could not be run on a fixture: ' + e.message }); }
  const wt = (/cardKind_\('question'[\s\S]*?\n\}\);/.exec(fsrc) || [''])[0];
  if (!/tags: [^\n]*tagList_\(x\)/.test(wt)) W.push({ kind: 'card-tags', where: 'js/find.js:' + lineOf(fsrc, Math.max(0, fsrc.indexOf("cardKind_('question'"))), say: 'a question part\'s card no longer starts with its own tag line (owner, 8 Nov)' });
  /* attr-outside-tags: no template draws an attribute beside the tag line — a marks label, "[2 marks]". */
  for (const f of git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/check/.test(f))) { const src = read(f);
    for (const m of src.matchAll(/class="[^"]*\b[\w-]*marks\b[^"]*"|\[\$\{[^}]*marks[^}]*\}\s*mark/g))
      W.push({ kind: 'attr-outside-tags', where: f + ':' + lineOf(src, m.index), say: `${m[0].slice(0, 50)} draws an attribute outside the tag line` }); }
  W.push(...inSyncWork(), ...cardWork());
  /* text-boxes: every text-box rule matches the cream answer pill (the variety family `textbox`, one finding each). */
  textboxRules(css).slice(1).forEach(t => W.push({ kind: 'text-boxes', where: t.where, say: t.say }));
  /* biz-checker (1050): the business checker's items, links and rules, and its card drawn with nothing loaded — js/check-biz.js. */
  try { W.push(...require('../js/check-biz.js').work()); } catch (e) { W.push({ kind: 'biz-checker', where: 'js/check-biz.js', say: 'would not run: ' + e.message }); }
  return W;
}

/* A RULE (owner, 12 Nov): a countable population and how many of it follow the rule; its score is ok ÷ of, every rule counted equally. */
const rule = (id, group, label, ok, of, kinds) => ({ id, group, label, ok: Math.max(0, Math.min(of, ok)), of, kinds: kinds || [id] });
/* A CHECK WITH NO COUNTABLE POPULATION is one thing that passes or fails: 1 of 1, or 0 of 1. */
const passFail = (id, group, label, n, kinds) => Object.assign(rule(id, group, label, n ? 0 : 1, 1, kinds), { pf: n });
/* THE ANSWER BOX'S ONE WIDTH (owner, 12 Nov): a box alone on its line fills it; boxes sharing a line are each --ans-w, never sized by kind. */
function answerWidths(css) {
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' ')), out = { of: 0, bad: [] };
  for (const m of flat.matchAll(/(?<=^|\})\s*([^{}@]+)\{([^{}]*)\}/g)) {
    const sels = m[1].trim().replace(/\s+/g, ' ').split(',').map(x => x.trim()).filter(x => /\.qp-ans(?![-\w])[^\s>+~]*$/.test(x) && !/:/.test(x));
    const sz = [...m[2].matchAll(/(?:^|;)\s*(flex|flex-basis|width|max-width)\s*:\s*([^;]+)/g)].map(d => [d[1], d[2].trim()]);
    if (!sels.length || !sz.length) continue;
    sels.forEach(sel => { out.of++;
      const alone = /\.qp-bar > \.qp-ans$/.test(sel) && sz.every(([k, v]) => k === 'flex' && v === '1 1 auto');
      const shared = sz.every(([k, v]) => /var\(--ans-w\)/.test(v) && (k !== 'flex' || /^[01] 1 var\(--ans-w\)$/.test(v)));
      if (!alone && !shared) out.bad.push({ kind: 'answer-width', where: 'style.css:' + lineOf(flat, m.index + m[0].indexOf(m[1].trim())),
        say: `${sel} sizes an answer box its own way (${sz.map(d => d.join(': ')).join('; ')}); one width, --ans-w` }); }); }
  return out;
}
/* ONE TEMPLATE (owner, 11 Nov): of every card made, how many go through findCard/card_ rather than writing class="card" (tools/one-template.js, which js/check-one-template.js gates). */
function oneTemplate() {
  const T = require('./one-template.js').oneTemplate();
  const bad = T.bad.map(t => { const at = /^([^:]+:\d+)/.exec(t); return { kind: 'one-template', where: at ? at[1] : 'js/check-one-template.js', say: t }; }), made = T.made;
  return { ok: made, of: made + bad.length, work: bad };
}
/* THE ONE TEMPLATE AS RENDERED (owner, 12 Nov): tools/template-health.js drives every role at 390 and 820 and reads each card's computed shape; read here, never re-run. */
function templateRendered() {
  const j = jread('data/template-health.json');
  if (!j) return { rules: [], work: [{ kind: 'tpl-built', where: 'data/template-health.json', say: 'missing — run node tools/template-health.js; the rendered cards were NOT checked' }] };
  return { rules: (j.rules || []).map(r => Object.assign(rule(r.id, 'ui', r.label, r.ok, r.of), { unit: r.unit, variety: r.variety })), work: j.work || [] };
}
function ui() {
  const raw = read('style.css'), css = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) rules.push({ sel: m[1].trim(), body: m[2] });
  const plain = rules.filter(r => !/^:root\b/.test(r.sel) && !r.sel.startsWith('@'));
  /* EVERY DECLARATION outside :root, custom properties left out (they are the tokens themselves). */
  const decls = plain.flatMap((r, b) => r.body.split(';').map(d => /^\s*([\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(d)).filter(d => d && !d[1].startsWith('--')).map(d => ({ sel: r.sel, k: d[1], v: d[2], b })));
  /* THE UNIT THE CSS RULES COUNT (owner, 12 Nov) is the rule-block, the thing a person edits: of the blocks a rule applies to, those that follow it. */
  const blocks = (has, bad) => { const of = new Set(), off = new Set(); decls.filter(has).forEach(d => { of.add(d.b); if (bad(d)) off.add(d.b); }); return [of.size - off.size, of.size]; };
  const seen = new Map(), reset = new Set();
  plain.forEach((r, b) => { const props = new Set(r.body.split(';').map(d => (/^\s*([\w-]+)\s*:/.exec(d) || [])[1]).filter(k => k && !k.startsWith('--')));
    const had = seen.get(r.sel); if (had) props.forEach(p => { if (had.has(p)) reset.add(b); had.add(p); }); else seen.set(r.sel, props); });
  /* THE SCALE AND PALETTE: tools/css-scale.js, the same reading js/check-scale.js gates on. */
  const SC = require('./css-scale.js').cssScale(raw).measure, sc = k => [SC[k].ok, SC[k].of];
  const AW = answerWidths(raw), OT = oneTemplate(), TH = templateRendered();
  const work = uniformWork().concat(uxWork().work, ownerWork(), AW.bad, OT.work, TH.work), k = {};
  work.forEach(w => { k[w.kind] = (k[w.kind] || 0) + 1; });
  const P = UNIFORM_POP || {}, n = id => k[id] || 0;
  const R = [
    rule('important', 'ui', 'CSS rule-blocks that win without !important', ...blocks(() => true, d => /!important/.test(d.v))),
    rule('order', 'ui', 'CSS rule-blocks that set no property a block of the same selector set before', ...blocks(() => true, d => reset.has(d.b))),
    rule('colourlit', 'ui', 'CSS rule-blocks with colours whose colours are all palette tokens', ...sc('colour')),
    rule('font-scale', 'ui', 'CSS rule-blocks with a font size, all from the --fs scale', ...sc('font')),
    rule('space-scale', 'ui', 'CSS rule-blocks with margins, paddings or gaps, all from the --s scale', ...sc('space')),
    rule('radius-scale', 'ui', 'CSS rule-blocks with a corner radius, all from the radius tokens', ...sc('radius')),
    rule('answer-width', 'ui', 'Answer-box width rules on the one width', AW.of - AW.bad.length, AW.of),
    rule('one-template', 'ui', 'Cards made on the one template (findCard/card_)', OT.ok, OT.of),
    ...TH.rules,
    rule('makers', 'ui', 'Tiles made by tile_() rather than by hand', P.tiles, P.tiles + n('raw-button') + n('hand-tile'), ['raw-button', 'hand-tile']),
    rule('inline-style', 'ui', 'Elements in markup with no inline style', P.tags - n('inline-style'), P.tags),
    rule('once-class', 'ui', 'Styled classes used in more than one place', P.classes - n('once-class'), P.classes),
    rule('control-look', 'ui', 'Tile, chip and button looks: one value per property', P.lookGroups, P.looks),
  ];
  return { rules: R, work, counts: k };
}

/* CODE STRUCTURE (920): where the one-off cases live, line by line, on CORE app files (tiers.json); each kind is a rule over its population (RULES below). */
/* one-off: a comparison testing a kind/facet/field/... by literal; long-fn over 80 lines; big-file over 1500; dup: a 6+-line chunk seen before; nest: over 4 blocks deep; catch empty; deliberate: a why-comment only. */
const STRUCT = ['one-off', 'long-fn', 'big-file', 'dup', 'nest', 'catch', 'deliberate'];
const W_ = '(?:kind|facet|field|col|screen|tab|id|type|which|mode|key)';
/* NOT A ONE-OFF: a DOM event's key or type ("Enter", "pointerup") and a `typeof` test are the language's words, not kinds of ours;
   js/predicates.js is where each named test is written once, for the rest to call. */
const DOM_EVENT = /\b(?:e|ev|evt|event)\.(?:key|type)\s*[!=]==?\s*'[^']+'|\btypeof\s+[\w$.]+\s*[!=]==?\s*'[^']+'/g, SHARED_TESTS = PS_.pieceFiles('predicates');
const ONE_OFF = new RegExp(`(?:\\b(?:[\\w$]+\\.)*${W_}\\s*[!=]==?\\s*'[^']+'|'[^']+'\\s*[!=]==?\\s*(?:[\\w$]+\\.)*${W_}\\b|^\\s*case\\s+'[^']+'\\s*:)`);
/* FROZEN (1090): tiers.json `frozen.files` are left out of the score and the worklist, so the list names only what the owner uses now. */
function frozenFiles() { try { return new Set(((JSON.parse(read('data/settings/tiers.json')).frozen || {}).files || []).map(f => 'js/' + f + '.js')); } catch (e) { return new Set(); } }
const notFrozen_ = w => !frozenFiles().has(String(w.file || w.where || '').replace(/:\d+$/, ''));
function coreFiles() {
  const T = (() => { try { return JSON.parse(read('data/settings/tiers.json')).files || {}; } catch (e) { return {}; } })();
  const Z = frozenFiles();
  const ls = d => { try { return fs.readdirSync(path.join(ROOT, d)).sort(); } catch (e) { return []; } };
  return ls('js').filter(f => f.endsWith('.js') && !f.startsWith('check') && f !== '_scope.js' && (T[f.slice(0, -3)] || 'core') === 'core' && !Z.has('js/' + f)).map(f => 'js/' + f)
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
/* THE UNIT A CODE RULE COUNTS (owner, 12 Nov): a top-level function, or a file's code outside any function; per line, the unit it is in. */
function fnUnits(file, src) {
  const { depthAt } = scan(src), L = src.split('\n'), out = []; let fn = null;
  L.forEach((raw, i) => { const before = i ? depthAt[i - 1] : 0;
    const m = before === 0 && /^(?:async\s+)?function\s+([\w$]+)|^(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>\s*\{|[\w$]+\s*=>\s*\{)/.exec(raw);
    if (m) fn = file + ':' + (i + 1) + ' ' + (m[1] || m[2]);
    out.push(fn || file + ' (top level)');
    if ((depthAt[i] || 0) === 0) fn = null; });
  return out;
}
function structure() {
  const F = [], push = (file, line, kind, text, units) => F.push({ file, line, kind, text: String(text).trim().slice(0, 160), units });
  const seen = new Map(), pop = { files: 0, fns: 0, units: 0, catches: 0 }, bad = { 'one-off': new Set(), dup: new Set(), nest: new Set() };
  /* EMPTY CATCHES: tools/catches.js, the count js/check-catches.js gates. */
  require('./catches.js').emptyCatches(coreFiles()).forEach(c => push(c.file, c.line, 'catch', c.text, 1));
  coreFiles().forEach(file => {
    const L = read(file).split('\n'); pop.files++;
    if (L.length > 1500) push(file, 1501, 'big-file', `${L.length} lines, ${L.length - 1500} over the 1500 budget`, L.length - 1500);
    const { code: C, depthAt } = scan(L.join('\n')), U = fnUnits(file, L.join('\n'));
    let deepFrom = -1, fn = null;
    const N = [];
    L.forEach((raw, i) => {
      const code = C[i] || '', depth = depthAt[i] || 0, before = i ? depthAt[i - 1] : 0;
      if (code.trim().length >= 8) N.push({ t: code.trim(), i });
      pop.catches += (code.match(/\bcatch\b/g) || []).length;
      if (depth > 5) bad.nest.add(U[i]);
      if (ONE_OFF.test(code.replace(DOM_EVENT, '')) && !SHARED_TESTS.includes(file)) { push(file, i + 1, 'one-off', raw, 1); bad['one-off'].add(U[i]); }
      if (/catch\s*(?:\(\s*\w*\s*\))?\s*\{\s*\}/.test(code) && !/catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(raw)) push(file, i + 1, 'deliberate', raw, 1);
      const m = before === 0 && /^(?:async\s+)?function\s+([\w$]+)|^(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>\s*\{|[\w$]+\s*=>\s*\{)/.exec(raw);
      if (m) { fn = { name: m[1] || m[2], at: i }; pop.fns++; }
      if (depth === 0 && fn) {
        const n = i - fn.at + 1; if (n > 80) push(file, fn.at + 1, 'long-fn', `${fn.name}(): ${n} lines`, n - 80);
        fn = null;
      }
      if (depth > 5 && deepFrom < 0) deepFrom = i; // the function's own body is level 1, so depth 6 = over 4 levels of blocks within it
      if (depth <= 5 && deepFrom >= 0) { push(file, deepFrom + 1, 'nest', L[deepFrom], 1); deepFrom = -1; }
    });
    /* DUPLICATES: windows of 6 normalised lines; consecutive repeating windows are one finding priced by their length. */
    let run = null;
    const close = () => { if (run) { for (let j = run.k; j < run.k + run.n; j++) bad.dup.add(U[N[j].i]); push(file, run.at + 1, 'dup', `${run.n} lines also at ${run.prev.file}:${run.prev.line + 1} — ${run.first}`, run.n); } run = null; };
    for (let k = 0; k + 6 <= N.length; k++) {
      const key = N.slice(k, k + 6).map(x => x.t).join('\n'), prev = seen.get(key);
      if (prev && !(prev.file === file && N[k].i - prev.line < 6)) {
        if (run && k === run.k + run.n - 5) run.n++; else { close(); run = { k, n: 6, at: N[k].i, prev, first: N[k].t }; }
      } else { close(); if (!prev) seen.set(key, { file, line: N[k].i }); }
    }
    close();
    pop.units += new Set(N.map(x => U[x.i])).size;
  });
  const totals = {};
  STRUCT.forEach(k => { const mine = F.filter(f => f.kind === k); totals[k] = { count: mine.length, units: mine.reduce((a, f) => a + f.units, 0) }; });
  F.sort((a, b) => b.units - a.units || a.file.localeCompare(b.file) || a.line - b.line);
  Object.keys(bad).forEach(k => { pop[k] = bad[k].size; });
  return { findings: F, totals, pop };
}


/* THE OCCASIONAL WALKS' FILES (920), each written by its own tool and only read here; a missing one is a skip, counted, never a zero. */
const jread = f => { try { return JSON.parse(read(f)); } catch (e) { return null; } };
function extraWork(st) {
  const W = [], skipped = [];
  const F = jread('data/field-health.json');
  if (!F || F.skipped) skipped.push('field (' + ((F && F.why) || 'tools/field-health.js not run') + ')');
  else {
    [['loadMs', 'load', 3000], ['findMs', 'time to Find', 3000], ['longMs', 'long tasks', 500], ['heapMB', 'JS heap', 300]].forEach(([k, say, b]) => {
      if (F[k] > b) W.push({ kind: 'field', part: 'ui', where: 'real phones (p75 of ' + F.visits + ')', say: `${say} ${F[k]}${k === 'heapMB' ? ' MB' : ' ms'} (budget ${b})` }); });
    if (F.visits && F.errorVisits / F.visits > 0.05) W.push({ kind: 'field', part: 'ui', where: 'real phones', say: `${F.errorVisits} of ${F.visits} visits threw an error` });
  }
  const A = jread('data/answer-health.json');
  if (!A || A.skipped) skipped.push('answers (' + ((A && A.why) || 'tools/answer-health.js not run') + ')');
  else (A.wrong || []).forEach(w => W.push({ kind: 'answer', part: 'logic', where: w.id, say: w.why }));
  const B = jread('data/backend-health.json');
  if (!B) skipped.push('backend (tools/backend-health.js not run)');
  else (B.problems || []).forEach(p => W.push({ kind: p.kind, part: 'code', where: p.where, say: p.say }));
  /* THE ONE QUESTION PAGE (roadmap 7): a checker proof that fails and a qtype with no checker are findings; moved/of is progress. */
  const Q = jread('data/qengine-health.json');
  if (!Q) skipped.push('qengine (tools/qengine-health.js not run)');
  else {
    Object.keys(Q.proofs || {}).forEach(k => (Q.proofs[k].fails || []).forEach(f => W.push({ kind: 'qengine', part: 'logic', where: 'checker ' + k, say: f })));
    (Q.unmapped || []).forEach(t => W.push({ kind: 'qengine', part: 'logic', where: 'qtype ' + t, say: 'no shared checker: ' + ((Q.types[t] || {}).questions || 0) + ' questions marked only by AI or a person' }));
  }
  W.push(...varietyWork(Q));
  const L = jread('data/logic-health.json');
  /* TWO ANSWERS THAT DIFFER ONLY IN A DIGIT are two things (1813 and 1843, Part 1 and Part 2), not one misspelt. */
  const digitsOnly = m => { const p = /: (.*) ~ (.*)$/.exec(m.say); const z = t => t.replace(/\d+|\b[IVXLC]+\b/g, '#'); return p && z(p[1]) === z(p[2]); };
  ((L && L.menuSense) || []).filter(m => !['thin', 'zero-count', 'answer-words', 'mangled-text', 'merged-value'].includes(m.kind) && !(m.kind === 'spelling' && digitsOnly(m))).forEach(m => W.push({ kind: 'menu-sense', part: 'logic', where: m.where, say: m.kind + ': ' + m.say }));
  /* TWIN PATHS (12 Nov): two answer paths to the same cards, from the funnel walk. */
  ((L && L.twinPaths) || []).forEach(t => W.push({ kind: 'twin-path', part: 'logic', where: t.where, say: t.say }));
  /* DEAD CODE: tools/dead.js, the list check-dead fails on and stability weighs: one item per function nothing calls. */
  require('./dead.js').deadFunctions().forEach(d => W.push({ kind: 'dead', part: 'code', where: (d.side === 'backend' ? 'backend/' : 'js/') + d.file, say: d.name + ' is never called' }));
  /* SIZE BUDGETS (920): each first-download file and their total, against data/settings/size-budgets.json (current + 5% when set). */
  const budget = jread('data/settings/size-budgets.json');
  const sizes = firstDownload();
  if (!budget) skipped.push('sizes (no data/settings/size-budgets.json: node tools/health.js --budgets)');
  else {
    Object.keys(sizes.files).forEach(f => { const b = budget.files && budget.files[f];
      if (!b) W.push({ kind: 'size', part: 'code', where: f, say: `${Math.round(sizes.files[f] / 1024)} KB with no budget` });
      else if (sizes.files[f] > b) W.push({ kind: 'size', part: 'code', where: f, say: `${Math.round(sizes.files[f] / 1024)} KB, over its ${Math.round(b / 1024)} KB budget` }); });
    if (sizes.total > budget.total) W.push({ kind: 'size', part: 'code', where: 'first download', say: `${Math.round(sizes.total / 1024)} KB, over its ${Math.round(budget.total / 1024)} KB budget` });
  }
  /* ONE SYSTEM (1060): the inbox file is well formed; the rulebook's own coverage is counted in healthRules, over the scored checks. */
  W.push(...require('./rules.js').ownerQuestions().work);
  return { work: W, skipped, sizes };
}
/* THE RENDERED TEMPLATE'S RULES (tools/template-health.js). */
const TPL_KINDS = ['tpl-built', 'tpl-order', 'tpl-picture', 'tpl-tags', 'tpl-tag-look', 'tpl-title', 'tpl-tiles', 'tpl-tile-size', 'tpl-pic-size', 'tpl-stray', 'tpl-width', 'tpl-centre', 'tpl-font', 'tpl-colour', 'tpl-radius', 'tpl-inline', 'tpl-spacing', 'tpl-same', 'tpl-variety-kind', 'tpl-variety'];
/* THE CHECK IDS health.js prices, for the rulebook's coverage. */
const knownChecks = st => [FIND_KINDS, UX_KINDS, UNIFORM_KINDS, STRUCT, EXTRA_KINDS, VARIETY_KINDS, TPL_KINDS].flat()
  .concat((st.signals || []).map(x => x.id), ['important', 'pxlit', 'colourlit', 'order', 'selectors', 'zindex', 'position'],
    ['font-scale', 'space-scale', 'radius-scale', 'answer-width', 'one-template', 'makers', 'one-place', 'biz-checker', 'exceptions', 'ceilings', 'markers', 'truth-facts', 'truth-lists', 'truth-labels'], ['read-bytes', 'search-bytes', 'comment-ratio', 'big-notes', 'spread', 'test-biggest', 'tombstones', 'claude-lines', 'effort']);
/* THE BUSINESS AREA (1060): how much of the business the site runs (one-place.json), and the checker's own faults; the card goes live. */
function business() {
  let bad = []; try { bad = require('../js/check-biz.js').work(); } catch (e) { bad = [{ kind: 'biz-checker', where: 'js/check-biz.js', say: 'would not run: ' + e.message }]; }
  const items = ((jread('data/settings/biz-checklist.json') || {}).items || []);
  /* A JOB RUN "PARTLY" IS NOT YET RUN: a half would be a number chosen by hand. */
  const op = require('./rules.js').onePlace(), yes = op.filter(f => f.status === 'yes').length;
  const gaps = op.filter(f => f.status !== 'yes').map(f => `The site does not yet run ${f.name.toLowerCase()} (${f.status}).`);
  const rules = [rule('one-place', 'business', 'Business jobs the site runs in full (one-place.json)', yes, op.length),
    passFail('biz-checker', 'business', 'The business checker runs clean (js/check-biz.js)', bad.length)];
  return { rules, bad, items: items.length, next: bad.map(b => b.say).concat(gaps, items.slice(0, 3).map(i => 'Tick in Checks: ' + i.title)).slice(0, 3) };
}
/* VARIETY (920): a family where one is ideal (one question page, one card drawer, one tile maker, one row style, one wait) costs
   for every variant past the first; each variant is listed where it lives. */
let VARIETY_LAST = null;
function varietyWork(Q, waits) {
  const W = [], fam = {}, app = git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/check/.test(f));
  const fnAt = (name, files) => { for (const f of files || app) { const src = read(f), i = src.search(new RegExp('function ' + name + '\\s*\\(')); if (i >= 0) return f + ':' + lineOf(src, i); } return ''; };
  const add = (id, label, ideal, part, variants) => { fam[id] = { label, count: variants.length, ideal };
    variants.slice(ideal).forEach((v, i) => W.push({ kind: 'variety-' + id, part, where: v.where, say: `${label}: variant ${i + ideal + 1} of ${variants.length} (ideal ${ideal}) — ${v.say}` })); };
  /* QUESTION PAGES: every qtype not yet on the one page is a page and a marker of its own; the one page counts once it holds any. */
  const qs = read('js/qtypes.js'), qv = [];
  if (Q && Q.types) { if (Q.moved) qv.push({ where: 'the one question page', say: Q.moved + ' qtypes on it' });
    Object.keys(Q.types).filter(t => !Q.types[t].moved).forEach(t => { const i = qs.search(new RegExp('\\n\\s*' + t + ':\\s*\\{ label')); qv.push({ where: 'js/qtypes.js:' + (i >= 0 ? lineOf(qs, i + 1) : '?'), say: `${t} has its own page and marker (${Q.types[t].questions} questions, checker ${Q.types[t].checker})` }); }); }
  if (!Q || !Q.moved) qv.unshift({ where: 'roadmap 7', say: 'the one page, not built yet' });
  add('qpage', 'Question pages and markers', 1, 'logic', qv);
  /* CARD DRAWERS: the distinct functions the kinds tab of find.js draws cards with. */
  const fsrc = require('./find-src.js').findSrc(), seen = new Map();
  for (const m of fsrc.matchAll(/^\s*(\w+): \{[^\n]*?card: x => \(?(?:typeof \w+ === 'function' \? )?(\w+)\(/gm)) if (!seen.has(m[2])) seen.set(m[2], m[1]);
  add('drawer', 'Card drawers', 1, 'ui', [...seen.keys()].map(fn => ({ where: fnAt(fn) || 'js/find.js', say: `${fn} (first for ${seen.get(fn)})` })));
  /* CARD TILE ROWS (950): cardRow_ is the one; a card drawer drawing its own tile-row is another, and so is a core row out of order. */
  const tsrc = read('js/tiles.js'), cv = [{ where: fnAt('cardRow_', ['js/tiles.js']) || 'js/tiles.js', say: 'cardRow_' }];
  const core = (/const CARD_CORE_ = \[([^\]]*)\]/.exec(tsrc) || [])[1] || '';
  if (core.replace(/\s/g, '') !== "'share','fav','suggest','top'" || !/function cardRow_[^]*?const mine = [^\n]*cardCore_\(x\) \+ cardExtras_\(x\)/.test(tsrc))
    cv.push({ where: 'js/tiles.js', say: 'the core row is not Share, Save, Suggest, Top first on every card' });
  [...seen.keys()].forEach(fn => { const at = fnAt(fn); if (!at) return; const src = read(at.split(':')[0]), i = src.search(new RegExp('function ' + fn + '\\s*\\('));
    if (/class="tile-row/.test(src.slice(i, src.indexOf('\n}', i)))) cv.push({ where: at, say: fn + ' draws its own tile row' }); });
  add('cardrow', 'Card tile rows', 1, 'ui', cv);
  /* TILE AND BUTTON MAKERS: functions whose name says they make one. tile_ is the one; its own parts (`tileIcon_`, `tileWordShow_`,
     any `tile…_` in tiles.js) are that one maker, not another. */
  const makers = [];
  app.forEach(f => { const src = read(f); for (const m of src.matchAll(/function (\w*(?:[Tt]ile|Btn|Button)\w*)\s*\(/g)) if (!/Row|row_|Set|Paint|Look|Html_$|Join/.test(m[1]) && !(f === 'js/tiles.js' && /^tile[A-Z]\w*_$/.test(m[1]))) makers.push({ name: m[1], where: f + ':' + lineOf(src, m.index) }); });
  makers.sort((a, b) => (a.name === 'tile_' ? -1 : b.name === 'tile_' ? 1 : 0));
  add('maker', 'Tile and button makers', 1, 'ui', makers.map(m => ({ where: m.where, say: m.name })));
  /* LIST-ROW STYLES: a `.…row` class whose own rule stacks it in a list (a dividing line, or spacing from its neighbour row);
     a form grid, a button row, a margin or a box of its own (a radius: a poll option, a bar) is not one. */
  const css = read('style.css'), rows = new Map(), flat = css.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' ')), boxed = new Set();
  for (const b of flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)) b[1].split(',').forEach(sel => {
    const subj = sel.trim().split(/\s+|\s*[>~]\s*/).pop() || '', m = /^\.((?:[a-z]+-)?row)(?::(?:last-child|last-of-type|first-child))?$/.exec(subj);
    if (!m || m[1] === 'tile-row') return;
    if (/border-radius/.test(b[2])) boxed.add(m[1]);
    const stacked = new RegExp('\\.' + m[1] + '[^\\s+]*\\s*\\+\\s*\\.' + m[1] + '(?![\\w-])').test(sel) || /:(last-child|last-of-type|first-child)/.test(subj);
    if ((stacked || /border-(top|bottom|block)\s*:\s*[^;]*\b(solid|var\(--line)/.test(b[2])) && !rows.has(m[1])) rows.set(m[1], 'style.css:' + lineOf(flat, b.index + b[0].indexOf(m[0])));
  });
  boxed.forEach(c => rows.delete(c));
  const rv = [...rows.keys()].sort((a, b) => (a === 'row' ? -1 : b === 'row' ? 1 : 0));
  add('listrow', 'List-row styles', 1, 'ui', rv.map(c => ({ where: rows.get(c), say: '.' + c })));
  /* SETTINGS ROW SHAPES: the row builders the settings screens use. */
  const sv = [];
  [...PS_.pieceFiles('settings'), 'js/staff.js', ...ME_FILES].forEach(f => { const src = read(f); for (const m of src.matchAll(/function (\w*[Rr]ow\w*)\s*\(/g)) sv.push({ where: f + ':' + lineOf(src, m.index), say: m[1] }); });
  add('setrow', 'Settings row shapes', 1, 'ui', sv);
  /* WAIT INDICATORS: loading_ is the one; each file that makes its own wait is another. */
  const wv = [{ where: fnAt('loading_', SHELL_FILES) || 'js/shell-*.js', say: 'loading_' }];
  const ow = new Map(); (waits || uniformWork()).filter(w => w.kind === 'own-wait').forEach(w => { const f = w.where.split(':')[0]; if (!ow.has(f)) ow.set(f, w.where); });
  ow.forEach((at, f) => wv.push({ where: at, say: 'its own wait in ' + f }));
  add('wait', 'Wait indicators', 1, 'ui', wv);
  const tv = textboxRules(css);
  add('textbox', 'Text boxes', 1, 'ui', tv);
  VARIETY_LAST = fam;
  return W;
}
const VARIETY_KINDS = ['variety-qpage', 'variety-drawer', 'variety-maker', 'variety-listrow', 'variety-setrow', 'variety-wait', 'variety-cardrow', 'variety-textbox'];
/* THE FIRST DOWNLOAD: index.html, style.css and every file index.html's list loads, in bytes. */
function firstDownload() {
  /* EAGER, as index.html works it out: FILES less LATER (fetched after the first screen) and OFF (never fetched). */
  const html = read('index.html'), arr = k => { const m = new RegExp('window\\.' + k + '\\s*=\\s*\\[([\\s\\S]*?)\\]').exec(html); return m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : []; };
  const later = new Set(arr('LATER').concat(arr('OFF')));
  const list = ['index.html', 'style.css', 'fonts/family-code.woff2'].concat(arr('FILES').filter(f => !later.has(f)).map(f => 'js/' + f + '.js'));
  const files = {}; let total = 0;
  list.forEach(f => { try { const n = fs.statSync(path.join(ROOT, f)).size; files[f] = n; total += n; } catch (e) { /* a listed file that is missing is check-loading's to say */ } });
  return { files, total };
}
let RULEBOOK_LAST = null;
const EXTRA_KINDS = ['field', 'answer', 'menu-sense', 'backend', 'resilience', 'dead', 'size', 'a11y', 'console', 'qengine', 'variety', 'owner-questions'];

/* THE SCORE (owner, 12 Nov): every measure is a rule over a countable population; the total is the plain average of the rules, no weights, no caps. */
const MEANS = "the share of the site's rules that are followed, each rule counted equally";
const GROUPS = { code: 'Code', logic: 'Find logic', ui: 'Design and UI', cost: 'AI cost', business: 'Business', content: 'Library content' };
/* KINDS SCORED INSIDE ANOTHER RULE, or listed only: own-wait is variety-wait's, text-boxes variety-textbox's, biz-checker business's, deliberate a chosen fallback. */
const LISTED_ONLY = new Set(['deliberate']);
function healthRules(st, L, U, S, work, X, C, B) {
  const n = {}; work.concat(U.work, X.work).forEach(w => { n[w.kind] = (n[w.kind] || 0) + 1; });
  const cnt = k => n[k] || 0, P = S.pop, T = S.totals, sg = id => (st.signals || []).find(x => x.id === id) || { count: 0, where: {} };
  const R = [];
  /* CODE: the structure kinds over the core files, and the checks' own honesty. */
  const checks = git(['ls-files', 'js/check*.js', 'check/*.js']).split('\n').filter(Boolean);
  const excFiles = new Set(Object.keys(sg('exceptions').where || {}).map(k => k.split(' ')[0]));
  const maxes = checks.reduce((a, f) => a + (read(f).match(/\bconst \w*_MAX\s*=\s*\d+/g) || []).length, 0);
  const app = git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/(check|_)/.test(f));
  const fns = app.reduce((a, f) => a + (read(f).match(/^(?:async\s+)?function\s+[\w$]+/gm) || []).length, 0);
  const fdOf = Object.keys((X.sizes || {}).files || {}).length + 1;
  R.push(rule('one-off', 'code', 'Functions that test no single kind, facet or id by name', P.units - P['one-off'], P.units),
    rule('long-fn', 'code', 'Functions within 80 lines', P.fns - T['long-fn'].count, P.fns),
    rule('big-file', 'code', 'Core files within 1500 lines', P.files - T['big-file'].count, P.files),
    rule('dup', 'code', 'Functions with no 6-line chunk copied from elsewhere', P.units - P.dup, P.units),
    rule('nest', 'code', 'Functions nested at most 4 blocks deep', P.units - P.nest, P.units),
    rule('catch', 'code', 'Catches that handle the error or say why not', P.catches - T.catch.count, P.catches),
    rule('exceptions', 'code', 'Checks with no written exception list', checks.length - excFiles.size, checks.length),
    rule('ceilings', 'code', 'Ratchet ceilings in the checks at zero', maxes - Object.keys(sg('ceilings').where || {}).length, maxes),
    rule('markers', 'code', 'App files with no TODO/FIXME/HACK marker', app.length - Math.min(app.length, sg('markers').count), app.length),
    rule('dead', 'code', 'App functions something calls', fns - sg('dead').count, fns),
    rule('size', 'code', 'First-download files (and their total) within budget', fdOf - cnt('size'), fdOf),
    rule('owner-questions', 'code', 'Owner questions well formed', 0, 0));
  const oq = require('./rules.js').ownerQuestions(), badQ = new Set(oq.work.map(w => w.where)).size;
  Object.assign(R[R.length - 1], { ok: Math.max(0, oq.of - badQ), of: oq.of });
  /* FIND LOGIC: the walk's own rules over its questions, then the static and data kinds over their menus, nodes and lines. */
  const q = (L.j && L.j.questions) || 0, nodes = ((L.j && L.j.walked) || {}).nodes || 0, FP = FIND_POP || {}, FH = jread('data/facet-health.json') || {};
  ((L.j && L.j.rules) || []).forEach(r => R.push(Object.assign(rule('walk-' + r.id, 'logic', 'Questions with no ' + r.label.replace(/^an? /, ''), q - r.count, q), { unit: 'questions' })));
  ['menu-thin', 'answer-words', 'mangled-text', 'merged-value', 'menu-rule', 'menu-sense'].forEach(k => R.push(rule(k, 'logic', `Walked menus with no ${k} finding`, nodes - cnt(k), nodes)));
  R.push(rule('tag-asked', 'logic', 'Menus whose tag some walked node asks', FP.menus - cnt('tag-asked'), FP.menus),
    rule('find-one-off', 'logic', "Find's functions that test no single kind or facet by name", FP.fns - FP.oneOff, FP.fns));
  ['merged-all', 'near-dup', 'words-all'].forEach(k => { const bad = new Set((FH.findings || []).filter(f => f.kind === k).map(f => f.menu)).size;
    R.push(rule(k, 'logic', `Menus with no ${k} answer (every value read)`, (FH.menus || 0) - bad, FH.menus || 0)); });
  const A = jread('data/answer-health.json'), Q = jread('data/qengine-health.json');
  if (A && !A.skipped) R.push(rule('answer', 'logic', 'Stored answers the checker agrees with', (A.checked || 0) - cnt('answer'), A.checked || 0));
  if (Q) { const pr = Object.values(Q.proofs || {}), types = Object.keys(Q.types || {}).length;
    R.push(rule('qengine', 'logic', 'Checker proofs that pass', pr.reduce((a, p) => a + (p.pass || 0), 0), pr.reduce((a, p) => a + (p.cases || 0), 0), []),
      rule('qengine-mapped', 'logic', 'Question types with a shared checker', types - (Q.unmapped || []).length, types, ['qengine'])); }
  /* THE VARIETY FAMILIES: ideal ÷ variants, where one is ideal (one question page, one card drawer, one tile maker...). */
  const V = VARIETY_LAST || {}, VK = { wait: ['variety-wait', 'own-wait'], textbox: ['variety-textbox', 'text-boxes'] };
  Object.keys(V).forEach(id => R.push(Object.assign(rule('variety-' + id, id === 'qpage' ? 'logic' : 'ui', V[id].label + ': the ideal ' + V[id].ideal + ' of the variants', V[id].ideal, Math.max(V[id].ideal, V[id].count), VK[id] || ['variety-' + id]), { variety: true })));
  R.push(...U.rules, ...C.rules.map(r => rule(r.id, 'cost', r.label, r.ok, r.of)), ...B.rules);
  /* A WALK THAT INSPECTS A POPULATION is a rule over it (owner, 12 Nov): the things it walked with no finding ÷ the things it walked. */
  const allW = work.concat(U.work, X.work);
  walkPops(U).forEach(([k, label, unit, of, key]) => { if (!of) return; const bad = new Set(allW.filter(w => w.kind === k).map(key || (w => w.where))).size;
    R.push(Object.assign(rule(k, 'ui', label, of - bad, of), { unit })); });
  /* EVERY OTHER CHECK, from a walk or a static pass with no countable population: one thing, passing or failing. */
  const has = new Set(R.flatMap(r => r.kinds).concat(['biz-checker', ...LISTED_ONLY]));
  const partOf = { backend: 'code', resilience: 'code', field: 'ui' }; X.work.forEach(w => { partOf[w.kind] = w.part; }); work.forEach(w => { partOf[w.kind] = 'logic'; });
  [...new Set(FIND_KINDS.concat(UX_KINDS, UNIFORM_KINDS, EXTRA_KINDS.filter(k => k !== 'variety'), Object.keys(n)))].filter(k => !has.has(k)).sort()
    .forEach(k => R.push(passFail(k, partOf[k] || 'ui', `${k}: passes with no findings`, cnt(k))));
  /* THE RULEBOOK (owner, 12 Nov): data/settings/rules.json (the rulebook as data) against every scored check and check file — tools/rules.js. */
  const RB = require('./rules.js').coverage(R.map(r => r.id).concat(['rule-checked', 'check-tied', 'rule-once']), knownChecks(st));
  X.work.push(...RB.work); RULEBOOK_LAST = RB;
  R.push(rule('rule-checked', 'code', 'Rules in data/settings/rules.json that name a check that exists', RB.checked, RB.rules),
    rule('check-tied', 'code', 'Checks (scored rules, check files, journeys) tied to a rule', RB.tied, RB.checks),
    rule('rule-once', 'code', 'Rules stated once (no near-duplicate rule text)', RB.once, RB.rules));
  R.forEach(r => { r.unit = r.unit || UNIT[r.id] || (r.variety ? 'variants' : r.pf != null ? 'one check (pass/fail)' : ''); });
  return R.filter(r => r.of > 0);
}
/* THE POPULATIONS THE WALKS INSPECT: [kind, label, unit, how many walked, what one finding is about]. A walk that records no count stays pass/fail. */
function walkPops(U) {
  const j = (U && U.j) || jread('data/ux-health.json') || {}, fr = jread('data/friction-health.json'), rf = jread('data/returned-health.json'), tl = jread('data/timeline-health.json');
  const cs = jread('data/chips-settings-health.json'), wt = jread('data/wait-health.json'), ch = jread('data/card-health.json'), qc = jread('data/qcard-health.json');
  const L = jread('data/live-health.json'), LH = jread('data/load-health.json'), kindOf = w => String(w.say).split(':')[0];
  const qb = ((jread('data/settings/structure-budgets.json') || {}).qcard) || {};
  const budgets = (j.clicks || []).length + (j.missing || []).length + 5 + (L ? 3 : 0) + (LH ? 4 : 0) + (j.boxLooks ? 1 : 0)
    + Object.keys((qc && qc.checks) || {}).filter(k => !OWNER_KINDS[k]).length + (j.signinMs < 0 ? 1 : 0);
  return [
    ['friction', 'Journeys each role can finish without friction', 'journeys', fr ? Object.values(fr.roles || {}).reduce((a, r) => a + Object.keys(r).length, 0) : 0],
    ['returned-features', 'Returned features that open and respond', 'features', rf ? (rf.each || []).length : 0],
    ['timeline-anim', 'Timelines that walk clean', 'timelines', tl ? tl.walked || 0 : 0],
    ['a11y', 'Controls and text on Find and Feed that pass the a11y basics', 'elements', j.a11yChecked || 0],
    ['ux', 'Clicks and load measures within their budget', 'budgets', j.clicks ? budgets : 0],
    ['settings-work', 'Settings boxes that save and say so', 'settings boxes', cs ? ((cs.settings || {}).tried || 0) : 0],
    ['wait', 'Screens loaded under a slow backend with no shift or needless loader', 'screen loads', wt ? (wt.rows || []).length : 0],
    ['card-tags', 'Card kinds whose sampled cards draw a full tag line', 'card kinds', Object.keys(j.cardTags || {}).length, kindOf],
    ['attr-outside-tags', 'Card kinds showing no attribute outside the tag line', 'card kinds', Object.keys(j.cardTags || {}).length, kindOf],
    ['odd-tags', 'Tagged cards with no tag made of its other tags', 'cards', ch ? ch.tagCards || 0 : 0],
  ];
}
/* WHAT EACH RULE COUNTS, beside it in -v: the thing a person would fix. */
const FN_UNIT = 'functions (and files\' top-level code)';
const UNIT = { 'one-off': FN_UNIT, 'long-fn': 'functions', 'big-file': 'files', dup: FN_UNIT, nest: FN_UNIT, catch: 'catches', exceptions: 'check files',
  ceilings: 'ratchet ceilings', markers: 'files', dead: 'functions', size: 'files (+ total)', 'rule-checked': 'rules', 'check-tied': 'checks', 'rule-once': 'rules', 'owner-questions': 'questions',
  'menu-thin': 'walked menus', 'answer-words': 'walked menus', 'mangled-text': 'walked menus', 'merged-value': 'walked menus', 'menu-rule': 'walked menus', 'menu-sense': 'walked menus',
  'tag-asked': 'menus', 'find-one-off': FN_UNIT, 'merged-all': 'menus', 'near-dup': 'menus', 'words-all': 'menus', answer: 'stored answers', qengine: 'proof cases', 'qengine-mapped': 'question types',
  important: 'CSS rule-blocks', order: 'CSS rule-blocks', colourlit: 'CSS rule-blocks', 'font-scale': 'CSS rule-blocks', 'space-scale': 'CSS rule-blocks', 'radius-scale': 'CSS rule-blocks',
  'answer-width': 'CSS selectors', 'one-template': 'card builder calls', makers: 'tile builder calls', 'inline-style': 'markup elements', 'once-class': 'classes', 'control-look': 'distinct looks',
  'read-bytes': 'elements', 'comment-ratio': 'files', tombstones: 'files', 'claude-lines': 'file (one)', 'search-bytes': 'directory (one)', 'test-biggest': 'test files', 'big-notes': 'history notes',
  spread: 'commits', 'one-place': 'business jobs', 'biz-checker': 'one check (pass/fail)' };
function health() {
  const st = require('./stability.js').stability();
  const L = logic(), U = ui(), S = structure(), work = findWork(L), X = extraWork(st), C = require('./ai-cost.js').aiCost(), B = business();
  /* ONE TRUTH, ONE PLACE (owner, 12 Nov): facts, file lists and id labels written once — tools/one-truth.js. */
  const OT = require('./one-truth.js').oneTruth(); X.work.push(...OT.work); B.rules = B.rules.concat(OT.rules);
  /* THE SPECIFICATION IS WHAT MUST EXIST (owner, 12 Nov): tools/coverage.js maps lessons, questions and figures onto every spec point. */
  const CV = jread('data/coverage-health.json');
  if (!CV) X.work.push({ kind: 'spec-lesson', part: 'content', where: 'data/coverage-health.json', say: 'missing — run node tools/coverage.js; the spec points were NOT counted' });
  else { X.work.push(...(CV.work || []).map(w => Object.assign({ part: 'content' }, w))); B.rules = B.rules.concat(CV.rules || []); }
  const R = healthRules(st, L, U, S, work, X, C, B), avg = rs => rs.length ? r1(rs.reduce((a, r) => a + r.ok / r.of, 0) / rs.length * 100) : 100;
  const overall = avg(R), pts = r => r1((r.of - r.ok) / r.of / R.length * 100);
  /* WHAT ONE FIX GAINS, in points of the total: a share of its rule's one point. */
  const gainOf = {}; R.forEach(r => { const g = r.pf ? 1 / r.pf : r.variety ? r.ok / Math.max(1, r.of - 1) - r.ok / r.of : 1 / r.of; r.kinds.forEach(k => { gainOf[k] = g / R.length * 100; }); });
  const gain = (kind, units) => Number(((gainOf[kind] || 0) * (units || 1)).toPrecision(2));
  const say = r => (r.pf ? `${r.label} (${r.pf} now)` : `${r.label}: ${r.ok} of ${r.of}`) + (r.kinds.length === 1 ? ` (node tools/health.js --list --kind ${r.kinds[0]})` : '');
  const off = R.filter(r => r.ok < r.of).map(r => ({ part: r.group, id: r.id, cost: pts(r), say: say(r) })).sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id));
  const parts = {}, weights = {}; Object.keys(GROUPS).forEach(g => { const rs = R.filter(r => r.group === g); parts[g] = avg(rs); weights[g] = Math.round(rs.length / R.length * 1000) / 1000; });
  const nextOf = g => off.filter(o => o.part === g).slice(0, 3).map(o => o.say), one = id => R.find(r => r.id === id);
  const areas = {}; Object.keys(GROUPS).forEach(g => { areas[g] = { score: parts[g], rules: R.filter(r => r.group === g).length, next: g === 'business' ? B.next : nextOf(g) }; });
  ['friction', 'size'].forEach(id => { const r = one(id); if (r) areas[id === 'size' ? 'speed' : id] = { score: avg([r]), next: U.work.concat(X.work).filter(w => w.kind === id).slice(0, 3).map(w => w.where + ': ' + w.say) }; });
  const Ph = require('./rules.js'), cov = RULEBOOK_LAST || { rules: 0, checked: 0, checks: 0, tied: 0, once: 0, untied: [] }, oq = Ph.ownerQuestions();
  const best = off[0];
  const next = best ? `Do this next: ${best.say} — following it fully is worth ${best.cost} points (${best.part}).` : 'Do this next: nothing — every rule is followed.';
  const counts = {}; Object.keys(S.totals).forEach(k => { counts[k] = S.totals[k].count; });
  const worklist = S.findings.map(({ units, ...f }) => Object.assign(f, { cost: gain(f.kind) })).sort((a, b) => b.cost - a.cost || a.file.localeCompare(b.file) || a.line - b.line);
  const allWork = work.concat(U.work, X.work.map(w => ({ kind: w.kind, where: w.where, say: w.say }))).filter(notFrozen_).map(w => Object.assign({}, w, { cost: gain(w.kind) }));
  return {
    v: 3, score: overall, means: MEANS, weights, rules: R.map(({ id, group, label, unit, ok, of }) => ({ id, group, label, unit, ok, of })),
    parts, areas, rulebook: { rules: cov.rules, checked: cov.checked, checks: cov.checks, tied: cov.tied, once: cov.once, untied: cov.untied }, ownerQuestions: { open: oq.open, of: oq.of }, onePlace: Ph.onePlace(),
    aiCost: { avgRead: C.avgRead, commentRatio: C.commentRatio, tombstones: C.tombstones.length, claudeLines: C.claudeLines, searchBytes: C.searchBytes, effort: (({ commits, medianLines, worstLines, medianFiles, worstFiles, testBytes, testBiggest, historyBytes, historyBiggest, bigNotes, spread }) => ({ commits, medianLines, worstLines, medianFiles, worstFiles, testBytes, testBiggest, historyBytes, historyBiggest, bigNotes: bigNotes.length, spread }))(C.effort), top: C.top.slice(0, 5) },
    next, variety: VARIETY_LAST, qengine: (() => { const Q = jread('data/qengine-health.json'); return Q ? { moved: Q.moved, of: Q.of, proofs: Object.fromEntries(Object.keys(Q.proofs).map(k => [k, Q.proofs[k].pass + '/' + Q.proofs[k].cases])) } : null; })(), skipped: X.skipped, firstDownloadKB: Math.round(X.sizes.total / 1024), logicStale: L.stale, structure: S.totals, counts,
    top: off.slice(0, 5), all: off, worklist, work: allWork.sort((a, b) => b.cost - a.cost),
  };
}
/* TREND (920): each full run's score in data/health-trend.json; the card draws the last thirty and names the commit of the worst drop. */
const TREND = path.join(ROOT, 'data', 'health-trend.json');
function trendSummary() {
  let t = []; try { t = JSON.parse(fs.readFileSync(TREND, 'utf8')); } catch (e) { t = []; }
  let drop = null;
  for (let i = 1; i < t.length; i++) { const d = r1(t[i].score - t[i - 1].score); if (d < 0 && (!drop || d < drop.by)) drop = { by: d, commit: t[i].commit, date: t[i].date, topKind: t[i].topKind }; }
  return { last: t.slice(-30).map(e => e.score), runs: t.length, worstDrop: drop };
}
function trendAppend(h) {
  let t = []; try { t = JSON.parse(fs.readFileSync(TREND, 'utf8')); } catch (e) { t = []; }
  const commit = git(['rev-parse', '--short', 'HEAD']), e = { date: new Date().toISOString().slice(0, 10), commit, score: h.score, parts: h.parts, topKind: (h.top[0] || {}).id || '', effort: h.aiCost && h.aiCost.effort };
  const was = t[t.length - 1];
  if (!was || was.score !== e.score || was.commit !== e.commit) { t.push(e); fs.writeFileSync(TREND, JSON.stringify(t, null, 1) + '\n'); }
}
module.exports = { health, structure, uniformWork, varietyWork, scan, coreFiles, blank, ONE_OFF, git, read, variety: () => VARIETY_LAST, ownerWork };
/* --changed (920): a ratchet over the files this branch touches — no NEW finding against the committed baseline. */
function changed() {
  const t0 = Date.now();
  const files = new Set(git(['diff', '--name-only', 'origin/main']).split('\n').concat([...dirty]).filter(f => f && !f.startsWith('attic/')));
  const bad = [];
  /* Find's pieces count as the one file they were cut from (1040), so a move between them is not a new finding. */
  const sig = w => w.kind + '|' + w.where.replace(/:\d+$/, '').replace(/^js\/find-[\w-]+\.js$/, 'js/find.js') + '|' + w.say;
  /* A STALE FACET REPORT (940): the library or the funnel changed and tools/facet-data.js was not re-run, so its findings are old. */
  const fAt = mtime('data/facet-health.json'), fNew = LOGIC_INPUTS.filter(f => files.has(f) && mtime(f) > fAt);
  if (fNew.length && !files.has('data/facet-health.json')) console.log('note: data/facet-health.json is older than ' + fNew.join(', ') + ' — run node tools/facet-data.js');
  /* THE FUNNEL'S TWO WRITTEN FILES (CI after be32d73): a funnel change that forgets either is red in CI, so say so here first. */
  const lNew = LOGIC_INPUTS.filter(f => files.has(f) && mtime(f) > mtime('data/logic-health.json'));
  if (lNew.length && !dirty.has('data/logic-health.json')) console.log('warning: data/logic-health.json is older than ' + lNew.join(', ') + ' — run node tools/logic-health.js');
  if (!require('./finder-tags.js').fresh()) console.log('warning: js/finder-tags.js is not stamped for these inputs — run node tools/finder-tags.js');
  if ([...FIND_FILES, ...SHELL_FILES, 'data/logic-health.json', 'data/facet-health.json'].some(f => files.has(f))) {
    let base = []; try { base = JSON.parse(git(['show', 'HEAD:data/health.json'])).work || []; } catch (e) { base = []; }
    const had = {}; base.forEach(w => { had[sig(w)] = (had[sig(w)] || 0) + 1; });
    findWork(logic()).forEach(w => { const k = sig(w); if (had[k]) had[k]--; else bad.push(w.kind + '\t' + w.where + '\t' + w.say); });
  }
  /* A MOVED QTYPE MAY NOT SLIP (920): re-proved when its markers or data changed, against the committed data/qengine-health.json. */
  if ([...FIND_FILES, 'js/qtypes.js', 'data/questions.json', 'data/settings/qengine.json', 'tools/qengine-health.js'].some(f => files.has(f))) {
    let was = null; try { was = JSON.parse(git(['show', 'HEAD:data/qengine-health.json'])); } catch (e) { was = null; }
    /* A TEMP COPY (940): --changed never leaves a rewritten report in the tree; only a full run writes data/*-health.json. */
    const tmp = path.join(require('os').tmpdir(), 'qengine-health-' + process.pid + '.json');
    try { execFileSync(process.execPath, ['tools/qengine-health.js'], { cwd: ROOT, stdio: 'ignore', env: Object.assign({}, process.env, { QENGINE_OUT: tmp }) }); } catch (e) { bad.push('qengine\ttools/qengine-health.js\tthe checker proofs would not run'); }
    const now = (() => { try { return JSON.parse(fs.readFileSync(tmp, 'utf8')); } catch (e) { return null; } finally { try { fs.unlinkSync(tmp); } catch (e) {} } })();
    if (was && now) Object.keys(was.types || {}).filter(t => was.types[t].moved).forEach(t => { const a = was.types[t], b = now.types[t] || {}, k = a.checker;
      if (!b.moved) bad.push(`qengine\tdata/settings/qengine.json\t${t} was on the one page and is not any more`);
      if (b.withAnswer < a.withAnswer) bad.push(`qengine\tdata/questions.json\t${t}: ${a.withAnswer - b.withAnswer} questions lost their answer field`);
      if (((now.proofs[k] || {}).pass || 0) < ((was.proofs[k] || {}).pass || 0)) bad.push(`qengine\tjs/find.js\t${t}: the ${k} checker passes fewer proofs (${(now.proofs[k] || {}).pass}/${(now.proofs[k] || {}).cases})`); });
  }
  const EMPTY = /catch\s*\(\w*\)\s*\{\s*\}|catch\s*\{\s*\}/g;
  [...files].filter(f => /\.(js|gs)$/.test(f)).forEach(f => {
    const G = SPLIT_GROUPS.find(g => g.files.includes(f)), piece = !!G, headOf = g => git(['show', 'HEAD:' + g]);
    /* A PIECE of a cut file is weighed with all its siblings against what HEAD had for the old file, one file or many (1040). */
    const was = piece ? (G.files.map(headOf).join('') || headOf(G.old)) : git(['show', 'HEAD:' + f]);
    const whole = piece ? G.files.map(read).join('') : '', now = read(f);
    if (piece && (whole.match(EMPTY) || []).length <= (was.match(EMPTY) || []).length) return;
    const n = (now.match(EMPTY) || []).length, m = (was.match(EMPTY) || []).length;
    if (n > m) now.split('\n').forEach((l, i) => { if (EMPTY.test(l)) bad.push('empty-catch\t' + f + ':' + (i + 1) + '\t' + (n - m) + ' new empty catch(es) in this file'); EMPTY.lastIndex = 0; });
  });
  /* THE STRUCTURE RATCHET (920): no file, long function, variety family or one-off over its budget; a gain tightens the budget. */
  /* THE AI-COST RATCHET (940): no tombstone, CLAUDE.md within 100 lines, js/'s searchable bytes and the comment share only go down. */
  const AC = require('./ai-cost.js').aiCost(), BP = path.join(ROOT, 'data/settings/structure-budgets.json');
  AC.tombstones.forEach(t => bad.push('tombstone\t' + t.where + '\t' + t.say + ' — delete it; the story goes in docs/history'));
  if (AC.claudeLines > 100) bad.push(`claude-lines\tCLAUDE.md\t${AC.claudeLines} lines, over the budget of 100: move detail to docs/map-detail.md`);
  try { const BJ = JSON.parse(fs.readFileSync(BP, 'utf8')), A = BJ.aiCost || {};
    if (A.searchBytes && AC.searchBytes > A.searchBytes) bad.push(`search-bytes\tjs/\t${AC.searchBytes} searchable bytes, over the budget of ${A.searchBytes}`);
    if (A.commentRatio && AC.commentRatio > A.commentRatio + 0.002) bad.push(`comment-ratio\tjs/\tcomments are ${AC.commentRatio} of app code, over the budget of ${A.commentRatio}`);
    /* THE FOUR (1040): the biggest test file (4 KB slack), notes over 40 KB and a change's spread (one file slack) only go down; effort is report-only. */
    const E = AC.effort, low = (k, v) => Math.min(A[k] == null ? Infinity : A[k], v);
    if (A.testBiggest && E.testBiggest > A.testBiggest + 4096) bad.push(`test-biggest\t${E.testBiggestFile}\t${E.testBiggest} bytes, over the budget of ${A.testBiggest}: put new journeys in a file of their own`);
    if (A.bigNotes != null && E.bigNotes.length > A.bigNotes) bad.push(`big-notes\tdocs/history/\t${E.bigNotes.length} notes over 40 KB, over the budget of ${A.bigNotes}: split by topic, never delete`);
    if (A.spread && E.spread > A.spread + 1) bad.push(`spread\tjs/\ta change to js/ touches ${E.spread} files (median), over the budget of ${A.spread}`);
    const next = { searchBytes: low('searchBytes', AC.searchBytes), commentRatio: Math.min(A.commentRatio || 1, AC.commentRatio), tombstones: 0, claudeLines: 100,
      testBiggest: low('testBiggest', E.testBiggest), bigNotes: low('bigNotes', E.bigNotes.length), spread: low('spread', E.spread), effortLines: low('effortLines', E.medianLines), effortFiles: low('effortFiles', E.medianFiles) };
    if (JSON.stringify(next) !== JSON.stringify(A)) {
      BJ.aiCost = next;
      if (!bad.length) fs.writeFileSync(BP, JSON.stringify(BJ, null, 1) + '\n'); } } catch (e) { bad.push('ai-cost\t' + BP + '\tcannot read the budgets: ' + e.message); }
  /* THE OWNER'S FOUR (1030): their static halves, every change, against budget `owner` (ideal 0). */
  { let OB = {}; try { OB = JSON.parse(fs.readFileSync(BP, 'utf8')).owner || {}; } catch (e) { OB = {}; }
    const ow = ownerWork().concat(findWork(logic()).filter(w => w.kind === 'tag-colour')), n = {};
    ow.forEach(w => { n[w.kind] = (n[w.kind] || 0) + 1; });
    Object.keys(OWNER_KINDS).forEach(k => { if ((n[k] || 0) > (OB[k] || 0)) ow.filter(w => w.kind === k).forEach(w => bad.push(k + '\t' + w.where + '\t' + w.say)); }); }
  /* THE BUSINESS CHECKER (1050), ideal 0, every change. */
  try { require('../js/check-biz.js').work().forEach(w => bad.push(w.kind + '\t' + w.where + '\t' + w.say)); } catch (e) { bad.push('biz-checker\tjs/check-biz.js\t' + e.message); }
  const R = require('./structure.js').ratchet([...files]);
  bad.push(...R.bad);
  if (!R.bad.length && R.gains.length) console.log('structure budgets tightened: ' + R.gains.join('; '));
  if (R.B) console.log(require('./structure.js').progress(R.B).line);
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
/* --fix (920): purely mechanical, behaviour-identical edits only, then js/check.js. § */
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
  if (m) { const now = require('./catches.js').emptyCatches().length;
    if (now && now < Number(m[1])) { fs.writeFileSync(path.join(ROOT, 'js/check-catches.js'), cc.replace(m[0], `const CEILING = ${now};`)); done.push(`check-catches ceiling ${m[1]} → ${now}`); } }
  const empty = structure().findings.filter(f => f.kind === 'catch').length;
  done.forEach(d => console.log('fixed: ' + d));
  console.log(`not fixed (would change behaviour): ${empty} empty catches — node tools/health.js --list 400 --kind catch`);
  try { execFileSync(process.execPath, ['js/check.js'], { cwd: ROOT, stdio: 'inherit' }); } catch (e) { console.log('js/check.js FAILED after --fix'); process.exit(1); }
  console.log(`health --fix: ${done.length} change(s) (${Date.now() - t0} ms)`);
}
if (require.main === module && process.argv.includes('--budgets')) {
  const z = firstDownload(), up = n => Math.ceil(n * 1.05);
  fs.writeFileSync(path.join(ROOT, 'data/settings/size-budgets.json'), JSON.stringify({ why: 'first-download budgets: current + 5% when set (920); raise one only with a reason in docs/history', total: up(z.total),
    files: Object.fromEntries(Object.keys(z.files).map(f => [f, up(z.files[f])])) }, null, 1) + '\n');
  console.log(`wrote data/settings/size-budgets.json: ${Object.keys(z.files).length} files, total ${Math.round(up(z.total) / 1024)} KB`);
} else if (require.main === module && process.argv.includes('--where')) where(process.argv[process.argv.indexOf('--where') + 1] || '');
else if (require.main === module && process.argv.includes('--fix')) fix();
else if (require.main === module && process.argv.includes('--changed')) changed();
else if (require.main === module && process.argv.includes('--cache')) { const C = require('./cache.js').cache(); C.ok.forEach(o => console.log('ok: ' + o)); C.work.forEach(w => console.log(`cache  ${w.where}  ${w.say}`)); console.log('achievable: ' + C.achievable); }
else if (require.main === module && process.argv.includes('--isolation')) execFileSync(process.execPath, ['tools/isolation.js', '15'], { cwd: ROOT, stdio: 'inherit' });
else if (require.main === module && process.argv.includes('--plan')) require('./structure.js').plan();
else if (require.main === module && process.argv.includes('--structure-init')) require('./structure.js').init();
else if (require.main === module) {
  const at = process.argv.indexOf('--list');
  if (at >= 0) {
    const n = Number(process.argv[at + 1]) || 20, ki = process.argv.indexOf('--kind'), kind = ki >= 0 ? process.argv[ki + 1] : '';
    const h = health(), W = h.worklist.concat(h.work.map(w => ({ file: w.where.replace(/:\d+$/, ''), line: (/:(\d+)$/.exec(w.where) || [])[1] || '-', kind: w.kind, text: w.say, cost: w.cost })))
      .filter(f => (!kind || f.kind === kind) && notFrozen_(f)).sort((a, b) => b.cost - a.cost);
    W.slice(0, n).forEach(f => console.log(`${f.file}:${f.line}  ${f.kind}  +${f.cost}  ${f.text}`));
    console.log(`(${Math.min(n, W.length)} of ${W.length}${kind ? ' ' + kind : ''} findings; +N is the points of the total its fix gains, dearest first)`);
    process.exit(0);
  }
  const t0 = Date.now(), h = health();
  const L = logic();
  h.trend = trendSummary();
  if (CHECK) {
    if (L.stale) { console.log('STALE — data/logic-health.json is older than ' + (L.newer.join(', ') || 'missing') + ': run node tools/logic-health.js'); process.exit(1); }
    const now = read('data/health.json');
    if (now === JSON.stringify(h) + '\n') { console.log('OK — data/health.json is current (' + h.score + '%).'); process.exit(0); }
    console.log('FAILED — data/health.json is stale: run node tools/health.js'); process.exit(1);
  }
  trendAppend(h); h.trend = trendSummary();
  fs.writeFileSync(OUT, JSON.stringify(h) + '\n');
  console.log(h.next);
  console.log(`wrote data/health.json: ${h.score}% — ${MEANS} (${h.rules.length} rules${L.stale ? '; Find logic STALE' : ''}) in ${Date.now() - t0} ms`);
  console.log('  by group: ' + Object.keys(GROUPS).map(g => `${GROUPS[g]} ${h.parts[g]}% (${h.areas[g].rules} rules)`).join(', '));
  if (process.argv.includes('-v')) h.rules.forEach(r => console.log(`  ${r.group.padEnd(8)} ${String(r.ok).padStart(6)}/${String(r.of).padEnd(6)} ${(r.unit || '').padEnd(36)} ${r.id}: ${r.label}`));
  const rb = h.rulebook; console.log(`  rulebook: ${rb.checked}/${rb.rules} rules with a check, ${rb.tied}/${rb.checks} checks tied to a rule, ${rb.once}/${rb.rules} stated once; untied: ${rb.untied.join(' ') || 'none'}`);
  console.log(`  owner questions: ${h.ownerQuestions.open} open of ${h.ownerQuestions.of}`);
  console.log('  one place: ' + h.onePlace.map(f => f.name + ' ' + f.status).join(' · '));
  console.log('  findings: ' + Object.keys(h.counts).map(k => k + ' ' + h.counts[k]).join(', '));
  h.top.forEach((t, i) => console.log(`  ${i + 1}. −${t.cost} ${t.say}`));
  console.log('  (every rule: node tools/health.js -v)');
}
