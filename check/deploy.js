#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/deploy.js DOES A PUSH REACH A PHONE THAT ALREADY HAS THE SITE? § */
const http = require('http');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
/* ---------- A COPY OF THE SITE, NOT THE SITE § */
const ROOT = fs.mkdtempSync(path.join(require('os').tmpdir(), 'family-deploy-'));
(function copySite_() {
  const DEEP = { js: 1 };
  fs.readdirSync(REPO).forEach(n => {
    if (n === '.git' || n === 'node_modules' || n === '.claude') return;
    const from = path.join(REPO, n), to = path.join(ROOT, n);
    const st = fs.statSync(from);
    if (!st.isDirectory()) return fs.copyFileSync(from, to);
    if (DEEP[n]) return fs.cpSync(from, to, { recursive: true });
    if (n === 'data') {
      fs.mkdirSync(to);
      fs.readdirSync(from).forEach(d => {
        if (d === 'textbooks.json') fs.copyFileSync(path.join(from, d), path.join(to, d));
        else fs.symlinkSync(path.join(from, d), path.join(to, d));
      });
      return;
    }
    fs.symlinkSync(from, to);
  });
})();
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

/* THE FILES THE DEPLOY TOUCHES — in the copy above, which is thrown away whatever happens. */
const POSTS = path.join(ROOT, 'js', 'posts.js');
const PAGE = path.join(ROOT, 'index.html');
/* ---------- AND A DATA FILE, BECAUSE THE WORKER PINNED THOSE TOO § */
const BOOKS = path.join(ROOT, 'data', 'textbooks.json');
const BOOK_LINE = '{"book_id":"TB-GCSE-MATHS","chapter":1,"title":"Number, factors and primes"';
const postsWas = fs.readFileSync(POSTS);
const pageWas = fs.statSync(PAGE);
const booksWas = fs.readFileSync(BOOKS);
/* BETWEEN THE TWO BASE PATHS THE COPY IS PUT BACK AS IT WAS; AT EXIT IT IS THROWN AWAY. */
const reset = () => {
  try { fs.writeFileSync(POSTS, postsWas); } catch (err) { /* nothing better to do */ }
  try { fs.writeFileSync(BOOKS, booksWas); } catch (err) { /* same */ }
  try { fs.utimesSync(PAGE, pageWas.atime, pageWas.mtime); } catch (err) { /* same */ }
};
const restore = () => {
  try { fs.rmSync(ROOT, { recursive: true, force: true }); } catch (err) { /* nothing better to do */ }
};
process.on('exit', restore);

/* ---------- A SERVER THAT ANSWERS LIKE GITHUB PAGES § */
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
    /* ONLY A GET COUNTS AS THE PAGE BEING ASKED FOR. § */
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
  const books = booksWas.toString('utf8');
  if (books.indexOf(BOOK_LINE) < 0) throw new Error('data/textbooks.json has no line starting ' + BOOK_LINE + ' — the data half was NOT deployed');
  const PY = '.py-say b { color: var(--py); }';
  if (books.indexOf(PY) < 0) throw new Error('the Pythagoras row has no `' + PY + '` — the animation half was NOT deployed');
  fs.writeFileSync(BOOKS, books.replace(BOOK_LINE, BOOK_LINE.slice(0, -1) + ' ' + marker + '"')
    .replace(PY, PY + ' .py-say b.' + marker.toLowerCase().replace(/_/g, '') + ' { color: inherit; }'));
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

    /* A NEW TAB PER LOAD, NOT `goto` TWICE. § */
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
      /* THE CHAPTER'S NEW NAME, read off what the app built rather than off the network: `DATA` is the
         textbooks as `libraryExtras_` made them, so it is the copy a student would be shown. */
      got.book = await pg.waitForFunction(m => {
        try {
          const b = (DATA.textbooks || []).find(x => x.id === 'TB-GCSE-MATHS');
          const c = b && b.chapters.find(x => x.n === 1);
          return !!c && c.title.indexOf(m) !== -1;
        } catch (e) { return false; }
      }, marker, { timeout: 30000 }).then(() => true, () => false);
      /* AND THE DEVICE'S COPY OF PYTHAGORAS IS THE NEW ONE: its CSS has this deploy's change, and the
         hash the picker checks it by is the record's own. */
      got.anim = await pg.waitForFunction(m => {
        try {
          const idx = JSON.parse(localStorage.getItem('splashAnims'));
          const rec = JSON.parse(localStorage.getItem('splashAnim:pyth'));
          return rec.css.indexOf('.py-say b.' + m + ' ') !== -1 && idx.h.pyth === rec.h;
        } catch (e) { return false; }
      }, marker.toLowerCase().replace(/_/g, ''), { timeout: 30000 }).then(() => true, () => false);
      got.asked = seen.length;
      rounds.push(got);
      await pg.close();
    }
    return { controlled, rounds };
  } finally {
    await br.close();
    srv.close();
    reset();
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
                  ', new code ' + (r.ran ? 'RAN' : 'DID NOT RUN') +
                  ', the renamed chapter ' + (r.book ? 'SHOWN' : 'NOT SHOWN') +
                  ', the changed animation ' + (r.anim ? 'KEPT' : 'NOT KEPT'));
      if (!r.ran) bad.push((base || '/') + ' — deploy ' + (i + 1) + ' did not reach the browser');
      if (!r.book) bad.push((base || '/') + ' — deploy ' + (i + 1) + ' renamed a chapter in data/textbooks.json and the browser still had the old name');
      if (!r.anim) bad.push((base || '/') + ' — deploy ' + (i + 1) + ' changed Pythagoras in data/textbooks.json and the device kept the old drawing for its splash');
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
  console.log('OK — two deploys at two base paths, each running on the next ordinary load, data included.');
})().catch(err => { restore(); console.error(err); process.exit(1); });
