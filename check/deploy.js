#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/deploy.js

   DOES A PUSH REACH A PHONE THAT ALREADY HAS THE SITE?

   REPORTED AS "when i first go on site it shows old reels looking set up. then i hard refresh then
   it works fine???" — and it was true, on the live site, for every visitor. Two faults, neither
   visible in the source and neither reachable by any check that existed:

     1. `sw.js` decided what a navigation was by its PATHNAME: `url.pathname === '/'`. GitHub Pages
        serves a project site from `/family/`, which is neither `/` nor anything ending in
        `index.html` — so the entry point fell through to the file branch, whose first act is to
        serve an exact URL match with no network at all. The entry point is the ONE url that
        carries no deploy stamp, so it matched itself for ever: every visitor pinned to whichever
        build first filed it away, with `LOAD` inside it naming that build's urls, so every other
        file was an exact hit too. The whole old site, permanently, escapable only by a hard
        refresh.

     2. Even where the page branch WAS reached, it fetched with the request's default cache mode.
        GitHub Pages sends `max-age=600` on HTML and nothing can change that — so for ten minutes
        after a deploy the browser answered out of its own store and never touched the network.

   WHY NOTHING CAUGHT IT. `check/load.js` serves the repository at `/`, so fault 1's guess was true
   on every run it has ever made, and it measures TIMES AND BYTES — a stale load is fast and small,
   which is the flattering direction. This check asks the one question neither of those can: after
   a deploy, does the browser run the NEW code. Nothing about bytes, nothing about milliseconds, so
   its answer does not move with the machine.

   HOW IT ASKS. Three loads and two deploys, because the poisoned entry is WRITTEN on load 2 and
   only bites on load 3 — a worker never controls the page that registered it, so load 1 is
   uncontrolled, load 2 is the first the worker sees, and load 3 is the first that can be answered
   out of what load 2 filed. A two-load version of this check passed against the broken worker.

   A deploy is: one file really changes, and `index.html`'s own date moves an HOUR. `LOAD` buckets
   to five minutes, so touching it by seconds changes nothing four times out of five — which has
   already been reported twice in this project as "0 KB after a deploy" for a deploy that had not
   happened.

   AT BOTH BASE PATHS, because the fault was base-path-dependent and the lab's own base path is
   what hid it. `/family/` is where the site really is; `/` is where every other harness here puts
   it.

     node check/deploy.js
================================================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.DEPLOY_PORT || 8731);

let chromium;
try { ({ chromium } = require('playwright')); } catch (err) {
  console.error('check/deploy: playwright is not installed. `npm install` first.');
  process.exit(1);
}
const CHROME = process.env.CHROME ||
  (fs.existsSync('/opt/pw-browsers') &&
    (fs.readdirSync('/opt/pw-browsers').filter(n => n.startsWith('chromium-'))
      .map(n => path.join('/opt/pw-browsers', n, 'chrome-linux', 'chrome'))
      .find(p => fs.existsSync(p)))) || undefined;

/* THE FILES THE DEPLOY TOUCHES, and they are put back whatever happens — including on a throw.
   A check that leaves the working tree edited is a check somebody commits by accident. */
const POSTS = path.join(ROOT, 'js', 'posts.js');
const PAGE = path.join(ROOT, 'index.html');
const postsWas = fs.readFileSync(POSTS);
const pageWas = fs.statSync(PAGE);
const restore = () => {
  try { fs.writeFileSync(POSTS, postsWas); } catch (err) { /* nothing better to do */ }
  try { fs.utimesSync(PAGE, pageWas.atime, pageWas.mtime); } catch (err) { /* same */ }
};
process.on('exit', restore);

/* ---------- A SERVER THAT ANSWERS LIKE GITHUB PAGES ------------------------------------------------
   The two headers that matter are the ones the faults turned on: an `ETag` on everything, because
   the worker's whole design is conditional requests, and `max-age=600` on the HTML, which is what
   Pages sends and what no repository setting can change. Serving the page `no-cache` here would be
   a lab that agrees with the comment rather than with the server. */
