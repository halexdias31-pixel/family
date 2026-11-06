#!/usr/bin/env node
/* @family. — tools/health.js THE SITE'S ONE HEALTH SCORE (890), measured, never judged by AI. --check: write nothing, exit 1 when stale. */
/* Blends four parts into data/health.json (1040: AI cost raised from 10% to 20%, the other three scaled by 0.8/0.9):                 */
//   code stability (core)  32%  tools/stability.js, re-run here (cheap, reads the repo)
//   AI cost                20%  tools/ai-cost.js: read bytes, comments, tombstones, CLAUDE.md, search bytes, effort, test/note size, spread
//   Find logic             28%  data/logic-health.json, written by tools/logic-health.js (slow: walks the funnel). Never re-walked here;
//                               it is "stale" when any of its inputs is newer than it.
//   UI simplicity          20%  style.css, read here — 100 less a penalty per signal, each capped:
// important    0.05 per !important, cap 15
// pxlit        0.004 per px literal outside :root, cap 15
// colourlit    0.02 per hex/rgb()/hsl() colour literal outside :root and custom-property definitions, cap 15
// order        0.05 per property a later rule with the very same selector sets again (won by order alone), cap 10
//              (check/cascade.js needs a browser, so this is the cheap static half of it)
// selectors    0.002 per selector over 1500, cap 15
// zindex       0.5 per distinct z-index value over 5, cap 10
// position     0.01 per transform or position:absolute, cap 10
// FIND WORKLIST (920): §
// TOP OFFENDERS: every signal and Find rule priced in points of the OVERALL score it costs; the five dearest, one plain line each.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'health.json');
const CHECK = process.argv.includes('--check');
const WEIGHTS = { code: 0.32, logic: 0.28, ui: 0.20, cost: 0.20 };   /* cost (940): tools/ai-cost.js, what a change costs an AI to read */
const r1 = n => Math.round(n * 10) / 10;
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
/* WHEN A FILE LAST CHANGED: its last commit, or now when the working tree has it edited (a checkout's mtimes all say "just now"). */
const { execFileSync } = require('child_process');
const git = a => { try { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd(); } catch (e) { return ''; } };
const dirty = new Set(git(['status', '--porcelain']).split('\n').filter(Boolean).map(l => l.slice(3).split(' -> ').pop()));   /* a rename's new path (940) */
const mtime = f => dirty.has(f) ? Date.now() : Number(git(['log', '-1', '--format=%ct', '--', f])) * 1000 || 0;

