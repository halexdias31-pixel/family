#!/usr/bin/env node
/* @family. — check/find-first.js FIND IS THE FRONT DOOR (1070): signed out, as a student and as an admin, on a 390x844 phone, */
/* the first thing below the top bar is Find's search box. Then the proof: Feed moved above Find must make the same probe fail. */
'use strict';
require('./quiet');
const glass = require('./glass.js');
const { chromium } = require('playwright');

/* WHAT STANDS JUST UNDER THE TOP BAR: the first shown section's first pane, and whether Find's controls are in it. */
function probe() {
  const top = document.getElementById('topbar'), y = (top && top.getBoundingClientRect().height > 0 ? top.getBoundingClientRect().bottom : 0) + 4;
  const first = [...document.querySelectorAll('#screen > section')].find(s => !s.classList.contains('hidden') && s.getBoundingClientRect().height > 0);
  const q = document.getElementById('stuff-controls');
  return { first: first ? first.id : null, search: !!(q && first && first.contains(q) && q.getBoundingClientRect().top < y + 200), y: Math.round(y) };
}

(async () => {
  const server = await glass.serve('FINDFIRST_PORT');
  const browser = await chromium.launch();
  const bad = [];
  let proved = false;
  try {
    for (const v of glass.VIEWERS) {
      const o = await glass.open(browser, server.address().port, v, 390, 844, { settle: 500 });
      if (!o.ready) { bad.push(v.as + ': the app never finished loading'); await o.ctx.close(); continue; }
      await o.page.waitForSelector('#stuff-controls', { timeout: 20000 }).catch(() => {});
      const p = await o.page.evaluate(probe);
      if (p.first !== 's-stuff' || !p.search) bad.push(`${v.as}: the first thing under the top bar is ${p.first || 'nothing'}, ${p.search ? 'with' : 'without'} Find's controls`);
      /* THE PROOF: Feed put above Find, as before 1070; the probe must now say no. */
      if (!proved) {
        const m = await o.page.evaluate(f => {
          const feed = document.getElementById('s-feed'), find = document.getElementById('s-stuff');
          if (!feed || !find) return null;
          feed.classList.remove('hidden'); feed.innerHTML = '<section class="page"><div class="pane" style="height:400px">Posts</div></section>';
          find.parentNode.insertBefore(feed, find);
          return (new Function('return (' + f + ')()'))();
        }, probe.toString());
        if (m && (m.first === 's-stuff' && m.search)) bad.push('the probe passed with Feed above Find: it proves nothing');
        proved = !!m;
      }
      o.errors.forEach(e => bad.push(v.as + ': ' + e));
      await o.ctx.close();
    }
  } finally { await browser.close(); server.close(); }
  if (!proved) bad.push('the mutation proof could not run (no Feed or Find section)');
  if (bad.length) { console.log('FAILED — Find is not first:\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('OK — Find\'s search box is the first thing under the top bar signed out, as a student and as an admin; Feed above it fails the probe.');
})().catch(e => { console.error('find-first: ' + (e && e.stack || e)); process.exit(2); });
