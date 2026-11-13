#!/usr/bin/env node
/* @family. — check/qcard.js ONE CARD PER QUESTION NUMBER (960), and every tile answering a tap at once: a browser walk, data/qcard-health.json. */
/* Static over every question the fixture's library holds (stuffPages_ under Questions): card-split, orphan-part. On drawn cards (a sample */
/* spread over the papers): dup-tagline, tile-groups, card-order, indent. Then tap-response: each tile act on a question card and in Settings, */
/* tapped twice 300 ms apart, must change something on the page within 100 ms each time. Then text-overflow at 390 and 1024 wide. Then stable-controls (1020) and the owner's four (1030). tools/health.js reads the file; ideal 0 each. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'qcard-health.json');
const glass = require('./glass.js');
const SAMPLE = Number(process.env.QCARD_SAMPLE) || 60;
/* NOT TAPPED: what leaves the screen, signs out or changes the account for good. */
/* voice-try speaks and draws nothing; headless Chromium has no voices, so it is not testable here. */
const SKIP = /voice-try|filter-clear|facet-|chip-|sign-?out|delete|remove|danger|^go-|^tab-|find-top|find-open|card-edit|spot|set-listed|^nav|close|logout/;

/* IN THE PAGE: every question's page and the structure of a drawn card. */
function staticPass(sample) {
  return inFinder_(FINDERS.stuff, () => {
    /* THE FUNNEL'S OWN FIRST TWO ANSWERS for a question (Practice, Questions): every question is under them. */
    const any = stuffItemsAll_().find(i => i && i.kind === 'question');
    finderSet_(FINDERS.stuff, { filters: any ? finderWalk_(any).slice(0, 2) : [], q: '' });
    const pages = stuffPages_(), seen = {}, out = { pages: pages.length, split: [], orphan: [], dupTag: [], rows: [], order: [], indent: [] };
    pages.forEach(pg => {
      if (!pg.x || pg.x.kind !== 'question') return;
      const k = qId_(pg.x) || pg.x.key;
      if (seen[k] || pg.part !== 'q') out.split.push(k + ' ' + (pg.part || 'card'));
      seen[k] = true;
      if (!(pg.parts || []).length) out.orphan.push(k);
    });
    const qs = pages.filter(pg => pg.part === 'q'), step = Math.max(1, Math.floor(qs.length / sample));
    const host = document.createElement('div');
    for (let i = 0; i < qs.length; i += step) {
      const pg = qs[i], k = qId_(pg.x) || pg.x.key;
      host.innerHTML = rowsOne_(questionWhole_(pg.x, pg.parts, pg.open, pg.ans));
      const card = host.querySelector('.qwhole');
      if (!card) { out.orphan.push(k + ' (no card)'); continue; }
      /* EVERY PART ITS OWN CARD (owner, 8 Nov, 1160): one tag line at its top, one tile row after it, none inside another */
      const blocks = [...card.querySelectorAll('.qb')];
      if (blocks.some(b => b.querySelectorAll('.qcard-tags:not(.qans-card .qcard-tags)').length !== 1)) out.dupTag.push(k);
      const own = b => b.querySelector('[data-do="card-share"]') || (b.nextElementSibling && b.nextElementSibling.matches('.tile-row') && b.nextElementSibling.querySelector('[data-do="card-share"]'));
      if (blocks.some(b => !own(b))) out.rows.push(k + ' a part with no tile row of its own');
      const rank = e => e.matches('.qcard-tags') ? 0 : e.matches('.qb-stem') ? 1 : e.matches('.qb-part') ? 2 : -1;
      blocks.forEach(b => {
        const r = [...b.children].map(rank).filter(n => n >= 0);
        if (r.some((n, j) => j && n < r[j - 1])) out.order.push(k + ' ' + (b.getAttribute('data-part') || 'root'));
        if (b.parentElement.closest('.qb')) out.indent.push(k + ' part ' + (b.getAttribute('data-part') || '?') + ' inside another');
      });
    }
    out.sampled = Math.ceil(qs.length / step);
    return out;
  });
}