/* WHAT THE FUNNEL WALK READS: a change to any of these makes data/logic-health.json stale. */
const FIND_FILES = require('./find-src.js').findFiles();
const PS_ = require('./piece-src.js'), ME_FILES = PS_.pieceFiles('me'), SHELL_FILES = PS_.pieceFiles('shell'), KP_FILES = PS_.pieceFiles('keypad');
const SPLIT_GROUPS = [{ old: 'js/find.js', files: FIND_FILES }, { old: 'js/me.js', files: ME_FILES }, { old: 'js/shell.js', files: SHELL_FILES }, { old: 'js/keypad.js', files: KP_FILES }];
const LOGIC_INPUTS = [...FIND_FILES, 'check/fixture.json', 'data/questions.json', 'data/textbooks.json', 'data/practicals.json',
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
  const fsrc = require('./find-src.js').findSrc(), work = [];
  const at = {};
  for (const m of fsrc.matchAll(/\{ field: '(\w+)',\s*label: '([^']+)'/g)) if (!at[m[1]]) at[m[1]] = { line: lineOf(fsrc, m.index), label: m[2] };
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
  /* EACH TAG A PILL LIKE ITS MENU CHIP (owner, 5 Nov): every .qtag rule keeps the chip's outline, radius token and padding; a rule that strips one fails. */
  [...css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).matchAll(/([^{}]*\.qtag\b(?![-\w\[])[^{}]*)\{([^}]*)\}/g)].filter(m => !/\.qtags?\s*\.\w|::?\w/.test(m[1].trim().split(/\s+/).pop())).forEach(m => {
    const b = m[2], why = [];
    if (/border(-color)?\s*:\s*[^;]*transparent|border\s*:\s*(0|none)/.test(b)) why.push('no outline');
    if (/border-radius\s*:/.test(b) && !/border-radius\s*:\s*var\(--btn-r\)/.test(b)) why.push('a radius other than the chip\'s --btn-r');
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
  [...FIND_FILES, ...SHELL_FILES].forEach(f => { const src = blank(read(f));
    for (const m of src.matchAll(ONE)) work.push({ kind: 'find-one-off', where: f + ':' + lineOf(src, m.index), say: m[0] }); });
  /* EVERY FACET VALUE (940): tools/facet-data.js reads all answers of every menu, not the walk's few; its findings are read here, never re-run. */
  ((jread('data/facet-health.json') || {}).findings || []).forEach(x => work.push({ kind: x.kind, where: 'menu ' + x.menu, say: '"' + x.value + '" ' + x.say }));
  return work;
}
const FIND_PENALTY = { 'menu-thin': [1, 15], 'answer-words': [0.2, 10], 'mangled-text': [0.5, 10], 'merged-value': [0.5, 10], 'tag-colour': [0.1, 10], 'menu-rule': [0.05, 15], 'tag-asked': [1, 10], 'find-one-off': [0.02, 10], 'merged-all': [0.5, 10], 'near-dup': [0.5, 10], 'words-all': [0.02, 5] };

/* UNIFORM (920): controls not built by the shared makers, each located. App files only; the makers' own files are exempt. */
function uniformWork() {
  const W = [], MAKERS = new Set(['js/tiles.js', ...SHELL_FILES]);
  const app = git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/check/.test(f) && !MAKERS.has(f));
  const css = read('style.css'), cssLines = css.split('\n');
  const jsAll = {};
  app.forEach(f => { const src = blank(read(f)); jsAll[f] = src;
    src.split('\n').forEach((l, i) => {
      const at = f + ':' + (i + 1);
      /* A FORM's or a keypad's button is a button; anything else wearing <button> is a hand-rolled tile. */
      if (/<button\b/.test(l) && !/\b(?:key|opt|choice|chip|pad|form|dlg|dialog|sheet|close|field)\b|type="submit"/.test(l)) W.push({ kind: 'raw-button', where: at, say: l.trim().slice(0, 120) });
      if (/class="tile(?:\s|")/.test(l)) W.push({ kind: 'hand-tile', where: at, say: 'a tile written by hand, not tile_(): ' + l.trim().slice(0, 100) });
      if (/style="[^"$]*[a-z-]+\s*:[^"$]*"/.test(l)) W.push({ kind: 'inline-style', where: at, say: (/style="[^"]*"/.exec(l) || [''])[0].slice(0, 100) });
      if (/(?:Loading|Please wait|Working)(?:…|\.\.\.)|class="[^"]*\bspinner\b|setAttribute\('aria-busy', 'true'\)/.test(l)) W.push({ kind: 'own-wait', where: at, say: 'a wait not via loading_(): ' + l.trim().slice(0, 100) });
    }); });
  /* A CLASS style.css styles that one app line uses and no other rule shares: one component's whole class, kept in mind for one place. */
  const used = {}; const blob = Object.values(jsAll).join('\n') + read('index.html') + read('js/tiles.js') + SHELL_FILES.map(read).join('');
  for (const m of blob.matchAll(/class="([^"$]+)"/g)) m[1].split(/\s+/).forEach(c => { used[c] = (used[c] || 0) + 1; });
  const ruled = {};
  cssLines.forEach((l, i) => { if (/\{/.test(l) && !/^\s*(?:@|--)/.test(l)) for (const m of l.split('{')[0].matchAll(/\.([a-zA-Z][\w-]*)/g)) (ruled[m[1]] = ruled[m[1]] || []).push(i + 1); });
  Object.keys(ruled).forEach(c => { if (ruled[c].length === 1 && used[c] === 1 && !new RegExp('[\'"`\\s.]' + c + '[\'"`\\s]').test(blob.replace(/class="[^"]*"/g, '')))
    W.push({ kind: 'once-class', where: 'style.css:' + ruled[c][0], say: `.${c} styles one place only` }); });
  /* THE SAME CONTROL, DIFFERENT LOOKS: border-radius and font-size of .tile, .chip and button rules. */
  ['tile', 'chip', 'button'].forEach(ctl => { const seen = {};
    const re = ctl === 'button' ? /(?:^|[\s,>])button(?=[\s,:{.[]|$)/ : new RegExp('\\.' + ctl + '(?![\\w-])');
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) { const sel = m[1].trim().split('\n').pop(); if (!re.test(sel.split(',').map(x => x.trim().split(/\s+/).pop()).join(','))) continue;
      for (const d of m[2].matchAll(/(border-radius|font-size|font-family)\s*:\s*([^;]+)/g)) { const k = d[1], v = d[2].trim();
        (seen[k] = seen[k] || {}); if (!seen[k][v]) seen[k][v] = lineOf(css, m.index + m[0].indexOf(d[0])); } }
    Object.keys(seen).forEach(k => { const vs = Object.keys(seen[k]); if (vs.length > 1) vs.slice(1).forEach(v => W.push({ kind: 'control-look', where: 'style.css:' + seen[k][v],
      say: `${ctl} ${k} ${v} (the first ${ctl} rule says ${vs[0]}; ${vs.length} different)` })); }); });
  return W;
}
const UNIFORM_PENALTY = { 'raw-button': [0.02, 5], 'hand-tile': [0.2, 5], 'inline-style': [0.02, 5], 'once-class': [0.005, 5], 'control-look': [0.1, 5], 'own-wait': [0.2, 5] };
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
  /* UPDATE CONTINUITY (970): data/update-health.json, from tools/update-health.js; a deploy must land without losing a place or a draft. */
  let u = null; try { u = JSON.parse(read('data/update-health.json')); } catch (e) { u = null; }
  if (u) (u.cases || []).filter(c => !c.pass).forEach(c => W.push({ kind: 'update-continuity', where: 'new build: ' + c.name, say: (c.why || []).join('; ') }));
  return { j, work: W };
}
const UX_PENALTY = { 'update-continuity': [5, 10], ux: [1, 10], question: [0.5, 10], a11y: [0.05, 5], console: [0.5, 5], 'card-tags': [0.5, 10],
  'tag-colour': [0.5, 10], 'element-box': [0.5, 10], 'attr-outside-tags': [0.5, 10], 'text-boxes': [0.5, 10], 'in-sync': [0.5, 10], 'odd-tags': [0.02, 10], 'dup-controls': [0.5, 10], 'chip-size': [0.5, 10], 'settings-work': [1, 10], 'returned-features': [0.5, 10] };
/* THE OWNER'S FOUR (1030), each its own named check, ideal 0, budget `owner` in structure-budgets.json; the drawn halves come from check/qcard.js. */
const OWNER_KINDS = { 'tag-colour': 1, 'element-box': 1, 'card-tags': 1, 'attr-outside-tags': 1, 'text-boxes': 1, 'in-sync': 1, 'odd-tags': 1, 'dup-controls': 1, 'chip-size': 1, 'settings-work': 1, 'returned-features': 1 };
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
  /* THE TOP BAR'S CONTROLS NEVER OVERLAP (owner, 6 Nov): the Business dot rides in #topbar-who's own row, and the bar's repaint keeps it there. */
  if (!/topbar-who/.test(fnOf('bizNeedsPaint_'))) add('js/records.js', "the Business dot is a fixed corner badge over the top bar's Sign out, not a control in #topbar-who's row");
  if (!/biz-dot/.test(fnOf('topbarPaint_'))) add('js/shell-pages.js', "topbarPaint_ rewrites #topbar-who and drops the Business dot");
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
  const wt = (/function qWholeTags_\([\s\S]*?\n\}/.exec(fsrc) || [''])[0];
  if (!/'marks'/.test(wt)) W.push({ kind: 'card-tags', where: 'js/find.js:' + lineOf(fsrc, Math.max(0, fsrc.indexOf('function qWholeTags_'))), say: 'a whole question\'s top tag line no longer carries each part\'s marks' });
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
  const work = uniformWork().concat(uxWork().work, ownerWork()), k = {};
  work.forEach(w => { k[w.kind] = (k[w.kind] || 0) + 1; });
  const PEN = Object.assign({}, UNIFORM_PENALTY, UX_PENALTY);
  Object.keys(PEN).forEach(id => S.push({ id, label: id + ' findings', count: k[id] || 0, weight: PEN[id][0], cap: PEN[id][1], off: r1(Math.min(PEN[id][1], (k[id] || 0) * PEN[id][0])) }));
  return { score: r1(Math.max(0, 100 - S.reduce((a, s) => a + s.off, 0))), signals: S.sort((a, b) => b.off - a.off), work };
}

/* CODE STRUCTURE (920): where the one-off cases live, line by line, on CORE app files (tiers.json). Capped per signal.
   It replaces stability's special/longfiles/longfns/duplicates, so nothing counts twice. */
// one-off   0.05 per if/case/ternary testing a kind, facet, field, col, screen, tab, id, type, which, mode or key against a string literal, cap 20
// long-fn   0.01 per line a top-level function runs over 80, cap 10
// big-file  0.001 per line a file runs over 1500, cap 10
// dup       0.02 per line of a 6+-line chunk already seen (normalised: trimmed, comments out), cap 10
// nest      0.05 per run of lines nested over 4 blocks deep inside a function, cap 10
// catch     an empty catch, listed for the fixer; priced by stability's `catches` (0.02 each), never again here
// deliberate a catch holding only a why-comment: a chosen fallback, as check-catches counts it; listed, never priced
const STRUCT = { 'one-off': [0.05, 20], 'long-fn': [0.01, 10], 'big-file': [0.001, 10], dup: [0.02, 10], nest: [0.05, 10], catch: [0.02, 0], deliberate: [0, 0] };
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
      if (/catch\s*(?:\(\s*\w*\s*\))?\s*\{\s*\}/.test(code)) push(file, i + 1, /catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(raw) ? 'catch' : 'deliberate', raw, 1);
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
  /* DEAD CODE, from stability's own check-dead run: one item per function nothing calls. */
  const dead = ((st.signals || []).find(x => x.id === 'dead') || {}).where || {};
  String(dead['check-dead'] || '').split(', ').filter(Boolean).forEach(d => { const m = /^(\w+) \(([\w.-]+)\)$/.exec(d);
    W.push({ kind: 'dead', part: 'code', where: m ? 'js/' + m[2] : d, say: (m ? m[1] : d) + ' is never called' }); });
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
  return { work: W, skipped, sizes };
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
  /* CARD TILE ROWS (950): cardTiles_ is the one; a card drawer drawing its own tile-row is another, and so is a core row out of order. */
  const tsrc = read('js/tiles.js'), cv = [{ where: fnAt('cardTiles_', ['js/tiles.js']) || 'js/tiles.js', say: 'cardTiles_' }];
  const core = (/const CARD_CORE_ = \[([^\]]*)\]/.exec(tsrc) || [])[1] || '';
  if (core.replace(/\s/g, '') !== "'share','fav','suggest','top'" || !/function cardTiles_[^]*?const mine = cardCore_\(x\) \+ cardExtras_\(x\)/.test(tsrc))
    cv.push({ where: 'js/tiles.js', say: 'the core row is not Share, Save, Suggest, Top first on every card' });
  [...seen.keys()].forEach(fn => { const at = fnAt(fn); if (!at) return; const src = read(at.split(':')[0]), i = src.search(new RegExp('function ' + fn + '\\s*\\('));
    if (/class="tile-row/.test(src.slice(i, src.indexOf('\n}', i)))) cv.push({ where: at, say: fn + ' draws its own tile row' }); });
  add('cardrow', 'Card tile rows', 1, 'ui', cv);
  /* TILE AND BUTTON MAKERS: functions whose name says they make one. tile_ is the one. */
  const makers = [];
  app.forEach(f => { const src = read(f); for (const m of src.matchAll(/function (\w*(?:[Tt]ile|Btn|Button)\w*)\s*\(/g)) if (!/Row|row_|Set|Paint|Look|Html_$|Join/.test(m[1])) makers.push({ name: m[1], where: f + ':' + lineOf(src, m.index) }); });
  makers.sort((a, b) => (a.name === 'tile_' ? -1 : b.name === 'tile_' ? 1 : 0));
  add('maker', 'Tile and button makers', 1, 'ui', makers.map(m => ({ where: m.where, say: m.name })));
  /* LIST-ROW STYLES: the base classes style.css gives a row of a list. */
  const css = read('style.css'), rows = new Map();
  for (const m of css.matchAll(/(?:^|[\s,}])\.((?:[a-z]+-)?row)(?=[\s,{.:[])/g)) if (!/tile-row|row-?$/.test(m[1] + '-x') || true) if (!rows.has(m[1]) && m[1] !== 'tile-row') rows.set(m[1], 'style.css:' + lineOf(css, m.index + 1));
  const rv = [...rows.keys()].sort((a, b) => (a === 'row' ? -1 : b === 'row' ? 1 : 0));
  add('listrow', 'List-row styles', 1, 'ui', rv.map(c => ({ where: rows.get(c), say: '.' + c })));
  /* SETTINGS ROW SHAPES: the row builders the settings screens use. */
  const sv = [];
  ['js/settings.js', 'js/staff.js', ...ME_FILES].forEach(f => { const src = read(f); for (const m of src.matchAll(/function (\w*[Rr]ow\w*)\s*\(/g)) sv.push({ where: f + ':' + lineOf(src, m.index), say: m[1] }); });
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
const VARIETY_PENALTY = { 'variety-qpage': [1.1, 30], 'variety-drawer': [0.2, 5], 'variety-maker': [0.2, 5], 'variety-listrow': [0.1, 5], 'variety-setrow': [0.05, 5], 'variety-wait': [0.5, 5], 'variety-cardrow': [0.2, 5], 'variety-textbox': [0.2, 5] };
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
const EXTRA_PENALTY = { field: [2, 10], answer: [0.5, 10], 'menu-sense': [0.1, 10], backend: [2, 10], resilience: [5, 10], dead: [0, 0], size: [1, 10],
  a11y: [0.05, 5], console: [0.5, 5], qengine: [0.5, 5], variety: [0, 0] };

function health() {
  const st = require('./stability.js').stability();
  const L = logic(), U = ui(), S = structure();
  /* THE CODE PART: stability's signals less the four the structure signals replace, plus the structure signals. */
  const kept = (st.signals || []).filter(s => !REPLACED.has(s.id));
  const sig = kept.concat(Object.keys(STRUCT).filter(k => k !== 'catch' && k !== 'deliberate').map(k => ({ id: k, label: SAY_KIND[k], count: S.totals[k].count, off: S.totals[k].off })));
  const code = r1(Math.max(0, 100 - sig.reduce((a, s) => a + s.off, 0)));
  const work = findWork(L), kinds = {};
  work.forEach(w => { kinds[w.kind] = (kinds[w.kind] || 0) + 1; });
  const fpen = Object.keys(FIND_PENALTY).map(k => ({ id: k, count: kinds[k] || 0, off: r1(Math.min(FIND_PENALTY[k][1], (kinds[k] || 0) * FIND_PENALTY[k][0])) }));
  const walk = L.j && typeof L.j.score === 'number' ? L.j.score : 0;
  const X = extraWork(st), xk = {};
  X.work.forEach(w => { const k = w.part + '|' + w.kind; xk[k] = (xk[k] || 0) + 1; });
  /* dead is already priced by stability's `dead`; it is listed here, never charged twice. */
  const xpen = Object.keys(xk).map(k => { const [part, id] = k.split('|'), P = EXTRA_PENALTY[id] || VARIETY_PENALTY[id] || [0.1, 5];
    return { part, id, count: xk[k], off: r1(Math.min(P[1], xk[k] * P[0])) }; });
  const less = part => xpen.filter(p => p.part === part).reduce((a, p) => a + p.off, 0);
  const lscore = r1(Math.max(0, walk - fpen.reduce((a, p) => a + p.off, 0) - less('logic')));
  const codeX = r1(Math.max(0, code - less('code')));
  const uiX = r1(Math.max(0, U.score - less('ui')));
  const C = require('./ai-cost.js').aiCost();
  const overall = r1(WEIGHTS.code * codeX + WEIGHTS.logic * lscore + WEIGHTS.ui * uiX + WEIGHTS.cost * C.score);
  const off = [];
  sig.forEach(s => s.off > 0 && off.push({ part: 'code', id: s.id, cost: r1(s.off * WEIGHTS.code),
    say: (SAY[s.id] ? SAY[s.id](s.count) : s.label + ': ' + s.count) }));
  U.signals.forEach(s => s.off > 0 && off.push({ part: 'ui', id: s.id, cost: r1(s.off * WEIGHTS.ui), say: SAY[s.id] ? SAY[s.id](s.count) : `UI: ${s.count} ${s.id} findings (node tools/health.js --list --kind ${s.id}).` }));
  const q = (L.j && L.j.questions) || 0;
  ((L.j && L.j.rules) || []).forEach(r => r.count > 0 && q && off.push({ part: 'logic', id: r.id,
    cost: r1(r.count / q * 100 * WEIGHTS.logic), say: `Find: ${r.count} of ${q} questions break a rule — ${r.label}.` }));
  fpen.forEach(p => p.off > 0 && off.push({ part: 'logic', id: p.id, cost: r1(p.off * WEIGHTS.logic), say: `Find: ${p.count} ${p.id} findings (node tools/health.js --list --kind ${p.id}).` }));
  xpen.forEach(p => { if (!(p.off > 0)) return; const v = /^variety-(\w+)$/.exec(p.id), F = v && VARIETY_LAST && VARIETY_LAST[v[1]];
    off.push({ part: p.part, id: p.id, cost: r1(p.off * WEIGHTS[p.part]), say: F ? `${F.label}: ${F.count - F.ideal} past the ideal ${F.ideal} (node tools/health.js --list --kind ${p.id})` : `${p.count} ${p.id} findings (node tools/health.js --list --kind ${p.id}).` }); });
  C.signals.forEach(s => s.off > 0 && off.push({ part: 'cost', id: s.id, cost: r1(s.off * WEIGHTS.cost), say: 'AI cost: ' + s.say + '.' }));
  off.sort((a, b) => b.cost - a.cost || a.id.localeCompare(b.id));
  /* DO THIS NEXT (920): the one change worth most points, in a sentence a person can act on. */
  const best = off[0];
  const next = best ? `Do this next: ${best.say.replace(/\.$/, '')} — fixing it is worth up to ${best.cost} points (${best.part}).` : 'Do this next: nothing — every signal is clean.';
  const counts = {}; Object.keys(S.totals).forEach(k => { counts[k] = S.totals[k].count; });
  return {
    v: 2, score: overall, weights: WEIGHTS,
    parts: { code: codeX, logic: lscore, ui: uiX, cost: C.score }, aiCost: { avgRead: C.avgRead, commentRatio: C.commentRatio, tombstones: C.tombstones.length, claudeLines: C.claudeLines, searchBytes: C.searchBytes, effort: (({ commits, medianLines, worstLines, medianFiles, worstFiles, testBytes, testBiggest, historyBytes, historyBiggest, bigNotes, spread }) => ({ commits, medianLines, worstLines, medianFiles, worstFiles, testBytes, testBiggest, historyBytes, historyBiggest, bigNotes: bigNotes.length, spread }))(C.effort), top: C.top.slice(0, 5) }, next, variety: VARIETY_LAST, qengine: (() => { const Q = jread('data/qengine-health.json'); return Q ? { moved: Q.moved, of: Q.of, proofs: Object.fromEntries(Object.keys(Q.proofs).map(k => [k, Q.proofs[k].pass + '/' + Q.proofs[k].cases])) } : null; })(), skipped: X.skipped, firstDownloadKB: Math.round(X.sizes.total / 1024),
    logicStale: L.stale, logicWalk: walk, find: fpen, ui: U.signals, structure: S.totals, counts,
    top: off.slice(0, 5), all: off,
    worklist: S.findings, work: work.concat(U.work, X.work.map(w => ({ kind: w.kind, where: w.where, say: w.say }))),
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
    const was = piece ? (headOf(G.old) || G.files.map(headOf).join('')) : git(['show', 'HEAD:' + f]);
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
  if (m) { const now = Number((/(\d+) empty catch blocks/.exec(execFileSync(process.execPath, ['js/check-catches.js'], { cwd: ROOT, encoding: 'utf8' })) || [])[1]);
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
    const W = structure().findings.concat(findWork(logic()).concat(ui().work, extraWork(require('./stability.js').stability()).work).map(w => ({ file: w.where.replace(/:\d+$/, ''), line: (/:(\d+)$/.exec(w.where) || [])[1] || '-', kind: w.kind, text: w.say })))
      .filter(f => !kind || f.kind === kind);
    W.slice(0, n).forEach(f => console.log(`${f.file}:${f.line}  ${f.kind}  ${f.text}`));
    console.log(`(${Math.min(n, W.length)} of ${W.length}${kind ? ' ' + kind : ''} findings, dearest first)`);
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
  console.log(`wrote data/health.json: ${h.score}% (code ${h.parts.code}, Find logic ${h.parts.logic}${L.stale ? ' STALE' : ''}, UI ${h.parts.ui}) in ${Date.now() - t0} ms`);
  console.log('  findings: ' + Object.keys(h.counts).map(k => k + ' ' + h.counts[k]).join(', '));
  h.top.forEach((t, i) => console.log(`  ${i + 1}. −${t.cost} ${t.say}`));
}
