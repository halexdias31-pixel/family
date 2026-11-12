#!/usr/bin/env node
/* @family. — check/offline.js A PAPER MADE AVAILABLE OFFLINE (owner, 11 Nov): downloaded, the connection cut, the app reopened from the worker, */
/* parts answered and rule-marked, an AI part held; back online, every press reaches the account exactly once (event ids) and the AI part is marked. */
/* A real browser (Playwright, context.setOffline), the real files, the words from data-private/ through a stand-in `libItems`. --shots=<dir> writes 390px PNGs. Port: OFFLINE_PORT. */
'use strict';
require('./quiet');
const fs = require('fs');
const path = require('path');
const http = require('http');
const LIB_FULL = require('./lib-full.js');

const ROOT = path.join(__dirname, '..');
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || '';
/* A WORKSHEET WHOSE PARTS A RULE MARKS (each has `accept`, and figures), and a paper with a part only the AI marks. */
const RULE_PAPER = 'W-1CM-similar-shapes', AI_PAPER = 'R0372';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
               '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const USER = { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], handle: 'sam_quick12', token: 'tok-sam' };

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(Number(process.env.OFFLINE_PORT || 0), () => ok(s));
  });
}

/* THE BACKEND, STOOD IN FOR: the payload, the words by wire id, submissions counted by event id, an AI mark. */
function backend(words) {
  const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8'));
  fx.films = []; delete fx.filmsSync;
  fx.features = (fx.features || []).concat(['submitAnswer', 'saveAnswers', 'myAnswers', 'libItems']);
  fx.libGen = 'g-offline';
  fx.aiMarking = true;
  const B = { offline: false, seen: {}, posts: [], ai: 0, payload: JSON.stringify(fx) };
  B.handle = async route => {
    const rq = route.request();
    if (B.offline) return route.abort('internetdisconnected');
    if (rq.method() !== 'POST') return route.fulfill({ status: 200, contentType: 'application/json', body: B.payload });
    let b = {};
    try { b = JSON.parse(rq.postData() || '{}'); } catch (e) { b = {}; }
    B.posts.push(b.action);
    let out = { success: true };
    if (b.action === 'libItems') {
      const items = {}, missing = [];
      (b.ids || []).forEach(t => { const m = /^q:(.+)$/.exec(t); const w = m && words[m[1]]; if (w) items[t] = w; else missing.push(t); });
      out = { success: true, items, missing, gen: 'g-offline' };
    } else if (b.action === 'submitAnswer') {
      const saved = {};
      (b.items || []).forEach(ev => { B.seen[ev.id] = (B.seen[ev.id] || 0) + 1; saved[ev.id] = { at: ev.at }; });
      out = { success: true, saved };
    } else if (b.action === 'aiMark') {
      B.ai++;
      out = { success: true, awarded: 1, available: Number(b.marks) || 1, feedback: 'Marked once online.' };
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(out) });
  };
  return B;
}

/* THE PAPER'S QUESTIONS IN FIND, its first result in front. */
const openPaper = (page, pid) => page.evaluate(async pid => {
  finderSet_(FINDERS.stuff, { filters: [{ field: 'paperId', value: pid }], show: true });
  await new Promise(r => setTimeout(r, 400));
  inFinder_(FINDERS.stuff, () => goPage('stuff', stuffFirstResult_(), true));
  await new Promise(r => setTimeout(r, 600));
  return inFinder_(FINDERS.stuff, () => stuffPages_().length);
}, pid);
/* EVERY CARD OF THE PAPER drawn into Find's own page in front, so each part's controls are on the glass. */
const drawAll = (page, pid) => page.evaluate(async pid => {
  const items = offPaperItems_(pid);
  /* ASKED AS A CARD ON THE GLASS ASKS: online, the backend; offline, the device's copy. */
  items.forEach(x => libWant_(x));
  for (let i = 0; i < 40 && items.some(x => libSlim_(x)); i++) await new Promise(r => setTimeout(r, 100));
  const host = document.querySelector('#s-stuff > .page.on') || document.querySelector('#s-stuff');
  const box = document.createElement('div');
  box.id = 'off-host';
  box.innerHTML = items.map(x => { try { return findCard(x); } catch (e) { return ''; } }).join('');
  const old = document.getElementById('off-host');
  if (old) old.remove();
  host.prepend(box);
  return items.length;
}, pid);

