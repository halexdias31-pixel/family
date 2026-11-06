#!/usr/bin/env node
/* @family. — tools/ux-health.js HOW THE APP FEELS ON A PHONE, AND WHETHER ITS QUESTIONS WORK (920): one headless walk, data/ux-health.json. */
/* 390x844 touch, CPU 4x slower, the public fixture. Measures first screen, Find usable, sign-in, ~15 clicks (Event Timing latency,  */
/* layout shift, long tasks) and the JS heap after Practice; then opens ~30 questions spread over every qtype and flags broken ones. */
/* tools/health.js only reads the file (like logic-health). Thresholds: a click over 100 ms or a shift over 0.05 is a finding. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'ux-health.json');
const glass = require('../check/glass.js');
const CLICK_MS = 100, SHIFT = 0.05, SAMPLE = 30, CPU = Number(process.env.UX_CPU) || 4;

/* EVERY INSTRUMENT IN THE PAGE before it loads: paints, shifts, long tasks and event durations, each with its time. */
function instruments() {
  const U = window.__ux = { shifts: [], longs: [], events: [] };
  const obs = (type, fn, o) => { try { new PerformanceObserver(l => l.getEntries().forEach(fn)).observe(Object.assign({ type, buffered: true }, o || {})); } catch (e) { /* an older engine measures less */ } };
  obs('layout-shift', e => U.shifts.push([e.startTime, e.value, !!e.hadRecentInput]));
  obs('longtask', e => U.longs.push([e.startTime, e.duration]));
  obs('event', e => U.events.push([e.startTime, e.duration, e.name]), { durationThreshold: 16 });
}