/* IN THE PAGE: tap one act twice; each tap must change the page (any mutation, a toast) within 100 ms. */
function tapTwice(sel) {
  const pick = () => [...document.querySelectorAll(sel)].find(e => { const b = e.getBoundingClientRect(); return b.width && b.left >= 0 && b.left < innerWidth; });
  const once = () => new Promise(ok => {
    const el = pick();
    if (!el) return ok(-1);
    /* A DIMMED TILE (nothing to undo, nothing to save) is a deliberate no-op, said on the glass before the tap: 0 ms. */
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return ok(0);
    let hit = 0;
    const t0 = performance.now();
    const mo = new MutationObserver(() => { if (!hit) hit = performance.now() - t0; });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    el.scrollIntoView({ block: 'center' });
    el.click();
    setTimeout(() => { mo.disconnect(); ok(hit ? Math.round(hit) : 999); }, 120);
  });
  return once().then(a => new Promise(ok => setTimeout(() => once().then(b => ok([a, b])), 300)));
}

/* IN THE PAGE: every control in a scope, as act -> box, and the scope's height (1020) -- what a tap must leave where it was. */
function ctlSnap(sel) {
  const root = document.querySelector(sel);
  if (!root) return null;
  const seen = {}, ctl = {};
  root.querySelectorAll('.tile[data-do], button[data-do], .chip[data-do]').forEach(e => {
    const b = e.getBoundingClientRect();
    if (!b.width || !b.height) return;
    const a = e.getAttribute('data-do') + (e.getAttribute('data-tool') ? ':' + e.getAttribute('data-tool') : '');
    seen[a] = (seen[a] || 0) + 1;
    ctl[a + '#' + seen[a]] = [Math.round(b.left + scrollX), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)];
  });
  return { h: Math.round(root.getBoundingClientRect().height), ctl };
}
/* WHAT CHANGED BETWEEN TWO SNAPSHOTS, past 2px, the tapped tile's own look aside. */
function ctlDiff(a, b, own) {
  if (!a || !b) return [];
  const out = [];
  if (Math.abs(a.h - b.h) > 2) out.push('height ' + a.h + '->' + b.h);
  Object.keys(a.ctl).forEach(k => { if (k === own) return; const p = a.ctl[k], q = b.ctl[k];
    if (!q) out.push('gone ' + k); else if (p.some((v, i) => Math.abs(v - q[i]) > 2)) out.push('moved ' + k); });
  Object.keys(b.ctl).forEach(k => { if (!a.ctl[k]) out.push('new ' + k); });
  return out;
}
/* STATIC: a handler that adds, removes or redraws markup that holds tiles -- the shape of the change 1020 ended. */
function staticControls() {
  const out = [], dir = path.join(ROOT, 'js');
  fs.readdirSync(dir).filter(f => /\.js$/.test(f) && !/^check/.test(f)).forEach(f => {
    const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
    let act = '';
    lines.forEach((l, i) => {
      const m = /^on\('([^']+)'/.exec(l);
      if (m) act = /\}\);?\s*$/.test(l) ? '' : m[1]; else if (/^\}\);?\s*$|^(function |const |let |\/\*)/.test(l)) act = '';
      if (act && /insertAdjacentHTML|outerHTML\s*=|\.remove\(\)/.test(l) && /tile|row|bar/i.test(l)) out.push(`${f}:${i + 1} ${act}`);
    });
  });
  return out;
}