async function main() {
  let words = null;
  try { words = LIB_FULL.readPrivate('questions'); } catch (e) { words = null; }
  if (!words || LIB_FULL.isAbsent && process.env.LIB_PRIVATE === 'absent') { LIB_FULL.needWords('offline'); return; }
  const server = await serve();
  const port = server.address().port;
  const { chromium } = require('playwright');
  let browser;
  try { browser = await chromium.launch(); } catch (e) { console.error('offline: no browser — ' + e.message); server.close(); process.exit(2); }
  const bad = [], said = [];
  const B = backend(words);
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    await ctx.route('**://script.google.com/**', B.handle);
    await ctx.addInitScript(u => { try { if (!localStorage.getItem('familyUser')) localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, USER);
    /* EVERY TOAST, so opening the app offline can be shown to say nothing nobody pressed for. */
    await ctx.addInitScript(() => { const iv = setInterval(() => { if (typeof toast === 'function' && !toast.__spy) { clearInterval(iv); const t = toast; window.toast = function (m) { (window.__ts = window.__ts || []).push(m + ' @ ' + new Error().stack.split('\n').slice(2, 7).join(' | ')); return t.apply(this, arguments); }; window.toast.__spy = 1; } }, 2); });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
    const ready = () => page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS
      && typeof offTileOpts_ === 'function' && typeof findCard === 'function', null, { timeout: 40000 }).then(() => true, () => false);
    await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'domcontentloaded' });
    if (!(await ready())) { bad.push('the app never loaded online — nothing was downloaded'); throw new Error('stop'); }
    await page.waitForTimeout(1500);

    /* 1. DOWNLOAD BOTH, by the tile on a part's row (behind ⋯), as a student would. */
    for (const pid of [RULE_PAPER, AI_PAPER]) {
      const n = await drawAll(page, pid);
      if (!n) { bad.push(pid + ': no questions in Find — nothing to download'); continue; }
      const tile = page.locator(`#off-host .off-get[data-pid="${pid}"]`).first();
      if (!(await tile.count())) { bad.push(pid + ': no "Make available offline" tile on its question cards'); continue; }
      await tile.evaluate(el => el.click());
      const done = await page.waitForFunction(pid => offHas_(pid), pid, { timeout: 70000 }).then(() => true, () => false);
      if (!done) bad.push(pid + ': the download never finished');
    }
    const kept = await page.evaluate(() => { const p = offRead_('papers'); return Object.keys(p).map(id => ({ id, n: (p[id].ids || []).length, on: (p[id].ids || []).filter(t => LIB.disk && LIB.disk.has(t)).length })); });
    kept.forEach(k => { if (!k.n || k.on !== k.n) bad.push(k.id + ': ' + k.on + ' of ' + k.n + ' rows with words are on the device'); });
    said.push('downloaded ' + kept.map(k => k.id + ' (' + k.on + ' rows)').join(', '));

    /* 2. NO CONNECTION, AND THE APP OPENED AGAIN: from the worker's store, the kept payload and the library's copy. */
    B.offline = true;
    await ctx.setOffline(true);
    const postsBefore = B.posts.length;
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(e => bad.push('offline, the page did not open: ' + e.message.split('\n')[0]));
    if (!(await ready())) { bad.push('offline, the app did not start (worker store, kept payload or library file missing)'); throw new Error('stop'); }
    await page.waitForTimeout(2000);
    const toasts = await page.evaluate(() => window.__ts || []); if (toasts.length) bad.push('offline, opening the app toasted: ' + toasts.map(t => t.split(' @ ')[0]).join(' | '));
    const front =await page.evaluate(() => { const h = offlinePages_().join(''); return { h, line: offSyncLine_() }; });
    [RULE_PAPER, AI_PAPER].forEach(pid => { if (front.h.indexOf('data-pid="' + pid + '"') === -1) bad.push('offline, Find\'s "On this device" card does not list ' + pid); });
    if (!/^Offline/.test(front.line)) bad.push('offline, the sync line says "' + front.line + '"');
    if (SHOTS) {
      fs.mkdirSync(SHOTS, { recursive: true });
      await page.evaluate(() => { inFinder_(FINDERS.stuff, () => { STUFF.filters = []; paintStuff(); goPage('stuff', stuffQuestionPage_() + 1, true); }); });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SHOTS, 'offline-1-find.png') });
    }

    /* 3. THE WORKSHEET, OFFLINE: its words came from the device; two parts answered and marked here. */
    const pages = await openPaper(page, RULE_PAPER);
    if (!pages) bad.push('offline, Open on the worksheet found no pages in Find');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'offline-2-paper.png') });
    await drawAll(page, RULE_PAPER);
    const slim = await page.evaluate(pid => offPaperItems_(pid).filter(x => libSlim_(x)).length, RULE_PAPER);
    if (slim) bad.push('offline, ' + slim + ' question(s) of the worksheet are still waiting for words');
    const answers = { 'Q-1CM-similar-shapes-1': '16', 'Q-1CM-similar-shapes-3': '4' };
    const marks = await page.evaluate(async answers => {
      const out = {};
      for (const id of Object.keys(answers)) {
        const inp = [...document.querySelectorAll('#off-host .qp-ans-in, #off-host .qp-multi-val')].find(i => (i.getAttribute('data-k') || '').endsWith(id) || (i.getAttribute('data-k') || '').indexOf(id) !== -1);
        if (!inp) { out[id] = 'no box'; continue; }
        inp.value = answers[id];
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        const card = inp.closest('.qcard'), btn = card && card.querySelector('[data-do="qp-check"]');
        if (!btn) { out[id] = 'no Check'; continue; }
        btn.click();
        await new Promise(r => setTimeout(r, 400));
        const latest = subLatest_(inp.getAttribute('data-k'));
        out[id] = latest ? latest.v : 'nothing recorded';
      }
      return out;
    }, answers);
    if (marks['Q-1CM-similar-shapes-1'] !== 'right') bad.push('offline, 16 on part 1 was marked ' + marks['Q-1CM-similar-shapes-1'] + ', not right');
    if (marks['Q-1CM-similar-shapes-3'] !== 'wrong') bad.push('offline, 4 on part 3 was marked ' + marks['Q-1CM-similar-shapes-3'] + ', not wrong');
    if (SHOTS) { await page.locator('#off-host .qcard').first().scrollIntoViewIfNeeded().catch(() => {}); await page.screenshot({ path: path.join(SHOTS, 'offline-3-marked.png') }); }

    /* 4. AN AI PART, OFFLINE: held, and its press queued. */
    await drawAll(page, AI_PAPER);
    const ai = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('#off-host [data-do="qp-ai"]')].find(b => !b.disabled);
      if (!btn) return { miss: 'no AI Check on the paper' };
      const card = btn.closest('.qcard'), inp = card.querySelector('.qp-multi-val, .qp-ans-in');
      inp.value = 'Because the author wants the reader to feel the tension.';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      btn.click();
      const out = card.querySelector('.qp-verdict');
      return { k: inp.getAttribute('data-k'), say: out ? out.textContent : '' };
    });
    if (ai.miss) bad.push('offline, ' + ai.miss);
    else if (!/when online/i.test(ai.say)) bad.push('offline, an AI part pressed said "' + ai.say + '", not "Will mark when online"');
    const waiting = await page.evaluate(() => ({ q: subQueue_('u:' + USER.personId).length, line: offSyncLine_() }));
    if (waiting.q < 3) bad.push('offline, ' + waiting.q + ' press(es) are queued — wanted the two Checks and the AI part');
    if (!/3 waiting to sync|4 waiting to sync/.test(waiting.line)) bad.push('offline, the sync line says "' + waiting.line + '"');
    if (SHOTS) { await page.evaluate(() => { const h = document.getElementById('off-host'); if (h) h.insertAdjacentHTML('afterbegin', offlinePages_().join('')); h.scrollIntoView(); }); await page.screenshot({ path: path.join(SHOTS, 'offline-4-waiting.png') }); }
    if (B.posts.length !== postsBefore) bad.push('offline, ' + (B.posts.length - postsBefore) + ' request(s) reached the backend');

    /* 5. BACK ONLINE: everything arrives, once each; the AI part is marked. */
    B.offline = false;
    await ctx.setOffline(false);
    /* THE AI PART'S CARD OPENED AGAIN, as the student comes back to it once the app has reconnected. */
    await page.waitForTimeout(2500);
    await drawAll(page, AI_PAPER);
    const synced = await page.waitForFunction(() => !subQueue_('u:' + USER.personId).length && !Object.keys(offRead_('ai')).length, null, { timeout: 30000 }).then(() => true, () => false);
    if (!synced) bad.push('online again, the queue never emptied: ' + (await page.evaluate(() => offSyncLine_())));
    await page.waitForTimeout(1500);
    /* A SECOND NUDGE sends nothing twice. */
    await page.evaluate(() => { dispatchEvent(new Event('online')); return subPush_(true); });
    await page.waitForTimeout(1000);
    const ids = Object.keys(B.seen), twice = ids.filter(id => B.seen[id] > 1);
    if (ids.length < 3) bad.push('online again, ' + ids.length + ' submission(s) arrived — wanted at least the three presses');
    if (twice.length) bad.push('online again, ' + twice.length + ' submission(s) arrived more than once: ' + twice.join(', '));
    if (B.ai !== 1) bad.push('online again, the AI part was asked to mark ' + B.ai + ' time(s), not once');
    const line = await page.evaluate(() => offSyncLine_());
    if (!/^Last synced/.test(line) || /waiting/.test(line)) bad.push('online again, the sync line says "' + line + '"');
    said.push(ids.length + ' submissions arrived once each, AI marked ' + B.ai + ', "' + line + '"');

    /* 6. SIGN-OUT FORGETS IT ALL. */
    const gone = await page.evaluate(async () => {
      signedOut_();
      await new Promise(r => setTimeout(r, 500));
      const kept = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^kept:.*offline/.test(k)) kept.push(k); }
      return { kept, cache: await caches.has('family-offline') };
    });
    if (gone.kept.length) bad.push('after sign-out the device still holds ' + gone.kept.join(', '));
    if (gone.cache) bad.push('after sign-out the worker\'s store is still there');
    if (errors.length) bad.push('page errors: ' + errors.slice(0, 3).join(' | '));
    await ctx.close();
  } catch (e) { if (e.message !== 'stop') bad.push('the run broke: ' + e.stack.split('\n').slice(0, 3).join(' ')); }
  finally { await browser.close(); server.close(); }
  if (process.env.VERBOSE || process.argv.includes('-v')) said.forEach(s => console.log('  ' + s));
  if (bad.length) { console.error('offline: ' + bad.length + ' finding(s)'); bad.forEach(b => console.error('  ! ' + b)); process.exit(1); }
  console.log('offline: a paper downloaded, opened and marked with no connection, synced once each — ' + said.join('; '));
}
main().catch(e => { console.error('offline: ' + e.stack); process.exit(2); });