(async () => {
  const t0 = Date.now(), phase = {}, mark = n => { phase[n] = Date.now() - t0; };
  const server = await glass.serve('UX_PORT');
  const port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
  await page.addInitScript(instruments);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  /* THE SHEET: the anonymous payload for GET, and a sign-in that says yes to the fixture's PIN. */
  const ADMIN = glass.VIEWERS.find(v => v.as === 'admin').user;
  await page.route('**://script.google.com/**', r => {
    if (r.request().method() !== 'POST') return r.fulfill({ status: 200, contentType: 'application/json', body: glass.FIXTURE_ANON });
    let a = {}; try { a = JSON.parse(r.request().postData() || '{}'); } catch (e) { a = {}; }
    const body = a.action === 'verifyLogin' ? Object.assign({ success: true }, ADMIN) : { success: true };
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  const first = await page.waitForFunction(() => { const p = performance.getEntriesByName('first-contentful-paint')[0]; return p ? p.startTime : 0; },
    null, { timeout: 30000, polling: 50 }).then(h => h.jsonValue(), () => -1);
  await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 60000 });
  mark('loaded');
  /* SIGN-IN: the form filled with the fixture's PIN, measured from the press to USER being set. */
  const signin = await page.evaluate(() => new Promise(ok => {
    try { go('account'); } catch (e) { /* no account screen: measured as failed */ }
    setTimeout(() => {
      const n = document.getElementById('in-name'), p = document.getElementById('in-pin'), b = document.querySelector('[data-do="do-signin"]');
      if (!n || !p || !b) return ok(-1);
      n.value = 'test@example.org'; p.value = '0000';
      const s = performance.now(); b.click();
      window.__signAt = s;
      const t = setInterval(() => { if (typeof USER !== 'undefined' && USER) { clearInterval(t); ok(performance.now() - s); } }, 10);
      setTimeout(() => { clearInterval(t); ok(-2); }, 15000);
    }, 400);
  }));

  mark('signin');
  /* FIND IS FOR MEMBERS, so it is usable from sign-in to its first menu answer on the glass. */
  /* WALL CLOCK, not the page's: under the throttle the page cannot even answer a poll until its long task ends, and that wait is the point. */
  const goAt = Date.now();
  await page.evaluate(() => go('stuff'));
  const usable = await page.waitForFunction(() => !!document.querySelector('#s-stuff [data-do="facet-pick"]'),
    null, { timeout: 60000, polling: 100 }).then(() => Date.now() - goAt, () => -1);
  mark('findUsable');

  /* ONE CLICK: tapped where a finger would, then two frames and a quiet 150 ms; its Event Timing, shift and long tasks in that window. */
  const clicks = [];
  async function tap(what, sel, prog) {
    const at = await page.evaluate(sel => {
      const el = [...document.querySelectorAll(sel)].find(e => { const b = e.getBoundingClientRect(); return b.width && b.left >= 0 && b.left < innerWidth; });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' }); const b = el.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    }, sel);
    if (!at && !prog) { clicks.push({ what, missing: true }); return; }
    const s = await page.evaluate(() => performance.now());
    /* GARBAGE PER CLICK (940): heap grown across the click, before any collection; 930's 905 MB was mostly this, uncollected. */
    const h0 = await cdp.send('Runtime.getHeapUsage').then(u => u.usedSize, () => 0);
    if (prog) await page.evaluate(prog); else await page.touchscreen.tap(at.x, at.y);
    await page.evaluate(() => new Promise(ok => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(ok, 150)))));
    const m = await page.evaluate(s => { const U = window.__ux, e = performance.now();
      const ev = U.events.filter(x => x[0] >= s - 5).map(x => x[1]);
      return { ms: Math.round(ev.length ? Math.max(...ev) : e - s - 150), shift: Math.round(U.shifts.filter(x => x[0] >= s).reduce((a, x) => a + x[1], 0) * 1000) / 1000,
        longs: U.longs.filter(x => x[0] >= s).length, by: ev.length ? 'event-timing' : 'frames' }; }, s);
    const h1 = await cdp.send('Runtime.getHeapUsage').then(u => u.usedSize, () => 0);
    clicks.push(Object.assign({ what, churnMB: Math.round((h1 - h0) / 1048576 * 10) / 10 }, m));
  }
  const PICK = '#s-stuff [data-do="facet-pick"]';
  await page.evaluate(() => go('stuff'));
  await page.waitForTimeout(400);
  await tap('front menu: first answer', PICK);
  await tap('second menu: first answer', PICK);
  await tap('third menu: first answer', PICK);
  await tap('back: drop the last chip', '#s-stuff [data-do="filter-drop"]');
  await tap('menu answer again', PICK);
  await tap('open a question', null, () => { const q = stuffItemsAll_().find(x => x && x.kind === 'question' && qType_(x.row) === 'value'); finderOpen_(q, null, FINDERS.stuff); });
  await tap('Check', '#s-stuff [data-do="qp-check"]');
  await tap('Lock the page', '#s-stuff [data-do="q-lock"]');
  await tap('Unlock the page', '#s-stuff [data-do="q-lock"]');
  await tap('Back to the top of Find', '#s-stuff [data-do="find-top"]');
  await tap('front menu again', PICK);
  await tap('Next answer down', PICK);
  await tap('Feed tab', null, () => go('feed'));
  await tap('Find tab', null, () => go('stuff'));
  mark('clicks');
  /* ACCESSIBILITY BASICS (920) on Find and Feed as drawn: a target under 44 px, a box with no label, text under 4.5:1 on its own background. */
  const a11y = [];
  for (const sid of ['stuff', 'feed']) {
    await page.evaluate(sid => go(sid), sid); await page.waitForTimeout(500);
    a11y.push(...await page.evaluate(sid => {
      const out = [], root = document.getElementById('s-' + sid), seen = new Set();
      if (!root) return out;
      const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.left >= 0 && b.right <= innerWidth && b.top < innerHeight && b.bottom > 0; };
      const name = e => (e.getAttribute('data-do') || e.tagName.toLowerCase()) + (e.textContent.trim() ? ' "' + e.textContent.trim().slice(0, 24) + '"' : '');
      root.querySelectorAll('[data-do], button, a[href], input, select, textarea').forEach(e => {
        if (!vis(e)) return; const b = e.getBoundingClientRect(), k = name(e);
        if ((b.width < 44 || b.height < 44) && !seen.has('t' + k)) { seen.add('t' + k); out.push({ screen: sid, what: 'tap target', say: `${k} is ${Math.round(b.width)}x${Math.round(b.height)} px (under 44)` }); }
        if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.tagName) && e.type !== 'hidden' && !e.getAttribute('aria-label') && !(e.id && document.querySelector('label[for="' + e.id + '"]')) && !e.closest('label') && !seen.has('l' + k)) {
          seen.add('l' + k); out.push({ screen: sid, what: 'label', say: `${k} has no label` }); }
      });
      const rgb = c => (c.match(/[\d.]+/g) || []).map(Number), lum = c => { const [r, g, b] = rgb(c).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const bgOf = e => { for (let p = e; p; p = p.parentElement) { const c = getComputedStyle(p).backgroundColor, a = rgb(c); if (a.length === 3 || (a.length === 4 && a[3] > 0.9)) return c; } return 'rgb(255,255,255)'; };
      root.querySelectorAll('p, span, b, h3, li, label, .k').forEach(e => {
        if (!vis(e) || !e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
        const f = getComputedStyle(e).color, a = rgb(f); if (a.length === 4 && a[3] < 0.5) return;
        const L1 = lum(f), L2 = lum(bgOf(e)), r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const k = 'c' + e.className + f; if (r < 4.5 && !seen.has(k)) { seen.add(k); out.push({ screen: sid, what: 'contrast', say: `"${e.textContent.trim().slice(0, 24)}" (${e.tagName.toLowerCase()}.${e.className || '-'}) is ${r.toFixed(2)}:1` }); }
      });
      return out;
    }, sid));
  }
  const heap = await page.evaluate(() => (performance.memory && performance.memory.usedJSHeapSize) || 0);
  /* RAW AND LIVE (940, after 930): the raw heap counts garbage not yet collected; after a forced GC is what the page really holds. */
  await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
  const live = await cdp.send('Runtime.getHeapUsage').then(u => u.usedSize, () => 0);

  /* CORRECTNESS, NOT SPEED, from here: the throttle comes off so thirty questions fit the budget. */
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  /* THE QUESTIONS: an even sample over every qtype, each opened in Find and judged on what a pupil would meet. */
  const questions = await page.evaluate(n => {
    const all = stuffItemsAll_().filter(x => x && x.kind === 'question'), by = {};
    all.forEach(x => { const t = qType_(x.row); (by[t] = by[t] || []).push(x); });
    const types = Object.keys(by).sort(), pick = [];
    for (let i = 0; pick.length < n && i < 50; i++) types.forEach(t => { const l = by[t]; if (pick.length < n && l[i * 97 % l.length] && pick.indexOf(l[i * 97 % l.length]) === -1) pick.push(l[i * 97 % l.length]); });
    return pick.map(x => ({ key: x.key, id: x.row.row_id || x.key, type: qType_(x.row), fig: !!(qtS_(x.row.diagram) || qtS_(x.row.images)) }));
  }, SAMPLE);
  const broken = [];
  for (const q of questions) {
    const had = errors.length;
    const r = await page.evaluate(async q => {
      const wait = ms => new Promise(ok => setTimeout(ok, ms)), bad = [];
      try { finderOpen_(stuffItemsAll_().find(x => x.key === q.key), null, FINDERS.stuff); } catch (e) { bad.push('opening threw: ' + String(e.message).slice(0, 80)); }
      await wait(200);
      const on = document.querySelector('#s-stuff > .page.on') || document.querySelector('#s-stuff');
      if (!on || on.innerText.trim().length < 20) bad.push('empty body');
      const check = on && on.querySelector('[data-do$="-check"], [data-do="qp-check"]');
      const box = on && on.querySelector('input, textarea, [contenteditable="true"], .keypad, [data-do="qp-work"], .choices, canvas');
      if (!check && !box) bad.push('no answer box and no Check tile');
      if (q.fig && on && !on.querySelector('svg, img, canvas, figure')) bad.push('needs a figure and none is drawn');
      if (check) { const before = on.innerHTML + (document.getElementById('toast') || {}).textContent; check.click(); await wait(200);
        if (on.innerHTML + (document.getElementById('toast') || {}).textContent === before) bad.push('Check did nothing'); }
      return bad;
    }, q).catch(e => ['the walk could not open it: ' + String(e.message).slice(0, 80)]);
    if (errors.length > had) r.push('error thrown: ' + errors.slice(had).join(' | ').slice(0, 120));
    if (r.length) broken.push({ id: q.id, type: q.type, why: r });
  }
  mark('questions');
  /* CARD TAGS (920): every kind's cards drawn by stuffCard, as Find draws them; each facet value a card has must be a tag (data-f or data-also), none shown outside the tag line (1030). */
  const cardTags = await page.evaluate(() => {
    const by = {}, out = {};
    stuffItemsAll_().forEach(x => { if (x && x.kind) (by[x.kind] = by[x.kind] || []).push(x); });
    const host = document.createElement('div');
    /* EACH TAG A PILL LIKE ITS MENU CHIP (owner, 5 Nov): drawn on the page, a tag's outline, radius and padding are read against a menu chip's. */
    document.body.appendChild(host);
    const probe = document.createElement('div'); probe.className = 'chips'; probe.innerHTML = '<span class="chip sm" data-tag style="--tag:#e0a040">x</span>'; document.body.appendChild(probe);
    const cs = getComputedStyle(probe.firstChild), chipR = cs.borderTopLeftRadius;
    const notPill = t => { const c = getComputedStyle(t); return !(parseFloat(c.borderTopWidth) >= 1 && c.borderTopStyle === 'solid' && c.borderTopLeftRadius === chipR
      && parseFloat(c.paddingLeft) > 0 && c.borderTopColor === c.color && c.display !== 'inline' ); };
    Object.keys(by).forEach(k => {
      const l = by[k], pick = l.filter((x, i) => i % Math.max(1, Math.floor(l.length / 20)) === 0).slice(0, 20);
      const card = kindOf_(pick[0]).card || thingCard_;
      const r = out[k] = { cards: l.length, sampled: 0, noTags: 0, missing: {}, fn: card.name || '' };
      pick.forEach(x => {
        let html = ''; try { html = stuffCard(x, 0); } catch (e) { html = ''; }
        if (/lib-wait|aria-busy/.test(html) && !/qtag/.test(html)) return;
        r.sampled++;
        host.innerHTML = html;
        const have = new Set([...host.querySelectorAll('.qtag')].flatMap(t => [t.getAttribute('data-f')].concat(String(t.getAttribute('data-also') || '').split(' ').filter(Boolean))));
        if (!have.size) r.noTags++;
        if ([...host.querySelectorAll('.qtags .qtag')].some(notPill)) r.notPill = (r.notPill || 0) + 1;
        /* TAGS FIRST (1040 r10): no heading, title or text comes before the card's tag line. */
        { const tg = host.querySelector('.qtags'), hd = host.querySelector('h3, h4, .qsheet, .tx-text, p');
          if (tg && hd && (tg.compareDocumentPosition(hd) & Node.DOCUMENT_POSITION_PRECEDING)) r.tagsBelow = (r.tagsBelow || 0) + 1; }
        /* AN ATTRIBUTE OUTSIDE THE TAG LINE (1030): a data-f, a marks label or "[2 marks]" drawn anywhere but in .qtags. */
        const out_ = [...host.querySelectorAll('[data-f], [class*="marks"], span, small')].filter(e => !e.closest('.qtags') && !e.closest('.chips')
          && (e.hasAttribute('data-f') || /(^|\s)[\w-]*marks\b/.test(e.className || '') || /^\[?\(?\d+ marks?\)?\]?$/i.test((e.textContent || '').trim())));
        if (out_.length) r.outside = (r.outside || 0) + 1;
        facetList().forEach(F => { let v = [];
          try { v = asList_(F.tagOf ? F.tagOf(x, '') : facetOwn_(F, x)).filter(z => String(z == null ? '' : z).trim()); } catch (e) { v = []; }
          /* A FIELD PICKED AS A CHIP is said by the chip, not the tag (owner, 6 Nov). */
          if (v.length && !have.has(F.field) && !(STUFF.filters || []).some(f => f.field === F.field && !f.any)) r.missing[F.field] = (r.missing[F.field] || 0) + 1; });
      });
    });
    /* A WHOLE QUESTION (960) as its page draws it: each part's marks must be a tag on the top line, never beside a part label. */
    try { const qp = questionParts_(), r = out.question = out.question || { cards: 0, sampled: 0, noTags: 0, missing: {} };
      Object.keys(qp).filter(k => (qp[k] || []).length > 1).slice(0, 20).forEach(k => { const ps = qp[k];
        host.innerHTML = questionWhole_(ps[0], ps, new Set(ps), true);
        const top = host.querySelector('.qwhole > .qtags'), want = ps.filter(p => Number(p.marks) > 0).length;
        const bad = !top || [...host.querySelectorAll('.qtags')].filter(e => !e.classList.contains('qb-head')).length !== 1 || (want > 1 && top.querySelectorAll('[data-f="marks"]').length < want)
          || [...host.querySelectorAll('span, small, div')].some(e => !e.closest('.qtags') && /^\[?\(?\d+ marks?\)?\]?$/i.test((e.textContent || '').trim()));
        if (bad) r.outside = (r.outside || 0) + 1; }); } catch (e) { /* no question parts in this build: nothing to measure */ }
    host.remove(); probe.remove();
    return out;
  });
  /* IN SYNC (1040 r10): a post drawn from a stale copy shows its author's profile face and name, a business post and the icons brandLogo_. */
  const inSync = await page.evaluate(() => {
    const off = [], host = document.createElement('div'), abs = u => { const a = document.createElement('a'); a.href = u; return a.href; };
    try { const t = ((DATA.tutors || []).concat(DATA.people || [])).find(r => r && r.personId && r.handle);
      if (t) { host.innerHTML = postCard_({ id: 'x1', authorId: t.personId, handle: 'stale-copy', author: 'stale-copy', avatar: 'stale.png', figure: '' }, 0);
        const im = host.querySelector('.post-face'), name = (host.querySelector('.post-who') || {}).textContent || '';
        if (/stale/.test(name)) off.push('post name is the stale copy, not ' + t.handle);
        if (im && im.tagName === 'IMG' && /stale/.test(im.src)) off.push('post face is the stale copy'); }
      host.innerHTML = postCard_({ id: 'x2', authorId: '', handle: '@family.', avatar: 'stale.png' }, 0);
      const bi = host.querySelector('img.post-face');
      if (!bi || abs(bi.getAttribute('src')) !== abs(brandLogo_())) off.push('business post face ' + (bi ? bi.getAttribute('src') : 'none') + ' is not brandLogo_ ' + brandLogo_());
      const want = abs(brandLogo_());
      /* THE ICON FILES ARE THE SOURCE (6 Nov): the tab is favicon.png and the home screen icon.png, whatever the sheet's logo says. */
      [['favicon', 'tab icon', 'favicon.png'], ['favicon-ios', 'home-screen icon', 'icon.png']].forEach(([id, say, file]) => { const l = document.getElementById(id), h = l ? l.href : '';
        if (h !== abs(file)) off.push(say + ' ' + h + ' is not ' + file); });
      host.innerHTML = webProfilePages_()[0]; const wl = host.querySelector('img.web-logo');
      if (!wl || abs(wl.getAttribute('src')) !== want) off.push('Web profile picture is not brandLogo_');
      const tb = document.querySelector('.topbar-brand'); if (tb && tb.textContent.trim() !== brand('name', '@family.')) off.push('top bar says ' + tb.textContent + ', brand name ' + brand('name', '@family.'));
    } catch (e) { off.push('the walk could not draw: ' + String(e.message).slice(0, 80)); }
    return { off };
  });
  /* TEXT BOXES (980): Find's search, a question's answer box and a Settings field, measured as drawn; one look means one signature. */
  const boxLooks = await page.evaluate(async () => {
    const wait = ms => new Promise(ok => setTimeout(ok, ms)), out = [];
    const sig = el => { const c = getComputedStyle(el); return { h: Math.round(el.getBoundingClientRect().height), radius: c.borderTopLeftRadius, font: c.fontSize + ' ' + c.fontFamily.split(',')[0],
      padR: c.paddingRight, bg: c.backgroundColor, border: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor }; };
    const vis = el => el && el.getBoundingClientRect().width > 0;
    try { go('stuff'); await wait(400); const s = document.querySelector('#s-stuff input[type="search"], #s-stuff input.search, #stuff-q'); if (vis(s)) out.push({ where: 'Find search', sig: sig(s) }); } catch (e) { /* not reached: left out */ }
    try { const qs = stuffItemsAll_().filter(x => x && x.kind === 'question');
      for (let i = 0; i < Math.min(qs.length, 300); i += 11) { finderOpen_(qs[i], null, FINDERS.stuff); await wait(120);
        const a = document.querySelector('#s-stuff .page.on .qp-bar > .qp-ans'); if (vis(a)) { out.push({ where: 'question answer box', sig: sig(a) }); break; } } } catch (e) { /* not reached: left out */ }
    try { for (const t of TABS) { go(t.id); await wait(300);
      const f = [...document.querySelectorAll('#s-' + t.id + ' input[data-draft^="set:"]')].find(e => vis(e) && !e.disabled && (e.type === 'text' || !e.getAttribute('type')));
      if (f) { out.push({ where: 'Settings field (' + t.id + ')', sig: sig(f) }); break; } } } catch (e) { /* not reached: left out */ }
    /* THE CREAM PILL IS THE YARDSTICK (1030): the question's answer box; every other box is measured against it. */
    const pill = out.find(o => o.where === 'question answer box'), first = pill ? pill.sig : {}, off = [];
    if (!pill) off.push('no question answer box was drawn: the cream pill was NOT measured');
    out.filter(o => o !== pill).forEach(o => Object.keys(first).forEach(k => { if (k === 'h' ? Math.abs(o.sig.h - first.h) > 2 : o.sig[k] !== first[k]) off.push(`${o.where} ${k} ${o.sig[k]} (cream pill ${first[k]})`); }));
    return { faces: out, off };
  }).catch(e => ({ faces: [], off: [], error: String(e.message).slice(0, 120) }));
  mark('boxLooks');
  /* REPEAT VISIT (920 cache): the same browser opens the site again; bytes over the network against bytes from a cache (HTTP or the service worker). */
  const bytes = pg => pg.evaluate(() => { const r = performance.getEntriesByType('resource').concat(performance.getEntriesByType('navigation'));
    const o = { n: r.length, netKB: 0, cacheN: 0, cacheKB: 0 };
    r.forEach(e => { if (e.transferSize > 0) o.netKB += e.transferSize / 1024; else { o.cacheN++; o.cacheKB += (e.decodedBodySize || 0) / 1024; } });
    o.netKB = Math.round(o.netKB); o.cacheKB = Math.round(o.cacheKB); return o; }).catch(() => null);
  const firstVisit = await bytes(page);
  let repeat = null;
  try { const p2 = await ctx.newPage(); const t1 = Date.now();
    await p2.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await p2.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 60000 });
    repeat = Object.assign({ loadedMs: Date.now() - t1 }, await bytes(p2)); await p2.close(); } catch (e) { repeat = { error: String(e.message).slice(0, 120) }; }
  await browser.close(); server.close();
  const out = {
    visits: { first: firstVisit, repeat },
    walked: { viewport: '390x844 touch', cpu: CPU + 'x (1x for the question sample)', ms: Date.now() - t0, phase },
    firstScreenMs: Math.round(first), findUsableMs: Math.round(usable), signinMs: Math.round(signin), heapMB: Math.round(heap / 1048576 * 10) / 10,
    boxLooks,
    heapLiveMB: Math.round(live / 1048576 * 10) / 10, garbageMB: Math.round(Math.max(0, heap - live) / 1048576 * 10) / 10,
    clicks, thresholds: { clickMs: CLICK_MS, shift: SHIFT },
    slow: clicks.filter(c => !c.missing && (c.ms > CLICK_MS || c.shift > SHIFT)),
    missing: clicks.filter(c => c.missing).map(c => c.what),
    questions: { sampled: questions.length, types: [...new Set(questions.map(q => q.type))].length, broken },
    errors: [...new Set(errors)].slice(0, 20), consoleErrors: [...new Set(consoleErrors)].slice(0, 20), a11y, cardTags, inSync,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`ux-health: wrote data/ux-health.json — first screen ${out.firstScreenMs} ms, Find usable ${out.findUsableMs} ms, sign-in ${out.signinMs} ms, `
    + `${out.slow.length} slow clicks of ${clicks.length}, ${broken.length} broken of ${questions.length} questions, heap ${out.heapMB} MB raw, ${out.heapLiveMB} MB live (${Math.round(out.walked.ms / 1000)} s)`);
  process.exit(0);
})().catch(e => { console.error('ux-health: ' + (e && e.stack || e)); process.exit(2); });
