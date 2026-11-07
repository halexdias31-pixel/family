#!/usr/bin/env node
/* @family. — check/isolation.js A SECONDARY WIDGET CANNOT BREAK FIND (860): one throwing from markup, draw, start, stop, a timer and a frame is served in map.js; Find still boots, narrows and opens a question. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.ISOLATION_PORT || 8173);
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
/* THE BAD WIDGET: kind tool, so it is a Find card (790), and every way in throws. */
const BOOM = `{ id: 'boom', kind: 'tool', name: 'Boom isolation', what: 'A widget that throws', into: 'boom-slot',
    get html() { setTimeout(() => { throw new Error('E-boom-html-timer'); }, 0); throw new Error('E-boom-html'); },
    draw: () => { throw new Error('E-boom-draw'); },
    start: () => { setInterval(() => { throw new Error('E-boom-interval'); }, 50); requestAnimationFrame(() => { throw new Error('E-boom-frame'); }); throw new Error('E-boom-start'); },
    stop: () => { throw new Error('E-boom-stop'); } },
`;
const map = fs.readFileSync(path.join(ROOT, 'js', 'map.js'), 'utf8');
if (map.indexOf('const WIDGETS = [\n') === -1) { console.log('FAIL — check/isolation.js cannot find `const WIDGETS = [` in js/map.js, so NOTHING was checked'); process.exit(1); }
const MAP = map.replace('const WIDGETS = [\n', 'const WIDGETS = [\n' + BOOM);

function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const url = rq.url.split('?')[0];
      if (url === '/js/map.js') { rs.writeHead(200, { 'content-type': 'text/javascript' }); return rs.end(MAP); }
      const f = path.join(ROOT, decodeURI(url === '/' ? '/index.html' : url));
      const lib = require('./lib-full.js').serve(f);
      if (lib !== null) { rs.writeHead(200, { 'content-type': 'application/json' }); return rs.end(lib); }
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); }
      const type = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html' }[path.extname(f)] || 'application/octet-stream';
      rs.writeHead(200, { 'content-type': type }); rs.end(fs.readFileSync(f));
    });
    srv.on('error', e => { console.log('FAIL — check/isolation.js could not serve on port ' + PORT + ': ' + e.message); process.exit(1); });
    srv.listen(PORT, () => done(srv));
  });
}

