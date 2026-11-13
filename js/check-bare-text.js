#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-bare-text.js NO CARD SHOWS A STRAY VALUE (owner, 13 Nov: "false" among a question's tool tiles): § */
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const lib = require(path.join(ROOT, 'check', 'lib-full.js'));
lib.needWords('stray values on cards', { fixture: ['questions'] });
const glass = require(path.join(ROOT, 'check', 'glass.js'));

/* IN THE PAGE: cards drawn a batch at a time into the open page, each text node read, the batch then cleared. */
function scan() {
  return inFinder_(FINDERS.stuff, () => {
    const out = { cards: 0, fails: [] };
    const BARE = /^\s*(false|true|undefined|null|NaN)\s*$/;
    const slot = document.querySelector('#s-stuff .page.on') || document.querySelector('#s-stuff');
    const host = document.createElement('div');
    slot.appendChild(host);
    const look = (html, where) => {
      host.innerHTML = html;
      out.cards++;
      const w = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) {
        if (!BARE.test(n.nodeValue) || n.parentElement.closest('script, style, textarea, pre, code, .qtext')) continue;
        if (out.fails.length < 40) out.fails.push(where + ': "' + n.nodeValue.trim() + '" in <' + n.parentElement.tagName.toLowerCase() + ' class="' + n.parentElement.className + '">');
        else out.more = (out.more || 0) + 1;
      }
    };
    const seenKind = {};
    stuffItemsAll_().forEach(x => {
      if (!x) return;
      const kind = x.kind || '?';
      seenKind[kind] = (seenKind[kind] || 0) + 1;
      if (seenKind[kind] > 400) return;
      try { look(findCard(x), kind + ' ' + (x.key || '')); } catch (e) { out.fails.push(kind + ' ' + (x.key || '') + ': findCard threw ' + e.message); }
    });
    const qp = questionParts_();
    Object.keys(qp).forEach(k => {
      const pg = qp[k] || [];
      if (!pg.length) return;
      try { look(rowsOne_(questionWhole_(pg[0], pg, new Set(pg), true)), 'question ' + k); } catch (e) { out.fails.push('question ' + k + ': threw ' + e.message); }
    });
    host.remove();
    return out;
  });
}

(async () => {
  const server = await glass.serve('BARE_PORT');
  const port = server.address().port;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  let res;
  try {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json',
      body: r.request().method() === 'POST' ? '{"success":true}' : glass.FIXTURE_ANON }));
    if (lib.fixture()) {
      const file = lib.defs().files.questions.file;
      await page.route('**/' + file + '*', r => r.fulfill({ status: 200, contentType: 'application/json',
        body: require('fs').readFileSync(path.join(ROOT, 'check', 'fixtures', 'lib', 'questions.json'), 'utf8') }));
    }
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 90000 });
    await page.evaluate(() => go('stuff'));
    await page.waitForTimeout(500);
    res = await page.evaluate(scan);
  } finally { await browser.close(); server.close(); }
  if (res.cards < 10) { console.log('FAIL — check-bare-text: only ' + res.cards + ' cards drawn, so nothing was checked'); process.exit(1); }
  if (res.fails.length) {
    console.log('FAIL — check-bare-text: a stray value shown as text on ' + (res.fails.length + (res.more || 0)) + ' card(s) of ' + res.cards);
    res.fails.forEach(f => console.log('  ' + f));
    process.exit(1);
  }
  console.log('check-bare-text: ' + res.cards + ' cards drawn, no bare false/true/undefined/null/NaN');
})().catch(e => { console.log('FAIL — check-bare-text: ' + e.message); process.exit(1); });