/* IN THE PAGE: every chip, tile and button on the glass whose words spill out of their box or break inside a word. */
function overflowScan(screen) {
  const out = [];
  const sel = e => e.tagName.toLowerCase() + (e.getAttribute('data-do') ? `[data-do="${e.getAttribute('data-do')}"]` : '') + '.' + [...e.classList].slice(0, 2).join('.') + ' "' + e.textContent.trim().slice(0, 24) + '"';
  document.querySelectorAll('.chip, .tile, .btn, button, .answers > *').forEach(e => {
    const b = e.getBoundingClientRect();
    if (!b.width || b.right < 0 || b.left > innerWidth || b.bottom < 0 || b.top > innerHeight || !e.textContent.trim()) return;
    let why = '';
    if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible') why = 'scrollWidth ' + e.scrollWidth + ' > ' + e.clientWidth;
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n && !why; n = w.nextNode()) {
      const r = document.createRange(), t = n.textContent;
      r.selectNodeContents(n);
      const tr = r.getBoundingClientRect();
      if (tr.width && (tr.left < b.left - 1 || tr.right > b.right + 1 || tr.top < b.top - 1 || tr.bottom > b.bottom + 1)) why = 'text outside its border';
      const re = /\S+/g; let m;
      while (!why && (m = re.exec(t))) { r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const lines = new Set([...r.getClientRects()].map(q => Math.round(q.top))); if (lines.size > 1) why = 'word "' + m[0] + '" broken across lines'; }
    }
    if (why) out.push(screen + ': ' + sel(e) + ' — ' + why);
  });
  return out;
}

