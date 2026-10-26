#!/usr/bin/env node
/* @family. — check-anims.js THE TEACHING ANIMATIONS LIVE IN THE TEXTBOOKS, ONE SOURCE EACH; THE SPLASH THAT DREW THEM IS GONE (466). */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

/* ---------- THE ONE READER OF THE ROWS § */
function readAnimRows(root) {
  const p = path.join(root || ROOT, 'data', 'textbooks.json');
  const out = [];
  fs.readFileSync(p, 'utf8').split('\n').forEach((raw, i) => {
    const s = raw.trim().replace(/,$/, '');
    if (!s.startsWith('{')) return;
    let r = null;
    try { r = JSON.parse(s); } catch (e) { return; }
    if (r && Object.prototype.hasOwnProperty.call(r, 'anim')) out.push(Object.assign({ line: i + 1 }, r));
  });
  return out;
}
const animRow = (id, root) => readAnimRows(root).find(r => r.anim === id) || null;
module.exports = { readAnimRows, animRow };

if (require.main === module) main().catch(e => { console.log('COULD NOT RUN — ' + (e && e.stack || e)); process.exit(1); });

async function main() {
  const fail = [], said = [];
  const { JSDOM } = require('jsdom');
  const page = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const order = [...((/window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(page) || [])[1] || '').matchAll(/'([^']+)'/g)].map(m => m[1]);
  if (!order.length) { console.log('COULD NOT RUN — window.FILES is not in index.html, so the app could not be loaded'); process.exit(1); }
  const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  const books = readJson('data/textbooks.json');
  const splashes = readJson('data/settings/splashes.json');

  /* ================================ READ, FROM THE FILES ======================================== */
  const rows = readAnimRows();
  const css0 = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const shellSrc = fs.readFileSync(path.join(ROOT, 'js', 'shell.js'), 'utf8');
  const jsApp = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js') && !f.startsWith('check') && f !== '_scope.js')
    .map(f => ({ f, src: fs.readFileSync(path.join(ROOT, 'js', f), 'utf8') }));
  const EL = { line: 'nline' };                                  // the one whose element id was not its name

  /* ---------- 1. ONE ANIMATION, ONE CHAPTER, ONE ROW IN THE SHEET § */
  const teachRows = splashes.filter(r => r.kind === 'proof' || r.kind === 'tool');
  teachRows.forEach(r => {
    const n = rows.filter(x => x.anim === r.splash_id).length;
    if (n !== 1) fail.push(r.splash_id + ' (' + r.kind + ' in data/settings/splashes.json) is in ' + n + ' textbook rows — a teaching animation lives in exactly one chapter');
  });
  rows.forEach(r => {
    const sh = splashes.find(x => x.splash_id === r.anim);
    if (!sh) fail.push(r.anim + ' (data/textbooks.json line ' + r.line + ') has no row in data/settings/splashes.json — the sheet can never retire it');
    else {
      if (sh.kind !== 'proof' && sh.kind !== 'tool') fail.push(r.anim + ' is kind "' + sh.kind + '" in the sheet — a textbook animation is a proof or a tool');
      if (sh.name !== r.title) fail.push(r.anim + ': the sheet calls it "' + sh.name + '" and its page is titled "' + r.title + '"');
    }
  });

  /* ---------- 2. NOTHING OF IT LEFT WHERE IT USED TO BE § */
  const prefixOf = {};
  const htmlNoComments = page.replace(/<!--[\s\S]*?-->/g, '');
  const cssNoComments = css0.replace(/\/\*[\s\S]*?\*\//g, '');
  rows.forEach(r => {
    const id = r.anim;
    const cls = [...String(r.html).matchAll(/\sclass="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(Boolean).filter(c => c !== 'an-' + id);
    const pre = cls.length ? cls[0].split('-')[0] : '';
    prefixOf[id] = pre;
    const hunt = [['splash-' + (EL[id] || id), 'its old root id'], ['an-' + id, 'its root class']];
    if (pre) hunt.push(['.' + pre + '-', 'its prefix as a class'], ['@keyframes ' + pre + '-', 'its keyframes'], ['class="' + pre + '-', 'its prefix in markup']);
    [['index.html', htmlNoComments], ['style.css', cssNoComments]].concat(jsApp.map(j => ['js/' + j.f, j.src.replace(/\/\*[\s\S]*?\*\//g, '')]))
      .forEach(([file, text]) => hunt.forEach(([needle, what]) => {
        const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (needle.endsWith('-') || needle.startsWith('class=') ? '' : '(?![\\w-])'));
        if (re.test(text)) fail.push(id + ': ' + what + ' (`' + needle + '`) is still in ' + file + ' — the row is the one place it lives');
      }));
  });
  const seenPre = {};
  Object.entries(prefixOf).forEach(([id, p]) => {
    if (!p) { fail.push(id + ': its markup has no class but its root — nothing for its rules to anchor on'); return; }
    if (p === 'an' || p === 'tb') fail.push(id + ': its prefix `' + p + '-` is the app\'s own (`an-` roots, `tb-` textbook pages)');
    if (seenPre[p]) fail.push(id + ' and ' + seenPre[p] + ' share the prefix `' + p + '-` — one rule could reach both drawings');
    seenPre[p] = id;
  });

  /* ---------- 3. THE ROW'S MARKUP: ONE ROOT, KNOWN ELEMENTS, NOTHING THAT RUNS --------------------- */
  const ELEMENTS = new Set(['div', 'span', 'b', 'i', 'u', 's', 'sup', 'sub', 'svg', 'g', 'path', 'rect', 'circle', 'ellipse',
    'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'clipPath', 'mask', 'use', 'linearGradient', 'radialGradient', 'stop']);
  const { JSDOM: J0 } = require('jsdom');
  const doc0 = new J0('<!doctype html><body></body>').window.document;
  const allIds = {};
  [...htmlNoComments.matchAll(/\sid="([^"]+)"/g)].forEach(m => { allIds[m[1]] = (allIds[m[1]] || []).concat('index.html'); });
  rows.forEach(r => {
    const id = r.anim, pre = prefixOf[id], h = String(r.html);
    const where = id + ' (line ' + r.line + ')';
    if (!/^<div class="an-[a-z0-9]+" aria-hidden="true">/.test(h)) fail.push(where + ': the markup does not open `<div class="an-' + id + '" aria-hidden="true">` at its very first character');
    else if (!h.startsWith('<div class="an-' + id + '" ')) fail.push(where + ': its root is not `an-' + id + '`');
    const box = doc0.createElement('template');
    box.innerHTML = h;
    const top = [...box.content.childNodes].filter(n => n.nodeType !== 3 || n.textContent.trim());
    if (top.length !== 1 || top[0].nodeType !== 1) fail.push(where + ': the markup is ' + top.length + ' things, not one root');
    if (/sp-sig|@family\./i.test(h)) fail.push(where + ': the markup signs itself — the splash adds `@family.`, a chapter page has its book\'s name');
    [...box.content.querySelectorAll('*')].forEach(el => {
      const tag = el.localName;
      if (!ELEMENTS.has(tag)) fail.push(where + ': <' + tag + '> is not one of the elements a drawing may use');
      [...el.attributes].forEach(a => {
        if (/^on/i.test(a.name)) fail.push(where + ': <' + tag + ' ' + a.name + '> — a drawing runs nothing');
        if (/javascript:/i.test(a.value)) fail.push(where + ': a `javascript:` in ' + a.name);
        if (a.name === 'style') a.value.split(';').map(d => d.trim()).filter(Boolean).forEach(d => {
          if (/^--[\w-]+\s*:/.test(d)) return;
          if (new RegExp('^animation-name\\s*:\\s*' + pre + '-[\\w-]+$').test(d)) return;
          fail.push(where + ': style="' + d + '" — inline, a drawing sets custom properties and nothing else (an inline declaration beats the reduced-motion rule)');
        });
        if ((a.name === 'href' || /url\(/.test(a.value)) && /#/.test(a.value)) {
          const ref = (/#([\w-]+)/.exec(a.value) || [])[1];
          if (ref && !box.content.querySelector('[id="' + ref + '"]')) fail.push(where + ': ' + a.name + ' points at #' + ref + ', which is not in this drawing');
        }
      });
      if (el.id) {
        if (!el.id.startsWith(pre + '-')) fail.push(where + ': id="' + el.id + '" does not carry the prefix `' + pre + '-`');
        (allIds[el.id] = allIds[el.id] || []).push(id);
      }
      const c = el.getAttribute('class');
      if (c && el !== top[0]) c.split(/\s+/).filter(Boolean).forEach(k => { if (!k.startsWith(pre + '-')) fail.push(where + ': class "' + k + '" does not carry the prefix `' + pre + '-`'); });
    });
  });
  Object.entries(allIds).filter(([k, v]) => v.length > 1).forEach(([k, v]) => fail.push('the id "' + k + '" is in ' + v.join(' and ') + ' — getElementById returns whichever came first'));

  /* ---------- 4. THE ROW'S CSS: EVERY RULE ANCHORED ON ITS OWN DRAWING § */
  const blocks = (src, s0, e0) => {
    const out = []; let i = s0 || 0; const e = e0 == null ? src.length : e0;
    while (i < e) {
      if (/\s/.test(src[i])) { i++; continue; }
      if (src.startsWith('/*', i)) { out.push({ k: 'comment' }); i = src.indexOf('*/', i + 2) + 2; continue; }
      let ob = i; while (ob < e && src[ob] !== '{' && src[ob] !== ';') ob++;
      if (src[ob] === ';') { out.push({ k: 'stmt', head: src.slice(i, ob).trim() }); i = ob + 1; continue; }
      let d = 1, j = ob + 1; while (j < e && d) { if (src[j] === '{') d++; else if (src[j] === '}') d--; j++; }
      const head = src.slice(i, ob).trim().replace(/\s+/g, ' ');
      out.push({ head, body: src.slice(ob + 1, j - 1), kids: /^@/.test(head) && !/^@keyframes/.test(head) ? blocks(src, ob + 1, j - 1) : null });
      i = j;
    }
    return out;
  };
  const splitSel = sel => { const o = []; let d = 0, cur = ''; for (const ch of sel) { if (ch === '(') d++; else if (ch === ')') d--; if (ch === ',' && !d) { o.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) o.push(cur.trim()); return o; };
  const RM = '@media (prefers-reduced-motion: reduce)';
  const kfSeen = {};
  for (const m of cssNoComments.matchAll(/@keyframes\s+([\w-]+)/g)) kfSeen[m[1]] = ['style.css'];
  let total = 0;
  rows.forEach(r => {
    const id = r.anim, pre = prefixOf[id], c = String(r.css), where = id + ' (line ' + r.line + ')';
    total += String(r.html).length + c.length;
    ['@import', '@font-face', ':root', 'url(', '!important', 'expression('].forEach(t => { if (c.indexOf(t) !== -1) fail.push(where + ': its CSS holds `' + t + '`'); });
    const moving = new Set(), stilled = new Set();
    const rule = (b, media) => {
      splitSel(b.head).forEach(part => {
        const left = part.split(/\s*[\s>+~]\s*/)[0];
        if (!(left.indexOf('.an-' + id) !== -1 || new RegExp('\\.' + pre + '-').test(left))) fail.push(where + ': `' + part + '` does not start from `.an-' + id + '` or a `.' + pre + '-` class — it could match outside the drawing');
        if (/#/.test(part)) fail.push(where + ': `' + part + '` names an id — the ids are renamed per drawing on a page, so a rule cannot know them');
        if (/(^|[\s>+~,(])(html|body)(?![\w-])/.test(part)) fail.push(where + ': `' + part + '` reaches the page itself');
        const anim = /(^|;|\s)animation(-name)?\s*:\s*([^;]+)/.exec(b.body);
        if (media === RM) { if (/(^|;|\s)animation\s*:\s*none\b/.test(b.body)) stilled.add(part); }
        else if (anim && !/^none\b/.test(anim[3].trim())) moving.add(part);
      });
    };
    blocks(c).forEach(b => {
      if (b.k === 'comment') { fail.push(where + ': a comment in its CSS — the why is in the script that writes it and in docs/history/304'); return; }
      if (b.k === 'stmt') { fail.push(where + ': `' + b.head.slice(0, 40) + '` — no at-rule statements'); return; }
      if (/^@keyframes /.test(b.head)) {
        const name = b.head.split(' ')[1];
        if (!name.startsWith(pre + '-')) fail.push(where + ': @keyframes ' + name + ' is not named `' + pre + '-…`');
        (kfSeen[name] = kfSeen[name] || []).push(id);
        return;
      }
      if (/^@/.test(b.head)) {
        if (b.head !== RM) { fail.push(where + ': `' + b.head + '` — the only @media a drawing has is `' + RM + '`'); return; }
        b.kids.forEach(k => { if (k.k === 'comment') fail.push(where + ': a comment in its CSS'); else if (k.kids || /^@/.test(k.head || '')) fail.push(where + ': an at-rule inside its reduced-motion block'); else rule(k, RM); });
        return;
      }
      rule(b, '');
    });
    if (!stilled.size && moving.size) fail.push(where + ': no reduced-motion block with `animation: none` — under the global `.01ms` rule its loop flickers');
  });
  Object.entries(kfSeen).filter(([k, v]) => v.length > 1).forEach(([k, v]) => fail.push('@keyframes ' + k + ' is defined in ' + v.join(' and ') + ' — the later one wins for both'));

  /* ---------- 5. NOTHING KEEPS A COPY FOR A SPLASH ANY MORE (466) -------------------------------- */
  if (/SPLASH_CACHE_|splashSync_/.test(shellSrc)) fail.push('js/shell.js keeps a splash copy again (SPLASH_CACHE_* or splashSync_) — the splash went in 466 and nothing would draw it');
  said.push(rows.length + ' animation rows, ' + Object.keys(prefixOf).length + ' prefixes, ' + total + ' characters, drawn only when a chapter opens');

  /* ---------- 6. A ROW A SCRIPT WRITES: THE SCRIPT IS THE SOURCE § */
  {
    const { spawnSync } = require('child_process');
    const os = require('os');
    const toolDir = path.join(ROOT, 'tools');
    const writers = fs.readdirSync(toolDir).filter(f => f.endsWith('.py') && f !== 'anim_row.py').sort()
      .map(f => ({ f, id: (/anim_row\.write_anim\(\s*'([a-z0-9]+)'/.exec(fs.readFileSync(path.join(toolDir, f), 'utf8')) || [])[1] }))
      .filter(t => t.id);
    const listed = ((/# WRITTEN BY A SCRIPT: ([a-z0-9 ]+)/.exec(fs.readFileSync(path.join(toolDir, 'anim_row.py'), 'utf8')) || [])[1] || '').trim().split(/\s+/).filter(Boolean);
    const made = writers.map(t => t.id).sort();
    if (listed.slice().sort().join() !== made.join()) fail.push('tools/anim_row.py says "WRITTEN BY A SCRIPT: ' + listed.join(' ') + '" and the scripts that call write_anim write ' + made.join(' ') + ' — the list people read to know which rows not to edit by hand is wrong');
    writers.forEach(t => { if (!rows.some(r => r.anim === t.id)) fail.push('tools/' + t.f + ' writes "' + t.id + '", and no row of data/textbooks.json has that id'); });
    const books0 = fs.readFileSync(path.join(ROOT, 'data', 'textbooks.json'), 'utf8');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-anims-'));
    try {
      fs.mkdirSync(path.join(tmp, 'tools')); fs.mkdirSync(path.join(tmp, 'data'));
      fs.copyFileSync(path.join(toolDir, 'anim_row.py'), path.join(tmp, 'tools', 'anim_row.py'));
      /* AND A SHARED KIT (`*_kit.py`, tools/cb_kit.py): a script may build its drawing with one, as it may write it with anim_row. */
      fs.readdirSync(toolDir).filter(f => /_kit\.py$/.test(f)).forEach(f => fs.copyFileSync(path.join(toolDir, f), path.join(tmp, 'tools', f)));
      const before = books0.split('\n');
      for (const t of writers) {
        fs.writeFileSync(path.join(tmp, 'data', 'textbooks.json'), books0);
        fs.copyFileSync(path.join(toolDir, t.f), path.join(tmp, 'tools', t.f));
        const run = spawnSync('python3', ['-I', path.join(tmp, 'tools', t.f)], { cwd: tmp, encoding: 'utf8', timeout: 60000 });
        if (run.error) { console.log('COULD NOT RUN — python3 would not start (' + run.error.message + '), so whether the ' + writers.length + ' scripts and their rows agree was NOT checked'); process.exit(1); }
        if (run.status !== 0) { fail.push('tools/' + t.f + ' fails on a copy of the books: ' + String(run.stderr || run.stdout).trim().split('\n').pop().slice(0, 160)); continue; }
        const after = fs.readFileSync(path.join(tmp, 'data', 'textbooks.json'), 'utf8');
        if (after === books0) continue;
        const moved = after.split('\n').map((l, i) => l === before[i] ? null : (/"anim":"([a-z0-9]+)"/.exec(l) || /"anim":"([a-z0-9]+)"/.exec(before[i] || '') || [])[1] || ('line ' + (i + 1))).filter(Boolean);
        fail.push('tools/' + t.f + ' rewrites ' + [...new Set(moved)].join(', ') + ' — the row and its script disagree. The script is the source: move a hand edit into it, or re-run it after changing it');
      }
    } finally { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} }
    said.push(writers.length + ' scripts write a row each (' + made.join(' ') + '); each, re-run on a copy of the books, leaves it byte for byte as it is');
  }

  /* ---------- THE WHOLE APP, IN ONE WINDOW, WITH NOTHING ANSWERING § */
  /* A STORE OF A KNOWN SIZE, so section 3 can leave exactly the room it means to: jsdom's default,
     said out loud, and counted the way jsdom counts it — every key and value, in characters. */
  const QUOTA = 5000000;
  const dom = new JSDOM(page.replace(/<script[\s\S]*?<\/script>/g, ''),
    { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/', storageQuota: QUOTA });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.fetch = () => new Promise(() => {});
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  try { w.HTMLMediaElement.prototype.pause = function () {}; w.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; } catch (e) {}
  const errs = [];
  w.onerror = m => errs.push(String(m));
  try {
    w.eval(order.map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n'));
  } catch (e) { console.log('COULD NOT RUN — the app threw while loading: ' + e.message); process.exit(1); }
  for (const f of ['splashForget_', 'ansLocalPut_']) {
    if (typeof w[f] !== 'function') { console.log('COULD NOT RUN — ' + f + ' is not a function in the loaded app'); process.exit(1); }
  }
  const LS = w.localStorage;
  const snap = () => { const o = {}; for (let i = 0; i < LS.length; i++) { const k = LS.key(i); o[k] = LS.getItem(k); } return o; };
  /* ---------- 3. A DEVICE STILL HOLDING THE OLD SPLASH'S COPY: IT GIVES WAY TO A CHILD'S WORK ------- */
  {
    const used = () => { let n = 0; for (let i = 0; i < LS.length; i++) { const k = LS.key(i); n += k.length + LS.getItem(k).length; } return n; };
    const ours = () => Object.keys(snap()).filter(k => k === 'splashAnims' || k === 'splashOff' || k.indexOf('splashAnim:') === 0);
    const ANSWER = 'y'.repeat(2000);
    LS.clear();
    LS.setItem('pad:q1', 'a drawing');
    LS.setItem('splashAnims', '{"f":1,"ids":["pyth"],"h":{}}'); LS.setItem('splashOff', '[]');
    LS.setItem('splashAnim:pyth', 'z'.repeat(400000));
    LS.setItem('pad:full', 'x'.repeat(QUOTA - used() - 'pad:full'.length - 500));
    w.ansLocalPut_('ans:q2', ANSWER);
    if (LS.getItem('ans:q2') !== ANSWER) fail.push('a child\'s answer refused by a store the old splash copy had filled was not written once the copy gave way (`ansLocalPut_` → `splashForget_`)');
    if (ours().length) fail.push('the old splash copy is still there after a child\'s answer needed its room: ' + ours().join(' '));
    if (LS.getItem('pad:q1') !== 'a drawing' || !LS.getItem('pad:full')) fail.push('giving way took a pad: key with it');
    LS.setItem('splashAnim:x', '1');
    w.splashForget_();
    if (ours().length) fail.push('splashForget_ (run at boot, when the phone is idle) left ' + ours().join(' '));
    said.push('a device still holding the old splash copy gives it up for a child\'s answer, and at boot');
    LS.clear();
  }
  if (errs.length) said.push('the app logged ' + errs.length + ' error(s) while loaded here (the network never answers): ' + errs.slice(0, 2).join(' | ').slice(0, 200));

  console.log('');
  said.forEach(s => console.log('  ' + s));
  if (fail.length) {
    console.log('\nBROKEN  (' + fail.length + ')');
    fail.forEach(f => console.log('  ' + f));
    console.log('\nFAILED — the teaching animations are not one source each, drawn as their rows.');
    process.exit(1);
  }
  console.log('\nOK — the books\' animations are one source each, and no splash keeps a copy of them.');
  process.exit(0);
}