(async () => {
  const fails = [], said = [];
  const srv = await serve();
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const uncaught = [];
    page.on('pageerror', e => uncaught.push(e.message));
    await page.addInitScript(p => {
      const real = window.fetch;
      window.__reports = [];
      window.fetch = function (u, o) {
        if (String((u && u.url) || u).indexOf('script.google.com') !== -1) {
          if (o && o.method === 'POST') {
            try { const b = JSON.parse(o.body); if (b.action === 'clientError') window.__reports.push(b.where + ' ' + b.message); } catch (e) {}
            return Promise.resolve(new Response('{}'));
          }
          return Promise.resolve(new Response(p, { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        return real.apply(this, arguments);
      };
    }, FIXTURE);
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'commit' });
    /* 1. BOOTS: the payload and the LATER files in, with the bad widget among them. */
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && LATER_IN, null, { timeout: 60000 })
      .catch(() => fails.push('the app never finished loading with a throwing secondary widget in map.js'));
    const has = await page.evaluate(() => typeof WIDGETS !== 'undefined' && WIDGETS.some(w => w.id === 'boom' && w.__tier === 'secondary'));
    if (!has) fails.push('the bad widget is not in WIDGETS, guarded as secondary, so it proved nothing');
    /* 2. THE BAD WIDGET RUNS: found in Find, its page drawn, started and stopped. */
    const ran = await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      /* SIGNED IN (dd5c20d): signed out, Find holds Settings alone, so nothing would narrow or open a question. */
      USER = { name: 'T', personId: 'P-T', role: 'Student', roles: ['student'], profile: {} };
      stuffForget_();
      go('stuff', true);
      await wait(400);
      finderSet_(FINDERS.stuff, { q: 'Boom isolation' });
      await wait(300);
      const i = inFinder_(FINDERS.stuff, () => stuffPages_().findIndex(pg => pg.x && pg.x.kind === 'tool' && /Boom/.test(pg.x.title || pg.x.name || '')));
      if (i >= 0) goPage('stuff', stuffFirstResult_() + i, true);
      await wait(900);
      const w = WIDGETS.find(x => x.id === 'boom');
      const r = { found: i >= 0, html: w.html, draw: w.draw(), start: w.start(), stop: w.stop() };
      await wait(400);
      return r;
    });
    if (!ran.found) said.push('the bad widget was not among Find\'s results; it was run directly');
    if (!/This part did not load/.test(ran.html || '')) fails.push('a throwing secondary widget\'s markup is not the "did not load" card');
    if (ran.draw !== false) fails.push('a throwing secondary widget\'s draw did not give false');
    /* 3. NARROWS: clear words, then words that match fewer things. */
    const nar = await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      finderSet_(FINDERS.stuff, { q: '' });
      await wait(300);
      const all = inFinder_(FINDERS.stuff, () => stuffFiltered().length);
      finderSet_(FINDERS.stuff, { q: 'fraction' });
      await wait(300);
      const some = inFinder_(FINDERS.stuff, () => stuffFiltered().length);
      return { all, some };
    });
    if (!(nar.all > 0 && nar.some > 0 && nar.some < nar.all)) fails.push('Find did not narrow: ' + nar.all + ' things, then ' + nar.some + ' for "fraction"');
    /* 4. OPENS A QUESTION: its page drawn in the Find column. */
    const q = await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const i = inFinder_(FINDERS.stuff, () => stuffPages_().findIndex(pg => pg.x && pg.x.kind === 'question'));
      if (i < 0) return { i };
      goPage('stuff', stuffFirstResult_() + i, true);
      await wait(1200);
      const host = document.getElementById('s-stuff');
      const text = host ? host.textContent : '';
      return { i, drawn: !!(host && host.querySelector('.qp-ans, .qp-mark, .qp-opts, [data-do="qp-check"], [data-act="qp-check"]')), broke: /did not draw/.test(text) };
    });
    if (q.i === undefined || q.i < 0) fails.push('no question among Find\'s results for "fraction"');
    else {
      if (q.broke) fails.push('the Find column says it did not draw');
      if (!q.drawn) fails.push('the question\'s page has no answer box or Check in the Find column');
    }
    /* 5. EVERY THROW REPORTED, NONE ESCAPED: the timers and the frame are guarded too. */
    const reps = await page.evaluate(() => window.__reports.slice());
    const boom = reps.filter(r => /E-boom/.test(r));
    ['html', 'draw', 'start', 'stop', 'interval', 'frame', 'html-timer'].forEach(k => {
      if (!boom.some(r => new RegExp('E-boom-' + k + '\\b').test(r))) fails.push('the bad widget\'s ' + k + ' throw was never reported through oops_');
    });
    const escaped = uncaught.filter(m => /E-boom/.test(m));
    if (escaped.length) fails.push(escaped.length + ' of the bad widget\'s throws escaped the guard: ' + [...new Set(escaped)].join(', '));
    uncaught.filter(m => !/E-boom/.test(m)).forEach(m => fails.push('uncaught: ' + m));
    reps.filter(r => !/E-boom/.test(r)).forEach(r => fails.push('reported besides the bad widget: ' + r));
    said.push(boom.length + ' throws reported, ' + escaped.length + ' escaped; Find ' + nar.all + ' → ' + nar.some + '; question at result ' + q.i);
    await ctx.close();
  } catch (e) {
    fails.push('the check itself threw: ' + (e && e.message));
  } finally {
    await browser.close(); srv.close();
  }
  if (process.env.VERBOSE === '1') said.forEach(s => console.log('   ' + s));
  if (fails.length) { [...new Set(fails)].forEach(f => console.log('FAIL — ' + f)); process.exit(1); }
  console.log('OK — isolation: a secondary widget throwing from its markup, draw, start, stop, a timer and a frame; Find booted, narrowed and opened a question (' + said[said.length - 1] + ')');
})();