function serve(base) {
  const seen = [];
  const srv = http.createServer((rq, rs) => {
    const url = rq.url.split('?')[0];
    if (base && !url.startsWith(base)) { rs.writeHead(404); return rs.end(); }
    let rel = url.slice(base.length) || '/';
    if (rel === '/') rel = '/index.html';
    const f = path.join(ROOT, decodeURI(rel));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      rs.writeHead(404); return rs.end();
    }
    const body = fs.readFileSync(f);
    const st = fs.statSync(f);
    const tag = '"' + st.size.toString(16) + '-' + Math.floor(st.mtimeMs).toString(16) + '"';
    const type = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
                   '.html': 'text/html', '.png': 'image/png' }[path.extname(f)] || 'text/plain';
    const isPage = rel === '/index.html';
    /* ONLY A GET COUNTS AS THE PAGE BEING ASKED FOR. The first version of this counted every
       request and reported the entry point re-fetched on a load that ran entirely old code —
       because `watchBuild_` sends a HEAD to read the ETag, and a HEAD goes past the worker by
       design. A number that counts the wrong rows stops meaning anything. */
    if (isPage && rq.method === 'GET') seen.push(url);
    const head = { 'content-type': type, 'last-modified': st.mtime.toUTCString(), etag: tag,
                   'cache-control': isPage ? 'max-age=600' : 'max-age=600' };
    if (rq.headers['if-none-match'] === tag) { rs.writeHead(304, head); return rs.end(); }
    rs.writeHead(200, head);
    rs.end(rq.method === 'HEAD' ? undefined : body);
  });
  return new Promise(done => srv.listen(PORT, () => done({ srv, seen })));
}

function deploy(marker, hours) {
  fs.writeFileSync(POSTS, postsWas + '\nfunction ' + marker + '() { return 1; }\n');
  const when = new Date(Date.now() + hours * 3600e3);
  fs.utimesSync(PAGE, when, when);
}

async function run(base) {
  const { srv, seen } = await serve(base);
  const br = await chromium.launch({ executablePath: CHROME });
  try {
    const ctx = await br.newContext();
    /* The backend is another origin; this check is about the files, not the payload. */
    await ctx.route('**script.google.com**', r => r.fulfill({ status: 200, body: '{}' }));
    const at = 'http://127.0.0.1:' + PORT + base + '/';

    /* A NEW TAB PER LOAD, NOT `goto` TWICE. Chromium treats a navigation to the url already in the
       address bar as a RELOAD, and a reload's request carries `cache: 'no-cache'` — so the
       browser's own ten-minute hold on the entry point is bypassed for free and the harness
       measures a case nobody is in. "When i first go on site" is a fresh navigation: a bookmark, a
       home-screen icon, a tapped link. The context is shared, so the HTTP cache, the store and the
       registration are all the same ones; only the navigation is a real one. */
    const first = await ctx.newPage();
    await first.goto(at, { waitUntil: 'load' });
    await first.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 20000 })
      .catch(() => {});
    const controlled = await first.evaluate(() => !!navigator.serviceWorker.controller);
    await first.close();

    const rounds = [];
    for (const [n, marker] of [[1, 'DEPLOY_ONE_'], [2, 'DEPLOY_TWO_']]) {
      deploy(marker, n);
      seen.length = 0;
      const pg = await ctx.newPage();
      await pg.goto(at, { waitUntil: 'load' });
      await pg.waitForTimeout(1200);
      const got = await pg.evaluate(m => ({
        ran: typeof window[m] === 'function', load: window.LOAD,
      }), marker);
      got.asked = seen.length;
      rounds.push(got);
      await pg.close();
    }
    return { controlled, rounds };
  } finally {
    await br.close();
    srv.close();
    restore();
  }
}

(async () => {
  const bad = [];
  console.log('');
  for (const base of ['/family', '']) {
    const { controlled, rounds } = await run(base);
    console.log('SERVED AT ' + (base || '') + '/   (' +
                (base ? 'where GitHub Pages puts a project site' : 'where every other harness here puts it') + ')');
    if (!controlled) {
      bad.push((base || '/') + ' — no service worker ever took control, so nothing was measured');
      console.log('  the worker never took control — NOTHING WAS MEASURED');
    }
    rounds.forEach((r, i) => {
      console.log('  deploy ' + (i + 1) + ': entry point asked for ' + r.asked + 'x, LOAD ' + r.load +
                  ', new code ' + (r.ran ? 'RAN' : 'DID NOT RUN'));
      if (!r.ran) bad.push((base || '/') + ' — deploy ' + (i + 1) + ' did not reach the browser');
    });
    console.log('');
  }

  if (bad.length) {
    console.log('A DEPLOY THAT DID NOT LAND  (' + bad.length + ')');
    for (const b of bad) console.log('  ' + b);
    console.log('');
    console.log('The browser went on running the previous build on an ordinary load. That is the ' +
                'fault a hard refresh hides and nobody should have to know about.');
    process.exit(1);
  }
  console.log('OK — two deploys at two base paths, each running on the next ordinary load.');
})().catch(err => { restore(); console.error(err); process.exit(1); });