/* IN THE PAGE: THE OWNER'S FOUR (1030), as drawn on the current screen. `pill` is the drawn cream answer box's look. */
function ownerScan(arg) {
  const [screen, pill] = arg, out = { 'tag-colour': [], 'element-box': [], 'text-boxes': [] };
  const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const on = document.querySelector('.screen.on, section.on') || document;
  /* tag-colour: every answer of a drawn menu wears one colour, its menu's; a chip wears its menu's. */
  document.querySelectorAll('.answers').forEach(a => { if (!vis(a)) return;
    const rows = [...a.querySelectorAll('[data-do="facet-pick"]')], tags = new Set(rows.map(r => r.getAttribute('data-tag')));
    if (tags.size > 1) out['tag-colour'].push(screen + ': one menu (' + (rows[0] && rows[0].dataset.field) + ') in ' + tags.size + ' colours');
    rows.forEach(r => { if (r.getAttribute('data-tag') !== tagOf_(r.dataset.field)) out['tag-colour'].push(screen + ': ' + r.dataset.field + ' answer not in its menu\'s colour'); }); });
  document.querySelectorAll('.chip[data-do="filter-drop"]').forEach(c => { if (!vis(c)) return; const f = (STUFF.filters || [])[Number(c.dataset.i)];
    if (f && !f.any && c.getAttribute('data-tag') !== tagOf_(f.field)) out['tag-colour'].push(screen + ': chip ' + f.field + ' not in its menu\'s colour'); });
  document.querySelectorAll('.page.on .qtags .qtag[data-f]').forEach(t => { if (vis(t) && t.getAttribute('data-tag') !== tagOf_(t.getAttribute('data-f')))
    out['tag-colour'].push(screen + ': card word "' + t.textContent.trim().slice(0, 20) + '" not in its menu\'s colour'); });
  /* element-box: each element on a page drawn without a box, like every other. */
  document.querySelectorAll('.page.on .qwhole, .page.on .favwrap > .card, .page.on .favwrap > .qcard').forEach(e => { if (!vis(e)) return; const c = getComputedStyle(e);
    const box = (c.backgroundColor !== 'rgba(0, 0, 0, 0)' && c.backgroundColor !== 'transparent') || parseFloat(c.borderTopWidth) > 0 || parseFloat(c.borderLeftWidth) > 0 || parseFloat(c.borderTopLeftRadius) > 0 || c.boxShadow !== 'none';
    if (box) out['element-box'].push(screen + ': .' + String(e.className).split(' ')[0] + ' drawn in a box (' + c.backgroundColor + ', ' + c.borderTopWidth + ' ' + c.borderTopLeftRadius + ')'); });
  /* text-boxes: every visible typing box drawn as the cream pill. */
  if (pill) document.querySelectorAll('input, textarea').forEach(e => {
    if (!vis(e) || /^(range|color|checkbox|radio|file|hidden|submit|button)$/.test(e.type) || e.closest('.kp-field')) return;
    const c = getComputedStyle(e), sig = { bg: c.backgroundColor, colour: c.color, radius: c.borderTopLeftRadius, font: c.fontSize + ' ' + c.fontFamily.split(',')[0], border: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, padR: c.paddingRight };
    const off = Object.keys(pill).filter(k => k !== 'h' && sig[k] !== pill[k]);
    if (Math.abs(Math.round(e.getBoundingClientRect().height) - pill.h) > 2 && e.tagName === 'INPUT') off.push('height ' + Math.round(e.getBoundingClientRect().height));
    if (off.length) out['text-boxes'].push(screen + ': ' + (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : '')) + ' differs in ' + off.map(k => k === 'h' || /^height/.test(k) ? k : k + ' ' + sig[k]).join(', '));
  });
  return out;
}
/* IN THE PAGE: every kind's card, and multi-part questions whole: a tag line at the top with every attribute, none outside it. */
function tagScan() {
  return inFinder_(FINDERS.stuff, () => {
    const out = { 'card-tags': [], 'attr-outside-tags': [] }, by = {}, host = document.createElement('div');
    stuffItemsAll_().forEach(x => { if (x && x.kind) (by[x.kind] = by[x.kind] || []).push(x); });
    const MARKS = /^\[?\(?\d+ marks?\)?\]?$/i;
    const look = (k, html, x) => { host.innerHTML = html;
      const row = host.querySelector('.qtags');
      if (!row) { out['card-tags'].push(k + ': no tag line'); return; }
      const card = row.parentElement, before = [...card.children].slice(0, [...card.children].indexOf(row)).filter(e => !e.matches('h3, .fc-head'));
      if (before.length) out['card-tags'].push(k + ': the tag line is not at the top (' + before[0].className + ' above it)');
      const have = new Set([...host.querySelectorAll('.qtags .qtag')].flatMap(t => [t.getAttribute('data-f')].concat(String(t.getAttribute('data-also') || '').split(' '))));
      if (x) facetList().forEach(F => { let v = []; try { v = asList_(F.tagOf ? F.tagOf(x, '') : facetOwn_(F, x)).filter(z => String(z == null ? '' : z).trim()); } catch (e) { v = []; }
        if (v.length && !have.has(F.field)) out['card-tags'].push(k + ': ' + F.field + ' is not a tag'); });
      [...host.querySelectorAll('*')].filter(e => !e.closest('.qtags') && !e.closest('.chips')).forEach(e => {
        if (e.hasAttribute('data-f') || /(^|\s)[\w-]*marks\b/.test(e.className || '') || (!e.children.length && MARKS.test((e.textContent || '').trim())))
          out['attr-outside-tags'].push(k + ': "' + (e.textContent || '').trim().slice(0, 30) + '" (' + (e.className || e.tagName) + ') outside the tag line'); }); };
    Object.keys(by).forEach(k => { const l = by[k].filter(x => !libSlim_(x)), step = Math.max(1, Math.floor(l.length / 10));
      for (let i = 0; i < l.length; i += step) { let h = ''; try { h = stuffCard(l[i], 0); } catch (e) { h = ''; } if (h) look(k, h, isQ_(l[i]) ? null : l[i]); } });
    const qp = questionParts_();
    Object.keys(qp).filter(k => qp[k].length > 1).slice(0, 30).forEach(k => { const ps = qp[k];
      look('whole question ' + k, questionWhole_(ps[0], ps, new Set(ps), true), null);
      const want = ps.filter(p => Number(p.marks) > 0).length, got = host.querySelectorAll('.qb > .qcard-tags [data-f="marks"]').length;
      if (want > 1 && got < want) out['card-tags'].push('whole question ' + k + ': ' + want + ' parts with marks, ' + got + ' marks tags on their cards'); });
    Object.keys(out).forEach(k => { out[k] = [...new Set(out[k])]; });
    return out;
  });
}

