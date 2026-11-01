#!/usr/bin/env node
/* @family. — check/firstpaint.js THE FINDER'S FIRST PAINT IS ITS LAST (546). Port FIRSTPAINT_PORT. */
/* A cold load at 390px on a phone's network and CPU, as an admin and as a child, opening on Find or Find 2: the first question's answers */
/* never change from the frame they first appear until every file is in, and they are then what the live library asks. */
'use strict';
require('./quiet');
const fs = require('fs'), path = require('path'), http = require('http'), zlib = require('zlib');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.FIRSTPAINT_PORT || 8171);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
const lib = require('./lib-full.js');
const GZ = new Map();
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml' };

/* COMPRESSED AS PAGES SENDS IT, or 22 MB of question cards over a phone's link would make every wait a minute long. */
function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const url = rq.url.split('?')[0], f = path.join(ROOT, decodeURI(url));
      let body = null;
      const full = lib.serve(f);
      if (full !== null) body = () => Buffer.from(full);
      else if (f.startsWith(ROOT) && fs.existsSync(f) && !fs.statSync(f).isDirectory()) body = () => fs.readFileSync(f);
      if (!body) { rs.writeHead(404); return rs.end(); }
      const type = TYPES[path.extname(f)] || 'text/plain';
      if (/gzip/.test(rq.headers['accept-encoding'] || '') && /json|text|javascript/.test(type)) {
        if (!GZ.has(f)) GZ.set(f, zlib.gzipSync(body(), { level: 1 }));
        rs.writeHead(200, { 'content-type': type, 'content-encoding': 'gzip' });
        return rs.end(GZ.get(f));
      }
      rs.writeHead(200, { 'content-type': type });
      rs.end(body());
    }).listen(PORT, () => done(srv));
  });
}

/* EVERY FRAME, what the first question's answers say, once they say anything. */
function WATCH(col) {
  window.__fp = { lists: [], err: '' };
  let last = null;
  const tick = () => {
    try {
      const g = document.getElementById(col + '-groups');
      const ks = g ? [...g.querySelectorAll('[data-do="facet-pick"] .k')].map(e => e.textContent.trim()) : [];
      const s = ks.join(' | ');
      if (ks.length && s !== last) { window.__fp.lists.push({ at: Math.round(performance.now()), s }); last = s; }
    } catch (e) { window.__fp.err = String(e && e.message); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const VIEWERS = [
  { who: 'an admin', user: { name: 'Sam Admin', personId: 'P9', role: 'admin', roles: ['admin'] } },
  { who: 'a ten-year-old', user: { name: 'Kit Kid', personId: 'P8', role: 'student', roles: ['student'], profile: { age: 10 } } },
];

(async () => {
  const srv = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const bad = [];
  let read = 0;
  for (const V of VIEWERS) for (const col of ['stuff', 'res']) {
    const where = `${V.who}, opening on ${col === 'stuff' ? 'Find' : 'Find 2'}`;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    try {
      const page = await ctx.newPage();
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 80, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.addInitScript(([u, c]) => {
        try {
          localStorage.setItem('familyUser', JSON.stringify(u));
          localStorage.setItem('familyTab', c); localStorage.setItem('familyTabAt', String(Date.now()));
        } catch (e) {}
      }, [V.user, col]);
      await page.addInitScript(WATCH, col);
      /* THE PAYLOAD LATE, as a cold Apps Script answers: the library and the writings land while it is still on its way. */
      await page.addInitScript(payload => {
        const real = window.fetch;
        window.fetch = function (u) {
          if (String((u && u.url) || u).indexOf('script.google.com') !== -1) {
            return new Promise(d => setTimeout(() => d(new Response(payload, { status: 200, headers: { 'content-type': 'application/json' } })), 2500));
          }
          return real.apply(this, arguments);
        };
      }, FIXTURE);
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'commit' });
      await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof finderSettled_ === 'function' && finderSettled_(),
        null, { timeout: 240000, polling: 250 });
      await new Promise(r => setTimeout(r, 1500));
      const r = await page.evaluate(c => {
        const F = FINDERS[c];
        const live = inFinder_(F, () => {
          const items = stuffFiltered(), f = items.length ? nextFacet(items) || overFacet_(items) : null;
          return f ? facetValues(items, f).map(v => v.show || v.value) : [];
        });
        return { lists: window.__fp.lists, err: window.__fp.err, live: live.join(' | '), chips: (STUFF.filters || []).length };
      }, col);
      read++;
      if (r.err) bad.push(`${where}: the watcher threw — ${r.err}`);
      if (!r.lists.length) bad.push(`${where}: no answer was ever drawn under the first question — nothing was measured`);
      else {
        if (r.lists.length > 1) {
          bad.push(`${where}: the first question's answers changed ${r.lists.length - 1} time(s) after they were first drawn —\n`
            + r.lists.map(l => `        ${String(l.at).padStart(6)}ms  ${l.s.slice(0, 150)}`).join('\n'));
        }
        const end = r.lists[r.lists.length - 1].s;
        /* THE SHORTER SIDE IS THE DRAWN ONE: a long list is cut to the short labels the chips say, so they are compared as the chips say them. */
        if (r.live && end.split(' | ').length !== r.live.split(' | ').length) {
          bad.push(`${where}: what was drawn is not what the library asks once it is all in — run node tools/finder-tags.js\n        drawn ${end.slice(0, 150)}\n        live  ${r.live.slice(0, 150)}`);
        }
      }
      console.log(`   ${where.padEnd(32)} ${r.lists.length} list(s) drawn: ${r.lists.map(l => l.at + 'ms').join(', ')}`);
    } catch (e) {
      bad.push(`${where}: the run threw — ${String(e && e.message || e).slice(0, 200)}`);
    } finally { await ctx.close(); }
  }
  await browser.close();
  srv.close();
  if (bad.length) {
    console.log('\nTHE FINDER\'S FIRST PAINT IS NOT ITS LAST:\n' + bad.map(b => '   ' + b).join('\n'));
    process.exit(1);
  }
  console.log(`OK — the finder's first answers were drawn once and never changed, ${read} cold loads (an admin and a child, Find and Find 2, 390px, 4x CPU)`);
})().catch(e => { console.error('firstpaint: ' + (e && e.stack || e)); process.exit(2); });
