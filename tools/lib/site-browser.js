/* @family. — tools/lib/site-browser.js THE SITE ON A PHONE (UNIFY NEXT 1, 22 Nov): the served site (index.html, the bundles, the library with its
   words where this machine has them, tools/lib/payload.json as the backend's answer) opened on an iPhone 13, signed in as a role, its doors tapped.
   Every check that looks at the site in a browser takes it from here (tools/one-helper.js fails a hand-rolled server or launch).
   ONE SERVER AND ONE BROWSER PER ENGINE: tools/build.js calls share() first, and every browser check in the build reuses them (each page in its
   own fresh context, so no check sees another's storage); closeAll() at the end. Run alone, a check's done() closes what it opened. */
'use strict';
const fs = require('fs'), http = require('http'), path = require('path');
const { ROOT } = require('./gen.js');
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const PAYLOAD = () => fs.readFileSync(path.join(ROOT, 'tools/lib/payload.json'), 'utf8');

/* EACH ROLE'S ACCOUNT, as the phone keeps it in localStorage `familyUser`. */
const USERS = {
  child: { name: 'Finley Student', handle: 'finley', personId: 'P-E1', role: 'student', roles: ['student'], rank: 'student', token: 'tok' },
  family: { name: 'Carl Client', handle: 'carl', personId: 'P-E2', role: 'client', roles: ['client'], rank: 'client', token: 'tok' },
  tutor: { name: 'Ada Tutor', handle: 'ada', personId: 'P002', role: 'tutor', roles: ['tutor'], rank: 'staff', token: 'tok' },
  admin: { name: 'Test Admin', handle: 'testadmin', personId: 'P001', role: 'admin', roles: ['admin'], rank: 'admin', token: 'tok' },
};

let shared = false, srv = null, base = '';
const engines = {};

/* THE STATIC SERVER, on a free port. */
function serve() {
  if (srv) return Promise.resolve(base);
  const lib = require('./lib-full.js');
  srv = http.createServer((q, s) => {
    let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    /* UNDER /plain/: the library as the repository has it, metadata only (open({ words: false })). */
    const plain = p.startsWith('/plain/'); if (plain) p = p.slice(6);
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { s.writeHead(404); return s.end(); }
    let body = null; if (!plain) try { body = lib.serve(file); } catch (e) { body = null; }
    if (body !== null) { s.writeHead(200, { 'content-type': 'application/json' }); return s.end(body); }
    fs.readFile(file, (e, b) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); s.end(b); });
  });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => { base = 'http://localhost:' + srv.address().port; ok(base); }));
}

/* ONE BROWSER PER ENGINE ('chromium', 'webkit'); a failed launch throws, and is tried again next time. */
function browser(name) {
  const n = name || 'chromium';
  if (!engines[n]) engines[n] = require('playwright')[n].launch().catch(e => { delete engines[n]; throw e; });
  return engines[n];
}

/* open(opts): a fresh iPhone 13 page on the site, signed in, the backend answering `payload`.
   as        a USERS role (admin), or user: an account of its own
   at        the address after the site root ('' or '?card=...')
   ready     a predicate run in the page until true (default: DATA has tutors); ready:false waits for nothing
   settle    ms to wait once ready (1500)
   words     false: the library without its words (the repository's files)
   answer    q => object|null: the backend's answer to one call, by its body (else the payload) */
async function open(opts) {
  const o = opts || {}, { devices } = require('playwright');
  await serve();
  const b = await browser(o.engine);
  const c = await b.newContext({ ...devices['iPhone 13'], ...(o.dark ? { colorScheme: 'dark' } : {}) });
  try {
    const pg = await c.newPage();
    /* `as: 'none'` is nobody signed in: the welcome screen */
    if (o.as !== 'none') await pg.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, o.user || USERS[o.as || 'admin']);
    const body = o.payload || PAYLOAD();
    /* `answer(q)`: a check's own reply to one call (q the request's JSON body), else the payload. */
    await pg.route(/script\.google\.com/, r => { let a = null;
      if (o.answer) try { a = o.answer(JSON.parse(r.request().postData() || '{}')); } catch (e) { a = null; }
      return r.fulfill({ status: 200, contentType: 'application/json', body: a ? JSON.stringify(a) : body }); });
    /* `show: 'all'` (owner, 26 Nov): the library switch (settings.json `library.show`) flipped off in this page from its first script, for a check
       whose sample is a question kept but not listed (the old papers' drawing, marking and cards still work, for history and for the day it returns). */
    if (o.show) await pg.route(/\.js(\?|$)/, async r => { const res = await r.fetch(); const t = await res.text();
      return r.fulfill({ response: res, body: t.replace(/"library":\{"show":("[^"]*"|\[[^\]]*\])\}/g, '"library":{"show":' + JSON.stringify(o.show) + '}') }); });
    await pg.goto(base + (o.words === false ? '/plain/' : '/') + (o.at || ''));
    if (o.ready !== false) await pg.waitForFunction(o.ready || (() => typeof DATA !== 'undefined' && DATA && (DATA.tutors || []).length), null, { timeout: o.timeout || 90000 });
    /* AND THE LATE FILES IN (25 Nov): the texts, the Bible and the rest arrive after DATA, and each repaints the open column for half a second
       to a second -- a tap made meanwhile waited for a button that kept being drawn again, and missed (one-card's doors came back empty).
       Opened is settled: no request left, and no repaint still due. */
    if (o.ready !== false) {
      await pg.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
      await pg.waitForFunction(() => typeof WRITING_PAINT === 'undefined' || !WRITING_PAINT, null, { timeout: 30000 }).catch(() => {});
    }
    await pg.waitForTimeout(o.settle == null ? 1500 : o.settle);
    pg.close = () => c.close();
    return pg;
  } catch (e) { await c.close(); throw e; }
}

/* A TAP AS A FINGER MAKES IT: the visible words, then a breath; a door with no such step is no failure. */
async function tap(pg, t) {
  try { await pg.getByText(t, { exact: true }).locator('visible=true').first().click({ timeout: 4000 }); await pg.waitForTimeout(1500); } catch (e) { /* no such step */ }
}

/* A DOOR'S CARDS, OPENED AGAIN IF A TAP WAS MISSED (22 Nov: under load a phone-sized page misses taps): `look()` is tried up to 1 + tries
   times, until ok(result); the last result is returned whatever it is. */
async function retry(look, ok, tries) {
  let r;
  for (let i = 0; i <= (tries == null ? 2 : tries); i++) { r = await look(i); if (ok(r)) return r; }
  return r;
}

/* N AT ONCE: `todo` worked through by n workers (three: more and a phone-sized page under load misses its taps). */
async function pool(todo, n, fn) {
  const left = todo.slice(), out = [];
  await Promise.all(Array.from({ length: n || 3 }, async () => { while (left.length) { const x = left.shift(); out.push(await fn(x)); } }));
  return out;
}

const share = () => { shared = true; };
async function closeAll() {
  const bs = await Promise.all(Object.keys(engines).map(n => engines[n].catch(() => null)));
  Object.keys(engines).forEach(n => delete engines[n]);
  await Promise.all(bs.filter(Boolean).map(b => b.close().catch(() => {})));
  if (srv) { srv.close(); srv = null; }
}
/* A CHECK'S LAST LINE: alone, it closes what it opened; in the build, the build does. */
const done = () => (shared ? Promise.resolve() : closeAll());

module.exports = { open, tap, retry, pool, browser, serve, share, done, closeAll, USERS, PAYLOAD };
