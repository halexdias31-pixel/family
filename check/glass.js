/* @family. — check/glass.js THE APP ON THE GLASS, FOR THE POLISH CHECKS (531): one server, one browser, three visitors at three widths, and a folder of scenarios run on each. */
/* check/steady.js, jank.js and touch.js are this plus their own instrument; a package adds a scenario as a file in their folder and edits nothing else. */
/* A scenario exports { name, what, run(page, ctx), viewers?, widths?, report? }. `run` returns findings (strings), or null when it could not reach its subject, which always fails. */
/* `report: true` prints its findings and never fails: a figure nobody has proven yet starts that way. */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
/* A STRANGER AND A STUDENT ARE SENT WHAT doGet SENDS THEM, as check/ui.js does: no admin-only films. */
const FIXTURE_ANON = (() => {
  try { const o = JSON.parse(FIXTURE); o.films = []; delete o.filmsSync; return JSON.stringify(o); }
  catch (e) { return FIXTURE; }
})();
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
               '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webp': 'image/webp' };

const VIEWERS = [
  { as: 'out', user: null },
  { as: 'student', user: { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], handle: 'sam_quick12' } },
  { as: 'admin', user: { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], handle: 'testadmin' } },
];
/* A SMALL PHONE, A COMMON PHONE AND A LAPTOP: the three widths every audit lens measured. */
const SIZES = [[320, 568], [390, 844], [1280, 800]];

const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];

function serve(portVar) {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      const lib = require('./lib-full.js').serve(p);
      if (lib !== null) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(lib); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(Number(process.env[portVar] || 0), () => ok(s));
  });
}

/* EVERY MODULE IN THE FOLDER, in name order; `--only=<name>` narrows it. */
function modules(dir) {
  const only = arg('only');
  const at = path.join(__dirname, dir);
  if (!fs.existsSync(at)) return [];
  return fs.readdirSync(at).filter(f => /\.js$/.test(f)).sort()
    .map(f => Object.assign({ file: dir + '/' + f }, require(path.join(at, f))))
    .filter(m => !only || m.name === only);
}

/* THE APP OPENED AS ONE VISITOR AT ONE SIZE, settled: payload and library in, then `settle` ms of quiet. */
async function open(browser, port, v, w, h, opts) {
  const o = opts || {};
  const phone = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1,
                                         hasTouch: phone, isMobile: phone });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
  if (v.user) await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, v.user);
  if (o.init) await page.addInitScript(o.init);
  const admin = v.user && (v.user.roles || []).indexOf('admin') !== -1;
  await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json',
                                                                  body: admin ? FIXTURE : FIXTURE_ANON }));
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  const ready = await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED
    && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 30000 }).then(() => true, () => false);
  /* WHEN IT ARRIVED, in the page's clock, so a scenario can read what happened in the landing it did not watch. */
  const readyAt = ready ? await page.evaluate(() => performance.now()) : 0;
  await page.waitForTimeout(o.settle == null ? 1500 : o.settle);
  return { page, ctx, errors, ready, readyAt };
}

/* THE RUN: one browser, every size and visitor, every module that asks for them. Exits 0, 1 (a finding) or 2 (no subject). */
async function run(o) {
  const { chromium } = require('playwright');
  const tag = o.tag;
  const mods = modules(o.dir);
  if (!mods.length) { console.error(`${tag}: no scenario in check/${o.dir}/ — nothing to measure`); process.exit(2); }
  const W = Number(arg('width') || 0), AS = arg('as');
  const server = await serve(o.portVar);
  const port = server.address().port;
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error(`${tag}: no browser — ${e.message}`); server.close(); process.exit(2); }
  const fail = [], notes = [];
  let ran = 0, combos = 0;
  try {
    for (const [w, h] of SIZES.filter(s => !W || s[0] === W)) {
      for (const v of VIEWERS.filter(x => !AS || x.as === AS)) {
        const mine = mods.filter(m => (!m.widths || m.widths.indexOf(w) !== -1) && (!m.viewers || m.viewers.indexOf(v.as) !== -1));
        if (!mine.length) continue;
        combos++;
        const where = `${v.as} @${w}`;
        const s = await open(browser, port, v, w, h, { init: o.init, settle: o.settle });
        try {
          if (!s.ready) { fail.push(`${where}: the payload or the library never arrived — nothing here was measured`); continue; }
          for (const m of mine) {
            let got;
            try { got = await m.run(s.page, { as: v.as, user: v.user, width: w, height: h, where, errors: s.errors, readyAt: s.readyAt }); }
            catch (e) { got = null; fail.push(`${where} ${m.name}: threw — ${String(e.message).split('\n')[0]}`); continue; }
            ran++;
            if (got === null) { fail.push(`${where} ${m.name}: could not reach its subject`); continue; }
            (m.report ? notes : fail).push(...got.map(x => `${where} ${m.name}: ${x}`));
          }
        } finally { await s.ctx.close(); }
      }
    }
  } finally { await browser.close(); server.close(); }
  if (!ran) fail.push('no scenario ran — the filters left nothing, so nothing was measured');
  if (notes.length) { console.log(`${tag}: report only (${notes.length}):`); notes.forEach(n => console.log('  ' + n)); }
  if (fail.length) {
    console.error(`${tag}: ${fail.length} finding(s)`);
    fail.forEach(f => console.error('  ! ' + f));
    process.exit(1);
  }
  console.log(`${tag}: ${o.green} — ${ran} scenario run(s), ${mods.length} module(s), ${combos} visitor/width pair(s)`);
}

module.exports = { VIEWERS, SIZES, FIXTURE, FIXTURE_ANON, serve, modules, open, run, arg };
