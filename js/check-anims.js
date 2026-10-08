#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-anims.js

   THE TEACHING ANIMATIONS LIVE IN THE TEXTBOOKS, AND THE LOADING SCREEN DRAWS THE BOOKS' COPY.

   ASKED FOR AS "Add the animations from loading to respective subject text books. Matter of fact the
   source for the animations should be in text books. The animation from loading screen are pulling
   and syncing from the text book animations." — the owner, 8 Oct.

   So a teaching animation (a proof, a law, a process) is one row of data/textbooks.json, under the
   chapter it teaches, holding its markup and its CSS once. The chapter draws it (`textbookAnimPart_`
   in find.js); a load keeps a copy on the device (`splashSync_` in shell.js); and the picker in
   index.html draws the splash from that copy while the page is still parsing. Three readers of one
   source, and this is what keeps them one source:

   READ, FROM THE FILES:
     · every proof or tool in data/settings/splashes.json is in exactly one chapter, and every row is
       in the sheet under the name its page carries;
     · nothing of any of them is left in index.html, style.css or the app's scripts;
     · each row's markup is one `an-<id>` root of known elements, unsigned, running nothing, every
       class and id carrying its own prefix, and no prefix shared;
     · each row's CSS is anchored on its own root or prefix, holds only its keyframes (named by its
       prefix, unique everywhere) and its reduced-motion block — which stills everything that moves —
       and nothing that reaches the page (`html`, `body`, an id, `!important`, `url(`);
     · together they fit SPLASH_CACHE_MAX, and the picker reads the shape the sync writes.

   RUN, NOT READ — the real `libraryExtras_`, `animHash_` and `splashSync_` and the real picker, in a
   jsdom window holding the whole app:
     · every record the sync keeps is its row's markup and CSS byte for byte, in the books' order;
     · a changed drawing replaces the kept one and its hash; a deleted row deletes its key;
     · a kept copy of the wrong shape, a damaged record or a hash that does not match is never drawn —
       the splash falls back to an inline one, and a damaged copy drops its index;
     · out of storage on one drawing leaves that one out and every `pad:` and `ans:` key untouched;
     · a books or splashes fetch that came back empty changes nothing;
     · the picker draws each kept animation as its row, signed, with its row's CSS.

     node js/check-anims.js
================================================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