(async () => {
  const server = await glass.serve('QCARD_PORT');
  const port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  const ADMIN = glass.VIEWERS.find(v => v.as === 'admin').user;
  await page.route('**://script.google.com/**', r => {
    if (r.request().method() !== 'POST') return r.fulfill({ status: 200, contentType: 'application/json', body: glass.FIXTURE_ANON });
    let a = {}; try { a = JSON.parse(r.request().postData() || '{}'); } catch (e) { a = {}; }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(a.action === 'verifyLogin' ? Object.assign({ success: true }, ADMIN) : { success: true }) });
  });
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 90000 });
  /* SIGNED IN ON FIND (owner, 13 Nov): the name tag and Enter, then four digit tags. */
  await page.evaluate(() => new Promise(ok => { go('stuff'); setTimeout(() => { ACTIONS['sign-restart'](document.body); const n = document.getElementById('in-name'); n.value = 'test@example.org';
    n.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); ['0', '0', '0', '0'].forEach(c => ACTIONS['sign-digit'](document.querySelector('#stuff-groups [data-do="sign-digit"][data-d="' + c + '"]')));
    const t = setInterval(() => { if (USER) { clearInterval(t); ok(); } }, 50); }, 400); }));
  await page.evaluate(() => go('stuff'));
  await page.waitForTimeout(1000);
  const st = await page.evaluate(staticPass, SAMPLE);

  /* TAPS: a drawn question card (its whole page), then Settings. */
  const taps = [];
  const actsIn = scope => page.evaluate(scope => [...new Set([...document.querySelectorAll(scope + ' .tile[data-do]')]
    .filter(e => { const b = e.getBoundingClientRect(); return b.width && b.left >= 0 && b.left < innerWidth; }).map(e => e.getAttribute('data-do')))], scope);
  await page.evaluate(() => inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true)));
  await page.waitForTimeout(1200);
  const where = { question: '#s-stuff', settings: '#s-account' };
  for (const screen of Object.keys(where)) {
    if (screen === 'settings') { await page.evaluate(() => go('account')); await page.waitForTimeout(1200); }
    for (const act of (await actsIn(where[screen])).filter(a => !SKIP.test(a))) {
      if (screen === 'question') { await page.evaluate(() => { go('stuff'); inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true)); }); await page.waitForTimeout(500); }
      const ms = await page.evaluate(tapTwice, `${where[screen]} .tile[data-do="${act}"]`);
      taps.push({ screen, act, ms });
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(200);
    }
  }
  /* STABLE CONTROLS (1020): on a question card, Settings and Find, each tile tapped (and tapped again) leaves every other control where it was. */
  const stable = [];
  const scopes = { question: ['#s-stuff .qwhole', () => { go('stuff'); inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true)); }],
    settings: ['#s-account', () => go('account')], find: ['#s-stuff', () => { finderSet_(FINDERS.stuff, { filters: [], q: '' }); go('stuff'); }] };
  for (const name of Object.keys(scopes)) {
    const [sel, open] = scopes[name];
    await page.evaluate('(' + open.toString() + ')()');
    await page.waitForTimeout(1200);
    const base = await page.evaluate(ctlSnap, sel);
    for (const own of Object.keys((base && base.ctl) || {})) {
      const act = own.split('#')[0].split(':')[0];
      if (SKIP.test(act) || /^(kp-|help-|card-share|rep-box|fav|qp-work|q-mag|read-aloud)/.test(act)) continue;
      const before = await page.evaluate(ctlSnap, sel);
      const tap = () => page.evaluate(([sel, own]) => { const [a, n] = own.split('#'), [act, tool] = a.split(':');
        const e = [...document.querySelectorAll(sel + ` [data-do="${act}"]`)].filter(x => x.matches('.tile, button, .chip')).filter(x => (!tool || x.getAttribute('data-tool') === tool) && x.getBoundingClientRect().width)[n - 1];
        if (e && !e.disabled) e.click(); return !!e; }, [sel, own]);
      if (!(await tap())) continue;
      await page.waitForTimeout(300);
      ctlDiff(before, await page.evaluate(ctlSnap, sel), own).slice(0, 3).forEach(d => stable.push(`${name} ${own}: ${d}`));
      await tap();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape').catch(() => {});
      await page.evaluate('(' + open.toString() + ')()');
      await page.waitForTimeout(500);
    }
  }
  const stat = staticControls();
  /* TEXT-OVERFLOW at a phone and a tablet: Find's opening menu, the SATs worksheet menu, a question card, Settings. */
  const spill = [];
  for (const [w, h] of [[390, 844], [1024, 1366]]) {
    await page.setViewportSize({ width: w, height: h });
    const menus = { 'find menu': () => { finderSet_(FINDERS.stuff, { filters: [], q: '' }); go('stuff'); },
      'SATs worksheet menu': () => { const want = /KS2/; let f = [];
        const has = i => Object.values(i).some(v => v === 'SATs' || (Array.isArray(v) && v.indexOf('SATs') >= 0));
        const all = stuffItemsAll_().filter(i => i && i.kind === 'question' && /^W-/.test(qId_(i)) && has(i));
        const x = all.find(i => want.test(String(i.keystage))) || all[0] || (questionParts_()['W-CBM-2d-shapes|1'] || [])[0];
        const w = x ? finderWalk_(x) : [], at = w.findIndex(c => c.value === 'SATs');
        f = at >= 0 ? w.slice(0, at + 1) : [];
        finderSet_(FINDERS.stuff, { filters: f, q: '' }); go('stuff'); },
      'question card': () => inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true)),
      settings: () => go('account') };
    for (const name of Object.keys(menus)) {
      await page.evaluate('(' + menus[name].toString() + ')()');
      await page.waitForTimeout(1200);
      if (name === 'SATs worksheet menu') await page.screenshot({ path: path.join(process.env.QCARD_SHOTS || '/tmp', `sats-menu-${w}.png`) });
      (await page.evaluate(overflowScan, name + ' ' + w + 'x' + h)).forEach(f => spill.push(f));
    }
  }
  /* THE OWNER'S FOUR (1030), drawn at 390x844: Find's front, the Maths menu with its chips, a whole question, a lone part, a library card, Settings. */
  await page.setViewportSize({ width: 390, height: 844 });
  const own = { 'tag-colour': [], 'element-box': [], 'card-tags': [], 'attr-outside-tags': [], 'text-boxes': [] };
  const pillAt = () => page.evaluate(() => { const e = [...document.querySelectorAll('#s-stuff .qp-bar > .qp-ans')].find(a => a.getBoundingClientRect().width > 0); if (!e) return null; const c = getComputedStyle(e);
    return { h: Math.round(e.getBoundingClientRect().height), bg: c.backgroundColor, colour: c.color, radius: c.borderTopLeftRadius, font: c.fontSize + ' ' + c.fontFamily.split(',')[0], border: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, padR: c.paddingRight }; });
  const openQ = n => page.evaluate(n => inFinder_(FINDERS.stuff, () => { const qp = questionParts_();
    const k = Object.keys(qp).find(k => (n > 1 ? qp[k].length > 1 : qp[k].length === 1) && qp[k].every(p => Number(p.marks) > 0));
    if (k) finderOpen_(qp[k][0], null, FINDERS.stuff); return k || null; }), n);
  await page.evaluate(() => go('stuff')); await openQ(1); await page.waitForTimeout(2000);
  const pill = await pillAt();
  if (!pill) own['text-boxes'].push('no cream answer pill drawn on a question: the text boxes were NOT measured');
  const scenes = { 'find front': () => { go('stuff'); inFinder_(FINDERS.stuff, () => { finderSet_(FINDERS.stuff, { filters: [], q: '' }); paintStuff(); }); },
    'maths menu': () => { go('stuff'); inFinder_(FINDERS.stuff, () => { finderSet_(FINDERS.stuff, { filters: [{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }, { field: 'subject', value: 'Maths' }], q: '' }); paintStuff(); }); },
    'whole question': 2, 'lone part': 1,
    'library card': () => { go('stuff'); inFinder_(FINDERS.stuff, () => { const x = stuffItemsAll_().find(i => i.kind === 'insert') || stuffItemsAll_().find(i => i.kind === 'content' && !libSlim_(i)); if (x) finderOpen_(x, null, FINDERS.stuff); }); },
    settings: () => go('account') };
  for (const name of Object.keys(scenes)) {
    if (typeof scenes[name] === 'number') { await page.evaluate(() => go('stuff')); await openQ(scenes[name]); } else await page.evaluate('(' + scenes[name].toString() + ')()');
    await page.waitForTimeout(1200);
    const r = await page.evaluate(ownerScan, [name, pill]);
    Object.keys(r).forEach(k => own[k].push(...r[k]));
  }
  const ts = await page.evaluate(tagScan);
  Object.keys(ts).forEach(k => own[k].push(...ts[k]));
  const lag = taps.filter(t => t.ms.some(m => m > 100) || (t.ms[0] >= 0 && t.ms[1] < 0));
  const out = { at: new Date().toISOString().slice(0, 10), pages: st.pages, sampled: st.sampled,
    checks: { 'card-split': st.split.length, 'orphan-part': st.orphan.length, 'dup-tagline': st.dupTag.length, 'tile-groups': st.rows.length,
              'card-order': st.order.length, indent: st.indent.length, 'tap-response': lag.length, 'text-overflow': spill.length,
              'stable-controls': stable.length, 'static-controls': stat.length,
              'tag-colour': own['tag-colour'].length, 'element-box': own['element-box'].length, 'card-tags': own['card-tags'].length,
              'attr-outside-tags': own['attr-outside-tags'].length, 'text-boxes': own['text-boxes'].length },
    where: { 'card-split': st.split.slice(0, 20), 'orphan-part': st.orphan.slice(0, 20), 'dup-tagline': st.dupTag.slice(0, 20), 'tile-groups': st.rows.slice(0, 20),
             'card-order': st.order.slice(0, 20), indent: st.indent.slice(0, 20), 'tap-response': lag.map(t => `${t.screen} ${t.act}: ${t.ms.join(' / ')} ms`), 'text-overflow': spill.slice(0, 40),
             'stable-controls': stable.slice(0, 40), 'static-controls': stat.slice(0, 40),
             'tag-colour': own['tag-colour'].slice(0, 40), 'element-box': own['element-box'].slice(0, 40), 'card-tags': own['card-tags'].slice(0, 40),
             'attr-outside-tags': own['attr-outside-tags'].slice(0, 40), 'text-boxes': own['text-boxes'].slice(0, 40) },
    taps, errors };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(Object.entries(out.checks).map(([k, v]) => `${k} ${v}`).join(', ') + ` (${st.pages} pages, ${st.sampled} cards drawn, ${taps.length} acts tapped)`);
  spill.slice(0, 15).forEach(f => console.log('  spill: ' + f));
  stable.slice(0, 15).forEach(f => console.log('  unstable: ' + f));
  stat.forEach(f => console.log('  static: ' + f));
  Object.keys(own).forEach(k => own[k].slice(0, 12).forEach(f => console.log('  ' + k + ': ' + f)));
  lag.forEach(t => console.log('  lag: ' + t.screen + ' ' + t.act + ' ' + t.ms.join(' / ') + ' ms'));
  await browser.close(); server.close();
  process.exit(Object.values(out.checks).some(n => n > 0) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
