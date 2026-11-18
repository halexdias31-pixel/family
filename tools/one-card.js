#!/usr/bin/env node
/* @family. — tools/one-card.js THE ONE-CARD CHECK (rule 1.75, owner 17 Nov): every card a child or parent sees in Find is drawn by the one maker
   (`renderCard` / `findCard`: `.card.fc.kc`, and nothing but its `kc-*` parts as children) and has no CSS keyed on a class of its own.
   Counted site-wide on an iPhone 13, each Find door opened at once on the served bundles with tools/lib/payload.json as the backend's answer.
   Prints the count; a card outside the rule fails the build. Run by tools/build.js after the bundles. */
'use strict';
const fs = require('fs'), http = require('http'), path = require('path');
const ROOT = path.join(__dirname, '..'), PORT = 8131;
/* THE ONE MAKER'S OWN CLASSES, and the state classes every card may wear. */
const BASE = /^(card|fc|kc|kc-[\w-]+|is-empty|is-off|is-locked|tap)$/;
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

async function run() {
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const styled = c => new RegExp('\\.' + c.replace(/-/g, '\\-') + '(?![\\w-])').test(css);
  const payload = fs.readFileSync(path.join(ROOT, 'tools/lib/payload.json'), 'utf8');
  const { chromium, devices } = require('playwright');
  const srv = http.createServer((q, s) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(b); });
  }).listen(PORT);
  const b = await chromium.launch();
  const open = async () => {
    const c = await b.newContext({ ...devices['iPhone 13']});
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { localStorage.setItem('familyUser', JSON.stringify({ name: 'Test Admin', handle: 'testadmin', personId: 'P001', role: 'admin', token: 'tok' })); } catch (e) {} });
    await pg.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: payload }));
    await pg.goto('http://localhost:' + PORT + '/');
    await pg.waitForFunction(() => typeof DATA !== 'undefined' && DATA && (DATA.tutors || []).length, null, { timeout: 90000 });
    await pg.waitForTimeout(1500);
    return pg;
  };
  const click = async (pg, t) => { try { await pg.getByText(t, { exact: true }).locator('visible=true').first().click({ timeout: 4000 }); await pg.waitForTimeout(1500); } catch (e) { /* a door with no second step */ } };
  try {
    const first = await open();
    await first.waitForSelector('#stuff-groups [data-value]', { state: 'attached', timeout: 30000 }).catch(() => {});
    const doors = await first.evaluate(() => [...document.querySelectorAll('#stuff-groups [data-value]')].map(e => e.dataset.value).filter(Boolean));
    await first.context().close();
    /* THREE DOORS AT ONCE: more and a phone-sized page under load misses its taps. */
    const look = async d => {
      const pg = await open();
      await click(pg, d); await click(pg, "Doesn't matter");
      /* SETTLED: the same number of cards twice, half a second apart (eight seconds at most). */
      for (let i = 0, last = -1; i < 16; i++) { const n = await pg.evaluate(() => document.querySelectorAll('#screen .card').length); if (n && n === last) break; last = n; await pg.waitForTimeout(500); }
      const cards = await pg.evaluate(() => [...document.querySelectorAll('#screen .card')].filter(e => !e.parentElement.closest('.card')).slice(0, 60)
        .map(e => ({ n: e.getAttribute('aria-label') || e.innerText.slice(0, 30), c: e.className, kc: e.matches('.fc.kc') && [...e.children].every(k => /^kc-/.test(k.className)) })));
      await pg.context().close();
      return cards.filter(x => x.n !== 'Find').map(x => ({ door: d, n: x.n, kc: x.kc, own: x.c.split(/\s+/).filter(c => c && !BASE.test(c) && styled(c)) }));
    };
    const per = [], todo = doors.slice();
    await Promise.all([0, 1, 2].map(async () => { while (todo.length) per.push(await look(todo.shift())); }));
    if (!doors.length) throw new Error('one-card: Find showed no doors — the app did not start');
    const all = [].concat(...per), bad = all.filter(x => !x.kc || x.own.length);
    console.log('one-card: ' + (all.length - bad.length) + '/' + all.length + ' cards drawn by the one maker with no CSS of their own');
    console.log('  by door: ' + doors.map(d => d + ' ' + all.filter(x => x.door === d).length).join(', '));
    bad.forEach(x => console.log('  ' + x.door + ' › ' + String(x.n).replace(/\n/g, ' ') + ' [' + (x.kc ? '' : 'not one maker; ') + x.own.join(' ') + ']'));
    if (bad.length) throw new Error('one-card: ' + bad.length + ' card(s) outside the one maker');
    if (!all.length) throw new Error('one-card: no cards drawn — the app did not start');
  } finally { await b.close(); srv.close(); }
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e.message || e); process.exit(1); });