/* ---------- THE ONE READER OF THE ROWS -------------------------------------------------------------
   `check-css.js`, `check-splash-loops.js` and `check-flow.js` read an animation's markup and CSS from
   here, the way `check-marks-load.js` is the one cutter of the marking functions — so there is one
   answer to "where is the sieve's markup now" and it is the row. One object per line, as
   `check-textbooks.js` reads the file; `line` is the file's own line number. */
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
  const picker = (/<script id="pick-splash">([\s\S]*?)<\/script>/.exec(page) || [])[1];
  if (!picker) { console.log('COULD NOT RUN — index.html has no <script id="pick-splash">'); process.exit(1); }
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

  /* ---------- 1. ONE ANIMATION, ONE CHAPTER, ONE ROW IN THE SHEET ----------------------------------
     A teaching splash in data/settings/splashes.json (kind proof or tool) with no row is a splash
     that can never be drawn; with two, it is in two chapters and the splash gets whichever the sync
     met last. A row with no sheet row can never be retired. The sheet's `name` is the page's title. */
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

  /* ---------- 2. NOTHING OF IT LEFT WHERE IT USED TO BE ----------------------------------------------
     Its root's old id, its new root class, its prefix as a class or a keyframe — in index.html,
     style.css or the app's own scripts. A rule left behind in style.css is a second copy that wins or
     loses by the cascade; a class left in a script is a script reaching into a drawing it does not own. */
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

  /* ---------- 4. THE ROW'S CSS: EVERY RULE ANCHORED ON ITS OWN DRAWING ---------------------------------
     Two at-rules (its keyframes, its reduced-motion block), every selector starting from its root or
     its prefix, no way to reach the page around it, no `!important` to win against it. */
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

  /* ---------- 5. WHAT THE DEVICE KEEPS FITS, AND THE PICKER READS THE SHAPE THE SYNC WRITES -------- */
  const MAX = +((/const SPLASH_CACHE_MAX = (\d+);/.exec(shellSrc) || [])[1] || 0);
  const F = +((/const SPLASH_CACHE_F = (\d+);/.exec(shellSrc) || [])[1] || 0);
  if (!MAX || !F) fail.push('SPLASH_CACHE_MAX or SPLASH_CACHE_F is not in js/shell.js — the cache was NOT measured');
  if (MAX && total > MAX) fail.push('the books\' animations come to ' + total + ' characters, past SPLASH_CACHE_MAX ' + MAX + ' — the last of them would never reach the splash');
  const pf = /idx\.f === (\d+)/.exec(picker);
  if (!pf) fail.push('the picker does not check the kept copy\'s shape (`idx.f === N`)');
  else if (F && +pf[1] !== F) fail.push('the picker reads a kept copy of shape ' + pf[1] + ' and the sync writes SPLASH_CACHE_F = ' + F + ' — no device would ever draw one');
  said.push(rows.length + ' animation rows, ' + Object.keys(prefixOf).length + ' prefixes, ' + total + ' characters of ' + MAX + ' kept; the picker reads shape ' + (pf ? pf[1] : '?') + ', the sync writes ' + F);

  /* ---------- THE WHOLE APP, IN ONE WINDOW, WITH NOTHING ANSWERING -------------------------------
     Every script in index.html's order, as `check-flow.js` loads it, so the functions run are the ones
     a phone runs. The network never answers, so `load()` waits for ever and nothing it would do
     afterwards can write to the storage this check is reading. */
  const dom = new JSDOM(page.replace(/<script[\s\S]*?<\/script>/g, ''),
    { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
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
    w.eval(order.map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n')
      + '\n;window.__a = { F: SPLASH_CACHE_F, MAX: SPLASH_CACHE_MAX };');
  } catch (e) { console.log('COULD NOT RUN — the app threw while loading: ' + e.message); process.exit(1); }
  for (const f of ['libraryExtras_', 'animHash_', 'splashSync_']) {
    if (typeof w[f] !== 'function') { console.log('COULD NOT RUN — ' + f + ' is not a function in the loaded app'); process.exit(1); }
  }
  const LS = w.localStorage;
  const snap = () => { const o = {}; for (let i = 0; i < LS.length; i++) { const k = LS.key(i); o[k] = LS.getItem(k); } return o; };
  const sync = rows => w.splashSync_(w.libraryExtras_({}, { textbooks: rows }), { textbooks: rows, 'settings/splashes': splashes });
  const index = () => { try { return JSON.parse(LS.getItem('splashAnims') || 'null'); } catch (e) { return 'unreadable'; } };
  const rec = id => { try { return JSON.parse(LS.getItem('splashAnim:' + id) || 'null'); } catch (e) { return 'unreadable'; } };
  const on_ = v => /^(true|yes|1|y|on|)$/i.test(String(v == null ? '' : v).trim());
  const SIG = '<div class="sp-sig">@family.</div>';
  /* WHAT THE ROW'S MARKUP PARSES TO, signed — compared as the parser leaves it rather than as text,
     because `<rect/>` comes back `<rect></rect>` and `&deg;` comes back `°` whoever parses it. */
  const parsed = h => { const d = w.document.createElement('div'); d.innerHTML = h.replace(/<\/div>$/, SIG + '</div>'); return d.firstElementChild ? d.firstElementChild.outerHTML : ''; };

  /* THE REAL PICKER, made to choose `id` the app's own way: everything else retired in `splashOff`. */
  const sp = w.document.getElementById('splash');
  const resetSplash = () => {
    sp.className = 'is-tag';
    [...sp.querySelectorAll(':scope > [class|="an"]')].forEach(e => e.remove());
    [...w.document.head.querySelectorAll('style[data-anim]')].forEach(e => e.remove());
  };
  const inline = (() => {
    const a = picker.indexOf("var kinds = ['tag'"), b = picker.indexOf('];', a);
    return a < 0 ? [] : [...picker.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/'([a-z0-9]+)'/g)].map(m => m[1]);
  })();
  if (!inline.length) fail.push("the picker has no `var kinds = ['tag', …]` literal — the inline pool was NOT read");
  const pick = id => {
    resetSplash();
    const ids = (index() && index().ids) || [];
    LS.setItem('splashOff', JSON.stringify(inline.concat(ids).filter(k => k !== id).map(k => 'is-' + k)));
    const was = w.Math.random;
    w.Math.random = () => 0;
    try { w.eval(picker); } finally { w.Math.random = was; }
    const root = sp.querySelector(':scope > [class|="an"]');
    const st = w.document.head.querySelector('style[data-anim="' + id + '"]');
    return { cls: sp.className, root: root ? root.outerHTML : null, css: st ? st.textContent : null, sig: !!(root && root.querySelector('.sp-sig')) };
  };

  /* ---------- 1. THE REAL BOOKS: EVERY KEPT DRAWING IS ITS ROW ---------------------------------------- */
  LS.clear();
  const real = books.filter(r => r && Object.prototype.hasOwnProperty.call(r, 'anim') && on_(r.active));
  sync(books);
  const idx = index();
  if (real.length) {
    if (!idx || !Array.isArray(idx.ids)) fail.push('a sync over the real books kept no index');
    else {
      if (idx.f !== w.__a.F) fail.push('the index says f = ' + idx.f + ', and SPLASH_CACHE_F is ' + w.__a.F);
      if (idx.ids.join() !== real.map(r => r.anim).join()) fail.push('the kept ids are ' + idx.ids.join(' ') + ' — the books have ' + real.map(r => r.anim).join(' ') + ', in that order');
      real.forEach(r => {
        const k = rec(r.anim);
        if (!k || k === 'unreadable') { fail.push(r.anim + ': no kept record'); return; }
        if (k.html !== r.html) fail.push(r.anim + ': the kept markup is not the row\'s, byte for byte');
        if (k.css !== r.css) fail.push(r.anim + ': the kept CSS is not the row\'s, byte for byte');
        if (k.h !== w.animHash_(r.html + '\u0000' + r.css) || idx.h[r.anim] !== k.h) fail.push(r.anim + ': the kept hash is not the hash of the row');
        /* AND DRAWN AS ITS ROW. */
        const got = pick(r.anim);
        if (got.cls !== 'is-an') fail.push(r.anim + ': the picker, with every other splash retired, drew "' + got.cls + '"');
        else {
          if (got.root !== parsed(r.html)) fail.push(r.anim + ': the splash drew a root that is not the row\'s markup plus the signature');
          if (got.css !== r.css) fail.push(r.anim + ': the splash\'s <style> is not the row\'s CSS');
        }
      });
      said.push(real.length + ' animation rows kept byte for byte, in the books\' order, and each drawn on the splash as its row');
    }
  } else {
    said.push('data/textbooks.json has no animation rows yet — the real-file half had nothing to compare');
  }
  resetSplash();

  /* ---------- 2. THE SYNC'S PROMISES, ON ROWS MADE FOR IT ----------------------------------------------
     Two drawings hung on a real chapter, straight under it, so the mapper takes them as it would a
     real one; ids no row of the books uses. */
  const at = books.findIndex(r => r.book_id === 'TB-GCSE-MATHS' && r.chapter === 17 && !Object.prototype.hasOwnProperty.call(r, 'anim'));
  if (at < 0) fail.push('TB-GCSE-MATHS chapter 17 is not in data/textbooks.json — the made-up rows had nowhere to hang, so the sync was NOT checked');
  else {
    const fake = (id, css) => ({ book_id: 'TB-GCSE-MATHS', chapter: 17, anim: id, title: 'Made up ' + id, about: 'Pythagoras',
      html: '<div class="an-' + id + '" aria-hidden="true">\n  <i class="' + id + '-x"></i>\n</div>', css: css || '.' + id + '-x { opacity: 1; }', active: 'True' });
    const withRows = list => books.slice(0, at + 1).concat(list, books.slice(at + 1));
    /* `zza` ENDS IN A NEWLINE AND ITS CSS STARTS WITH ONE: a kept copy is compared byte for byte, so a
       sync or a mapper that trimmed would keep a copy that is never the row — caught here, where the
       real rows (which start and end on a tag) could not catch it. */
    const A = fake('zza'), B = fake('zzb');
    A.html += '\n'; A.css = '\n' + A.css;
    LS.clear();
    LS.setItem('pad:q1', 'a drawing'); LS.setItem('ans:q1', 'an answer');
    sync(withRows([A, B]));
    if (!rec('zza') || !rec('zzb')) fail.push('two made-up rows under chapter 17 were not both kept');
    const h0 = rec('zza') && rec('zza').h;
    /* A CHANGED DRAWING REPLACES THE KEPT ONE, AND ONLY THAT ONE IS WRITTEN. */
    if (!rec('zza') || rec('zza').html !== A.html || rec('zza').css !== A.css) fail.push('a kept drawing is not its row byte for byte — trimmed, or rewritten');
    const A2 = fake('zza', '\n.zza-x { opacity: .5; }');
    A2.html += '\n';
    const wrote = [];
    const setItem = w.Storage.prototype.setItem;
    w.Storage.prototype.setItem = function (k, v) { wrote.push(k); return setItem.call(this, k, v); };
    try { sync(withRows([A2, B])); } finally { w.Storage.prototype.setItem = setItem; }
    if (!rec('zza') || rec('zza').css !== A2.css) fail.push('a drawing whose CSS changed kept its old CSS');
    if (!rec('zza') || rec('zza').h === h0) fail.push('a drawing whose CSS changed kept its old hash — the picker would trust the stale copy');
    if (wrote.indexOf('splashAnim:zzb') !== -1) fail.push('an unchanged drawing was written again — every load would rewrite every animation');
    if (wrote.indexOf('splashAnim:zza') === -1) fail.push('the changed drawing was not written');
    /* A DELETED ROW DELETES ITS KEY. */
    sync(withRows([A2]));
    if (LS.getItem('splashAnim:zzb') !== null) fail.push('a row taken out of the books left its kept copy behind');
    if ((index() || {}).h && index().h.zzb) fail.push('a row taken out of the books is still in the index');
    /* A RECORD NOBODY'S INDEX NAMES — half-written by a load that stopped — is swept. */
    LS.setItem('splashAnim:zzorphan', '{"h":"x","html":"","css":""}');
    sync(withRows([A2]));
    if (LS.getItem('splashAnim:zzorphan') !== null) fail.push('a kept drawing no index names was left in storage');
    /* OUT OF STORAGE ON ONE DRAWING: THAT ONE LEFT OUT, EVERYTHING ELSE UNTOUCHED. */
    LS.removeItem('splashAnims');
    w.Storage.prototype.setItem = function (k, v) { if (k === 'splashAnim:zzb') throw new w.DOMException('full', 'QuotaExceededError'); return setItem.call(this, k, v); };
    try { sync(withRows([A2, B])); } finally { w.Storage.prototype.setItem = setItem; }
    if (LS.getItem('splashAnim:zzb') !== null || ((index() || {}).ids || []).indexOf('zzb') !== -1) fail.push('a drawing storage refused is still named as kept');
    if (!rec('zza')) fail.push('a refused write took a drawing that did fit with it');
    if (LS.getItem('pad:q1') !== 'a drawing' || LS.getItem('ans:q1') !== 'an answer') fail.push('the sync touched a pad: or ans: key — a loading screen cost a child their work');
    /* AN EMPTY FETCH CHANGES NOTHING — the books', and the splashes' (which is what `splashOff` is). */
    LS.setItem('splashOff', '["is-kept"]');
    const before = JSON.stringify(snap());
    w.splashSync_(w.libraryExtras_({}, { textbooks: [] }), { textbooks: [], 'settings/splashes': [] });
    if (JSON.stringify(snap()) !== before) fail.push('a books and splashes fetch that came back empty changed what the device keeps');
    w.splashSync_(w.libraryExtras_({}, { textbooks: withRows([A2, B]) }), { textbooks: withRows([A2, B]), 'settings/splashes': [] });
    if (LS.getItem('splashOff') !== '["is-kept"]') fail.push('a splashes fetch that came back empty rewrote splashOff to ' + LS.getItem('splashOff'));
    /* THE PICKER DRAWS A GOOD COPY, AND NEVER A BAD ONE. */
    LS.clear();
    sync(withRows([A2, B]));
    const good = pick('zzb');
    if (good.cls !== 'is-an' || good.root !== parsed(B.html) || good.css !== B.css) fail.push('the picker did not draw a good kept copy as its row: ' + JSON.stringify(good).slice(0, 160));
    const bad = (what, spoil, dropsIndex) => {
      LS.clear(); sync(withRows([A2, B])); spoil();
      const got = pick('zzb');
      if (got.cls === 'is-an' || got.root) fail.push(what + ' was drawn anyway (' + got.cls + ')');
      else if (inline.indexOf(got.cls.replace(/^is-/, '')) === -1) fail.push(what + ': the picker fell back to "' + got.cls + '", which is not an inline splash');
      if (w.document.head.querySelector('style[data-anim="zzb"]')) fail.push(what + ': its <style> was left in the page');
      if (dropsIndex && LS.getItem('splashAnims') !== null) fail.push(what + ': the index was kept, so the next load would trust it again');
    };
    bad('a kept copy of another shape (f = 2)', () => { const i = index(); i.f = 2; LS.setItem('splashAnims', JSON.stringify(i)); }, false);
    bad('a damaged record', () => LS.setItem('splashAnim:zzb', '{"h":'), true);
    bad('a record whose hash is not the index\'s', () => { const r = rec('zzb'); r.h = '00000000'; LS.setItem('splashAnim:zzb', JSON.stringify(r)); }, true);
    bad('a record with no markup', () => { const r = rec('zzb'); delete r.html; LS.setItem('splashAnim:zzb', JSON.stringify(r)); }, true);
    said.push('the sync replaces a changed drawing and writes nothing else, deletes a deleted one, sweeps an orphan, survives a full store without touching pad:/ans:, and ignores an empty fetch; the picker draws a good copy and none of four bad ones');
    LS.clear();
  }
  resetSplash();
  if (errs.length) said.push('the app logged ' + errs.length + ' error(s) while loaded here (the network never answers): ' + errs.slice(0, 2).join(' | ').slice(0, 200));

  console.log('');
  said.forEach(s => console.log('  ' + s));
  if (fail.length) {
    console.log('\nBROKEN  (' + fail.length + ')');
    fail.forEach(f => console.log('  ' + f));
    console.log('\nFAILED — the teaching animations are not one source, kept and drawn as their rows.');
    process.exit(1);
  }
  console.log('\nOK — the books\' animations are kept on the device as their rows and drawn from that copy only when it is whole.');
  process.exit(0);
}
